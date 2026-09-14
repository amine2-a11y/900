const CACHE_NAME = 'ps4-goldhen-offline-v6';
const CORE = ["./includes/payloads/GoldHEN/goldhen.bin", "./index.html", "./src/psfree-lapse/alert.mjs", "./src/psfree-lapse/config.mjs", "./src/psfree-lapse/kpatch/900.bin", "./src/psfree-lapse/lapse/ps4/900.mjs", "./src/psfree-lapse/lapse.mjs", "./src/psfree-lapse/module/chain.mjs", "./src/psfree-lapse/module/int64.mjs", "./src/psfree-lapse/module/mem.mjs", "./src/psfree-lapse/module/memtools.mjs", "./src/psfree-lapse/module/offset.mjs", "./src/psfree-lapse/module/rw.mjs", "./src/psfree-lapse/module/utils.mjs", "./src/psfree-lapse/module/view.mjs", "./src/psfree-lapse/psfree.mjs", "./src/psfree-lapse/rop/ps4/900.mjs", "./sw.js", "./theme/pro-void.css", "./theme/youth-bg.svg", "./cache-art.svg"];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        for (const url of CORE) {
          try {
            const response = await fetch(url, {cache:'no-store'});
            if (response.ok) await cache.put(new Request(url), response.clone());
          } catch (_) {}
        }
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const request = event.request;
  event.respondWith((async () => {
    // IMPORTANT for offline module imports: retries may add ?attempt=N to the
    // module URL. Treat that query string as a cache-buster, not as a new asset.
    // The PS4 browser must receive the already-cached base .mjs file offline.
    const url = new URL(request.url);
    const cacheKey = new Request(url.origin + url.pathname, {
      method: 'GET',
      headers: request.headers,
      credentials: request.credentials,
      redirect: request.redirect
    });

    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(cacheKey) || await cache.match(request);
    if (cached) return cached;

    // Network fallback is used only during the one-time online preparation.
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        await cache.put(cacheKey, response.clone());
      }
      return response;
    } catch (_) {
      return cache.match('./index.html');
    }
  })());
});
