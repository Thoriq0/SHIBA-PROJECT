const CACHE_NAME = 'shiba-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/earthquakeMonthly.html',
  '/newsList.html',
  '/listHighm.html',
  '/article.html',
  '/style.css',
  '/bundle.js',
  '/public/images/a1.jpg',
  '/public/images/a2.jpg',
  '/public/images/about.jpg',
  '/public/images/darat.jpg',
  '/public/images/footerShiba.png',
  '/public/images/laut.jpg',
  '/public/images/p1.png',
  '/public/images/p0.png',
  '/public/images/p2.png',
  '/public/images/p3.png',
  '/public/images/p6.png',
  '/public/images/shiba.png',
  '/public/images/icon/icon-72x72.png',
  '/public/images/icon/icon-96x96.png',
  '/public/images/icon/icon-128x128.png',
  '/public/images/icon/icon-144x144.png',
  '/public/images/icon/icon-152x152.png',
  '/public/images/icon/icon-192x192.png',
  '/public/images/icon/icon-384x384.png',
  '/public/images/icon/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
