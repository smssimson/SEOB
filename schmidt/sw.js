// SMETRIC offline worker v41 — schmidt
const CACHE='smetric-schmidt-v41';const CORE=['./','./index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('smetric-schmidt-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const req=e.request;const url=new URL(req.url);if(url.protocol!=='https:'&&url.protocol!=='http:')return;
if(req.mode==='navigate'){e.respondWith(fetch(req).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return r}).catch(async()=>await caches.match(req)||await caches.match('./index.html')));return}
e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{})}return r})));
});
