/* S:ARCH v148 · concise drawing tools, inline eraser size, original output panel.
   Move original controls only; no drawing geometry, data, import/export or storage changes. */
(function(){
"use strict";
if(!/\/drawing(?:\/|$)/.test(location.pathname))return;
let ready=false;
function init(){
 if(ready||document.getElementById("sarchDrawTabs144"))return;
 const root=document.querySelector(".sm43-tool-panel");
 const content=root?.querySelectorAll(".sm43-group-content");
 const oldTabs=root?.querySelector(".sm43-tabs"),oldDeck=root?.querySelector(".sm43-deck");
 const output=document.querySelector(".sm-drawing-output");
 const side=document.getElementById("side");
 if(!root||content?.length!==2||!oldTabs||!oldDeck||!output||!side)return;
 const field=content[0],util=content[1];
 // Remove the drawing-only "기타 도면 도구" row without deleting any
 // original DOM control or event handler; keep hidden legacy actions hidden.
 const floorMore=document.querySelector("#sarchFloor135 .sarch-floor-more-v135");
 const floorRight=document.querySelector("#sarchFloor135 .sarch-floor-group-right-v135");
 if(floorMore&&floorRight){
  const extra=floorMore.querySelector(".sarch-floor-extras-v135");
  if(extra){
   while(extra.firstChild){
    const node=extra.firstChild;
    if(node.nodeType===1&&node.matches(".hint"))node.hidden=true;
    floorRight.appendChild(node);
   }
  }
  floorMore.remove();
 }

 const needed=["modeFree","modePoints","modeSelect","modeErase"];
 if(needed.some(id=>!document.getElementById(id)))return;

 const nav=document.createElement("div");
 nav.id="sarchDrawTabs144";nav.className="sarch-draw-tabs-v144";
 nav.setAttribute("role","tablist");nav.setAttribute("aria-label","도면작성 도구 분류");
 const surface=document.createElement("div");
 surface.id="sarchDrawSurface144";surface.className="sarch-draw-surface-v144";
 const kinds=[
  {key:"draw",label:"그리기",symbol:"✎"},
  {key:"member",label:"벽체·부재",symbol:"▦"},
  {key:"edit",label:"편집",symbol:"⌁"}
 ];
 const panes={};const tabs={};
 for(const {key,label,symbol} of kinds){
  const tab=document.createElement("button");tab.type="button";
  tab.className="sarch-draw-tab-v144";tab.id="sarchDrawTab144-"+key;
  tab.setAttribute("role","tab");tab.setAttribute("aria-controls","sarchDrawPanel144-"+key);
  tab.textContent=symbol+"  "+label;nav.appendChild(tab);tabs[key]=tab;
  const pane=document.createElement("section");pane.id="sarchDrawPanel144-"+key;
  pane.className="sarch-draw-pane-v144";pane.setAttribute("role","tabpanel");
  pane.setAttribute("aria-labelledby",tab.id);
  pane.hidden=true;surface.appendChild(pane);panes[key]=pane;
 }

 // Keep old event-bound navigation and hidden inputs in the DOM but not onscreen.
 const parked=document.createElement("div");parked.id="sarchDrawLegacy148";
 parked.className="sarch-draw-legacy-parked-v148";parked.hidden=true;
 const eraseOptions=document.createElement("span");eraseOptions.id="sarchEraseOptions148";
 eraseOptions.className="sarch-draw-erase-inline-v148";eraseOptions.hidden=true;
 function into(node,dest){if(node&&node.nodeType===1)dest.appendChild(node)}
 for(const node of [...field.children,...util.children]){
  if(node.classList.contains("toolbar")){into(node,panes.member);continue}
  const id=node.id||"",click=node.getAttribute("onclick")||"";
  if(id==="eraseMode"||node.querySelector?.("#eraseSize")){
   into(node,eraseOptions);
  }else if(["modeFree","modePoints"].includes(id)||/closeShape\(\)/.test(click)||
           node.querySelector?.("#penColor,#penOnly")){
   into(node,panes.draw);
  }else if(["modeSelect","modeErase","repeatToggle","sm57UndoField"].includes(id)||
           /undo\(\)/.test(click)){
   into(node,panes.edit);
  }else if(id==="autoRightTop"||node.querySelector?.("#theme")){
   into(node,parked);
  }else{
   // Preserve any less common original command, never silently remove it.
   into(node,panes.edit);
  }
 }
 const eraser=document.getElementById("modeErase");
 if(eraser)eraser.insertAdjacentElement("afterend",eraseOptions);
 else panes.edit.appendChild(eraseOptions);
 const syncEraser=()=>{eraseOptions.hidden=!eraser?.classList.contains("active")};
 if(eraser){
  new MutationObserver(syncEraser).observe(eraser,{attributes:true,attributeFilter:["class"]});
  eraser.addEventListener("click",()=>requestAnimationFrame(syncEraser));
 }
 syncEraser();

 // Keep export, sharing and import in the permanent right-side edit panel.
 side.appendChild(output);
 output.classList.add("sarch-draw-side-output-v148");
 const actionGrid=document.createElement("div");
 actionGrid.className="sarch-draw-export-grid-v144";
 for(const row of [...output.querySelectorAll(":scope > .row")]){
  for(const child of [...row.children]){
   if(child.matches("button,.sarch-share-button"))actionGrid.appendChild(child);
  }
  if(!row.children.length)row.remove();
 }
 output.insertBefore(actionGrid,output.firstChild);
 const help=document.createElement("details");help.className="sarch-draw-output-help-v144";
 const helpTitle=document.createElement("summary");helpTitle.textContent="저장·백업 안내";
 help.appendChild(helpTitle);
 for(const note of [...output.querySelectorAll(":scope > p")])help.appendChild(note);
 output.appendChild(help);

 const camera=root.querySelector("#sm52FixedCamera");
 if(camera){camera.classList.add("sarch-draw-camera-v144");nav.appendChild(camera)}
 parked.append(oldTabs,oldDeck);
 root.appendChild(parked);
 root.insertBefore(nav,root.firstChild);
 root.insertBefore(surface,nav.nextSibling);

 function activate(key,focus=false){
  for(const type of kinds){
   const on=type.key===key;
   panes[type.key].hidden=!on;
   tabs[type.key].setAttribute("aria-selected",String(on));
   tabs[type.key].tabIndex=on?0:-1;
  }
  if(focus)tabs[key].focus();
 }
 for(const kind of kinds){
  tabs[kind.key].addEventListener("click",()=>activate(kind.key));
  tabs[kind.key].addEventListener("keydown",ev=>{
   const cur=kinds.findIndex(x=>x.key===kind.key);
   if(["ArrowLeft","ArrowRight","Home","End"].includes(ev.key)){
    ev.preventDefault();
    const next=ev.key==="Home"?0:ev.key==="End"?kinds.length-1:
      (cur+(ev.key==="ArrowLeft"?-1:1)+kinds.length)%kinds.length;
    activate(kinds[next].key,true);
   }
  });
 }
 ready=true;document.body.classList.add("sarch-drawing-v144","sarch-drawing-v148");
 activate("draw");
}
if(document.readyState==="complete")setTimeout(init,80);
else window.addEventListener("load",()=>setTimeout(init,80),{once:true});
})();
