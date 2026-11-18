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

  await page.waitForSelector("body.sarch-shell-v145",{timeout:10000});
  const cameraAligned=await page.evaluate(mod=>{
    const cam=document.getElementById(mod==="survey"?"cameraBtn":"sm52FixedCamera");
    const expected=mod==="drawing"?"sarchDrawTabs144":mod==="survey"?"":""; 
    const host=mod==="drawing"?document.getElementById("sarchDrawTabs144"):
      document.querySelector(mod==="survey"?".sm-survey-tools .sm-mode-tabs":".sm43-tool-panel .sm43-tabs");
    return !!cam&&!!host&&cam.parentElement===host;
  },mod);
  report(id,"camera aligned with tool tabs",cameraAligned);
  if(width===800){
    const header=await page.evaluate(()=>{
      const root=document.querySelector("header.smetric-app-header");
      const group=root?.querySelector(".smetric-head-controls");
      const box=root?.getBoundingClientRect();
      const candidates=[
        root?.querySelector(".smetric-brand"),root?.querySelector("#smSaveIndicator"),
        ...(group?[...group.children]:[])
      ].filter(Boolean);
      const rects=candidates.map(el=>({name:el.className||el.id||el.tagName,r:el.getBoundingClientRect()}))
        .filter(x=>x.r.width>1&&x.r.height>1);
      const bound=rects.every(x=>x.r.left>=-1&&x.r.right<=innerWidth+1);
      const overlapping=[];
      for(let a=0;a<rects.length;a++)for(let b=a+1;b<rects.length;b++){
        const x=rects[a].r,y=rects[b].r;
        if(Math.min(x.right,y.right)-Math.max(x.left,y.left)>3&&
           Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top)>3)
          overlapping.push(String(rects[a].name)+" / "+String(rects[b].name));
      }
      return {height:Math.round(box.height),bounds:bound,overlapping,parts:rects.map(x=>({name:String(x.name),left:Math.round(x.r.left),right:Math.round(x.r.right),top:Math.round(x.r.top)}))};
    });
    report(id,"tablet header no overlap",header.height>0&&header.height<=115&&header.bounds&&header.overlapping.length===0,JSON.stringify(header));
  }

  await page.screenshot({path:folder+"/"+id+"-initial.png",animations:"disabled"});
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
  if(mod==="survey"||mod==="schmidt"){
   const floorExtras=await page.evaluate(mod=>{
    const box=document.querySelector("#sarchFloor135"),hidden=document.getElementById(mod==="survey"?"renamePage":"rename");
    return {extra:box?.querySelectorAll(".sarch-floor-more-v135").length||0,
      preserved:!!hidden&&box.contains(hidden),headerText:!!box?.textContent.includes("기타 도면 도구")};
   },mod);
   report(id,"no redundant floor details, hidden rename kept",floorExtras.extra===0&&floorExtras.preserved&&!floorExtras.headerText,JSON.stringify(floorExtras));
  }
  report(id,"project export/share",dom.share&&dom.bridge&&dom.tabs>=2,JSON.stringify({share:dom.share,bridge:dom.bridge,tabs:dom.tabs}));
  const datedName=await page.evaluate(()=>{
    const f=window.SARCHProjectBridge?.();
    return f?.name||"";
  });
  report(id,"dated unique backup filename",/_\d{8}_\d{6}\.json$/.test(datedName),datedName);

  if(mod==="drawing"){
    await page.waitForSelector("body.sarch-drawing-v148",{timeout:10000});
    const nav=page.locator("#sarchDrawTabs144 [role=tab]");
    const labels=await nav.allTextContents();
    const initCount=await nav.count();
    const counts=await page.evaluate(()=>({
      select:document.querySelectorAll("#modeSelect").length,
      free:document.querySelectorAll("#modeFree").length,
      column:document.querySelectorAll("#modeColumn").length,
      export:document.querySelectorAll(".sm-drawing-output").length
    }));
    await page.locator("#sarchDrawTab144-member").click();
    const structural=await page.locator("#modeColumn").isVisible();
    await page.locator("#sarchDrawTab144-edit").click();
    const eraser=await page.locator("#modeErase").isVisible();
    await page.locator("#modeSelect").click();
    const initialHidden=!(await page.locator("#sarchEraseOptions148").isVisible());
    await page.locator("#modeErase").click();
    const eraserOptionsVisible=await page.locator("#sarchEraseOptions148").isVisible()&&
      await page.locator("#eraseSize").isVisible()&&await page.locator("#eraseMode").isVisible();
    const eraserClickedState=await page.evaluate(()=>{
      const b=document.getElementById("modeErase"),o=document.getElementById("sarchEraseOptions148"),p=document.getElementById("eraseSize");
      return {active:b?.className,optionHidden:o?.hidden,optionDisplay:o?getComputedStyle(o).display:null,
        sliderVisible:p?getComputedStyle(p).display:null,sliderRect:p?.getBoundingClientRect()?.toJSON(),
        mode:document.getElementById("eraseMode")?.value,buttonParent:b?.parentElement?.className};
    });
    const buttonGrouped=await page.locator("#modeErase").evaluate(el=>el.parentElement?.classList.contains("sarch-eraser-unit-v148"));
    await page.locator("#modeSelect").click();
    const hiddenAfter=!(await page.locator("#sarchEraseOptions148").isVisible());
    const eraserDebug=await page.evaluate(()=>{
      const button=document.getElementById("modeErase"),el=document.getElementById("sarchEraseOptions148"),wrapper=document.querySelector(".sarch-eraser-unit-v148");
      return {buttonParent:button?.parentElement?.className,buttonClasses:button?.className,
        optionParent:el?.parentElement?.className,optionsHidden:el?.hidden,optionsChildren:[...el?.children||[]].map(x=>x.id||x.outerHTML.slice(0,100)),
        wrapper:!!wrapper,wrapperChildren:[...wrapper?.children||[]].map(x=>x.id)};
    });

    const output=await page.locator("#side > .sm-drawing-output").isVisible()&&await page.locator("#sarchShare142").isVisible();
    const compact=await page.locator("#side .sarch-draw-export-grid-v144>button").count()===7;
    const cameraDocked=await page.locator("#sarchDrawTabs144 #sm52FixedCamera").count()===1;
    const helpCollapsed=await page.locator(".sarch-draw-output-help-v144").evaluate(el=>el.open===false);
    const noExtras=await page.locator("#sarchFloor135 .sarch-floor-more-v135").count()===0;
    const noLegacy=await page.locator("#sarchDrawSurface144 .sarch-draw-legacy-v144,#sarchDrawSurface144 .sarch-draw-more-v144").count()===0;
    await page.locator("#sarchDrawTab144-draw").click();
    const drawing=await page.locator("#modeFree").isVisible();
    report(id,"drawing concise edit and right-side output",
      initCount===3&&labels.join("").includes("편집")&&structural&&eraser&&initialHidden&&
      eraserOptionsVisible&&buttonGrouped&&hiddenAfter&&output&&compact&&cameraDocked&&
      helpCollapsed&&noExtras&&noLegacy&&drawing&&Object.values(counts).every(n=>n===1),
      JSON.stringify({labels,counts,structural,eraser,initialHidden,eraserOptionsVisible,buttonGrouped,
      hiddenAfter,output,compact,cameraDocked,helpCollapsed,noExtras,noLegacy,drawing,eraserClickedState,eraserDebug}));
  }
  if(mod==="survey"){
    await page.locator("#smUtilityTab").click();
    const opened=await page.locator("#smUtilityGroup").isVisible();
    await page.locator("#smFieldTab").click();
    const returned=await page.locator("#smFieldGroup").isVisible();
    report(id,"survey tool tab switches",opened&&returned);
    if(width===1280){
      const allRates=await page.evaluate(()=>{
        const original=structuredClone(state),samples=[
          {id:901,types:['구조체 누수흔적'],repair:{rate:'',materialRate:null,otherRate:null}},
          {id:902,types:['구조체 균열'],width:.2,length:900,repair:{}},
          {id:903,types:['비구조체 균열'],width:.2,length:300,repair:{rate:null,materialRate:'',otherRate:''}},
          {id:904,types:['마감재 손상(박리·박락·들뜸·탈락)'],repair:{rate:95.428}},
          {id:905,types:['철근노출'],repair:{rate:null,materialRate:'NaN',otherRate:'undefined'}},
          {id:906,types:['구조체 박락'],repair:{}},
          {id:907,types:[],repair:{}}
        ].map(d=>({...d,pageId:0,point:{x:40,y:50},count:1,photos:[]}));
        let result={};
        try{
          state.pages=[{name:'QA 가상 현장',image:''}];
          state.defects=samples;state.nextId=908;
          const before=JSON.stringify(state.defects);
          renderRepair();
          const keys=['rate','materialRate','otherRate'];
          const rows=[...document.querySelectorAll('#repairCostRows tr')].map(tr=>{
            const values=keys.map(k=>tr.querySelector('input[data-key="'+k+'"]')?.value??'');
            return {values,numeric:values.every(v=>v!==''&&Number.isFinite(Number(v))&&Number(v)>0)};
          });
          const xls=repairRows().map(({d,rule})=>{
            const parts=sm180RateBreakdown(rule),q=sm182CostQty(d);
            return {ready:parts.complete&&Number.isFinite(parts.unitRate)&&parts.unitRate>0&&Number.isFinite(q.qty)};
          });
          result={count:rows.length,allFilled:rows.every(r=>r.numeric),xlsxReady:xls.every(x=>x.ready),
            preservesSaved:before===JSON.stringify(state.defects),
            manualRatePreserved:rows[3]?.values[0]==='95.428',rates:rows.map(x=>x.values)};
        }catch(err){result={error:String(err)}}finally{state=original;renderRepair()}
        return result;
      });
      report(id,"all three indicative repair prices auto-populated for current and legacy defects",
        allRates.count===7&&allRates.allFilled&&allRates.xlsxReady&&allRates.preservesSaved&&allRates.manualRatePreserved,
        JSON.stringify(allRates).slice(0,850));
    }
    if(width===1280){
      const photoUnderMap=await page.evaluate(()=>{
        const section=document.getElementById("frontPhotoWorkspace"),board=document.getElementById("board");
        const area=board?.closest("section.panel"),photo=section?.getBoundingClientRect(),drawing=board?.getBoundingClientRect();
        const inMapPanel=!!section&&section.parentElement===area;
        const afterDrawing=!!photo&&!!drawing&&photo.top>drawing.bottom;
        const sameColumn=!!photo&&!!drawing&&Math.abs(photo.left-drawing.left)<28&&photo.right<=drawing.right+28;
        const fieldRow=document.getElementById("projectName")?.closest(".row");
        const followsFields=!!fieldRow&&section.previousElementSibling===fieldRow;
        const fieldsAfterMap=!!fieldRow&&fieldRow.getBoundingClientRect().top>drawing.bottom;
        const photosAfterFields=!!fieldRow&&photo.top>fieldRow.getBoundingClientRect().bottom;
        return {inMapPanel,afterDrawing,sameColumn,followsFields,fieldsAfterMap,photosAfterFields};
      });
      report(id,"drawing then site fields then front photos within left column",
        Object.values(photoUnderMap).every(Boolean),JSON.stringify(photoUnderMap));
      const internalPhotos=await page.evaluate(async()=>{
        const previous=structuredClone(state.albumPhotos||{outside:[],inside:[]});
        const originalDownload=window.download,originalAlert=window.alert;
        const alerts=[];
        let result={slots:0,labelSaved:false,photoCounter:'',hwpVerified:false};
        try{
          const testCanvas=document.createElement('canvas');
          testCanvas.width=30;testCanvas.height=20;
          const g=testCanvas.getContext('2d');g.fillStyle='#8acde0';g.fillRect(0,0,30,20);
          state.albumPhotos.inside[6]={label:'지상2층 QA 추가 내부 전경',image:testCanvas.toDataURL('image/jpeg',.8)};
          renderFrontPhotoWorkspace();
          result.slots=document.querySelectorAll('#frontInside .front-photo-card').length;
          result.photoCounter=document.querySelector('#frontInsideCount')?.textContent||'';
          result.labelSaved=albumSlot('inside',6).label==='지상2층 QA 추가 내부 전경';
          let capture=null;
          window.download=(blob,name)=>{capture={blob,name}};
          window.alert=m=>alerts.push(String(m));
          await exportAlbumHwpx();
          if(capture){
            const zip=await JSZip.loadAsync(capture.blob);
            const section=await zip.file('Contents/section0.xml').async('string');
            const manifest=await zip.file('Contents/content.hpf').async('string');
            const xml=new DOMParser().parseFromString(section,'application/xml');
            const hpf=new DOMParser().parseFromString(manifest,'application/xml');
            result.hwpVerified=!!zip.file('BinData/albumInteriorExtra7.jpg')&&
              section.includes('지상2층 QA 추가 내부 전경')&&
              manifest.includes('albumInteriorExtra7')&&
              !xml.querySelector('parsererror')&&!hpf.querySelector('parsererror');
            result.hwpSize=capture.blob.size;
          }
          result.alerts=alerts;
        }catch(err){result.error=String(err)}
        finally{
          state.albumPhotos=previous;
          renderFrontPhotoWorkspace();
          window.download=originalDownload;
          window.alert=originalAlert;
        }
        return result;
      });
      report(id,"12 interior slots, seventh picture retained and extra HWPX page generated",
        internalPhotos.slots===12&&internalPhotos.labelSaved&&internalPhotos.photoCounter.includes('/ 12장')&&internalPhotos.hwpVerified,
        JSON.stringify(internalPhotos).slice(0,500));
      await page.evaluate(()=>{
        window.__qaSurveyBeforeMerge=structuredClone(state);
        const picture=document.createElement("canvas");picture.width=640;picture.height=400;
        picture.getContext("2d").fillStyle="white";
        picture.getContext("2d").fillRect(0,0,640,400);
        state.pages=[{name:"QA 1층",image:picture.toDataURL("image/png")}];
        state.activePage=0;
        state.defects=[
          {id:801,pageId:0,point:{x:70,y:80},types:["철근노출"],width:"",length:"",count:1,photos:[]},
          {id:802,pageId:0,point:{x:210,y:180},types:["철근노출"],width:"",length:"",count:1,photos:[]},
          {id:803,pageId:0,point:{x:450,y:260},types:["철근노출"],width:"",length:"",count:1,photos:[]}
        ];
        state.nextId=804;selected=null;loadImage(state.pages[0].image);refresh();
      });
      await page.waitForFunction(()=>typeof img!=="undefined"&&img?.width===640);
      await page.evaluate(()=>{
        window.__qaRegionRestore={defects:structuredClone(state.defects),nextId:state.nextId};
        document.getElementById("autoCamera").checked=false;
      });
      await page.locator("#sm170RectBtn").click();
      const firstOn=await page.evaluate(()=>mode==="region"&&document.getElementById("sm170RectBtn").classList.contains("active"));
      await page.locator("#sm170RectBtn").click();
      const secondOff=await page.evaluate(()=>mode==="pin"&&!document.getElementById("sm170RectBtn").classList.contains("active"));
      await page.locator("#sm170RectBtn").click();
      await page.locator("#smUtilityTab").click();
      const tabCancel=await page.evaluate(()=>mode==="pin");
      await page.locator("#smFieldTab").click();
      await page.locator("#sm170RectBtn").click();
      await page.locator("#canvas").scrollIntoViewIfNeeded();
      const box=await page.locator("#canvas").boundingBox();
      const coords=await page.evaluate(()=>({
        a:screen({x:290,y:110}),b:screen({x:385,y:165})
      }));
      await page.mouse.move(box.x+coords.a.x,box.y+coords.a.y);
      await page.mouse.down();
      await page.mouse.move(box.x+coords.b.x,box.y+coords.b.y,{steps:7});
      await page.mouse.up();
      const dragCheck=await page.evaluate(()=>({
        mode,
        regionCount:currentDefects().filter(d=>Array.isArray(d.regions)&&d.regions.length).length,
        total:currentDefects().length,
        selectedRegion:!!state.defects.find(d=>d.id===selected)?.regions?.length
      }));
      report(id,"region tool toggle, outside cancel, and drag auto-exit",
        firstOn&&secondOff&&tabCancel&&dragCheck.mode==="pin"&&dragCheck.regionCount===1&&dragCheck.total===4&&dragCheck.selectedRegion,
        JSON.stringify({firstOn,secondOff,tabCancel,...dragCheck}));
      await page.evaluate(()=>{
        const orig=window.__qaRegionRestore;
        state.defects=orig.defects;state.nextId=orig.nextId;delete window.__qaRegionRestore;
        selected=null;sm170RegionPicks.clear();sm170Preview=null;setMode("pin");persist();refresh();draw();
      });
      // Select one real defect to reveal label and circle cardinal handles.
      await page.evaluate(()=>{
        selected=currentDefects()[0].id;
        if(!showDefectLabels)document.getElementById('labelToggle').click();
        refresh();draw();
      });
      const options=await page.evaluate(()=>{
        const all=sm177Handles.filter(h=>h.sourceId===currentDefects()[0].id);
        return {all:all.length,circle:all.find(h=>h.target==='circle'&&h.side==='bottom'),
          label:all.find(h=>h.target==='label'&&h.side==='top')};
      });
      const cb=await page.locator("#canvas").boundingBox();
      const tap=async pos=>{
        await page.mouse.move(cb.x+pos.x,cb.y+pos.y);
        await page.mouse.down();await page.mouse.up();
      };
      if(options.all===8){await tap(options.circle);await tap(options.label)}
      const snapped=await page.evaluate(()=>{
        const d=currentDefects()[0];
        return {circle:d.linkCircleSide,label:d.linkLabelSide,handles:sm177Handles.length,
         segments:sm177Segments.filter(s=>s.id===d.id).length};
      });
      report(id,"connector label and defect-circle endpoints independently snap to four sides",
        options.all===8&&snapped.circle==='bottom'&&snapped.label==='top'&&snapped.segments===2,
        JSON.stringify(snapped));
      await page.evaluate(()=>{selected=null;refresh();draw()});
      const unselected=await page.evaluate(()=>sm177Handles.length===0&&sm177Segments.length>=6);
      report(id,"unselected connector shows line without green edit handles",unselected);
      await page.evaluate(()=>{
        selected=currentDefects()[0].id;refresh();draw();
      });
      const retained=await page.evaluate(()=>{
        const d=currentDefects()[0];return d.linkCircleSide==='bottom'&&d.linkLabelSide==='top';
      });
      report(id,"connector endpoint choices persist after redraw",retained);
      await page.evaluate(()=>{selected=null;refresh();draw()});
      await page.locator("#smUtilityTab").click();
      await page.locator("#sm163MergeToggle").click();
      const picked=await page.evaluate(()=>{
        currentDefects().forEach(d=>sm163Pick(d));
        return sm163MergeMode&&sm163Chosen.size===3;
      });
      await page.locator("#sm163MergeToggle").click();
      const grouped=await page.evaluate(()=>{
        const ds=currentDefects();
        return !sm163MergeMode&&new Set(ds.map(d=>d.mergeGroupId)).size===1&&
          ds.every(d=>!!d.mergeGroupId)&&annotationRects.length===1;
      });
      report(id,"defect group selection and single label",picked&&grouped);
      await page.evaluate(()=>{selected=currentDefects()[1].id;refresh();draw()});
      await page.locator("#sm163MergeRemove").click();
      const released=await page.evaluate(()=>{
        const ds=currentDefects();
        return !ds[1].mergeGroupId&&ds[0].mergeGroupId===ds[2].mergeGroupId&&
          annotationRects.length===2;
      });
      report(id,"release only selected group member",released);
      await page.evaluate(()=>{selected=currentDefects()[0].id;refresh();draw()});
      await page.locator("#sm163MergeRemove").click();
      const cleared=await page.evaluate(()=>currentDefects().every(d=>!d.mergeGroupId)&&annotationRects.length===3);
      report(id,"singleton group automatically dissolves",cleared);
      const regionFeature=await page.evaluate(()=>{
        const ds=currentDefects(),before=JSON.stringify(ds.map(d=>({id:d.id,photos:d.photos,types:d.types})));
        ds[0].regions=[{x:20,y:20,w:120,h:60}];
        ds[1].regions=[{x:90,y:45,w:65,h:120}];
        sm170RegionPicks.add(ds[0].id);sm170RegionPicks.add(ds[1].id);
        sm170CompleteRegionJoin();
        const joined=ds[0].regionGroupId&&ds[0].regionGroupId===ds[1].regionGroupId&&ds[0].mergeGroupId===ds[1].mergeGroupId;
        const after=JSON.stringify(ds.map(d=>({id:d.id,photos:d.photos,types:d.types})));
        const segments=[];
        const capture={save(){},restore(){},beginPath(){},moveTo(x,y){this.a=[x,y]},lineTo(x,y){segments.push([this.a,[x,y]])},stroke(){}};
        sm173PaintRegionUnion(capture,[ds[0],ds[1]],p=>p);
        return {joined,sourceIntact:before===after,segments:segments.length,oneLabel:annotationRects.length===2};
      });
      report(id,"joined rectangle regions draw L-shaped exterior without deleting source defects",
        regionFeature.joined&&regionFeature.sourceIntact&&regionFeature.segments>=6&&regionFeature.oneLabel,
        JSON.stringify(regionFeature));
      const costWorkbook=await page.evaluate(async()=>{
        const zip=new JSZip(),payload={site:'QA 현장',overhead:30,rows:[
          {page:'지상1층',number:1,group:'구조체',type:'철근노출',method:'단면복구공법',qty:.2,rate:95.428,priority:1,source:'노무비 근거'},
          {page:'지상2층',number:2,group:'비구조체',type:'마감재 열화',method:'마감재 보수공법',qty:.4,rate:null,priority:3,source:'단가 미확인'}
        ]};
        const summary=window.SARCHRepairXLSXV172.build(zip,payload);
        const bytes=await zip.generateAsync({type:'uint8array'}),opened=await JSZip.loadAsync(bytes);
        const workbook=await opened.file('xl/workbook.xml').async('string');
        const detail=await opened.file('xl/worksheets/sheet2.xml').async('string');
        const styles=await opened.file('xl/styles.xml').async('string');
        const sum=await opened.file('xl/worksheets/sheet1.xml').async('string');
        const parser=new DOMParser(),summaryXml=parser.parseFromString(sum,'text/xml'),detailXml=parser.parseFromString(detail,'text/xml');
        const parseOkay=!summaryXml.querySelector('parsererror')&&!detailXml.querySelector('parsererror');
        const cell=(doc,ref)=>Array.from(doc.getElementsByTagName('c')).find(c=>c.getAttribute('r')===ref);
        const subTotal=Number(cell(summaryXml,'B7')?.getElementsByTagName('v')[0]?.textContent);
        const full=Number(cell(summaryXml,'F7')?.getElementsByTagName('v')[0]?.textContent);
        const blank=cell(detailXml,'I6')?.getAttribute('t')==='str';
        return {count:summary.count,priced:summary.priced,twoSheets:workbook.includes('개략공사비_요약')&&workbook.includes('층별_결함별'),
          hasFormula:detail.includes('F5*H5'),navy:styles.includes('FF12304B'),bytes:bytes.length,
          parseOkay,subTotal,full,blank};
      });
      report(id,"branded two-sheet XLSX zips and reopens in installed JSZip",
        costWorkbook.count===2&&costWorkbook.priced===1&&costWorkbook.twoSheets&&costWorkbook.hasFormula&&costWorkbook.navy&&costWorkbook.bytes>3000&&costWorkbook.parseOkay&&Math.abs(costWorkbook.subTotal-19.0856)<.001&&Math.abs(costWorkbook.full-24.81128)<.001&&costWorkbook.blank,
        JSON.stringify(costWorkbook));
      await page.evaluate(()=>{
        state=window.__qaSurveyBeforeMerge;delete window.__qaSurveyBeforeMerge;
        selected=null;sm163MergeMode=false;sm163Chosen.clear();
        refreshPages();loadImage(state.pages[state.activePage]?.image||null);refresh();
      });
      await page.locator("#smFieldTab").click();
    }
  }
  if(mod==="tilt"&&width===1280){
    const tiltc=page.locator("#canvas");
    await tiltc.scrollIntoViewIfNeeded();
    const rect=await tiltc.boundingBox();
    await page.locator("#arrowMode").click();
    await tiltc.scrollIntoViewIfNeeded();
    const box=await tiltc.boundingBox();
    await page.mouse.move(box.x+box.width*.3,box.y+box.height*.35);
    await page.mouse.down();
    await page.mouse.move(box.x+box.width*.42,box.y+box.height*.42,{steps:6});
    await page.mouse.up();
    const pointCreated=await page.locator("#items .item").count()>0;
    if((await page.locator("#smTiltValueToggle").innerText()).includes("OFF"))await page.locator("#smTiltValueToggle").click();
    const yellowPixels=()=>page.evaluate(()=>{
      const cv=document.querySelector("#canvas"),ctx=cv.getContext("2d"),image=ctx.getImageData(0,0,cv.width,cv.height).data;
      let n=0;for(let i=0;i<image.length;i+=4)if(image[i]===255&&image[i+1]===219&&image[i+2]===0)n++;return n;
    });
    const noValue=await yellowPixels();
    // Turn labels OFF *before* marking a fresh point as unavailable. This checks
    // the actual user path and avoids selection toggles from double-clicking.
    await page.locator("#smTiltValueToggle").click();
    const beforeMark=(await page.locator("#smTiltValueToggle").innerText()).includes("OFF");
    if(pointCreated)await page.locator("#tiltUnavailable").click();
    const marked=await yellowPixels();
    const enabledAfterMark=(await page.locator("#smTiltValueToggle").innerText()).includes("ON");
    await page.locator("#smTiltValueToggle").click();
    const off=await yellowPixels();
    report(id,"unavailable survey yellow label respects measurement display toggle",
      pointCreated&&noValue===0&&marked>200&&off===0,
      JSON.stringify({pointCreated,noValue,marked,off}));
    report(id,"marking unavailable auto-enables previously OFF measurement labels",
      beforeMark&&enabledAfterMark&&marked>200,
      JSON.stringify({beforeMark,enabledAfterMark,marked}));
    // Building-name panel is painted first; value boxes are painted above it.
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
      await page.waitForFunction(()=>document.querySelector(".sarch-verify-result-142")?.textContent.includes("✓ 백업 구조 확인"));
      const text=await page.locator(".sarch-verify-result-142").innerText();
      report(id,"backup preflight read-only",text.includes("✓ 백업 구조 확인"),text.slice(0,130));
    }else report(id,"backup preflight read-only",false,"No sample export available");
  }
  if(verifyExists){
    const before=await page.evaluate(async()=>await window.SARCHProjectBridge().text());
    await page.locator("#sarchProtectMenu input[type=file]").setInputFiles({name:"invalid.json",mimeType:"application/json",buffer:Buffer.from('{"unrelated":true}')});
    await page.waitForFunction(()=>document.querySelector(".sarch-verify-result-142")?.textContent.includes("확인 실패"));
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
    return {count:info.sites.length,active:info.active};
   });
   const oldNow=await page.evaluate(oldId=>localStorage.getItem("smetric-drawing-site-v40-"+oldId),baseline.active);
   const newNow=await page.evaluate(()=>localStorage.getItem("smetric-drawing-site-v40-"+JSON.parse(localStorage.getItem("smetric-drawing-sites-index-v40")).active));
   report(id,"drawing import creates a separate site",after.count===baseline.count+1&&after.active!==baseline.active&&Boolean(newNow)&&baseline.content===oldNow,JSON.stringify({before:baseline.count,after:after.count,oldSaved:Boolean(oldNow),newSaved:Boolean(newNow)}));
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
