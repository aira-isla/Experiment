const CACHE_NAME = 'harvest-moon-v1';
const STATIC_ASSETS = [
  './', './index.html', './style.css?v=1', './src/main.js?v=1', './src/app.js',
  './src/data-loader.js', './src/utils/images.js', './src/modal/modal-calendar.js',
  './src/modal/modal-npc.js', './src/render/render-animals.js',
  './src/render/render-calendar.js', './src/render/render-cooking.js',
  './src/render/render-crops.js', './src/render/render-fishing.js',
  './src/render/render-locations.js', './src/render/render-mining.js',
  './src/render/render-npcs.js', './src/render/render-phone.js',
  './src/render/render-request.js', './src/render/render-routes.js',
  './data/main.json',
  './asset/animal/Chicken.avif', './asset/animal/Cow.avif', './asset/animal/Dog.avif', './asset/animal/Horse.avif',
  './asset/map/Map.avif', './asset/npc/Map.avif', './asset/npc/Alice.avif', './asset/npc/Aurelia.avif',
  './asset/npc/Bob.avif', './asset/npc/Charles.avif', './asset/npc/Chester.avif', './asset/npc/Dia.avif',
  './asset/npc/Flak.avif', './asset/npc/Gina.avif', './asset/npc/Gwen.avif', './asset/npc/Harvest Goddess.avif',
  './asset/npc/Harvest_Moon_Hero_of_Leaf_Valley_Characters.avif', './asset/npc/Joe.avif', './asset/npc/Katie.avif',
  './asset/npc/Kurt.avif', './asset/npc/Louis.avif', './asset/npc/Lyla.avif', './asset/npc/Marina.avif',
  './asset/npc/Martha.avif', './asset/npc/Nac.avif', './asset/npc/Nic.avif', './asset/npc/Parsley.avif',
  './asset/npc/Ponta.avif', './asset/npc/Renton.avif', './asset/npc/Ronald.avif', './asset/npc/Rudolph.avif',
  './asset/npc/Tim.avif', './asset/npc/Wallace.avif', './asset/npc/Woody.avif', './asset/npc/Zann.avif',
  './asset/crop/Alfalfa.avif', './asset/crop/Apple.avif', './asset/crop/Blueberries.avif', './asset/crop/Blueberry.avif',
  './asset/crop/Breadfruit.avif', './asset/crop/Carrot.avif', './asset/crop/Chestnut.avif', './asset/crop/Corn.avif',
  './asset/crop/Cranberry.avif', './asset/crop/Fairy Dress.avif', './asset/crop/Frost Pansy.avif',
  './asset/crop/Fullmoonberry.avif', './asset/crop/Full Moon Berry.avif', './asset/crop/Gold Potato.avif',
  './asset/crop/Grape.avif', './asset/crop/GreenHerb.avif', './asset/crop/Mistbloom.avif', './asset/crop/Onion.avif',
  './asset/crop/Orange.avif', './asset/crop/Potato.avif', './asset/crop/Pumpkin.avif', './asset/crop/Redherb.avif',
  './asset/crop/Red Pumpkin.avif', './asset/crop/Rice.avif', './asset/crop/Silver Bell.avif', './asset/crop/Spinach.avif',
  './asset/crop/Stardust.avif', './asset/crop/Strawberry.avif', './asset/crop/Tomato.avif', './asset/crop/Very Berry.avif',
  './asset/crop/Walnut.avif', './asset/crop/Watermelon.avif', './asset/crop/Wild Mint.avif'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )).then(() => self.clients.claim())
      .then(() => self.clients.matchAll())
      .then((clients) => clients.forEach((client) => client.postMessage({ type: 'offline-ready' }))),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  const isData = request.url.includes('/data/');
  const isImage = request.destination === 'image';
  if (isData || isImage) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    })));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('./index.html')));
  }
});
