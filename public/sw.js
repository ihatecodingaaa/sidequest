/*
 * SIDEQUEST service worker.
 *
 * Deliberately small. The product state lives in localStorage and all content
 * is bundled, so the only job here is keeping the app shell available when the
 * network is not. There is no background sync, no offline data layer and no
 * cache of anything user-entered.
 */

const VERSION = "sidequest-v1";
const SHELL = ["/", "/missions", "/safe", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      // One bad URL should never block installation, so each is added alone.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: try the network, fall back to whatever we have.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || (await caches.match("/offline")) || Response.error();
        }),
    );
    return;
  }

  // Build output and icons are immutable, so cache first is safe and fast.
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest";

  if (!isStatic) return;

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return response;
        }),
    ),
  );
});
