/* Brainwave Quest service worker.
 * Precaches the app shell and the offline question bundle.
 * The game is a client of this worker; API and WebSocket traffic is never cached. */

const VERSION = "v1";
const SHELL_CACHE = `brainwave-shell-${VERSION}`;
const RUNTIME_CACHE = `brainwave-runtime-${VERSION}`;
const BUNDLE_CACHE = `brainwave-bundle-${VERSION}`;

const SHELL_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/maskable-192.png",
  "/maskable-512.png",
];

const BUNDLE_URL = "/offline-questions.json";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS).catch(() => undefined))
      .then(() => caches.open(BUNDLE_CACHE).then((cache) => cache.add(BUNDLE_URL)).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("brainwave-") && ![SHELL_CACHE, RUNTIME_CACHE, BUNDLE_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function cacheFirst(request, cacheName) {
  return caches.open(cacheName).then(async (cache) => {
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && (response.type === "basic" || response.type === "cors")) {
      cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API and realtime traffic must always hit the network.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/matchmake") || url.pathname === "/healthz") return;

  // Navigations: network first, cached shell as fallback (works offline).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put("/index.html", copy)).catch(() => undefined);
          return response;
        })
        .catch(() => caches.match("/index.html").then((r) => r ?? Response.error())),
    );
    return;
  }

  // The offline question bundle: cache first.
  if (url.pathname === "/offline-questions.json") {
    event.respondWith(cacheFirst(request, BUNDLE_CACHE));
    return;
  }

  // Built assets and icons: cache first.
  if (url.pathname.startsWith("/assets/") || /\.(?:png|webmanifest|svg|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }
});
