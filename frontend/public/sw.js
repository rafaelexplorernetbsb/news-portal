self.addEventListener('push', function (event) {
  console.log('🔔 [SW] Push event recebido!', event);

  if (!event.data) {
    console.warn('⚠️  [SW] Push event sem dados');
    return;
  }

  try {
    const data = event.data.json();
    console.log('📦 [SW] Dados recebidos:', data);

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

    console.log('📤 [SW] Mostrando notificação:', data.title);

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Portal de Notícias',
        options
      ).then(() => {
        console.log('✅ [SW] Notificação exibida com sucesso!');
      }).catch((error) => {
        console.error('❌ [SW] Erro ao exibir notificação:', error);
      })
    );
  } catch (error) {
    console.error('❌ [SW] Erro ao processar push:', error);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'view' && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

self.addEventListener('notificationclose', function (event) {
  // Silencioso em produção
});
