const CACHE = 'piano-pad-v8';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const store = (req, res) => { if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const sameOrigin = new URL(e.request.url).origin === location.origin;
  if (sameOrigin) {
    // app files: network first so updates arrive, cache as offline fallback
    e.respondWith(fetch(e.request).then(res => store(e.request, res)).catch(() => caches.match(e.request)));
  } else {
    // Tone.js and instrument samples: cache first (large, never change)
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => store(e.request, res))));
  }
});
