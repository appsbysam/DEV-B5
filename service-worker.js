const CACHE_NAME='b5-shell-v097';
const APP_ROOT='/DEV-B5/';
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll([APP_ROOT,APP_ROOT+'manifest-v097.webmanifest',APP_ROOT+'assets/icons/pwa-icon-192-v095.png',APP_ROOT+'assets/icons/pwa-icon-512-v095.png'])));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys()){if(key!==CACHE_NAME&&key.startsWith('b5-shell-'))await caches.delete(key);}await self.clients.claim();})());});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));});
