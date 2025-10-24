self.addEventListener('push', function (event) {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();

    const options = {
      body: data.body || 'Nova notícia disponível',
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      tag: data.tag || 'news-notification',
      data: data.data || {},
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'view',
          title: 'Ver notícia',
        },
        {
          action: 'dismiss',
          title: 'Dispensar',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Portal de Notícias', options)
    );
  } catch (error) {
    // Silencioso em produção
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'view' && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

self.addEventListener('notificationclose', function (event) {});
