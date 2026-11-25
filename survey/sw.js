/* SMETRIC survey offline v60 */
const CACHE='smetric-survey-v234-overview-photos',CORE=["../sarch-ink-v233.js","../sarch-ink-v233.css","../sarch-v214-pokemon-background.webp","../sarch-shinchan-tilt-survey.jpg","../sarch-theme-v214.js?v=225","../sarch-theme-v214.css?v=225","../sarch-v204-shinchan-atlas.webp","../sarch-v204-pokemon-atlas.webp","../sarch-v204-digimon-atlas.webp","../sarch-v204-marvel-atlas.webp","../sarch-v202-shin-scene-0.webp","../sarch-v202-shin-scene-1.webp","../sarch-v202-shin-scene-2.webp","../sarch-v202-shin-scene-3.webp","../sarch-theme-shinchan-0.webp","../sarch-theme-shinchan-1.png","../sarch-theme-shinchan-2.png","../sarch-theme-shinchan-3.webp","../sarch-theme-shinchan-4.png","../sarch-theme-pokemon-0.png","../sarch-theme-pokemon-1.png","../sarch-theme-pokemon-2.png","../sarch-theme-pokemon-3.png","../sarch-theme-pokemon-4.png","../sarch-theme-pokemon-5.png","../sarch-theme-pokemon-6.png","../sarch-theme-pokemon-7.png","../sarch-theme-digimon-0.png","../sarch-theme-digimon-1.png","../sarch-theme-digimon-2.png","../sarch-theme-digimon-3.png","../sarch-theme-marvel-0.jpg","../sarch-theme-marvel-1.jpg","../sarch-theme-marvel-2.jpg","../sarch-theme-marvel-3.jpg","../sarch-global-theme-v206.css","../sarch-global-theme-v217.js?v=225","../sarch-fandom-v198.css","../sarch-brand-v196.css","../sarch-report-mark.svg","../sarch-shell-v145.css?v=147","../sarch-shell-v145.js?v=145","../recovery-v92.js?v=143","../sarch-workspace-v142.css?v=143","../sarch-transfer-v156.js?v=156","../sarch-defect-status-v157.js?v=187","../sarch-repair-xlsx-v172.js?v=189","../sarch-repair-exceljs-v190.js?v=192","./vendor/exceljs.min.js?v=190","../sarch-workspace-v142.js?v=161","../sarch-quick-nav-v139.css?v=140","../sarch-quick-nav-v139.js","../sarch-icon.svg","../sarch-layout-v135.css?v=143", "../sarch-layout-v135.js?v=143", "./", "./index.html", "./estimate-rates-v182.js?v=182", "./cost-data.json", "./jszip.min.js", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./photo_album_template.hwpx"],OPTIONAL=["https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js", "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"];
self.addEventListener('install',e=>e.waitUntil((async()=>{let c=await caches.open(CACHE);await c.addAll(CORE.map(path=>/sarch-(?:theme-v214\.|global-theme-v217\.js)/.test(path)?new Request(new URL(path,self.registration.scope),{cache:"reload"}):path));await Promise.allSettled(OPTIONAL.map(async u=>{let r=await fetch(u,{mode:'no-cors',signal:AbortSignal.timeout(4000)});if(r.ok||r.type==='opaque')await c.put(u,r)}));await self.skipWaiting()})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{let keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('smetric-survey-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})()));

/* v155: Share Target of the separately installed 현장조사 WebAPK.
   Store the received file in origin-local inbox; route to the shared import
   screen. Existing survey sites and photos are never modified here. */
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='POST'||new URL(req.url).pathname!==new URL('share-target',self.registration.scope).pathname)return;
 event.respondWith((async()=>{
  const destination=new URL('../receive.html',self.registration.scope);
  try{
   const form=await req.formData();
   const file=form.getAll('project').find(x=>x&&typeof x.name==='string'&&typeof x.size==='number');
   if(!file||!file.size||file.size>300*1024*1024)throw Error('공유 파일이 없거나 허용 크기를 초과했습니다');
   const id=typeof crypto.randomUUID==='function'?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
   const inbox=await caches.open('sarch-share-inbox-v1');
   await inbox.put(new URL('../inbox/'+id,self.registration.scope),new Response(file,{headers:{
    'Content-Type':'application/octet-stream','X-SARCH-Filename':encodeURIComponent(String(file.name||'받은현장.json').slice(0,160))
   }}));
   destination.searchParams.set('id',id);
  }catch(err){
   console.warn('S:ARCH survey share-target:',err);
   destination.searchParams.set('error',String(err?.message||'share-failed'));
  }
  return Response.redirect(destination.href,303);
 })());
});

self.addEventListener('fetch',e=>{let req=e.request;if(req.method!=='GET')return;let u=new URL(req.url);if(u.origin!==self.location.origin&&!OPTIONAL.includes(u.href))return;if(u.pathname.endsWith('/version.json')){e.respondWith(fetch(req,{cache:'no-store'}));return;}
 if(u.pathname.endsWith('/cost-data.json')){e.respondWith((async()=>{const cache=await caches.open(CACHE),key=new URL('./cost-data.json',self.registration.scope);try{const r=await fetch(req,{cache:'no-store'});if(r.ok){e.waitUntil(cache.put(key,r.clone()));return r}}catch(err){}return await cache.match(key)||Response.error()})());return;}
 e.respondWith((async()=>{let c=await caches.open(CACHE);if(req.mode==='navigate'){try{let r=await fetch(req);if(r.ok){e.waitUntil(c.put(req,r.clone()));return r}}catch(err){}return await c.match(req,{ignoreSearch:true})||await c.match('./index.html')}let hit=await c.match(req,{ignoreSearch:!u.pathname.includes('/sarch-theme-v214.')});if(hit)return hit;try{let r=await fetch(req);if(r.ok||r.type==='opaque')e.waitUntil(c.put(req,r.clone()));return r}catch(err){return Response.error()}})());
});
