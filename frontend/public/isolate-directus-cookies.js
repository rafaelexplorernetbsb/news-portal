// Script para isolar cookies do Directus
(function() {
  'use strict';

  // Função para reescrever cookies do Directus com path /admin
  function isolateDirectusCookies() {
    const directusCookies = ['directus_session_token', 'directus_refresh_token'];
    
    document.cookie.split(';').forEach(function(cookie) {
      const cookiePair = cookie.trim().split('=');
      const cookieName = cookiePair[0];
      
      if (directusCookies.includes(cookieName)) {
        const cookieValue = cookiePair[1];
        
        // Deletar cookie do path atual
        document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Recriar cookie APENAS para o Directus (path /admin ou domínio específico)
        // Como estamos em localhost:3000 e o Directus está em localhost:8055,
        // o cookie não deveria estar aqui. Então apenas deletamos.
        document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;';
      }
    });
  }

  // Executar imediatamente
  isolateDirectusCookies();

  // Interceptar tentativas de definir cookies
  const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  Object.defineProperty(document, 'cookie', {
    get: function() {
      return originalCookieDescriptor.get.call(this);
    },
    set: function(value) {
      // Se for tentativa de definir cookie do Directus, bloquear
      const directusCookies = ['directus_session_token', 'directus_refresh_token'];
      const cookieName = value.split('=')[0].trim();
      
      if (directusCookies.includes(cookieName)) {
        // Não permitir
        return;
      }
      
      // Outros cookies podem ser definidos normalmente
      originalCookieDescriptor.set.call(this, value);
    }
  });

  // Executar periodicamente para limpar se aparecerem
  setInterval(isolateDirectusCookies, 3000);
})();

