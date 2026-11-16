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
 note.textContent=(last?"최근 내보내기·공유 요청: "+last+" · ":"")+"작업자료는 현재 기기의 저장공간을 사용합니다. 앱 재실행 후 저장 상태를 확인하고 프로젝트 파일을 별도로 백업해 주세요.";
}
function downloadFile(file){
 const url=URL.createObjectURL(file),a=document.createElement("a");
 a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
/* v151: Both downloads and native Quick Share have a .json filename.
   Use text/plain only as the transport MIME when needed by Android; the data
   itself remains byte-identical JSON. Earlier .sarch.txt imports remain supported. */
let preparedShare=null;
function transferableFile(original){
 return new File([original],original.name,{type:"text/plain",lastModified:original.lastModified});
}
function sharingFile(original){
 const transport=transferableFile(original);
 const canFile=file=>{try{return navigator.canShare({files:[file]})===true}catch(e){return false}};
 if(canFile(transport))return transport;
 if(canFile(original))return original;
 return null;
}
function shareErrorText(err){
 const code=String(err&&err.name||"UnknownError");
 return ({
  NotAllowedError:"브라우저 권한 또는 공유 실행 제한",
  InvalidStateError:"이미 공유창이 열려 있거나 화면이 비활성 상태",
  TypeError:"브라우저에서 해당 파일 공유를 거부함",
  DataError:"기기의 공유 기능 실행 또는 파일 전송 오류"
 })[code]||code;
}
async function shareProject(btn){
 if(btn.disabled)return;
 const bridge=window.SARCHProjectBridge;
 if(typeof bridge!=="function"){show("프로젝트 파일을 준비할 수 없습니다. 기존 내보내기를 이용해 주세요.");return}
 btn.disabled=true;
 let needsSecondClick=false;
 try{
  let original=preparedShare&&preparedShare.original;
  if(!original){
   // First create a consistent snapshot. If this is slow, a second tap restores
   // Android's required user activation without rebuilding a large photo project.
   original=bridge("share");
   if(original&&typeof original.then==="function")throw Error("비동기 파일 생성은 지원되지 않습니다.");
   if(!original)return;
   if(!(original instanceof File)||!original.size)throw Error("프로젝트 파일을 생성하지 못했습니다.");
  }
  const transfer=preparedShare&&preparedShare.transfer||(
   typeof navigator.share==="function"&&typeof navigator.canShare==="function" ? sharingFile(original) : null
  );
  const nativeReady=!!transfer;
  if(!nativeReady){
   preparedShare=null;downloadFile(original);saveTime();noteUpdate();
   show("이 기기는 파일 공유를 지원하지 않아 JSON 다운로드를 요청했습니다. 저장된 파일을 Quick Share로 전송해 주세요.");
   return;
  }
  if(navigator.userActivation && !navigator.userActivation.isActive){
   preparedShare={original,transfer};
   needsSecondClick=true;
   show("공유 파일 준비 완료. '다시 눌러 공유'를 누르면 기기 공유 메뉴가 열립니다.");
   return;
  }
  try{
   await navigator.share({files:[transfer],title:"S:ARCH 현장 프로젝트"});
   preparedShare=null;saveTime();noteUpdate();
   show("공유 메뉴로 파일을 전달했습니다. Quick Share로 수신한 기기에서 '프로젝트 불러오기'를 선택해 새 현장으로 추가하세요.");
  }catch(err){
   preparedShare=null;
   if(err&&err.name==="AbortError"){show("공유가 취소되었거나 공유 대상을 찾지 못했습니다. 자료는 변경되지 않았습니다.");return}
   console.warn("S:ARCH native file share:",err);
   downloadFile(original);saveTime();noteUpdate();
   show("공유 메뉴 오류("+shareErrorText(err)+"). JSON 다운로드를 요청했습니다. 다운로드 목록에서 파일을 확인해 주세요.");
  }
 }catch(err){
  preparedShare=null;console.warn("S:ARCH project share:",err);
  show("프로젝트 공유 준비 실패: "+(err&&err.message||"내보내기를 이용해 주세요."));
 }finally{
  btn.disabled=false;
  btn.textContent=needsSecondClick?"↗ 다시 눌러 공유":"↗ 프로젝트 공유";
 }
}

function installShare(){
 const original=pick(EXPORT_IDS[moduleKey]);
 if(!original||document.getElementById("sarchShare142"))return;
 const btn=document.createElement("button");
 btn.type="button";btn.id="sarchShare142";btn.className="sarch-share-button";
 btn.textContent="↗ 프로젝트 공유";
 btn.title="Quick Share 등 기기 공유 메뉴로 .json 프로젝트 파일을 전송합니다. 받은 기기에서는 프로젝트 불러오기로 새 현장으로 추가합니다.";
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

function allowReceivedProjectFiles(){
 // Keep the original import handlers and their validation; just expose received
 // older Quick Share .sarch.txt files alongside current .json backups in the file picker.
 const selector=moduleKey==="drawing"?"#file":moduleKey==="tilt"?"#restore":"#import";
 const input=pick(selector);
 if(input&&input.type==="file")input.accept=".json,.txt,application/json,text/plain";
}
function installBackupVerifier(){
 const menu=pick("#sarchProtectMenu");
 if(!menu||document.getElementById("sarchVerify142"))return;
 const wrap=document.createElement("div");wrap.className="sarch-verify-box-142";
 const button=document.createElement("button");button.type="button";button.id="sarchVerify142";
 button.className="sarch-verify-button-142";button.textContent="백업 파일 검사";
 button.title="현재 프로젝트에 영향을 주지 않고 JSON 백업의 구조를 확인합니다.";
 const input=document.createElement("input");input.type="file";input.accept=".json,.txt,application/json,text/plain";input.hidden=true;
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


/* Keep original field-survey controls live. This module uses sm45 tabs rather
   than the sm43 toolbar used by the other three modules. */
function alignSurveyTools(){
 if(moduleKey!=="survey")return;
 const floor=document.getElementById("sarchFloor135"),tools=document.querySelector(".sm-survey-tools");
 if(!floor||!tools)return;
 tools.classList.add("sarch-top-tools-v142");
 if(floor.nextElementSibling!==tools)floor.insertAdjacentElement("afterend",tools);
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
 alignSurveyTools();connection();allowReceivedProjectFiles();installShare();installBackupVerifier();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>requestAnimationFrame(install),{once:true});
else requestAnimationFrame(install);
window.addEventListener("load",()=>{alignSurveyTools();connection();allowReceivedProjectFiles();installShare();installBackupVerifier()},{once:true});
})();
