/* SMETRIC offline v60: root cache covers home and all four modules. */
const CACHE='smetric-offline-v98';
const CORE=["./", "./index.html", "./manifest.webmanifest", "./smetric-icon-180.png", "./smetric-icon-192.png", "./smetric-icon-512.png", "./survey/", "./survey/index.html", "./survey/jszip.min.js", "./survey/manifest.webmanifest", "./survey/icon-180.png", "./survey/icon-192.png", "./survey/icon-512.png", "./survey/photo_album_template.hwpx", "./drawing/", "./drawing/index.html", "./schmidt/", "./schmidt/index.html", "./tilt/", "./tilt/index.html"];
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
