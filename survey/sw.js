const CACHE='field-inspection-v28';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.add('./index.html')));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('field-inspection-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;event.respondWith(fetch(r).then(resp=>{if(resp.ok&&r.mode==='navigate'){const copy=resp.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy))}return resp}).catch(()=>caches.match(r).then(cached=>cached||caches.match('./index.html'))))});
