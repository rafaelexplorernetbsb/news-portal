# 🚀 Guia de Deploy em Produção

Este documento contém instruções passo a passo para fazer o deploy do Portal de Notícias em um servidor de produção.

## 📋 Pré-requisitos no Servidor

- Ubuntu 20.04+ ou Debian 11+
- Docker e Docker Compose instalados
- Node.js 18+ instalado
- Nginx instalado (para reverse proxy)
- Certificado SSL configurado (Let's Encrypt recomendado)
- Domínio configurado com DNS

## 🔐 Passo 1: Preparação Inicial

### 1.1. Clone o Repositório

```bash
cd /var/www
git clone <url-do-repositorio> news-portal
cd news-portal
```

### 1.2. Gere Chaves de Segurança

```bash
# Gerar chaves para Directus
echo "DIRECTUS_KEY=$(openssl rand -base64 32)"
echo "DIRECTUS_SECRET=$(openssl rand -base64 32)"

# Gerar chaves VAPID para Push Notifications
npx web-push generate-vapid-keys
```

**IMPORTANTE:** Anote essas chaves! Você vai precisar delas no próximo passo.

### 1.3. Configure as Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.prod.example .env

# Editar com suas configurações
nano .env
```

**Variáveis OBRIGATÓRIAS para alterar:**

```bash
# Ambiente
ENV=prod

# Database
DIRECTUS_DB_PASSWORD=SUA_SENHA_SUPER_SEGURA_AQUI

# Directus - Use as chaves geradas no passo 1.2
DIRECTUS_KEY=CHAVE_GERADA_OPENSSL
DIRECTUS_SECRET=SECRET_GERADA_OPENSSL
DIRECTUS_ADMIN_EMAIL=admin@seudominio.com
DIRECTUS_ADMIN_PASSWORD=SENHA_ADMIN_FORTE
DIRECTUS_URL=https://api.seudominio.com

# Frontend
NEXT_PUBLIC_SITE_URL=https://seudominio.com

# Push Notifications - Use as chaves VAPID geradas
VAPID_PUBLIC_KEY=SUA_CHAVE_PUBLICA_VAPID
VAPID_PRIVATE_KEY=SUA_CHAVE_PRIVADA_VAPID
VAPID_SUBJECT=mailto:admin@seudominio.com

# Cache (habilitar em produção)
CACHE_ENABLED=true

# Logging (reduzir verbosidade)
LOG_LEVEL=warn
LOG_STYLE=json
```

## 🏗️ Passo 2: Atualizar Chaves VAPID no Código

### 2.1. Atualizar Frontend

Edite `frontend/components/NotificationPopup.tsx` (linha ~65):

```typescript
const vapidPublicKey = 'SUA_CHAVE_PUBLICA_VAPID_AQUI';
```

### 2.2. Atualizar Backend

Edite `api/src/extensions/hooks/send-push-notifications.ts` (linhas ~5-6):

```typescript
const VAPID_PUBLIC_KEY = 'SUA_CHAVE_PUBLICA_VAPID_AQUI';
const VAPID_PRIVATE_KEY = 'SUA_CHAVE_PRIVADA_VAPID_AQUI';
```

### 2.3. Configurar Credenciais do Proxy

O frontend usa um **proxy server-side** para acessar o Directus de forma segura. 

**Opção 1: Usar as mesmas credenciais do Admin (Mais Simples)**

No arquivo `.env`, configure:
```bash
DIRECTUS_ADMIN_EMAIL=admin@seudominio.com
DIRECTUS_ADMIN_PASSWORD=sua_senha_admin_forte
```

O proxy automaticamente usará essas credenciais.

**Opção 2: Criar Usuário Específico para o Proxy (Mais Seguro)**

1. Após fazer login no Directus Admin, crie um novo usuário:
   - Email: `proxy@seudominio.com`
   - Senha: Senha forte
   - Role: Administrator (ou role customizada com permissões necessárias)

2. No arquivo `.env`, adicione:
   ```bash
   DIRECTUS_PROXY_EMAIL=proxy@seudominio.com
   DIRECTUS_PROXY_PASSWORD=senha_do_proxy
   ```

**IMPORTANTE:** Com essa configuração, você poderá:
- ✅ Fazer login no Directus Admin com suas credenciais (`DIRECTUS_ADMIN_EMAIL`)
- ✅ O frontend usará as credenciais do proxy para acessar a API
- ✅ Nenhuma credencial será exposta no client-side

## 📦 Passo 3: Instalação e Build

### 3.1. Instalar Dependências do API

```bash
cd api
npm install
cd ..
```

### 3.2. Build do Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

### 3.3. Dar Permissões aos Scripts

```bash
chmod +x setup.sh
chmod +x stop.sh
chmod +x start-webscrapers.sh
chmod +x stop-webscrapers.sh
chmod +x status-webscrapers.sh
```

## 🐳 Passo 4: Iniciar os Serviços

### 4.1. Executar Setup

```bash
./setup.sh
```

Este script irá:
- Iniciar PostgreSQL, Redis e Directus
- Criar o banco de dados
- Executar migrações
- Criar usuário administrador
- Popular dados iniciais

### 4.2. Criar Coleção de Push Notifications

```bash
# Conectar ao PostgreSQL
docker-compose exec postgres psql -U directus -d directus

# Copiar e executar o SQL de database/migrations/002_push_subscriptions.sql
```

Ou crie manualmente no Directus Admin.

### 4.3. Iniciar Frontend em Produção

Opção 1: PM2 (recomendado)

```bash
npm install -g pm2
cd frontend
pm2 start npm --name "news-portal-frontend" -- start
pm2 save
pm2 startup
```

Opção 2: Docker (adicionar ao docker-compose.yml)

Opção 3: Systemd (criar service)

## 🌐 Passo 5: Configurar Nginx

### 5.1. Criar Configuração do Nginx

```bash
sudo nano /etc/nginx/sites-available/news-portal
```

Cole a configuração:

```nginx
# Frontend
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;

    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API Directus
server {
    listen 80;
    server_name api.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.seudominio.com;

    ssl_certificate /etc/letsencrypt/live/api.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:8055;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        client_max_body_size 100M;
    }
}
```

### 5.2. Ativar o Site

```bash
sudo ln -s /etc/nginx/sites-available/news-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Passo 6: Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Gerar certificados
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
sudo certbot --nginx -d api.seudominio.com

# Testar renovação automática
sudo certbot renew --dry-run
```

## 🕷️ Passo 7: Iniciar Webscrapers

```bash
./start-webscrapers.sh

# Verificar status
./status-webscrapers.sh

# Ver logs
tail -f logs/webscrapers/*.log
```

## ✅ Passo 8: Verificação Final

### 8.1. Testar o Frontend

```bash
curl -I https://seudominio.com
# Deve retornar: HTTP/2 200
```

### 8.2. Testar a API

```bash
curl https://api.seudominio.com/server/health
# Deve retornar: {"status":"ok"}
```

### 8.3. Testar Push Notifications

1. Acesse https://seudominio.com
2. Aceite as notificações
3. Acesse https://api.seudominio.com/admin
4. Crie uma nova notícia
5. Verifique se a notificação foi recebida

### 8.4. Verificar Logs

```bash
# Directus
docker-compose logs -f directus | grep -i error

# Frontend
pm2 logs news-portal-frontend

# Webscrapers
tail -f logs/webscrapers/*.log

# Nginx
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Manutenção

### Backup do Banco de Dados

```bash
# Criar backup
docker-compose exec postgres pg_dump -U directus directus > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T postgres psql -U directus directus < backup_20250101_120000.sql
```

### Atualizar o Código

```bash
# Parar serviços
pm2 stop news-portal-frontend
./stop-webscrapers.sh

# Atualizar código
git pull origin main

# Rebuild frontend
cd frontend
npm install
npm run build

# Reiniciar
pm2 restart news-portal-frontend
cd ..
./start-webscrapers.sh

# Reiniciar Directus (se necessário)
docker-compose restart directus
```

### Monitoramento

Configure monitoramento com:
- PM2 para o frontend
- Docker healthchecks para os containers
- Nginx logs para acesso/erros
- Alertas de disco e memória

## 🚨 Troubleshooting

### Problema: Frontend não carrega

```bash
# Verificar se está rodando
pm2 status

# Ver logs
pm2 logs news-portal-frontend

# Reiniciar
pm2 restart news-portal-frontend
```

### Problema: 502 Bad Gateway

- Verificar se os serviços estão rodando: `docker-compose ps`
- Verificar configuração do Nginx: `sudo nginx -t`
- Verificar logs do Nginx: `sudo tail -f /var/log/nginx/error.log`

### Problema: Push Notifications não funcionam

1. Verificar se HTTPS está configurado (obrigatório)
2. Verificar se as chaves VAPID foram atualizadas no código
3. Verificar se a coleção `push_subscriptions` existe
4. Verificar logs: `docker-compose logs directus | grep push`

### Problema: Webscrapers não coletam notícias

```bash
# Verificar status
./status-webscrapers.sh

# Ver logs
tail -f logs/webscrapers/*.log

# Reiniciar
./stop-webscrapers.sh
./start-webscrapers.sh
```

## 📞 Suporte

Se encontrar problemas durante o deploy:

1. Consulte este guia
2. Verifique os logs de todos os serviços
3. Revise as variáveis de ambiente
4. Certifique-se de que todas as portas necessárias estão abertas no firewall

## ✅ Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Todas as senhas foram alteradas
- [ ] HTTPS está funcionando
- [ ] Frontend carrega corretamente
- [ ] API Directus está acessível
- [ ] Admin consegue fazer login no Directus
- [ ] Notícias aparecem no frontend
- [ ] Push notifications funcionam
- [ ] Webscrapers estão coletando notícias
- [ ] Logs estão sendo salvos
- [ ] Backup automático está configurado
- [ ] PM2 está configurado para reiniciar automaticamente
- [ ] Firewall está configurado
- [ ] Monitoramento está ativo

---

**Boa sorte com o deploy!** 🎉

