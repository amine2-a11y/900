const CACHE = 'psfree-lapse-900-offline-v1';
const ROOT = './';
const ASSETS = [
  './', './index.html', './theme/pro-void.css',
  './src/psfree-lapse/config.mjs', './src/psfree-lapse/alert.mjs',
  './src/psfree-lapse/psfree.mjs', './src/psfree-lapse/lapse.mjs',
  './src/psfree-lapse/module/offset.mjs', './src/psfree-lapse/module/chain.mjs',
  './src/psfree-lapse/module/int64.mjs', './src/psfree-lapse/module/memtools.mjs',
  './src/psfree-lapse/module/mem.mjs', './src/psfree-lapse/module/view.mjs',
  './src/psfree-lapse/module/rw.mjs', './src/psfree-lapse/module/utils.mjs',
  './src/psfree-lapse/kpatch/900.bin', './src/psfree-lapse/lapse/ps4/900.mjs',
  './src/psfree-lapse/rop/ps4/900.mjs', './includes/payloads/GoldHEN/goldhen.bin'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
});
