/* S:ARCH v207: one illustration per card; visual-only enhancement, no app state writes. */
(()=>{'use strict';
const themes=new Set(['shinchan','pokemon','digimon','marvel']);
const root=new URL('.',document.currentScript.src);
const mod=document.documentElement.dataset.module;
const toolNames=['현장조사','도면 작성','장비조사','기울기'];
const file={shinchan:['shinchan-0.webp','shinchan-2.png','shinchan-3.webp','shinchan-0.webp'],pokemon:['pokemon-0.png','pokemon-1.png','pokemon-2.png','pokemon-3.png'],digimon:['digimon-0.png','digimon-1.png','digimon-2.png','digimon-3.png'],marvel:['marvel-0.jpg','marvel-1.jpg','marvel-2.jpg','marvel-3.jpg']};
function corner(theme){
 const palette={shinchan:['#cbb48d','#82766b','#a49b8f'],pokemon:['#f6d177','#738b90','#a5b1ac'],digimon:['#82cce8','#526d82','#8297a3'],marvel:['#de9f95','#686e75','#8b9298']};
 const [edge,left,right]=palette[theme];
 const rows=[0,1,2], windowParts=[];
 rows.forEach((n)=>{
  let y=115+n*69;
  windowParts.push('<path d="M337 '+(y+13)+'L411 '+(y-16)+'V'+(y+24)+'L337 '+(y+53)+'Z" fill="#243b47" stroke="'+edge+'" stroke-width="1.4"/>');
  windowParts.push('<path d="M468 '+(y-16)+'L541 '+(y+13)+'V'+(y+53)+'L468 '+(y+24)+'Z" fill="#273d4a" stroke="'+edge+'" stroke-width="1.4"/>');
  windowParts.push('<path d="M373 '+(y-1)+'v40 M505 '+(y-2)+'v40" stroke="'+edge+'" opacity=".42" stroke-width="1"/>');
 });
 return '<defs><linearGradient id="sa207L" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+left+'"/><stop offset="1" stop-color="#4d5357"/></linearGradient><linearGradient id="sa207R" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+right+'"/><stop offset="1" stop-color="#58636a"/></linearGradient></defs>'+
 '<g stroke-linejoin="round"><path d="M315 93L450 28L450 333H315Z" fill="url(#sa207L)" stroke="'+edge+'" stroke-width="2"/>'+
 '<path d="M450 28L563 93V333H450Z" fill="url(#sa207R)" stroke="'+edge+'" stroke-width="2"/>'+
 '<path d="M318 98L450 35L560 98" fill="none" stroke="#eee0c3" stroke-opacity=".56" stroke-width="2"/>'+
 '<path d="M325 96v235 M556 99v232 M315 180L450 128L563 180 M315 249L450 204L563 249" fill="none" stroke="'+edge+'" opacity=".25" stroke-width="1.3"/>'+
 '<path d="M330 105L433 56M465 55L548 103" stroke="#f0e3d0" opacity=".24" stroke-width="2"/>'+
 '<path d="M316 147L449 88 M316 216L449 165 M450 88L562 149 M450 165L562 217" stroke="#293740" stroke-opacity=".17" stroke-width="1.3"/>'+
 windowParts.join('')+
 '<path d="M338 333V291L418 261V333Z" fill="#3c4347" stroke="'+edge+'" stroke-width="1.4"/>'+
 '<path d="M378 275V333M344 305L411 281" fill="none" stroke="'+edge+'" opacity=".56"/>'+
 '<path d="M450 28V333" stroke="#f5dfb1" stroke-opacity=".75" stroke-width="2"/>'+
 '<path d="M311 333H567" stroke="'+edge+'" stroke-width="2"/></g>'+
 '<g fill="none" stroke="#e9d4a3" stroke-linecap="round"><path d="M436 27V332" stroke-dasharray="5 5" stroke-width="1.3"/>'+
 '<path d="M450 28L436 332" stroke-width="2"/><path d="M436 27v-13M450 28V14M436 18h14 M440 15l-4 3 4 3 M446 15l4 3-4 3" stroke-width="1"/></g>';
}
function paintHome(theme){
 document.querySelectorAll('.modules .module').forEach((card,i)=>{
  if(i>3)return;
  const scene=card.querySelector('.sarch-v206-scene');
  if(!scene)return;
  if(scene.dataset.v207Theme===theme)return;
  const atlas=new URL('sarch-v204-'+theme+'-atlas.webp',root).href;
  const img='<svg x="0" y="0" width="600" height="360" viewBox="'+(i%2*600)+' '+(Math.floor(i/2)*360)+' 600 360" preserveAspectRatio="xMidYMax meet" overflow="hidden"><image href="'+atlas+'" width="1200" height="720"/></svg>';
  const visual=i===3?('<svg x="0" y="40" width="297" height="275" viewBox="600 360 600 360" preserveAspectRatio="xMidYMax meet" overflow="hidden"><image href="'+atlas+'" width="1200" height="720"/></svg>'+corner(theme)):img;
  scene.innerHTML='<svg class="sarch-work-scene sarch-v207-work" viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet" aria-hidden="true">'+visual+'</svg>';
  scene.dataset.v207Theme=theme;
  scene.querySelectorAll('.sarch-v203-actor,.sarch-action-companion').forEach(e=>e.remove());
 });
}
const labels={shinchan:'🖍',pokemon:'⚡',digimon:'✦',marvel:'★'};
function paintInside(theme){
 const header=document.querySelector('header.smetric-app-header,header');
 if(!header)return;
 let art=header.querySelector('.sarch-v207-module-mark');
 if(!art){art=document.createElement('span');art.className='sarch-v207-module-mark';art.setAttribute('aria-hidden','true');const brand=header.querySelector('.smetric-brand,.brand,strong');if(brand)brand.insertAdjacentElement('afterend',art);else header.append(art)}
 art.textContent=labels[theme]||'';art.hidden=!themes.has(theme);
 const banner=document.querySelector('.sarch-v207-interior-scene');
 if(banner){banner.remove()}
 // Decoration is anchored in header; never placed over photo/drawing workspace.
 const choices=document.querySelectorAll('button');
 choices.forEach(b=>{
  if(b.dataset.sarchV207Button){delete b.dataset.sarchV207Button}
  if(!themes.has(theme))return;
  const txt=(b.textContent||'').trim();
  if(/^(현장조사|도면 작성|장비조사|기울기|홈|누락 점검|누락점검|사진|카메라|저장)$/.test(txt))b.dataset.sarchV207Button=theme;
 });
}
let scheduled=false;
function update(){
 scheduled=false;const theme=document.body.dataset.theme;
 if(!themes.has(theme))return;
 if(mod==='home')paintHome(theme);else paintInside(theme);
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(update)}
function init(){
 schedule();
 const obs=new MutationObserver((records)=>{
  if(records.some(r=>r.type==='attributes'&&(r.attributeName==='data-theme'||r.attributeName==='data-v207-theme')||r.type==='childList'&&Array.from(r.addedNodes).some(n=>n.nodeType===1&&n.matches?.('.sarch-v206-scene,.sarch-theme-character'))))schedule();
 });
 obs.observe(document.body,{attributes:true,attributeFilter:['data-theme'],childList:true,subtree:true});
 window.addEventListener('pageshow',schedule);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();