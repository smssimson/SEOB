/* S:ARCH v139: optional cross-program dock. Does not alter existing data or autosave handlers. */
(function(){
"use strict";
const match=location.pathname.match(/\/(survey|drawing|schmidt|tilt)(?:\/|$)/);
if(!match)return;
const current=match[1],root=new URL("../",location.href);
const mods=[
 {key:"home",label:"홈",path:"",icon:'<path d="M6 26 24 10l18 16V44H11V26M19 44V31h11v13"/>'},
 {key:"survey",label:"현장조사",path:"survey/",icon:'<rect x="10" y="7" width="28" height="40" rx="4"/><path d="M18 19h12M18 27h8M18 35h12"/><path d="m33 31 7 7 7-9"/>'},
 {key:"drawing",label:"도면작성",path:"drawing/",icon:'<path d="M9 44V9h34v35Z"/><path d="M9 26h34M23 9v35M23 33h20M33 26v7"/>'},
 {key:"schmidt",label:"장비조사",path:"schmidt/",icon:'<path d="M5 21h9v15H5M14 18h27v20H14M41 14h8v28h-8"/><rect x="23" y="23" width="12" height="10" rx="2"/>'},
 {key:"tilt",label:"기울기",path:"tilt/",icon:'<path d="M9 43V18l15-8 15 8v25M24 10v33M9 43h36"/><path d="M24 5v42" stroke-dasharray="3 4"/><path d="M24 43l7-31" stroke="#fa8b96"/>'}
];
function setup(){
 if(document.getElementById("sarchQuickDock"))return;
 const dock=document.createElement("div");dock.id="sarchQuickDock";
 const panel=document.createElement("nav");panel.className="sarch-dock-panel";
 panel.id="sarchDockPanel";panel.setAttribute("aria-label","다른 S:ARCH 프로그램으로 이동");
 for(const item of mods){
  const link=document.createElement("a");
  link.href=new URL(item.path,root).href;link.setAttribute("aria-label",item.label+" 열기");
  if(item.key===current)link.setAttribute("aria-current","page");
  link.innerHTML='<svg viewBox="0 0 54 54" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+item.icon+'</svg><span>'+item.label+'</span>';
  panel.appendChild(link);
 }
 const toggle=document.createElement("button");toggle.type="button";
 toggle.className="sarch-dock-toggle";
 toggle.setAttribute("aria-controls","sarchDockPanel");toggle.setAttribute("aria-expanded","false");
 toggle.innerHTML='<span class="sarch-dock-chevron" aria-hidden="true"></span><span class="sarch-dock-label">프로그램</span>';
 function close(){dock.classList.remove("is-open");toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-label","프로그램 전환 메뉴 열기");}
 function open(){dock.classList.add("is-open");toggle.setAttribute("aria-expanded","true");toggle.setAttribute("aria-label","프로그램 전환 메뉴 닫기");}
 toggle.setAttribute("aria-label","프로그램 전환 메뉴 열기");
 toggle.addEventListener("click",()=>{dock.classList.contains("is-open")?close():open()});
 document.addEventListener("pointerdown",e=>{if(dock.classList.contains("is-open")&&!dock.contains(e.target))close()});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&dock.classList.contains("is-open")){close();toggle.focus()}});
 panel.addEventListener("click",e=>{if(e.target.closest("a"))close()});
 dock.append(panel,toggle);document.body.appendChild(dock);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})();