/**
 * NAROA PORTFOLIO SERVICE WORKER v3.0
 * ULTRA-MINIMAL - Cache busted for fast deploy
 */

const CACHE_VERSION = 'v3.0.0-ultrafast';
const STATIC_CACHE = `naroa-static-${CACHE_VERSION}`;
const IMAGES_CACHE = `naroa-images-${CACHE_VERSION}`;
const DATA_CACHE = `naroa-data-${CACHE_VERSION}`;

// Critical assets to precache
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/ritual.css',
    '/css/portfolio-premium.css',
    '/js/app.js',
    '/js/router.js',
    '/js/features/unified-obra.js',
    '/data/images-index.json',
    '/data/album-names.json',
    '/manifest.json'
];

// Install: Precache critical assets
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .then(() => console.log('📦 Precache complete'))
    );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheName.includes(CACHE_VERSION)) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Smart caching strategies
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Strategy: Network first for HTML (always fresh)
    if (url.pathname.endsWith('.html') || url.pathname === '/') {
        event.respondWith(networkFirst(event.request, STATIC_CACHE));
        return;
    }
    
    // Strategy: Cache first for images (fast load)
    if (isImageRequest(url)) {
        event.respondWith(cacheFirst(event.request, IMAGES_CACHE));
        return;
    }
    
    // Strategy: Stale-while-revalidate for JSON data
    if (url.pathname.endsWith('.json')) {
        event.respondWith(staleWhileRevalidate(event.request, DATA_CACHE));
        return;
    }
    
    // Strategy: Cache first for static assets
    if (isStaticAsset(url)) {
        event.respondWith(cacheFirst(event.request, STATIC_CACHE));
        return;
    }
    
    // Default: Network with cache fallback
    event.respondWith(networkFirst(event.request, STATIC_CACHE));
});

// === CACHING STRATEGIES ===

async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return new Response('Offline', { status: 503 });
    }
}

async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        return cached || new Response('Offline', { status: 503 });
    }
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    // Revalidate in background
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    });
    
    // Return cached immediately if available, otherwise wait for network
    return cached || fetchPromise;
}

// === HELPERS ===

function isImageRequest(url) {
    return /\.(jpg|jpeg|png|webp|gif|svg|ico)$/i.test(url.pathname) ||
           url.pathname.includes('/images/');
}

function isStaticAsset(url) {
    return /\.(js|css|woff2?|ttf|eot)$/i.test(url.pathname);
}
