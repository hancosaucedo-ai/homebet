// ====================================================================
// HomeVet - Service Worker PWA (sw.js)
// Soporte offline, caché de recursos estáticos y aceleración móvil
// Timestamp de compilación: 2026-10-21T22:45:00Z
// ====================================================================

const BUILD_TIMESTAMP = '2026-10-21T22:45:00Z';
const CACHE_NAME = `homevet-cache-v1.2.0-${BUILD_TIMESTAMP}`;

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './styles.css',
  './app.js',
  './admin.js',
  './db.js',
  './manifest.json',
  './assets/logo.png',
  './assets/hero_pets.jpg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cacheando archivos estáticos para modo offline...');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Service Worker] Error parcial al cachear archivos iniciales:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name.startsWith('homevet-cache-')) {
            console.log('[Service Worker] Eliminando caché obsoleta:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de respuesta: Network First para HTML/JS con fallback a Caché (ideal para GitHub Pages)
self.addEventListener('fetch', (event) => {
  // Ignorar solicitudes que no sean GET o esquemas no soportados (ej. chrome-extension)
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Ignorar llamadas directas a wa.me o externas
  if (event.request.url.includes('wa.me') || event.request.url.includes('google.com/maps')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la respuesta es válida, clonar y actualizar en la caché
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // En caso de estar sin internet o en modo avión (offline)
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si es una navegación a página, retornar index.html en caché
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('./index.html');
          if (fallback) return fallback;
        }

        return new Response('Sin conexión a internet. La aplicación HomeVet está disponible en modo offline con datos previamente sincronizados.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      })
  );
});
