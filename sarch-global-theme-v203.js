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
  ctx.putImageData(d,0,0);img.src=c.toDataURL("image/png");
 }catch(e){}},{once:true});return img;
}

const colors={shinchan:["#e5ca9b","#324c63","#213a52","#e6c475"],pokemon:["#f2d18b","#355d72","#27495a","#e8ca63"],digimon:["#92d7ef","#224b70","#16334f","#61cbe9"],marvel:["#e3c6aa","#3e4b64","#253750","#d9948b"]};
function atlas(theme,i,x=0,y=0,w=600,h=360){
 const src=new URL("sarch-v203-"+theme+"-atlas.webp",base).href;
 return '<svg x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" viewBox="'+(i%2*600)+' '+(Math.floor(i/2)*360)+' 600 360" preserveAspectRatio="xMidYMax meet" overflow="hidden"><image href="'+src+'" width="1200" height="720"/></svg>';
}
// The two facade planes share one real corner, B=(437,330) and T=(455,30).
// Shearing all facade points together preserves correct corner geometry.
function corner(theme){
 const [line,left,right,accent]=colors[theme], id="sarch-"+theme+"-corner";
 let wins="";
 for(let j=0;j<4;j++){let y=108+j*51;wins+='<path d="M320 '+(y+17)+'L421 '+(y-16)+'V'+(y+15)+'L320 '+(y+37)+'Z M453 '+(y-16)+'L545 '+(y+17)+'V'+(y+37)+'L453 '+(y+15)+'Z" fill="url(#'+id+'-glass)" stroke="'+line+'" stroke-opacity=".62" stroke-width="1.15"/><path d="M353 '+(y+6)+'V'+(y+30)+'M387 '+(y-5)+'V'+(y+23)+'M484 '+(y-5)+'V'+(y+23)+'M515 '+(y+6)+'V'+(y+30)+'" stroke="'+line+'" stroke-opacity=".35" stroke-width=".85"/>'}
 return '<defs><linearGradient id="'+id+'-left" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+left+'"/><stop offset="1" stop-color="#172b40"/></linearGradient><linearGradient id="'+id+'-right" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+right+'"/><stop offset="1" stop-color="#101c2a"/></linearGradient><linearGradient id="'+id+'-glass" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#61859b" stop-opacity=".73"/><stop offset=".42" stop-color="#253f59"/><stop offset="1" stop-color="#14283d"/></linearGradient></defs><g transform="matrix(1 0 -.06 1 19.8 0)" stroke-linejoin="round"><path d="M301 91L437 30V330H301Z" fill="url(#'+id+'-left)" stroke="'+line+'" stroke-width="1.65"/><path d="M437 30L565 91V330H437Z" fill="url(#'+id+'-right)" stroke="'+line+'" stroke-width="1.65"/><path d="M301 99L437 39L565 99M301 153L437 100L565 153M301 205L437 163L565 205M301 257L437 226L565 257M301 310L437 290L565 310" fill="none" stroke="'+line+'" opacity=".56" stroke-width="1.7"/>'+wins+'<path d="M312 91L437 35L553 91M301 330H565" fill="none" stroke="'+line+'" stroke-opacity=".8" stroke-width="2"/></g><path d="M282 330H586" stroke="'+line+'" opacity=".65" stroke-width="1.4"/><g fill="none" stroke="'+accent+'" stroke-width="1.85" stroke-linecap="butt"><path class="sarch-corner-plumb" d="M437 330V30" stroke-dasharray="7 6"/><path class="sarch-corner-actual" d="M437 330L455 30"/></g>';
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