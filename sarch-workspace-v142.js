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
/* v153: Android Chromium permits text/plain + .txt, but does NOT allow
   files ending .json through navigator.share. Never attempt .json native sharing.
   Persistent backups/downloads stay .json. Shared .sarch.txt has identical JSON
   bytes and the receiving S:ARCH importer recognizes both extensions. */
let preparedShare=null;
const INBOX_CACHE="sarch-share-inbox-v1";
const CHROME_ANDROID_MAX_SHARE_BYTES=50*1024*1024;
function transferableFile(original){
 const name=String(original.name||"SARCH_프로젝트.json").replace(/\.json$/i,"")+".sarch.txt";
 return new File([original],name,{type:"text/plain",lastModified:original.lastModified});
}
function sharingFile(original){
 if(typeof navigator.share!=="function"||typeof navigator.canShare!=="function")return null;
 const transfer=transferableFile(original);
 try{
  if(navigator.canShare({files:[transfer]})===true)return transfer;
 }catch(err){console.warn("S:ARCH file capability check:",err)}
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
  const previous=preparedShare;
  let original=previous&&previous.original;
  if(!original){
   // First create a consistent snapshot. If this is slow, a second tap restores
   // Android's required user activation without rebuilding a large photo project.
   original=bridge("share");
   if(original&&typeof original.then==="function")throw Error("비동기 파일 생성은 지원되지 않습니다.");
   if(!original)return;
   if(!(original instanceof File)||!original.size)throw Error("프로젝트 파일을 생성하지 못했습니다.");
  }
  // Chromium Android rejects the .json extension even when canShare appears
  // permissive; use only a valid .txt transport for the system share sheet.
  if(/Android/i.test(navigator.userAgent||"")&&original.size>=CHROME_ANDROID_MAX_SHARE_BYTES){
   preparedShare=null;
   downloadFile(original);saveTime();noteUpdate();
   show("현장 파일이 50MB 이상이어서 Android 기본 공유가 제한될 수 있습니다. JSON 다운로드를 요청했습니다. 내 파일 앱에서 Quick Share를 사용해 주세요.");
   return;
  }
  const transfer=previous&&previous.transfer||sharingFile(original);
  const nativeReady=!!transfer;
  if(!nativeReady){
   preparedShare=null;downloadFile(original);saveTime();noteUpdate();
   show("이 기기는 파일 공유를 지원하지 않아 JSON 다운로드를 요청했습니다. 저장된 파일을 Quick Share로 전송해 주세요.");
   return;
  }
  if(navigator.userActivation && !navigator.userActivation.isActive){
   preparedShare={original,transfer,retried:previous&&previous.retried||false};
   needsSecondClick=true;
   show("공유 파일 준비 완료. '다시 눌러 공유'를 누르면 기기 공유 메뉴가 열립니다.");
   return;
  }
  try{
   // Send ONLY the attached file. On some Samsung sharing surfaces, a
   // title/text payload produces a blank text preview with Copy/Share buttons
   // instead of the intended file-target chooser.
   await navigator.share({files:[transfer]});
   preparedShare=null;saveTime();noteUpdate();
   show("공유 파일을 전달했습니다. 받는 기기에서는 파일을 S:ARCH로 공유하거나 프로젝트 불러오기로 새 현장에 추가하세요.");
  }catch(err){
   if(err&&err.name==="AbortError"){
    preparedShare=null;
    show("공유가 취소되었거나 사용 가능한 공유 대상이 없습니다. 현장 데이터는 유지됩니다.");
    return;
   }
   console.warn("S:ARCH native file share:",err);
   // Some Android browsers reject a valid file when the user activation expires.
   // Keep the already-created file and allow one fresh user gesture to retry.
   if(!(previous&&previous.retried)){
    // Retry only the verified .txt MIME/extension pair: .json cannot be
    // passed directly to Chromium's Web Share file API.
    preparedShare={original,transfer,retried:true};
    needsSecondClick=true;
    show("공유 메뉴 열기 실패("+shareErrorText(err)+"). 파일 준비는 완료되었습니다. '다시 눌러 공유'로 한 번 더 시도해 주세요.");
    return;
   }
   preparedShare=null;
   downloadFile(original);saveTime();noteUpdate();
   show("기기 공유를 실행할 수 없습니다("+shareErrorText(err)+"). JSON 다운로드를 요청했습니다. 갤럭시탭의 내 파일 앱에서 JSON 선택 → Quick Share로 보낼 수 있습니다.");

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
 btn.title="현장 데이터를 .sarch.txt 파일로 Quick Share 등에 전송합니다. 수신 후 해당 파일을 S:ARCH로 공유하면 새 현장으로 추가할 수 있습니다.";
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
/* v152: An installed S:ARCH PWA can be selected as an Android share target.
   The root service worker only stages the file; original per-module importer
   validates it and asks for confirmation before creating a new site. */
async function openReceivedProject(){
 const token=new URL(location.href).searchParams.get("sarch_received");
 if(!token)return;
 const clean=()=>{try{const u=new URL(location.href);u.searchParams.delete("sarch_received");history.replaceState(null,"",u.pathname+u.search+u.hash)}catch(e){}};
 const originalPage=location.pathname;
 const fail=msg=>{
  show("받은 파일 연결 실패: "+msg+" · 수신함에서 다시 열거나 프로젝트 불러오기를 사용해 주세요.");
 };
 if(!/^[0-9a-f-]{24,64}$/i.test(token)){clean();fail("파일 식별값이 올바르지 않습니다");return}
 try{
  const input=pick(moduleKey==="drawing"?"#file":moduleKey==="tilt"?"#restore":"#import");
  if(!input||input.type!=="file")throw Error("프로젝트 불러오기 입력이 없습니다");
  const cache=await caches.open(INBOX_CACHE);
  const response=await cache.match(new URL("../inbox/"+token,location.href));
  if(!response)throw Error("수신함에서 파일을 찾지 못했습니다");
  const blob=await response.blob();
  if(!blob.size||blob.size>300*1024*1024)throw Error("파일 크기를 확인해 주세요");
  const rawName=decodeURIComponent(response.headers.get("X-SARCH-Filename")||"받은현장.json");
  const filename=/\.json$/i.test(rawName)?rawName:rawName.replace(/\.(?:sarch\.txt|txt)$/i,"")+".json";
  const project=new File([blob],filename,{type:"application/json"});
  if(typeof DataTransfer!=="function")throw Error("이 브라우저는 직접 불러오기를 지원하지 않습니다");
  const dt=new DataTransfer();dt.items.add(project);
  input.files=dt.files;
  clean();
  show("받은 프로젝트를 "+({"survey":"현장조사","drawing":"도면작성","schmidt":"장비조사","tilt":"기울기"}[moduleKey]||"S:ARCH")+"로 연결합니다. 새 현장 추가를 확인해 주세요.");
  input.dispatchEvent(new Event("change",{bubbles:true}));
 }catch(err){
  console.warn("S:ARCH incoming share:",err);
  clean();fail(err&&err.message||"파일을 열지 못했습니다");
 }
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
window.addEventListener("load",()=>{alignSurveyTools();connection();allowReceivedProjectFiles();installShare();installBackupVerifier();setTimeout(openReceivedProject,350)},{once:true});
})();
