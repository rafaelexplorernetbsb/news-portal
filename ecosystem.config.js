// ========================================
// CONFIGURAÇÃO PM2 PARA PRODUÇÃO
// ========================================

module.exports = {
  apps: [
    {
      name: 'directus-api',
      script: 'api/src/cli.js',
      args: 'start',
      cwd: './api',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8055,
        DB_CLIENT: 'pg',
        DB_HOST: process.env.DIRECTUS_DB_HOST || 'localhost',
        DB_PORT: process.env.DIRECTUS_DB_PORT || 5432,
        DB_DATABASE: process.env.DIRECTUS_DB_DATABASE || 'directus',
        DB_USER: process.env.DIRECTUS_DB_USER || 'directus',
        DB_PASSWORD: process.env.DIRECTUS_DB_PASSWORD || 'directus',
        KEY: process.env.KEY,
        SECRET: process.env.SECRET,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
        CORS_ENABLED: 'true',
        CORS_ORIGIN: process.env.CORS_ORIGIN || 'true',
        CACHE_ENABLED: 'true',
        CACHE_STORE: 'redis',
        CACHE_REDIS: process.env.REDIS_URL || 'redis://localhost:6379',
        STORAGE_LOCATIONS: process.env.STORAGE_LOCATIONS || 'local',
        STORAGE_LOCAL_ROOT: process.env.STORAGE_LOCAL_ROOT || './uploads',
        STORAGE_LOCAL_PUBLIC_URL: process.env.STORAGE_LOCAL_PUBLIC_URL || '/uploads',
        LOG_LEVEL: process.env.LOG_LEVEL || 'warn',
        LOG_STYLE: process.env.LOG_STYLE || 'json',
        PUBLIC_URL: process.env.PUBLIC_URL || 'http://localhost:8055'
      },
      error_file: './logs/directus-api-error.log',
      out_file: './logs/directus-api-out.log',
      log_file: './logs/directus-api-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055',
        NEXT_PUBLIC_API_TOKEN: process.env.NEXT_PUBLIC_API_TOKEN,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Portal de Notícias'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'webscraper-g1',
      script: 'g1.js',
      cwd: './webscraper-service',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        DIRECTUS_URL: process.env.WEBSCRAPER_DIRECTUS_URL || 'http://localhost:8055',
        DIRECTUS_TOKEN: process.env.WEBSCRAPER_DIRECTUS_TOKEN,
        WEBSCRAPER_INTERVAL_MINUTES: process.env.G1_INTERVAL_MINUTES || '5',
        WEBSCRAPER_MAX_ARTICLES: process.env.G1_MAX_ARTICLES || '5'
      },
      error_file: './logs/webscraper-g1-error.log',
      out_file: './logs/webscraper-g1-out.log',
      log_file: './logs/webscraper-g1-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      restart_delay: 10000,
      max_restarts: 5,
      min_uptime: '30s'
    },
    {
      name: 'webscraper-folha',
      script: 'folha.js',
      cwd: './webscraper-service',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        DIRECTUS_URL: process.env.WEBSCRAPER_DIRECTUS_URL || 'http://localhost:8055',
        DIRECTUS_TOKEN: process.env.WEBSCRAPER_DIRECTUS_TOKEN,
        WEBSCRAPER_INTERVAL_MINUTES: process.env.FOLHA_INTERVAL_MINUTES || '5',
        WEBSCRAPER_MAX_ARTICLES: process.env.FOLHA_MAX_ARTICLES || '5'
      },
      error_file: './logs/webscraper-folha-error.log',
      out_file: './logs/webscraper-folha-out.log',
      log_file: './logs/webscraper-folha-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      restart_delay: 10000,
      max_restarts: 5,
      min_uptime: '30s'
    },
    {
      name: 'webscraper-olhar-digital',
      script: 'olhar-digital.js',
      cwd: './webscraper-service',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        DIRECTUS_URL: process.env.WEBSCRAPER_DIRECTUS_URL || 'http://localhost:8055',
        DIRECTUS_TOKEN: process.env.WEBSCRAPER_DIRECTUS_TOKEN,
        WEBSCRAPER_INTERVAL_MINUTES: process.env.OLHAR_DIGITAL_INTERVAL_MINUTES || '5',
        WEBSCRAPER_MAX_ARTICLES: process.env.OLHAR_DIGITAL_MAX_ARTICLES || '5'
      },
      error_file: './logs/webscraper-olhar-digital-error.log',
      out_file: './logs/webscraper-olhar-digital-out.log',
      log_file: './logs/webscraper-olhar-digital-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      restart_delay: 10000,
      max_restarts: 5,
      min_uptime: '30s'
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: ['seu-servidor.com'],
      ref: 'origin/main',
      repo: 'https://github.com/seu-usuario/seu-repositorio.git',
      path: '/var/www/portal-noticias',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
