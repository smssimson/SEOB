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
ok(version.version===160,'version.json should report v160');
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
 onlyOnce(html,'src="../sarch-workspace-v142.js?v=157"',m.dir+' shared JS');
 ok(html.includes(m.exportId),m.dir+' project export preserved');
 ok(html.includes(m.importId),m.dir+' project import preserved');
 ok(html.includes('sarch-quick-nav-v139.js'),m.dir+' module dock preserved');
 ok(html.includes('sarch-layout-v135.js'),m.dir+' original layout preserved');
 ok(html.includes('SARCHBackupMark'),m.dir+' manual backup record');
 checkInline(html,m.dir+'/index.html');
 const sw=read(m.dir+'/sw.js');
 ok(sw.includes("smetric-"+m.dir+"-v160"),m.dir+' offline cache version');
 ok(sw.includes('sarch-workspace-v142.css?v=143')&&sw.includes('sarch-workspace-v142.js?v=157'),m.dir+' shared files cached offline');
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
ok(shared.includes('downloadFile(transfer)'),'share failure downloads a real PDF file');
const carrier=read('sarch-transfer-v156.js');
scriptSyntax(carrier,'sarch-transfer-v156.js');
ok(carrier.includes('application/pdf')&&carrier.includes('EmbeddedFile'),'PDF carrier embeds JSON project');
ok(shared.includes('SARCHTransferV156.pdfFromJson'),'native sharing uses real PDF attachment');
ok(!shared.includes('retryFile=original'),'never share original JSON directly');
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
ok(surveyV155.includes('id="eaPreset" aria-label="개수 고정" disabled'),'EA is fixed readonly 1EA for new records');
ok(!surveyV155.includes('id="manualSpec"'),'separate bottom manual-spec field removed');
ok(['widthCustom','lengthCustom'].every(id=>surveyV155.includes('id="'+id+'"')),'width and length have in-place number input fields');
ok(surveyV155.includes('<option value="__custom__">직접 입력</option>'),'dropdowns end with direct-entry option');
ok(surveyV155.includes("input.focus();input.select();")&&surveyV155.includes("send(value)"),'direct-entry fields are focused and save original fields');
ok(surveyV155.includes("const direct=String(d.manualSpec??'').trim()")&&surveyV155.includes('if(direct)return direct.replace('),'manual dimension overrides generated drawing/photo/repair labels');
ok(surveyV155.includes("normalized.match(")&&surveyV155.includes("if(!m)return null"),'free-form manual dimension does not borrow stale measurements for area calculation');
ok(report.includes('var direct=txt(d.manualSpec)')&&report.includes('n+"EA"'),'XLSX report displays 1EA only when dimensions are absent');
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

ok(read('survey/sw.js').includes('sarch-defect-status-v157.js?v=159')&&rootSWCacheCheck(),'manual-size report asset cache invalidation');
ok(read('survey/sw.js').includes("sarch-share-inbox-v1")&&read('survey/sw.js').includes("req.formData()"),'independently installed survey app stages received files safely');
function rootSWCacheCheck(){return read('seob-sw.js').includes('sarch-defect-status-v157.js?v=159')}
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
ok(rootSW.includes('smetric-offline-v160'),'root offline cache updated');
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

console.log('S:ARCH v157 OK — '+checks+' checks passed (static syntax, source integrity, navigation, export/share, offline cache).');
