'use client';

import { useState, useEffect } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';

interface NotificationPopupProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function NotificationPopup({ onAccept, onDecline }: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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

        // Mostrar notificação de teste
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('CrônicaDigital', {
              body: 'Você agora receberá notificações das principais notícias!',
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: 'welcome-notification'
            });
          });
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
          {/* Logo CrônicaDigital */}
          <div className="mb-2">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#1c99da] to-[#db0202] rounded-full mb-1">
              <span className="text-base font-bold text-white">CD</span>
            </div>
            <h2 className="text-lg font-bold text-[#333333]">CrônicaDigital</h2>
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
