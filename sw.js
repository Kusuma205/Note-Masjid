const CACHE_NAME = 'jurnal-masjid-v1';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

// Update otomatis ketika ada file baru
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});