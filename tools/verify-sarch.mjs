/**
 * S:ARCH regression checks — browser-independent smoke test.
 * Run: node tools/verify-sarch.mjs
 * Does NOT access application storage, credentials or user data.
 */
import {readFileSync, existsSync} from 'node:fs';
import {Script} from 'node:vm';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
let checks=0;
function read(p){const path=join(root,p);if(!existsSync(path))throw new Error('Missing file: '+p);return readFileSync(path,'utf8')}
function ok(yes,msg){checks++;if(!yes)throw new Error('S:ARCH regression: '+msg)}
function onlyOnce(source,word,label){ok(source.includes(word)&&source.indexOf(word)===source.lastIndexOf(word),label+' must occur exactly once')}
function scriptSyntax(js,name){
 try{new Script(js,{filename:name});checks++}
 catch(e){throw new Error('Syntax error in '+name+': '+e.message)}
}
function checkInline(html,name){
 const all=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
 let index=0;
 for(const [,attrs,inner] of all){
  index++;
  if(/\bsrc\s*=/.test(attrs)||!inner.trim())continue;
  if(/\btype\s*=/.test(attrs)&&!/\btype\s*=\s*["'](?:text\/javascript|application\/javascript|module)/i.test(attrs))continue;
  scriptSyntax(inner,name+':inline-'+index);
 }
}
const version=JSON.parse(read('version.json'));
ok(version.version===175,'version.json should report v175');
ok(['survey','drawing','schmidt','tilt'].every(s=>version.modules.includes(s)),'all four modules available');
const moduleChecks=[
 {dir:'survey',bridge:'sarchSurveyFile',exportId:'id="export"',importId:'id="import"',minimum:100000},
 {dir:'drawing',bridge:'sarchDrawingFile',exportId:'onclick="saveJSON()"',importId:'onchange="loadJSON(event)"',minimum:85000},
 {dir:'schmidt',bridge:'sarchEquipmentFile',exportId:'id="export"',importId:'id="import"',minimum:300000},
 {dir:'tilt',bridge:'sarchTiltFile',exportId:'id="backup"',importId:'id="restore"',minimum:500000},
];
for(const m of moduleChecks){
 const html=read(m.dir+'/index.html');
 ok(html.length>m.minimum,m.dir+' application source unexpectedly truncated');
 onlyOnce(html,m.dir==='tilt'?'window.SARCHProjectBridge=function(mode)':'window.SARCHProjectBridge='+m.bridge,m.dir+' native sharing bridge');
 onlyOnce(html,'href="../sarch-workspace-v142.css?v=143"',m.dir+' shared CSS');
 onlyOnce(html,'src="../sarch-workspace-v142.js?v=161"',m.dir+' shared JS');
 ok(html.includes(m.exportId),m.dir+' project export preserved');
 ok(html.includes(m.importId),m.dir+' project import preserved');
 ok(html.includes('sarch-quick-nav-v139.js'),m.dir+' module dock preserved');
 ok(html.includes('sarch-layout-v135.js'),m.dir+' original layout preserved');
 ok(html.includes('SARCHBackupMark'),m.dir+' manual backup record');
 checkInline(html,m.dir+'/index.html');
 const sw=read(m.dir+'/sw.js');
 ok(sw.includes("smetric-"+m.dir+"-v175"),m.dir+' offline cache version');
 ok(sw.includes('sarch-workspace-v142.css?v=143')&&sw.includes('sarch-workspace-v142.js?v=161'),m.dir+' shared files cached offline');
 scriptSyntax(sw,m.dir+'/sw.js');
}
const layout=read('sarch-layout-v135.js');
scriptSyntax(layout,'sarch-layout-v135.js');
ok(!layout.includes("order.remove()"),'reorder control must not be deleted by shared layout');
ok(layout.includes('sarch-floor-more-v135'),'unmatched floor controls remain accessible');
const layoutCss=read('sarch-layout-v135.css');
ok(layoutCss.includes('.sarch-floor-more-v135>.sarch-floor-extras-v135'),'extra floor tools must be visible when expanded');
const home=read('index.html');
ok(home.includes('href="./receive.html"')&&home.includes('받은 현장 추가'),'home links to direct received-site import');
ok(home.includes('sarchInstallShare155')&&home.includes('beforeinstallprompt'),'home PWA install help for Android share target');
checkInline(home,'index.html');
for(const m of moduleChecks)ok(home.includes('href="./'+m.dir+'/'),m.dir+' home link preserved');
ok(!home.includes('sarch-auth-v140')&&!home.includes('sarchAccountButton'),'login is still disabled');
ok(home.includes('sarch-splash-v141.js'),'splash screen preserved');
const shared=read('sarch-workspace-v142.js');
scriptSyntax(shared,'sarch-workspace-v142.js');
ok(shared.includes('navigator.canShare')&&shared.includes('navigator.share'),'native file sharing capability');
ok(shared.includes('downloadFile(original)'),'share fallback downloads JSON');
const carrier=read('sarch-transfer-v156.js');
scriptSyntax(carrier,'sarch-transfer-v156.js');
ok(carrier.includes('application/pdf')&&carrier.includes('EmbeddedFile'),'PDF carrier embeds JSON project');
ok(shared.includes('return original;')&&!shared.includes('SARCHTransferV156.pdfFromJson'),'native sharing uses JSON attachment');
ok(shared.includes('JSON 파일을 저장했습니다.')&&!shared.includes('PDF 파일을 저장했습니다.'),'fallback states JSON file');
ok(shared.includes('navigator.share({files:[transfer]})')&&!shared.includes('title:"S:ARCH 현장 프로젝트"'),'share only the file, not an ambiguous text title');
ok(shared.includes('CHROME_ANDROID_MAX_SHARE_BYTES'),'50MB Android share limit handled');
ok(shared.includes('allowReceivedProjectFiles')&&shared.includes('.pdf,application/json'),'received file picker handles PDF carrier');
ok(shared.includes('navigator.userActivation'),'resilient large-project share preparation');
ok(shared.includes('openReceivedProject')&&shared.includes('sarch_received'),'share inbox auto routing to native project import');
ok(shared.includes('previous.retried'),'native share re-try preserves prepared file');
ok(!shared.includes('fetch(')&&!shared.includes('XMLHttpRequest'),'sharing does not upload company data automatically');
const report=read('sarch-defect-status-v157.js');
scriptSyntax(report,'sarch-defect-status-v157.js');
ok(report.includes('SARCHDefectStatusV157')&&report.includes('workbook.xml'),'per-building XLSX report generator');
ok(report.includes('"손상원인추정","조치 필요사항"]')&&!report.includes('"손상원인추정","사진"'),'7-column report has no photo column');
ok(report.includes('row(3,header,2,30)')&&!report.includes('row(3,["※ 손상원인추정')&&!report.includes('[일반적 추정]'),'header on row 3, no disclaimer/uncertainty suffix');
ok(report.includes('row(i+4,[')&&report.includes('A1:G1')&&report.includes('A2:G2'),'data on row 4, merge spans 7 columns');
ok(read("survey/index.html").includes("ctx.strokeStyle=annotationColor(d)")&&read("survey/index.html").includes("g.strokeStyle=annotationColor(d)"),'structural and nonstructural crack color matches defect category on canvas and PNG');
ok(read("survey/index.html").includes('id="sm170RectBtn"')&&read("survey/index.html").includes('id="sm170JoinBtn"'),'region drawing and joining buttons exist');
ok(read("survey/index.html").includes("kind:'region'")&&read("survey/index.html").includes("sm170Rect(drag.start,end)"),'drag creates persisted damage rectangle');
ok(read("survey/index.html").includes("kind:'joint'")&&read("survey/index.html").includes('d.linkJointOffset='),'two-segment annotation connector supports draggable saved joint');
ok(read("survey/index.html").includes('regionGroupId=gid')&&read("survey/index.html").includes('mergeGroupId=gid'),'joined rectangles share one visual label but retain individual defect data');
const reportContext={};
new Script(report,{filename:'sarch-defect-status-v157.js'}).runInNewContext({self:reportContext});
const reportAPI=reportContext.SARCHDefectStatusV157;
const sampleState={project:'QA 현장',pages:[{name:'1동 지상1층'}],defects:[
 {id:11,pageId:0,types:['철근노출'],width:'',length:'',count:1,photos:['photo11']},
 {id:12,pageId:0,mergeGroupId:'A',types:['균열'],width:'0.2',length:'300',count:1,photos:['photo12'],causeEstimate:'대표 원인'},
 {id:13,pageId:0,mergeGroupId:'A',types:['부식'],width:'50',length:'50',count:1,photos:['photo13'],causeEstimate:'다른 원인'},
 {id:14,pageId:0,types:['백태'],width:'100',length:'100',count:1,photos:['photo14']},
 {id:15,pageId:0,mergeGroupId:'A',types:['균열'],width:'0.3',length:'200',count:1,photos:['photo15']},
 {id:16,pageId:0,mergeGroupId:'B',types:['재료분리'],width:'',length:'',count:1,photos:['photo16']}
]};
const originalReportState=JSON.stringify(sampleState);
const groupedRows=reportAPI.groups(sampleState)[0][1];
ok(groupedRows.length===6,'six original defects remain separate XLSX rows regardless of visual grouping');
ok(groupedRows.map(x=>x.d.id).join('|')==='11|12|13|14|15|16','XLSX preserves original defect order and numbers');
ok(groupedRows[1].d.id===12&&groupedRows[2].d.id===13&&groupedRows[2].cause==='다른 원인','XLSX retains every defect description separately');
const zipContents={};
reportAPI.build({file:(path,content)=>zipContents[path]=content},sampleState);
const sheetOutput=zipContents['xl/worksheets/sheet1.xml'];
ok(!sheetOutput.includes('>2,3,5</t>')&&sheetOutput.includes('대표 원인')&&sheetOutput.includes('다른 원인'),'XLSX shows six individual rows, not a joined number row');
ok(sheetOutput.includes('A1:G1')&&sheetOutput.includes('조치 필요사항')&&!sheetOutput.includes('사진</t>'),'grouped XLSX retains seven-column layout');
ok(JSON.stringify(sampleState)===originalReportState&&sampleState.defects.length===6&&sampleState.defects[2].photos[0]==='photo13','XLSX grouping never mutates existing defect records or photos');
const surveyReport=read('survey/index.html');
ok(surveyReport.includes('id="causeEstimate"')&&surveyReport.includes('결함 현황표 엑셀'),'cause editor and Excel output');
ok(surveyReport.includes('id="sm156MarkerSizeWrap"')&&surveyReport.includes('hidden=!showDefectLabels'),'marker size slider visible only with labels ON');
const style=read('sarch-workspace-v142.css');
ok(style.includes('body.sarch-v142'),'styles are scoped to modern workspace');
ok((style.match(/{/g)||[]).length===(style.match(/}/g)||[]).length,'CSS braces balance');
const surveyManifest=JSON.parse(read('survey/manifest.webmanifest'));
ok(surveyManifest.share_target?.action==='/SEOB/survey/share-target','standalone survey PWA receives Android shares');
ok(surveyManifest.share_target?.params?.files?.[0]?.accept?.includes('.txt'),'standalone survey PWA accepts Quick Share text files');
const surveyV155=read('survey/index.html');
ok(surveyV155.includes('id="sm155MarkerSize"')&&surveyV155.includes('id="sm155SizeAll"'),'survey marker size slider and clear-selection control');
ok(surveyV155.includes('12*sm155MarkerFactor(d)')&&surveyV155.includes('Math.max(11,img.width/115)*sc'),'survey screen and PNG labels use selected marker scale');
ok(surveyV155.includes('state.defects.forEach(d=>{d.defectMarkerSize=pct})'),'global slider updates all site defects');
ok(surveyV155.includes('target.defectMarkerSize=pct'),'selected slider modifies one defect');
ok(surveyV155.includes('return size?(n>1?')&&surveyV155.includes('):`${n}EA`'),'default 1EA appears only when no dimensions are present');
ok(surveyV155.includes('id="eaPreset" aria-label="개수 선택"')&&!surveyV155.includes('aria-label="개수 고정" disabled'),'EA dropdown is selectable with no disabled lock');
ok(surveyV155.includes('Array.from({length:30}')&&surveyV155.includes("const countSelected=Number.isInteger(Number(d.count))"),'EA dropdown lists 1..30 and defaults to 1EA');
ok(surveyV155.includes("eaSelect.onchange=()=>")&&surveyV155.includes("setCountEA(Number(eaSelect.value))"),'EA selection updates stored quantity immediately');
ok(surveyV155.includes('id="eaCustom"')&&surveyV155.includes('eaCustom.oninput=()=>'),'EA dropdown also provides direct input like width/length');
ok(!surveyV155.includes('id="manualSpec"'),'separate bottom manual-spec field removed');
ok(['widthCustom','lengthCustom'].every(id=>surveyV155.includes('id="'+id+'"')),'width and length have in-place number input fields');
ok(surveyV155.includes('<option value="__custom__">직접 입력</option>'),'dropdowns end with direct-entry option');
ok(surveyV155.includes("input.focus();input.select();")&&surveyV155.includes("send(value)"),'direct-entry fields are focused and save original fields');
ok(surveyV155.includes("const direct=String(d.manualSpec??'').trim()")&&surveyV155.includes('if(direct)return direct.replace('),'manual dimension overrides generated drawing/photo/repair labels');
ok(surveyV155.includes("normalized.match(")&&surveyV155.includes("if(!m)return null"),'free-form manual dimension does not borrow stale measurements for area calculation');
ok(report.includes('var direct=txt(d.manualSpec)')&&report.includes('n+"EA"'),'XLSX report displays 1EA only when dimensions are absent');
ok(!surveyV155.includes('id="frontPhotoJump"')&&surveyV155.includes('grid-column:auto;order:0;scroll-margin-top'),'photo workspace no longer occupies a full-width top grid row');
ok(surveyV155.indexOf('id="board"')<surveyV155.indexOf('id="projectName"')&&surveyV155.indexOf('id="projectName"')<surveyV155.indexOf('id="frontPhotoWorkspace"'),'site and drawing name fields come directly before front photo workspace in left panel');
ok(surveyV155.includes('id="sm163MergeToggle"')&&surveyV155.includes('id="sm163MergeRemove"'),'visual group and per-defect release buttons');
ok(surveyV155.includes('sm163Chosen.add(d.id)')&&surveyV155.includes('function sm163Finish()'),'multi-selection and second-click grouping');
ok(surveyV155.includes('mismatchedType')&&surveyV155.includes('mismatchedSize')&&surveyV155.includes('if(!confirm('),'different kinds and sizes receive double confirmation');
ok(surveyV155.includes('function sm163Release()')&&surveyV155.includes('delete d.mergeGroupId'),'single defect release');
ok(surveyV155.includes('sm163Labels(ctx')&&surveyV155.includes('sm163Labels(g,ds'),'screen and PNG share label grouping and links');
ok(surveyV155.includes('d.mergeGroupId=id')&&surveyV155.includes('function sm163Groups()'),'group IDs persist inside original defect data');
const defectSpecFn=new Function(surveyV155.match(/function defectSpecText\(d\)\{[\s\S]*?\n\}/)?.[0]+';return defectSpecText')();
ok(defectSpecFn({types:['철근노출'],manualSpec:'120x350'})==='120X350','manual specification accepts lowercase x and normalizes dimension separator');
ok(defectSpecFn({manualSpec:'1ea'})==='1EA','manual EA-only display is preserved');
ok(defectSpecFn({width:'',length:'',count:1})==='1EA','default 1EA appears for defect without dimensions');
ok(defectSpecFn({width:'300',length:'250',count:1})==='300X250','default 1EA is hidden when dimensions exist');
ok(defectSpecFn({width:'300',length:'250',count:2})==='300X250X2EA','old multiple-EA records are preserved');
const measuredSource=surveyV155.split('function measuredQty(d){')[1]?.split('\n')[0];
const measuredFn=new Function('isCrackDefect','function measuredQty(d){'+measuredSource+';return measuredQty')(()=>false);
ok(Math.abs(measuredFn({manualSpec:'300X300X2EA'})-0.18)<0.000001,'manual dimensions calculate quantity when unambiguous');
ok(measuredFn({manualSpec:'2EA',width:300,length:300})===null,'EA-only manual input does not accidentally use stale preset dimensions');

ok(read('survey/sw.js').includes('sarch-defect-status-v157.js?v=169')&&rootSWCacheCheck(),'per-defect XLSX cache version updated');
ok(read('survey/sw.js').includes("sarch-share-inbox-v1")&&read('survey/sw.js').includes("req.formData()"),'independently installed survey app stages received files safely');
function rootSWCacheCheck(){return read('seob-sw.js').includes('sarch-defect-status-v157.js?v=169')}
const rootManifest=JSON.parse(read('manifest.webmanifest'));
ok(rootManifest.share_target?.action==='/SEOB/share-target','installed app accepts Android file shares');
ok(rootManifest.share_target?.params?.files?.[0]?.accept?.includes('.json'),'JSON extension registered for share target');
const received=read('receive.html');
checkInline(received,'receive.html');
ok(received.includes('새 현장으로 추가')&&received.includes('sarch_received'),'received file routed for confirmation');
ok(received.includes('id="pickBtn"')&&received.includes('id="filePick"'),'manual received file picker available');
ok(received.includes('jsonFromPdf')&&received.includes('.pdf'),'received PDF project extracts JSON');
ok(received.includes('await inbox.put(')&&received.includes('await run()'),'manually selected project staged for import');
const rootSW=read('seob-sw.js');
ok(rootSW.includes('smetric-offline-v175'),'root offline cache updated');
ok(rootSW.includes('sarch-workspace-v142.js')&&rootSW.includes('sarch-workspace-v142.css'),'new shared assets in root cache');
ok(rootSW.includes('sarch-transfer-v156.js')&&rootSW.includes('sarch-defect-status-v157.js'),'new data-transfer and report modules cached');
ok(rootSW.includes('sarch-share-inbox-v1')&&rootSW.includes('req.formData()'),'service worker intercepts shared project file');
ok(rootSW.includes('"./receive.html"'),'received file confirmation precached offline');
scriptSyntax(rootSW,'seob-sw.js');

// v148 drawing: three tool tabs, conditional eraser controls, right-side export retained.
const tiltHTML=read('tilt/index.html');
ok(tiltHTML.includes('sites:[...state.sites,...incoming]'),'tilt receive must append imported sites');
ok(!tiltHTML.includes('현재 기울기 현장 데이터를 백업 파일로 교체할까요?'),'tilt import must never prompt to overwrite existing sites');
ok(tiltHTML.includes('if(mode==="share")'),'tilt share limited to active site');
const tiltValueRectCode=tiltHTML.match(/function smTiltValueRect\(p\)\{[\s\S]*?\n\}/)?.[0];
const tiltDrawValueCode=tiltHTML.match(/function smTiltDrawValue\(p,i\)\{[\s\S]*?\n\}/)?.[0];
ok(!!tiltValueRectCode&&!!tiltDrawValueCode,'tilt value box functions exist for unavailable label test');
const mockSheet=()=>({smValueDefaultScale:1}), mockCanvas={width:1200,height:780};
const computeTilt=point=>point.distance?{delta:4.2,height:2600}:null;
const rectForTilt=new Function('sheet','canvas','smTiltCalculatedValues',tiltValueRectCode+';return smTiltValueRect')(mockSheet,mockCanvas,computeTilt);
const unavailablePoint={id:'QA',x:100,y:100,tx:200,ty:200,unavailable:true};
const unavailableRect=rectForTilt(unavailablePoint);
ok(!!unavailableRect&&unavailableRect.unavailable===true&&unavailableRect.lines.join('|')==='조사불가','unavailable point gets a visible value-box rectangle labeled 조사불가 even without measurements');
ok(rectForTilt({...unavailablePoint,unavailable:'true'}).lines.join('|')==='조사불가','legacy stored unavailable string is also recognized');
ok(rectForTilt({...unavailablePoint,unavailable:false})===null,'normal point with no measurements remains unlabeled');
const measuredRect=rectForTilt({...unavailablePoint,unavailable:false,distance:'1800'});
ok(!!measuredRect&&measuredRect.lines.length===2&&measuredRect.lines[0].startsWith('δ : ')&&measuredRect.lines[1].startsWith('H : '),'valid measurement display still shows displacement and height');
const painted=[],mockCtx={fillStyle:'',textAlign:'',save(){},restore(){},fillRect(...args){painted.push(['rect',this.fillStyle,...args])},fillText(...args){painted.push(['text',this.textAlign,...args])},strokeRect(){}};
const paintTilt=new Function('smTiltValueRect','ctx','selected','window',tiltDrawValueCode+';return smTiltDrawValue')(rectForTilt,mockCtx,null,{smArchCleanExport:true});
paintTilt(unavailablePoint,0);
ok(painted.some(a=>a[0]==='rect'&&a[1]==='#ffdb00')&&painted.some(a=>a[0]==='text'&&a[1]==='center'&&a[2]==='조사불가'),'unavailable label is centered inside the same yellow canvas box');
ok(tiltHTML.includes("if(window.smTiltValueVisible!==false)sh.points.forEach((p,i)=>smTiltDrawValue(p,i))"),'value toggle applies equally to normal measurements and unavailable points');
const renderSource=tiltHTML.slice(tiltHTML.indexOf('function render(){'),tiltHTML.indexOf('function smTiltAutoDirection('));
ok(renderSource.lastIndexOf('smTiltDrawValue(p,i)')>renderSource.lastIndexOf('ctx.fillRect(r.x,r.y,r.w,r.h)'), 'measurement boxes painted after building rectangle so they cannot be hidden');
ok(tiltHTML.includes('if(p.unavailable&&window.smTiltValueVisible===false)')&&tiltHTML.includes("smTiltSyncValueToggle()}save();renderList();render()"),'marking an unavailable point makes the yellow value box visible immediately');
ok(tiltHTML.includes('./sw.js?v=168')&&tiltHTML.includes('seob-sw.js?v=168'),'PWA service worker script registrations refresh for new tilt version');
ok(tiltHTML.includes("'#canvasWrap,#items,#detail,#smValueSizeLabel,#smTiltValueToggle'"),'measurement-toggle pointer event must not clear selected tilt point');
const drawHTML=read('drawing/index.html');
onlyOnce(drawHTML,'href="../sarch-drawing-tools-v144.css?v=149"','drawing v144 stylesheet');
onlyOnce(drawHTML,'src="../sarch-drawing-tools-v144.js?v=149"','drawing v144 controller');
const drawingUI=read('sarch-drawing-tools-v144.js');
scriptSyntax(drawingUI,'sarch-drawing-tools-v144.js');
ok(['draw','member','edit'].every(id=>drawingUI.includes('key:"'+id+'"')),'three drawing tool categories preserved');
ok(!drawingUI.includes('cloneNode('),'v144 controls must keep existing event handlers');
ok(drawingUI.includes('sarch-draw-legacy-parked-v148'),'legacy event handlers safely parked offscreen');

ok(!drawingUI.includes('key:"export"'),'removed redundant export toolbar tab');
ok(drawingUI.includes('side.appendChild(output)'),'export remains inside right-side editing panel');
ok(drawingUI.includes('sarchEraseOptions148'),'eraser options are contextual');
ok(drawingUI.includes('floorMore.remove()'),'drawing-only extra floor accordion is removed');
const drawingUIStyle=read('sarch-drawing-tools-v144.css');
ok(drawingUIStyle.includes('sarch-drawing-v144'),'v144 styles limited to drawing workspace');
ok((drawingUIStyle.match(/{/g)||[]).length===(drawingUIStyle.match(/}/g)||[]).length,'v144 CSS braces balanced');
const drawSW=read('drawing/sw.js');
ok(drawSW.includes('sarch-drawing-tools-v144.css?v=149')&&drawSW.includes('sarch-drawing-tools-v144.js?v=149'),'new drawing tools cached offline');
ok(rootSW.includes('sarch-drawing-tools-v144.js'),'new drawing JS cached by root PWA');


const shellJS=read('sarch-shell-v145.js');
scriptSyntax(shellJS,'sarch-shell-v145.js');
const shellCSS=read('sarch-shell-v145.css');
ok(shellJS.includes('sarch-camera-tab-v145'),'live camera buttons aligned in header');
ok(!shellJS.includes('cloneNode('),'camera buttons must not be duplicated');
ok((shellCSS.match(/{/g)||[]).length===(shellCSS.match(/}/g)||[]).length,'v145 CSS braces balanced');
for(const mod of ['survey','drawing','schmidt','tilt']){
 const page=read(mod+'/index.html');
 onlyOnce(page,'href="../sarch-shell-v145.css?v=147"',mod+' shell stylesheet');
 onlyOnce(page,'src="../sarch-shell-v145.js?v=145"',mod+' shell controller');
 const sw=read(mod+'/sw.js');
 ok(sw.includes('sarch-shell-v145.css?v=147')&&sw.includes('sarch-shell-v145.js?v=145'),mod+' shell cached for offline');
}
ok(rootSW.includes('sarch-shell-v145.js?v=145'),'root PWA caches shell JS');

ok(read('survey/index.html').includes("'표면처리':'표면처리공법'")&&read('survey/index.html').includes("'단면복구':'단면복구공법'"),'repair methods shown with full 공법 suffix');
ok(read('survey/index.html').includes('LABOR_2026.concreteRepair')&&read('survey/index.html').includes('LABOR_2026.concreteFinish'),'2026 concrete labor baselines are auto-filled when applicable');
ok(read('survey/index.html').includes('사용자 수정 단가')&&read('survey/index.html').includes("d.repair.rate=Math.max(0"),'cost rates remain user editable');
ok(read('survey/index.html').includes('사진 AI 분석 미연결'),'registered photographs are never represented as AI-inspected');
const costXlsx=read('sarch-repair-xlsx-v172.js');
scriptSyntax(costXlsx,'sarch-repair-xlsx-v172.js');
const costRoot={};
new Script(costXlsx).runInNewContext({self:costRoot});
const costCells={};
const costData={site:'QA 현장',overhead:20,rows:[
 {page:'지상1층',number:1,group:'구조체',type:'철근노출',method:'단면복구공법',qty:0.24,rate:95.428,priority:1,photoCount:1,source:'2026 노무비'},
 {page:'지상2층',number:2,group:'비구조체',type:'마감재 열화',method:'마감재 보수·재시공공법',qty:0.15,rate:null,priority:3,photoCount:0,source:'단가 미확인'}]};
const costSnapshot=JSON.stringify(costData);
const costInfo=costRoot.SARCHRepairXLSXV172.build({file:(path,value)=>costCells[path]=value},costData);
ok(costInfo.count===2&&costInfo.priced===1,'XLSX summary counts only entries with verified quantity and price');
ok(costCells['xl/workbook.xml'].includes('개략공사비_요약')&&costCells['xl/workbook.xml'].includes('층별_결함별'),'two named worksheets are generated');
ok(costCells['xl/worksheets/sheet2.xml'].includes('F5*H5')&&costCells['xl/worksheets/sheet2.xml'].includes('철근노출'),'formula-based costs and per-defect rows appear in detail sheet');
ok(costCells['xl/worksheets/sheet1.xml'].includes('SUMIF')&&costCells['xl/worksheets/sheet1.xml'].includes('COUNTIF'),'summary aggregates floors and methods by formulas');
ok(costCells['xl/styles.xml'].includes('FF12304B')&&costCells['xl/styles.xml'].includes('FFFFF2DB'),'XLSX uses branded navy and editable-rate highlights');
ok(JSON.stringify(costData)===costSnapshot,'XLSX generation never mutates source defect data');
ok(read('survey/index.html').includes('SARCHRepairXLSXV172.download')&&read('survey/index.html').includes('엑셀(XLSX) 다운로드'),'survey repair export is genuine XLSX rather than CSV');
ok(read('survey/sw.js').includes('sarch-repair-xlsx-v172.js?v=175')&&read('seob-sw.js').includes('sarch-repair-xlsx-v172.js?v=175'),'fixed XLSX generator included in both offline caches');
ok(read('survey/index.html').includes('function sm173PaintRegionUnion(')&&read('survey/index.html').includes('sm173PaintDefectRegion(ctx'),'joined rectangles produce a single exterior polyline on screen and PNG');
ok(read('survey/index.html').includes('delete d.regionGroupId;'),'individual release clears region grouping as well as label grouping');
ok(layout.includes('const activeExtra=Array.from')&&layout.includes('const compactModule=')&&layout.includes("extra.style.setProperty('display','none','important')"),'hidden rename controls never trigger redundant floor details');
ok(read('survey/index.html').includes("if(mode==='region'){sm170Preview=null;setMode('pin');draw();return}"),'region button supports second-click exit');
ok(read('survey/index.html').includes("drag=null;setMode('pin');draw();return}if(drag.kind==='joint'"),'region mode stops after drawing');
ok(read('survey/index.html').includes("document.addEventListener('pointerdown',e=>{")&&read('survey/index.html').includes("sm170Preview=null;sm170RegionPicks.clear();setMode('pin');draw()"),'outside taps stop region mode');
ok(read('survey/index.html').includes('sm174FmtQty(qty)'),'small quantities remain visible without rounding to 0.0');
const cSheet1=costCells['xl/worksheets/sheet1.xml'],cSheet2=costCells['xl/worksheets/sheet2.xml'];
const cellCache=(xml,cell)=>{
 const pos=xml.indexOf('<c r="'+cell+'"');
 const text=pos<0?'':xml.slice(pos,xml.indexOf('</c>',pos)+4);
 const between=(a,b)=>text.includes(a)?text.split(a)[1].split(b)[0]:'';
 return {formula:between('<f>','</f>'),value:Number(between('<v>','</v>'))};
};
const b7=cellCache(cSheet1,'B7'),f7=cellCache(cSheet1,'F7');
ok(b7.formula.includes('SUM(')&&Math.abs(b7.value-19.0856)<.00001,'cost summary includes cached real subtotal for viewing without recalculation');
ok(f7.formula.includes('B7*(1+D7/100)')&&Math.abs(f7.value-22.90272)<.00001,'indirect cost total has a cached result and live Excel formula');
ok(cSheet2.includes('r="I6" s="6" t="str"><f>')&&cSheet2.includes('<v></v>'),'unpriced defects show blank, never a fictitious zero total');
ok(cSheet1.includes('COUNTIF(')&&cSheet1.includes('SUMIF('),'floor and method rollups are formula-backed');
console.log('S:ARCH v175 OK — '+checks+' checks passed (static syntax, source integrity, navigation, export/share, offline cache).');
