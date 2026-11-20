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
const P={
 shinchan:['<path d="M13 57q10-10 21 0m-29 0q6-13 12 0m198 0q9-15 17 0m-6 0q13-19 20 0" stroke="#8dbd82" stroke-width="3" fill="none"/><g transform="translate(175 36) rotate(18)"><path d="M0 0h9v27l-4.5 6L0 27Z" fill="#e86959"/><path d="M0 9h9v12H0z" fill="#f5d36c"/></g><g fill="#a8c4da"><path d="M38 18q-9-12 6-12 5-12 17-1 12-6 18 5 9 9-8 10Z"/></g>',
 '<g transform="translate(190 29)"><path d="M0 17L15 2 30 17Z" fill="#e68b6c"/><rect x="5" y="17" width="20" height="21" rx="2" fill="#f2cd72"/><path d="M12 38V24h7v14" fill="#739bc1"/></g><path d="M8 58h240" stroke="#9bb78a" stroke-dasharray="3 5"/>',
 '<circle cx="30" cy="45" r="12" fill="#e9e8d9" stroke="#739dc2" stroke-width="2"/><path d="M30 34l7 5-3 8h-8l-3-8zM19 43l7 4m8 0 8-4m-12 5v8" stroke="#739dc2" fill="#739dc2"/><path d="M201 18l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#f2c766"/>',
 '<g transform="translate(187 22)"><path d="M4 32L16 0 28 32Z" fill="#ed875a" stroke="#f1e1c5" stroke-width="1.5"/><path d="M10 15h12m-16 10h20" stroke="#fff0d8" stroke-width="4"/><rect y="32" width="32" height="5" rx="2" fill="#e2ac6c"/></g><path d="M7 57q7-10 14 0m215 0q7-11 15 0" stroke="#8bbd80" stroke-width="3" fill="none"/>'],
 pokemon:['<path d="M32 4L17 28h14l-5 19 23-29H34l7-14Z" fill="#f7cb54"/>','<path d="M25 4q15 14 5 32-17-4-16-14 7 4 11-18Z" fill="#f2a057"/>','<path d="M24 5q-16 20-9 29 10 11 20 0 6-9-11-29Z" fill="#64c8f0"/>','<path d="M24 5v28m-13-21 26 16m-26 0 26-16" stroke="#95d9ef" stroke-width="2.5"/>'],
 digimon:['<path d="M7 8h7v7H7zm10 10h5v5h-5zm196 2h7v7h-7z" fill="#61caee"/><path d="M8 54h70l12-6h105l13 6h40" stroke="#50b8dd" stroke-width="1.4" fill="none"/>'],
 marvel:['<circle cx="25" cy="28" r="16" fill="#12273c" stroke="#82ddf1" stroke-width="2"/><circle cx="25" cy="28" r="10" fill="none" stroke="#82ddf1" stroke-width="1.5"/><path d="M25 20l8 13H17z" fill="#b3efff"/>','<circle cx="25" cy="28" r="16" fill="#bd404c"/><circle cx="25" cy="28" r="12" fill="#eae5d9"/><circle cx="25" cy="28" r="8" fill="#355f9d"/><path d="M25 21l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z" fill="#fff"/>','<path d="M8 9l31 31M39 9L8 40M23 3v43M3 24h41M9 24l5-10 9-5 10 5 5 10-5 10-10 5-9-5z" stroke="#dbe6ee" stroke-width="1.4" fill="none"/>','<path d="M12 42l-5-11 9-12 8 4 8-7 9 9-1 16-13 5Z" fill="#7da775" stroke="#d3e5bc" stroke-width="1.3"/>']
};
const pokeball='<g transform="translate(213 43)"><circle r="12" fill="#f5f0df" stroke="#182435" stroke-width="1.5"/><path d="M-12 0a12 12 0 0 1 24 0Z" fill="#dc5754"/><path d="M-12 0h24" stroke="#182435" stroke-width="2"/><circle r="3.7" fill="#fff" stroke="#182435" stroke-width="1.5"/></g>';
const digivice='<g transform="translate(214 22)"><rect width="25" height="32" rx="6" fill="#b8d0df" stroke="#476c8a" stroke-width="1.5"/><rect x="4" y="5" width="17" height="13" rx="2" fill="#47b3df"/><path d="M8 12h9m-5-4v8" stroke="#e5f9ff"/><circle cx="7" cy="25" r="2" fill="#eeaf54"/><circle cx="18" cy="25" r="2" fill="#eeaf54"/></g>';
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
function decoration(theme,i){
 const wrap=document.createElement("span");wrap.className="sarch-theme-character sarch-theme-card-character";wrap.setAttribute("aria-hidden","true");
 const prop=P[theme][i%P[theme].length]+(theme==="pokemon"?pokeball:theme==="digimon"?digivice:"");
 wrap.innerHTML='<svg class="sarch-theme-props" viewBox="0 0 250 64" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">'+prop+'</svg>';
 wrap.append(artwork(images[theme][i],"sarch-theme-main-art",theme));
 if(companions[theme])wrap.append(artwork(companions[theme][i],"sarch-theme-companion-art",theme));
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