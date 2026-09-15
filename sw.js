const CACHE_NAME = 'absensi-shell-v2';
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

// Cache-first for the app shell itself; network-first (fall back to cache)
// for everything else so Supabase calls always try the network first.
self.addEventListener('fetch', (event) => {
  const isShell = APP_SHELL.some((path) => event.request.url.endsWith(path.replace('./', '')));
  if (isShell) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
