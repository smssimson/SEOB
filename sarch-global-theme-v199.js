/* S:ARCH unified theme selector and removable illustrated theme pack. */
(()=>{"use strict";
const KEY="sarch-global-theme-v199";
const labels={dark:"기본 · S:ARCH",light:"라이트",navy:"네이비",forest:"포레스트",slate:"슬레이트",ocean:"오션",sand:"샌드",lavender:"라벤더",rose:"로즈",graphite:"그라파이트",paper:"도면지",blueprint:"블루프린트",mint:"민트",system:"기기 설정",shinchan:"짱구",pokemon:"포켓몬",digimon:"디지몬",marvel:"마블"};
const S=(inner)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 88" aria-hidden="true"><g stroke="#242733" stroke-width="1.65" stroke-linejoin="round" stroke-linecap="round">'+inner+'</g></svg>';
const eyes=(a=39,b=64,y=40)=>'<ellipse cx="'+a+'" cy="'+y+'" rx="3.5" ry="5" fill="#20252b"/><ellipse cx="'+b+'" cy="'+y+'" rx="3.5" ry="5" fill="#20252b"/>';
const ball='<circle cx="92" cy="70" r="12" fill="#fff9eb"/><path d="M80 70a12 12 0 0 1 24 0z" fill="#e75b54"/><path d="M80 70h24"/><circle cx="92" cy="70" r="3.8" fill="#fff"/>';
const device='<g transform="translate(80 51)"><rect width="25" height="30" rx="6" fill="#ccd9e5"/><rect x="4" y="5" width="17" height="13" rx="2" fill="#59c9ec"/><path d="M8 12h9m-5-4v8" fill="none"/><circle cx="7" cy="24" r="2" fill="#f3aa38"/><circle cx="18" cy="24" r="2" fill="#f3aa38"/></g>';
const shield='<circle cx="90" cy="67" r="16" fill="#d6454d"/><circle cx="90" cy="67" r="11" fill="#f5f1e5"/><circle cx="90" cy="67" r="7.5" fill="#395d9a"/><path d="M90 60l2 4.5 5 .5-4 3 1 5-4-2.5-4 2.5 1-5-4-3 5-.5z" fill="#fff" stroke="none"/>';
const shin='<path d="M29 60q-10 10-5 20h43l4-20" fill="#e34c47"/><path d="M30 76h32v10H30z" fill="#f8d85c"/><path d="M15 40Q12 19 30 12Q53 0 69 17Q85 16 86 38L77 55Q62 74 34 62Q13 63 15 40Z" fill="#f5bf9a"/><path d="M16 30Q12 12 33 8Q59 2 74 19L77 28Q67 21 62 28Q51 17 44 28Q33 20 28 30Z" fill="#292329"/><path d="M33 31q7-7 14-1m8-1q7-7 14 1" stroke="#28242a" stroke-width="4" fill="none"/>'+eyes(41,63,40)+'<ellipse cx="58" cy="54" rx="6" ry="4" fill="#c75d59"/>';
const shiro='<path d="M31 53q-14 4-13 20 0 9 11 9h45q13-1 8-17L70 53" fill="#fffdf5"/><path d="M70 65q24-12 21 3-2 5-10 8" fill="#fffdf5"/><ellipse cx="49" cy="38" rx="29" ry="23" fill="#fffdf5"/><path d="M25 22Q9 15 8 36q4 12 15 4M72 22q17-8 18 13-4 10-13 4" fill="#fffdf5"/><path d="M34 36q5-3 8 2m15 0q5-5 9-2" fill="none"/><ellipse cx="50" cy="44" rx="4" ry="2.5" fill="#292329"/><path d="M45 50q6 5 12 0" fill="none"/><path d="M32 61h34" stroke="#6bb2d4" stroke-width="4"/>';
const action='<path d="M30 54L17 82H79L65 54" fill="#23539a"/><path d="M28 64h46v8H28" fill="#f8cc55"/><path d="M28 16Q48 2 69 16L76 35 65 57H33L21 35Z" fill="#254e89"/><path d="M23 21l26 6 25-6-7 16-18 3-18-3Z" fill="#f5efe0"/><path d="M42 9l7 12 8-12" fill="#ee4a4a"/><path d="M39 43h20l-4 9H43Z" fill="#e3b98b"/><path d="M28 63L12 52v30h17" fill="#ce3d43"/><path d="M79 8l23 2-10 11 10 3-25 18 7-16-10-2z" fill="#f8d05b"/>';
const buri='<ellipse cx="48" cy="45" rx="27" ry="32" fill="#efb7b2"/><path d="M25 21l3-13 11 11M57 18L69 8l4 17" fill="#efb7b2"/><ellipse cx="48" cy="48" rx="18" ry="11" fill="#e39c91"/><ellipse cx="42" cy="48" rx="2" ry="4" fill="#473030"/><ellipse cx="54" cy="48" rx="2" ry="4" fill="#473030"/>'+eyes(36,61,34)+'<path d="M19 67h57v15H19z" fill="#dc8057"/><path d="M84 17l6 3-14 48-5-3z" fill="#a6b9c8"/>';
const pika='<path d="M70 65l20-22-10-6 19-27 6 17-12 15 10 7-28 25Z" fill="#f6d34d"/><path d="M29 32L14 4 22 3 43 26M60 26L83 3l6 4-14 33" fill="#f7d34d"/><path d="M14 4l8-1 9 11-10 5zM83 3l6 4-6 13-10-6z" fill="#312b2b"/><ellipse cx="51" cy="64" rx="26" ry="19" fill="#f7d34d"/><ellipse cx="51" cy="40" rx="31" ry="24" fill="#f7d34d"/>'+eyes(38,64,38)+'<circle cx="29" cy="49" r="6.5" fill="#e65549"/><circle cx="73" cy="49" r="6.5" fill="#e65549"/><path d="M46 46l5 2 5-2m-11 8q6 6 12 0" fill="none"/>';
const cynda='<path d="M19 65Q4 51 17 36L20 23l7 13L36 9l5 24 11-17 3 25" fill="#eb7044"/><path d="M20 60L17 42l11 6 10-19 5 18 9-7 6 19" fill="#f6cf57"/><path d="M25 63q0-23 29-25l26 10 10 16-9 15H26Z" fill="#f4dbae"/><path d="M30 61q-8-27 22-38l31 13 7 9-20 13z" fill="#3d617c"/><path d="M66 42q6-6 12 0" fill="none"/><path d="M78 57l7 1" fill="none"/>';
const mudkip='<path d="M40 25L49 3l13 25M25 58L9 49l9 17 14 8M78 58l19-9-9 17-15 8" fill="#70b9dc"/><ellipse cx="51" cy="64" rx="28" ry="19" fill="#83cae7"/><ellipse cx="51" cy="40" rx="32" ry="23" fill="#83cae7"/><path d="M21 39l-12 4 8 6-3 6 13-1M81 39l12 4-8 6 3 6-13-1" fill="#f4a24b"/>'+eyes(37,66,40)+'<path d="M45 52q6 4 12 0" fill="none"/>';
const pip='<ellipse cx="50" cy="64" rx="26" ry="22" fill="#77b8df"/><ellipse cx="50" cy="64" rx="17" ry="17" fill="#eff7f0"/><ellipse cx="50" cy="34" rx="29" ry="25" fill="#5b9bc9"/><path d="M50 30Q29 14 28 39q5 18 22 14 17 4 22-14-1-25-22-9z" fill="#f8f5ea"/>'+eyes(39,61,37)+'<path d="M44 46h12l-6 7z" fill="#e7b346"/><path d="M29 70L13 58l4 19 12 4M71 70L87 58l-4 19-12 4" fill="#5b9bc9"/><ellipse cx="38" cy="82" rx="9" ry="4" fill="#e7b346"/><ellipse cx="62" cy="82" rx="9" ry="4" fill="#e7b346"/>';
const agu='<path d="M24 64Q4 61 10 77l22 3M65 68l22-2 9 12-28 4" fill="#ecad4e"/><path d="M29 66q-12-22 5-35L50 12 69 17 78 35 89 41 82 58 60 63 65 82H31Z" fill="#f5b44b"/><path d="M42 23l12-16 7 12" fill="#f5b44b"/><ellipse cx="63" cy="35" rx="8" ry="11" fill="#f7f5dd"/><ellipse cx="65" cy="36" rx="3" ry="6" fill="#459862"/><path d="M65 49l17-1-10 7-10-1" fill="#633c2d"/><path d="M30 72l-8 4m18 4-3 6m16-6 4 6" stroke="#fff8df" stroke-width="3"/>';
const gabu='<path d="M27 64L10 77h24l14 8 17-8 17 5 8-16-20-8" fill="#d7edf5"/><path d="M24 47Q12 24 30 18L42 3 52 18 72 13 80 29 91 38 79 59 61 65 44 79 28 65Z" fill="#9dcce3"/><path d="M43 18L48 3l10 21" fill="#f6d16e"/><path d="M23 33l16 7-13 8m49-22-13 10 18 4M39 65l6-10 9 10" fill="#3479ba"/><path d="M34 44q3-13 26-12l22 16-12 12H40Z" fill="#f5e3ae"/>'+eyes(47,65,44)+'<path d="M54 56q7 4 13-1" fill="none"/>';
const pata='<path d="M34 36Q7 6 5 27q2 18 24 24M67 36Q94 6 96 27q-2 18-24 24" fill="#d99167"/><path d="M14 26l15 16M87 26L72 42" stroke="#f7d4b9" stroke-width="4"/><ellipse cx="50" cy="59" rx="32" ry="25" fill="#efb16e"/><ellipse cx="50" cy="47" rx="27" ry="21" fill="#efb16e"/>'+eyes(39,62,45)+'<path d="M45 55q5 5 10 0" fill="none"/><ellipse cx="36" cy="78" rx="9" ry="5" fill="#fff2d9"/><ellipse cx="64" cy="78" rx="9" ry="5" fill="#fff2d9"/>';
const gato='<path d="M31 31L24 6 44 18 60 18 77 6 73 35" fill="#f5f2e8"/><path d="M28 12l9 8-7 6M73 12l-9 8 7 6" fill="#bca8cb"/><ellipse cx="52" cy="62" rx="24" ry="22" fill="#f4f1e8"/><path d="M71 64q26-14 24 1-1 11-16 9" fill="none" stroke="#f6f3e8" stroke-width="7"/><ellipse cx="52" cy="40" rx="30" ry="23" fill="#f4f1e8"/><ellipse cx="40" cy="39" rx="5" ry="7" fill="#55add3"/><ellipse cx="64" cy="39" rx="5" ry="7" fill="#55add3"/><path d="M46 49l6 3 6-3m-10 8q4 3 8 0" fill="none"/><path d="M29 67h14v14H29ZM61 67h14v14H61Z" fill="#d4ca6d"/>';
const iron='<path d="M28 58L18 81H80L72 58" fill="#b92f3c"/><circle cx="50" cy="70" r="8" fill="#87e3f5"/><path d="M24 16L50 6 76 16 82 39 72 63H28L18 39Z" fill="#bf3341"/><path d="M29 20l21 4 21-4 4 18-9 19H34l-9-19Z" fill="#e8bf71"/><path d="M30 35l15 3-2 5-13-3m26-2 15-3v5l-13 3" fill="#b2eafb"/><path d="M39 52h22" fill="none"/>';
const cap='<path d="M27 58L14 82h70L72 58" fill="#2d5489"/><path d="M50 61l3 6 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#fff"/><ellipse cx="50" cy="35" rx="29" ry="29" fill="#345d98"/><path d="M25 39l9-7h33l9 7-6 18H30Z" fill="#e8bf9d"/><path d="M30 31h16v9H30ZM54 31h16v9H54Z" fill="#e9eff4"/><text x="50" y="23" font-size="15" text-anchor="middle" font-family="Arial" font-weight="bold" fill="#fff" stroke="none">A</text><path d="M43 51h14" fill="none"/>';
const spidey='<path d="M28 58L15 82h68L72 58" fill="#28528a"/><ellipse cx="50" cy="35" rx="29" ry="30" fill="#db4048"/><g fill="none" stroke="#6e2934" stroke-width="1.2"><path d="M50 5v60M24 13l52 43M76 13L24 56M21 35h58M30 9q20 16 40 0M22 24q28 16 56 0M22 46q28-16 56 0M30 59q20-16 40 0"/></g><path d="M27 23l19 15-6 13q-15-5-13-28ZM73 23L54 38l6 13q15-5 13-28Z" fill="#fff" stroke="#28252e" stroke-width="2.6"/><path d="M50 65v12m-7-8 14 5m-14 1 14-5" stroke="#e44449" stroke-width="2"/>';
const hulk='<path d="M27 56L10 74l13 9h56l13-9-17-18" fill="#70a86b"/><path d="M25 17L36 6l13 4 14-5 16 12-2 35-15 11H36L23 52Z" fill="#82b977"/><path d="M23 23V13L35 5l12 5 15-5 16 9v10L64 16l-8 6-11-7-11 7z" fill="#29382d"/><path d="M30 31l14 3m12 0 14-3" stroke-width="3"/>'+eyes(39,62,40)+'<path d="M36 53q14-6 28 0v5H36Z" fill="#f6f5dd"/><path d="M29 77h42v9H29z" fill="#765a8e"/>';
const crayon='<g transform="translate(88 47) rotate(23)"><path d="M0 0h8v30l-4 7-4-7z" fill="#e35e58"/><path d="M0 9h8v14H0z" fill="#f6d569"/></g>';
const illustrations={
 shinchan:[S(shin+crayon),S(shiro+crayon),S(action),S(buri)],
 pokemon:[S(pika+ball),S(cynda+ball),S(mudkip+ball),S(pip+ball)],
 digimon:[S(agu+device),S(gabu+device),S(pata+device),S(gato+device)],
 marvel:[S(iron+'<circle cx="92" cy="67" r="12" fill="#8ee0f0"/><path d="M92 57l9 15H83z" fill="#fff"/>'),S(cap+shield),S(spidey+'<path d="M89 54v28m-12-14h24m-20-10 16 20m0-20L81 78" stroke="#e5e8ef" fill="none"/>'),S(hulk+'<path d="M83 73l-4-8 8-9 9 6 8-2 3 12-10 8z" fill="#9d9d97"/>')]
};
const titles={shinchan:["짱구","흰둥이","액션가면","부리부리자에몽"],pokemon:["피카츄","브케인","물짱이","팽도리"],digimon:["아구몬","파피몬","파닥몬","가트몬"],marvel:["아이언맨","캡틴 아메리카","스파이더맨","헐크"]};
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
 const pack=illustrations[current];
 document.querySelectorAll(".sarch-theme-character").forEach(el=>el.remove());
 if(!pack)return;
 const mod=document.documentElement.dataset.module;
 if(mod==="home"){
  document.querySelectorAll(".modules .module").forEach((card,i)=>{
   if(i>=4)return;const d=document.createElement("span");d.className="sarch-theme-character sarch-theme-card-character";d.setAttribute("aria-hidden","true");d.innerHTML=pack[i];card.append(d);
  });
 }else{
  const i=["survey","drawing","schmidt","tilt"].indexOf(mod);
  const header=document.querySelector(".smetric-app-header");
  if(i>=0&&header){const d=document.createElement("span");d.className="sarch-theme-character sarch-theme-header-character";d.setAttribute("aria-hidden","true");d.title=titles[current][i];d.innerHTML=pack[i];header.append(d)}
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
 window.addEventListener("storage",e=>{if(e.key===KEY)apply(stored())});
 media.addEventListener?.("change",()=>{if(stored()==="system")apply("system")});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();