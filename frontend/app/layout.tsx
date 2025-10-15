import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../src/styles/content-renderer.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal de Notícias",
  description: "Fique por dentro das últimas notícias em tempo real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
