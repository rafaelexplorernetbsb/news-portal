'use client';

import { useEffect, useState } from 'react';

export function useNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar se o navegador suporta notificações
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options,
          });
        });
      } else {
        new Notification(title, {
          icon: '/favicon.ico',
          ...options,
        });
      }
    } catch (error) {
      // Silencioso em produção
    }
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      return 'denied';
    }
  };

  return {
    permission,
    isSupported,
    sendNotification,
    requestPermission,
  };
}
