/* SMETRIC offline v60: root cache covers home and all four modules. */
const CACHE='smetric-offline-v165';
const CORE=["./sarch-shell-v145.css?v=147","./sarch-shell-v145.js?v=145","./sarch-drawing-tools-v144.css?v=149","./sarch-drawing-tools-v144.js?v=149","./recovery-v92.js?v=143","./sarch-workspace-v142.css?v=143","./sarch-transfer-v156.js?v=156","./sarch-defect-status-v157.js?v=165","./sarch-workspace-v142.js?v=161","./sarch-splash-v141.css","./sarch-splash-v141.js","./sarch-home-v139.css","./sarch-home-v139.js","./sarch-quick-nav-v139.css","./sarch-quick-nav-v139.js","./sarch-layout-v135.css?v=143","./sarch-layout-v135.js?v=143","./", "./index.html", "./receive.html", "./manifest.webmanifest", "./sarch-theme.css", "./sarch-unified-v121.css", "./sarch-icon.svg", "./smetric-icon-180.png", "./smetric-icon-192.png", "./smetric-icon-512.png", "./survey/", "./survey/index.html", "./survey/jszip.min.js", "./survey/manifest.webmanifest", "./survey/icon-180.png", "./survey/icon-192.png", "./survey/icon-512.png", "./survey/photo_album_template.hwpx", "./drawing/", "./drawing/index.html", "./schmidt/", "./schmidt/index.html", "./tilt/", "./tilt/index.html"];
const OPTIONAL=["https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js", "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const c=await caches.open(CACHE);
 await c.addAll(CORE);
 // PDF.js is optional: a CDN failure must not prevent offline installation.
 await Promise.allSettled(OPTIONAL.map(async u=>{let r=await fetch(u,{mode:'no-cors',cache:'reload',signal:AbortSignal.timeout(4000)});if(r.ok||r.type==='opaque')await c.put(u,r)}));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('smetric-offline-')&&k!==CACHE).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));

/* S:ARCH v152 Android Web Share Target.
   Incoming files are stored ONLY inside the origin's Cache Storage inbox.
   No upload, and no changes to any module data before user approval. */
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='POST'||new URL(req.url).pathname!==new URL('share-target',self.registration.scope).pathname)return;
 event.respondWith((async()=>{
  const destination=new URL('receive.html',self.registration.scope);
  try{
   const form=await req.formData();
   const file=form.getAll('project').find(x=>x&&typeof x.name==='string'&&typeof x.size==='number');
   if(!file)throw Error('file-missing');
   if(!file.size||file.size>300*1024*1024)throw Error('file-size');
   const id=typeof crypto.randomUUID==='function'?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
   const cache=await caches.open('sarch-share-inbox-v1');
   const target=new URL('inbox/'+id,self.registration.scope);
   const filename=String(file.name||'received.json').slice(0,160);
   await cache.put(target.href,new Response(file,{headers:{
    'Content-Type':'application/octet-stream',
    'X-SARCH-Filename':encodeURIComponent(filename)
   }}));
   const keys=await cache.keys();
   if(keys.length>8)await Promise.all(keys.slice(0,keys.length-8).map(key=>cache.delete(key)));
   destination.searchParams.set('id',id);
  }catch(err){
   console.warn('S:ARCH share inbox:',err);
   destination.searchParams.set('error',err&&err.message||'share-receive-failed');
  }
  return Response.redirect(destination.href,303);
 })());
});

self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(!['http:','https:'].includes(url.protocol))return;
 if(url.origin!==self.location.origin&&!OPTIONAL.includes(url.href))return;if(url.pathname.endsWith('/version.json')){event.respondWith(fetch(req,{cache:'no-store'}));return;}
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(req.mode==='navigate'){
   try{const net=await fetch(req);if(net.ok){event.waitUntil(cache.put(req,net.clone()));return net}}catch(e){}
   return await cache.match(req,{ignoreSearch:true})||await cache.match(url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname,{ignoreSearch:true})||await cache.match('./index.html');
  }
  const hit=await cache.match(req,{ignoreSearch:true});if(hit)return hit;
  try{const net=await fetch(req);if(net.ok||net.type==='opaque')event.waitUntil(cache.put(req,net.clone()));return net}catch(e){return Response.error()}
 })());
});

// SMETRIC v66: respond only after essential offline assets are cached.
self.addEventListener('message',event=>{
 if(!event.data||event.data.type!=='SMETRIC_OFFLINE_STATUS')return;
 const port=event.ports&&event.ports[0];if(!port)return;
 event.waitUntil((async()=>{
  try{const cache=await caches.open(CACHE);const checks=await Promise.all(CORE.map(u=>cache.match(new URL(u,self.registration.scope).href)));
   port.postMessage({version:'v79',ready:checks.every(Boolean),count:checks.filter(Boolean).length,total:CORE.length});
  }catch(e){port.postMessage({version:'v79',ready:false});}
 })());
});
