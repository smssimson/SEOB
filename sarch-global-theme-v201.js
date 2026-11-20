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
// Paint-only work scenes: no extra controls or measurement data.
const workTools=[
 '<g transform="translate(0 0)"><path d="M106 38l20-27h22l7 7h19v34h-68z" fill="#354b5c" stroke="#e4cd9c" stroke-width="1.9"/><rect x="111" y="26" width="56" height="27" rx="5" fill="#263645" stroke="#efdbad" stroke-width="1.6"/><circle cx="146" cy="39" r="13" fill="#17252f" stroke="#e9c973" stroke-width="3"/><circle cx="146" cy="39" r="7" fill="#6397af"/><path d="M143 36l6-3" stroke="#daeff8" stroke-width="2.5" stroke-linecap="round"/><path d="M174 25l23-12m-20 26h25m-27 9 20 12" stroke="#f4d16c" stroke-width="2" stroke-linecap="round"/><path d="M193 10v15m0-15h14m-14 48v-14m0 14h14" stroke="#e7cd93" fill="none" stroke-width="1.5"/></g>',
 '<g><path d="M103 92l97-4 23 35H82z" fill="#b88c5e" stroke="#e2c9a3" stroke-width="1.5"/><path d="M103 96h89l17 23H91z" fill="#f5e5c6" stroke="#c5a37c" stroke-width="1.4"/><path d="M112 101h73l9 13h-84zm35 0v13m20-13 3 8h19m-57 0h15" fill="none" stroke="#6a879b" stroke-width="1.2"/><path d="M119 102l35-38 5 5-34 37-9 4z" fill="#ecc760" stroke="#574b3b" stroke-width="1.1"/><path d="M155 64l4 5 5-5-5-5z" fill="#de7770"/><path d="M201 91l15-18 5 18z" fill="#e9bd5a" stroke="#725a3e" stroke-width="1.2"/></g>',
 '<g><path d="M190 22l27-9 19 11v94l-46 6z" fill="#6a7276" stroke="#c9c9ba" stroke-width="1.6"/><path d="M216 13v103m-11-68 7 8-4 7m20-11-5 10 6 8m-23 12-2 8 5 5" fill="none" stroke="#b1aaa0" stroke-width="1.5"/><g transform="translate(109 48) rotate(-9)"><path d="M0 0h18v30H0z" fill="#c2a36d" stroke="#6f6755" stroke-width="1.6"/><rect x="17" y="-1" width="39" height="32" rx="6" fill="#d4d0bc" stroke="#655c50" stroke-width="1.6"/><rect x="25" y="6" width="20" height="13" rx="2" fill="#334b57"/><path d="M56 6h15v18H56z" fill="#9eaaa7" stroke="#716b60" stroke-width="1.4"/><path d="M71 11h21v8H71z" fill="#e3e2d1" stroke="#716b60"/><path d="M31 10h9m-9 4h7" stroke="#c5e6c2" stroke-width="1.4"/></g><path d="M185 45l-5-11m8 7 6-9" stroke="#eac778" stroke-width="2" stroke-linecap="round"/></g>',
 '<g><path d="M174 66l-26 56m26-56 33 56m-33-56v56" stroke="#d4b47c" stroke-width="3.7" stroke-linecap="round"/><rect x="155" y="40" width="43" height="29" rx="5" fill="#e6bb5c" stroke="#675c4e" stroke-width="1.6"/><path d="M155 46h-10v15h10m43-15h9v15h-9" fill="#657c86" stroke="#bccece" stroke-width="1.3"/><rect x="164" y="46" width="23" height="17" rx="3" fill="#314d60" stroke="#83bacb"/><circle cx="175" cy="54" r="4" fill="#7cc7d5"/><path d="M174 29v11m-15-11h30" stroke="#c3b292" stroke-width="2" stroke-linecap="round"/><path d="M174 54h63" stroke="#e7d5a3" stroke-width="1.1" stroke-dasharray="4 4"/><g transform="translate(109 77) rotate(-12)"><rect width="31" height="37" rx="3" fill="#bd9165" stroke="#f0d0a1"/><rect x="4" y="5" width="23" height="28" fill="#f2e7cf"/><path d="M8 11h14m-14 6h12m-12 6h14" stroke="#637d8a" stroke-width="1.3"/></g></g>'
];
const handColours={shinchan:"#f3c59b",pokemon:"#ebc965",digimon:"#dfa756",marvel:"#bd5960"};
function workScene(theme,i){
 const stroke="#302e35",skin=handColours[theme],asset=(file)=>new URL("sarch-theme-"+file,base).href;
 const isShin=theme==="shinchan",isMarvel=theme==="marvel";
 const hero=isShin?"shinchan-0.webp":images[theme][i];
 const main=asset(hero);
 const inner=isShin
 ? '<defs><clipPath id="sarch-face-'+i+'"><rect x="33" y="5" width="77" height="66" rx="14"/></clipPath></defs><path d="M51 103l-2 12-13 4q-4 4 5 6h21l4-16m11-6 2 13 15 5q5 5-5 5H68l-3-17" fill="#f3cf80" stroke="#302e35" stroke-width="1.5"/><path d="M45 85l-3 23 23 4 19-4 3-23z" fill="#e8c75c" stroke="#342d31" stroke-width="1.8"/><path d="M45 56q-16 10-13 29l15 12 39-2 11-15-7-24z" fill="#d85846" stroke="#302e35" stroke-width="1.7"/><path d="M54 60l-6 28 15 4 24-4-9-29z" fill="#e4b64f" stroke="#695542" stroke-width="1.2"/><path d="M60 64v23m18-21 5 21" fill="none" stroke="#fff0bc" stroke-width="3"/><image href="'+main+'" x="30" y="4" width="83" height="121" preserveAspectRatio="xMidYMin meet" clip-path="url(#sarch-face-'+i+')"/><path d="M31 24Q35 3 65 2Q94 2 104 26l-71 4z" fill="#f0e9d9" stroke="#4a4843" stroke-width="1.8"/><path d="M28 27q38-4 81-1l-4 7H30z" fill="#dfd9c8" stroke="#4a4843" stroke-width="1.5"/><path d="M71 5l7 19" stroke="#a8a49f" stroke-width="1.8"/>'
 : (isMarvel?'<defs><clipPath id="sarch-hero-'+i+'"><rect x="32" y="6" width="83" height="92" rx="20"/></clipPath></defs><path d="M48 71L34 119h79L97 71Z" fill="'+(i===3?"#608c65":i===1?"#45699b":"#a1444d")+'" stroke="#20303a" stroke-width="2"/><image href="'+main+'" x="28" y="1" width="91" height="108" preserveAspectRatio="xMidYMid slice" clip-path="url(#sarch-hero-'+i+')"/>':'<image href="'+main+'" x="13" y="3" width="114" height="122" preserveAspectRatio="xMidYMax meet"/>');
 const poseY=[44,92,64,91][i];
 const handX=[111,123,118,111][i];
 const handY=[40,100,66,91][i];
 const arm='<path d="M'+(isShin?80:83)+' '+(isShin?68:75)+'Q96 '+(poseY+4)+' '+handX+' '+handY+'" fill="none" stroke="'+stroke+'" stroke-width="'+(isShin?15:12)+'" stroke-linecap="round"/><path d="M'+(isShin?80:83)+' '+(isShin?68:75)+'Q96 '+(poseY+4)+' '+handX+' '+handY+'" fill="none" stroke="'+(isShin?"#d85846":skin)+'" stroke-width="'+(isShin?11:9)+'" stroke-linecap="round"/>';
 const hand='<circle cx="'+handX+'" cy="'+handY+'" r="5.8" fill="'+skin+'" stroke="'+stroke+'" stroke-width="1.3"/>';
 const props=P[theme][i%P[theme].length]+(theme==="pokemon"?pokeball:theme==="digimon"?digivice:"");
 return '<svg viewBox="0 0 250 136" xmlns="http://www.w3.org/2000/svg" class="sarch-work-scene" aria-hidden="true"><ellipse cx="116" cy="126" rx="104" ry="5" fill="#09131d" opacity=".37"/><path d="M3 126h240" stroke="#c4ab7e" stroke-width="1" opacity=".55"/><g transform="translate(0 66)">'+props+'</g>'+inner+arm+workTools[i]+hand+'</svg>';
}
function decoration(theme,i){
 const wrap=document.createElement("span");wrap.className="sarch-theme-character sarch-theme-card-character sarch-action-scene";wrap.setAttribute("aria-hidden","true");
 wrap.innerHTML=workScene(theme,i);
 if(companions[theme])wrap.append(artwork(companions[theme][i],"sarch-theme-companion-art sarch-action-companion",theme));
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