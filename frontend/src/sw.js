const CACHE = 'campussnap-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png',
  '/icons/icon.png',
  '/icons/icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});