/* S:ARCH v135 — preserve the original controls, IDs, listeners and site data. */
(function(){
"use strict";
let layoutDone=false;
function first(root, selector){return root.querySelector(selector)}
function locateSite(){
 return document.querySelector(
 '.sarch-v121-site,.sm-draw-sitebar,.site-manager.smetric-sitebar,section.smetric-sitebar,.projectbar'
 );
}
function makeLabel(control,title,floor){
 if(!control)return null;
 let el=control.closest('label');
 if(!el||!floor.contains(el)){
  el=document.createElement('label');
  control.parentNode.insertBefore(el,control);
  el.append(document.createTextNode(title+' '),control);
 }else{
  const text=Array.from(el.childNodes).filter(n=>n.nodeType===3)
    .map(n=>n.textContent).join('');
  if(!text.includes(title))el.insertBefore(document.createTextNode(title+' '),el.firstChild);
 }
 return el;
}
function makeNavButton(floor,select,direction){
 const btn=document.createElement('button');
 btn.type='button';btn.textContent=direction<0?'◀ 이전':'다음 ▶';
 btn.className='sarch-generated-nav-v135';
 const sync=()=>{
  const i=select.selectedIndex,n=select.options.length;
  btn.disabled=n<2||(direction<0?i<=0:i>=n-1);
 };
 btn.addEventListener('click',()=>{
  const i=select.selectedIndex+direction;
  if(i<0||i>=select.options.length)return;
  select.selectedIndex=i;
  select.dispatchEvent(new Event('change',{bubbles:true}));
  sync();
 });
 select.addEventListener('change',sync);
 new MutationObserver(sync).observe(select,{childList:true});
 queueMicrotask(sync);
 return btn;
}
function restructureFloor(floor,site,header){
 const root=header.parentNode;
 let box=document.getElementById('sarchFloor135');
 if(!box){
  box=document.createElement('section');
  box.id='sarchFloor135';
  const title=document.createElement('div');title.className='sarch-floor-title-v135';
  title.textContent='층/도면 관리';
  box.appendChild(title);
 }
 root.insertBefore(site,header.nextSibling);
 root.insertBefore(box,site.nextSibling);
 site.classList.add('sarch-site-v135');
 const old=floor.parentElement;
 box.appendChild(floor);
 floor.classList.add('sarch-floor-content-v135');
 if(old&&old!==box&&old.classList.contains('sm65-sheet-section')&&!old.children.length)old.remove();
 if(floor.dataset.sarchLayout135==='done')return;
 floor.dataset.sarchLayout135='done';
 const get=selector=>first(floor,selector);
 const sel=get('#sheet,#sheetSelect,#pageSelect');
 if(!sel)return;
 const order=get('#sm69Reorder');
 if(order&&order.closest('label'))order.remove();
 const selectLabel=makeLabel(sel,'도면 선택',floor);
 const name=get('#pageLabel,#floor,#sm46SheetName');
 const nameLabel=makeLabel(name,'도면명',floor);
 let prev=get('#prevPage,#prev,#sm61PrevSheet');
 let next=get('#nextPage,#next,#sm61NextSheet');
 if(!prev)prev=makeNavButton(floor,sel,-1);
 if(!next)next=makeNavButton(floor,sel,1);
 const rotate=get('#sm63Rotate,#sm61RotateSheet');
 const count=get('#pageCounter,#pageCount');
 const add=get('#sm46AddBlank,#addSheet')||Array.from(floor.querySelectorAll('button')).find(b=>b.textContent.includes('새 도면'));
 const del=get('#removePage,#deletePage,#deleteSheet')||Array.from(floor.querySelectorAll('button')).find(b=>b.textContent.includes('삭제'));
 const upload=get('#uploadBtn');
 const left=document.createElement('div'),right=document.createElement('div'),extra=document.createElement('div');
 left.className='sarch-floor-group-v135';
 right.className='sarch-floor-group-v135 sarch-floor-group-right-v135';
 extra.className='sarch-floor-extras-v135';
 function move(el,parent){if(el&&el!==floor)parent.appendChild(el)}
 [prev,selectLabel,order,rotate,next,count].forEach(el=>move(el,left));
 [nameLabel,del,upload,add].forEach(el=>move(el,right));
 for(const child of Array.from(floor.childNodes))extra.appendChild(child);
 floor.append(left,right,extra);
 if(add)add.textContent='＋ 새 도면';
 if(del)del.textContent='도면 삭제';
}
function restructureEquipment(header){
 const root=header.parentNode;
 const main=document.querySelector('main.layout');
 const panel=document.querySelector('.sm43-tool-panel');
 const box=document.getElementById('sarchFloor135');
 if(!panel||!box)return;
 // Move the original live tool panel after the floor selector, never its buttons.
 // Applies to all modules so their outer left and right edges also align.
 root.insertBefore(panel,box.nextSibling);
 panel.classList.add('sarch-top-tools-v135');
 const equipment=!!document.getElementById('ckSH');
 if(!equipment||!main)return;
 panel.classList.add('sarch-equipment-tools-v135');
 // Legacy injected containers are never required to run the survey controls.
 for(const id of ['sarchTools133','sarchTools134','sarchEquipmentTools']){
  const stale=document.getElementById(id);
  if(!stale||stale===panel)continue;
  for(const content of Array.from(stale.children)){
   if(content.matches('.tools')&&content.querySelector('button,input,select')){
     panel.querySelector('.sm43-group-content')?.appendChild(content);
   }
  }
  stale.remove();
 }
 // A layout can leave behind empty .tools wrappers. Remove only when truly empty.
 const left=main.querySelector(':scope > section.panel');
 if(left){
  for(const el of Array.from(left.children).filter(el=>el.classList.contains('tools'))){
   if(!el.querySelector('button,input,select,canvas')&&!el.textContent.trim())el.remove();
  }
 }
}
function apply(){
 const header=document.querySelector('header.smetric-app-header,header');
 const site=locateSite(),floor=document.querySelector('.sm65-floorbar');
 if(!header||!site||!floor)return;
 document.body.classList.add('sarch-layout-v135');
 restructureFloor(floor,site,header);
 restructureEquipment(header);
 const aside=document.getElementById('side');
 if(aside){
  const close=Array.from(aside.querySelectorAll('button'))
   .find(b=>b.textContent.includes('닫기')&&b.getAttribute('onclick')?.includes('selected=null'));
  if(close)close.remove();
 }
 layoutDone=true;
}
function schedule(){requestAnimationFrame(apply)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();
window.addEventListener('load',schedule,{once:true});
setTimeout(()=>{if(!layoutDone||document.querySelector('.sm43-tool-panel'))apply()},850);
})();
