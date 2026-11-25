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
  {key:"outer",label:"외벽",symbol:"①"},
  {key:"wall",label:"내부 벽체",symbol:"②"},
  {key:"member",label:"기둥·보",symbol:"③"},
  {key:"door",label:"문",symbol:"④"},
  {key:"edit",label:"편집",symbol:"⑤"},
  {key:"export",label:"저장·출력",symbol:"⑥"}
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
   into(node,panes.outer);
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
 // Field workflow: move live controls, preserve their original handlers.
 const get=id=>document.getElementById(id);
 const move=(id,dest)=>{const el=get(id);if(el)dest.append(el);return el};
 const make=(tag,attrs,text)=>{const e=document.createElement(tag);for(const [k,v] of Object.entries(attrs||{}))e.setAttribute(k,v);if(text)e.textContent=text;return e};
 const label=(caption,el,dest)=>{const wrap=make("label",{class:"sarch-plan-field"});wrap.append(caption,el);dest.append(wrap)};
 const number=(id,value,min=1)=>make("input",{id,type:"number",min:String(min),value:String(value),inputmode:"decimal"});
 const select=(id,choices)=>{const e=make("select",{id});for(const [v,t] of choices)e.add(new Option(t,v));return e};
 const note=(dest,t)=>dest.append(make("div",{class:"sarch-plan-hint"},t));
 const command=(dest,id,name,fn)=>{const b=make("button",{id,type:"button"},name);b.onclick=fn;dest.append(b);return b};
 const outer=panes.outer,wall=panes.wall,member=panes.member,door=panes.door,edit=panes.edit,exp=panes.export;
 label("외벽 두께 (mm)",number("sarchOuterThickness",200),outer);
 label("기준",select("sarchOuterAlign",[["inside","외곽선 → 안쪽"],["center","중심선"],["outside","내곽선 → 바깥쪽"]]),outer);
 for(const id of ["modeRect","modeLshape","modeUshape","modePoints"])move(id,outer);
 const close=outer.querySelector('button[onclick*="closeShape"]');if(close){close.textContent="외벽 완성";outer.append(close)}
 note(outer,"형상 드래그 또는 모서리를 차례로 찍어 외벽을 완성하세요. 첫 실측 치수로 축척을 보정하세요.");
 const thickness=get("defaultThickness");if(thickness){thickness.value=150;const wrap=thickness.closest("label");if(wrap)wrap.remove();label("내벽 두께 (mm)",thickness,wall)}
 label("선 기준",select("sarchInnerAlign",[["center","벽 중심선"],["left","진행 방향 왼쪽"],["right","진행 방향 오른쪽"]]),wall);
 move("modeWall",wall);command(wall,"sarchConvertWall","선 → 벽체",()=>convertSelectedWall());
 note(wall,"두 끝점을 펜으로 드래그하거나 선택·이동에서 기존 선을 선택한 뒤 벽체로 변환하세요.");
 for(const id of ["modeColumn","modeSteel","modeBeam","modeSmallbeam","modeSteelbeam"])move(id,member);
 note(member,"기둥은 위치를 찍고, 큰보는 두 기둥을 선택하세요. 상세 치수는 선택 항목에서 변경합니다.");
 label("문 폭 (mm)",number("sarchQuickDoorWidth",900),door);
 label("경첩 위치",select("sarchQuickDoorHinge",[["start","선 시작쪽"],["end","선 끝쪽"]]),door);
 label("열림 방향",select("sarchQuickDoorSide",[["left","경첩 기준 왼쪽"],["right","경첩 기준 오른쪽"]]),door);
 command(door,"modeDoor","문 위치 찍기",()=>mode("door"));
 note(door,"벽 위를 찍으면 해당 위치에 문 개구부와 열림 기호를 만듭니다. 정확한 거리 입력은 선택 항목에서 가능합니다.");
 move("modeFree",edit);for(const id of ["penColor","penOnly"]){const el=get(id);if(el?.closest("label"))edit.append(el.closest("label"))}
 const quick=make("div",{class:"sarch-plan-quick"});nav.after(quick);
 move("modeSelect",quick);
 const undo=[...edit.querySelectorAll("button")].find(b=>b.id==="sm57UndoField"||/undo\(\)/.test(b.getAttribute("onclick")||""));
 if(undo)quick.append(undo);else command(quick,"sarchQuickUndo","↶ 실행 취소",()=>window.undo());
 command(quick,"sarchQuickDXF","CAD (DXF)",()=>exportDXF());
 label("축척 mm/단위",number("sarchPlanScale",20,.01),exp);get("sarchPlanScale").step="any";
 command(exp,"sarchSetScale","축척 적용",()=>setPlanScale());
 note(exp,"실측 치수로 축척을 맞춘 뒤 CAD(DXF) 또는 이미지/PDF로 출력하세요.");
 // Empty original tool containers must not consume space.
 for(const e of member.querySelectorAll(".toolbar"))if(!e.querySelector("button,input,select"))e.hidden=true;
 const eraser=document.getElementById("modeErase");
 if(eraser){
  const group=document.createElement("span");
  group.className="sarch-eraser-unit-v148";
  eraser.parentNode.insertBefore(group,eraser);
  group.append(eraser,eraseOptions);
 }else panes.edit.appendChild(eraseOptions);
 // Old toolbar helpers may reparent live buttons after the first layout pass.
 // Recover the same original nodes without cloning, on every relevant mutation.
 function syncEraser(){
  const activeButton=document.getElementById("modeErase");
  const options=document.getElementById("sarchEraseOptions148");
  if(!activeButton||!options||!panes.edit.contains(activeButton))return;
  let group=activeButton.parentElement?.classList.contains("sarch-eraser-unit-v148")
    ?activeButton.parentElement:null;
  if(!group){
   group=document.createElement("span");
   group.className="sarch-eraser-unit-v148";
   activeButton.parentNode.insertBefore(group,activeButton);
   group.appendChild(activeButton);
  }
  if(options.parentElement!==group)group.appendChild(options);
  options.hidden=!activeButton.classList.contains("active");
 }
 // Child-list and class changes both matter; hidden changes aren't observed.
 new MutationObserver(syncEraser).observe(panes.edit,{
  childList:true,subtree:true,attributes:true,attributeFilter:["class"]
 });
 document.addEventListener("click",event=>{
  const target=event.target?.closest?.("button");
  if(target&&(target.id?.startsWith("mode")||target.closest("#sarchDrawTabs144"))){
   queueMicrotask(syncEraser);
   requestAnimationFrame(syncEraser);
  }
 });
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
 for(const original of actionGrid.querySelectorAll('button'))command(exp,'',original.textContent,()=>original.click());
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
 root.insertBefore(quick,nav.nextSibling);
 root.insertBefore(surface,quick.nextSibling);

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
 activate("outer");
}
if(document.readyState==="complete")setTimeout(init,80);
else window.addEventListener("load",()=>setTimeout(init,80),{once:true});
})();
