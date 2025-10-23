import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Lista de cookies do Directus que devem ser removidos
  const directusCookies = [
    'directus_session_token',
    'directus_refresh_token',
    'directus_access_token',
    'directus_token',
    'directus_session',
    'directus_refresh',
    'directus_access',
  ];

  // Verificar se é uma requisição para o frontend (não admin)
  const isFrontendRequest =
    !request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/_next/static') &&
    !request.nextUrl.pathname.startsWith('/api/auth/login');

  if (isFrontendRequest) {
    // Remover cookies do Directus das requisições do frontend
    directusCookies.forEach((cookieName) => {
      // Remover cookie da requisição
      request.cookies.delete(cookieName);

      // Remover cookie da resposta
      response.cookies.delete(cookieName);

      // Definir cookie expirado para garantir remoção
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        domain: 'localhost',
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
      });
    });
  }

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
