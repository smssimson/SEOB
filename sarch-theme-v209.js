/* S:ARCH v209 — theme scene compositor. No work-canvas or project data changes. */
(()=>{'use strict';
const T=['shinchan','pokemon','digimon','marvel'];
const META={
 shinchan:{label:'짱구',gold:'#e9c797',dark:'#7a4638',sky:'#e7b568',window:'#344a55',actor:'sarch-theme-shinchan-0.webp'},
 pokemon:{label:'포켓몬',gold:'#f4d377',dark:'#77653e',sky:'#c8e7a4',window:'#3f5b64',actor:'sarch-theme-pokemon-0.png'},
 digimon:{label:'디지몬',gold:'#8cdef3',dark:'#225873',sky:'#4aaad5',window:'#193951',actor:'sarch-theme-digimon-0.png'},
 marvel:{label:'마블',gold:'#dca5a1',dark:'#683745',sky:'#cf697c',window:'#28394a',actor:'sarch-theme-marvel-0.jpg'},
 dark:{label:'S:ARCH',gold:'#d7c09a',dark:'#325c73',sky:'#60c3ed',window:'#203e50',actor:''}
};
const ROOT=new URL('.',document.currentScript.src);
const mod=document.documentElement.dataset.module;
const modIndex={survey:0,drawing:1,schmidt:2,tilt:3}[mod];
const name=['현장조사','도면 작성','장비조사','기울기'];
const actors={
 digimon:['sarch-theme-digimon-0.png','sarch-theme-digimon-1.png','sarch-theme-digimon-2.png','sarch-theme-digimon-3.png'],
 marvel:['sarch-theme-marvel-0.jpg','sarch-theme-marvel-1.jpg','sarch-theme-marvel-2.jpg','sarch-theme-marvel-3.jpg']
};
let queuePending=false;
function url(file){return new URL(file,ROOT).href}
function tag(s){return String(s).replace(/[&<>"]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[x]))}
function svgAtlas(theme,i){
 const x=(i%2)*600,y=Math.floor(i/2)*360;
 return '<svg x="0" y="0" width="600" height="360" viewBox="'+x+' '+y+' 600 360" preserveAspectRatio="xMidYMax meet" overflow="hidden"><image href="'+url('sarch-v204-'+theme+'-atlas.webp')+'" width="1200" height="720"/></svg>';
}
function building(theme){
 // One identical, exposed-reinforced-concrete building for FIELD and TILT.
 // Muted plaster/concrete, recessed windows, parapet, slab edges, a shared 3-D corner.
 const p=META[theme]||META.dark,e=p.gold;
 let windows='';
 for(let k=0;k<3;k++){
  const a=k*68;
  windows+='<path d="M370 '+(137+a)+'L428 '+(114+a)+'V'+(145+a)+'L370 '+(168+a)+'Z" fill="'+p.window+'" stroke="'+e+'" stroke-width="1.4"/>';
  windows+='<path d="M481 '+(115+a)+'L553 '+(145+a)+'V'+(176+a)+'L481 '+(146+a)+'Z" fill="'+p.window+'" stroke="'+e+'" stroke-width="1.4"/>';
  windows+='<path d="M375 '+(139+a)+'L424 '+(120+a)+' M486 '+(119+a)+'L548 '+(146+a)+'" fill="none" stroke="#fff" opacity=".15" stroke-width="1.8"/>';
  windows+='<path d="M399 '+(126+a)+'v30 M518 '+(130+a)+'v30" stroke="'+e+'" opacity=".32" stroke-width=".9"/>';
 }
 return '<defs><linearGradient id="sa209L" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c4b8a5"/><stop offset=".4" stop-color="#a29b8e"/><stop offset="1" stop-color="#6f7977"/></linearGradient><linearGradient id="sa209R" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#a5a598"/><stop offset=".52" stop-color="#7a8580"/><stop offset="1" stop-color="#525c60"/></linearGradient><linearGradient id="sa209Shine" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+e+'" stop-opacity=".28"/><stop offset="1" stop-color="'+e+'" stop-opacity="0"/></linearGradient></defs>'+
 '<g stroke-linejoin="round">'+
 '<path d="M352 110L463 48V333H352Z" fill="url(#sa209L)" stroke="'+e+'" stroke-width="2"/>'+
 '<path d="M463 48L571 111V333H463Z" fill="url(#sa209R)" stroke="'+e+'" stroke-width="2"/>'+
 '<path d="M351 110L463 48L571 111" fill="none" stroke="'+e+'" stroke-width="2.25"/>'+
 '<path d="M363 117L459 63M475 65L563 115" fill="none" stroke="#fff5dd" stroke-opacity=".4" stroke-width="2"/>'+
 '<path d="M354 183L463 133L569 183 M354 252L463 208L569 252" fill="none" stroke="'+e+'" stroke-opacity=".3" stroke-width="3"/>'+
 '<path d="M355 182L463 132L569 182 M355 251L463 207L569 251" fill="none" stroke="#f1e8d8" stroke-opacity=".26" stroke-width="1"/>'+
 '<path d="M356 115V332 M567 115V333" fill="none" stroke="#eeeadc" stroke-opacity=".22" stroke-width="3"/>'+
 '<path d="M355 111L461 53V332H355Z" fill="url(#sa209Shine)" opacity=".28"/>'+windows+
 // Concrete has shallow pores and construction joints, not a reflective curtain wall.
 '<g fill="#45575a" opacity=".28"><circle cx="360" cy="157" r="1.3"/><circle cx="447" cy="183" r="1.6"/><circle cx="366" cy="232" r="1.3"/><circle cx="455" cy="292" r="1.7"/><circle cx="475" cy="180" r="1.2"/><circle cx="559" cy="268" r="1.5"/><circle cx="536" cy="319" r="1.3"/><circle cx="392" cy="305" r="1.1"/></g>'+
 '<path d="M373 333V291L439 265V333Z" fill="#384c53" stroke="'+e+'" stroke-width="1.4"/>'+
 '<path d="M407 279V333 M377 303L438 280" stroke="'+e+'" stroke-width="1" opacity=".45"/>'+
 '<path d="M463 48V333" stroke="#f6dcb3" stroke-width="2.4"/>'+
 '<path d="M348 333H581" stroke="'+e+'" stroke-width="1.3"/></g>';
}
function plumb(theme){
 const e=META[theme]?.gold||META.dark.gold;
 return '<g fill="none" stroke="'+e+'" stroke-linecap="round"><path d="M448 48V333" stroke-dasharray="4 6" stroke-width="1.7"/><path d="M463 48L448 333" stroke-width="1.9"/><path d="M448 47V31M463 47V31M448 35H463M452 32l-4 3 4 3M459 32l4 3-4 3" stroke-width="1.2"/></g>';
}
function facadePanel(theme){
 const p=META[theme]||META.dark;
 return '<g transform="translate(482 106)"><rect width="99" height="75" rx="13" fill="#132a3a" fill-opacity=".95" stroke="'+p.gold+'" stroke-width="2"/>'+
 '<rect x="12" y="12" width="75" height="49" rx="4" fill="#a6a393" stroke="'+p.gold+'" stroke-width="1.5"/>'+
 '<path d="M28 31l12 12-4 7 13-4 8 4 7-16 8 5" fill="none" stroke="#353e40" stroke-width="3"/>'+
 '<path d="M16 16h17M16 16v16M83 16H69M83 16v16M16 57v-14M16 57h15M83 57H69M83 57v-14" stroke="#f5d476" stroke-width="3" fill="none"/></g>';
}
function tripod(theme){
 const p=META[theme]||META.dark;
 return '<g transform="translate(170 180)" stroke-linecap="round" stroke-linejoin="round">'+
 '<path d="M65 70L30 153 M65 70L94 153M65 70V153" fill="none" stroke="#c2924b" stroke-width="7"/>'+
 '<path d="M65 70L30 153 M65 70L94 153M65 70V153" fill="none" stroke="#f4d58a" stroke-width="2"/>'+
 '<rect x="46" y="31" width="39" height="45" rx="7" fill="#d3a355" stroke="'+p.gold+'" stroke-width="2"/>'+
 '<rect x="53" y="40" width="25" height="23" rx="4" fill="#1c3845" stroke="#b0e6ed"/>'+
 '<circle cx="65" cy="51" r="7" fill="#6ac4d9" stroke="#e7ffff" stroke-width="2"/>'+
 '</g>';
}
function tools(theme,i){
 const p=META[theme]||META.dark;
 const stroke=p.gold;
 if(i===0)return '<g transform="translate(123 252)"><path d="M0 15h44l7-9h27l8 9h20v64H0z" fill="#253f4b" stroke="'+stroke+'" stroke-width="2"/><circle cx="64" cy="45" r="22" fill="#122835" stroke="'+stroke+'" stroke-width="4"/><circle cx="64" cy="45" r="11" fill="#66afbf"/><path d="M7 32h20" stroke="#d9b46b" stroke-width="3"/></g>';
 if(i===1)return '<g transform="translate(100 290)"><path d="M0 12h180l14 23H0z" fill="#263f54" stroke="'+stroke+'"/><path d="M22 19H166M77 19V34M114 19V34" stroke="#bbddf3" stroke-width="1.4"/><path d="M120 0l19 29" stroke="#f1c86e" stroke-width="6"/></g>';
 if(i===2)return '<g transform="translate(116 286)"><rect width="118" height="58" rx="8" fill="#243d4d" stroke="'+stroke+'" stroke-width="2"/><rect x="11" y="11" width="96" height="37" fill="#b7a98c"/><path d="M20 20h76M20 29h76M20 38h48" stroke="#355465" stroke-width="2"/></g>';
 return '';
}
function actor(theme,i){
 if(!actors[theme])return '';
 const f=actors[theme][i];
 const el=document.createElement('img');
 el.className='sarch-v209-actor '+(theme==='digimon'?'sarch-v209-cutout':'sarch-v209-marvel');
 el.alt='';el.draggable=false;el.loading='eager';
 el.src=url(f);
 if(theme==='digimon'){
  el.addEventListener('load',()=>{
   if(el.dataset.processed)return;
   try{
    const c=document.createElement('canvas');c.width=el.naturalWidth;c.height=el.naturalHeight;
    const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(el,0,0);
    const d=g.getImageData(0,0,c.width,c.height),a=d.data,w=c.width,h=c.height,seen=new Uint8Array(w*h),todo=new Int32Array(w*h);
    let first=0,last=0;
    function visit(n){
      if(n<0||n>=w*h||seen[n])return;seen[n]=1;const j=n*4;
      if(a[j+3]<20||(a[j]>225&&a[j+1]>225&&a[j+2]>225)){
       a[j+3]=0;todo[last++]=n;
      }
    }
    for(let x=0;x<w;x++){visit(x);visit((h-1)*w+x)}
    for(let y=0;y<h;y++){visit(y*w);visit(y*w+w-1)}
    while(first<last){const n=todo[first++];if(n%w)visit(n-1);if(n%w<w-1)visit(n+1);if(n>=w)visit(n-w);if(n<w*(h-1))visit(n+w)}
    g.putImageData(d,0,0);el.dataset.processed='1';el.src=c.toDataURL('image/png');
   }catch(err){el.dataset.processed='1'}
  },{once:true});
 }
 return el;
}
function createCard(theme,i){
 const wrap=document.createElement('span');wrap.className='sarch-v209-scene';
 wrap.dataset.scene=String(i);wrap.setAttribute('aria-hidden','true');
 const sc=document.createElementNS('http://www.w3.org/2000/svg','svg');
 sc.setAttribute('viewBox','0 0 600 360');sc.setAttribute('class','sarch-v209-svg');
 sc.setAttribute('preserveAspectRatio','xMidYMax meet');
 let art='';
 const glow=META[theme]?.sky||META.dark.sky;
 art+='<defs><radialGradient id="sa209G"><stop stop-color="'+glow+'" stop-opacity=".22"/><stop offset="1" stop-color="'+glow+'" stop-opacity="0"/></radialGradient></defs>';
 art+='<ellipse cx="405" cy="295" rx="208" ry="128" fill="url(#sa209G)"/>';
 if(i===0){
   art+=building(theme);
   if(theme==='shinchan'||theme==='pokemon'){
    // The original glass building is masked off; foreground characters are kept.
    const clip=theme==='shinchan'
      ?'M25 348L25 302L83 285L104 232L161 229L193 173L222 129L271 104L319 120L344 153L364 197L374 230L365 281L452 304L458 350Z'
      :'M0 347V247L95 238L127 197L181 176L240 143L280 160L349 160L390 230L415 325L428 350Z';
    art+='<defs><clipPath id="sa209ActorClip"><path d="'+clip+'"/></clipPath></defs>';
    art+='<g clip-path="url(#sa209ActorClip)">'+svgAtlas(theme,0)+'</g>';
   }else {
    art+=tools(theme,0);
   }
   art+=facadePanel(theme);
 }else if(i===3){
   art+=building(theme)+plumb(theme);
   if(theme==='shinchan'||theme==='pokemon'){
    const atlas=url('sarch-v204-'+theme+'-atlas.webp');
    // Correct character crop: the Pokémon actor is on the RIGHT of its source cell.
    const crop=theme==='shinchan'?'690 360 315 360':'850 360 350 360';
    art+='<svg x="15" y="89" width="315" height="250" viewBox="'+crop+'" preserveAspectRatio="xMidYMax meet" overflow="hidden"><image href="'+atlas+'" width="1200" height="720"/></svg>';
   }else if(theme==='dark')art+=tripod(theme);
 }else {
   art+=svgAtlas(theme,i);
   if(theme==='dark')art+=tools(theme,i);
 }
 sc.innerHTML=art;wrap.append(sc);
 const el=actor(theme,i);
 if(el)wrap.append(el);
 return wrap;
}
function updateHome(theme){
 const cards=document.querySelectorAll('.modules .module');
 cards.forEach((card,i)=>{
  if(i>3)return;
  const existing=card.querySelector('.sarch-v209-scene');
  // Standard, non-character themes keep their familiar CAD and test artwork.
  if(theme==='dark'&&(i===1||i===2)){existing?.remove();return;}
  if(existing&&existing.dataset.theme===theme)return;
  existing?.remove();
  const scene=createCard(theme,i);scene.dataset.theme=theme;card.append(scene);
 });
}
const buttonWords=/홈|저장|누락|사진|카메라|도면|스케치|측정|조사|기울기|장비|촬영|도구|보정|결함|그리기/;
function updateModule(theme){
 if(modIndex===undefined)return;
 const head=document.querySelector('header.smetric-app-header,header');
 if(!head)return;
 let hero=head.querySelector('.sarch-v209-header-art');
 if(!hero){hero=document.createElement('span');hero.className='sarch-v209-header-art';hero.setAttribute('aria-hidden','true');let brand=head.querySelector('.smetric-brand,.brand,strong');if(brand)brand.insertAdjacentElement('afterend',hero);else head.append(hero)}
 const old=hero.dataset.theme;
 hero.dataset.theme=theme;
 if(T.includes(theme)){
  // Use the card's chosen themed scene so the internal module matches its homepage card.
  hero.style.setProperty('--sa209-atlas','url("'+url('sarch-v204-'+theme+'-atlas.webp')+'")');
  hero.style.setProperty('--sa209-x',modIndex%2?'100%':'0%');
  hero.style.setProperty('--sa209-y',modIndex>1?'100%':'0%');
 }
 // Only paint existing native controls. All buttons keep their real listeners.
 if(old!==theme){
  head.querySelectorAll('.sarch-v208-interior-tile').forEach(n=>n.style.display='none');
 }
 const nodes=document.querySelectorAll('button');
 nodes.forEach(b=>{
   const str=(b.textContent||'').trim().replace(/\s+/g,' ');
   if(buttonWords.test(str)&&str.length<35&&T.includes(theme))b.dataset.sarch209Button='1';
   else delete b.dataset.sarch209Button;
 });
}
function render(){
 queuePending=false;
 const theme=T.includes(document.body.dataset.theme)?document.body.dataset.theme:'dark';
 if(mod==='home')updateHome(theme);
 else updateModule(theme);
 document.body.dataset.sarch209=theme;
}
function schedule(){if(!queuePending){queuePending=true;requestAnimationFrame(render)}}
function init(){
 schedule();
 const observer=new MutationObserver(records=>{
  if(records.some(r=>r.type==='attributes'&&r.target===document.body&&r.attributeName==='data-theme'
    ||r.type==='childList'&&Array.from(r.addedNodes).some(n=>n.nodeType===1&&n.classList?.contains('sarch-v206-scene'))))schedule();
 });
 observer.observe(document.body,{attributes:true,attributeFilter:['data-theme'],childList:true,subtree:true});
 window.addEventListener('pageshow',schedule);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();