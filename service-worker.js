self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('ultimate-scout-cache-v1').then(cache => cache.addAll([
      '/',
      '/index.html',
      '/style.css',
      '/app.js',
      '/manifest.json'
    ]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});
