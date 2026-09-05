// Service Worker: 离线缓存 + 通知调度
const CACHE = 'coc-wall-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './app/main.js',
  './app/db.js',
  './app/data.js',
  './app/notify.js',
  './app/chart.js',
  './app/planner.js',
  './app/guide.js',
  './app/reminder.js',
  './app/tracker.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});

// 收到定时通知触发
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SHOW_NOTIFY') {
    const { title, body, tag } = e.data.payload;
    self.registration.showNotification(title, {
      body,
      tag,
      icon: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%237c3aed%22/%3E%3Ctext x=%2232%22 y=%2242%22 font-size=%2234%22 text-anchor=%22middle%22 fill=%22white%22%3E%E5%A2%99%3C/text%3E%3C/svg%3E'
    });
  }
});
