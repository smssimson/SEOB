/* S:ARCH visual + functional browser smoke: no real user data. */
import { chromium } from "playwright";
import { mkdirSync,writeFileSync } from "node:fs";
const root="http://127.0.0.1:8765/",folder="test-results/browser";
mkdirSync(folder,{recursive:true});
const modules=["survey","drawing","schmidt","tilt"],results=[];
const browser=await chromium.launch({headless:true,executablePath:process.env.SARCH_CHROMIUM_PATH||undefined,args:["--no-sandbox","--disable-dev-shm-usage"]});
function report(mod,test,ok,detail=""){
 results.push({mod,test,ok,detail});
 console.log((ok?"PASS":"FAIL")+" "+mod+" "+test+" "+detail);
}
async function check(mod,width,height){
 const id=mod+"-"+width+"x"+height;
 const context=await browser.newContext({viewport:{width,height},serviceWorkers:"block",acceptDownloads:true});
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(String(e).slice(0,160)));
 await page.addInitScript(()=>{
  window.__sharedFile=null;
  Object.defineProperty(navigator,"canShare",{configurable:true,value:({files})=>Boolean(files?.length)});
  Object.defineProperty(navigator,"share",{configurable:true,value:async ({files})=>{
    const f=files?.[0],obj=JSON.parse(await f.text());
    window.__sharedFile={name:f.name,size:f.size,keys:Object.keys(obj)};
  }});
 });
 try{
  const res=await page.goto(root+mod+"/",{waitUntil:"domcontentloaded",timeout:45000});
  await page.waitForSelector("body.sarch-v142",{timeout:10000});
  await page.waitForTimeout(950);
  report(id,"loaded",res.ok());
  const dom=await page.evaluate(()=>{
   const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};
   const site=document.querySelector(".sarch-site-v135"),sel=site?.querySelector("select"),btn=site?.querySelector("button");
   return {
    site:rect(site),floor:rect(document.querySelector("#sarchFloor135")),tools:rect(document.querySelector(".sm43-tool-panel,.sm-survey-tools.sarch-top-tools-v135")),
    share:!!document.querySelector("#sarchShare142"),bridge:typeof window.SARCHProjectBridge==="function",
    siteSelect:rect(sel),siteButton:rect(btn),
    tabs:document.querySelectorAll(".sm43-tool-panel .sm43-tab,.sm-survey-tools .sm-mode-tabs button").length,
    labels:[...document.querySelectorAll(".sm43-tool-panel .sm43-tab,.sm-survey-tools .sm-mode-tabs button")].map(e=>e.textContent.trim())
   };
  });
  report(id,"core workspace",!!dom.site&&!!dom.floor&&!!dom.tools,JSON.stringify({site:dom.site?.h,floor:dom.floor?.h,tools:dom.tools?.h}));
  report(id,"project export/share",dom.share&&dom.bridge&&dom.tabs>=2,JSON.stringify({share:dom.share,bridge:dom.bridge,tabs:dom.tabs}));
  if(mod==="survey"){
    await page.locator("#smUtilityTab").click();
    const opened=await page.locator("#smUtilityGroup").isVisible();
    await page.locator("#smFieldTab").click();
    const returned=await page.locator("#smFieldGroup").isVisible();
    report(id,"survey tool tab switches",opened&&returned);
  }
  const verifyExists=await page.locator("#sarchVerify142").count()===1;
  report(id,"data protection preflight available",verifyExists);
  if(verifyExists){
    const json=await page.evaluate(async()=>{
      const file=window.SARCHProjectBridge?.();
      return file?await file.text():"";
    });
    if(json){
      await page.locator("#sarchProtectMenu input[type=file]").setInputFiles({
        name:"SARCH_QA_BACKUP.json",mimeType:"application/json",buffer:Buffer.from(json,"utf8")
      });
      const text=await page.locator(".sarch-verify-result-142").innerText();
      report(id,"backup preflight read-only",text.includes("✓ 백업 구조 확인"),text.slice(0,130));
    }else report(id,"backup preflight read-only",false,"No sample export available");
  }
  if(verifyExists){
    const before=await page.evaluate(async()=>await window.SARCHProjectBridge().text());
    await page.locator("#sarchProtectMenu input[type=file]").setInputFiles({name:"invalid.json",mimeType:"application/json",buffer:Buffer.from('{"unrelated":true}')});
    const message=await page.locator(".sarch-verify-result-142").innerText();
    const after=await page.evaluate(async()=>await window.SARCHProjectBridge().text());
    // Exports may contain timestamps; compare the actual data, excluding metadata.
    const data=x=>{const o=JSON.parse(x);for(const k of ["exportedAt","savedAt","timestamp"])delete o[k];return JSON.stringify(o)};
    report(id,"invalid backup rejected without mutation",message.includes("확인 실패")&&data(before)===data(after));
  }
  if(width>1100)report(id,"worksite aligned",!!dom.siteSelect&&!!dom.siteButton&&Math.abs(dom.siteSelect.y-dom.siteButton.y)<18,JSON.stringify({s:dom.siteSelect?.y,b:dom.siteButton?.y}));
  await page.locator("#sarchQuickDock .sarch-dock-toggle").click();
  await page.waitForTimeout(240);
  const dock=await page.evaluate(()=>{const el=document.querySelector("#sarchQuickDock .sarch-dock-panel");return{height:el.getBoundingClientRect().height,icons:[...el.querySelectorAll("a svg")].map(e=>e.getBoundingClientRect().height)}});
  report(id,"dock compact",dock.height>10&&dock.height<170&&dock.icons.length===5&&dock.icons.every(h=>h<35),JSON.stringify(dock));
  await page.locator("#sarchQuickDock .sarch-dock-toggle").click();
  if(width>1100){
   await page.locator("#sarchShare142").click({timeout:10000});
   await page.waitForTimeout(600);
   const shared=await page.evaluate(()=>window.__sharedFile);
   const required={survey:"defects",drawing:"sheets",schmidt:"site",tilt:"sites"}[mod];
   report(id,"native JSON share",!!shared&&shared.name.endsWith(".json")&&shared.size>10&&shared.keys.includes(required),JSON.stringify(shared));
  }
  if(mod==="drawing"&&width>1100){
   const baseline=await page.evaluate(()=>{
    const info=JSON.parse(localStorage.getItem("smetric-drawing-sites-index-v40"));
    return {count:info.sites.length,active:info.active,content:localStorage.getItem("smetric-drawing-site-v40-"+info.active)};
   });
   const exported=await page.evaluate(async()=>await window.SARCHProjectBridge().text());
   page.once("dialog",dialog=>dialog.accept());
   await page.locator("input#file").setInputFiles({
    name:"QA_새현장_프로젝트.json",mimeType:"application/json",buffer:Buffer.from(exported,"utf8")
   });
   await page.waitForTimeout(550);
   const after=await page.evaluate(()=>{
    const info=JSON.parse(localStorage.getItem("smetric-drawing-sites-index-v40"));
    return {count:info.sites.length,active:info.active,old:localStorage.getItem("smetric-drawing-site-v40-"+window.__oldDrawingId)};
   });
   const oldNow=await page.evaluate(oldId=>localStorage.getItem("smetric-drawing-site-v40-"+oldId),baseline.active);
   const newNow=await page.evaluate(()=>localStorage.getItem("smetric-drawing-site-v40-"+JSON.parse(localStorage.getItem("smetric-drawing-sites-index-v40")).active));
   report(id,"drawing import creates a separate site",after.count===baseline.count+1&&after.active!==baseline.active&&Boolean(newNow)&&Boolean(oldNow),JSON.stringify({before:baseline.count,after:after.count,oldSaved:Boolean(oldNow),newSaved:Boolean(newNow)}));
  }
  if(width===390){
   let downloads=0;page.on("download",()=>downloads++);
   await page.evaluate(()=>Object.defineProperty(navigator,"share",{configurable:true,value:async()=>{throw new DOMException("Cancelled","AbortError")}}));
   await page.locator("#sarchShare142").click();
   await page.waitForTimeout(150);
   report(id,"share cancellation has no download",downloads===0&&await page.locator("#sarchShare142").isEnabled());
   await page.evaluate(()=>Object.defineProperty(navigator,"canShare",{configurable:true,value:()=>false}));
   const download=page.waitForEvent("download");
   await page.locator("#sarchShare142").click();
   report(id,"unsupported sharing downloads JSON",(await download).suggestedFilename().endsWith(".json"));
  }
  report(id,"uncaught JS errors",errors.length===0,errors.join(" | ").slice(0,250));
  await page.screenshot({path:folder+"/"+id+".png"});
 }catch(e){
  report(id,"test runner",false,String(e).slice(0,300));
  try{await page.screenshot({path:folder+"/"+id+"-error.png"})}catch(_){}
 }finally{await context.close()}
}
try{
 for(const [w,h] of [[390,844],[1280,800],[800,1280],[1440,900]]){
  for(const mod of modules)await check(mod,w,h);
 }
}finally{await browser.close()}
const failures=results.filter(x=>!x.ok);
writeFileSync(folder+"/results.json",JSON.stringify({tests:results.length,failures:failures.length,results},null,2));
console.log("S:ARCH Chromium QA: "+(results.length-failures.length)+"/"+results.length+" checks passed.");
if(failures.length)process.exitCode=1;
