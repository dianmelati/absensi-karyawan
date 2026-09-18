const CACHE_NAME = 'absensi-shell-v4';
const APP_SHELL = [ './index.html' ];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first everywhere: always try to fetch the latest version first
// (so deploys show up immediately without needing to bump CACHE_NAME), and
// only fall back to the cached copy when the network is unavailable
// (offline support). The fetched response is also written back to cache so
// the offline fallback stays reasonably fresh.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Cache API only supports GET requests — attempting to cache a
        // POST/PATCH/DELETE (e.g. every Supabase write) throws.
        if (event.request.method === 'GET') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
