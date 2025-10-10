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
};

export default nextConfig;
