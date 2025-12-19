const CACHE_NAME = 'quantumshield-v1.1';
const urlsToCache = [
  '/',
  '/digital-arrest',
  '/url-checker',
  '/learn',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // Skip non-GET requests (POST, PUT, DELETE, etc.)
  if (method !== 'GET') {
    return;
  }

  // Skip chrome-extension:// and other unsupported schemes
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return;
  }

  // Skip API calls (let them go to network)
  if (url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the new response
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Only cache GET requests with http/https
                if (request.method === 'GET' && 
                    (url.startsWith('http://') || url.startsWith('https://'))) {
                  cache.put(request, responseToCache).catch((err) => {
                    console.log('Cache put failed:', err);
                  });
                }
              });

            return response;
          })
          .catch(() => {
            // Return offline page if available
            return caches.match('/offline').then((offlineResponse) => {
              return offlineResponse || new Response('Offline - Please check your connection');
            });
          });
      })
  );
});