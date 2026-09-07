const CACHE_NAME = 'harvest-moon-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css?v=1',
  './src/main.js?v=1',
  './src/app.js',
  './src/data-loader.js',
  './src/utils/images.js',
  './src/modal/modal-calendar.js',
  './src/modal/modal-npc.js',
  './src/render/render-animals.js',
  './src/render/render-calendar.js',
  './src/render/render-cooking.js',
  './src/render/render-crops.js',
  './src/render/render-fishing.js',
  './src/render/render-locations.js',
  './src/render/render-mining.js',
  './src/render/render-npcs.js',
  './src/render/render-phone.js',
  './src/render/render-request.js',
  './src/render/render-routes.js',
  './data/main.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll())
      .then((clients) =>
        clients.forEach((client) =>
          client.postMessage({ type: 'offline-ready' }),
        ),
      ),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (
    request.method !== 'GET' ||
    new URL(request.url).origin !== self.location.origin
  )
    return;

  const isData = request.url.includes('/data/');
  const isImage = request.destination === 'image';
  if (isData || isImage) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('./index.html')));
  }
});
