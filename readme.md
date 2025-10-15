# Portal de Notícias

Sistema de portal de notícias com CMS Directus, frontend Next.js e webscrapers automáticos.

## Instalação

```bash
./setup.sh dev
```

## Acesso

- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:8055/admin
- **Credenciais**: admin@example.com / admin123

## Comandos

```bash
pnpm dev              # Inicia todos os serviços
pnpm dev:frontend     # Frontend Next.js
pnpm dev:directus     # API Directus
pnpm dev:webscraper   # Webscrapers

pnpm build            # Build produção
./stop.sh             # Para serviços
./refresh-token.sh    # Atualiza token em todos os .env
./health-check.sh     # Verifica saúde dos serviços
./diagnose.sh         # Diagnóstico completo
```

## Estrutura

```
├── frontend/          # Next.js 15
├── api/              # Directus CMS
├── webscraper-service/  # Scrapers
├── docker-compose.yml
├── setup.sh
└── .env
```

## Tecnologias

- Next.js 15, React 19, Tailwind CSS 4
- Directus 11, PostgreSQL 15, Redis 7
- Cheerio, node-fetch

## Webscrapers

```bash
cd webscraper-service
node g1.js           # G1 Tecnologia
node folha.js        # Folha de S.Paulo
node olhar-digital.js # Olhar Digital
node metropoles.js   # Metrópoles
node tecmundo.js     # TecMundo
node uol.js          # UOL
```

## Docker

```bash
docker compose up -d    # Inicia
docker compose down     # Para
docker compose logs -f  # Logs
```

## Configuração

Edite `.env` na raiz do projeto para configurar URLs, tokens e credenciais.

## Licença

MIT
