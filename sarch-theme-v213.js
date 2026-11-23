/* S:ARCH v213 — one composited scene per card, originals kept intact.
   Canvas is only for home-page decorative art: never touches survey drawings or data. */
(()=>{"use strict";
const root=new URL(".",document.currentScript.src),themes=new Set(["shinchan","pokemon","digimon","marvel"]);
const palette={
 shinchan:["#d9c7a7","#9b9487","#707a78","#e9c979"],
 pokemon:["#c9c8ac","#8d9b8c","#718586","#edd47a"],
 digimon:["#a8bbc1","#6b8b9a","#486f81","#8cd8f5"],
 marvel:["#b5aba5","#888487","#56616b","#efaca7"]
};
const actors={
 digimon:["sarch-theme-digimon-0.png","sarch-theme-digimon-1.png","sarch-theme-digimon-2.png","sarch-theme-digimon-3.png"],
 marvel:["sarch-theme-marvel-0.jpg","sarch-theme-marvel-1.jpg","sarch-theme-marvel-2.jpg","sarch-theme-marvel-3.jpg"]
};
const names=["FIELD","DRAW","TEST","TILT"],atlasCache=new Map(),actorCache=new Map();
function load(src){return new Promise((res,rej)=>{const im=new Image();im.decoding="async";im.onload=()=>res(im);im.onerror=()=>rej(new Error(src));im.src=new URL(src,root).href})}
function atlas(theme){if(!atlasCache.has(theme))atlasCache.set(theme,load("sarch-v204-"+theme+"-atlas.webp"));return atlasCache.get(theme)}
function poly(c,p,fill,stroke,line=1){c.beginPath();p.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.lineWidth=line;c.strokeStyle=stroke;c.stroke()}}
function line(c,p,color,w=1){c.beginPath();p.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=w;c.stroke()}
function texturedBuilding(c,theme,lean=0){
 // The same three-storey reinforced-concrete building appears on FIELD/TILT.
 // TILT applies a small geometric top displacement, never a second overlaid building.
 const p=palette[theme], edge=p[3], top=[471+lean,35],bottom=[471,342];
 c.save();
 c.transform(1,0,-lean/307,1,lean*342/307,0);
 const left=c.createLinearGradient(330,82,466,342);
 left.addColorStop(0,"#c0beb2");left.addColorStop(.3,"#aaa99f");
 left.addColorStop(.7,"#858b88");left.addColorStop(1,"#646e70");
 const right=c.createLinearGradient(480,80,589,344);
 right.addColorStop(0,"#a7aaa2");right.addColorStop(.53,"#848c89");right.addColorStop(1,"#5e696d");
 c.save();c.shadowColor="#06101bba";c.shadowBlur=19;c.shadowOffsetX=1;c.shadowOffsetY=8;
 poly(c,[[329,102],[471,35],[471,342],[329,342]],left,edge,2);
 poly(c,[[471,35],[592,101],[592,342],[471,342]],right,edge,2);
 c.restore();
 // Concrete cast and formwork: tie holes, tiny exposed aggregate and slab joints.
 let seed=382914;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
 for(const face of [
  [[330,103],[470,36],[470,341],[330,341]],
  [[472,36],[591,102],[591,341],[472,341]]
 ]){
  c.save();c.beginPath();face.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
  for(let i=0;i<1650;i++){
   let x=328+rnd()*267,y=39+rnd()*310;
   c.globalAlpha=.018+rnd()*.087;
   c.fillStyle=i%5?"#f4eddf":"#263d43";
   const sz=.35+rnd()*1.75;c.fillRect(x,y,sz,sz*(.35+rnd()));
  }
  c.globalAlpha=1;c.restore();
 }
 // Thick exposed RC slabs, exterior columns and vertical form seams.
 line(c,[[330,102],[471,36],[590,102]],"#ede1c9",3);
 line(c,[[334,108],[470,44],[588,110]],"#ffffff65",1.3);
 for(const y of [173,247]){
   line(c,[[330,y],[471,y-52],[592,y]],"#47565c85",5);
   line(c,[[330,y-3],[471,y-55],[592,y-3]],"#e2d7c06e",2.4);
 }
 line(c,[[345,97],[345,341]],"#d1cbb25c",6);
 line(c,[[450,47],[450,341]],"#37494c48",4);
 line(c,[[481,44],[481,342]],"#d7d0bb66",5);
 line(c,[[578,97],[578,340]],"#303e4d66",5);
 line(c,[[471,36],[471,342]],"#f6dec1",2.2);
 // Raw-concrete panel seams, not horizontal glass curtain wall.
 for(const [a,b] of [
  [[352,126],[450,81]],[[352,211],[450,170]],[[353,291],[450,259]],
  [[489,90],[577,141]],[[490,179],[578,222]],[[490,265],[578,300]]
 ])line(c,[a,b],"#45555a28",1);
 // Recessed, compact single windows: mostly solid concrete wall.
 function recess(points){
  c.save();c.shadowColor="#182e39b0";c.shadowBlur=5;c.shadowOffsetY=2;
  poly(c,points,"#233b44","#d2c6ac",1.55);c.restore();
  c.save();c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
  const glaze=c.createLinearGradient(points[0][0],points[0][1],points[2][0],points[2][1]);
  glaze.addColorStop(0,"#536b72");glaze.addColorStop(.5,"#304d59");glaze.addColorStop(1,"#1c3541");
  c.fillStyle=glaze;c.fillRect(345,35,240,310);
  line(c,[[points[0][0]+4,points[0][1]+3],[points[1][0]-3,points[1][1]+3]],"#cbd7d455",1.3);
  c.restore();
 }
 for(let i=0;i<3;i++){
  const y=i*75;
  recess([[366,141+y],[421,118+y],[421,140+y],[366,163+y]]);
  recess([[500,119+y],[546,144+y],[546,166+y],[500,141+y]]);
  line(c,[[392,130+y],[392,153+y]],"#b3c0b633",.8);
 }
 // Repeated form-tie holes, pores and discoloration.
 c.fillStyle="#46565882";
 for(const y of [117,160,190,224,264,302,331]){
  for(const x of [342,438,482,569]){
   c.beginPath();c.ellipse(x,y,2,1.65,0,0,Math.PI*2);c.fill();
   c.fillStyle="#e3dccc64";c.fillRect(x+1,y+2,2,1);c.fillStyle="#46565882";
  }
 }
 // A few age-related wall stains/incipient hairline cracks, deliberately restrained.
 c.save();c.globalAlpha=.28;
 line(c,[[430,193],[424,202],[430,209],[426,216],[434,220]],"#38464a",1.2);
 line(c,[[568,266],[561,273],[566,282],[563,291]],"#38464a",1);
 c.restore();
 const stain=c.createLinearGradient(472,255,472,340);
 stain.addColorStop(0,"#2a373700");stain.addColorStop(1,"#30423a4b");
 c.fillStyle=stain;c.fillRect(472,257,105,84);
 // Recessed main entry, RC lintel and sill.
 poly(c,[[356,341],[356,298],[434,268],[434,341]],"#354750","#d7caaa",1.4);
 poly(c,[[363,341],[363,304],[428,280],[428,341]],"#1f323d","#817f73",1);
 line(c,[[397,292],[397,340]],"#baa88e",1.2);
 line(c,[[349,298],[439,264]],"#e1d8bf",3);
 line(c,[[327,342],[599,342]],"#d7c6a37d",1.7);
 c.restore();
 return {bottom,top,plumb:[471,35]};
}
function drawCrack(c,theme){
 const edge=palette[theme][3];
 c.save();c.shadowColor="#020f1e88";c.shadowBlur=9;c.shadowOffsetY=4;
 c.fillStyle="#142738";c.strokeStyle=edge;c.lineWidth=2;
 c.beginPath();c.roundRect(484,125,94,78,9);c.fill();c.stroke();c.restore();
 c.save();c.beginPath();c.roundRect(491,133,80,63,4);c.clip();
 const g=c.createLinearGradient(495,130,562,200);g.addColorStop(0,"#b7ada0");g.addColorStop(1,"#686b69");
 c.fillStyle=g;c.fillRect(490,132,84,70);
 c.strokeStyle="#2c3c40";c.lineWidth=3;c.beginPath();c.moveTo(498,144);c.lineTo(526,155);c.lineTo(519,168);c.lineTo(545,178);c.lineTo(534,196);c.stroke();
 c.restore();c.strokeStyle="#f2d67c";c.lineWidth=3;c.beginPath();
 for(const [x,y,dx,dy] of [[489,130,13,0],[489,130,0,13],[572,130,-13,0],[572,130,0,13],[489,197,13,0],[489,197,0,-13],[572,197,-13,0],[572,197,0,-13]]){c.moveTo(x+dx,y+dy);c.lineTo(x,y)}
 c.stroke();
}
function redrawTile(c,img,idx){c.drawImage(img,idx%2*600,Math.floor(idx/2)*360,600,360,0,0,600,360)}
function maskForeground(c,img,theme){
 // Preserve foreground workers, safety cone, case and dog without the old
 // curtain-wall tower that was part of the same atlas tile.
 c.save();c.beginPath();
 if(theme==="shinchan"){
  const parts=[
   [[65,355],[72,279],[108,253],[143,257],[166,282],[171,354]],
   [[173,354],[177,263],[187,201],[209,166],[232,126],[272,111],[315,126],[349,166],[381,192],[391,222],[375,250],[397,271],[396,354]],
   [[344,355],[340,279],[438,279],[451,356]],
   [[451,357],[451,296],[482,258],[508,296],[517,356]],
   [[0,356],[0,340],[600,340],[600,356]]
  ];
  for(const polyPts of parts){polyPts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath()}
 }else{
  const parts=[
   [[0,357],[0,304],[90,278],[137,243],[183,245],[206,199],[244,155],[276,119],[314,121],[356,171],[370,225],[386,282],[430,352],[430,360]],
   [[0,357],[0,336],[600,336],[600,360]]
  ];
  for(const polyPts of parts){polyPts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath()}
 }
 c.clip();redrawTile(c,img,0);c.restore();
}
function field(c,img,theme){
 c.fillStyle="#102235";c.fillRect(0,0,600,360);
 // Foliage and ambient light are continuous; there is no photo rectangle.
 const haze=c.createRadialGradient(195,260,15,225,275,285);
 haze.addColorStop(0,theme==="marvel"?"#ad66783f":theme==="digimon"?"#478ba84c":"#a8a56e38");
 haze.addColorStop(1,"#10223500");
 c.fillStyle=haze;c.fillRect(0,0,600,360);
 // Preserve only clouds and left-side vegetation from the source background.
 if(theme==="shinchan"||theme==="pokemon"){
  c.save();c.beginPath();c.rect(0,0,183,354);c.clip();redrawTile(c,img,0);c.restore();
 }
 texturedBuilding(c,theme,0);
 if(theme==="shinchan"||theme==="pokemon")maskForeground(c,img,theme);
 else{
  c.save();c.strokeStyle=palette[theme][3]+"33";c.lineWidth=1.2;
  for(let x=70;x<315;x+=37){c.beginPath();c.moveTo(x,295);c.lineTo(x,349);c.stroke()}
  c.restore();
 }
 drawCrack(c,theme);
}
function crewLayer(c,img){
 // Fade the original transparent survey scene at all edges instead of
 // displaying a hard rectangular cut-out on the navy card background.
 const off=document.createElement("canvas");off.width=600;off.height=360;
 const g=off.getContext("2d");
 g.drawImage(img,600,360,600,360,0,0,600,360);
 g.globalCompositeOperation="destination-in";
 let fade=g.createLinearGradient(0,0,600,0);
 fade.addColorStop(0,"#0000");fade.addColorStop(.10,"#000");
 fade.addColorStop(.73,"#000");fade.addColorStop(1,"#0000");
 g.fillStyle=fade;g.fillRect(0,0,600,360);
 fade=g.createLinearGradient(0,0,0,360);
 fade.addColorStop(0,"#0000");fade.addColorStop(.16,"#000");
 fade.addColorStop(.89,"#000");fade.addColorStop(1,"#000f");
 g.fillStyle=fade;g.fillRect(0,0,600,360);
 g.globalCompositeOperation="source-over";
 c.drawImage(off,7,28,361,323);
}
function showDisplacement(c,theme,edge){
 // The survey is anchored at the very lowest structural corner B.
 // Dashed vertical = plumb line from B; solid = actual B→top corner.
 // Δ at the roof is the horizontal top movement, not an invented mm value.
 const B=edge.bottom,P=edge.plumb,T=edge.top,col=palette[theme][3];
 c.save();c.lineCap="round";c.lineJoin="round";
 c.shadowColor=col+"88";c.shadowBlur=4;
 c.strokeStyle="#f3efe0";c.globalAlpha=.86;c.lineWidth=2.2;
 c.setLineDash([6,5]);
 c.beginPath();c.moveTo(B[0],B[1]);c.lineTo(P[0],P[1]);c.stroke();
 c.setLineDash([]);c.globalAlpha=1;c.strokeStyle=col;c.lineWidth=3;
 c.beginPath();c.moveTo(B[0],B[1]);c.lineTo(T[0],T[1]);c.stroke();
 c.fillStyle="#132d3a";c.strokeStyle="#f5d59d";c.lineWidth=2;
 c.beginPath();c.arc(B[0],B[1],5.4,0,Math.PI*2);c.fill();c.stroke();
 c.beginPath();c.arc(T[0],T[1],3,0,Math.PI*2);c.fill();c.stroke();
 // Roof horizontal displacement between theoretical vertical and displaced corner.
 const y=25,cx=P[0],tx=T[0];
 c.strokeStyle="#f4ddaa";c.lineWidth=1.5;c.shadowBlur=0;
 line(c,[[cx,y],[tx,y]],"#f4ddaa",1.5);
 line(c,[[cx,y-5],[cx,y+6]],"#f4ddaa",1);
 line(c,[[tx,y-5],[tx,y+6]],"#f4ddaa",1);
 line(c,[[cx+4,y-3],[cx,y],[cx+4,y+3]],"#f4ddaa",1.1);
 line(c,[[tx-4,y-3],[tx,y],[tx-4,y+3]],"#f4ddaa",1.1);
 c.fillStyle="#fff1c8";c.font="bold 11px Dotum, sans-serif";
 c.fillText("Δ",tx+6,y+4);
 c.restore();
}
function tilt(c,img,theme){
 c.fillStyle="#102235";c.fillRect(0,0,600,360);
 let ambient=c.createRadialGradient(244,235,20,305,263,360);
 ambient.addColorStop(0,theme==="marvel"?"#ad626047":"#5d9d994d");
 ambient.addColorStop(.7,"#4f708125");ambient.addColorStop(1,"#10223500");
 c.fillStyle=ambient;c.fillRect(0,0,600,360);
 // Field engineering ambience without hard horizon or old photo edges.
 c.save();c.strokeStyle=palette[theme][3]+"25";c.lineWidth=1.3;
 line(c,[[3,340],[600,340]],palette[theme][3]+"44",1.2);
 for(const [x,y] of [[65,280],[102,270],[145,286],[178,254],[212,273]]){
  line(c,[[x-12,y],[x,y-5],[x+10,y]],palette[theme][3]+"29",1);
 }
 c.restore();
 if(theme==="shinchan"||theme==="pokemon")crewLayer(c,img);
 const geometry=texturedBuilding(c,theme,16);
 showDisplacement(c,theme,geometry);
}
function actorImage(theme,i){
 const path=actors[theme]?.[i];if(!path)return Promise.resolve(null);
 const key=theme+i;
 if(!actorCache.has(key))actorCache.set(key,load(path).then(img=>{
  if(theme!=="digimon")return new URL(path,root).href;
  const c=document.createElement("canvas");c.width=img.width;c.height=img.height;
  const ctx=c.getContext("2d",{willReadFrequently:true});ctx.drawImage(img,0,0);
  const d=ctx.getImageData(0,0,c.width,c.height),a=d.data,w=c.width,h=c.height,v=new Uint8Array(w*h),q=new Int32Array(w*h);let first=0,last=0;
  function visit(k){if(k<0||k>=w*h||v[k])return;v[k]=1;const j=k*4;if(a[j+3]<20||(a[j]>230&&a[j+1]>230&&a[j+2]>230)){a[j+3]=0;q[last++]=k}}
  for(let x=0;x<w;x++){visit(x);visit((h-1)*w+x)}
  for(let y=0;y<h;y++){visit(y*w);visit(y*w+w-1)}
  while(first<last){let k=q[first++];if(k%w)visit(k-1);if(k%w<w-1)visit(k+1);if(k>=w)visit(k-w);if(k<(h-1)*w)visit(k+w)}
  ctx.putImageData(d,0,0);return c.toDataURL("image/png");
 }).catch(()=>null));
 return actorCache.get(key);
}
async function cardArt(card,theme,i,source){
 if(card.dataset.sarchSceneVersion===theme+"-212"&&card.querySelector(".sarch-v213-scene")){
  card.querySelectorAll(".sarch-theme-card-character,.sarch-v206-scene").forEach(el=>el.remove());
  return;
 }
 let wrap=card.querySelector(".sarch-v213-scene");
 if(!wrap){wrap=document.createElement("span");wrap.className="sarch-v213-scene";wrap.setAttribute("aria-hidden","true");card.append(wrap)}
 wrap.dataset.theme=theme;
 const canvas=document.createElement("canvas");canvas.width=600;canvas.height=360;canvas.className="sarch-v213-canvas";
 const c=canvas.getContext("2d",{alpha:true});
 if(i===0)field(c,source,theme);
 else if(i===3)tilt(c,source,theme);
 else redrawTile(c,source,i);
 const image=await actorImage(theme,i);
 if(document.body.dataset.theme!==theme||wrap.dataset.theme!==theme||!wrap.isConnected)return;
 wrap.replaceChildren(canvas);
 if(image){const el=document.createElement("img");el.className="sarch-v213-actor "+theme;el.alt="";el.draggable=false;el.src=image;wrap.append(el)}
 card.dataset.sarchSceneVersion=theme+"-212";card.classList.add("sarch-v213-ready");
 card.querySelectorAll(".sarch-theme-card-character,.sarch-v206-scene,.sarch-v211-scene").forEach(n=>n.remove());
}
let queued=false;
function repaint(){
 queued=false;
 const theme=document.body.dataset.theme;
 const cards=document.querySelectorAll(".modules .module");
 if(!themes.has(theme)){
  document.body.style.removeProperty("--sa213-icon");
  document.querySelectorAll("[data-sarch213-pin]").forEach(btn=>delete btn.dataset.sarch213Pin);
  document.querySelectorAll(".sarch-v213-interior").forEach(el=>el.remove());
  cards.forEach(card=>{card.querySelectorAll(".sarch-v213-scene").forEach(n=>n.remove());card.classList.remove("sarch-v213-ready");delete card.dataset.sarchSceneVersion});
  return;
 }
 if(document.documentElement.dataset.module==="home"){
  atlas(theme).then(img=>cards.forEach((card,i)=>{if(i<4)cardArt(card,theme,i,img).catch(console.warn)})).catch(console.warn);
 }else{
  // Interior theme chrome uses the established palette; no work-canvas decoration.
  document.querySelectorAll(".sarch-v213-interior").forEach(el=>el.remove());
  document.body.style.setProperty("--sa213-icon",'url("'+new URL("sarch-theme-"+(theme==="shinchan"?"shinchan-0.webp":theme==="pokemon"?"pokemon-0.png":theme==="digimon"?"digimon-0.png":"marvel-0.jpg"),root).href+'")');
  const re=/홈|저장|누락 점검|도면 순서|현장 스케치|번호 찍기|자료 보호|장비조사|기울기|도면 작성|사진 관리/;
  document.querySelectorAll("button").forEach(btn=>{
   if(btn.id==="cameraBtn"||btn.id==="sm52FixedCamera"||btn.classList.contains("sarch-camera-tab-v145"))return;
   const label=(btn.textContent||"").trim();
   if(label.length<28&&re.test(label))btn.dataset.sarch213Pin="1";else delete btn.dataset.sarch213Pin;
  });
  const head=document.querySelector("header.smetric-app-header");
  if(head){
   const d=document.createElement("span");d.className="sarch-v213-interior";d.setAttribute("aria-hidden","true");
   d.style.backgroundImage='url("'+new URL("sarch-v204-"+theme+"-atlas.webp",root).href+'")';
   d.style.backgroundPosition=["0% 0%","100% 0%","0% 100%","100% 100%"][["survey","drawing","schmidt","tilt"].indexOf(document.documentElement.dataset.module)]||"0% 0%";
   head.append(d);
  }
 }
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(repaint)}}
function init(){
 schedule();
 new MutationObserver(records=>{
  if(records.some(r=>r.type==="attributes"&&r.target===document.body&&r.attributeName==="data-theme"
   ||r.type==="childList"&&[...r.addedNodes].some(n=>n.nodeType===1&&n.matches?.(".sarch-v206-scene,.sarch-theme-card-character"))))schedule();
 }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["data-theme"]});
 window.addEventListener("pageshow",schedule);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();