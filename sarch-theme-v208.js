/* S:ARCH v208 visual corrections: coherent cards and module interiors. */
(()=>{'use strict';
const THEMES=['shinchan','pokemon','digimon','marvel'];
const NAMES={shinchan:'짱구',pokemon:'포켓몬',digimon:'디지몬',marvel:'마블'};
const GLYPHS={shinchan:'✿',pokemon:'⚡',digimon:'✦',marvel:'★'};
const module=document.documentElement.dataset.module;
const moduleIndex={survey:0,drawing:1,schmidt:2,tilt:3}[module];
const base=new URL('.',document.currentScript.src);
let pending=false;
function cropAtlas(theme,i){
 const url=new URL('sarch-v204-'+theme+'-atlas.webp',base).href;
 const col=i%2,row=Math.floor(i/2);
 return '<svg x="0" y="0" width="600" height="360" viewBox="'+(col*600)+' '+(row*360)+' 600 360" preserveAspectRatio="xMidYMax meet" overflow="hidden"><image href="'+url+'" width="1200" height="720"/></svg>';
}
// A concrete building, not glass curtain wall. Both elevations share the structural corner.
function concreteBuilding(theme){
 const shades={
  shinchan:['#a79e91','#6c7170','#ddc9a7','#33454b'],
  pokemon:['#aab3a3','#76888a','#ead28e','#30474e'],
  digimon:['#8f9ea5','#586e80','#a4d9ec','#213d50'],
  marvel:['#9a9697','#626972','#e1bcb0','#283643']
 };
 const [left,right,edge,window]=shades[theme];
 let details='';
 for(let row=0;row<3;row++){
  const dy=row*68;
  details+='<path d="M350 '+(130+dy)+'L414 '+(105+dy)+'V'+(135+dy)+'L350 '+(160+dy)+'Z" fill="'+window+'" stroke="'+edge+'" stroke-width="1.4"/>';
  details+='<path d="M472 '+(105+dy)+'L543 '+(133+dy)+'V'+(163+dy)+'L472 '+(135+dy)+'Z" fill="'+window+'" stroke="'+edge+'" stroke-width="1.4"/>';
  details+='<path d="M382 '+(117+dy)+'v30 M508 '+(119+dy)+'v30" stroke="'+edge+'" stroke-opacity=".45" stroke-width="1"/>';
 }
 return '<defs><linearGradient id="sarch208-concreteL" x1="0" x2="1" y1="0" y2="1"><stop stop-color="'+left+'"/><stop offset="1" stop-color="#717775"/></linearGradient><linearGradient id="sarch208-concreteR" x1="0" x2="1" y1="0" y2="1"><stop stop-color="'+right+'"/><stop offset="1" stop-color="#3e5058"/></linearGradient></defs>'+
 '<path d="M330 100L452 38V332H330Z" fill="url(#sarch208-concreteL)" stroke="'+edge+'" stroke-width="2"/>'+
 '<path d="M452 38L566 100V332H452Z" fill="url(#sarch208-concreteR)" stroke="'+edge+'" stroke-width="2"/>'+
 '<path d="M331 100L452 38L566 100" fill="none" stroke="'+edge+'" stroke-width="2.2"/>'+
 '<path d="M335 168L452 116L564 169 M335 236L452 188L564 236 M335 303L452 266L564 302" stroke="'+edge+'" stroke-opacity=".24" fill="none" stroke-width="1.3"/>'+
 '<path d="M336 100V332M562 100V332" stroke="'+edge+'" stroke-opacity=".35" stroke-width="1.6"/>'+details+
 '<path d="M347 332V290L420 263V332Z M382 276V332" fill="'+window+'" stroke="'+edge+'" stroke-width="1.4"/>'+
 '<path d="M452 38V332" stroke="#f6e3bf" stroke-opacity=".78" stroke-width="2"/>'+
 '<path d="M319 332H581" stroke="'+edge+'" stroke-width="1.7"/>'+
 '<g stroke="'+edge+'" fill="none"><path d="M438 38V332" stroke-dasharray="5 5" stroke-width="1.6"/>'+
 '<path d="M438 332L452 38" stroke-width="1.6"/><path d="M438 38V20M452 38V20M438 25H452M442 22L438 25L442 28M448 22L452 25L448 28" stroke-width="1.2"/></g>';
}
function paintHome(theme){
 document.querySelectorAll('.modules .module').forEach((card,i)=>{
  const scene=card.querySelector('.sarch-v206-scene');
  if(!scene||i>3)return;
  if(scene.dataset.v208Theme===theme&&scene.querySelector('.sarch-v208-composition'))return;
  let markup='';
  if(i===3){
   // Show ONLY the left-side worker from the original image; discard the old glass facade.
   const url=new URL('sarch-v204-'+theme+'-atlas.webp',base).href;
   markup='<svg x="0" y="44" width="307" height="290" viewBox="600 360 310 360" preserveAspectRatio="xMidYMax meet" overflow="hidden"><image href="'+url+'" width="1200" height="720"/></svg>'+concreteBuilding(theme);
  }else markup=cropAtlas(theme,i);
  scene.replaceChildren();
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','sarch-work-scene sarch-v208-composition');svg.setAttribute('viewBox','0 0 600 360');
  svg.setAttribute('preserveAspectRatio','xMidYMax meet');svg.setAttribute('aria-hidden','true');
  svg.innerHTML=markup;
  scene.append(svg);scene.dataset.v208Theme=theme;
 });
}
function paintInterior(theme){
 if(moduleIndex===undefined)return;
 const header=document.querySelector('header.smetric-app-header,header');
 if(!header)return;
 let tile=header.querySelector('.sarch-v208-interior-tile');
 if(!tile){
  tile=document.createElement('span');
  tile.className='sarch-v208-interior-tile';
  tile.setAttribute('aria-hidden','true');
  const anchor=header.querySelector('.smetric-brand,.brand,header strong,strong');
  if(anchor)anchor.insertAdjacentElement('afterend',tile);
  else header.append(tile);
 }
 if(!THEMES.includes(theme)){tile.hidden=true;document.querySelectorAll('[data-sarch-v208-icon]').forEach(el=>el.removeAttribute('data-sarch-v208-icon'));return}
 tile.hidden=false;
 tile.title=NAMES[theme]+' · '+['현장조사','도면 작성','장비조사','기울기'][moduleIndex];
 tile.style.setProperty('--sarch-v208-atlas','url("'+new URL('sarch-v204-'+theme+'-atlas.webp',base).href+'")');
 tile.style.setProperty('--sarch-v208-x',(moduleIndex%2)*100+'%');
 tile.style.setProperty('--sarch-v208-y',Math.floor(moduleIndex/2)*100+'%');
 tile.dataset.sarchTheme=theme;
 // The button's original label and click handlers are kept intact.
 const buttonNames=/^(?:⌂\s*)?(?:홈|저장|누락 점검|누락점검|사진|카메라|현장조사|도면 작성|장비조사|기울기|기타 도구|도면 순서|현장 스케치)$/;
 document.querySelectorAll('button').forEach(btn=>{
  const txt=(btn.textContent||'').trim();
  if(buttonNames.test(txt))btn.setAttribute('data-sarch-v208-icon',GLYPHS[theme]);
  else btn.removeAttribute('data-sarch-v208-icon');
 });
}
function render(){
 pending=false;const theme=document.body.dataset.theme;
 if(THEMES.includes(theme)&&module==='home')paintHome(theme);
 else if(module!=='home')paintInterior(theme);
}
function queue(){if(!pending){pending=true;requestAnimationFrame(render)}}
function init(){
 queue();
 new MutationObserver(records=>{
  if(records.some(r=>
   (r.type==='attributes'&&r.target===document.body&&r.attributeName==='data-theme')||
   (r.type==='childList'&&Array.from(r.addedNodes).some(n=>n.nodeType===1&&(
    n.matches?.('.sarch-v206-scene,.sarch-work-scene')||
    n.closest?.('.sarch-v206-scene')&& !n.matches?.('.sarch-v208-composition')
   )))
  ))queue();
 }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-theme']});
 window.addEventListener('pageshow',queue);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();