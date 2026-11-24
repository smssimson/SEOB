package com.sarch.fieldwork;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.*;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import javax.net.ssl.HttpsURLConnection;
import org.json.JSONObject;

/** Only updates bundled web assets. Never accesses project databases or photo storage. */
@CapacitorPlugin(name="SarchUpdate")
public class SarchUpdate extends Plugin {
    static final String FEED="https://smssimson.github.io/SEOB/native-update/";
    static final String PREF="sarch_native_update_v1";
    static final long MAX_ZIP=150L*1024*1024, MAX_EXPANDED=350L*1024*1024;
    private static final AtomicBoolean busy=new AtomicBoolean(false);
    static SharedPreferences state(Context c){return c.getSharedPreferences(PREF,Context.MODE_PRIVATE);}
    static SharedPreferences web(Context c){return c.getSharedPreferences("CapWebViewSettings",Context.MODE_PRIVATE);}
    static File folder(Context c){return new File(c.getFilesDir(),"sarch_web_updates");}
    static boolean valid(Context c,String path){
        try {
            if(path==null||path.isEmpty())return false;
            File f=new File(path).getCanonicalFile();
            if(!f.getPath().startsWith(folder(c).getCanonicalPath()+File.separator))return false;
            return new File(f,"index.html").isFile()&&new File(f,"SEOB/version.json").isFile()&&new File(f,"native-bridge.js").isFile();
        }catch(Exception e){return false;}
    }
    static int version(File f)throws Exception {
        try(InputStream in=new FileInputStream(new File(f,"SEOB/version.json"))){
            return new JSONObject(readText(in,65536)).getInt("version");
        }
    }
    static int bundledVersion(Context c){
        try(InputStream in=c.getAssets().open("public/SEOB/version.json")){
            return new JSONObject(readText(in,65536)).getInt("version");
        }catch(Exception e){return 225;}
    }
    static void chooseStartup(Context c){
        SharedPreferences p=state(c);String confirmed=p.getString("confirmed","");
        String trial=p.getString("trial","");
        if(!trial.isEmpty()){
            // A previous trial failed to confirm the home screen. Roll back.
            p.edit().putInt("rejected",p.getInt("trialVersion",0)).remove("trial").remove("trialVersion").commit();
        }
        String pending=p.getString("pending","");
        if(trial.isEmpty()&&valid(c,pending)){
            try{
                int v=version(new File(pending));
                if(v>bundledVersion(c)&&v>p.getInt("rejected",0)){
                    p.edit().putString("trial",pending).putInt("trialVersion",v).remove("pending").commit();
                    web(c).edit().putString("serverBasePath",pending).commit();return;
                }
            }catch(Exception ignored){}
        }
        p.edit().remove("pending").commit();
        try{
            if(valid(c,confirmed)&&version(new File(confirmed))>bundledVersion(c)){
                web(c).edit().putString("serverBasePath",confirmed).commit();return;
            }
        }catch(Exception ignored){}
        web(c).edit().remove("serverBasePath").commit();
    }
    static void rejectTrial(Context c){
        SharedPreferences p=state(c);
        int v=p.getInt("trialVersion",0);
        p.edit().putInt("rejected",v).remove("trial").remove("trialVersion").remove("pending").commit();
        web(c).edit().remove("serverBasePath").commit();
    }
    private static String readText(InputStream in,int max)throws IOException{
        ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] b=new byte[4096];int n;
        while((n=in.read(b))!=-1){if(out.size()+n>max)throw new IOException("response too large");out.write(b,0,n);}
        return out.toString("UTF-8");
    }
    private static HttpsURLConnection connect(String name)throws IOException{
        HttpsURLConnection c=(HttpsURLConnection)new URL(FEED+name).openConnection();
        c.setConnectTimeout(12000);c.setReadTimeout(25000);c.setInstanceFollowRedirects(false);
        c.setRequestProperty("Cache-Control","no-cache");
        if(c.getResponseCode()!=200){int code=c.getResponseCode();c.disconnect();throw new IOException("HTTP "+code);}
        return c;
    }
    private static void erase(File f){if(f==null)return;File[] a=f.listFiles();if(a!=null)for(File x:a)erase(x);f.delete();}
    private static String hex(byte[] b){StringBuilder s=new StringBuilder();for(byte x:b)s.append(String.format(Locale.ROOT,"%02x",x&255));return s.toString();}
    private static void require(File root,String path)throws IOException{
        File f=new File(root,path);if(!f.isFile()||f.length()==0)throw new IOException("missing "+path);
    }
    @PluginMethod public void ready(PluginCall call){
        int version=call.getInt("version",0);Context c=getContext();SharedPreferences p=state(c);
        String trial=p.getString("trial","");
        if(valid(c,trial)&&version==p.getInt("trialVersion",-1)){
            p.edit().putString("confirmed",trial).remove("trial").remove("trialVersion").commit();
        }
        call.resolve();
    }
    @PluginMethod public void check(PluginCall call){
        final int current=call.getInt("version",0);
        if(!busy.compareAndSet(false,true)){call.resolve(new JSObject().put("status","busy"));return;}
        // The worker is not tied to the UI; no auto reload or forced activity restart.
        Thread t=new Thread(()->{
            File zip=null,tmp=null;
            try{
                Context c=getContext();SharedPreferences p=state(c);
                HttpsURLConnection conn=connect("manifest.json");JSONObject m;
                try(InputStream in=conn.getInputStream()){m=new JSONObject(readText(in,65536));}finally{conn.disconnect();}
                int v=m.getInt("version");
                if(m.getInt("protocol")!=1)throw new IOException("unsupported update protocol");
                int baseline=Math.max(current,bundledVersion(c));
                String pending=p.getString("pending","");
                if(valid(c,pending))baseline=Math.max(baseline,version(new File(pending)));
                if(v<=baseline||v<=p.getInt("rejected",0)){call.resolve(new JSObject().put("status","current"));return;}
                String name=m.getString("file"),hash=m.getString("sha256");long size=m.getLong("size");
                if(!name.equals("web-v"+v+".zip")||!hash.matches("[0-9a-fA-F]{64}")||size<=0||size>MAX_ZIP)throw new IOException("invalid update manifest");
                File dir=folder(c);if(!dir.isDirectory()&&!dir.mkdirs())throw new IOException("update directory");
                zip=new File(dir,"download-"+v+".zip");tmp=new File(dir,"staging-"+v);erase(tmp);
                if(!tmp.mkdirs())throw new IOException("staging directory");
                MessageDigest digest=MessageDigest.getInstance("SHA-256");long total=0;
                conn=connect(name);
                try(InputStream in=conn.getInputStream();OutputStream out=new FileOutputStream(zip)){
                    byte[] b=new byte[65536];int n;while((n=in.read(b))!=-1){total+=n;if(total>size)throw new IOException("oversize update");digest.update(b,0,n);out.write(b,0,n);}
                }finally{conn.disconnect();}
                if(total!=size||!hex(digest.digest()).equalsIgnoreCase(hash))throw new IOException("update checksum mismatch");
                long expanded=0;int entries=0;String prefix=tmp.getCanonicalPath()+File.separator;
                try(ZipInputStream in=new ZipInputStream(new BufferedInputStream(new FileInputStream(zip)))){
                    ZipEntry e;byte[] b=new byte[65536];
                    while((e=in.getNextEntry())!=null){
                        if(++entries>15000)throw new IOException("too many entries");
                        String path=e.getName();
                        if(path.startsWith("/")||path.indexOf('\\')>=0||!(path.equals("index.html")||path.equals("native-error.html")||path.startsWith("SEOB/")))throw new IOException("invalid asset path");
                        File f=new File(tmp,path).getCanonicalFile();
                        if(!f.getPath().startsWith(prefix))throw new IOException("invalid zip path");
                        if(e.isDirectory()){f.mkdirs();continue;}
                        if(f.exists())throw new IOException("duplicate asset");
                        File parent=f.getParentFile();if(!parent.isDirectory()&&!parent.mkdirs())throw new IOException("asset folder");
                        try(OutputStream out=new FileOutputStream(f)){int n;while((n=in.read(b))!=-1){expanded+=n;if(expanded>MAX_EXPANDED)throw new IOException("expanded update too large");out.write(b,0,n);}}
                        in.closeEntry();
                    }
                }
                for(String file:new String[]{"index.html","native-error.html","SEOB/index.html","SEOB/version.json","SEOB/survey/index.html","SEOB/drawing/index.html","SEOB/schmidt/index.html","SEOB/tilt/index.html"})require(tmp,file);
                if(version(tmp)!=v)throw new IOException("web version mismatch");
                // Native bridge code stays tied to installed APK, not downloaded JS.
                try(InputStream in=c.getAssets().open("public/native-bridge.js");OutputStream out=new FileOutputStream(new File(tmp,"native-bridge.js"))){
                    byte[] b=new byte[16384];int n;while((n=in.read(b))!=-1)out.write(b,0,n);
                }
                File dest=new File(dir,"web-"+v);
                if(dest.exists()){
                    String active=p.getString("confirmed","");String trial=p.getString("trial","");
                    if(dest.getPath().equals(active)||dest.getPath().equals(trial))throw new IOException("active update exists");
                    erase(dest);
                }
                if(!tmp.renameTo(dest))throw new IOException("cannot finalize update");
                tmp=null;
                p.edit().putString("pending",dest.getPath()).commit();
                call.resolve(new JSObject().put("status","staged").put("version",v));
            }catch(Exception e){
                android.util.Log.w("SARCH","Web update deferred",e);
                call.resolve(new JSObject().put("status","unavailable"));
            }finally{erase(zip);erase(tmp);busy.set(false);}
        },"SarchWebUpdate");t.start();
    }
}
