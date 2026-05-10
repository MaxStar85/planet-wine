const CACHE_NAME = "planetwine-v1";
const BASE = "/planet-wine";

const FILES_TO_CACHE = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/bivio.html`,
  `${BASE}/italia.html`,
  `${BASE}/mondo.html`,
  `${BASE}/lista.html`,
  `${BASE}/carrello.html`,
  `${BASE}/proposta.html`,
  `${BASE}/static/css/style.css`,
  `${BASE}/static/js/main.js`,
  `${BASE}/static/js/data_engine.js`,
  `${BASE}/static/libs/html2canvas.min.js`,
  `${BASE}/static/libs/jspdf.umd.min.js`,
  `${BASE}/static/fonts/Inter_18pt-Light.ttf`,
  `${BASE}/static/fonts/Inter_18pt-Medium.ttf`,
  `${BASE}/static/fonts/Inter_18pt-Regular.ttf`,
  `${BASE}/static/fonts/PlayfairDisplay-Bold.ttf`,
  `${BASE}/static/fonts/PlayfairDisplay-Regular.ttf`,
  `${BASE}/static/fonts/PlayfairDisplay-SemiBold.ttf`,
  `${BASE}/static/img/PlanetWine.png`,
  `${BASE}/static/img/anfora.png`,
  `${BASE}/static/img/bianco.png`,
  `${BASE}/static/img/bio.png`,
  `${BASE}/static/img/btn_acquarello.png`,
  `${BASE}/static/img/champagne.png`,
  `${BASE}/static/img/dolce.png`,
  `${BASE}/static/img/italia.png`,
  `${BASE}/static/img/mondo_atlante.png`,
  `${BASE}/static/img/rosato.png`,
  `${BASE}/static/img/rosso.png`,
  `${BASE}/static/img/spumante.png`,
  `${BASE}/static/img/triplea.png`,
  `${BASE}/static/img/bandiere/Abruzzo.png`,
  `${BASE}/static/img/bandiere/AltoAdige.png`,
  `${BASE}/static/img/bandiere/Austria.png`,
  `${BASE}/static/img/bandiere/Basilicata.png`,
  `${BASE}/static/img/bandiere/Calabria.png`,
  `${BASE}/static/img/bandiere/Campania.png`,
  `${BASE}/static/img/bandiere/EmiliaRomagna.png`,
  `${BASE}/static/img/bandiere/Francia.png`,
  `${BASE}/static/img/bandiere/FriuliVeneziaGiulia.png`,
  `${BASE}/static/img/bandiere/Germania.png`,
  `${BASE}/static/img/bandiere/Lazio.png`,
  `${BASE}/static/img/bandiere/Libano.png`,
  `${BASE}/static/img/bandiere/Liguria.png`,
  `${BASE}/static/img/bandiere/Lombardia.png`,
  `${BASE}/static/img/bandiere/Marche.png`,
  `${BASE}/static/img/bandiere/Molise.png`,
  `${BASE}/static/img/bandiere/Piemonte.png`,
  `${BASE}/static/img/bandiere/Portogallo.png`,
  `${BASE}/static/img/bandiere/Puglia.png`,
  `${BASE}/static/img/bandiere/Sardegna.png`,
  `${BASE}/static/img/bandiere/Sicilia.png`,
  `${BASE}/static/img/bandiere/Spagna.png`,
  `${BASE}/static/img/bandiere/Toscana.png`,
  `${BASE}/static/img/bandiere/Trentino.png`,
  `${BASE}/static/img/bandiere/Umbria.png`,
  `${BASE}/static/img/bandiere/ValleDAosta.png`,
  `${BASE}/static/img/bandiere/Veneto.png`,
  `${BASE}/data/json/AltoAdige.json`,
  `${BASE}/data/json/Analcolici.json`,
  `${BASE}/data/json/Basilicata.json`,
  `${BASE}/data/json/Campania.json`,
  `${BASE}/data/json/Champagne.json`,
  `${BASE}/data/json/EmiliaRomagna.json`,
  `${BASE}/data/json/FriuliVeneziaGiulia.json`,
  `${BASE}/data/json/Liguria.json`,
  `${BASE}/data/json/Lombardia.json`,
  `${BASE}/data/json/Piemonte.json`,
  `${BASE}/data/json/Puglia.json`,
  `${BASE}/data/json/RestoDelMondo.json`,
  `${BASE}/data/json/Sardegna.json`,
  `${BASE}/data/json/Sicilia.json`,
  `${BASE}/data/json/Toscana.json`,
  `${BASE}/data/json/Trentino.json`,
  `${BASE}/data/json/Umbria.json`,
  `${BASE}/data/json/ValleDAosta.json`,
  `${BASE}/data/json/Veneto.json`
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      try {
        await cache.addAll(FILES_TO_CACHE);
        console.log("✓ Precache completato");
      } catch (e) {
        console.warn("⚠ Alcuni file non trovati durante precache:", e);
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) return;

  // Cache First — risorse statiche
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "image"
  ) {
    event.respondWith(
      caches.match(request).then(cached =>
        cached || fetch(request).then(response => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
          }
          return response;
        }).catch(() => {
          if (request.destination === "image") {
            return caches.match(`${BASE}/static/img/PlanetWine.png`);
          }
        })
      )
    );
    return;
  }

  // Network First — HTML e JSON
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then(cached => {
          if (cached) return cached;
          if (request.destination === "document") {
            return caches.match(`${BASE}/index.html`);
          }
        })
      )
  );
});