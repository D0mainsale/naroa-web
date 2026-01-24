const CACHE_NAME = 'naroa-pwa-SHADOW_KILLER';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/ritual.css',
  '/js/router.js',
  '/js/app.js',
  '/js/anim-system.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activation
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Control clients immediately
  );
});

self.addEventListener('fetch', (event) => {
  // Network first for HTML/Data, Cache first for assets
  const url = new URL(event.request.url);
  
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
     event.respondWith(
       fetch(event.request)
         .catch(() => caches.match(event.request))
     );
  } else {
     event.respondWith(
       caches.match(event.request)
         .then((response) => response || fetch(event.request))
     );
  }
});
