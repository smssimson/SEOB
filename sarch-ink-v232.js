/* S:ARCH v232 shared field notebook. No network dependency; logical points survive zoom/resize. */
(function(){
"use strict";
const clone=x=>JSON.parse(JSON.stringify(x)), clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const icons={text:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 8h10m-5 0v9m-3 0h6"/>',pen:'<path d="m4 19 1-5L16 3l5 5L10 19l-6 1Z M13 6l5 5"/>',marker:'<path d="m5 15 9-12 6 5-9 12-6 1-2-2 2-4Z M3 22h10"/>',erase:'<path d="m3 13 9-10a2 2 0 0 1 3 0l6 6a2 2 0 0 1 0 3l-8 9H8l-5-5a2 2 0 0 1 0-3Z M8 8l9 9M13 21h9"/>',lasso:'<path stroke-dasharray="2 3" d="M18 17c4-2 4-8 0-11C14 1 3 3 3 11c0 6 8 10 15 6Z"/><path d="M10 17c-5 2-4 6 0 4"/>',undo:'<path d="m9 5-6 6 6 5M3 11h10a7 7 0 0 1 7 7"/>',redo:'<path d="m15 5 6 6-6 5m6-5H11a7 7 0 0 0-7 7"/>',line:'<path d="M4 20 20 4"/>',rect:'<rect x="4" y="5" width="16" height="14" rx="1"/>',ellipse:'<ellipse cx="12" cy="12" rx="9" ry="7"/>',arrow:'<path d="M4 20 20 4M11 4h9v9"/>',shape:'<rect x="3" y="3" width="10" height="10" rx="1"/><circle cx="15.5" cy="15.5" r="5.5"/>',align:'<path d="M3 5h18M3 10h14M3 15h18M3 20h12"/>',guide:'<path d="M3 5h18M3 19h18M3 12h18" stroke-dasharray="4 3"/><path d="M6 16 11 8l5 8"/>',lock:'<rect x="6" y="11" width="12" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/>',hand:'<path d="M8 13V5a2 2 0 0 1 4 0v6-7a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v9c0 5-4 6-8 6-3 0-5-2-7-5l-2-4a2 2 0 0 1 3-2Z"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',trash:'<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',check:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m7 12 3 3 7-7"/>',list:'<path d="M8 5h12M8 12h12M8 19h12"/><path d="M3 5h1m-1 7h1m-1 7h1"/>',number:'<path d="M9 5h12M9 12h12M9 19h12M3 3h1v5m-2 2h3l-3 4h3m-3 3h3l-2 2 2 2H2"/>',left:'<path d="M3 5h18M3 10h12M3 15h18M3 20h12"/>',center:'<path d="M3 5h18M6 10h12M3 15h18M6 20h12"/>',right:'<path d="M3 5h18M9 10h12M3 15h18M9 20h12"/>',indent:'<path d="M3 4h18M10 9h11M10 15h11M3 20h18M3 8l5 4-5 4"/>',paper:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16"/>',reset:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5m11-5v5h-5"/>',width:'<path d="M4 12h16" stroke-width="4"/>'};
const svg=k=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[k]+'</svg>';
const button=(id,title,body)=>'<button type="button" data-ink="'+id+'" title="'+title+'" aria-label="'+title+'" aria-pressed="false">'+body+'</button>';
const sep='<span class="inksep"></span>';
function points(s){return Array.isArray(s.points)?s.points:[]}
function bounds(s){const ps=points(s);if(!ps.length)return null;let x=Math.min(...ps.map(p=>p.x)),y=Math.min(...ps.map(p=>p.y)),r=Math.max(...ps.map(p=>p.x)),b=Math.max(...ps.map(p=>p.y));if(s.tool==="text"){const f=s.format||{},n=Number(f.size)||22,ls=String(s.text||"").split("\n"),w=Math.max(...ls.map(l=>l.length),1)*n*.75+(f.indent||0)*n,h=ls.length*n*1.35;r=x+w;b=y+h;if(f.align==="center"){x-=w/2;r-=w/2}else if(f.align==="right"){x-=w;r-=w}}return {x,y,r,b}}
function strokeColor(s,dark){let c=s.color||"#26394a";return dark&&["#26394a","#000000","#111111","#334155","#222222"].includes(c.toLowerCase())?"#f2f2f2":c}
function lines(s){const f=s.format||{},v=String(s.text||"").split("\n");return v.map((l,i)=>f.list==="check"?"☐ "+l:f.list==="bullet"?"• "+l:f.list==="number"?(i+1)+". "+l:l)}
function paint(ctx,s,dark=false){
 const ps=points(s);if(!ps.length)return;const a=ps[0],b=ps[ps.length-1],w=Math.max(.5,Number(s.width)||3);
 ctx.save();ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=w;ctx.strokeStyle=ctx.fillStyle=strokeColor(s,dark);
 if(s.tool==="text"){
  const f=s.format||{},size=Number(f.size)||22,lh=size*1.35;
  ctx.font=(f.italic?"italic ":"")+(f.bold?"bold ":"")+size+"px Dotum, Arial, sans-serif";ctx.textBaseline="top";ctx.textAlign=f.align||"left";
  const x=a.x+(Number(f.indent)||0)*size;
  lines(s).forEach((l,i)=>{let y=a.y+i*lh;ctx.fillText(l,x,y);let tw=ctx.measureText(l).width,left=x-(f.align==="center"?tw/2:f.align==="right"?tw:0);if(f.underline||f.strike){ctx.lineWidth=Math.max(1,size/15);ctx.beginPath();if(f.underline){ctx.moveTo(left,y+size*1.08);ctx.lineTo(left+tw,y+size*1.08)}if(f.strike){ctx.moveTo(left,y+size*.55);ctx.lineTo(left+tw,y+size*.55)}ctx.stroke()}});
  ctx.restore();return;
 }
 if(s.tool==="erase"){ctx.strokeStyle=dark?"#101010":"#ffffff";ctx.fillStyle=ctx.strokeStyle}
 if(s.tool==="marker"){ctx.globalAlpha=clamp(Number(s.opacity??.34),.05,1);ctx.lineWidth=Math.max(w,12)}
 ctx.beginPath();
 if(s.tool==="rect"){ctx.rect(a.x,a.y,b.x-a.x,b.y-a.y)}
 else if(s.tool==="ellipse"){ctx.ellipse((a.x+b.x)/2,(a.y+b.y)/2,Math.max(.5,Math.abs(b.x-a.x)/2),Math.max(.5,Math.abs(b.y-a.y)/2),0,0,Math.PI*2)}
 else{ctx.moveTo(a.x,a.y);if(s.tool==="line"||s.tool==="arrow"||s.straight){ctx.lineTo(b.x,b.y)}else{for(const p of ps.slice(1))ctx.lineTo(p.x,p.y);if(ps.length===1)ctx.lineTo(a.x+.02,a.y+.02);if(s.closed||s.tool==="triangle")ctx.closePath()}
 if(s.tool==="arrow"){let ang=Math.atan2(b.y-a.y,b.x-a.x),len=Math.max(12,w*4);ctx.moveTo(b.x-len*Math.cos(ang-.5),b.y-len*Math.sin(ang-.5));ctx.lineTo(b.x,b.y);ctx.lineTo(b.x-len*Math.cos(ang+.5),b.y-len*Math.sin(ang+.5))}}
 ctx.stroke();ctx.restore();
}
function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return dist(p,{x:a.x+t*dx,y:a.y+t*dy})}
function geometry(s){const ps=points(s),a=ps[0],b=ps.at(-1);if(!a)return[];if(s.tool==="rect")return [a,{x:b.x,y:a.y},b,{x:a.x,y:b.y},a];if(s.tool==="ellipse"){return Array.from({length:49},(_,i)=>{let t=i*Math.PI/24;return{x:(a.x+b.x)/2+(b.x-a.x)/2*Math.cos(t),y:(a.y+b.y)/2+(b.y-a.y)/2*Math.sin(t)}})}if(s.tool==="line"||s.straight)return[a,b];if(s.tool==="arrow"){let ang=Math.atan2(b.y-a.y,b.x-a.x),len=Math.max(12,(s.width||3)*4);return[a,b,{x:b.x-len*Math.cos(ang-.5),y:b.y-len*Math.sin(ang-.5)},b,{x:b.x-len*Math.cos(ang+.5),y:b.y-len*Math.sin(ang+.5)}]}return s.closed||s.tool==="triangle"?[...ps,ps[0]]:ps}
function hit(s,p,r){if(s.tool==="text"){let b=bounds(s);return b&&p.x>=b.x-r&&p.x<=b.r+r&&p.y>=b.y-r&&p.y<=b.b+r}const a=geometry(s);return a.some((q,i)=>i?segmentDistance(p,a[i-1],q)<=r+(s.width||3)/2:dist(p,q)<=r)}
function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){let a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes}return yes}
// Simplify a closed outline without losing the closing corner when the pen starts mid-edge.
function simplifyInk(ps,tol){
 if(ps.length<=2)return ps;
 let max=0,at=0;for(let i=1;i<ps.length-1;i++){let d=segmentDistance(ps[i],ps[0],ps.at(-1));if(d>max){max=d;at=i}}
 if(max<=tol)return [ps[0],ps.at(-1)];
 return simplifyInk(ps.slice(0,at+1),tol).slice(0,-1).concat(simplifyInk(ps.slice(at),tol));
}
function closedCorners(ps,tol){
 let k=1;for(let i=2;i<ps.length-1;i++)if(dist(ps[i],ps[0])>dist(ps[k],ps[0]))k=i;
 let loop=simplifyInk(ps.slice(0,k+1),tol).slice(0,-1).concat(simplifyInk(ps.slice(k).concat([ps[0]]),tol).slice(0,-1));
 let changed=true;while(changed&&loop.length>3){changed=false;for(let i=0;i<loop.length;i++){
  const prev=loop[(i+loop.length-1)%loop.length],q=loop[i],next=loop[(i+1)%loop.length];
  if(dist(prev,q)<tol||segmentDistance(q,prev,next)<tol){loop.splice(i,1);changed=true;break}
 }}
 return loop;
}
function recognize(s){
 const p=points(s);if(p.length<3)return s;const a=p[0],b=p.at(-1),box=bounds(s),w=box.r-box.x,h=box.b-box.y,span=Math.min(w,h);
 if(dist(a,b)>5&&p.every(q=>segmentDistance(q,a,b)<Math.max(5,dist(a,b)*.045)))return {...s,tool:"line",straight:true,points:[a,b]};
 if(w>15&&h>15&&dist(a,b)<Math.max(18,span*.35)){
  const tol=Math.max(3,span*.075),corners=closedCorners(p,tol);
  if(corners.length===3){
   const [u,v,z]=corners,area=Math.abs((v.x-u.x)*(z.y-u.y)-(v.y-u.y)*(z.x-u.x))/2;
   const err=Math.max(...p.map(q=>Math.min(segmentDistance(q,u,v),segmentDistance(q,v,z),segmentDistance(q,z,u))));
   if(area>w*h*.15&&err<Math.max(6,span*.13))return {...s,tool:"triangle",straight:false,closed:true,points:corners};
  }
  const onEdge=p.filter(q=>Math.min(Math.abs(q.x-box.x),Math.abs(q.x-box.r),Math.abs(q.y-box.y),Math.abs(q.y-box.b))<span*.13).length/p.length;
  return {...s,tool:onEdge>.72?"rect":"ellipse",straight:false,points:[{x:box.x,y:box.y},{x:box.r,y:box.b}]};
 }return s;
}
// Cut the exact portions of vector segments intersecting a circular eraser.
// Preserve the surviving geometry, color, width and marker opacity.
function cutStroke(s,p,r){
 if(s.tool==="text")return hit(s,p,r)?[]:[s];
 const ps=geometry(s);if(!ps.length)return[s];
 const radius=r+(s.tool==="marker"?Math.max(s.width||3,12):s.width||3)/2;
 if(ps.length===1)return dist(ps[0],p)<=radius?[]:[s];
 let runs=[],run=[],changed=false;
 const same=(a,b)=>dist(a,b)<1e-5;
 const add=q=>{if(!run.length||!same(run.at(-1),q))run.push(q)};
 const flush=()=>{if(run.length>1)runs.push(run);run=[]};
 for(let i=1;i<ps.length;i++){
  const a=ps[i-1],b=ps[i],dx=b.x-a.x,dy=b.y-a.y,A=dx*dx+dy*dy;
  if(A<1e-12)continue;
  const fx=a.x-p.x,fy=a.y-p.y,B=2*(fx*dx+fy*dy),C=fx*fx+fy*fy-radius*radius,D=B*B-4*A*C;
  let ts=[0,1];if(D>0){const root=Math.sqrt(D);for(const t of [(-B-root)/(2*A),(-B+root)/(2*A)])if(t>0&&t<1)ts.push(t)}
  ts.sort((a,b)=>a-b);
  const at=t=>({x:a.x+dx*t,y:a.y+dy*t});
  for(let k=1;k<ts.length;k++){let lo=ts[k-1],hi=ts[k];if(dist(at((lo+hi)/2),p)<radius){changed=true;flush()}else{if(run.length&&!same(run.at(-1),at(lo)))flush();add(at(lo));add(at(hi))}}
 }
 flush();if(!changed)return[s];
 if(runs.length>1&&same(runs[0][0],runs.at(-1).at(-1))){const last=runs.pop();runs[0]=last.concat(runs[0].slice(1))}
 return runs.map(ps=>({...s,tool:s.tool==="marker"?"marker":s.tool==="erase"?"erase":"pen",straight:false,closed:false,points:ps}));
}
let active=null;
function open(options){
 if(active)return false;const opt=options||{},world={x:0,y:0,w:1600,h:1100,...opt.world};
 let strokes=clone(opt.strokes||[]),original=JSON.stringify(strokes),undo=[],redo=[],selected=new Set(),clipboard=[],draft=null,drag=null,hold=0,tool="pen",auto=false,locked=false,guide=false,dark=!opt.background,penOnly=false,color="#26394a",width=3,eraseMode="stroke",eraseSize=28,markerOpacity=.34,eraserPoint=null,holdAnchor=null,format={size:22,bold:false,italic:false,underline:false,strike:false,list:"",align:"left",indent:0},zoom=1,pan={x:0,y:0},scale=1,offset={x:0,y:0},cw=1,ch=1,dpr=1,touch=new Map(),gesture=null,bg=null,msgTimer=0,ro=null,closed=false;
 const prevFocus=document.activeElement,oldOverflow=document.body.style.overflow;document.body.style.overflow="hidden";
 const el=document.createElement("div");el.id="sarchInk231";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-label",opt.title||"드로잉");
 const colors=["#26394a","#b83224","#267d78","#a8d9ef","#2563eb","#e8a008"];
 el.innerHTML='<div class="inkbar"><div class="inkgroup"><button type="button" class="inkclose" data-ink="close" title="닫기" aria-label="닫기">×</button><span class="inklabel">'+(opt.title||"드로잉")+'</span></div><div class="inktools">'+button("text","텍스트 입력 / 기기 필기 키보드",svg("text"))+button("pen","펜",svg("pen"))+button("marker","형광펜 · 다시 누르면 투명도 설정",svg("marker"))+button("erase","지우개 · 다시 누르면 방식 및 크기 설정",svg("erase"))+button("lasso","올가미 선택",svg("lasso"))+sep+colors.map(c=>'<button type="button" class="inkcolor" data-color="'+c+'" style="--ink-color:'+c+'" title="색상 '+c+'" aria-label="색상 '+c+'" aria-pressed="false"></button>').join("")+'<input type="color" aria-label="사용자 지정 색상" value="#26394a" data-colorpicker>'+sep+'<span class="inklabel">굵기</span><input type="range" data-width min="1" max="36" value="3" aria-label="펜 굵기">'+sep+button("undo","실행 취소",svg("undo"))+button("redo","다시 실행",svg("redo"))+sep+button("line","직선",svg("line"))+button("rect","사각형",svg("rect"))+button("ellipse","타원",svg("ellipse"))+button("arrow","화살표",svg("arrow"))+button("auto","도형 자동 보정",svg("shape"))+button("align","선 정렬 / 선택한 선 수평·수직 보정",svg("align"))+button("guide","필기 가이드",svg("guide"))+button("hand","화면 이동",svg("hand"))+button("penOnly","S펜 전용",svg("pen"))+button("lock","확대/이동 잠금",svg("lock"))+button("paper","종이 색상 전환",svg("paper"))+button("reset","화면 맞춤",svg("reset"))+button("clear","작성 획 전체 삭제",svg("trash"))+'</div><button type="button" class="inkapply" data-ink="save">✓ 저장</button></div><div class="inkstage"><canvas aria-label="드로잉 작업 영역"></canvas><div class="inkmessage" role="status" aria-live="polite"></div><div class="inktextpanel" hidden><div class="inktextinner"><strong>텍스트 입력</strong><span class="inklabel">삼성 키보드의 필기 입력도 사용할 수 있습니다.</span><textarea aria-label="메모 내용" placeholder="메모를 입력하세요."></textarea><div class="inktextactions"><button type="button" data-textcancel>취소</button><button type="button" class="inkapply" data-textok>적용</button></div></div></div></div><div class="inkbar inkbottom"><div class="inktools">'+button("check","체크 목록",svg("check"))+button("bullet","글머리 기호",svg("list"))+button("number","번호 목록",svg("number"))+sep+button("bold","굵게","<b>B</b>")+button("italic","기울임","<i>I</i>")+button("underline","밑줄","<u>U</u>")+button("strike","취소선","<s>T</s>")+sep+'<select data-fontsize aria-label="글자 크기">'+[12,16,18,22,28,36,48,64].map(n=>'<option value="'+n+'"'+(n===22?' selected':'')+'>'+n+'</option>').join("")+'</select>'+button("left","왼쪽 정렬",svg("left"))+button("center","가운데 정렬",svg("center"))+button("right","오른쪽 정렬",svg("right"))+button("indent","들여쓰기",svg("indent"))+sep+'<div class="inkselection" hidden>'+button("edittext","선택한 텍스트 수정",svg("text"))+button("copy","선택 복사",svg("copy"))+button("paste","붙여넣기",'<span>＋</span>')+button("delete","선택 삭제",svg("trash"))+'</div></div><span class="inklabel" data-zoom>100%</span></div>';
 const settings=document.createElement("div");settings.className="inksettings";settings.hidden=true;
 settings.innerHTML='<section data-settings="erase"><div class="inksettings-title">지우개 설정<button type="button" data-settingsclose aria-label="닫기">×</button></div><div class="inksettings-row"><button type="button" data-erase-mode="stroke" aria-pressed="true">선 삭제</button><button type="button" data-erase-mode="partial" aria-pressed="false">부분 삭제</button></div><label>지우개 크기 <output data-erase-value>28</output> px</label><input type="range" min="6" max="100" step="2" value="28" data-erase-size aria-label="지우개 크기"><div class="inkpreview"><span data-erase-preview></span></div></section><section data-settings="marker" hidden><div class="inksettings-title">형광펜 설정<button type="button" data-settingsclose aria-label="닫기">×</button></div><label>투명도 <output data-marker-value>66</output>%</label><input type="range" min="0" max="95" value="66" step="1" data-marker-alpha aria-label="형광펜 투명도"><div class="inkmarkerpreview"><span data-marker-preview></span>형광펜 미리보기</div></section>';
 el.append(settings);
 document.body.append(el);const canvas=el.querySelector("canvas"),ctx=canvas.getContext("2d"),stage=el.querySelector(".inkstage"),textpanel=el.querySelector(".inktextpanel"),area=el.querySelector("textarea"),message=el.querySelector(".inkmessage");
 let textAt=null,textIndex=-1;
 function updateSettings(){
  settings.querySelectorAll("[data-erase-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.eraseMode===eraseMode)));
  settings.querySelector("[data-erase-value]").textContent=eraseSize;
  settings.querySelector("[data-erase-size]").value=eraseSize;
  let preview=settings.querySelector("[data-erase-preview]");preview.style.width=preview.style.height=Math.min(eraseSize,64)+"px";
  settings.querySelector("[data-marker-value]").textContent=Math.round((1-markerOpacity)*100);
  settings.querySelector("[data-marker-alpha]").value=Math.round((1-markerOpacity)*100);
  let mark=settings.querySelector("[data-marker-preview]");mark.style.background=color;mark.style.opacity=markerOpacity;
 }
 function toggleSettings(k){
  if(!settings.hidden&&settings.dataset.active===k){settings.hidden=true;return}
  settings.dataset.active=k;settings.hidden=false;settings.querySelectorAll("[data-settings]").forEach(p=>p.hidden=p.dataset.settings!==k);
  const b=el.querySelector('[data-ink="'+k+'"]'),r=b.getBoundingClientRect(),root=el.getBoundingClientRect();
  settings.style.left=clamp(r.left-root.left,8,Math.max(8,root.width-260))+"px";settings.style.top=(r.bottom-root.top+7)+"px";updateSettings();
 }
 settings.addEventListener("click",e=>{const b=e.target.closest("[data-erase-mode]");if(b){eraseMode=b.dataset.eraseMode;updateSettings()}if(e.target.closest("[data-settingsclose]"))settings.hidden=true});
 settings.querySelector("[data-erase-size]").addEventListener("input",e=>{eraseSize=Number(e.target.value);updateSettings();draw()});
 settings.querySelector("[data-marker-alpha]").addEventListener("input",e=>{markerOpacity=1-Number(e.target.value)/100;updateSettings()});
 function note(t){message.textContent=t;clearTimeout(msgTimer);msgTimer=setTimeout(()=>message.textContent="",2600)}
 function checkpoint(){undo.push(clone(strokes));if(undo.length>70)undo.shift();redo=[]}
 function restore(from,to){if(!from.length)return;to.push(clone(strokes));strokes=from.pop();selected.clear();draw()}
 function size(){const r=canvas.getBoundingClientRect();cw=Math.max(1,r.width);ch=Math.max(1,r.height);dpr=Math.min(window.devicePixelRatio||1,3);canvas.width=Math.round(cw*dpr);canvas.height=Math.round(ch*dpr);draw()}
 function transform(){scale=Math.max(.0001,Math.min((cw-20)/world.w,(ch-20)/world.h))*zoom;offset={x:cw/2-(world.x+world.w/2)*scale+pan.x,y:ch/2-(world.y+world.h/2)*scale+pan.y}}
 function draw(){
  transform();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle="#151515";ctx.fillRect(0,0,cw,ch);ctx.translate(offset.x,offset.y);ctx.scale(scale,scale);
  ctx.save();ctx.beginPath();ctx.rect(world.x,world.y,world.w,world.h);ctx.clip();ctx.fillStyle=dark?"#101010":"#fff";ctx.fillRect(world.x,world.y,world.w,world.h);
  if(bg)ctx.drawImage(bg,world.x,world.y,world.w,world.h);
  if(guide){ctx.strokeStyle=dark?"#ffffff25":"#00000020";ctx.lineWidth=1/scale;for(let y=world.y+40;y<world.y+world.h;y+=40){ctx.beginPath();ctx.moveTo(world.x,y);ctx.lineTo(world.x+world.w,y);ctx.stroke()}}
  for(const s of strokes)paint(ctx,s,dark&&!bg);if(draft&&draft.tool!=="lasso")paint(ctx,draft,dark&&!bg);
  ctx.setLineDash([5/scale,4/scale]);ctx.strokeStyle="#60b9f2";ctx.lineWidth=1.5/scale;
  if(draft?.tool==="lasso"){let p=points(draft);ctx.beginPath();if(p.length){ctx.moveTo(p[0].x,p[0].y);p.slice(1).forEach(q=>ctx.lineTo(q.x,q.y));ctx.stroke()}}
  for(const i of selected){const b=bounds(strokes[i]||{});if(b)ctx.strokeRect(b.x-5/scale,b.y-5/scale,b.r-b.x+10/scale,b.b-b.y+10/scale)}
  if(tool==="erase"&&eraserPoint){ctx.setLineDash([]);ctx.strokeStyle="#8b9ba8";ctx.fillStyle="#b1bcc333";ctx.lineWidth=1.5/scale;ctx.beginPath();ctx.arc(eraserPoint.x,eraserPoint.y,eraseSize/2/scale,0,Math.PI*2);ctx.fill();ctx.stroke()}
  ctx.restore();ctx.setLineDash([]);refresh();
 }
 function refresh(){
  el.querySelectorAll("[data-ink]").forEach(b=>{let k=b.dataset.ink;let on=k===tool||k==="auto"&&auto||k==="guide"&&guide||k==="lock"&&locked||k==="penOnly"&&penOnly||["bold","italic","underline","strike"].includes(k)&&format[k]||["check","bullet","number"].includes(k)&&format.list===k||["left","center","right"].includes(k)&&format.align===k||k==="paper"&&dark;b.setAttribute("aria-pressed",String(!!on));if(k==="undo")b.disabled=!undo.length;if(k==="redo")b.disabled=!redo.length;if(k==="paste")b.disabled=!clipboard.length;if(k==="edittext")b.disabled=selected.size!==1||strokes[[...selected][0]]?.tool!=="text"});
  el.querySelectorAll("[data-color]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.color===color)));el.querySelector(".inkselection").hidden=!selected.size&&!clipboard.length;
  el.querySelector("[data-zoom]").textContent=Math.round(zoom*100)+"%";
 }
 function local(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
 function pos(e,limit=true){let q=local(e),x=(q.x-offset.x)/scale,y=(q.y-offset.y)/scale;return limit?{x:clamp(x,world.x,world.x+world.w),y:clamp(y,world.y,world.y+world.h)}:{x,y}}
 function zoomAt(f,p){if(locked)return;const n=clamp(zoom*f,.5,8),ratio=n/zoom;pan.x=p.x-cw/2-(p.x-cw/2-pan.x)*ratio;pan.y=p.y-ch/2-(p.y-ch/2-pan.y)*ratio;zoom=n;draw()}
 function clearHold(){clearTimeout(hold);hold=0;holdAnchor=null}
 function arm(p){
  if(draft?.tool!=="pen"||draft.straight||draft.holdShape||points(draft).length<2)return;
  // Digitizers send tiny stationary pointer movements continuously. Only
  // intentional movement beyond 3 CSS pixels restarts the 650 ms timer.
  if(hold&&holdAnchor&&dist(p,holdAnchor)*scale<=3)return;
  clearHold();holdAnchor={...p};const target=draft;
  hold=setTimeout(()=>{hold=0;holdAnchor=null;if(draft!==target||!drag||draft.straight)return;
   const a=draft.points[0],b=draft.points.at(-1);
   if(auto){const recognized=recognize(draft);if(["triangle","rect","ellipse"].includes(recognized.tool)){Object.assign(draft,recognized,{holdShape:true});draw();return}}
   if(dist(a,b)*scale<8)return;draft.straight=true;draft.points=[a,b];draw();
  },650);
 }
 function startText(p,i=-1){textAt=p;textIndex=i;area.value=i>=0?strokes[i].text||"":"";if(i>=0)format={...format,...strokes[i].format};textpanel.hidden=false;area.focus()}
 function closeText(){textpanel.hidden=true;textAt=null;textIndex=-1;area.blur()}
 function applyText(){if(!textAt)return;let t=area.value;if(t.trim()){checkpoint();let s={tool:"text",points:[textAt],text:t,color,width,format:clone(format)};if(textIndex>=0)strokes[textIndex]=s;else strokes.push(s)}closeText();draw()}
 function eraseAt(p){
  const r=eraseSize/2/scale,prev=drag.last||p,n=Math.max(1,Math.ceil(dist(prev,p)/Math.max(r*.6,.2)));
  let next=strokes;for(let i=1;i<=n;i++){const q={x:prev.x+(p.x-prev.x)*i/n,y:prev.y+(p.y-prev.y)*i/n};
   if(eraseMode==="stroke"){const filtered=next.filter(s=>!hit(s,q,r));if(filtered.length!==next.length)next=filtered}
   else{let changed=false;const result=next.flatMap(s=>{const cut=cutStroke(s,q,r);if(cut.length!==1||cut[0]!==s)changed=true;return cut});if(changed)next=result}
  }
  if(next!==strokes){if(!drag.changed){checkpoint();drag.changed=true}strokes=next;selected.clear()}
  drag.last=p;eraserPoint=p;
 }
 function cancelDraft(){clearHold();draft=null;drag=null}
 function onDown(e){
  if(!textpanel.hidden||e.button>0)return;settings.hidden=true;e.preventDefault();try{canvas.setPointerCapture(e.pointerId)}catch(_){}
  let p=pos(e),l=local(e);
  if(e.pointerType==="touch"){touch.set(e.pointerId,l);if(touch.size===2){if(draft&&!drag?.changed)cancelDraft();let [a,b]=[...touch.values()];gesture={d:dist(a,b),c:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};return}if(touch.size>2||penOnly&&tool!=="hand"){if(!locked&&penOnly)drag={id:e.pointerId,type:"pan",last:l};return}}
  if(drag||draft)return;
  if(tool==="hand"||e.button===1){if(!locked)drag={id:e.pointerId,type:"pan",last:l};return}
  if(tool==="text"){startText(p);return}
  if(tool==="lasso"&&selected.size&&[...selected].some(i=>hit(strokes[i],p,12/scale))){drag={id:e.pointerId,type:"move",start:p,base:clone(strokes),changed:false};return}
  if(tool==="erase"){drag={id:e.pointerId,type:"erase",changed:false};eraseAt(p);draw();return}
  draft={tool,color,width,points:[p],id:e.pointerId,...(tool==="marker"?{opacity:markerOpacity}:{})};drag={id:e.pointerId,type:"draw"};draw();
 }
 function onMove(e){
  const l=local(e);
  if(e.pointerType==="touch"&&touch.has(e.pointerId)){touch.set(e.pointerId,l);if(touch.size>=2){if(!locked){const [a,b]=[...touch.values()],d=dist(a,b),c={x:(a.x+b.x)/2,y:(a.y+b.y)/2};if(gesture&&gesture.d>2){pan.x+=c.x-gesture.c.x;pan.y+=c.y-gesture.c.y;zoomAt(d/gesture.d,c)}gesture={d,c}}return}}
  if(!drag||drag.id!==e.pointerId){if(tool==="erase"&&e.pointerType!=="touch"){eraserPoint=pos(e);draw()}return}e.preventDefault();const p=pos(e);
  if(drag.type==="pan"){pan.x+=l.x-drag.last.x;pan.y+=l.y-drag.last.y;drag.last=l;draw();return}
  if(drag.type==="erase"){eraseAt(p);draw();return}
  if(drag.type==="move"){let dx=p.x-drag.start.x,dy=p.y-drag.start.y;if(!drag.changed&&Math.hypot(dx,dy)>1){checkpoint();drag.changed=true}if(drag.changed)strokes=drag.base.map((s,i)=>selected.has(i)?{...s,points:points(s).map(q=>({x:q.x+dx,y:q.y+dy}))}:s);draw();return}
  if(!draft||draft.holdShape)return;const samples=e.getCoalescedEvents?.()||[],events=samples.length?samples:[e];
  for(const v of events){let q=pos(v);if(["line","rect","ellipse","arrow"].includes(draft.tool)||draft.straight)draft.points=[draft.points[0],q];else if(dist(q,draft.points.at(-1))>.6/scale)draft.points.push(q)}
  if(draft.tool==="pen")arm(p);draw();
 }
 function onUp(e){
  if(e.pointerType==="touch"){touch.delete(e.pointerId);if(gesture){if(touch.size<2)gesture=null;return}}
  if(!drag||drag.id!==e.pointerId)return;clearHold();
  if(draft){let s=draft;delete s.id;if(e.type!=="pointercancel"){
    if(s.tool==="lasso"){let poly=points(s);selected.clear();if(poly.length>2){strokes.forEach((v,i)=>{const b=bounds(v);if(b&&(geometry(v).some(p=>inside(p,poly))||inside({x:(b.x+b.r)/2,y:(b.y+b.b)/2},poly)))selected.add(i)})}else{for(let i=strokes.length-1;i>=0;i--)if(hit(strokes[i],poly[0],12/scale)){selected.add(i);break}}if(selected.size)note(selected.size+"개 선택 · 드래그하여 이동")}
    else{checkpoint();strokes.push(auto&&s.tool==="pen"?recognize(s):s)}
  }}draft=null;drag=null;eraserPoint=null;draw();
 }
 function modifyFormat(k){if(["bold","italic","underline","strike"].includes(k))format[k]=!format[k];else if(["check","bullet","number"].includes(k))format.list=format.list===k?"":k;else if(["left","center","right"].includes(k))format.align=k;else if(k==="indent")format.indent=(format.indent+1)%4;const ids=[...selected].filter(i=>strokes[i]?.tool==="text");if(ids.length){checkpoint();ids.forEach(i=>strokes[i].format=clone(format))}draw()}
 function styleSelected(){if(!selected.size)return;checkpoint();for(const i of selected){if(strokes[i]){strokes[i].color=color;strokes[i].width=width}}}
 function close(saved){if(closed)return;if(!saved&&JSON.stringify(strokes)!==original&&!confirm("저장하지 않은 드로잉을 닫을까요?"))return;closed=true;clearHold();clearTimeout(msgTimer);ro?.disconnect();window.removeEventListener("resize",size);document.removeEventListener("keydown",keys,true);document.body.style.overflow=oldOverflow;el.remove();active=null;prevFocus?.focus?.()}
 function save(){try{if(opt.onSave?.(clone(strokes))===false)return;close(true)}catch(e){note("저장 실패: "+String(e.message||e));console.error(e)}}
 function act(k){
  if((k==="marker"||k==="erase")&&tool===k){toggleSettings(k);return}
  settings.hidden=true;
  if(["text","pen","marker","erase","lasso","line","rect","ellipse","arrow","hand"].includes(k)){tool=k;eraserPoint=null;if(k!=="lasso")selected.clear()}
  else if(k==="undo")restore(undo,redo);else if(k==="redo")restore(redo,undo);
  else if(k==="auto"){auto=!auto;note(auto?"도형 자동 보정 ON":"도형 자동 보정 OFF")}
  else if(k==="guide")guide=!guide;else if(k==="lock")locked=!locked;else if(k==="penOnly")penOnly=!penOnly;else if(k==="paper"){dark=!dark;if(bg)note("기존 도면 배경은 그대로 유지됩니다.")}
  else if(k==="reset"){zoom=1;pan={x:0,y:0}}
  else if(k==="clear"){if(strokes.length&&confirm("현재 드로잉의 작성 획만 모두 지울까요?")){checkpoint();strokes=[];selected.clear()}}
  else if(k==="align"){let ids=selected.size?[...selected]:strokes.length?[strokes.length-1]:[];if(ids.length){checkpoint();ids.forEach(i=>{let s=strokes[i],p=points(s);if(s.tool==="text"){s.format={...s.format,align:"left"};return}if(p.length<2)return;let a=p[0],b={...p.at(-1)};if(Math.abs(b.x-a.x)>=Math.abs(b.y-a.y))b.y=a.y;else b.x=a.x;strokes[i]={...s,tool:"line",points:[a,b]}})}}
  else if(k==="copy"){clipboard=clone([...selected].map(i=>strokes[i]).filter(Boolean));note("선택 항목 복사됨")}
  else if(k==="paste"&&clipboard.length){checkpoint();selected.clear();for(const s of clone(clipboard)){s.points=points(s).map(p=>({x:p.x+20,y:p.y+20}));selected.add(strokes.length);strokes.push(s)}tool="lasso"}
  else if(k==="delete"&&selected.size){checkpoint();strokes=strokes.filter((_,i)=>!selected.has(i));selected.clear()}
  else if(k==="edittext"&&selected.size===1){let i=[...selected][0],s=strokes[i];if(s?.tool==="text")startText(s.points[0],i)}
  else if(["check","bullet","number","bold","italic","underline","strike","left","center","right","indent"].includes(k))modifyFormat(k);
  else if(k==="save")save();else if(k==="close")close(false);
  if(!closed)draw();
 }
 function keys(e){if(closed||!textpanel.hidden||["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName))return;if(e.key==="Escape"){e.preventDefault();close(false)}else if((e.ctrlKey||e.metaKey)&&["z","y"].includes(e.key.toLowerCase())){e.preventDefault();act(e.key.toLowerCase()==="y"||e.shiftKey?"redo":"undo")}else if(e.key==="Delete"&&selected.size){e.preventDefault();act("delete")}}
 el.addEventListener("click",e=>{const b=e.target.closest("[data-ink]");if(b)act(b.dataset.ink);const c=e.target.closest("[data-color]");if(c){color=c.dataset.color;el.querySelector("[data-colorpicker]").value=color;styleSelected();updateSettings();draw()}});
 el.querySelector("[data-colorpicker]").addEventListener("change",e=>{color=e.target.value;styleSelected();updateSettings();draw()});
 el.querySelector("[data-width]").addEventListener("input",e=>width=Number(e.target.value));el.querySelector("[data-width]").addEventListener("change",()=>{styleSelected();draw()});
 el.querySelector("[data-fontsize]").addEventListener("change",e=>{format.size=Number(e.target.value);const ids=[...selected].filter(i=>strokes[i]?.tool==="text");if(ids.length){checkpoint();ids.forEach(i=>strokes[i].format=clone(format))}draw()});
 el.querySelector("[data-textok]").onclick=applyText;el.querySelector("[data-textcancel]").onclick=closeText;
 canvas.addEventListener("pointerdown",onDown);canvas.addEventListener("pointermove",onMove);canvas.addEventListener("pointerup",onUp);canvas.addEventListener("pointercancel",onUp);canvas.addEventListener("pointerleave",()=>{if(!drag){eraserPoint=null;draw()}});canvas.addEventListener("wheel",e=>{e.preventDefault();zoomAt(e.deltaY<0?1.12:.89,local(e))},{passive:false});document.addEventListener("keydown",keys,true);
 if(opt.background){const img=new Image();img.onload=()=>{if(!closed){bg=img;draw()}};img.src=opt.background}
 window.addEventListener("resize",size);if(window.ResizeObserver){ro=new ResizeObserver(size);ro.observe(stage)}
 active={close};size();return true;
}
function image(strokes,w=1600,h=1100){const c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d");g.fillStyle="white";g.fillRect(0,0,w,h);for(const s of strokes)paint(g,s,false);return c.toDataURL("image/png")}
window.SARCHInk231={open,image,geometry,recognize,paint,lines,cutStroke};
})();
