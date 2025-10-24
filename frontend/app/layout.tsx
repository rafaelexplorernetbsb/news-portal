import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '../src/styles/content-renderer.css';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieCleaner from '@/components/CookieCleaner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CrônicaDigital - Portal de Notícias',
  description: 'Fique por dentro das últimas notícias em tempo real',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <Script src="/clear-directus-cookies.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <CookieCleaner />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>

        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('✅ Service Worker registrado com sucesso:', registration.scope);
                }).catch(function(error) {
                  console.error('❌ Erro ao registrar Service Worker:', error);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
