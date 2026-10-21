/* FLC 2026 offline cache.
   Bump VERSION whenever you change content, images or code so phones pick up the update. */
const VERSION = 'flc-2027-v6';
const ASSETS = [
  './',
  './assets/fonts/barlow-condensed-latin-500-normal.woff2',
  './assets/fonts/barlow-condensed-latin-600-normal.woff2',
  './assets/fonts/barlow-condensed-latin-700-normal.woff2',
  './assets/fonts/barlow-latin-400-italic.woff2',
  './assets/fonts/barlow-latin-400-normal.woff2',
  './assets/fonts/barlow-latin-500-normal.woff2',
  './assets/fonts/barlow-latin-600-normal.woff2',
  './assets/fonts/barlow-latin-700-normal.woff2',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/img/bund.jpg',
  './assets/img/china-map.jpg',
  './assets/img/china-people.jpg',
  './assets/img/cover-skyline.jpg',
  './assets/img/floor-plan.jpg',
  './assets/img/hotel-ballroom.jpg',
  './assets/img/hotel-bar.jpg',
  './assets/img/hotel-dining.jpg',
  './assets/img/hotel-gym.jpg',
  './assets/img/hotel-lobby.jpg',
  './assets/img/hotel-pool.jpg',
  './assets/img/hotel-restaurant.jpg',
  './assets/img/hotel-room.jpg',
  './assets/img/hotel-tower.jpg',
  './assets/img/logo.svg',
  './assets/img/lujiazui.jpg',
  './assets/img/robert-pye.webp',
  './assets/img/roosevelt-interior.jpg',
  './assets/img/roosevelt-terrace.jpg',
  './assets/img/roosevelt.jpg',
  './assets/img/shanghai-aerial.jpg',
  './assets/img/shanghai-map.jpg',
  './assets/img/shanghai-metro.jpg',
  './assets/img/shanghai-tobacco.jpg',
  './assets/img/shengjian-bao.jpg',
  './assets/img/skyline-blue.jpg',
  './assets/img/sp-daniel.jpg',
  './assets/img/sp-georges.jpg',
  './assets/img/sp-hafed.jpg',
  './assets/img/sp-taimur.jpg',
  './assets/img/sp-zsofia.jpg',
  './assets/img/wm-skyline.webp',
  './assets/img/wm-tower.webp',
  './assets/img/yu-garden.jpg',
  './config/users.js',
  './css/app.css',
  './data/attendees.json',
  './data/content.js',
  './data/live.json',
  './index.html',
  './js/admin.js',
  './js/app.js',
  './manifest.webmanifest'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first for code and content (so edits show up), cache first for images and fonts.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const isMedia = /\.(jpg|jpeg|png|webp|svg|woff2)$/i.test(url.pathname);
  if (isMedia) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res;
    })));
  } else {
    e.respondWith(fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
  }
});
