const CACHE='sabashift-v2';
const ASSETS=['./','./index.html','./manifest.json','./newicon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(ASSETS.map(a=>c.add(a)))));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

// Network-first: always try to fetch the freshest version, fall back to cache when offline.
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  e.respondWith(
    fetch(req).then(res=>{
      if(res&&res.status===200&&req.url.startsWith('http')){
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(req,copy).catch(()=>{}));
      }
      return res;
    }).catch(()=>caches.match(req).then(cached=>cached||caches.match('./index.html')))
  );
});
