'use client';

import { useEffect } from 'react';

export default function CookieCleaner() {
  useEffect(() => {
    // Função para limpar cookies do Directus
    const clearDirectusCookies = () => {
      const directusCookies = [
        'directus_session_token',
        'directus_refresh_token',
        'directus_access_token',
        'directus_token',
        'directus_session',
        'directus_refresh',
        'directus_access',
      ];

      // Limpar cookies do navegador
      directusCookies.forEach((cookieName) => {
        // Remover cookie do domínio atual
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

        // Remover cookie do domínio localhost
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;

        // Remover cookie sem domínio
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=;`;
      });

      // Limpar localStorage e sessionStorage
      directusCookies.forEach((cookieName) => {
        localStorage.removeItem(cookieName);
        sessionStorage.removeItem(cookieName);
      });
    };

    // Limpar cookies imediatamente
    clearDirectusCookies();

    // Limpar cookies periodicamente (a cada 5 segundos)
    const interval = setInterval(clearDirectusCookies, 5000);

    // Limpar cookies quando a página for focada
    const handleFocus = () => clearDirectusCookies();
    window.addEventListener('focus', handleFocus);

    // Limpar cookies quando a página for visível
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        clearDirectusCookies();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null; // Componente invisível
}
