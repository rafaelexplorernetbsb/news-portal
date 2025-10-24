import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Clonar os headers da requisição
  const requestHeaders = new Headers(request.headers);

  // Obter o cookie header original
  const cookieHeader = requestHeaders.get('cookie');

  if (cookieHeader) {
    // Lista de cookies do Directus
    const directusCookies = [
      'directus_session_token',
      'directus_refresh_token',
      'directus_access_token',
    ];

    // Filtrar cookies removendo os do Directus
    const filteredCookies = cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .filter((cookie) => {
        const cookieName = cookie.split('=')[0];
        return !directusCookies.includes(cookieName);
      })
      .join('; ');

    // Atualizar o header Cookie (ou remover se vazio)
    if (filteredCookies) {
      requestHeaders.set('cookie', filteredCookies);
    } else {
      requestHeaders.delete('cookie');
    }
  }

  // Criar resposta com headers modificados
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
