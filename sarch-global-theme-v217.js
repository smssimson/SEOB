/* S:ARCH unified theme selector and removable illustrated theme pack. */
(()=>{"use strict";
const KEY="sarch-global-theme-v199";
const hasOwn=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
let currentChoice=null;
const labels={dark:"기본 · S:ARCH",light:"라이트",navy:"네이비",forest:"포레스트",ocean:"오션",paper:"도면지",lavender:"라벤더",terminal:"터미널",terracotta:"테라코타",shinchan:"짱구",catcrew:"고양이 조사단",bearcrew:"곰돌이 건축단",penguincrew:"펭귄 측정단"};
// Similar palettes are consolidated. Migrate existing preferences without touching project data.
const mergedThemes=Object.freeze({graphite:"dark",slate:"dark",blueprint:"navy",mint:"forest",sand:"paper",rose:"lavender",safety:"dark"});
function canonicalTheme(value){const key=hasOwn(mergedThemes,value)?mergedThemes[value]:value;return hasOwn(labels,key)?key:"dark"}
const base=new URL(".",document.currentScript.src);
const images={
 shinchan:["shinchan-0.webp","shinchan-2.png","shinchan-3.webp","shinchan-0.webp"],
 pokemon:["pokemon-0.png","pokemon-1.png","pokemon-2.png","pokemon-3.png"],
 digimon:["digimon-0.png","digimon-1.png","digimon-2.png","digimon-3.png"],
 marvel:["marvel-0.jpg","marvel-1.jpg","marvel-2.jpg","marvel-3.jpg"]
};
const companions={shinchan:["shinchan-1.png","shinchan-1.png","shinchan-4.png","shinchan-1.png"],pokemon:["pokemon-4.png","pokemon-6.png","pokemon-5.png","pokemon-7.png"]};
const titles={shinchan:["짱구","짱아","철수","짱구"],pokemon:["피카츄","브케인","물짱이","팽도리"],digimon:["아구몬","파피몬","파닥몬","가트몬"],marvel:["아이언맨","캡틴 아메리카","스파이더맨","헐크"]};
function artwork(file,cls,theme){
 const img=document.createElement("img");img.className=cls;img.alt="";img.draggable=false;img.decoding="async";img.src=new URL("sarch-theme-"+file,base).href;
 // Remove only connected near-white background in legacy Digimon art; preserve interior whites.
 if(theme==="digimon")img.addEventListener("load",()=>{try{
  const c=document.createElement("canvas");c.width=img.naturalWidth;c.height=img.naturalHeight;
  const ctx=c.getContext("2d",{willReadFrequently:true});ctx.drawImage(img,0,0);const d=ctx.getImageData(0,0,c.width,c.height),p=d.data,w=c.width,h=c.height,n=w*h,visited=new Uint8Array(n),q=new Int32Array(n);let a=0,b=0;
  function push(k){if(k<0||k>=n||visited[k])return;visited[k]=1;const i=k*4;if(p[i+3]<15||(p[i]>235&&p[i+1]>235&&p[i+2]>235)){p[i+3]=0;q[b++]=k}}
  for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}
  while(a<b){const k=q[a++];if(k%w)push(k-1);if(k%w<w-1)push(k+1);push(k-w);push(k+w)}
  ctx.putImageData(d,0,0);img.src=c.toDataURL("image/png");img.dataset.cutoutReady="true";
 }catch(e){}},{once:true});return img;
}

const colors={shinchan:["#e5ca9b","#324c63","#213a52","#e6c475"],pokemon:["#f2d18b","#355d72","#27495a","#e8ca63"],digimon:["#92d7ef","#224b70","#16334f","#61cbe9"],marvel:["#e3c6aa","#3e4b64","#253750","#d9948b"]};
function atlas(theme,i,x=0,y=0,w=600,h=360){
 const src=new URL("sarch-v204-"+theme+"-atlas.webp",base).href;
 return '<svg x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" viewBox="'+(i%2*600)+' '+(Math.floor(i/2)*360)+' 600 360" preserveAspectRatio="xMidYMax meet" overflow="hidden"><image href="'+src+'" width="1200" height="720"/></svg>';
}
// The two facade planes share one real corner, B=(437,330) and T=(455,30).
// Shearing all facade points together preserves correct corner geometry.
function corner(theme){
 // A true three-dimensional corner: BOTH visible facades share their top T and bottom B.
 // All measurement strokes originate from B; actual corner B->T, plumb B->P.
 const [gold,left,right]=colors[theme];
 const id="sarch206-"+theme;
 const B=[430,332], T=[449,30], P=[430,30];
 const path=points=>"M"+points.map(v=>v.join(" ")).join("L")+"Z";
 const leftPlane=[[293,101],T,B,[293,332]],rightPlane=[T,[567,102],[567,332],B];
 let windows="";
 const rows=[0,1,2];
 for(const j of rows){
   const yl=128+j*62,yr=101+j*62;
   windows+='<path d="'+path([[313,yl],[414,yr],[414,yr+39],[313,yl+39]])+'" fill="url(#'+id+'-glass)" stroke="'+gold+'" stroke-opacity=".77" stroke-width="1.25"/>';
   windows+='<path d="'+path([[462,yr+6],[549,yl+7],[549,yl+46],[462,yr+45]])+'" fill="url(#'+id+'-glass)" stroke="'+gold+'" stroke-opacity=".77" stroke-width="1.25"/>';
   for(const k of [1,2]){let x=313+(414-313)*k/3,yy=yl+(yr-yl)*k/3;
    windows+='<path d="M'+x.toFixed(1)+' '+yy.toFixed(1)+'v39" stroke="'+gold+'" stroke-width=".8" opacity=".45"/>';
    x=462+(549-462)*k/3;yy=yr+6+(yl-yr)*k/3;
    windows+='<path d="M'+x.toFixed(1)+' '+yy.toFixed(1)+'v39" stroke="'+gold+'" stroke-width=".8" opacity=".45"/>';
   }
 }
 return '<defs><linearGradient id="'+id+'-left" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+left+'"/><stop offset="1" stop-color="#17293b"/></linearGradient>'+
 '<linearGradient id="'+id+'-right" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+right+'"/><stop offset="1" stop-color="#0b1728"/></linearGradient>'+
 '<linearGradient id="'+id+'-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#547b93"/><stop offset=".5" stop-color="#243e53"/><stop offset="1" stop-color="#172535"/></linearGradient></defs>'+
 '<g class="sarch-corner-building" stroke-linejoin="round">'+
 '<path class="sarch-facade-left" d="'+path(leftPlane)+'" fill="url(#'+id+'-left)" stroke="'+gold+'" stroke-width="1.8"/>'+
 '<path class="sarch-facade-right" d="'+path(rightPlane)+'" fill="url(#'+id+'-right)" stroke="'+gold+'" stroke-width="1.8"/>'+
 '<path d="M293 101L449 30L567 102" stroke="'+gold+'" fill="none" stroke-width="2.25"/>'+
 '<path d="M293 164L436 106L567 164 M293 231L433 177L567 231 M293 291L430 255L567 291" fill="none" stroke="'+gold+'" stroke-opacity=".26" stroke-width="1.15"/>'+
 windows+
 '<path d="M319 332V292L393 270V332Z M356 280V332" fill="#13283b" stroke="'+gold+'" stroke-opacity=".62" stroke-width="1.2"/>'+
 '</g>'+
 '<path d="M273 332H585" stroke="'+gold+'" stroke-opacity=".52" fill="none" stroke-width="1.15"/>'+
 '<g class="sarch-corner-measurements" fill="none" stroke="'+gold+'" stroke-linecap="butt" stroke-linejoin="round">'+
 '<path class="sarch-corner-plumb" data-measure="plumb" d="M'+P[0]+' '+B[1]+'V'+P[1]+'" stroke-width="1.5" stroke-dasharray="5 5" opacity=".95"/>'+
 '<path class="sarch-corner-actual" data-measure="actual" d="M'+B.join(" ")+'L'+T.join(" ")+'" stroke-width="1.75"/>'+
 '<path d="M430 30V14 M449 30V14 M430 18H449 M434 15L430 18L434 21 M445 15L449 18L445 21" stroke-width=".9"/>'+
 '</g>';
}
const tripod='<g stroke-linecap="round" stroke-linejoin="round"><path d="M265 217L229 334M265 217L307 334M265 217V334" fill="none" stroke="#bf9862" stroke-width="7"/><path d="M265 217L229 334M265 217L307 334M265 217V334" fill="none" stroke="#e9ca84" stroke-width="3"/><rect x="239" y="172" width="52" height="43" rx="7" fill="#d6ad59" stroke="#eace91" stroke-width="1.7"/><rect x="249" y="179" width="32" height="25" rx="4" fill="#172d42" stroke="#9eaab1"/><circle cx="265" cy="192" r="7.5" fill="#4d9eb8" stroke="#b9e3e9" stroke-width="2"/><path d="M265 172V160h17" fill="none" stroke="#e4ce9f" stroke-width="3"/></g>';
const miniTools=[
 '<g transform="translate(222 188)"><path d="M0 12h20l8-10h28l9 10h13v47H0z" fill="#263e50" stroke="#dbccac" stroke-width="2" stroke-linejoin="round"/><circle cx="44" cy="36" r="18" fill="#10263a" stroke="#c9b27d" stroke-width="4"/><circle cx="44" cy="36" r="10" fill="#4b859b"/><path d="M39 31l8-5" stroke="#d9f2fb" stroke-width="3"/></g>',
 '<g transform="translate(210 235)"><path d="M0 32L26 0H150L172 60H0Z" fill="#7d6653" stroke="#bea987" stroke-width="2"/><path d="M27 7H141L159 48H13Z" fill="#dfd7c4"/><path d="M36 15H131L143 40H27ZM78 15V40M100 15V27H137M33 27H78" fill="none" stroke="#4c657b" stroke-width="2"/><path d="M15 37l38-43 5 5-39 42z" fill="#f0c66e" stroke="#d6a052"/></g>',
 '<g transform="translate(224 244)"><rect width="91" height="66" rx="5" fill="#a38b6d" stroke="#e0cbaa" stroke-width="1.7"/><rect x="8" y="8" width="75" height="50" rx="2" fill="#e7e1cf"/><path d="M17 18h30m-30 10h55m-55 10h43m-43 10h55" stroke="#637e92" stroke-width="2"/><path d="M62 18h9v9h-9z" fill="#709f9e"/></g>'
];
function decoration(theme,i){
 const wrap=document.createElement("span");
 wrap.className="sarch-theme-character sarch-theme-card-character sarch-action-scene sarch-v203-scene sarch-v206-scene";
 wrap.setAttribute("aria-hidden","true");wrap.dataset.scene=String(i);wrap.dataset.theme=theme;
 const integrated=(theme==="shinchan"||theme==="pokemon");
 const [line]=colors[theme];
 let scene="";
 if(i===3){
  // Foreground actor and tripod to the LEFT; technical two-facade corner only to the RIGHT.
  // Never bring an image-based side elevation over the geometric corner.
  if(integrated)scene+=atlas(theme,3,0,108,258,238);
  scene+=corner(theme);
  if(theme==="pokemon")scene+='<g transform="translate(-12 -15) scale(.92)">'+tripod+'</g>';
  if(!integrated)scene+=tripod;
 }else if(integrated){
  scene=atlas(theme,i);
 }else{
  // Original high-res scene assets have transparent edges. Keep the actor image
  // without drawing a second machine / repeated labels over its equipment.
  scene=atlas(theme,i,148,12,443,330);
 }
 wrap.innerHTML='<svg class="sarch-work-scene" viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet" aria-hidden="true">'+scene+'<path d="M14 347H586" stroke="'+line+'" opacity=".27" stroke-width=".9" fill="none"/></svg>';
 if(!integrated)wrap.append(artwork(images[theme][i],"sarch-v203-actor",theme));
 return wrap;
}
let headerArt=null,headerObserver=null;
function placeHeader(){
 if(!headerArt||!headerArt.isConnected)return;
 const anchor=headerArt.parentElement,head=anchor.closest(".smetric-app-header");if(!head)return;
 const r=anchor.getBoundingClientRect(),h=head.getBoundingClientRect();
 // Absolute overlay on the button; no flex or grid item or change to its dimensions.
 const left=r.left-64,right=r.left-6;
 const obstruct=[...head.querySelectorAll(".smetric-brand,#smSaveIndicator,.sarch-protect,.smetric-head-controls>button,.smetric-head-controls>a,.smetric-head-controls>span")].filter(e=>e!==anchor&&!e.contains(anchor)&&!e.classList.contains("sarch-theme-character")).some(e=>{const t=e.getBoundingClientRect();return t.width>0&&t.height>0&&Math.min(right,t.right)-Math.max(left,t.left)>1&&Math.min(r.bottom,t.bottom)-Math.max(r.top,t.top)>1});
 headerArt.style.display=r.width>0&&left>=h.left+6&&!obstruct?"block":"none";
}
function stored(){try{const v=localStorage.getItem(KEY),theme=canonicalTheme(v);if(v&&v!==theme)localStorage.setItem(KEY,theme);return theme}catch(e){return "dark"}}

// Set only the background paint on the existing camera button; do not replace handlers or layout.
const cameraIcons={"shinchan":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2024%22%3E%3Cpath%20d%3D%22M3%207h6l3-4h8l3%204h6v14H3z%22%20fill%3D%22%23e9c45e%22%20stroke%3D%22%23412f28%22%20stroke-width%3D%221.5%22%20stroke-linejoin%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2216%22%20cy%3D%2214%22%20r%3D%225.5%22%20fill%3D%22%23ce5145%22%20stroke%3D%22%23412f28%22%20stroke-width%3D%221.3%22%2F%3E%3Cpath%20d%3D%22M25%2010h3v3h-3z%22%20fill%3D%22%23f5e29a%22%2F%3E%3Cpath%20d%3D%22M3%204l-1-2m5%200V0%22%20stroke%3D%22%23ce5145%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E","pokemon":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2024%22%3E%3Cpath%20d%3D%22M3%207h6l3-4h8l3%204h6v14H3z%22%20fill%3D%22%23fff7d9%22%20stroke%3D%22%2327374b%22%20stroke-width%3D%221.5%22%20stroke-linejoin%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2216%22%20cy%3D%2214%22%20r%3D%225.5%22%20fill%3D%22%23e1534e%22%20stroke%3D%22%2327374b%22%20stroke-width%3D%221.3%22%2F%3E%3Ccircle%20cx%3D%2216%22%20cy%3D%2214%22%20r%3D%225.5%22%20fill%3D%22%23fff9e2%22%20stroke%3D%22%2326354b%22%20stroke-width%3D%221.4%22%2F%3E%3Cpath%20d%3D%22M10.5%2014a5.5%205.5%200%200%201%2011%200Z%22%20fill%3D%22%23e1534e%22%2F%3E%3Cpath%20d%3D%22M10.5%2014h11%22%20stroke%3D%22%2326354b%22%2F%3E%3Ccircle%20cx%3D%2216%22%20cy%3D%2214%22%20r%3D%221.9%22%20fill%3D%22%23fff%22%20stroke%3D%22%2326354b%22%2F%3E%3C%2Fsvg%3E","digimon":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2024%22%3E%3Cpath%20d%3D%22M3%207h6l3-4h8l3%204h6v14H3z%22%20fill%3D%22%23b2daec%22%20stroke%3D%22%23214a6a%22%20stroke-width%3D%221.5%22%20stroke-linejoin%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2216%22%20cy%3D%2214%22%20r%3D%225.5%22%20fill%3D%22%23f1ac4b%22%20stroke%3D%22%23214a6a%22%20stroke-width%3D%221.3%22%2F%3E%3Crect%20x%3D%2211%22%20y%3D%229%22%20width%3D%2210%22%20height%3D%2210%22%20rx%3D%222%22%20fill%3D%22%234ec1e9%22%20stroke%3D%22%23214a6a%22%2F%3E%3Cpath%20d%3D%22M13%2014h6m-3-3v6%22%20stroke%3D%22%23eafcff%22%20stroke-width%3D%221.3%22%2F%3E%3Cpath%20d%3D%22M25%2010h2v2h-2zM25%2014h2v2h-2z%22%20fill%3D%22%23f1ac4b%22%2F%3E%3C%2Fsvg%3E","marvel":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2024%22%3E%3Cpath%20d%3D%22M3%207h6l3-4h8l3%204h6v14H3z%22%20fill%3D%22%23a84452%22%20stroke%3D%22%23eae6d9%22%20stroke-width%3D%221.5%22%20stroke-linejoin%3D%22round%22%2F%3E%3Ccircle%20cx%3D%2216%22%20cy%3D%2214%22%20r%3D%225.5%22%20fill%3D%22%2377d7e8%22%20stroke%3D%22%23eae6d9%22%20stroke-width%3D%221.3%22%2F%3E%3Ccircle%20cx%3D%2216%22%20cy%3D%2214%22%20r%3D%225.8%22%20fill%3D%22%23173e53%22%20stroke%3D%22%238bdaed%22%20stroke-width%3D%221.5%22%2F%3E%3Cpath%20d%3D%22M16%2010l3.7%206.5h-7.4z%22%20fill%3D%22%23bdf3ff%22%2F%3E%3Ccircle%20cx%3D%2216%22%20cy%3D%2214%22%20r%3D%223.8%22%20fill%3D%22none%22%20stroke%3D%22%237dd8ed%22%20stroke-width%3D%22.75%22%2F%3E%3C%2Fsvg%3E"};
const cameraOriginal=new WeakMap();
function paintCamera(theme){
 if (!["survey","schmidt","tilt"].includes(document.documentElement.dataset.module)) return;
 for(const c of document.querySelectorAll("#cameraBtn,#sm52FixedCamera")){
  let artwork=c.querySelector(".sarch-camera-art");
  const props=["background-image","background-repeat","background-size","background-position","background-color","border-color","border-radius","color","font-size","position"];
  if(!cameraOriginal.has(c))cameraOriginal.set(c,props.map(k=>[k,c.style.getPropertyValue(k),c.style.getPropertyPriority(k)]));
  if(!cameraIcons[theme]){artwork?.remove();for(const [k,v,p] of cameraOriginal.get(c)){if(v)c.style.setProperty(k,v,p);else c.style.removeProperty(k)}continue}
  const palettes={shinchan:["#f1ce70","#d5a16d","#4a3729"],pokemon:["#f6d675","#bba260","#263855"],digimon:["#175b83","#4e9fbd","#fff"],marvel:["#882f41","#8d7c7d","#fff1e0"]};
  const [bg,edge,ink]=palettes[theme];
  if(!artwork){
   artwork=document.createElement("img");
   artwork.className="sarch-camera-art";
   artwork.alt="";
   artwork.setAttribute("aria-hidden","true");
   artwork.draggable=false;
   c.insertBefore(artwork,c.querySelector("span:last-child"));
  }
  artwork.src=cameraIcons[theme];
  artwork.style.cssText="position:absolute;top:3px;left:50%;transform:translateX(-50%);width:24px;height:18px;object-fit:contain;pointer-events:none;z-index:1;display:block";

  for(const [k,v] of Object.entries({"background-image":'url("'+cameraIcons[theme]+'")',"background-repeat":"no-repeat","background-size":"0 0","background-position":"center 3px","background-color":bg,"border-color":edge,"border-radius":"12px","color":ink,"font-size":"0px","position":"relative"}))c.style.setProperty(k,v,"important");
 }
}


// Original mascot illustrations, entirely inline and available offline.
const mascots={
 catcrew:{name:"고양이 조사단",fur:"#f5caa7",face:"#fff1db",edge:"#65493e",vest:"#6a9f93",hat:"#7eafa0",blush:"#e6a09b"},
 bearcrew:{name:"곰돌이 건축단",fur:"#bf9670",face:"#f7e0b9",edge:"#614634",vest:"#7e91bc",hat:"#9cadd1",blush:"#dd9a88"},
 penguincrew:{name:"펭귄 측정단",fur:"#506d86",face:"#f7f3e8",edge:"#30455d",vest:"#8ab9ce",hat:"#a5cce0",blush:"#f4a58e"}
};
let mascotSerial=0;
function mascotSVG(theme,i){
 const t=mascots[theme],e=t.edge,f=t.fur,w=t.face,h=t.hat,v=t.vest,id="crew"+(++mascotSerial);
 const fill=k=>"url(#"+id+k+")";
 const head=(x,y,scale,angle=0)=>{
  const ears=theme==="catcrew"?'<path d="M-44 -19L-49 -65L-12 -43M44 -19L49 -65L12 -43" fill="'+fill("fur")+'"/><path d="M-39 -34l-3 -21 18 14M39 -34l3 -21-18 14" fill="#e8aaa8" stroke="none"/>':theme==="bearcrew"?'<circle cx="-42" cy="-35" r="21" fill="'+fill("fur")+'"/><circle cx="42" cy="-35" r="21" fill="'+fill("fur")+'"/><circle cx="-42" cy="-35" r="12" fill="'+w+'"/><circle cx="42" cy="-35" r="12" fill="'+w+'"/>':'';
  const face=theme==="penguincrew"?'<path d="M0-18C-36-45-52-6-37 20Q-24 40 0 33Q25 40 38 20C52-6 36-45 0-18Z" fill="'+w+'" stroke="none"/><path d="M-12 8Q0 1 12 8L0 20Z" fill="#efaf55"/>':'<ellipse cy="17" rx="29" ry="20" fill="'+w+'" stroke="none"/><path d="M-7 9Q0 5 7 9L0 15Z" fill="'+e+'"/><path d="M0 15v6m0 0q-8 8-15 0m15 0q8 8 15 0" fill="none"/>';
  return '<g transform="translate('+x+' '+y+') rotate('+angle+') scale('+scale+')">'+ears+'<ellipse rx="54" ry="48" fill="'+fill("fur")+'"/>'+face+'<ellipse cx="-22" cy="-3" rx="5.5" ry="7" fill="'+e+'" stroke="none"/><ellipse cx="22" cy="-3" rx="5.5" ry="7" fill="'+e+'" stroke="none"/><circle cx="-20" cy="-5" r="1.9" fill="#fff" stroke="none"/><circle cx="24" cy="-5" r="1.9" fill="#fff" stroke="none"/><ellipse cx="-34" cy="14" rx="9" ry="5" fill="'+t.blush+'" stroke="none" opacity=".85"/><ellipse cx="34" cy="14" rx="9" ry="5" fill="'+t.blush+'" stroke="none" opacity=".85"/>'+(theme==="catcrew"?'<path d="M-47 13l-15-4m15 12l-15 3M47 13l15-4m-15 12l15 3" stroke-width="1.5" fill="none"/>':'')+'<path d="M-49 -30Q-47-66 0-67Q47-66 49-30L58-23Q0-14-58-23Z" fill="'+fill("hat")+'"/><path d="M-9-65L-6-37H6L9-65" fill="'+h+'"/><path d="M-42-41Q-29-60-16-60" stroke="#ffffff" stroke-width="4" opacity=".6" fill="none"/><path d="M-48-28Q0-20 48-28" fill="none" stroke="#fff" opacity=".65"/></g>';
 };
 const paw=(x,y,rx=10,ry=11)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill("fur")+'"/><path d="M'+(x-4)+' '+(y+4)+'l2 3m4-3l2 3" fill="none" opacity=".45"/>';
 const arm=(path)=>'<path d="'+path+'" fill="none" stroke="'+e+'" stroke-width="24"/><path d="'+path+'" fill="none" stroke="'+v+'" stroke-width="19"/><path d="'+path+'" fill="none" stroke="#fff" stroke-opacity=".23" stroke-width="3"/>';
 const body=(x,y,angle=0)=>'<g transform="translate('+x+' '+y+') rotate('+angle+')">'+(theme==="catcrew"?'<path d="M-35 31Q-78 41-67 4" fill="none" stroke="'+e+'" stroke-width="16"/><path d="M-35 31Q-78 41-67 4" fill="none" stroke="'+f+'" stroke-width="12"/>':'')+'<ellipse cy="3" rx="40" ry="45" fill="'+fill("vest")+'"/><path d="M-25-30L0-13 25-30M0-13V43M-34 13h68" stroke="#fff5d7" stroke-width="5" fill="none"/><rect x="-24" y="20" width="19" height="13" rx="2" fill="'+v+'"/><rect x="8" y="20" width="17" height="13" rx="2" fill="'+v+'"/><path d="M-20 43l-5 20M20 43l5 20" stroke="'+e+'" stroke-width="21"/><ellipse cx="-27" cy="66" rx="20" ry="10" fill="'+fill("fur")+'"/><ellipse cx="27" cy="66" rx="20" ry="10" fill="'+fill("fur")+'"/></g>';
 const camera='<g transform="translate(243 91)"><path d="M-28 7Q-38 50 5 58" fill="none" stroke="#625c5a" stroke-width="3"/><rect x="-34" y="-21" width="67" height="48" rx="8" fill="'+fill("metal")+'"/><path d="M-19-21l7-9h20l8 9" fill="#697987"/><rect x="-25" y="-12" width="11" height="7" rx="2" fill="#dce5e8"/><circle cx="4" cy="3" r="20" fill="#2b3b4b"/><circle cx="4" cy="3" r="14" fill="'+fill("glass")+'"/><circle cx="0" cy="-2" r="4" fill="#d3f5fc" stroke="none"/><rect x="22" y="-11" width="5" height="10" rx="2" fill="#aebdc6"/></g>';
 const wall='<g><path d="M278 19L359 5V222L278 235Z" fill="#b9c7c8"/><path d="M278 19L335 31V214L278 235Z" fill="'+fill("concrete")+'"/><path d="M335 31l24-26v217l-24-8" fill="#98adb1"/><path d="M307 49l-12 25 11 17-14 24 14 22-7 26" fill="none" stroke="#6b7478" stroke-width="2.5"/><path d="M284 43h42m-42 145h42" stroke="#fff" opacity=".5"/><g fill="#849697" opacity=".35" stroke="none">'+Array.from({length:17},(_,k)=>'<circle cx="'+(282+(k*17)%47)+'" cy="'+(31+(k*31)%177)+'" r="'+(1+k%2)+'"/>').join("")+'</g></g>';
 const desk='<g><path d="M33 176L265 151 347 185 114 220Z" fill="#c4a07c"/><path d="M33 176v13l81 43v-12m233-35v12l-233 35" fill="#a98060"/><path d="M49 193v34m281-26v26" stroke="#8f765f" stroke-width="9"/><path d="M105 178l132-17 70 25-139 23Z" fill="#fffdf2"/><g fill="none" stroke="#567d9d" stroke-width="2.5"><path d="M124 180l108-15 50 19-112 17Z"/><path d="M136 182l90-12 39 14-94 14Z M173 175l40 20M193 172l36 13 25-4M167 185l27-4"/></g><path d="M120 194l111-14" stroke="#f2cb6c" stroke-width="6"/><path d="M120 194l111-14" stroke="#9d8251" stroke-dasharray="1 7" stroke-width="2"/></g>';
 const instrument='<g><path d="M228 123l-37 102m37-102 42 102m-42-102-2 102" stroke="#64574b" stroke-width="8"/><path d="M228 127l-35 95m35-95 39 95m-39-95-2 95" stroke="#d2aa71" stroke-width="4"/><rect x="206" y="102" width="47" height="25" rx="5" fill="#526b70"/><path d="M211 98V70q0-17 17-17t17 17v28" fill="none" stroke="#ad895b" stroke-width="12"/><rect x="196" y="73" width="72" height="26" rx="8" fill="'+fill("metal")+'"/><ellipse cx="263" cy="86" rx="9" ry="12" fill="#314852"/><ellipse cx="264" cy="86" rx="5" ry="8" fill="'+fill("glass")+'"/><rect x="208" y="101" width="20" height="10" rx="2" fill="#b5e8d2"/><path d="M269 86L304 31" stroke="#d47970" stroke-width="1.7" stroke-dasharray="5 5" fill="none"/></g>';
 const scene=[
 '<g opacity=".75"><path d="M12 174V56l58-30 55 30v118M70 26v148" fill="#a8bbbd" stroke="#718f94"/><path d="M24 69h30v24H24m60-24h27v24H84M24 106h30v25H24m60-25h27v25H84" fill="#e8f5f1" stroke="#77989b"/><path d="M10 174h118" stroke="#718f94" stroke-width="3"/></g>'+wall+body(156,150,-8)+head(160,70,.89,9)+arm("M178 124Q206 141 217 104")+arm("M137 126Q163 151 207 116")+camera+paw(215,103)+paw(224,121)+'<path d="M278 92l-13-5m13 13l-15 2" stroke="#e9ab57" fill="none" stroke-width="2.5"/>',
 '<g opacity=".75"><path d="M15 29h129v81H15z" fill="#f9fbf4" stroke="#a9bdba"/><path d="M26 42h105v55H26zm52 0v35H26m52-12h53m-33 0v32" stroke="#7796ad" fill="none" stroke-width="2"/><path d="M15 115h129" stroke="#b5c0c2"/></g>'+body(153,139,12)+head(150,66,.9,13)+desk+arm("M176 112Q194 139 214 159")+paw(214,159,11,9)+'<path d="M218 155l37 32" stroke="#d9aa62" stroke-width="6"/><path d="M255 187l3 6-6-3" fill="#484746"/>'+arm("M125 117Q120 147 161 176")+paw(164,176,12,9),
 wall+body(139,150,-7)+head(140,69,.9,9)+arm("M166 118Q193 134 220 118")+arm("M114 120Q142 154 207 130")+'<g transform="translate(226 117)"><path d="M-31-9h70v18h-70z" fill="'+fill("metal")+'"/><rect x="-28" y="-7" width="13" height="14" rx="3" fill="#566675"/><rect x="-9" y="-6" width="24" height="12" rx="2" fill="#b4e6d2"/><path d="M-6-2H10" stroke="#48685e" stroke-width="1.5"/><path d="M39-6h10v12H39" fill="#acb3b5"/><path d="M49 0h5" stroke="#64757a" stroke-width="5"/></g>'+paw(213,127)+paw(243,125)+'<g transform="translate(37 189)"><rect width="44" height="28" rx="5" fill="#738f9a"/><rect x="6" y="5" width="29" height="12" rx="2" fill="#c6e9dd"/><path d="M8 21h27" stroke="#c0d1ce"/></g>',
 '<g><path d="M278 17l62 9v197l-62-4z" fill="#bccacc"/><path d="M340 26l17-13v202l-17 8" fill="#91a6aa"/><path d="M295 48h28v32h-28zm0 49h28v32h-28zm0 49h28v32h-28z" fill="#e1f2ef" stroke="#819fa4"/><path d="M278 15v207" stroke="#ac725c" stroke-dasharray="6 5" fill="none"/></g>'+body(127,151,8)+head(136,66,.85,12)+arm("M148 118Q168 99 199 87")+paw(199,87)+instrument+arm("M103 120Q129 149 188 129")+paw(188,129)
 ][i];
 return '<svg viewBox="0 0 365 238" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="'+id+'fur" x2=".85" y2="1"><stop stop-color="'+w+'"/><stop offset=".48" stop-color="'+f+'"/><stop offset="1" stop-color="'+e+'" stop-opacity=".88"/></linearGradient><linearGradient id="'+id+'vest" x2="1" y2="1"><stop stop-color="'+v+'"/><stop offset=".5" stop-color="'+v+'"/><stop offset="1" stop-color="'+e+'"/></linearGradient><linearGradient id="'+id+'hat" x2="0" y2="1"><stop stop-color="#fff7e2"/><stop offset=".5" stop-color="'+h+'"/><stop offset="1" stop-color="'+v+'"/></linearGradient><linearGradient id="'+id+'metal" x2=".6" y2="1"><stop stop-color="#c6d3db"/><stop offset=".5" stop-color="#8198a9"/><stop offset="1" stop-color="#4d6578"/></linearGradient><radialGradient id="'+id+'glass" cx=".35" cy=".3"><stop stop-color="#d1f7ee"/><stop offset=".45" stop-color="#80b7c9"/><stop offset="1" stop-color="#344f68"/></radialGradient><linearGradient id="'+id+'concrete" x2="1" y2=".3"><stop stop-color="#ecede5"/><stop offset="1" stop-color="#b1bdbb"/></linearGradient></defs><ellipse cx="185" cy="224" rx="172" ry="11" fill="'+e+'" opacity=".11"/><g stroke="'+e+'" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">'+scene+'</g></svg>';
}
function mascotScene(theme,i){
 const img=document.createElement("img");
 img.className="sarch-mascot-scene-v243";
 img.src=new URL("sarch-v243-"+theme+"-"+i+".webp",base).href;
 img.alt="";img.decoding="async";img.draggable=false;
 img.addEventListener("error",()=>{if(img.parentElement)img.parentElement.innerHTML=mascotSVG(theme,i)},{once:true});
 return img;
}
function paintMascot(theme){
 const mod=document.documentElement.dataset.module;
 if(mod==="home"){document.querySelectorAll(".modules .module").forEach((card,i)=>{if(i>=4)return;const d=document.createElement("span");d.className="sarch-theme-character sarch-mascot-card";d.setAttribute("aria-hidden","true");d.append(mascotScene(theme,i));card.append(d)})}
 else{const i=["survey","drawing","schmidt","tilt"].indexOf(mod);const head=document.querySelector(".smetric-app-header"),anchor=head?.querySelector(".sm43-header-audit,#smSurveyQualityButton,#smDrawingQualityButton,#qualityCheck,#audit");if(i>=0&&anchor){const d=document.createElement("span");d.className="sarch-theme-character sarch-theme-header-character sarch-mascot-header";d.setAttribute("aria-hidden","true");d.append(mascotScene(theme,i));anchor.append(d);headerArt=d;if(typeof ResizeObserver==="function"){headerObserver=new ResizeObserver(placeHeader);headerObserver.observe(head);headerObserver.observe(anchor)}requestAnimationFrame(placeHeader)}}
}

function apply(choice){
 const val=canonicalTheme(choice);
 currentChoice=val;
 const current=val;
 const b=document.body; b.dataset.theme=current;
 document.documentElement.dataset.sarchTheme=val;
 const global=document.getElementById("sarchGlobalTheme");if(global)global.value=val;
 if(cameraIcons[current])b.style.setProperty("--st-camera-icon",'url("'+cameraIcons[current]+'")');
 else b.style.removeProperty("--st-camera-icon");
 try{paintCamera(current)}catch(e){console.warn("S:ARCH theme camera",e)}
 // Legacy controls are retained for compatibility, but no longer exposed to users.
 for(const el of document.querySelectorAll("#themeSelect,#headerThemeProxy,#equipmentTheme,#theme")){
  for(const option of Array.from(el.options||[])){if(["pokemon","digimon","marvel"].includes(option.value)||hasOwn(mergedThemes,option.value))option.remove()}
  if(!Array.from(el.options||[]).some(x=>x.value===current))el.add(new Option(labels[current],current));
  el.value=current;
 }
 headerObserver?.disconnect();headerArt=null;
 document.querySelectorAll(".sarch-theme-character").forEach(el=>el.remove());
 if(mascots[current]){paintMascot(current);return}
 if(!images[current])return;
 const mod=document.documentElement.dataset.module;
 if(mod==="home"){
  document.querySelectorAll(".modules .module").forEach((card,i)=>{if(i<4)card.append(decoration(current,i))});
 }else{
  const i=["survey","drawing","schmidt","tilt"].indexOf(mod);
  const head=document.querySelector(".smetric-app-header"),anchor=head?.querySelector(".sm43-header-audit,#smSurveyQualityButton,#smDrawingQualityButton,#qualityCheck,#audit");
  if(i>=0&&anchor){
   const d=document.createElement("span");d.className="sarch-theme-character sarch-theme-header-character";d.setAttribute("aria-hidden","true");d.title=titles[current][i];
   d.append(artwork(images[current][i],"sarch-theme-header-art",current));anchor.appendChild(d);headerArt=d;
   headerObserver=new ResizeObserver(placeHeader);headerObserver.observe(head);headerObserver.observe(anchor);
   requestAnimationFrame(placeHeader);
  }
 }
}
function init(){
 const home=document.documentElement.dataset.module==="home";
 {
  const header=document.querySelector(home?".header":".smetric-app-header,.sm-topbar");
  if(header&&!document.getElementById("sarchGlobalTheme")){
   const wrap=document.createElement("label");wrap.className="sarch-global-picker";wrap.htmlFor="sarchGlobalTheme";
   const label=document.createElement("span");label.textContent="테마 선택";
   const sel=document.createElement("select");sel.id="sarchGlobalTheme";sel.setAttribute("aria-label","전체 화면 테마");
   for(const [key,name] of Object.entries(labels))sel.add(new Option(name,key));
   wrap.append(label,sel);(home?header:(header.querySelector(".smetric-head-controls")||header)).append(wrap);
   const choose=()=>{const value=canonicalTheme(sel.value);if(currentChoice===value)return;try{localStorage.setItem(KEY,value)}catch(e){}apply(value)};
   sel.addEventListener("input",choose);sel.addEventListener("change",choose);
  }
 }
 if(!home){
  for(const el of document.querySelectorAll("#themeSelect,#headerThemeProxy,#equipmentTheme,#theme")){const wrap=el.closest(".theme-picker")||el.closest("label")||el;wrap.hidden=true;wrap.classList.add("sarch-legacy-theme-hidden")}
 }
 apply(stored());
 new MutationObserver(()=>{if(currentChoice&&(document.body.dataset.theme!==currentChoice||document.documentElement.dataset.sarchTheme!==currentChoice)){document.body.dataset.theme=currentChoice;document.documentElement.dataset.sarchTheme=currentChoice}}).observe(document.body,{attributes:true,attributeFilter:["data-theme"]});
 // Legacy scripts can initialize once on load; the global selection always wins.
 window.addEventListener("load",()=>{apply(stored());setTimeout(()=>{try{paintCamera(currentChoice)}catch(e){console.warn(e)}},250)},{once:true});
 window.addEventListener("pageshow",()=>apply(stored()));
 window.addEventListener("resize",placeHeader,{passive:true});
 window.addEventListener("storage",e=>{if(e.key===KEY)apply(stored())});

}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();