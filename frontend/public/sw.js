// Service Worker para notificações
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body || 'Nova notícia disponível',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'news-notification',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Ver notícia'
        },
        {
          action: 'dismiss',
          title: 'Dispensar'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'CrônicaDigital', options)
    );
  }
});

// Lidar com cliques nas notificações
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'view' && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Lidar com notificações fechadas
self.addEventListener('notificationclose', function(event) {
  console.log('Notificação fechada:', event.notification.tag);
});
