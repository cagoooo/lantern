const CACHE_NAME = 'shimen-riddle-v3.3.0';
const API_CACHE = 'shimen-api-v1';

const STATIC_ASSETS = [
  '/lantern/',
  '/lantern/index.html',
  '/lantern/manifest.json',
  '/lantern/favicon.png',
  '/lantern/icon-192.png',
  '/lantern/icon-512.png',
  // Add common fonts and sounds if they are static
  '/lantern/assets/bgm.mp3',
];

// Cache strategies
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => console.log('[SW] Pre-cache error:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;

  // Don't cache HMR or Vite internal files in development
  if (url.pathname.includes('@vite') || url.pathname.includes('@fs') || url.pathname.includes('vite-hmr') || url.pathname.includes('/src/') || url.pathname.includes('node_modules')) {
    return;
  }

  // Stale-While-Revalidate for JS, CSS, and Images
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.includes('assets/')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchedResponse = fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(err => {
            console.debug('[SW] Fetch failed (expected in dev):', event.request.url);
            return cachedResponse || new Response('Network error', { status: 408 });
          });

          return cachedResponse || fetchedResponse;
        });
      })
    );
    return;
  }

  // Network First for index.html and SPA routes
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/lantern/') || caches.match('/lantern/index.html');
        });
      })
  );
});
