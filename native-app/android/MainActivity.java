package com.sarch.fieldwork;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.ColorDrawable;
import android.widget.ImageView;
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
    private TextView tagline;
    private final int navy=Color.rgb(32,37,43);
    private int dp(float v){return (int)(v*getResources().getDisplayMetrics().density+0.5f);}
    private Button retry;
    private int ticks=0;
    private boolean ready=false,retried=false;
    @Override protected void onCreate(Bundle state){
        SarchUpdate.chooseStartup(this);
        registerPlugin(SarchUpdate.class);
        super.onCreate(state);
        getWindow().setBackgroundDrawable(new ColorDrawable(navy));
        getWindow().setStatusBarColor(navy);
        getWindow().setNavigationBarColor(navy);
        if((getApplicationInfo().flags&ApplicationInfo.FLAG_DEBUGGABLE)!=0)WebView.setWebContentsDebuggingEnabled(true);
        if(getBridge()==null||getBridge().getWebView()==null)return;
        getBridge().getWebView().setBackgroundColor(navy);
        startup=new LinearLayout(this);
        startup.setOrientation(LinearLayout.VERTICAL);startup.setGravity(Gravity.CENTER);
        startup.setPadding(dp(28),dp(28),dp(28),dp(28));
        GradientDrawable bg=new GradientDrawable(GradientDrawable.Orientation.TL_BR,
            new int[]{Color.rgb(27,80,110),Color.rgb(13,43,68),Color.rgb(6,24,40)});
        startup.setBackground(bg);
        ImageView logo=new ImageView(this);
        logo.setImageResource(R.mipmap.ic_launcher);
        logo.setScaleType(ImageView.ScaleType.FIT_CENTER);
        logo.setContentDescription("S:ARCH");
        startup.addView(logo,new LinearLayout.LayoutParams(dp(90),dp(90)));
        TextView title=new TextView(this);
        title.setText("S:ARCH");title.setTextSize(40);
        title.setTypeface(Typeface.DEFAULT,Typeface.BOLD);
        title.setLetterSpacing(.05f);title.setTextColor(Color.rgb(233,247,255));
        title.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams titleParams=new LinearLayout.LayoutParams(-1,-2);
        titleParams.topMargin=dp(17);
        startup.addView(title,titleParams);
        tagline=new TextView(this);
        tagline.setText("ARCHITECTURE · FIELD PLATFORM");
        tagline.setTextColor(Color.rgb(166,205,225));tagline.setTextSize(12);
        tagline.setLetterSpacing(.13f);tagline.setGravity(Gravity.CENTER);
        startup.addView(tagline);
        status=new TextView(this);
        status.setTextColor(Color.rgb(233,247,255));status.setGravity(Gravity.CENTER);status.setTextSize(15);
        status.setVisibility(View.GONE);
        retry=new Button(this);retry.setText("기본 화면 다시 열기");retry.setVisibility(View.GONE);
        retry.setOnClickListener(v->recover());
        startup.addView(status);startup.addView(retry);
        addContentView(startup,new FrameLayout.LayoutParams(-1,-1));
        clock.postDelayed(this::probe,350);
    }
    private void probe(){
        if(ready||isFinishing()||isDestroyed()||getBridge()==null)return;
        ticks++;
        getBridge().getWebView().evaluateJavascript(
            "(function(){try{return document.readyState!=='loading'&&document.querySelectorAll('.module').length===4&&document.querySelector('.module').getBoundingClientRect().width>0}catch(e){return false}})()",
            value->{if("true".equals(value)&&!ready){ready=true;startup.setVisibility(View.GONE);getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);android.util.Log.i("SARCH","HOME_READY");}}
        );
        if(ticks==24&&!retried){recover();return;}
        if(ticks>=24){
            status.setVisibility(View.VISIBLE);
            status.setText("시작 화면을 불러오지 못했습니다.\n자료는 삭제하지 않았습니다.\n"+getBridge().getWebView().getUrl());
            retry.setVisibility(View.VISIBLE);return;
        }
        clock.postDelayed(this::probe,500);
    }
    private void recover(){
        retried=true;ticks=0;ready=false;
        startup.setVisibility(View.VISIBLE);retry.setVisibility(View.GONE);
        status.setVisibility(View.GONE);
        SarchUpdate.rejectTrial(this);
        getBridge().setServerAssetPath("public");
        // The actual home is embedded at both root and /SEOB/index.html.
        clock.removeCallbacksAndMessages(null);clock.postDelayed(this::probe,700);
    }
    @Override public void onDestroy(){clock.removeCallbacksAndMessages(null);super.onDestroy();}
}
