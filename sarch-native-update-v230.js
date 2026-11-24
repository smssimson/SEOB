/* S:ARCH Android home update control. Uses the installed native updater, never clears project data. */
(()=>{
"use strict";
function init(){
 const cap=window.Capacitor;
 if(!cap?.isNativePlatform?.()||document.documentElement.dataset.module!=="home")return;
 const btn=document.getElementById("sarchManualUpdate"),plugin=cap.Plugins?.SarchUpdate;
 if(!btn||!plugin)return;
 const key="sarch-native-staged-version";
 let running=false,lastCheck=0,current=0,timer=0;
 function getStaged(){try{return Number(localStorage.getItem(key)||0)}catch(_){return 0}}
 function saveStaged(v){try{if(v>0)localStorage.setItem(key,String(v));else localStorage.removeItem(key)}catch(_){}}
 function show(message,ms=5000){
  let el=document.getElementById("sarchUpdateStatus");
  if(!el){el=document.createElement("div");el.id="sarchUpdateStatus";el.setAttribute("role","status");el.setAttribute("aria-live","polite");document.body.append(el)}
  el.textContent=message;clearTimeout(timer);timer=setTimeout(()=>el.remove(),ms);
 }
 function home(){return document.documentElement.dataset.module==="home"&&document.querySelectorAll(".module").length===4&&!document.hidden}
 btn.textContent="↻ 수동 업데이트";btn.title="새 버전을 확인하고 안전하게 다운로드합니다";
 async function run(manual=false){
  if(!home())return;
  if(running){if(manual)show("업데이트 확인 중입니다.");return}
  if(!navigator.onLine){if(manual)show("인터넷 연결을 확인해 주세요.");return}
  if(!manual&&Date.now()-lastCheck<60000)return;
  running=true;lastCheck=Date.now();btn.disabled=true;
  if(manual)show("최신 버전 확인 중…",15000);
  try{
   const r=await fetch("/SEOB/version.json",{cache:"no-store"});
   if(!r.ok)throw Error("현재 버전 확인 실패");
   current=Number((await r.json()).version);
   if(!Number.isInteger(current)||current<=0)throw Error("잘못된 버전");
   await plugin.ready({version:current});
   if(getStaged()&&getStaged()<=current)saveStaged(0);
   let result=await plugin.check({version:current});
   if(result?.status==="busy"&&manual){
    await new Promise(resolve=>setTimeout(resolve,1500));
    result=await plugin.check({version:current});
   }
   if(result?.status==="staged"&&Number(result.version)>current){
    saveStaged(Number(result.version));
    show("새 버전 다운로드 완료 · 앱을 완전히 종료한 뒤 다시 열면 적용됩니다.",7000);
   }else if(result?.status==="current"){
    if(manual)show(getStaged()>current?"다운로드 완료 · 앱을 완전히 종료한 뒤 다시 열어 주세요.":"새로 받을 업데이트가 없습니다. 이미 받은 업데이트는 앱을 다시 열 때 적용됩니다.",7000);
   }else if(result?.status==="busy"){
    if(manual)show("자동 업데이트를 확인 중입니다.");
   }else if(manual)show("업데이트 확인 실패 · 인터넷 연결 후 다시 시도해 주세요.");
  }catch(e){if(manual)show("업데이트 확인 실패 · 다시 시도해 주세요.");console.warn("SARCH update",e)}
  finally{running=false;btn.disabled=false}
 }
 btn.addEventListener("click",()=>run(true));
 window.addEventListener("online",()=>{lastCheck=0;run(false)});
 window.addEventListener("pageshow",()=>run(false));
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)run(false)});
 setInterval(()=>run(false),60000);
 // Allow the installed bridge's initial check to start first; avoid duplicate notices.
 setTimeout(()=>run(false),2200);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();