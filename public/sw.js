const CACHE_NAME = 'quantumshield-v2.0';

// All routes cached for offline use
const STATIC_URLS = [
  '/',
  '/scanner',
  '/aianalyzer',
  '/evidence',
  '/emergency',
  '/education',
  '/awareness',
  '/news',
  '/tuneup',
  '/upi-guard',
  '/legal-aid',
  '/simprotection',
  '/privacy',
  '/system-guardian',
  '/device',
  '/encryption',
  '/devicescan',
  '/scamdb',
  '/threats',
  '/reporter',
  '/whatsapp',
  '/aboutai',
  '/disclaimer',
  '/terms',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// 1. INSTALL — cache all shell routes
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_URLS))
      .then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE — purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// 3. FETCH — cache-first for assets, network-first for pages/API
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  // Always network-first for API calls
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('/'));
    })
  );
});

// 4. PUSH — scam alert notification
self.addEventListener('push', (event) => {
  const data = event.data
    ? event.data.json()
    : { title: '🚨 SCAM ALERT', body: 'Suspicious activity detected near you!' };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [500, 110, 500, 110, 450, 110, 200],
      tag: 'scam-alert',
      renotify: true,
      requireInteraction: true,
      data: { url: data.url || '/aianalyzer' },
      actions: [
        { action: 'open', title: '🛡️ Open QuantumShield' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

// 5. NOTIFICATION CLICK
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((list) => {
      for (const client of list) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
