// Script para isolar cookies do Directus de forma agressiva
(function () {
  'use strict';

  const directusCookies = [
    'directus_session_token',
    'directus_refresh_token',
    'directus_access_token',
  ];

  // Função para deletar cookies do Directus de todas as formas possíveis
  function deleteDirectusCookies() {
    directusCookies.forEach(function (cookieName) {
      // Deletar com path /
      document.cookie =
        cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Deletar com domain localhost
      document.cookie =
        cookieName +
        '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;';
      // Deletar com domain .localhost
      document.cookie =
        cookieName +
        '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;';
      // Deletar sem domain
      document.cookie =
        cookieName +
        '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=;';
      // Deletar com max-age
      document.cookie = cookieName + '=; max-age=0; path=/;';
    });
  }

  // Executar IMEDIATAMENTE (antes de tudo)
  deleteDirectusCookies();

  // Interceptar o getter de cookies para filtrar
  const originalCookieDescriptor = Object.getOwnPropertyDescriptor(
    Document.prototype,
    'cookie'
  );

  Object.defineProperty(document, 'cookie', {
    get: function () {
      const cookies = originalCookieDescriptor.get.call(this);
      // Filtrar cookies do Directus ao ler
      return cookies
        .split(';')
        .filter(function (cookie) {
          const cookieName = cookie.trim().split('=')[0];
          return !directusCookies.includes(cookieName);
        })
        .join(';');
    },
    set: function (value) {
      const cookieName = value.split('=')[0].trim();
      // Bloquear tentativas de criar cookies do Directus
      if (directusCookies.includes(cookieName)) {
        return;
      }
      originalCookieDescriptor.set.call(this, value);
    },
    configurable: true,
  });

  // Deletar continuamente (a cada 1 segundo)
  setInterval(deleteDirectusCookies, 1000);

  // Deletar quando a página ganhar foco
  window.addEventListener('focus', deleteDirectusCookies);

  // Deletar quando a página se tornar visível
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      deleteDirectusCookies();
    }
  });

  // Deletar antes de descarregar (ao navegar)
  window.addEventListener('beforeunload', deleteDirectusCookies);
})();
