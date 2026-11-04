/* Service worker: menyimpan berkas aplikasi di HP supaya bisa dibuka tanpa internet.
   Kalau kamu mengunggah versi baru, ubah angka VERSI di bawah supaya HP mengambil berkas baru. */
var VERSI = 'v2';
var CACHE = 'buku-titip-' + VERSI;
var BERKAS = ['./', 'index.html', 'manifest.webmanifest', 'xlsx.full.min.js', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(BERKAS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('buku-titip-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function () {
        if (hit) return hit;
        return req.mode === 'navigate' ? cache.match('index.html') : Response.error();
      });
      return hit || net;
    });
  }));
});
