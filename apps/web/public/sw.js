// Lightweight Service Worker for Jevallene PhotoStudio PWA installability
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Pass-through network requests; keeps online behavior always fresh
});
