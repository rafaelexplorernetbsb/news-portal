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

export default function NotificationPopup({ onAccept, onDecline }: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [projectSettings, setProjectSettings] = useState<DirectusSettings | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Buscar configurações do projeto
        const settings = await getProjectSettings();
        if (settings) {
          setProjectSettings(settings);
          const logo = getLogoUrl(settings.project_logo);
          setLogoUrl(logo);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do popup:', error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    // Verificar se o usuário já respondeu anteriormente
    const hasResponded = localStorage.getItem('notification-permission-responded');
    if (!hasResponded) {
      // Mostrar popup após 2 segundos
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = async () => {
    setIsRequesting(true);

    try {
      // Solicitar permissão de notificação
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Salvar que o usuário aceitou
        localStorage.setItem('notification-permission-responded', 'accepted');
        localStorage.setItem('notification-permission', 'granted');

        // Registrar para receber push notifications
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready;

            // Gerar chave pública VAPID (vamos usar uma chave pública genérica por enquanto)
            // Em produção, você deve gerar suas próprias chaves VAPID
            const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8zaRypE3qv8YYSy1yWL0L9PwbIyDPIY6ZMgcI3gXZhKL0wLyX8Qp9g';

            function urlBase64ToUint8Array(base64String: string) {
              const padding = '='.repeat((4 - base64String.length % 4) % 4);
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

            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            });

            // Salvar subscrição no servidor
            const response = await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(subscription.toJSON()),
            });

            if (!response.ok) {
              console.error('Erro ao salvar subscrição no servidor');
            } else {
              console.log('Subscrição salva com sucesso!');
            }

            // Mostrar notificação de teste
            registration.showNotification(getProjectName(projectSettings?.project_name || null) || 'Portal de Notícias', {
              body: 'Você agora receberá notificações das principais notícias!',
              icon: logoUrl || '/favicon.ico',
              badge: logoUrl || '/favicon.ico',
              tag: 'welcome-notification'
            });
          } catch (error) {
            console.error('Erro ao registrar para push notifications:', error);

            // Mesmo com erro no push, mostrar notificação local
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(getProjectName(projectSettings?.project_name || null) || 'Portal de Notícias', {
                  body: 'Você agora receberá notificações das principais notícias!',
                  icon: logoUrl || '/favicon.ico',
                  badge: logoUrl || '/favicon.ico',
                  tag: 'welcome-notification'
                });
              });
            }
          }
        }

        onAccept?.();
      } else {
        // Usuário negou a permissão
        localStorage.setItem('notification-permission-responded', 'declined');
        localStorage.setItem('notification-permission', 'denied');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
    } finally {
      setIsRequesting(false);
      setIsClosing(true);
      setTimeout(() => setIsVisible(false), 300);
    }
  };

  const handleDecline = () => {
    // Salvar que o usuário recusou
    localStorage.setItem('notification-permission-responded', 'declined');
    localStorage.setItem('notification-permission', 'denied');

    onDecline?.();
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300);
  };


  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center pt-4 transition-all duration-300 ${isClosing ? 'animate-out fade-out' : 'animate-in fade-in'}`} style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
      <div className={`bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 relative transition-all duration-500 ${isClosing ? 'animate-out slide-out-to-top-4' : 'animate-in slide-in-from-top-4'}`}>
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
            Você quer ficar por dentro das notícias mais importantes e receber <span className="text-[#db0202] font-semibold">notificações</span> em tempo real?
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
            Você pode alterar essa configuração a qualquer momento nas configurações do seu navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
