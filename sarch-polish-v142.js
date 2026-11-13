/* S:ARCH v142 · account-free project file sharing + non-destructive backup validation.
   The existing export/import handlers remain authoritative and unchanged. */
(function(){
"use strict";
const moduleName=(location.pathname.match(/\/(survey|drawing|schmidt|tilt)(?:\/|$)/)||[])[1];
if(!moduleName)return;
let toastTimer=0;
function toast(message){
 let el=document.getElementById("sarchToast142");
 if(!el){el=document.createElement("div");el.id="sarchToast142";el.setAttribute("role","status");document.body.appendChild(el)}
 el.hidden=false;el.textContent=message;
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true},4400);
}
function fallbackDownload(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function shareButton(){
 const exporter=moduleName==="drawing"
  ?Array.from(document.querySelectorAll("button")).find(b=>b.getAttribute("onclick")==="saveJSON()")
  :document.getElementById(moduleName==="tilt"?"backup":"export");
 if(!exporter||typeof window.SARCHShareSource142!=="function")return;
 if(document.getElementById("sarchShare142"))return;
 const button=document.createElement("button");button.type="button";button.id="sarchShare142";
 button.className="sarch-share-btn-v142";button.textContent="프로젝트 공유";
 button.title="현재 프로젝트 JSON을 카카오톡·퀵쉐어·MYBOX 등 기기 공유 메뉴로 전달합니다. 지원되지 않으면 파일을 내려받습니다.";
 exporter.insertAdjacentElement("afterend",button);
 button.addEventListener("click",async()=>{
  if(button.disabled)return;
  try{
   // Create the Blob during the click. navigator.share must be invoked in the
   // same user-activation chain; no fetch, promise or timer before sharing.
   const payload=window.SARCHShareSource142();
   if(!payload)return; // The module's existing unfinished-measurement guard rejected the action.
   const {blob,name}=payload;
   if(!(blob instanceof Blob)||typeof name!=="string"||!name.endsWith(".json"))throw Error("공유할 파일을 준비하지 못했습니다.");
   const file=new File([blob],name,{type:"application/json"});
   if(typeof navigator.share==="function"&&typeof navigator.canShare==="function"&&navigator.canShare({files:[file]})){
    button.disabled=true;
    try{await navigator.share({title:"S:ARCH 프로젝트",files:[file]});toast("공유 메뉴로 프로젝트 파일을 전달했습니다. 수신 여부는 공유 앱에서 확인해 주세요.");}
    catch(e){
     if(e&&e.name==="AbortError")return;
     fallbackDownload(blob,name);toast("기기 공유가 완료되지 않아 프로젝트 파일을 다운로드했습니다.");
    }finally{button.disabled=false}
   }else{
    fallbackDownload(blob,name);toast("파일 공유를 지원하지 않아 프로젝트 JSON을 다운로드했습니다. 파일을 원하는 앱으로 전달해 주세요.");
   }
  }catch(e){button.disabled=false;toast("프로젝트 공유 실패 · 기존 자료는 변경되지 않았습니다. "+(e?.message||""))}
 });
}
function verifyBackup(){
 const menu=document.getElementById("sarchProtectMenu");if(!menu||document.getElementById("sarchVerify142"))return;
 const wrap=document.createElement("div");wrap.className="sarch-verify-wrap";
 const btn=document.createElement("button");btn.id="sarchVerify142";btn.type="button";btn.className="sarch-verify-btn";btn.textContent="백업 파일 검사";
 const input=document.createElement("input");input.type="file";input.accept=".json,application/json";input.hidden=true;
 const result=document.createElement("div");result.className="sarch-verify-status";result.setAttribute("role","status");
 result.textContent="기존 자료를 변경하지 않고 백업 JSON의 기본 형식을 검사합니다.";
 btn.addEventListener("click",()=>input.click());
 input.addEventListener("change",async()=>{
  const file=input.files?.[0];if(!file)return;
  result.textContent="파일 형식을 확인하는 중…";
  try{
   if(file.size>120*1024*1024)throw Error("파일이 120MB를 초과해 자동 검사를 건너뜁니다. 원본 파일은 보존됩니다.");
   const data=JSON.parse(await file.text());let count=0,valid=false,kind="";
   if(moduleName==="survey"){
    valid=Array.isArray(data.defects)&&typeof data.nextId==="number";
    count=valid?data.defects.length:0;kind="결함";
   }else if(moduleName==="schmidt"){
    valid=!!data.site&&Array.isArray(data.site.pages)&&Array.isArray(data.site.marks);
    count=valid?data.site.marks.length:0;kind="조사";
   }else if(moduleName==="drawing"){
    valid=Array.isArray(data.sheets)&&data.sheets.length>0&&(Array.isArray(data.paths)||Array.isArray(data.sheets[0]?.paths));
    if(!valid)valid=Array.isArray(data.paths)||Array.isArray(data.pts);
    count=valid?(data.sheets?.length||1):0;kind="도면";
   }else if(moduleName==="tilt"){
    valid=Array.isArray(data.sites)&&data.sites.length>0;
    count=valid?data.sites.length:0;kind="현장";
   }
   if(!valid)throw Error("이 프로그램에서 사용하는 프로젝트 형식과 다릅니다.");
   result.textContent="✓ 파일 형식 확인 · "+kind+" "+count+"건\n"+file.name+"\n검사는 읽기 전용이며 복구를 실행하지 않았습니다.";
  }catch(e){result.textContent="확인 불가 · "+(e?.message||"손상되었거나 지원되지 않는 JSON 파일입니다.")+"\n기존 작업은 유지됩니다."}
  finally{input.value=""}
 });
 wrap.append(btn,input,result);menu.append(wrap);
}
function setup(){
 document.body.classList.add("sarch-polish-v142");
 shareButton();
 verifyBackup();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})();
