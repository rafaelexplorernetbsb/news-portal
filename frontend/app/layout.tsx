import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../src/styles/content-renderer.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CrônicaDigital - Portal de Notícias",
  description: "Fique por dentro das últimas notícias em tempo real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}

        {/* Registrar Service Worker para notificações */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('Service Worker registrado com sucesso:', registration.scope);
                  })
                  .catch(function(error) {
                    console.log('Falha ao registrar Service Worker:', error);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
