'use client';

import { useState, useEffect } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import {
  getProjectSettings,
  getLogoUrl,
  type DirectusSettings,
  getProjectName,
  getProjectDescriptor,
} from '@/lib/directus';

interface NotificationPopupProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function NotificationPopup({
  onAccept,
  onDecline,
}: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [projectSettings, setProjectSettings] =
    useState<DirectusSettings | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const settings = await getProjectSettings();
        if (settings) {
          setProjectSettings(settings);
          const logo = getLogoUrl(settings.project_logo);
          setLogoUrl(logo);
        }
      } catch (error) {
        // Silencioso em produção
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const hasResponded = localStorage.getItem(
      'notification-permission-responded'
    );
    if (!hasResponded) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = async () => {
    setIsRequesting(true);

    try {
      console.log('🔔 Solicitando permissão de notificação...');
      const permission = await Notification.requestPermission();
      console.log('🔔 Permissão recebida:', permission);

      if (permission === 'granted') {
        localStorage.setItem('notification-permission-responded', 'accepted');
        localStorage.setItem('notification-permission', 'granted');

        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            console.log('🔔 Aguardando Service Worker...');

            // Tentar obter o Service Worker existente ou registrar um novo
            let registration = await navigator.serviceWorker.getRegistration();

            if (!registration) {
              console.log(
                '🔔 Nenhum Service Worker encontrado, registrando...'
              );
              registration = await navigator.serviceWorker.register('/sw.js');
              console.log('🔔 Service Worker registrado!');
            } else {
              console.log('🔔 Service Worker já registrado!');
            }

            // Aguardar com timeout de 5 segundos
            const readyPromise = navigator.serviceWorker.ready;
            const timeoutPromise = new Promise<ServiceWorkerRegistration>(
              (_, reject) =>
                setTimeout(
                  () => reject(new Error('Service Worker timeout')),
                  5000
                )
            );

            registration = await Promise.race([readyPromise, timeoutPromise]);
            console.log('🔔 Service Worker pronto!');

            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!vapidPublicKey) {
              console.warn(
                'NEXT_PUBLIC_VAPID_PUBLIC_KEY não está definida nas variáveis de ambiente'
              );
              // Continua sem push notifications, mas mostra notificação local
              await registration.showNotification(
                getProjectName(projectSettings?.project_name || null) ||
                  'Portal de Notícias',
                {
                  body: 'Você agora receberá notificações das principais notícias!',
                  icon: logoUrl || '/favicon.ico',
                  badge: logoUrl || '/favicon.ico',
                  tag: 'welcome-notification',
                }
              );
              console.log('🔔 Notificação local exibida');
              onAccept?.();
              return;
            }

            function urlBase64ToUint8Array(base64String: string) {
              const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
              const base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/');

              const rawData = window.atob(base64);
              const outputArray = new Uint8Array(rawData.length);

              for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
              }
              return outputArray;
            }

            console.log('🔔 Inscrevendo para push notifications...');
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });
            console.log('🔔 Inscrição criada!');

            // Timeout para evitar travamento
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 10000)
            );

            const responsePromise = fetch('/api/push/subscribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(subscription.toJSON()),
            });

            try {
              console.log('🔔 Enviando inscrição para servidor...');
              const response = (await Promise.race([
                responsePromise,
                timeoutPromise,
              ])) as Response;
              if (!response.ok) {
                console.warn('Falha ao registrar push subscription');
              } else {
                console.log('🔔 Inscrição registrada no servidor!');
              }
            } catch (error) {
              console.warn(
                'Timeout ou erro ao registrar push subscription:',
                error
              );
            }

            console.log('🔔 Exibindo notificação de boas-vindas...');
            await registration.showNotification(
              getProjectName(projectSettings?.project_name || null) ||
                'Portal de Notícias',
              {
                body: 'Você agora receberá notificações das principais notícias!',
                icon: logoUrl || '/favicon.ico',
                badge: logoUrl || '/favicon.ico',
                tag: 'welcome-notification',
              }
            );
            console.log('🔔 Notificação exibida com sucesso!');
          } catch (error) {
            console.error('🔔 Erro ao configurar push notifications:', error);

            // Tentar mostrar notificação básica mesmo sem Service Worker pronto
            try {
              // Tentar obter qualquer registro existente
              const existingRegistration =
                await navigator.serviceWorker.getRegistration();

              if (existingRegistration) {
                console.log(
                  '🔔 Tentando exibir notificação com registro existente...'
                );
                await existingRegistration.showNotification(
                  getProjectName(projectSettings?.project_name || null) ||
                    'Portal de Notícias',
                  {
                    body: 'Você agora receberá notificações das principais notícias!',
                    icon: logoUrl || '/favicon.ico',
                    badge: logoUrl || '/favicon.ico',
                    tag: 'welcome-notification',
                  }
                );
                console.log('🔔 Notificação de fallback exibida');
              } else {
                console.warn(
                  '🔔 Não foi possível exibir notificação: Service Worker não disponível'
                );
                // Sucesso mesmo sem notificação - permissão foi concedida
              }
            } catch (fallbackError) {
              console.error(
                '🔔 Erro ao exibir notificação de fallback:',
                fallbackError
              );
              // Continua normalmente - permissão foi concedida de qualquer forma
            }
          }
        } else {
          console.warn('🔔 Service Worker ou PushManager não disponível');
        }

        onAccept?.();
        console.log('🔔 Processo concluído!');
      } else {
        console.log('🔔 Permissão negada pelo usuário');
        localStorage.setItem('notification-permission-responded', 'declined');
        localStorage.setItem('notification-permission', 'denied');
      }
    } catch (error) {
      console.error('🔔 Erro ao processar notificações:', error);
    } finally {
      console.log('🔔 Finalizando popup...');
      setIsRequesting(false);
      setIsClosing(true);
      setTimeout(() => {
        setIsVisible(false);
        console.log('🔔 Popup fechado');
      }, 300);
    }
  };

  const handleDecline = () => {
    localStorage.setItem('notification-permission-responded', 'declined');
    localStorage.setItem('notification-permission', 'denied');

    onDecline?.();
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center pt-4 transition-all duration-300 ${isClosing ? 'animate-out fade-out' : 'animate-in fade-in'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
    >
      <div
        className={`bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 relative transition-all duration-500 ${isClosing ? 'animate-out slide-out-to-top-4' : 'animate-in slide-in-from-top-4'}`}
      >
        {/* Conteúdo do popup */}
        <div className="p-3 text-center">
          {/* Logo e Nome do Portal */}
          <div className="mb-2">
            {logoUrl ? (
              <div className="inline-flex items-center justify-center w-10 h-10 mb-1">
                <img
                  src={logoUrl}
                  alt={projectSettings?.project_name || 'Logo'}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#1c99da] to-[#db0202] rounded-full mb-1">
                <span className="text-base font-bold text-white">CD</span>
              </div>
            )}
            <h2 className="text-lg font-bold text-[#333333]">
              {getProjectName(projectSettings?.project_name || null)}
            </h2>
          </div>

          {/* Ícone de sino outline */}
          <div className="mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12">
              <FaBell className="text-3xl text-gray-400" />
            </div>
          </div>

          {/* Texto principal */}
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
            Você quer ficar por dentro das notícias mais importantes e receber{' '}
            <span className="text-[#db0202] font-semibold">notificações</span>{' '}
            em tempo real?
          </p>

          {/* Botões */}
          <div className="space-y-1">
            <button
              onClick={handleAccept}
              disabled={isRequesting}
              className="w-full bg-[#db0202] hover:bg-[#c40202] text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isRequesting ? 'Configurando...' : 'Eu quero!'}
            </button>

            <button
              onClick={handleDecline}
              className="w-full text-gray-500 hover:text-gray-700 font-medium py-1 px-6 transition-colors cursor-pointer"
            >
              Agora não
            </button>
          </div>

          {/* Texto explicativo */}
          <p className="text-xs text-gray-400 mt-2">
            Você pode alterar essa configuração a qualquer momento nas
            configurações do seu navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
