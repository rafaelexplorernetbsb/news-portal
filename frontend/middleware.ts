import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Lista de cookies do Directus
  const directusCookies = [
    'directus_session_token',
    'directus_refresh_token',
  ];

  // Remover cookies do Directus APENAS das requisições do frontend
  // Isso impede que sejam enviados ao Next.js, mas não os deleta do navegador
  directusCookies.forEach((cookieName) => {
    if (request.cookies.has(cookieName)) {
      // Remove da requisição atual
      request.cookies.delete(cookieName);
    }
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
