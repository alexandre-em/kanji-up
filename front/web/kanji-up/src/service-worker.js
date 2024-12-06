const CACHE_NAME = 'v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // local
  // 'http://localhost:3001/remoteEntry.js',
  // 'http://localhost:3005/remoteEntry.js',
  // 'http://localhost:3009/remoteEntry.js',
  // prod
  'https://home-kanjiup.netlify.app/remoteEntry.js',
  'https://kanji-app-kanjiup.netlify.app/remoteEntry.js',
  'https://search-kanjiup.netlify.app/remoteEntry.js',
];

// Event to install the  Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Event to get ressources
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Returns cached ressources if exists, otherwise it will search on the network
      return (
        response ||
        fetch(event.request).then((res) => {
          if (event.request.url.includes('remoteEntry.js')) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, res.clone());
            });
          }
        })
      );
    })
  );
});

// Event to update the cache
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
