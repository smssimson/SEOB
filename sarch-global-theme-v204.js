/* S:ARCH unified theme selector and removable illustrated theme pack. */
(()=>{"use strict";
const KEY="sarch-global-theme-v199";
const labels={dark:"기본 · S:ARCH",light:"라이트",navy:"네이비",forest:"포레스트",slate:"슬레이트",ocean:"오션",sand:"샌드",lavender:"라벤더",rose:"로즈",graphite:"그라파이트",paper:"도면지",blueprint:"블루프린트",mint:"민트",system:"기기 설정",shinchan:"짱구",pokemon:"포켓몬",digimon:"디지몬",marvel:"마블"};
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
 const [gold,left,right,accent]=colors[theme],id="sarch-"+theme+"-corner";
 // The real exposed shared corner of both facade planes is B=(440,330), T=(460,34).
 // The plumb reference and the real corner are exactly coincident at B.
 const shear=(x,y)=>[x+(330-y)*20/296,y];
 const p=(x,y)=>shear(x,y).map(n=>Number(n.toFixed(3))).join(" ");
 const polygon=points=>"M"+points.map(q=>p(...q)).join("L")+"Z";
 const faceL=[[302,94],[440,34],[440,330],[302,330]],faceR=[[440,34],[568,94],[568,330],[440,330]];
 let win="";
 for(let j=0;j<4;j++){
  const y=110+j*50;
  for(const [x1,x2,sgn] of [[314,431,-1],[449,556,1]]){
   const y1=y+(sgn===-1?21:0),y2=y+(sgn===-1?0:21);
   win+='<path d="'+polygon([[x1,y1],[x2,y2],[x2,y2+31],[x1,y1+31]])+'" fill="url(#'+id+'-glass)" stroke="'+gold+'" stroke-opacity=".7" stroke-width="1.2"/>';
   for(let k=1;k<4;k++){const x=x1+(x2-x1)*k/4,yy=y1+(y2-y1)*k/4;win+='<path d="M'+p(x,yy)+'L'+p(x,yy+31)+'" stroke="'+gold+'" opacity=".42" stroke-width=".85"/>'}
  }
 }
 let floors="";
 for(const y of [99,153,205,257,309])floors+='<path d="M'+p(302,y+20)+'L'+p(440,y-21)+'L'+p(568,y+20)+'" stroke="'+gold+'" opacity=".48" stroke-width="1.2" fill="none"/>';
 return '<defs><linearGradient id="'+id+'-l" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+left+'"/><stop offset="1" stop-color="#15293d"/></linearGradient><linearGradient id="'+id+'-r" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+right+'"/><stop offset="1" stop-color="#101c2a"/></linearGradient><linearGradient id="'+id+'-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#628ba4"/><stop offset=".35" stop-color="#304d68"/><stop offset="1" stop-color="#142639"/></linearGradient></defs><g stroke-linejoin="round"><path d="'+polygon(faceL)+'" fill="url(#'+id+'-l)" stroke="'+gold+'" stroke-width="1.7"/><path d="'+polygon(faceR)+'" fill="url(#'+id+'-r)" stroke="'+gold+'" stroke-width="1.7"/>'+floors+win+'<path d="M'+p(302,94)+'L'+p(440,34)+'L'+p(568,94)+'" stroke="'+gold+'" stroke-width="2" fill="none"/></g><path d="M282 330H586" stroke="'+gold+'" stroke-width="1.2" opacity=".65"/><g fill="none" stroke="'+gold+'" stroke-width="1.55" stroke-linecap="butt"><path class="sarch-corner-plumb" d="M440 330V34" stroke-dasharray="6 5"/><path class="sarch-corner-actual" d="M440 330L460 34"/><path d="M440 34V18M460 34V18M440 23H460M445 20L440 23L445 26M455 20L460 23L455 26" stroke-width="1"/></g>';
}
const tripod='<g stroke-linecap="round" stroke-linejoin="round"><path d="M265 217L229 334M265 217L307 334M265 217V334" fill="none" stroke="#bf9862" stroke-width="7"/><path d="M265 217L229 334M265 217L307 334M265 217V334" fill="none" stroke="#e9ca84" stroke-width="3"/><rect x="239" y="172" width="52" height="43" rx="7" fill="#d6ad59" stroke="#eace91" stroke-width="1.7"/><rect x="249" y="179" width="32" height="25" rx="4" fill="#172d42" stroke="#9eaab1"/><circle cx="265" cy="192" r="7.5" fill="#4d9eb8" stroke="#b9e3e9" stroke-width="2"/><path d="M265 172V160h17" fill="none" stroke="#e4ce9f" stroke-width="3"/></g>';
const miniTools=[
 '<g transform="translate(222 188)"><path d="M0 12h20l8-10h28l9 10h13v47H0z" fill="#263e50" stroke="#dbccac" stroke-width="2" stroke-linejoin="round"/><circle cx="44" cy="36" r="18" fill="#10263a" stroke="#c9b27d" stroke-width="4"/><circle cx="44" cy="36" r="10" fill="#4b859b"/><path d="M39 31l8-5" stroke="#d9f2fb" stroke-width="3"/></g>',
 '<g transform="translate(210 235)"><path d="M0 32L26 0H150L172 60H0Z" fill="#7d6653" stroke="#bea987" stroke-width="2"/><path d="M27 7H141L159 48H13Z" fill="#dfd7c4"/><path d="M36 15H131L143 40H27ZM78 15V40M100 15V27H137M33 27H78" fill="none" stroke="#4c657b" stroke-width="2"/><path d="M15 37l38-43 5 5-39 42z" fill="#f0c66e" stroke="#d6a052"/></g>',
 '<g transform="translate(224 244)"><rect width="91" height="66" rx="5" fill="#a38b6d" stroke="#e0cbaa" stroke-width="1.7"/><rect x="8" y="8" width="75" height="50" rx="2" fill="#e7e1cf"/><path d="M17 18h30m-30 10h55m-55 10h43m-43 10h55" stroke="#637e92" stroke-width="2"/><path d="M62 18h9v9h-9z" fill="#709f9e"/></g>'
];
function decoration(theme,i){
 const wrap=document.createElement("span");
 wrap.className="sarch-theme-character sarch-theme-card-character sarch-action-scene sarch-v203-scene";
 wrap.setAttribute("aria-hidden","true");wrap.dataset.scene=String(i);wrap.dataset.theme=theme;
 const integrated=theme==="shinchan"||theme==="pokemon";
 const [line,, ,accent]=colors[theme];
 let scene='';
 if(i===3){
  scene=corner(theme);
  if(integrated){
   scene+=atlas(theme,3,0,90,320,260);
   if(theme==="pokemon")scene+='<g transform="translate(0 -22) scale(.95)">'+tripod+'</g>';
  }else scene+=tripod;
 }else if(integrated){
  scene=atlas(theme,i);
 }else{
  scene=atlas(theme,i,160,12,435,338)+miniTools[i];
 }
 if(!integrated){
  // An unaltered, genuine character asset, not a person in a hero costume.
  // Do not distort the proportions or draw imitation arms over the portrait.
  const actor=artwork(images[theme][i],"sarch-v203-actor",theme);
  wrap.append(actor);
 }
 wrap.insertAdjacentHTML("afterbegin",'<svg class="sarch-work-scene" viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet" aria-hidden="true">'+scene+'<path d="M14 348H586" stroke="'+line+'" opacity=".38" stroke-width="1.2"/></svg>');
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
const media=window.matchMedia("(prefers-color-scheme: dark)");
function stored(){try{const v=localStorage.getItem(KEY);return v&&Object.hasOwn(labels,v)?v:"dark"}catch(e){return "dark"}}
function apply(choice){
 const val=Object.hasOwn(labels,choice)?choice:"dark";
 const current=val==="system"?(media.matches?"dark":"light"):val;
 const b=document.body; b.dataset.theme=current;
 document.documentElement.dataset.sarchTheme=val;
 const global=document.getElementById("sarchGlobalTheme");if(global)global.value=val;
 // Legacy controls are retained for compatibility, but no longer exposed to users.
 for(const el of document.querySelectorAll("#themeSelect,#headerThemeProxy,#equipmentTheme,#theme")){
  if(!Array.from(el.options||[]).some(x=>x.value===current))el.add(new Option(labels[current],current));
  el.value=current;
 }
 headerObserver?.disconnect();headerArt=null;
 document.querySelectorAll(".sarch-theme-character").forEach(el=>el.remove());
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
 if(home){
  const header=document.querySelector(".header");
  if(header&&!document.getElementById("sarchGlobalTheme")){
   const wrap=document.createElement("label");wrap.className="sarch-global-picker";wrap.htmlFor="sarchGlobalTheme";
   const label=document.createElement("span");label.textContent="테마 선택";
   const sel=document.createElement("select");sel.id="sarchGlobalTheme";sel.setAttribute("aria-label","전체 화면 테마");
   for(const [key,name] of Object.entries(labels))sel.add(new Option(name,key));
   wrap.append(label,sel);header.append(wrap);
   sel.addEventListener("change",()=>{try{localStorage.setItem(KEY,sel.value)}catch(e){}apply(sel.value)});
  }
 }else{
  for(const el of document.querySelectorAll("#themeSelect,#headerThemeProxy,#equipmentTheme,#theme")){const wrap=el.closest(".theme-picker")||el.closest("label")||el;wrap.hidden=true;wrap.classList.add("sarch-legacy-theme-hidden")}
 }
 apply(stored());
 // Legacy scripts can initialize once on load; the global selection always wins.
 window.addEventListener("load",()=>apply(stored()),{once:true});
 window.addEventListener("pageshow",()=>apply(stored()));
 window.addEventListener("resize",placeHeader,{passive:true});
 window.addEventListener("storage",e=>{if(e.key===KEY)apply(stored())});
 media.addEventListener?.("change",()=>{if(stored()==="system")apply("system")});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();