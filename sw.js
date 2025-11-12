const CACHE_NAME = 'e-zero-v1';
const urlsToCache = [
  '/',
  '/css/styles.css',
  '/css/tailwind.css',
  '/js/app.js',
  '/js/map.js',
  '/js/booking.js',
  '/js/rewards.js',
  '/js/charts.js',
  '/data/centers.json',
  '/assets/logo.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});