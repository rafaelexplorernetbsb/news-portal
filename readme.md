# 📰 Portal de Notícias - Crônica Digital

Portal de notícias moderno desenvolvido com Next.js 15 e Directus CMS, featuring sistema completo de push notifications, webscrapers automáticos e interface responsiva.

## 🚀 Funcionalidades

### Frontend
- ✅ **Interface Moderna** com Next.js 15 e TailwindCSS
- ✅ **Sistema de Push Notifications** automático
- ✅ **Skeleton Loading** para melhor UX
- ✅ **Menu Dinâmico** de categorias
- ✅ **Busca de Notícias** em tempo real
- ✅ **Páginas Otimizadas** com SSR e SSG
- ✅ **Responsive Design** mobile-first
- ✅ **Service Worker** para notificações offline

### Backend (Directus CMS)
- ✅ **API RESTful** completa
- ✅ **Painel Administrativo** intuitivo
- ✅ **Sistema de Categorias** flexível
- ✅ **Gerenciamento de Autores**
- ✅ **Upload de Imagens** otimizado
- ✅ **Hook Automático** para push notifications
- ✅ **Cache com Redis**

### Webscrapers
- ✅ **6 Fontes de Notícias** (G1, Folha, UOL, Tecmundo, Metrópoles, Olhar Digital)
- ✅ **Scripts de Gerenciamento** (start, stop, status)
- ✅ **Logs Centralizados**
- ✅ **Detecção de Duplicatas**
- ✅ **Todas notícias marcadas como Destaque**

## 📋 Pré-requisitos

- **Docker** e **Docker Compose**
- **Node.js** 18+ (para desenvolvimento local)
- **pnpm** (gerenciador de pacotes)

## 🔧 Instalação

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd news-portal
```

### 2. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp env.prod.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

**Variáveis importantes para ajustar:**
- `DIRECTUS_DB_PASSWORD` - Senha do PostgreSQL
- `DIRECTUS_KEY` - Chave de criptografia (gere uma nova)
- `DIRECTUS_SECRET` - Secret para JWT (gere uma nova)
- `DIRECTUS_ADMIN_EMAIL` - Email do administrador
- `DIRECTUS_ADMIN_PASSWORD` - Senha do administrador
- `DIRECTUS_URL` - URL pública da API (ex: https://api.seudominio.com)
- `NEXT_PUBLIC_SITE_URL` - URL do frontend (ex: https://seudominio.com)

### 3. Execute o Setup

```bash
chmod +x setup.sh
./setup.sh
```

O script irá:
- Iniciar os containers Docker
- Criar o banco de dados
- Executar migrações
- Criar usuário administrador
- Popular dados iniciais

### 4. Acesse o Sistema

- **Frontend**: http://localhost:3000
- **Admin (Directus)**: http://localhost:8055
  - Email: admin@example.com
  - Senha: admin123

## 📦 Estrutura do Projeto

```
news-portal/
├── frontend/               # Aplicação Next.js
│   ├── app/               # Rotas e páginas
│   ├── components/        # Componentes React
│   ├── lib/               # Utilitários e APIs
│   └── public/            # Arquivos estáticos
│
├── api/                   # Directus API customizada
│   └── src/extensions/    # Extensões do Directus
│       └── hooks/         # Hooks customizados
│
├── webscraper-service/    # Scrapers de notícias
│   ├── g1.js
│   ├── folha.js
│   ├── uol.js
│   ├── tecmundo.js
│   ├── metropoles.js
│   └── olhar-digital.js
│
├── database/              # Migrações e seeds
│   └── migrations/
│
├── docker-compose.yml     # Configuração Docker (desenvolvimento + produção)
├── env.example            # Template de variáveis de ambiente (dev + prod)
├── validate-env.sh        # Script de validação de variáveis
└── setup.sh              # Script de instalação
```

## 🛠️ Comandos Úteis

### Desenvolvimento

```bash
# Iniciar apenas o backend (Directus)
docker-compose up -d

# Iniciar o frontend em modo desenvolvimento
cd frontend && npm run dev

# Ver logs do Directus
docker-compose logs -f directus

# Ver logs do banco de dados
docker-compose logs -f postgres
```

### Webscrapers

```bash
# Iniciar todos os webscrapers
./start-webscrapers.sh

# Verificar status
./status-webscrapers.sh

# Parar todos os webscrapers
./stop-webscrapers.sh

# Ver logs de um scraper específico
tail -f logs/webscrapers/g1.log
```

### Produção

```bash
# Build do frontend
cd frontend && npm run build

# Iniciar em modo produção
cd frontend && npm run start

# Parar tudo
./stop.sh
```

## 🔔 Sistema de Push Notifications

### Setup Inicial

1. **Criar a coleção no Directus:**

Acesse o Directus Admin e execute a migração SQL:

```sql
-- Conteúdo de database/migrations/002_push_subscriptions.sql
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT NOT NULL UNIQUE,
    expiration_time BIGINT,
    keys_p256dh TEXT NOT NULL,
    keys_auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
```

2. **Instalar dependências:**

```bash
cd api
npm install web-push
```

3. **Gerar chaves VAPID para produção:**

```bash
npx web-push generate-vapid-keys
```

4. **Atualizar as chaves** em:
   - `frontend/components/NotificationPopup.tsx` (linha 65)
   - `api/src/extensions/hooks/send-push-notifications.ts` (linhas 5-6)

5. **Reiniciar o Directus:**

```bash
docker-compose restart directus
```

### Como Funciona

1. Usuário acessa o portal e aceita receber notificações
2. Subscrição é salva no Directus
3. Quando uma nova notícia é criada, **TODOS os usuários inscritos recebem uma notificação push** automaticamente
4. Notificação mostra: título, resumo e logo do portal
5. Ao clicar, usuário é direcionado para a notícia

## 🌐 Deploy em Produção

### Preparação

1. **Ajuste as variáveis de ambiente** em `.env`:
   - Use senhas fortes
   - Configure os domínios corretos
   - Gere novas chaves VAPID

2. **Configure o domínio** nos seguintes locais:
   - `.env` → `DIRECTUS_URL` e `NEXT_PUBLIC_SITE_URL`
   - Configurações de DNS apontando para o servidor

3. **Configure HTTPS** (obrigatório para push notifications):
   - Use nginx como reverse proxy
   - Configure certificados SSL (Let's Encrypt recomendado)

### Deploy com Docker

```bash
# 1. Build do frontend
cd frontend
npm install
npm run build

# 2. Subir os containers
cd ..
docker-compose up -d

# 3. Verificar status
docker-compose ps

# 4. Ver logs
docker-compose logs -f
```

### Nginx Reverseproxy (Exemplo)

```nginx
server {
    listen 80;
    server_name seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.seudominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Directus API
    location / {
        proxy_pass http://localhost:8055;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Segurança

### Práticas Implementadas

- ✅ **Proxy Server-Side** para ocultar tokens
- ✅ **HttpOnly Cookies** para sessões
- ✅ **CORS** configurado corretamente
- ✅ **Sem tokens expostos** no client-side
- ✅ **Service Worker** seguro

### Antes de Produção

1. **Altere TODAS as senhas padrão**
2. **Gere novas chaves** (`DIRECTUS_KEY`, `DIRECTUS_SECRET`)
3. **Configure HTTPS** obrigatório
4. **Revise permissões** do Directus
5. **Configure rate limiting** se necessário
6. **Habilite logs de auditoria**

## 📊 Monitoramento

### Logs

```bash
# Logs do Directus
docker-compose logs -f directus

# Logs do PostgreSQL
docker-compose logs -f postgres

# Logs dos Webscrapers
tail -f logs/webscrapers/*.log

# Logs do frontend (em produção)
pm2 logs frontend
```

### Health Checks

```bash
# Directus
curl http://localhost:8055/server/health

# PostgreSQL
docker-compose exec postgres pg_isready -U directus
```

## 🐛 Troubleshooting

### Frontend não carrega

```bash
# Verificar se está rodando
lsof -ti:3000

# Reiniciar
cd frontend
npm run build
npm run start
```

### Directus não inicia

```bash
# Ver logs
docker-compose logs directus

# Reiniciar containers
docker-compose restart directus postgres redis
```

### Push Notifications não funcionam

1. Verifique se a coleção `push_subscriptions` existe
2. Verifique se o hook está carregado: `docker-compose logs directus | grep "push"`
3. Verifique as chaves VAPID
4. Certifique-se de que está usando HTTPS em produção

### Webscrapers não estão coletando

```bash
# Verificar status
./status-webscrapers.sh

# Ver logs
tail -f logs/webscrapers/g1.log

# Reiniciar
./stop-webscrapers.sh
./start-webscrapers.sh
```

## 📝 Checklist de Deploy

Antes de fazer o deploy em produção, certifique-se de:

- [ ] Todas as senhas foram alteradas
- [ ] HTTPS está configurado
- [ ] Chaves VAPID foram geradas
- [ ] Domínios estão configurados corretamente
- [ ] Variáveis de ambiente de produção estão corretas
- [ ] Build do frontend foi testado
- [ ] Migrações do banco foram executadas
- [ ] Coleção `push_subscriptions` foi criada
- [ ] Extensões do Directus foram instaladas
- [ ] Backup do banco de dados está configurado
- [ ] Logs estão sendo monitorados
- [ ] Firewall está configurado (portas 80, 443, 8055 se API separada)

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique a seção de Troubleshooting acima
2. Consulte os logs dos serviços
3. Verifique as configurações de ambiente

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido para Crônica Digital** - Portal de Notícias
**Última atualização:** Outubro 2025
