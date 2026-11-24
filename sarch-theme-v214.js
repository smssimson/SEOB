/* S:ARCH v214 — one composited scene per card, originals kept intact.
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
 // 1~3세대만 사용: 피카츄(1), 브케인(2), 물짱이(3), 꼬부기(1).
 pokemon:['sarch-theme-pokemon-0.png','sarch-theme-pokemon-1.png','sarch-theme-pokemon-5.png','sarch-totodile-158.png'],
 digimon:["sarch-theme-digimon-0.png","sarch-theme-digimon-1.png","sarch-theme-digimon-2.png","sarch-theme-digimon-3.png"],
 marvel:["sarch-theme-marvel-0.jpg","sarch-theme-marvel-1.jpg","sarch-theme-marvel-2.jpg","sarch-theme-marvel-3.jpg"]
};
const atlasCache=new Map(),actorCache=new Map();
function load(src){return new Promise((res,rej)=>{const im=new Image();im.decoding="async";im.onload=()=>res(im);im.onerror=()=>rej(new Error(src));im.src=new URL(src,root).href})}
function atlas(theme){if(!atlasCache.has(theme))atlasCache.set(theme,load(theme==="pokemon"?"sarch-v214-pokemon-background.webp":"sarch-v204-"+theme+"-atlas.webp"));return atlasCache.get(theme)}
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
function maskForeground(c,img){
 // Preserve foreground workers, safety cone, case and dog without the old
 // curtain-wall tower that was part of the same atlas tile.
 c.save();c.beginPath();
 const parts=[
   [[65,355],[72,279],[108,253],[143,257],[166,282],[171,354]],
   [[173,354],[177,263],[187,201],[209,166],[232,126],[272,111],[315,126],[349,166],[381,192],[391,222],[375,250],[397,271],[396,354]],
   [[344,355],[340,279],[438,279],[451,356]],
   [[451,357],[451,296],[482,258],[508,296],[517,356]],
   [[0,356],[0,340],[600,340],[600,356]]
  ];
  for(const polyPts of parts){polyPts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath()}
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
 if(theme==="shinchan"){
  c.save();c.beginPath();c.rect(0,0,183,354);c.clip();redrawTile(c,img,0);c.restore();
 }
 texturedBuilding(c,theme,0);
 if(theme==="shinchan")maskForeground(c,img);
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
 c.drawImage(off,16,91,430,258);
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
 // Light and ground markings connect the operator and the concrete corner.
 const floor=c.createLinearGradient(0,260,0,360);
 floor.addColorStop(0,"#10223500");
 floor.addColorStop(1,theme==="shinchan"?"#977d494b":palette[theme][2]+"99");
 c.fillStyle=floor;
 c.fillRect(0,260,600,100);
 for (let x=80;x<705;x+=58) line(c,[[384,274],[x,359]],palette[theme][3]+"20");
 for(const [x,y] of [[65,280],[102,270],[145,286],[178,254],[212,273]]){
  line(c,[[x-12,y],[x,y-5],[x+10,y]],palette[theme][3]+"29",1);
 }
 c.restore();
 if(theme==="shinchan")crewLayer(c,img);
 c.save();
 c.translate(85,65);
 c.scale(.84,.84);
 const geometry=texturedBuilding(c,theme,16);
 showDisplacement(c,theme,geometry);
 c.restore();
}

function inspectionScene(c, theme, index, source) {
 if (index === 0) field(c, source, theme);
 else if (index === 3) tilt(c, source, theme);
 else {
  const ground = c.createLinearGradient(0, 0, 600, 360);
  ground.addColorStop(0, "#102235");
  ground.addColorStop(1, {pokemon:"#504e43",digimon:"#164963",marvel:"#563443"}[theme]);
  c.fillStyle = ground;
  c.fillRect(0, 0, 600, 360);
  const lamp=c.createRadialGradient(365,146,10,365,146,260);
  lamp.addColorStop(0,palette[theme][3]+"54");
  lamp.addColorStop(1,palette[theme][3]+"00");
  c.fillStyle=lamp;
  c.fillRect(92,0,508,360);
  for (let x = 210; x < 600; x += 36) line(c, [[x, 35], [x, 342]], "#e2edf015");
  for (let y = 54; y < 342; y += 36) line(c, [[190, y], [596, y]], "#e2edf015");
 }

 const accent = palette[theme][3];
 c.save();
 c.lineJoin = "round";
 c.lineCap = "round";
 c.fillStyle = "#09192688";
 c.beginPath();
 c.ellipse(157, 339, 120, 12, 0, 0, Math.PI * 2);
 c.fill();

 if (index === 0) {
  // The field log points to the crack detail on the building.
  poly(c, [[212, 253], [294, 238], [312, 305], [225, 324]], "#675744", accent, 3);
  poly(c, [[220, 257], [289, 244], [303, 299], [231, 314]], "#e3dcc7", "#a18e72", 2);
  line(c, [[241, 270], [278, 262]], "#455a60", 3);
  line(c, [[244, 283], [283, 275]], "#455a60", 3);
  line(c, [[247, 295], [268, 291]], "#455a60", 3);
  line(c, [[299, 247], [347, 219], [404, 219], [483, 169]], accent, 2);
 } else if (index === 1) {
  // A drafting surface with a floor plan, dimensions and straightedge.
  poly(c, [[214, 121], [534, 100], [578, 307], [204, 329]], "#102e44", accent, 3);
  poly(c, [[234, 142], [516, 123], [546, 284], [226, 303]], "#214e68", "#9bd1db", 2);
  line(c, [[258, 165], [487, 151], [511, 258], [253, 276], [258, 165]], "#def6e9", 5);
  line(c, [[366, 159], [370, 205], [498, 197]], "#def6e9", 4);
  line(c, [[373, 228], [377, 266]], "#def6e9", 4);
  line(c, [[257, 227], [320, 222], [320, 270]], "#def6e9", 4);
  line(c, [[271, 291], [499, 275]], accent, 2);
  line(c, [[271, 285], [271, 297]], accent, 2);
  line(c, [[499, 269], [499, 281]], accent, 2);
  poly(c, [[207, 286], [325, 253], [331, 270], [213, 303]], "#e3b76e", "#fff1b9", 1.5);
  for (let x = 221; x < 322; x += 14) {
   const y = 282 - (x - 221) * .28;
   line(c, [[x, y], [x + 2, y + 6]], "#745638", 1.5);
  }
 } else if (index === 2) {
  // A rebound hammer is shown against a concrete test surface.
  poly(c, [[406, 109], [537, 89], [574, 114], [439, 139]], "#c9c6b6", accent, 2);
  poly(c, [[406, 109], [439, 139], [439, 306], [406, 281]], "#738181", "#aeb4aa", 2);
  poly(c, [[439, 139], [574, 114], [574, 281], [439, 306]], "#a5aaa1", "#d1d2bc", 2);
  for (let x = 459; x < 565; x += 23) {
   for (let y = 163; y < 280; y += 23) {
    c.fillStyle = "#5a6c6b";
    c.fillRect(x, y - (x - 459) * .18, 3, 3);
   }
  }
  poly(c, [[231, 275], [330, 258], [354, 313], [250, 332]], "#284351", accent, 2);
  line(c, [[254, 286], [318, 275]], "#b4d7dc", 2);
  line(c, [[258, 296], [323, 285]], "#b4d7dc", 2);
 } else {
  // The instrument sights the shared base point of the building corner.
  c.setLineDash([5, 7]);
  line(c, [[296, 208], [481, 352]], accent, 2);
  c.setLineDash([]);
  for (const x of [235, 279, 322]) {
   line(c, [[276, 227], [x, 339]], "#a77d4e", 7);
   line(c, [[276, 227], [x, 339]], "#e2c492", 3);
  }
  poly(c, [[251, 191], [296, 188], [302, 222], [252, 228]], "#cfa451", "#f8df9e", 2);
  poly(c, [[263, 196], [286, 194], [288, 211], [264, 215]], "#254b5a", accent, 2);
 }
 c.restore();
}


function drawWorkForeground(c,theme,index){
 const accent=palette[theme][3];
 c.save();
 c.lineJoin="round";
 c.lineCap="round";
 c.shadowColor="#050f1caa";
 c.shadowBlur=9;
 c.shadowOffsetY=4;
 if(index===0){
  // Camera sits across the character's foreground and sights the wall.
  poly(c,[[137,220],[163,220],[172,209],[203,209],[212,221],[239,221],[239,264],[137,264]],"#253c48",accent,2);
  c.beginPath();c.arc(215,243,16,0,Math.PI*2);c.fillStyle="#142639";c.fill();c.strokeStyle=accent;c.lineWidth=2;c.stroke();
  c.beginPath();c.arc(216,242,8,0,Math.PI*2);c.fillStyle="#7ab3c4";c.fill();
  line(c,[[233,240],[329,199],[476,175]],accent+"88",2);
 }else if(index===1){
  // Lower work surface obscures the portrait edge, as an operator at a desk.
  poly(c,[[76,304],[270,275],[401,319],[378,358],[68,358]],"#513e37",accent,2);
  poly(c,[[114,307],[266,285],[339,318],[171,340]],"#f0e0b6","#9e8969",2);
  line(c,[[147,309],[257,293],[304,316],[181,331],[147,309]],"#3e6268",2);
  line(c,[[206,302],[242,323],[251,305]],"#3e6268",2);
  line(c,[[156,272],[202,315]],"#2d3031",8);
  line(c,[[156,272],[199,312]],accent,4);
 }else if(index===2){
  // The handle crosses the operator silhouette and contacts the concrete.
  line(c,[[151,274],[439,216]],"#142c39",17);
  line(c,[[156,272],[397,224]],"#c89753",11);
  line(c,[[163,269],[229,256]],"#f0d39a",3);
  line(c,[[399,224],[439,216]],"#e4ecdf",5);
  poly(c,[[143,270],[179,262],[190,293],[159,300]],"#314e59",accent,2);
 }else{
  // Record book in front of the operator ties the crew to the tripod.
  poly(c,[[150,268],[212,249],[236,309],[168,328]],"#685041",accent,2);
  poly(c,[[158,270],[207,255],[228,305],[172,321]],"#eeddb9","#a98b68",2);
  line(c,[[170,280],[206,269]],"#536b70",2);
  line(c,[[176,292],[212,281]],"#536b70",2);
  line(c,[[181,304],[215,294]],"#536b70",2);
 }
 c.restore();
}

function actorImage(theme,i){
 const path=actors[theme]?.[i];if(!path)return Promise.resolve(null);
 const key=theme+i;
 if(!actorCache.has(key))actorCache.set(key,load(path).then(img=>{
  if(theme!=="digimon"&&theme!=="pokemon")return new URL(path,root).href;
  const c=document.createElement("canvas");c.width=img.width;c.height=img.height;
  const ctx=c.getContext("2d",{willReadFrequently:true});ctx.drawImage(img,0,0);
  const d=ctx.getImageData(0,0,c.width,c.height),a=d.data,w=c.width,h=c.height,v=new Uint8Array(w*h),q=new Int32Array(w*h);let first=0,last=0;
  function visit(k){if(k<0||k>=w*h||v[k])return;v[k]=1;const j=k*4;if(a[j+3]<20||(a[j]>232&&a[j+1]>232&&a[j+2]>232)||(theme==="pokemon"&&a[j]<22&&a[j+1]<22&&a[j+2]<22)){a[j+3]=0;q[last++]=k}}
  for(let x=0;x<w;x++){visit(x);visit((h-1)*w+x)}
  for(let y=0;y<h;y++){visit(y*w);visit(y*w+w-1)}
  if(theme==="pokemon"){
   // Transparent backgrounds are handled first. Black/white studio backdrops in
   // older Generation 1–3 sprites are removed by border-connected flood fill.
   for(const t of [.04,.07,.92,.96]){
    for(let x=0;x<w;x+=Math.max(1,Math.floor(w/32))){visit(Math.min(h-1,Math.floor(h*t))*w+x)}
    for(let y=0;y<h;y+=Math.max(1,Math.floor(h/32))){visit(y*w+Math.min(w-1,Math.floor(w*t)))}
   }
  }
  while(first<last){let k=q[first++];if(k%w)visit(k-1);if(k%w<w-1)visit(k+1);if(k>=w)visit(k-w);if(k<(h-1)*w)visit(k+w)}
  ctx.putImageData(d,0,0);return c.toDataURL("image/png");
 }).catch(()=>null));
 return actorCache.get(key);
}

/* v223: Full-body, task-specific vector illustrations, composited in scene
   coordinates. No portrait cropping, external image dependency or edge mask. */
const WORK_NAMES={pokemon:["피카츄","파이리","꼬부기","나옹"],digimon:["아구몬","파피몬","텐타몬","가트몬"],marvel:["아이언맨","캡틴 아메리카","스파이더맨","헐크"]};
const WORK_COLORS={
 pokemon:[["#ffda4c","#e8a72a","#fff0a0"],["#f89446","#d96835","#ffdb9a"],["#6fcbd6","#348ca8","#fae2a0"],["#f0d7a0","#b48d5a","#fff0cf"]],
 digimon:[["#f9bd45","#d58b2c","#ffe2a1"],["#f7d35c","#bc8b39","#fff1b5"],["#d64e43","#9a2b41","#f9b1a3"],["#f1eee6","#b8b3c5","#ffffff"]],
 marvel:[["#d34a42","#852d36","#f1c56c"],["#3d79af","#25466f","#a6c9e4"],["#d84b50","#9e283e","#fa8a79"],["#88b951","#4b783c","#b7df77"]]
};
function workFigure(theme,i){
 const [base,shade,light]=WORK_COLORS[theme][i], ink="#202b37";
 const human=theme==="marvel", green=human&&i===3;
 const id=theme+i;
 const grad="url(#body"+id+")";
 let parts=[];
 const path=(d,f=grad,w=2.1,st=ink)=>'<path d="'+d+'" fill="'+f+'" stroke="'+st+'" stroke-width="'+w+'" stroke-linejoin="round" stroke-linecap="round"/>';
 const ell=(x,y,rx,ry,f=grad,w=2,st=ink)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+f+'" stroke="'+st+'" stroke-width="'+w+'"/>';
 const stroke=(d,f=ink,w=2)=>path(d,"none",w,f);
 const circle=(x,y,r,f,w=1.5,st=ink)=>ell(x,y,r,r,f,w,st);
 const limb=(d,w,f=base)=>stroke(d,ink,w+4)+stroke(d,shade,w)+stroke(d,f,Math.max(2,w-5));
 const eye=(x,y,rx=5,ry=8,f="#26313b")=>ell(x,y,rx,ry,f,1)+circle(x+1,y-3,2,"#fff",0,"none");
 const add=(...v)=>parts.push(...v);
 // Ground shadow and rear appendages are behind the working silhouette.
 add(ell(99,222,60,8,"#0b1625",0,"none"));
 if(theme==="pokemon"){
  if(i===0)add(path("M63 160L29 145 39 119 16 103 33 70 69 91 56 116 81 132Z",grad,2.7),path("M63 160L48 153 59 135 81 132Z","#935d38"));
  if(i===1)add(path("M67 173Q24 204 23 153Q24 137 38 132L42 153Q42 176 66 151Z",grad),path("M25 153Q8 137 25 117L28 130 44 107Q52 132 40 151Z","#ef7e3a"),path("M26 150Q20 137 32 130Q43 142 35 151Z","#ffde63"));
  if(i===2)add(ell(67,141,38,48,"#855a45"),ell(65,140,31,39,"#b37d52"),stroke("M37 132Q66 112 96 133M39 153Q64 171 95 153M65 101V180","#644735",2),path("M49 165Q9 168 19 190Q31 200 48 184Q52 178 43 176",grad));
  if(i===3)add(path("M62 176Q22 187 24 150Q26 137 39 144Q50 156 34 162Q35 170 65 161Z",grad),path("M31 145Q43 141 43 153Q42 161 34 160Z","#9b6d46"));
 }else if(theme==="digimon"){
  if(i===0)add(path("M73 165Q25 177 17 155L34 144Q40 157 64 146Z",grad));
  if(i===1)add(path("M62 174Q23 202 17 171L32 151 59 153Z","#7ea4d5"),stroke("M28 168L46 178","#325eaa",7));
  if(i===2)add(path("M68 103Q5 104 24 164Q47 170 71 142Z","#a9d4e4"),path("M106 105Q167 102 153 163Q133 170 110 141Z","#b4deec"),stroke("M31 119L61 144M144 121L121 145","#517d9b",2));
  if(i===3)add(path("M68 177Q15 204 18 162Q20 145 31 145Q49 150 40 164Q33 170 31 164Q31 181 69 161Z","#edece6"),stroke("M22 151L37 158","#8b7cb5",7),circle(20,174,8,"#d3ad53"));
 }else if(i===1){
  add(circle(54,143,37,"#b13d49"),circle(54,143,29,"#f3eee2"),circle(54,143,21,"#b13d49"),circle(54,143,13,"#3b6d9e"));
 }
 // Articulated legs: the draftsman kneels, the surveyor bends to the scope.
 const hip=human?155:160;
 const knee=i===1?[67,184,124,198]:i===3?[59,191,130,183]:[70,191,121,195];
 const foot=i===1?[44,215,145,216]:[60,214,132,214];
 const legColor=human?(green?"#52416d":i===2?"#375b99":i===1?"#386694":shade):base;
 add(limb("M83 "+hip+"Q80 174 "+knee[0]+" "+knee[1]+"L"+foot[0]+" "+foot[1],human?22:19,legColor),
     limb("M112 "+hip+"Q117 176 "+knee[2]+" "+knee[3]+"L"+foot[2]+" "+foot[3],human?22:19,legColor));
 const shoe=human?(green?base:i===1?"#a83d45":i===2?"#c93c48":"#bd3b3c"):i===3&&theme==="digimon"?"#d8b749":base;
 add(ell(foot[0]+7,216,human?18:17,8,shoe),ell(foot[2]+7,216,human?18:17,8,shoe));
 if(theme==="digimon"&&i===0)for(const x of [foot[0]+3,foot[0]+12,foot[2]+3,foot[2]+12])add(path("M"+x+" 214l5 8 5 -7Z","#fff0d1",1));
 // Body angles reflect the job (forward lean for theodolite, low drafting posture).
 const tilt=i===3?15:i===1?10:0;
 const ty=i===1?8:0;
 const bx=96+tilt,by=121+ty;
 if(human){
  add(path("M"+(bx-35)+" "+(by-30)+"Q"+bx+" "+(by-50)+" "+(bx+35)+" "+(by-29)+"L"+(bx+25)+" "+(by+39)+"Q"+bx+" "+(by+48)+" "+(bx-23)+" "+(by+38)+"Z",grad,2.7));
  if(i===0)add(path("M"+(bx-25)+" "+(by-23)+"L"+(bx-12)+" "+(by+4)+" "+(bx-18)+" "+(by+31)+"L"+(bx+18)+" "+(by+31)+" "+(bx+13)+" "+(by+4)+" "+(bx+25)+" "+(by-23), "none",3,"#edba67"),circle(bx,by-8,12,"#d5faff",2,"#73bed8"),circle(bx,by-8,6,"#fff",0,"none"));
  if(i===1)add(path("M"+(bx-23)+" "+(by+16)+"H"+(bx+23)+"L"+(bx+20)+" "+(by+35)+"H"+(bx-20)+"Z","#e5dfd8"),stroke("M"+(bx-11)+" "+(by+18)+"v15M"+(bx+10)+" "+(by+18)+"v15","#af3d48",8),path("M"+bx+" "+(by-24)+"l4 12 13 0 -10 8 4 12 -11 -8 -11 8 4 -12 -10 -8 13 0Z","#f3f1e9",1));
  if(i===2)add(path("M"+(bx-33)+" "+(by+1)+"L"+(bx-16)+" "+(by+8)+"L"+(bx-18)+" "+(by+37)+"H"+(bx+18)+"L"+(bx+16)+" "+(by+8)+"L"+(bx+33)+" "+(by+1)+"L"+(bx+26)+" "+(by+39)+"H"+(bx-26)+"Z","#31598d"),stroke("M"+bx+" "+(by-13)+"v24m-9 -19 18 14m-18 0 18 -14","#26313d",2.8),ell(bx,by-3,4,7,"#26313d",0,"none"));
  if(i===3)add(stroke("M"+(bx-26)+" "+(by-14)+"Q"+bx+" "+(by-1)+" "+(bx+27)+" "+(by-14)+"M"+bx+" "+(by-3)+"V"+(by+23),"#477143",2),path("M"+(bx-26)+" "+(by+29)+"H"+(bx+26)+"L"+(bx+27)+" "+(by+46)+"l-17 -2 -10 4 -10 -5 -17 3Z","#614677"));
 }else{
  add(ell(bx,by+11,theme==="digimon"&&i===2?32:30,42,grad,2.5));
  if(theme==="pokemon"&&i===2)add(ell(bx+7,by+14,24,35,light),stroke("M"+(bx-12)+" "+(by+5)+"h39m-36 14h34m-18 -40v63","#a78c67",1.8));
  else if(theme==="digimon"&&i===1)add(ell(bx,by+8,25,34,"#fff0b2"),path("M"+(bx-11)+" "+(by-10)+"l22 1 -9 11 9 10 -22 0 8 -10Z","#6d9ed8",1.4));
  else if(theme==="digimon"&&i===2)add(ell(bx,by+7,24,35,"#343b49"),stroke("M"+(bx-18)+" "+(by+4)+"h36m-32 13h28","#8496a3",2));
  else add(ell(bx+4,by+16,18,27,light,0,"none"));
 }
 // Head and distinctive franchise details.
 const hx=102+(i===3?25:i===1?12:0),hy=64+(i===3?19:i===1?14:0);
 const hstart=parts.length;
 if(theme==="pokemon"&&i===0){
  add(path("M-25 -15Q-51 -39 -46 -62Q-28 -52 -15 -24Z"),path("M14 -24Q26 -54 43 -64Q46 -39 28 -12Z"),path("M-46 -62Q-51 -49 -40 -39L-28 -45Z","#303039"),path("M43 -64Q47 -50 38 -38L25 -44Z","#303039"),ell(0,0,36,30),ell(-22,10,9,8,"#e84942",1),ell(25,10,9,8,"#e84942",1),eye(-11,-5),eye(14,-5),path("M-1 3l5 0 -2 3Z","#2d2d34",1),stroke("M-5 12q7 7 14 0"));
 }else if(theme==="pokemon"&&i===1){
  add(path("M-35 5Q-43 -24 -12 -30Q23 -37 36 -12L47 5Q43 20 19 26Q-15 31 -34 12Z"),ell(21,11,23,12,light,1.4),eye(3,-6,6,11,"#356579"),eye(25,-8,5,10,"#356579"),stroke("M16 16q13 5 24 -2"),circle(34,3,1.4,ink,0,"none"));
 }else if(theme==="pokemon"&&i===2){
  add(ell(0,0,37,33),ell(17,12,25,17,base,1.5),eye(-7,-6,7,12,"#8c3447"),eye(21,-7,7,12,"#8c3447"),stroke("M7 16Q24 23 37 12"),circle(25,4,1.2,ink,0,"none"));
 }else if(theme==="pokemon"&&i===3){
  add(path("M-31 -15L-33 -51 -5 -32Q4 -35 16 -30L37 -49 34 -12Q47 9 27 26Q0 39 -29 25Q-47 6 -31 -15Z"),path("M-29 -40L-11 -28 -29 -21Z","#a7756d",1),path("M31 -39L18 -25 32 -20Z","#a7756d",1),ell(5,-28,10,14,"#e1b44b"),stroke("M2 -34h6m-7 5h8m-8 5h6","#9c6d38",1.5),eye(-13,-3,6,11),eye(17,-3,6,11),stroke("M-3 10q7 8 14 0M-29 6l-15 -4m15 10 -16 4m42 -11 15 -4m-15 11 15 4"));
 }else if(theme==="digimon"&&i===0){
  add(path("M-38 -4Q-43 -30 -14 -34Q25 -39 40 -14L49 7Q43 25 19 29Q-21 33 -38 13Z"),ell(20,13,27,15,light,1.5),eye(-5,-8,7,11,"#55934c"),eye(25,-8,6,10,"#55934c"),stroke("M4 17Q27 24 44 12"),path("M28 20l5 -6 4 6Z","#fff5d9",1),circle(37,4,1.5,ink,0,"none"));
 }else if(theme==="digimon"&&i===1){
  add(path("M-31 -9L-45 -42 -13 -24 0 -27 13 -56 21 -24 42 -36 37 -4Q49 24 20 29Q-18 36 -38 17Z","#8bb0de"),stroke("M-37 -31l13 15m54 -11 -12 13","#395b9c",6),path("M7 -26L15 -57 22 -24Z","#e9c485"),ell(0,5,29,25,grad),ell(16,15,22,13,light,1),eye(-8,-5,5,9,"#9c3b46"),eye(18,-5,5,9,"#9c3b46"),stroke("M9 17q13 6 24 -2"));
 }else if(theme==="digimon"&&i===2){
  add(path("M-18 -20Q-28 -45 -42 -43M15 -22Q23 -46 39 -44","none",4),circle(-43,-43,4,light),circle(39,-44,4,light),ell(0,0,36,28,grad),ell(-16,-2,12,17,"#a3d4a1"),ell(15,-2,12,17,"#a3d4a1"),eye(-14,-1,3,7),eye(16,-1,3,7),path("M-14 15L-5 29 1 17 9 28 19 14Z","#ebc96a"));
 }else if(theme==="digimon"&&i===3){
  add(path("M-31 -14L-39 -49 -10 -29Q5 -35 18 -29L40 -49 35 -12Q49 17 22 28Q-8 38 -32 20Q-44 7 -31 -14Z",grad),path("M-34 -41L-15 -27 -30 -22Z","#8873b0"),path("M35 -41L21 -27 32 -20Z","#8873b0"),eye(-12,-4,7,11,"#467baa"),eye(18,-4,7,11,"#467baa"),stroke("M-2 10q7 8 14 0"),circle(6,8,2,"#b77786",0,"none"));
 }else if(theme==="marvel"&&i===0){
  add(path("M-31 -23L-13 -34H14L31 -22 34 14 19 34H-18L-34 13Z",grad,2.7),path("M-23 -20L-12 -24 -8 -15H9L14 -24 25 -20 24 13 13 28H-13L-24 13Z","#f2c565"),path("M-20 -5L-5 -3 -7 3 -20 2ZM7 -3L21 -5 21 2 8 3Z","#d5fbff",1.1,"#5f8495"),stroke("M-13 18H13M-22 9l9 7m35 -7 -9 7","#977044",1.5));
 }else if(theme==="marvel"&&i===1){
  add(ell(0,0,31,33,"#386b9d"),path("M-28 4L-20 0 -10 5H10L20 0 28 4 24 21Q0 39 -24 21Z","#efbe94"),path("M-6 -25L0 -13 6 -25M-4 -18H4","none",3,"#f9f8f1"),eye(-11,0,4,4),eye(12,0,4,4),stroke("M-7 19q7 3 14 0"));
 }else if(theme==="marvel"&&i===2){
  add(ell(0,0,31,35,grad),stroke("M0 -33V33M-17 -29L-9 30M17 -29L9 30M-30 -16Q0 -5 30 -16M-31 0Q0 10 31 0M-27 16Q0 23 27 16","#542d3e",1.4),path("M-25 -13Q-10 -15 -4 5Q-16 13 -25 -2Z","#f7fbff",2.8),path("M25 -13Q10 -15 4 5Q16 13 25 -2Z","#f7fbff",2.8));
 }else{
  add(path("M-33 -19Q-24 -39 1 -35Q28 -38 36 -19L29 15 18 31H-17L-31 15Z",grad,2.7),path("M-34 -12L-37 -28 -25 -35 -17 -41 -7 -36 3 -42 16 -35 24 -38 37 -26 34 -10 23 -22 13 -16 1 -24 -12 -19 -23 -23Z","#303938"),eye(-11,1,5,5),eye(14,1,5,5),stroke("M-21 -8l15 4m15 0 15 -4M-10 19q11 -5 22 0","#304c35",2.8));
 }
 const head=parts.splice(hstart).join("");
 add('<g transform="translate('+hx+' '+hy+') rotate('+(i===3?11:i===1?9:3)+')">'+head+'</g>');
 // Hands go to the same real working points as the tools, rather than
 // merely putting a generic portrait next to an illustration.
 const grips=[[[142,84],[174,91]],[[148,165],[179,181]],[[147,133],[178,129]],[[162,108],[177,117]]][i];
 const shoulders=[[bx-22,by-16],[bx+23,by-15]];
 const armColor=theme==="marvel"&&i===1?"#426f9f":theme==="digimon"&&i===3?"#e8e4dd":base;
 for(let k=0;k<2;k++){
  const [sx,sy]=shoulders[k],[gx,gy]=grips[k];
  const ex=(sx+gx)/2+(k?7:-8),ey=(sy+gy)/2+12;
  add(limb("M"+sx+" "+sy+"Q"+ex+" "+ey+" "+gx+" "+gy,human?(green?23:15):12,armColor));
 }
 // Camera raised toward concrete; pencil touching plan; physical grips over
 // Schmidt hammer shaft; hand on focus/azimuth adjustment at theodolite.
 if(i===0){
  add(path("M140 73h10l5 -7h14l5 7h13v27h-47Z","#253b4b",2.3),ell(177,86,9,9,"#86b7d0",2),ell(177,86,4,4,"#193a4d",1),path("M145 78h9v5h-9Z","#d8e5e6",1));
 }else if(i===1){
  add(path("M130 178l63 -19 23 33 -65 23Z","#eee4c9",1.8),stroke("M147 184l38 -12 16 16 -39 13Z M166 179l10 17m-12 -6 28 -9","#426579",1.6),stroke("M171 163l18 20","#252e35",5),stroke("M171 163l16 18","#e6af4f",3),path("M187 181l3 4 -5 -2Z","#31343a",1));
 }
 for(const [x,y] of grips)add(ell(x,y,human?8:7,human?7:6,theme==="digimon"&&i===3?"#e5c66a":armColor,1.6));
 return '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="240" viewBox="0 0 220 240"><defs><linearGradient id="body'+id+'" x1="0" y1="0" x2=".82" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="'+light+'"/><stop offset=".34" stop-color="'+base+'"/><stop offset="1" stop-color="'+shade+'"/></linearGradient></defs>'+parts.join("")+'</svg>';
}
const workCache=new Map();
function workImage(theme,i){
 const k=theme+i;
 if(!workCache.has(k))workCache.set(k,load("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(workFigure(theme,i))));
 return workCache.get(k);
}
async function paintWorkingScene(c,theme,i,source){
 // Retain the existing scene/background and remove only the old portrait.
 if(theme==="pokemon"&&source){
  const crops=[[138,0,342,320],[480,0,390,320],[120,320,360,320],[566,320,394,320]];
  c.drawImage(source,...crops[i],0,0,600,360);
 }else inspectionScene(c,theme,i,null);
 const ox=87,oy=105;
 if(i===2){
  // Rebound hammer axis meets the concrete surface, grips are on the shaft.
  c.save();c.lineCap="round";
  line(c,[[ox+132,oy+135],[412,220]],"#182e38",20);
  line(c,[[ox+132,oy+135],[412,220]],"#b98a51",13);
  line(c,[[ox+140,oy+131],[405,217]],"#f1d49a",3);
  line(c,[[410,220],[439,217]],"#e3e8e0",6);
  c.restore();
 }else if(i===3&&theme==="pokemon"){
  // Use the same tripod coordinates as the other themes, on the existing
  // survey background. Never enlarge or crop the operator to fill a card.
  c.save();c.lineCap="round";
  for(const x of [235,279,322])line(c,[[276,227],[x,339]],"#d5b47d",5);
  poly(c,[[251,191],[296,188],[302,222],[252,228]],"#cfa451","#f8df9e",2);
  poly(c,[[263,196],[286,194],[288,211],[264,215]],"#254b5a","#f8df9e",2);
  c.restore();
 }
 const im=await workImage(theme,i);
 c.save();c.shadowColor="#07152188";c.shadowBlur=6;c.shadowOffsetY=3;
 c.drawImage(im,ox,oy,220,240);c.restore();
 // Fade only the unoccupied far-left background, not any part of the actor.
 c.save();c.globalCompositeOperation="destination-in";
 const fade=c.createLinearGradient(0,0,65,0);fade.addColorStop(0,"transparent");fade.addColorStop(1,"black");
 c.fillStyle=fade;c.fillRect(0,0,600,360);c.restore();
}

function hasIllustratedScene(theme){return theme==="shinchan"||theme==="pokemon"}
async function paintPokemonCard(c,source,index){
 const crops=[[138,0,342,320],[480,0,390,320],[120,320,360,320],[566,320,394,320]];
 const [x,y,w,h]=crops[index];
 c.drawImage(source,x,y,w,h,0,0,600,360);
 const src=await actorImage("pokemon",index);
 if(!src)return;
 const actor=await load(src);
 // Foot anchors keep each silhouette inside the opaque part of the scene.
 const stances=[[192,324,176,7,true],[353,298,162,13,false],[190,321,164,15,true],[189,313,154,9,false]];
 const [footX,footY,size,lean,mirror]=stances[index];
 c.save();
 c.translate(footX,footY);
 c.rotate(lean*Math.PI/180);
 c.scale(mirror?-1:1,1);
 c.shadowColor="#142336aa";c.shadowBlur=5;c.shadowOffsetY=4;
 c.drawImage(actor,-size/2,-size,size,size);
 c.restore();
 c.save();
 c.globalCompositeOperation="destination-in";
 const fade=c.createLinearGradient(0,0,90,0);
 fade.addColorStop(0,"transparent");fade.addColorStop(1,"black");
 c.fillStyle=fade;c.fillRect(0,0,600,360);
 c.restore();
}
async function cardArt(card,theme,i,source){
 if(card.dataset.sarchSceneVersion===theme+"-223"&&card.querySelector(".sarch-v214-scene")){
  card.querySelectorAll(".sarch-theme-card-character,.sarch-v206-scene").forEach(el=>el.remove());
  return;
 }
 let wrap=card.querySelector(".sarch-v214-scene");
 if(!wrap){wrap=document.createElement("span");wrap.className="sarch-v214-scene";wrap.setAttribute("aria-hidden","true");card.append(wrap)}
 wrap.dataset.theme=theme;
 const canvas=document.createElement("canvas");canvas.width=600;canvas.height=360;canvas.className="sarch-v214-canvas";
 const c=canvas.getContext("2d",{alpha:true});
 if(theme==="shinchan"&&i===3){
  const illustration=await load("sarch-shinchan-tilt-survey.jpg");
  canvas.height=Math.round(canvas.width*illustration.naturalHeight/illustration.naturalWidth);
  c.drawImage(illustration,0,0,canvas.width,canvas.height);
  // Feather in image coordinates so the fade follows the artwork at every card size.
  c.save();
  c.globalCompositeOperation="destination-in";
  const leftFade=c.createLinearGradient(0,0,canvas.width*.29,0);
  leftFade.addColorStop(0,"transparent");
  leftFade.addColorStop(.23,"rgba(0,0,0,.13)");
  leftFade.addColorStop(.72,"rgba(0,0,0,.87)");
  leftFade.addColorStop(1,"black");
  c.fillStyle=leftFade;
  c.fillRect(0,0,canvas.width,canvas.height);
  const skyFade=c.createLinearGradient(0,0,0,canvas.height*.12);
  skyFade.addColorStop(0,"transparent");
  skyFade.addColorStop(1,"black");
  c.fillStyle=skyFade;
  c.fillRect(0,0,canvas.width,canvas.height);
  c.restore();
 }else if(theme==="shinchan")redrawTile(c,source,i);
 else await paintWorkingScene(c,theme,i,source);
 if(document.body.dataset.theme!==theme||wrap.dataset.theme!==theme||!wrap.isConnected)return;
 wrap.replaceChildren(canvas);
 if(WORK_NAMES[theme])wrap.title=WORK_NAMES[theme][i];
 card.dataset.sarchSceneVersion=theme+"-223";card.classList.add("sarch-v214-ready");
 card.querySelectorAll(".sarch-theme-card-character,.sarch-v206-scene,.sarch-v211-scene").forEach(n=>n.remove());
}
const BUTTON_GLYPHS={
 home:'<path d="M3 10l9-7 9 7v10h-7v-6h-4v6H3z"/>',
 check:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3h8v3H8zM8 13l3 3 5-6"/>',
 save:'<path d="M4 4h14l3 3v13H3V4zM7 4v6h10V4M7 20v-7h10v7"/>',
 shield:'<path d="M12 2l8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6zM8 12l3 3 5-6"/>',
 order:'<path d="M7 3v18M3 7l4-4 4 4M17 21V3M13 17l4 4 4-4"/>',
 edit:'<path d="M4 20l4-1 12-12-3-3L5 16zM14 7l3 3"/>',
 pen:'<path d="M4 20l4-1 12-12-3-3L5 16zM14 7l3 3M3 21h18"/>',
 camera:'<path d="M3 7h5l2-3h5l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/>',
 rotate:'<path d="M21 12a9 9 0 1 1-3-6M21 3v6h-6"/>',
 tag:'<path d="M4 4h9l7 7-9 9-7-7z"/><circle cx="9" cy="9" r="1.5"/>',
 plus:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 7v10M7 12h10"/>',
 trash:'<path d="M4 7h16M8 7V4h8v3M6 7l1 14h10l1-14M10 10v8M14 10v8"/>',
 measure:'<path d="M4 5l15 15M7 2L2 7l15 15 5-5zM9 9l2-2M13 13l2-2"/>',
 inspect:'<rect x="3" y="4" width="13" height="17" rx="2"/><path d="M6 9h6M6 13h6"/><circle cx="17" cy="16" r="4"/><path d="m20 19 2 2"/>',
 floor:'<path d="M3 3h18v18H3zM3 10h18M11 3v18M11 15h10"/>',
 link:'<path d="M10 7H8a5 5 0 0 0 0 10h3M14 7h2a5 5 0 0 1 0 10h-3M8 12h8"/>',
 undo:'<path d="M9 7 4 12l5 5M4 12h10a6 6 0 0 1 0 12"/>',
 warning:'<path d="M12 2 2 21h20zM12 9v5M12 18v.2"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/>',
 arrow:'<path d="M4 12h16M14 6l6 6-6 6"/>'
};
function uiCategory(text){
 const t=(text||"").trim().replace(/\s+/g," ");
 if(!t||t.length>35)return null;
 if(/누락.?점검|품질.?점검|검토/.test(t))return "check";
 if(/자료.?보호|복구|백업/.test(t))return "shield";
 if(/홈/.test(t))return "home";
 if(/도면.?순서|정렬/.test(t))return "order";
 if(/회전/.test(t))return "rotate";
 if(/번호.?찍기|번호/.test(t))return "tag";
 if(/구간.?결합|연결/.test(t))return "link";
 if(/구간.?표시|실.?구획/.test(t))return "floor";
 if(/취소|되돌리기|실행.?취소/.test(t))return "undo";
 if(/삭제|지우기|휴지통/.test(t))return "trash";
 if(/새.?도면|새.?현장|추가/.test(t))return "plus";
 if(/촬영|사진|카메라/.test(t))return "camera";
 if(/저장|내보내기|출력/.test(t))return "save";
 if(/스케치|그리기|모서리/.test(t))return "pen";
 if(/이름.?변경|수정|편집/.test(t))return "edit";
 if(/기울기|측정값|치수|각도|길이/.test(t))return "measure";
 if(/결함|손상/.test(t))return "warning";
 if(/현장.?조사|점검|탐사|조사/.test(t))return "inspect";
 if(/도면/.test(t))return "floor";
 if(/설정|기타.?도구|도구/.test(t))return "settings";
 if(/이전|다음|페이지/.test(t))return "arrow";
 return null;
}
function installButtonIcons(theme){
 const tint={shinchan:"#91422d",pokemon:"#816221",digimon:"#4bbedc",marvel:"#dfa6a2"}[theme];
 document.querySelectorAll("button").forEach(btn=>{
  if(btn.matches('#cameraBtn,#sm52FixedCamera,.sarch-camera-tab-v145,[type="color"]'))return;
  const kind=uiCategory(btn.textContent||btn.getAttribute("aria-label")||"");
  if(!kind){delete btn.dataset.sarch214Ui;btn.style.removeProperty("--sa214-glyph");return}
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="'+tint+'" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">'+BUTTON_GLYPHS[kind]+'</svg>';
  const data="url('data:image/svg+xml,"+encodeURIComponent(svg)+"')";
  btn.style.setProperty("--sa214-glyph",data);
  btn.dataset.sarch214Ui=kind;
 });
}
function updateModuleBadge(theme){
 document.querySelectorAll(".sarch-v214-interior").forEach(el=>el.remove());
 const head=document.querySelector("header.smetric-app-header");
 if(!head)return;
 const index=["survey","drawing","schmidt","tilt"].indexOf(document.documentElement.dataset.module);
 if(index<0)return;
 const slot=document.createElement("span");slot.className="sarch-v214-interior";slot.setAttribute("aria-hidden","true");
 slot.title=["현장조사 테마 장면","도면작성 테마 장면","장비조사 테마 장면","기울기 테마 장면"][index];
 const pic=document.createElement("canvas");pic.width=204;pic.height=118;slot.append(pic);head.append(slot);
 if(theme!=="shinchan"){
  pic.width=600;pic.height=360;
  slot.title=WORK_NAMES[theme][index]+" · "+slot.title;
  (theme==="pokemon"?atlas(theme).catch(()=>null):Promise.resolve(null)).then(source=>{
   if(!slot.isConnected||document.body.dataset.theme!==theme)return;
   return paintWorkingScene(pic.getContext("2d"),theme,index,source);
  }).catch(console.warn);
  return;
 }
 atlas(theme).then(im=>{
  if(!slot.isConnected||document.body.dataset.theme!==theme)return;
  const g=pic.getContext("2d");
  const w=(im.naturalWidth||im.width)/2,h=(im.naturalHeight||im.height)/2;
  g.drawImage(im,index%2*w,Math.floor(index/2)*h,w,h,0,0,pic.width,pic.height);
 }).catch(()=>{slot.remove()});
}

let queued=false;
function repaint(){
 queued=false;
 const theme=document.body.dataset.theme;
 const cards=document.querySelectorAll(".modules .module");
 if(!themes.has(theme)){
  document.body.style.removeProperty("--sa214-icon");
  document.querySelectorAll("[data-sarch214-ui]").forEach(btn=>{delete btn.dataset.sarch214Ui;btn.style.removeProperty("--sa214-glyph")});
  document.querySelectorAll("[data-sarch214-pin]").forEach(btn=>delete btn.dataset.sarch214Pin);
  document.querySelectorAll(".sarch-v214-interior").forEach(el=>el.remove());
  cards.forEach(card=>{card.querySelectorAll(".sarch-v214-scene").forEach(n=>n.remove());card.classList.remove("sarch-v214-ready");delete card.dataset.sarchSceneVersion});
  return;
 }
 if(document.documentElement.dataset.module==="home"){
  const source=hasIllustratedScene(theme)?atlas(theme).catch(e=>{if(theme==="shinchan")throw e;return null}):Promise.resolve(null);
  source.then(img=>{
   if(document.body.dataset.theme!==theme)return;
   cards.forEach((card,i)=>{if(i<4)cardArt(card,theme,i,img).catch(console.warn)});
  }).catch(console.warn);
 }else{
  // Theme toolbar artwork and action-specific icons; never touch measurement canvases.
  document.querySelectorAll("[data-sarch214-pin]").forEach(btn=>delete btn.dataset.sarch214Pin);
  document.body.style.removeProperty("--sa214-icon");
  installButtonIcons(theme);
  updateModuleBadge(theme);
 }
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(repaint)}}
function init(){
 schedule();
 new MutationObserver(records=>{
  if(records.some(r=>r.type==="attributes"&&r.target===document.body&&r.attributeName==="data-theme"
   ||r.type==="childList"&&[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.(".sarch-v206-scene,.sarch-theme-card-character,button")||n.querySelector?.("button")))))schedule();
 }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["data-theme"]});
 window.addEventListener("pageshow",schedule);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
