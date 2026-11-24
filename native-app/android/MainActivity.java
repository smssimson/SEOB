package com.sarch.fieldwork;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.graphics.Color;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Button;
import android.webkit.WebView;
import android.content.pm.ApplicationInfo;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private final Handler clock=new Handler(Looper.getMainLooper());
    private LinearLayout startup;
    private TextView status;
    private Button retry;
    private int ticks=0;
    private boolean ready=false,retried=false;
    @Override protected void onCreate(Bundle state){
        SarchUpdate.chooseStartup(this);
        registerPlugin(SarchUpdate.class);
        super.onCreate(state);
        if((getApplicationInfo().flags&ApplicationInfo.FLAG_DEBUGGABLE)!=0)WebView.setWebContentsDebuggingEnabled(true);
        if(getBridge()==null||getBridge().getWebView()==null)return;
        getBridge().getWebView().setBackgroundColor(Color.rgb(242,246,250));
        startup=new LinearLayout(this);
        startup.setOrientation(LinearLayout.VERTICAL);startup.setGravity(Gravity.CENTER);
        startup.setPadding(28,28,28,28);startup.setBackgroundColor(Color.rgb(242,246,250));
        TextView title=new TextView(this);title.setText("S:ARCH");title.setTextSize(30);title.setTextColor(Color.rgb(21,50,75));
        status=new TextView(this);status.setText("앱 화면을 준비하고 있습니다.");status.setTextColor(Color.rgb(21,50,75));status.setGravity(Gravity.CENTER);status.setTextSize(16);
        retry=new Button(this);retry.setText("기본 화면 다시 열기");retry.setVisibility(View.GONE);
        retry.setOnClickListener(v->recover());
        startup.addView(title);startup.addView(status);startup.addView(retry);
        addContentView(startup,new FrameLayout.LayoutParams(-1,-1));
        clock.postDelayed(this::probe,350);
    }
    private void probe(){
        if(ready||isFinishing()||isDestroyed()||getBridge()==null)return;
        ticks++;
        getBridge().getWebView().evaluateJavascript(
            "(function(){try{return document.readyState!=='loading'&&document.querySelectorAll('.module').length===4&&document.querySelector('.module').getBoundingClientRect().width>0}catch(e){return false}})()",
            value->{if("true".equals(value)&&!ready){ready=true;startup.setVisibility(View.GONE);android.util.Log.i("SARCH","HOME_READY");}}
        );
        if(ticks==24&&!retried){recover();return;}
        if(ticks>=24){
            status.setText("시작 화면을 불러오지 못했습니다.\n자료는 삭제하지 않았습니다.\n"+getBridge().getWebView().getUrl());
            retry.setVisibility(View.VISIBLE);return;
        }
        clock.postDelayed(this::probe,500);
    }
    private void recover(){
        retried=true;ticks=0;ready=false;
        startup.setVisibility(View.VISIBLE);retry.setVisibility(View.GONE);
        status.setText("설치된 기본 화면을 다시 열고 있습니다.");
        SarchUpdate.rejectTrial(this);
        getBridge().setServerAssetPath("public");
        // The actual home is embedded at both root and /SEOB/index.html.
        clock.removeCallbacksAndMessages(null);clock.postDelayed(this::probe,700);
    }
    @Override public void onDestroy(){clock.removeCallbacksAndMessages(null);super.onDestroy();}
}
