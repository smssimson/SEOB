/* S:ARCH v142 shared workspace: native project file sharing + consistent UI.
   Never uploads data or accesses another user's storage. Existing import/save behavior unchanged. */
(function(){
"use strict";
const match=location.pathname.match(/\/(survey|drawing|schmidt|tilt)(?:\/|$)/);
if(!match)return;
const moduleKey=match[1];
const EXPORT_IDS={survey:"#export",drawing:'button[onclick="saveJSON()"]',schmidt:"#export",tilt:"#backup"};
const OUTPUT_IDS={survey:"#export",drawing:'button[onclick="saveJSON()"]',schmidt:"#export",tilt:"#backup"};
const storageKey="sarch-v142-last-export-"+moduleKey;
let toastTimer=0;
function pick(s){return document.querySelector(s)}
function show(msg){
 let el=document.getElementById("sarchToast142");
 if(!el){el=document.createElement("div");el.id="sarchToast142";el.setAttribute("role","status");el.setAttribute("aria-live","polite");document.body.appendChild(el)}
 el.textContent=msg;el.classList.add("show");
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),4500);
}
function saveTime(){try{localStorage.setItem(storageKey,String(Date.now()))}catch(e){}}
function formatTime(){
 try{const t=Number(localStorage.getItem(storageKey));if(!t)return null;
 return new Date(t).toLocaleString("ko-KR",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch(e){return null}
}
function noteUpdate(){
 const note=pick("#sarchBackup142");if(!note)return;
 const last=formatTime();
 note.textContent=(last?"마지막 내보내기·공유: "+last+" · ":"")+"현장자료는 기기 안에 자동 저장됩니다. 별도로 프로젝트 파일을 공유하거나 안전한 곳에 백업해 주세요.";
}
function downloadFile(file){
 const url=URL.createObjectURL(file),a=document.createElement("a");
 a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
async function shareProject(btn){
 if(btn.disabled)return;
 const bridge=window.SARCHProjectBridge;
 if(typeof bridge!=="function"){show("이 프로그램에서 프로젝트 파일을 준비할 수 없습니다. 기존 내보내기를 이용해 주세요.");return}
 btn.disabled=true;const prior=btn.textContent;btn.textContent="공유 준비 중";
 try{
  const file=await bridge();
  if(!file){return}
  if(!(file instanceof File)||!file.size)throw Error("프로젝트 파일 생성에 실패했습니다.");
  const data={files:[file],title:"S:ARCH 프로젝트 공유"};
  // Use system-native share sheet only if file sharing is supported.
  if(typeof navigator.share==="function"&&typeof navigator.canShare==="function"&&navigator.canShare({files:[file]})){
   try{await navigator.share(data);saveTime();noteUpdate();show("프로젝트 공유가 완료되었습니다.");}
   catch(err){if(err&&err.name==="AbortError")return;downloadFile(file);saveTime();noteUpdate();show("공유가 지원되지 않아 프로젝트 파일로 저장했습니다.");}
  }else{
   downloadFile(file);saveTime();noteUpdate();
   show("프로젝트 파일을 저장했습니다. 파일 앱에서 MYBOX·카카오톡 등으로 전달하세요.");
  }
 }catch(err){console.warn("S:ARCH share error",err);show("프로젝트 공유 실패 · 기존 프로젝트 내보내기를 이용해 주세요.");}
 finally{btn.disabled=false;btn.textContent=prior}
}
function installShare(){
 const original=pick(EXPORT_IDS[moduleKey]);
 if(!original||document.getElementById("sarchShare142"))return;
 const btn=document.createElement("button");
 btn.type="button";btn.id="sarchShare142";btn.className="sarch-share-button";
 btn.textContent="↗ 프로젝트 공유";
 btn.title="현재 프로젝트 JSON을 갤럭시 공유 메뉴로 보내거나 파일로 저장합니다.";
 btn.addEventListener("click",()=>shareProject(btn));
 original.insertAdjacentElement("afterend",btn);
 const section=original.closest("section,aside,.smetric-output")||original.parentElement?.parentElement;
 if(section){
  const note=document.createElement("p");note.id="sarchBackup142";note.className="sarch-backup-note";
  const nearby=original.closest(".row,.tools,.smetric-output-buttons")||original.parentElement;
  if(nearby&&nearby.parentNode===section)nearby.insertAdjacentElement("afterend",note);
  else section.appendChild(note);
  noteUpdate();
 }
 // Existing export button remains the source of truth and is not intercepted.
 original.addEventListener("click",()=>{saveTime();setTimeout(noteUpdate,100)},{passive:true});
}
function connection(){
 const head=pick(".smetric-head-controls,.sm-topbar .right");
 if(!head||document.getElementById("sarchConnection142"))return;
 const el=document.createElement("span");el.id="sarchConnection142";
 const update=()=>{
  const online=navigator.onLine!==false;
  el.classList.toggle("offline",!online);
  el.textContent=online?"기기 저장":"오프라인 · 기기 저장";
  el.title="프로젝트는 이 기기에 저장됩니다. 네트워크 연결과 관계없이 외부 백업을 권장합니다.";
 };
 head.appendChild(el);update();
 window.addEventListener("online",update);window.addEventListener("offline",update);
}
function updateTheme(){
 const b=document.body;
 const current=(b.dataset.theme||"").toLowerCase();
 // Theme selection is controlled by each original module. Only tune palette tokens.
 b.classList.toggle("sarch-light-142",["light","paper","mint","sand"].includes(current));
}
function install(){
 if(document.body.classList.contains("sarch-v142"))return;
 document.body.classList.add("sarch-v142");
 updateTheme();
 // Existing theme pickers may change body attributes as the user works.
 new MutationObserver(updateTheme).observe(document.body,{attributes:true,attributeFilter:["data-theme"]});
 connection();installShare();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>requestAnimationFrame(install),{once:true});
else requestAnimationFrame(install);
window.addEventListener("load",()=>{connection();installShare()},{once:true});
})();
