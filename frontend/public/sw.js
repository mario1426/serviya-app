/* ─── ServiYa Service Worker ───────────────────────────────────── */
const CACHE_NAME = 'serviya-v1';

// Instalación: no precacheamos nada, solo activamos inmediatamente
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

/* ─── Push Notifications ─────────────────────────────────────── */
self.addEventListener('push', (event) => {
  let data = { title: 'ServiYa', body: 'Tenés una nueva notificación', url: '/' };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {}
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/badge-72.png',
    data: { url: data.url },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options),
  );
});

/* ─── Click en notificación ──────────────────────────────────── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta de la app, enfocala y navega
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Si no hay ventana, abrir una nueva
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});
