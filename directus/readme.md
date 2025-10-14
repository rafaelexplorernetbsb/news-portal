# 📰 Portal de Notícias - Directus + Next.js

Portal de notícias moderno e completo com sistema de webscrapers automáticos, desenvolvido com **Directus** (backend/CMS), **Next.js** (frontend) e **TypeScript**.

## ⚡ Setup Instantâneo (1 Comando!)

```bash
bash setup.sh
```

**É isso!** O script configura tudo automaticamente em poucos minutos:

- ✅ Verifica e instala dependências
- ✅ Inicia Docker automaticamente
- ✅ Cria e configura banco de dados PostgreSQL
- ✅ Executa migrations e popula dados iniciais
- ✅ Configura Directus com usuário admin
- ✅ Inicia frontend Next.js
- ✅ Gera tokens de autenticação
- ✅ Verifica saúde de todos os serviços

Veja o **[Guia de Setup Completo](SETUP-GUIDE.md)** para mais detalhes.

## 🎯 Características

### 🔧 Backend (Directus)
- API REST completa
- CMS headless poderoso
- Autenticação e permissões
- Upload de mídia
- Webhooks e automações

### 🎨 Frontend (Next.js)
- Server-Side Rendering (SSR)
- Geração Estática (SSG)
- Design responsivo e moderno
- Performance otimizada
- SEO-friendly

### 🕷️ Webscrapers Automáticos
- **G1 Tecnologia**: Importa notícias do G1
- **Folha de S.Paulo**: Importa notícias da Folha (Tec)
- **Olhar Digital**: Importa notícias do Olhar Digital
- Execução automática a cada 5 minutos
- Evita duplicatas
- Formatação e limpeza de conteúdo

## 📋 Pré-requisitos

- **Docker Desktop** (ou Docker Engine + Docker Compose)
- **Node.js 18+**
- **pnpm** (recomendado) ou npm
- **Git**

### Instalar pnpm

```bash
npm install -g pnpm
```

## 🚀 Início Rápido

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/portal-noticias.git
cd portal-noticias
```

### 2. Execute o Setup

```bash
bash setup.sh
```

### 3. Acesse o Sistema

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Directus Admin**: [http://localhost:8055/admin](http://localhost:8055/admin)
  - Email: `admin@example.com`
  - Senha: `admin123`

### 4. Rode os Webscrapers (Opcional)

```bash
cd webscraper-service

# G1 - Tecnologia
node g1.js

# Folha - Tecnologia  
node folha.js

# Olhar Digital
node olhar-digital.js
```

## 📊 Dados Iniciais

O setup automaticamente cria:

### Categorias
1. **Tecnologia** (ID: 1, slug: `tecnologia`)
2. **Política** (ID: 2, slug: `politica`)
3. **Economia** (ID: 3, slug: `economia`)
4. **Esportes** (ID: 4, slug: `esportes`)
5. **Cultura** (ID: 5, slug: `cultura`)

### Autor Padrão
- **Sistema Webscraper** (ID: 1)
- Usado por todos os webscrapers automáticos

## 🗂️ Estrutura do Projeto

```
directus/
├── database/
│   ├── migrations/          # Migrations SQL
│   └── seeds/               # Seeds SQL (dados iniciais)
├── frontend/                # Next.js frontend
│   ├── app/                 # App Router do Next.js
│   ├── components/          # Componentes React
│   ├── lib/                 # Utilitários e SDK
│   └── public/              # Arquivos estáticos
├── webscraper-service/      # Webscrapers
│   ├── g1.js               # Webscraper do G1
│   ├── folha.js            # Webscraper da Folha
│   └── olhar-digital.js    # Webscraper do Olhar Digital
├── api/                     # Directus API (opcional)
├── .env                    # Configurações principais
├── setup.sh                # Setup automático ⭐
├── stop.sh                 # Parar todos os serviços
├── health-check.sh         # Verificar saúde dos serviços
├── diagnose.sh             # Diagnóstico completo
└── docker-compose.yml      # Docker Compose (desenvolvimento)
```

## 💡 Comandos Úteis

### Parar Tudo
```bash
./stop.sh
```

### Ver Logs do Frontend
```bash
tail -f frontend.log
```

### Health Check
```bash
./health-check.sh
```

### Diagnóstico Completo
```bash
./diagnose.sh
```

### Reiniciar Setup
```bash
./stop.sh
bash setup.sh
```

### Docker Compose
```bash
# Ver status
docker compose ps

# Ver logs do Directus
docker compose logs -f directus

# Ver logs do PostgreSQL
docker compose logs -f db

# Parar containers
docker compose down

# Parar e remover volumes
docker compose down -v
```

## 🔧 Configuração

### Variáveis de Ambiente

As principais configurações estão em `.env`:

```bash
# Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_ADMIN_EMAIL=admin@example.com
DIRECTUS_ADMIN_PASSWORD=admin123

# Frontend
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055

# Webscrapers
G1_ENABLED=true
FOLHA_ENABLED=true
OLHAR_DIGITAL_ENABLED=true
WEBSCRAPER_INTERVAL_MINUTES=5
```

### Configuração dos Webscrapers

Edite `webscraper-service/.env`:

```bash
# Configurações do G1
G1_ENABLED=true
G1_INTERVAL_MINUTES=5
G1_MAX_ARTICLES=5
G1_RSS_URL=https://g1.globo.com/rss/g1/tecnologia/
G1_CATEGORY_SLUG=tecnologia
```

## 🐳 Docker

O projeto usa Docker para rodar:
- **PostgreSQL** (banco de dados)
- **Redis** (cache)
- **Directus** (API/CMS)

Os containers são iniciados automaticamente pelo `setup.sh`.

### Modo Desenvolvimento

```bash
docker compose up -d
```

### Modo Produção

```bash
docker compose -f docker-compose.prod.yml up -d
```

## 🔍 Troubleshooting

### Docker não inicia

```bash
# macOS
open -a Docker

# Linux
sudo systemctl start docker

# Ou use o helper script
./start-docker.sh
```

### Portas já estão em uso

```bash
# O setup.sh automaticamente libera as portas
# Mas você pode fazer manualmente:
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8055 | xargs kill -9  # Directus
```

### Erro de dependências

```bash
# Limpar caches
pnpm store prune
rm -rf node_modules frontend/node_modules webscraper-service/node_modules

# Rodar setup novamente
bash setup.sh
```

### Banco de dados não está populado

```bash
# Executar migrations e seeds manualmente
docker compose exec -T db psql -U directus -d directus < database/migrations/001_initial_schema.sql
docker compose exec -T db psql -U directus -d directus < database/seeds/001_initial_data.sql
```

## 📚 Documentação Adicional

- **[Guia de Setup Completo](SETUP-GUIDE.md)** - Documentação detalhada do setup
- **[Directus Docs](https://docs.directus.io/)** - Documentação oficial do Directus
- **[Next.js Docs](https://nextjs.org/docs)** - Documentação oficial do Next.js

## 🛠️ Stack Tecnológico

### Backend
- **Directus** - Headless CMS
- **PostgreSQL** - Banco de dados
- **Redis** - Cache

### Frontend
- **Next.js 14+** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Icons** - Ícones

### Webscrapers
- **Node.js** - Runtime
- **Cheerio** - Parser HTML
- **node-fetch** - HTTP client
- **dotenv** - Variáveis de ambiente

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **pnpm** - Gerenciador de pacotes

## 🚀 Deploy em Produção

Para produção:

1. **Configure as variáveis de ambiente**:
   ```bash
   cp .env .env.production
   # Edite .env.production com valores de produção
   ```

2. **Execute o setup em modo produção**:
   ```bash
   bash setup.sh prod
   ```

3. **Configure domínios e SSL**:
   - Use Nginx ou Caddy como reverse proxy
   - Configure certificados SSL (Let's Encrypt)
   - Aponte domínios para os serviços

4. **Ajuste permissões do Directus**:
   - Acesse o Admin
   - Configure roles e permissões
   - Proteja endpoints sensíveis

5. **Monitore os serviços**:
   ```bash
   ./health-check.sh
   ```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se encontrar problemas:

1. Execute o diagnóstico: `./diagnose.sh`
2. Verifique os logs: `tail -f frontend.log`
3. Verifique os logs do Docker: `docker compose logs -f`
4. Consulte o [Guia de Setup](SETUP-GUIDE.md)
5. Abra uma issue no GitHub

---

**✨ Feito com ❤️ usando Directus e Next.js**
