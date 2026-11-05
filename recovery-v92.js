/* SMETRIC v92: non-destructive recovery snapshots. Never overwrites application data. */
(()=>{'use strict';
const module=location.pathname.split('/').filter(Boolean).pop()||'home';
if(!['survey','drawing','schmidt','tilt'].includes(module))return;
const dbName='SMETRIC-recovery-v92-'+module,MAX=3,INTERVAL=30*60*1000;
let db=null,busy=false,lastFingerprint='',lastWarning=0;
const cfg={survey:{db:'field-inspection-sites-v4',store:'sites'},schmidt:{db:'smetric-equipment-db',store:'data'},tilt:{db:'SMETRIC-tilt-project-v85',store:'data'}};
function open(name,version,store){return new Promise((resolve,reject)=>{const r=version?indexedDB.open(name,version):indexedDB.open(name);r.onupgradeneeded=()=>{if(store&&!r.result.objectStoreNames.contains(store))r.result.createObjectStore(store,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function all(database,store){return new Promise((resolve,reject)=>{const tx=database.transaction(store,'readonly'),req=tx.objectStore(store).getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function write(database,store,entry){return new Promise((resolve,reject)=>{const tx=database.transaction(store,'readwrite');tx.objectStore(store).put(entry);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
function remove(database,store,id){return new Promise((resolve,reject)=>{const tx=database.transaction(store,'readwrite');tx.objectStore(store).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function notify(message){let n=document.getElementById('sm92RecoveryStatus');if(!n)return;n.textContent=message}
function warn(message){const now=Date.now();if(now-lastWarning<60000)return;lastWarning=now;notify(message);console.warn('SMETRIC recovery:',message)}
async function capture(){
if(module==='drawing'){const records={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(/smetric-drawing|smDraw|drawing-site/i).test(k))records[k]=localStorage.getItem(k)}return {kind:'localStorage',records}}
const c=cfg[module],source=await open(c.db);try{return {kind:'indexedDB',database:c.db,store:c.store,records:await all(source,c.store)}}finally{source.close()}
}
async function snapshot(force=false){if(!db||busy||document.visibilityState==='hidden')return;busy=true;try{
const payload=await capture();if(!payload.records||Object.keys(payload.records).length===0)return;
const encoded=JSON.stringify(payload),fingerprint=encoded.length+':'+encoded.slice(0,160)+':'+encoded.slice(-160);
if(!force&&fingerprint===lastFingerprint)return;
if(navigator.storage?.estimate){const e=await navigator.storage.estimate();if(e.quota&&e.usage/e.quota>.85){warn('저장 공간이 85% 이상 사용 중입니다. 프로젝트를 외부에 백업해 주세요.');return}}
const stamp=Date.now();await write(db,'snapshots',{id:stamp,created:stamp,module,payload});
const records=(await all(db,'snapshots')).sort((a,b)=>b.created-a.created);for(const old of records.slice(MAX))await remove(db,'snapshots',old.id);
lastFingerprint=fingerprint;notify('복구 기록 저장: '+new Date(stamp).toLocaleTimeString('ko-KR'));
}catch(e){warn('복구 기록 저장 실패: '+(e?.message||e)+'. 외부 백업을 권장합니다.')}finally{busy=false}}
function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
async function show(){if(!db)return;const list=(await all(db,'snapshots')).sort((a,b)=>b.created-a.created);
const chosen=prompt('복구 기록 선택 (1~'+list.length+')\\n'+list.map((r,i)=>(i+1)+'. '+new Date(r.created).toLocaleString('ko-KR')).join('\\n')+'\\n\\n선택하면 복구용 JSON 파일을 다운로드합니다. 현재 작업은 덮어쓰지 않습니다.');
if(!chosen)return;const i=Number(chosen)-1;if(!Number.isInteger(i)||!list[i])return alert('올바른 기록 번호를 선택해 주세요.');
const r=list[i];download(new Blob([JSON.stringify({format:'SMETRIC-recovery-v92',module,created:r.created,...r.payload})],{type:'application/json'}),'SMETRIC_'+module+'_복구_'+r.created+'.json');
alert('복구 기록을 파일로 저장했습니다. 기존 데이터를 덮어쓰지 않았습니다.\\n복구 파일은 일반 프로젝트 백업과 형식이 다를 수 있으니 보관 후 확인해 주세요.');
}
function installUI(){const box=document.createElement('div');box.id='sm92RecoveryBox';box.style.cssText='position:fixed;left:12px;bottom:12px;z-index:9998;background:#112b42;color:white;padding:8px;border-radius:9px;box-shadow:0 2px 10px #0005;font:12px Dotum,sans-serif;max-width:270px';box.innerHTML='<button id="sm92Recover" type="button" style="background:#254d6a;color:white;border:1px solid #6787a0;border-radius:6px;padding:5px 9px">복구 기록</button> <button id="sm92BackupNow" type="button" style="background:#254d6a;color:white;border:1px solid #6787a0;border-radius:6px;padding:5px 9px">지금 기록</button><div id="sm92RecoveryStatus" style="margin-top:4px;color:#c8dfed">복구 저장소 준비 중</div>';document.body.appendChild(box);document.getElementById('sm92Recover').onclick=()=>show().catch(e=>warn(e.message));document.getElementById('sm92BackupNow').onclick=()=>snapshot(true)}
async function init(){installUI();try{db=await open(dbName,1,'snapshots');notify('복구 기록 준비 완료');setTimeout(()=>snapshot(),10000);setInterval(()=>snapshot(),INTERVAL);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')snapshot()});if(navigator.storage?.persist)navigator.storage.persist().catch(()=>{});}catch(e){warn('복구 저장소를 열지 못했습니다. JSON 파일로 외부 백업해 주세요.')}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();