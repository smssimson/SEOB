/* S:ARCH v212 — one composited scene per card, originals kept intact.
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
function texturedBuilding(c,theme){
 const [light,mid,dark,edge]=palette[theme];c.save();c.shadowColor="#010c18a6";c.shadowBlur=18;c.shadowOffsetY=9;
 const left=c.createLinearGradient(326,68,476,340);left.addColorStop(0,light);left.addColorStop(.5,mid);left.addColorStop(1,dark);
 const right=c.createLinearGradient(477,50,595,320);right.addColorStop(0,mid);right.addColorStop(1,dark);
 poly(c,[[331,104],[471,35],[471,343],[331,343]],left,edge,1.9);
 poly(c,[[471,35],[590,104],[590,343],[471,343]],right,edge,1.9);c.restore();
 c.save();
 const leftFace=[[331,104],[471,35],[471,343],[331,343]],rightFace=[[471,35],[590,104],[590,343],[471,343]];
 // Tactile, slightly speckled concrete: same geometry on Field and Tilt.
 let seed=241167;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
 for(const face of [leftFace,rightFace]){c.save();c.beginPath();face.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
 for(let j=0;j<340;j++){const x=330+rnd()*264,y=35+rnd()*310;c.fillStyle=j%3?"#f8f4e5":"#344858";c.globalAlpha=.035+rnd()*.08;c.fillRect(x,y,.4+rnd()*1.7,.4+rnd()*1.7)}
 c.restore()}
 c.globalAlpha=1;
 line(c,[[332,105],[471,36],[590,104]],"#f7e4bb",2.8);
 line(c,[[335,109],[471,43],[585,109]],"#ffffff66",1.2);
 line(c,[[471,36],[471,343]],"#f7d9a3",2.6);
 line(c,[[330,183],[471,123],[590,182]],"#e6e3d34e",2.2);
 line(c,[[330,259],[471,207],[590,263]],"#e6e3d34e",2.1);
 line(c,[[343,108],[343,341]],"#f1e6d333",1.2);
 line(c,[[580,112],[580,340]],"#394a5477",2);
 function windowShape(points){poly(c,points,"#293f4a",edge,1.4);const small=points.map(([x,y])=>[x+(x<471?3:-3),y+3]);poly(c,small,"#3f5b63",null);line(c,[[small[0][0]+3,small[0][1]+2],[small[1][0]-4,small[1][1]+2]],"#b4d4d655",1.2)}
 for(let row=0;row<3;row++){const d=row*72;
  windowShape([[350,137+d],[446,96+d],[446,126+d],[350,167+d]]);
  windowShape([[491,99+d],[569,139+d],[569,170+d],[491,130+d]]);
  line(c,[[398,115+d],[398,146+d]],edge+"88",1);
  line(c,[[529,119+d],[529,150+d]],edge+"88",1);
 }
 poly(c,[[352,341],[352,287],[443,251],[443,341]],"#35484f",edge,1.4);
 line(c,[[394,270],[394,341]],edge,1.2);line(c,[[354,302],[443,268]],"#e4d0a777",1.2);
 c.fillStyle="#172737";c.fillRect(324,342,274,3);c.restore();
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
 c.save();c.beginPath();
 if(theme==="shinchan"){
  // Character silhouette / dog / field case / cone are retained from the original.
  c.moveTo(0,311);c.lineTo(94,309);c.lineTo(102,261);c.lineTo(167,237);
  c.lineTo(183,242);c.lineTo(189,186);c.lineTo(216,151);c.lineTo(236,127);
  c.lineTo(278,109);c.lineTo(326,116);c.lineTo(355,140);c.lineTo(367,167);
  c.lineTo(413,174);c.lineTo(412,222);c.lineTo(385,238);c.lineTo(389,283);
  c.lineTo(440,284);c.lineTo(458,308);c.lineTo(600,307);c.lineTo(600,360);
  c.lineTo(0,360);
 }else{
  c.moveTo(0,312);c.lineTo(29,290);c.lineTo(87,275);c.lineTo(123,251);
  c.lineTo(154,215);c.lineTo(190,218);c.lineTo(208,184);c.lineTo(250,155);
  c.lineTo(280,124);c.lineTo(317,126);c.lineTo(341,152);c.lineTo(376,184);
  c.lineTo(376,272);c.lineTo(410,303);c.lineTo(600,306);c.lineTo(600,360);c.lineTo(0,360);
 }
 c.closePath();c.clip();redrawTile(c,img,0);c.restore();
}
function field(c,img,theme){
 c.fillStyle="#102235";c.fillRect(0,0,600,360);
 // Preserve lush foreground/trees; replace the old curtain-wall architecture.
 const g=c.createLinearGradient(215,0,365,0);g.addColorStop(0,"#10223500");g.addColorStop(1,"#102235");
 redrawTile(c,img,0);
 c.fillStyle=g;c.fillRect(215,0,385,333);
 texturedBuilding(c,theme);
 maskForeground(c,img,theme);
 drawCrack(c,theme);
}
function tilt(c,img,theme){
 c.fillStyle="#102235";c.fillRect(0,0,600,360);
 const ambient=c.createRadialGradient(345,288,20,350,293,305);
 ambient.addColorStop(0,"#6a8d8a33");ambient.addColorStop(1,"#11223500");
 c.fillStyle=ambient;c.fillRect(0,0,600,360);
 // A pixel-exact crop of the bottom-right atlas tile avoids top-right DRAW bleed.
 c.drawImage(img,600,360,600,360,9,53,353,295);
 texturedBuilding(c,theme);
 c.save();c.strokeStyle=palette[theme][3];c.lineWidth=1.4;c.setLineDash([5,5]);
 c.beginPath();c.moveTo(455,24);c.lineTo(455,345);c.stroke();c.setLineDash([]);
 line(c,[[471,36],[455,343]],palette[theme][3],1.6);
 c.restore();
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
 if(card.dataset.sarchSceneVersion===theme+"-212"&&card.querySelector(".sarch-v212-scene"))return;
 let wrap=card.querySelector(".sarch-v212-scene");
 if(!wrap){wrap=document.createElement("span");wrap.className="sarch-v212-scene";wrap.setAttribute("aria-hidden","true");card.append(wrap)}
 wrap.dataset.theme=theme;
 const canvas=document.createElement("canvas");canvas.width=600;canvas.height=360;canvas.className="sarch-v212-canvas";
 const c=canvas.getContext("2d",{alpha:true});
 if(i===0)field(c,source,theme);
 else if(i===3)tilt(c,source,theme);
 else redrawTile(c,source,i);
 const image=await actorImage(theme,i);
 if(document.body.dataset.theme!==theme||wrap.dataset.theme!==theme||!wrap.isConnected)return;
 wrap.replaceChildren(canvas);
 if(image){const el=document.createElement("img");el.className="sarch-v212-actor "+theme;el.alt="";el.draggable=false;el.src=image;wrap.append(el)}
 card.dataset.sarchSceneVersion=theme+"-212";card.classList.add("sarch-v212-ready");
 card.querySelectorAll(".sarch-theme-card-character,.sarch-v206-scene,.sarch-v211-scene").forEach(n=>n.remove());
}
let queued=false;
function repaint(){
 queued=false;
 const theme=document.body.dataset.theme;
 const cards=document.querySelectorAll(".modules .module");
 if(!themes.has(theme)){
  cards.forEach(card=>{card.querySelectorAll(".sarch-v212-scene").forEach(n=>n.remove());card.classList.remove("sarch-v212-ready");delete card.dataset.sarchSceneVersion});
  return;
 }
 if(document.documentElement.dataset.module==="home"){
  atlas(theme).then(img=>cards.forEach((card,i)=>{if(i<4)cardArt(card,theme,i,img).catch(console.warn)})).catch(console.warn);
 }else{
  // Interior theme chrome uses the established palette; no work-canvas decoration.
  document.querySelectorAll(".sarch-v212-interior").forEach(el=>el.remove());
  const head=document.querySelector("header.smetric-app-header");
  if(head){
   const d=document.createElement("span");d.className="sarch-v212-interior";d.setAttribute("aria-hidden","true");
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