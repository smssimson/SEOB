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
ok(version.version===142,'version.json should report v142');
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
 onlyOnce(html,'window.SARCHProjectBridge='+m.bridge,m.dir+' native sharing bridge');
 onlyOnce(html,'href="../sarch-workspace-v142.css?v=142"',m.dir+' shared CSS');
 onlyOnce(html,'src="../sarch-workspace-v142.js?v=142"',m.dir+' shared JS');
 ok(html.includes(m.exportId),m.dir+' project export preserved');
 ok(html.includes(m.importId),m.dir+' project import preserved');
 ok(html.includes('sarch-quick-nav-v139.js'),m.dir+' module dock preserved');
 ok(html.includes('sarch-layout-v135.js'),m.dir+' original layout preserved');
 ok(html.includes('SARCHBackupMark'),m.dir+' manual backup record');
 checkInline(html,m.dir+'/index.html');
 const sw=read(m.dir+'/sw.js');
 ok(sw.includes("smetric-"+m.dir+"-v142"),m.dir+' offline cache version');
 ok(sw.includes('sarch-workspace-v142.css?v=142')&&sw.includes('sarch-workspace-v142.js?v=142'),m.dir+' shared files cached offline');
 scriptSyntax(sw,m.dir+'/sw.js');
}
const home=read('index.html');
checkInline(home,'index.html');
for(const m of moduleChecks)ok(home.includes('href="./'+m.dir+'/'),m.dir+' home link preserved');
ok(!home.includes('sarch-auth-v140')&&!home.includes('sarchAccountButton'),'login is still disabled');
ok(home.includes('sarch-splash-v141.js'),'splash screen preserved');
const shared=read('sarch-workspace-v142.js');
scriptSyntax(shared,'sarch-workspace-v142.js');
ok(shared.includes('navigator.canShare')&&shared.includes('navigator.share'),'native file sharing capability');
ok(shared.includes('downloadFile(file)'),'file download fallback');
ok(!shared.includes('fetch(')&&!shared.includes('XMLHttpRequest'),'sharing does not upload company data automatically');
const style=read('sarch-workspace-v142.css');
ok(style.includes('body.sarch-v142'),'styles are scoped to modern workspace');
ok((style.match(/{/g)||[]).length===(style.match(/}/g)||[]).length,'CSS braces balance');
const rootSW=read('seob-sw.js');
ok(rootSW.includes('smetric-offline-v142'),'root offline cache updated');
ok(rootSW.includes('sarch-workspace-v142.js')&&rootSW.includes('sarch-workspace-v142.css'),'new shared assets in root cache');
scriptSyntax(rootSW,'seob-sw.js');
console.log('S:ARCH v142 OK — '+checks+' checks passed (static syntax, source integrity, navigation, export/share, offline cache).');
