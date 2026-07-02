const CACHE_NAME = 'jurnal-masjid-v5'; // Versi baru agar cache lama terhapus
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './script.js', // WAJIB ADA agar aplikasi jalan offline
    'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});