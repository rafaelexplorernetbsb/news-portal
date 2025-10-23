# ⚡ Guia Rápido de Deploy

Este guia é para quem vai fazer o deploy do projeto em produção pela primeira vez.

## 📦 O que você recebeu

Este é um **Portal de Notícias Completo** com:
- Frontend em Next.js
- Backend com Directus CMS
- Sistema de Push Notifications
- 6 Webscrapers automáticos de notícias
- Tudo containerizado com Docker

## 🚀 Deploy Rápido (5 minutos)

### 1. Requisitos no Servidor

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Instalar Docker Compose
sudo apt install docker-compose

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (para gerenciar o frontend)
sudo npm install -g pm2

# Instalar Nginx (para reverse proxy)
sudo apt install nginx

# Instalar Certbot (para SSL)
sudo apt install certbot python3-certbot-nginx
```

### 2. Clonar e Configurar

```bash
# Clone o projeto
cd /var/www
git clone <url-do-repositorio> news-portal
cd news-portal

# Copie e edite as variáveis de ambiente
cp env.example .env
nano .env
```

**Variáveis OBRIGATÓRIAS para editar:**
- `DIRECTUS_DB_PASSWORD` → Senha forte do banco
- `DIRECTUS_ADMIN_EMAIL` → Seu email (para login no admin)
- `DIRECTUS_ADMIN_PASSWORD` → Senha forte (para login no admin)
- `DIRECTUS_URL` → https://api.seudominio.com
- `NEXT_PUBLIC_SITE_URL` → https://seudominio.com

**Opcional (recomendado para segurança):**
- `DIRECTUS_PROXY_EMAIL` → Email de um usuário específico para o proxy da API
- `DIRECTUS_PROXY_PASSWORD` → Senha desse usuário

**Nota:** Se não configurar `DIRECTUS_PROXY_EMAIL/PASSWORD`, o proxy usará as mesmas credenciais do admin.

### 3. Gerar Chaves de Segurança

```bash
# Chaves do Directus
echo "DIRECTUS_KEY=$(openssl rand -base64 32)"
echo "DIRECTUS_SECRET=$(openssl rand -base64 32)"

# Chaves VAPID para Push Notifications
npx web-push generate-vapid-keys
```

**IMPORTANTE:** Copie essas chaves e cole no arquivo `.env`

### 4. Executar o Deploy

```bash
# Dar permissões
chmod +x deploy.sh setup.sh stop.sh start-webscrapers.sh stop-webscrapers.sh status-webscrapers.sh

# Executar setup inicial
./setup.sh

# OU executar deploy (se já foi feito setup antes)
./deploy.sh
```

### 5. Configurar Nginx e SSL

```bash
# Copiar configuração do nginx (veja exemplo em DEPLOY.md)
sudo nano /etc/nginx/sites-available/news-portal

# Ativar site
sudo ln -s /etc/nginx/sites-available/news-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Gerar certificados SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
sudo certbot --nginx -d api.seudominio.com
```

### 6. Criar Coleção de Push Notifications

```bash
# Conectar ao banco
docker-compose exec postgres psql -U directus -d directus

# Copiar e executar SQL de: database/migrations/002_push_subscriptions.sql
```

### 7. Verificar se Tudo Está Funcionando

```bash
# Status dos containers
docker-compose ps

# Status do frontend
pm2 status

# Status dos webscrapers
./status-webscrapers.sh

# Acessar o site
curl -I https://seudominio.com

# Acessar a API
curl https://api.seudominio.com/server/health
```

## 🎯 Pronto!

Se tudo funcionou:
- ✅ Site acessível em https://seudominio.com
- ✅ Admin em https://api.seudominio.com/admin
- ✅ Push notifications funcionando
- ✅ Webscrapers coletando notícias

## 📝 Próximos Passos

1. **Acessar o Admin** e personalizar:
   - Logo do portal
   - Nome e descrição
   - Categorias
   - Criar novos autores

2. **Configurar Backup Automático:**
   ```bash
   # Adicionar ao crontab
   0 2 * * * /var/www/news-portal/backup.sh
   ```

3. **Configurar Monitoramento:**
   - PM2 monitoring
   - Docker healthchecks
   - Uptime monitoring

## 🆘 Problemas?

Consulte o arquivo **DEPLOY.md** para:
- Instruções detalhadas
- Configurações avançadas
- Troubleshooting completo

## 📞 Comandos Rápidos

```bash
# Ver logs
docker-compose logs -f directus
pm2 logs news-portal-frontend
tail -f logs/webscrapers/*.log

# Reiniciar tudo
docker-compose restart
pm2 restart news-portal-frontend

# Parar tudo
./stop.sh
pm2 stop news-portal-frontend
./stop-webscrapers.sh

# Atualizar código
git pull origin main
./deploy.sh
```

---

**Tempo estimado de deploy:** 10-15 minutos  
**Dificuldade:** Intermediária  
**Requer:** Conhecimento básico de Linux, Docker e Nginx

