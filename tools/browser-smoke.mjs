/**
 * S:ARCH UI smoke checks in a disposable, empty browser profile.
 * Checks layout, cross-app navigation, export JSON and account-free sharing.
 * It NEVER reads users' real browser data or edits their project records.
 */
import assert from "node:assert/strict";
import {chromium} from "playwright-core";
import {spawn} from "node:child_process";
import {existsSync,mkdirSync} from "node:fs";
import {join} from "node:path";
import {setTimeout as delay} from "node:timers/promises";

const repo=process.cwd();
const port=8765;
const base="http://127.0.0.1:"+port;
const output=join(repo,"qa-artifacts");
mkdirSync(output,{recursive:true});
const chrome=[process.env.CHROME_PATH,"/usr/bin/google-chrome","/usr/bin/google-chrome-stable","/usr/bin/chromium","/usr/bin/chromium-browser"].find(p=>p&&existsSync(p));
assert.ok(chrome,"Chrome/Chromium executable missing from test runner");
const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1"],{cwd:repo,stdio:"ignore"});
let browser;
const report=[];
const modules=["survey","drawing","schmidt","tilt"];
const viewports=[
 {name:"desktop",width:1440,height:900,touch:false},
 {name:"tablet",width:1024,height:768,touch:true}
];
try{
 let started=false;
 for(let i=0;i<60;i++){
  try{const res=await fetch(base+"/version.json");if(res.ok){started=true;break}}catch{}
  await delay(150);
 }
 assert.ok(started,"Local test server did not start");
 browser=await chromium.launch({executablePath:chrome,headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 for(const viewport of viewports){
  const context=await browser.newContext({
   viewport:{width:viewport.width,height:viewport.height},
   hasTouch:viewport.touch,
   isMobile:false, // Galaxy tablets generally render the desktop layout at this width
   acceptDownloads:true,serviceWorkers:"block",locale:"ko-KR"
  });
  for(const mod of modules){
   const page=await context.newPage();
   const errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   try{
    await page.goto(base+"/"+mod+"/",{waitUntil:"domcontentloaded",timeout:60000});
    await page.waitForSelector("#sarchShare142",{timeout:30000});
    await page.waitForSelector("#sarchQuickDock",{timeout:10000});
    await page.waitForSelector("#sarchFloor135",{timeout:10000});
    await page.waitForSelector("#sarchVerify142",{timeout:10000});
    const count=await page.locator("#sarchShare142").count();
    assert.equal(count,1,mod+" share button must not duplicate");
    const payload=await page.evaluate(async()=>{
      const f=window.SARCHProjectBridge?.();
      if(!(f instanceof File))return {valid:false};
      let json=null;
      try{json=JSON.parse(await f.text())}catch{}
      return {valid:!!json,name:f.name,size:f.size,keys:Object.keys(json||{})};
    });
    assert.ok(payload.valid&&payload.size>2&&payload.name.endsWith(".json"),mod+" export is not a valid JSON file");
    const required={survey:"defects",drawing:"sheets",schmidt:"site",tilt:"sites"}[mod];
    assert.ok(payload.keys.includes(required),mod+" export is missing "+required);
    const toggle=page.locator("#sarchQuickDock .sarch-dock-toggle");
    await toggle.click();
    const panel=page.locator("#sarchQuickDock .sarch-dock-panel");
    const measurements=await panel.evaluate(el=>({
      height:Math.round(el.getBoundingClientRect().height),
      icons:[...el.querySelectorAll("svg")].map(x=>Math.round(x.getBoundingClientRect().height)),
      links:el.querySelectorAll("a").length
    }));
    assert.equal(measurements.links,5,"Quick program navigation should have five links");
    assert.ok(measurements.height<=160,"Program dock too tall in "+mod+": "+measurements.height+"px");
    assert.ok(measurements.icons.every(x=>x>0&&x<=35),"Program icon too tall in "+mod+": "+measurements.icons);
    await toggle.click();
    const geometry=await page.evaluate(()=>({
      viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      site:document.querySelector(".sarch-site-v135")?.getBoundingClientRect().height,
      floor:document.querySelector("#sarchFloor135")?.getBoundingClientRect().height
    }));
    assert.ok(geometry.site>30&&geometry.floor>30,"Site/floor managers not displayed");
    const filename=mod+"-"+viewport.name+".png";
    await page.screenshot({path:join(output,filename),fullPage:false,animations:"disabled"});
    report.push({module:mod,device:viewport.name,export:payload.name,bytes:payload.size,dockHeight:measurements.height,siteHeight:Math.round(geometry.site),floorHeight:Math.round(geometry.floor),horizontalOverflow:Math.max(0,geometry.scrollWidth-geometry.viewport),pageErrors:errors});
    console.log("PASS "+mod+"/"+viewport.name+" share+JSON+nav+backup-check",report.at(-1));
    assert.equal(errors.length,0,"Unhandled page JavaScript errors in "+mod+"/"+viewport.name+": "+errors.join(" | "));
   }catch(e){
    console.error("FAIL "+mod+"/"+viewport.name+" "+e.stack);
    try{await page.screenshot({path:join(output,"FAIL-"+mod+"-"+viewport.name+".png"),fullPage:false})}catch{}
    throw e;
   }finally{await page.close()}
  }
  await context.close();
 }
 console.log("S:ARCH browser smoke PASS: "+report.length+" combinations; screenshots under qa-artifacts/");
}finally{
 await browser?.close().catch(()=>{});
 server.kill("SIGTERM");
}
