const CACHE_NAME = 'quantumshield-v1.1';
const urlsToCache = [
  '/',
  '/scanner',
  '/aianalyzer',
  '/evidence',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 1. INSTALL - Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return response;
      });
    })
  );
});

// 4. PUSH - High-Priority Heads-up Notifications for Scam Alerts
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: '🚨 SCAM ALERT', body: 'Suspicious activity detected!' };
  
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 200, 110, 200], // Urgent SOS vibration pattern
    tag: 'scam-alert',
    renotify: true,
    requireInteraction: true, // IMPORTANT: Alert stays on screen until dismissed
    priority: 2, // Forces "Heads-up" behavior on Android
    data: { url: data.url || '/evidence' },
    actions: [
      { action: 'open_vault', title: '🛡️ Record Evidence' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. NOTIFICATION CLICK - Handle user interaction
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url;

  if (event.action !== 'close') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      })
    );
  }
});