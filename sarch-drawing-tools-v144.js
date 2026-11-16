/* S:ARCH v144: drawing-specific, progressive, four-way tool navigation.
   Moves original DOM nodes, never clones commands or touches project data.
   If a required control is missing, the existing v143 interface remains. */
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
 if(!root||content?.length!==2||!oldTabs||!oldDeck||!output)return;
 const field=content[0],util=content[1];
 const needed=["modeFree","modePoints","modeSelect","modeErase"];
 if(needed.some(id=>!document.getElementById(id)))return;
 // Allocate all sections before moving any command. Existing listeners stay attached.
 const nav=document.createElement("div");
 nav.id="sarchDrawTabs144";nav.className="sarch-draw-tabs-v144";nav.setAttribute("role","tablist");nav.setAttribute("aria-label","도면작성 도구 분류");
 const surface=document.createElement("div");surface.id="sarchDrawSurface144";surface.className="sarch-draw-surface-v144";
 const kinds=[
  {key:"draw",label:"그리기",symbol:"✎"},
  {key:"member",label:"벽체·부재",symbol:"▦"},
  {key:"edit",label:"편집",symbol:"⌁"},
  {key:"export",label:"출력·공유",symbol:"↗"}
 ];
 const panes={};const tabs={};
 for(const {key,label,symbol} of kinds){
  const tab=document.createElement("button");tab.type="button";tab.className="sarch-draw-tab-v144";
  tab.id="sarchDrawTab144-"+key;tab.setAttribute("role","tab");tab.setAttribute("aria-controls","sarchDrawPanel144-"+key);
  tab.textContent=symbol+"  "+label;nav.appendChild(tab);tabs[key]=tab;
  const pane=document.createElement("section");pane.id="sarchDrawPanel144-"+key;
  pane.className="sarch-draw-pane-v144";pane.setAttribute("role","tabpanel");pane.setAttribute("aria-labelledby",tab.id);
  pane.hidden=true;surface.appendChild(pane);panes[key]=pane;
 }
 const advanced=document.createElement("details");advanced.className="sarch-draw-more-v144";
 const caption=document.createElement("summary");caption.textContent="펜·지우개 세부 설정";advanced.appendChild(caption);
 const advancedContent=document.createElement("div");advancedContent.className="sarch-draw-more-content-v144";
 advanced.appendChild(advancedContent);
 function into(node,dest){if(node&&node.nodeType===1)dest.appendChild(node)}
 // Structural toolbars already contain the original wall, column and beam actions.
 for(const node of [...field.children,...util.children]){
  if(node.classList.contains("toolbar")){into(node,panes.member);continue}
  const id=node.id||"";
  const click=node.getAttribute("onclick")||"";
  if(["modeFree","modePoints"].includes(id)||/closeShape\(\)/.test(click)||node.querySelector?.("#penColor,#penOnly")){
   into(node,panes.draw);
  }else if(["modeSelect","modeErase","repeatToggle","sm57UndoField"].includes(id)||/undo\(\)/.test(click)){
   into(node,panes.edit);
  }else if(["eraseMode"].includes(id)){
   into(node,panes.edit);
  }else{
   into(node,advancedContent);
  }
 }
 // A compact edit pane, with advanced inputs available without clutter.
 panes.edit.appendChild(advanced);
 // Preserve the real export/import buttons (and native share button) inside one tab.
 panes.export.appendChild(output);
 // Consolidate original live export buttons into one quiet grid. No handlers are copied.
 const actionGrid=document.createElement("div");actionGrid.className="sarch-draw-export-grid-v144";
 for(const row of [...output.querySelectorAll(":scope > .row")]){
  for(const child of [...row.children])if(child.matches("button,.sarch-share-button"))actionGrid.appendChild(child);
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
 const legacy=document.createElement("details");legacy.className="sarch-draw-legacy-v144";
 const legacyLabel=document.createElement("summary");legacyLabel.textContent="추가 도구";
 legacy.appendChild(legacyLabel);legacy.append(oldTabs,oldDeck);
 panes.edit.appendChild(legacy);
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
    const next=ev.key==="Home"?0:ev.key==="End"?kinds.length-1:(cur+(ev.key==="ArrowLeft"?-1:1)+kinds.length)%kinds.length;
    activate(kinds[next].key,true);
   }
  });
 }
 ready=true;document.body.classList.add("sarch-drawing-v144");activate("draw");
}
// The v43 toolbar and v57 undo/camera helpers are initialized on DOMContentLoaded.
if(document.readyState==="complete")setTimeout(init,80);
else window.addEventListener("load",()=>setTimeout(init,80),{once:true});
})();
