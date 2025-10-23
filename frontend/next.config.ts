import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['react-icons', '@directus/sdk'],
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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

  // Compression
  compress: true,

  // Bundle analysis
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
        })
      );
    }

    // Code splitting optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  eslint: {
    // Não falhar o build por erros de ESLint
    ignoreDuringBuilds: true,
  },

  turbopack: {
    // Define explicitamente a raiz para evitar aviso de múltiplos lockfiles
    root: __dirname,
  },

  // Headers for performance and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "img-src 'self' data: blob: https: http:; frame-src 'self' https:;",
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=60',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
