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
  // Preserve the user activation required by Android's native file share sheet.
  const file=bridge();
  if(file&&typeof file.then==="function")throw Error("비동기 파일 생성은 직접 공유를 지원하지 않습니다.");
  if(!file){return}
  if(!(file instanceof File)||!file.size)throw Error("프로젝트 파일 생성에 실패했습니다.");
  const data={files:[file],title:"S:ARCH 프로젝트 공유"};
  // Use system-native share sheet only if file sharing is supported.
  if(typeof navigator.share==="function"&&typeof navigator.canShare==="function"&&navigator.canShare({files:[file]})){
   try{await navigator.share(data);saveTime();noteUpdate();show("기기 공유 메뉴로 전달했습니다. 상대방의 수신·업로드 완료 여부는 별도로 확인해 주세요.");}
   catch(err){if(err&&err.name==="AbortError")return;downloadFile(file);saveTime();noteUpdate();show("공유 메뉴를 사용할 수 없어 파일 저장을 요청했습니다. 다운로드 목록에서 파일을 확인해 주세요.");}
  }else{
   downloadFile(file);saveTime();noteUpdate();
   show("프로젝트 파일 다운로드를 요청했습니다. 파일 저장 여부를 확인한 뒤 전달해 주세요.");
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
 // Original export handlers explicitly notify success; cancelled exports never count as backups.
}

function installBackupVerifier(){
 const menu=pick("#sarchProtectMenu");
 if(!menu||document.getElementById("sarchVerify142"))return;
 const wrap=document.createElement("div");wrap.className="sarch-verify-box-142";
 const button=document.createElement("button");button.type="button";button.id="sarchVerify142";
 button.className="sarch-verify-button-142";button.textContent="백업 파일 검사";
 button.title="현재 프로젝트에 영향을 주지 않고 JSON 백업의 구조를 확인합니다.";
 const input=document.createElement("input");input.type="file";input.accept=".json,application/json";input.hidden=true;
 const result=document.createElement("span");result.className="sarch-verify-result-142";
 result.setAttribute("role","status");result.textContent="선택한 파일을 읽기 전용으로 검사합니다.";
 button.addEventListener("click",()=>input.click());
 input.addEventListener("change",async()=>{
  const file=input.files?.[0];if(!file)return;
  result.textContent="백업 파일을 검사하는 중입니다…";
  try{
   if(file.size>120*1024*1024)throw Error("120MB보다 큰 파일은 자동 검사를 건너뜁니다.");
   const data=JSON.parse(await file.text());
   let valid=false,summary="";
   if(moduleKey==="survey"){
    valid=Array.isArray(data.defects)&&typeof data.nextId==="number";
    if(valid)summary="결함 "+data.defects.length+"건";
   }else if(moduleKey==="schmidt"){
    valid=!!data.site&&Array.isArray(data.site.pages)&&Array.isArray(data.site.marks);
    if(valid)summary="장비조사 "+data.site.marks.length+"건";
   }else if(moduleKey==="drawing"){
    valid=Array.isArray(data.sheets)&&data.sheets.length>0&&(Array.isArray(data.paths)||Array.isArray(data.sheets[0]?.paths));
    if(!valid)valid=Array.isArray(data.paths)||Array.isArray(data.pts);
    if(valid)summary="도면 "+(data.sheets?.length||1)+"개";
   }else if(moduleKey==="tilt"){
    valid=Array.isArray(data.sites)&&data.sites.length>0;
    if(valid)summary="현장 "+data.sites.length+"개";
   }
   if(!valid)throw Error("현재 프로그램의 프로젝트 내보내기 형식과 다릅니다.");
   result.textContent="✓ 백업 구조 확인 · "+summary+"\n"+file.name+"\n기존 작업은 변경하지 않았습니다.";
  }catch(e){result.textContent="확인 실패 · "+(e?.message||"지원되지 않는 파일입니다.")+"\n현재 작업 자료는 유지됩니다."}
  finally{input.value=""}
 });
 wrap.append(button,input,result);menu.appendChild(wrap);
}

function connection(){
 const head=pick(".smetric-head-controls,.sm-topbar .right");
 if(!head||document.getElementById("sarchConnection142"))return;
 const el=document.createElement("span");el.id="sarchConnection142";
 const update=()=>{
  const online=navigator.onLine!==false;
  el.classList.toggle("offline",!online);
  el.textContent=online?"로컬 작업":"오프라인 · 로컬 작업";
  el.title="연결 상태 안내입니다. 실제 저장 성공을 보장하지 않으며, 별도 프로젝트 백업을 권장합니다.";
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
 window.SARCHBackupMark=()=>{saveTime();noteUpdate()};
 connection();installShare();installBackupVerifier();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>requestAnimationFrame(install),{once:true});
else requestAnimationFrame(install);
window.addEventListener("load",()=>{connection();installShare();installBackupVerifier()},{once:true});
})();
