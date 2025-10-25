const CACHE_NAME = 'logidash-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/utils/helpers.ts',
  '/hooks/useLogisticsState.ts',
  '/components/Header.tsx',
  '/components/Dashboard.tsx',
  '/components/LoadManagement.tsx',
  '/components/FleetManagement.tsx',
  '/components/TripManagement.tsx',
  '/components/TransactionManagement.tsx',
  '/components/Reporting.tsx',
  '/components/Modal.tsx',
  '/StatCard.tsx',
  '/components/TripDetailModal.tsx',
  '/components/PageHeader.tsx',
  '/components/FileInput.tsx',
  '/components/TransactionForm.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching initial assets');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const fetchResponse = await fetch(event.request);
        if (fetchResponse.status === 200 || fetchResponse.type === 'opaque') {
          await cache.put(event.request, fetchResponse.clone());
        }
        return fetchResponse;
      } catch (e) {
        console.error('Fetch failed; returning offline fallback or error', e);
        throw e;
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
