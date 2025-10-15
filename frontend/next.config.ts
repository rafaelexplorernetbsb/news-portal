import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8055',
        pathname: '/assets/**',
      },
      // Permitir imagens do G1
      {
        protocol: 'https',
        hostname: '*.glbimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's2-g1.glbimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's03.video.glbimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's02.video.glbimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's04.video.glbimg.com',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // Não falhar o build por erros de ESLint
    ignoreDuringBuilds: true,
  },
  turbopack: {
    // Define explicitamente a raiz para evitar aviso de múltiplos lockfiles
    root: __dirname,
  },
  // Configurar headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "img-src 'self' data: blob: https: http:; frame-src 'self' https:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
