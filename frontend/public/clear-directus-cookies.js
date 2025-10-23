// Script para limpar cookies do Directus antes de qualquer coisa carregar
(function () {
  'use strict';

  const directusCookies = [
    'directus_session_token',
    'directus_refresh_token',
    'directus_access_token',
    'directus_token',
    'directus_session',
    'directus_refresh',
    'directus_access',
  ];

  // Função para limpar cookies
  function clearCookies() {
    directusCookies.forEach((cookieName) => {
      // Remover cookie do domínio atual
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

      // Remover cookie do domínio localhost
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;

      // Remover cookie sem domínio
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=;`;
    });
  }

  // Limpar cookies imediatamente se o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clearCookies);
  } else {
    clearCookies();
  }

  // Limpar cookies periodicamente
  setInterval(clearCookies, 2000);
})();
