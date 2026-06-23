const CACHE_NAME = 'app-diretoria-vimacom-v3-push-fcm';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './financeiro/',
  './vendas/',
  './compras/'
];

importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

firebase.initializeApp({"apiKey": "AIzaSyChnFF19gFKfsL6McfBazOHPgYfjXcfnf4", "authDomain": "app-diretoria-vimacom.firebaseapp.com", "projectId": "app-diretoria-vimacom", "storageBucket": "app-diretoria-vimacom.firebasestorage.app", "messagingSenderId": "642905541906", "appId": "1:642905541906:web:bfddbcea02338af5db77cb"});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const titulo = (payload && payload.data && payload.data.title) || 'Gestor';
  const body = (payload && payload.data && payload.data.body) || 'Novo alerta executivo.';
  const url = (payload && payload.data && payload.data.url) || './index.html';
  self.registration.showNotification(titulo, {
    body,
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    tag: (payload && payload.data && payload.data.tag) || 'gestor-alerta',
    renotify: true,
    data: { url }
  });
});

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS).catch(() => null))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => null);
      return resp;
    }).catch(() => caches.match(req))
  );
});

self.addEventListener('push', event => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch(e) { data = { body: event.data.text() }; }
  const titulo = data.title || (data.notification && data.notification.title) || 'Gestor';
  const body = data.body || (data.notification && data.notification.body) || 'Novo alerta executivo.';
  const url = data.url || './index.html';
  event.waitUntil(self.registration.showNotification(titulo, {
    body,
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    tag: data.tag || 'gestor-alerta',
    renotify: true,
    data: { url }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification && event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
      return null;
    })
  );
});
