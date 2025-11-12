const CACHE_NAME = 'e-zero-v2.0';
const STATIC_CACHE = 'e-zero-static-v2.0';
const DYNAMIC_CACHE = 'e-zero-dynamic-v2.0';
const API_CACHE = 'e-zero-api-v2.0';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/css/styles.css',
  '/css/tailwind.css',
  '/js/app.js',
  '/js/map.js',
  '/js/booking.js',
  '/js/rewards.js',
  '/js/charts.js',
  '/js/i18n.js',
  '/js/theme.js',
  '/js/admin.js',
  '/assets/logo.svg',
  '/manifest.json',
  '/i18n.json',
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.Default.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11.7.12/dist/sweetalert2.min.css'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/data/centers.json',
  '/data/users.json',
  '/data/bookings.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/') || API_ENDPOINTS.some(endpoint => url.pathname.endsWith(endpoint))) {
    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        return fetch(request)
          .then(response => {
            // Cache successful responses
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Return cached version if available
            return cache.match(request).then(cachedResponse => {
              return cachedResponse || new Response(
                JSON.stringify({ error: 'Offline - data not available' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
              );
            });
          });
      })
    );
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname) || STATIC_ASSETS.includes(request.url)) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        return cachedResponse || fetch(request);
      })
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.open(DYNAMIC_CACHE).then(cache => {
        return fetch(request).then(response => {
          // Cache successful GET requests
          if (request.method === 'GET' && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => {
          // Return offline fallback for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/').then(cachedResponse => {
              return cachedResponse || new Response(
                '<h1>Offline</h1><p>You are currently offline. Please check your internet connection.</p>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            });
          }
        });
      });
    })
  );
});

// Background sync for offline bookings
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-bookings') {
    event.waitUntil(syncPendingBookings());
  }
});

// Push notifications
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/assets/logo.svg',
      badge: '/assets/logo.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/#dashboard')
  );
});

// Helper function to sync pending bookings
async function syncPendingBookings() {
  try {
    // Get pending bookings from IndexedDB or localStorage
    const pendingBookings = await getPendingBookings();

    for (const booking of pendingBookings) {
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(booking)
        });

        if (response.ok) {
          // Remove from pending bookings
          await removePendingBooking(booking.id);
          console.log('[SW] Synced booking:', booking.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync booking:', booking.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingBookings() {
  // Implement IndexedDB logic here
  return [];
}

async function removePendingBooking(id) {
  // Implement IndexedDB logic here
}

// Cache tile images for offline map viewing
const TILE_CACHE = 'e-zero-tiles-v1.0';
const MAX_TILE_CACHE_SIZE = 50; // Maximum number of tiles to cache

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Cache map tiles
  if (url.includes('tile.openstreetmap.org') || url.includes('tile.mapbox.com')) {
    event.respondWith(
      caches.open(TILE_CACHE).then(async cache => {
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const response = await fetch(event.request);
          if (response.ok) {
            // Check cache size and clean up if necessary
            await maintainTileCacheSize(cache);
            cache.put(event.request, response.clone());
          }
          return response;
        } catch (error) {
          // Return a placeholder tile if offline
          return new Response(
            createPlaceholderTile(),
            { headers: { 'Content-Type': 'image/png' } }
          );
        }
      })
    );
  }
});

async function maintainTileCacheSize(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_TILE_CACHE_SIZE) {
    // Remove oldest tiles (simple FIFO)
    const keysToDelete = keys.slice(0, keys.length - MAX_TILE_CACHE_SIZE);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

function createPlaceholderTile() {
  // Create a simple 256x256 placeholder tile
  const canvas = new OffscreenCanvas(256, 256);
  const ctx = canvas.getContext('2d');

  // Fill with light gray
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 256, 256);

  // Add a subtle pattern
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  for (let i = 0; i < 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }

  return canvas.convertToBlob();
}