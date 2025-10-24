# 🚀 Deploy em Produção

## 📋 Arquitetura

```
https://seusite.com          → Frontend (Next.js na porta 3000)
https://seusite.com/admin    → Directus Admin (porta 8055)
```

---

## 🔒 Isolamento de Cookies

### Problema
Quando frontend e admin compartilham o mesmo domínio, os cookies do Directus são enviados em **todas as requisições**, incluindo as do frontend.

### Solução
O **Nginx** reescreve os cookies do Directus para incluir `Path=/admin`, garantindo que eles sejam enviados **APENAS** nas requisições para `/admin`.

```nginx
# No location /admin
proxy_cookie_path / /admin;
```

Isso faz com que:
- ✅ Cookies do Directus → `Path=/admin` → Enviados APENAS em `https://seusite.com/admin/*`
- ✅ Frontend → Não recebe cookies do Directus
- ✅ Token NÃO aparece no DevTools do frontend

---

## 📦 Variáveis de Ambiente

### Frontend (.env.production)
```bash
# URLs públicas
NEXT_PUBLIC_DIRECTUS_URL=https://seusite.com/admin
NEXT_PUBLIC_SITE_URL=https://seusite.com

# Variáveis de servidor
DIRECTUS_URL=http://localhost:8055
DIRECTUS_ADMIN_EMAIL=admin@seusite.com
DIRECTUS_ADMIN_PASSWORD=senha_segura_aqui

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua_chave_vapid_publica
```

### Directus (.env)
```bash
# Database
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=directus_prod
DB_USER=directus_prod
DB_PASSWORD=senha_segura_aqui

# Directus
KEY=chave_secreta_gerada
SECRET=outra_chave_secreta_gerada

# URLs (importante!)
PUBLIC_URL=https://seusite.com/admin
ADMIN_URL=https://seusite.com/admin

# Tokens com validade longa (1 ano)
ACCESS_TOKEN_TTL=365d
REFRESH_TOKEN_TTL=365d

# CORS (permitir frontend)
CORS_ENABLED=true
CORS_ORIGIN=https://seusite.com

# Push Notifications
VAPID_PUBLIC_KEY=sua_chave_vapid_publica
VAPID_PRIVATE_KEY=sua_chave_vapid_privada
VAPID_EMAIL=mailto:admin@seusite.com

# Redis (opcional mas recomendado)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🔧 Passos de Deploy

### 1. Preparar Servidor
```bash
# Instalar dependências
sudo apt update
sudo apt install nginx nodejs npm postgresql redis-server

# Instalar PM2 globalmente
sudo npm install -g pm2
```

### 2. Clonar Projeto
```bash
git clone https://github.com/seu-usuario/news-portal.git
cd news-portal
```

### 3. Configurar Banco de Dados
```bash
# Criar banco e usuário
sudo -u postgres psql
CREATE DATABASE directus_prod;
CREATE USER directus_prod WITH PASSWORD 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON DATABASE directus_prod TO directus_prod;
\q

# Rodar migrações (dentro do container ou direto)
cd news-portal
./setup.sh prod
```

### 4. Build do Frontend
```bash
cd frontend
npm install
npm run build
```

### 5. Configurar PM2
```bash
# Frontend
cd /path/to/news-portal/frontend
pm2 start npm --name "news-portal-frontend" -- start

# Directus
cd /path/to/news-portal
pm2 start "docker-compose up directus" --name "news-portal-directus"

# Salvar configuração
pm2 save
pm2 startup
```

### 6. Configurar Nginx
```bash
# Copiar configuração
sudo cp nginx.conf.example /etc/nginx/sites-available/seusite.com
sudo ln -s /etc/nginx/sites-available/seusite.com /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 7. Configurar SSL (Certbot)
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seusite.com -d www.seusite.com

# Renovação automática já está configurada
```

---

## 🧪 Testes Pós-Deploy

### 1. Verificar Frontend
```bash
curl -I https://seusite.com
# Deve retornar 200 OK
```

### 2. Verificar Admin
```bash
curl -I https://seusite.com/admin
# Deve retornar 200 OK ou redirect para /admin/login
```

### 3. Testar Cookies
1. Acesse `https://seusite.com` no navegador
2. Abra DevTools > Application > Cookies
3. ✅ NÃO deve haver `directus_session_token`
4. Acesse `https://seusite.com/admin`
5. Faça login
6. ✅ Agora deve aparecer `directus_session_token` com `Path=/admin`
7. Volte para `https://seusite.com`
8. Abra DevTools > Network > Qualquer requisição > Headers
9. ✅ Cookie do Directus NÃO deve estar nos headers

---

## 🔍 Monitoramento

### PM2
```bash
# Status dos processos
pm2 status

# Logs em tempo real
pm2 logs

# Restart
pm2 restart all

# Monitoramento web
pm2 monit
```

### Logs do Nginx
```bash
# Access logs
tail -f /var/log/nginx/seusite_access.log

# Error logs
tail -f /var/log/nginx/seusite_error.log
```

---

## 🚨 Troubleshooting

### Cookies ainda aparecem no frontend
- Verifique se `proxy_cookie_path / /admin;` está configurado
- Reinicie o Nginx: `sudo systemctl restart nginx`
- Limpe cookies do navegador e teste novamente

### Admin não carrega CSS/JS
- Verifique a configuração de `location /admin/assets`
- Confirme que `PUBLIC_URL` no Directus está correto

### WebSocket não funciona
- Verifique headers `Upgrade` e `Connection` no Nginx
- Confirme que firewall permite conexões WebSocket

---

## ✅ Checklist Final

- [ ] Frontend funcionando em `https://seusite.com`
- [ ] Admin funcionando em `https://seusite.com/admin`
- [ ] SSL configurado e válido
- [ ] Cookies isolados (Path=/admin)
- [ ] Push notifications funcionando
- [ ] Webscrapers rodando
- [ ] Logs sendo coletados
- [ ] Backup automático configurado
- [ ] Monitoramento ativo

---

## 📚 Referências

- [Nginx Cookie Module](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cookie_path)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Directus Self-Hosted](https://docs.directus.io/self-hosted/quickstart.html)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

