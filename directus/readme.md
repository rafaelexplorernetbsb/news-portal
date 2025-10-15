# 📰 Portal de Notícias

Portal de notícias moderno com Directus CMS e Next.js, incluindo webscrapers automáticos para G1, Folha de S.Paulo e Olhar Digital.

## 🚀 Quick Start

### Pré-requisitos
- **Node.js** 18+
- **pnpm** 9+
- **Docker** e **Docker Compose**

### Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/rafaelexplorernetbsb/news-portal.git
cd news-portal

# 2. Execute o setup automático
./setup.sh dev

# 3. Acesse o projeto
# Frontend: http://localhost:3000
# Directus Admin: http://localhost:8055/admin
# Credenciais: admin@example.com / admin123
```

## 📋 Comandos Disponíveis

### Desenvolvimento
```bash
pnpm dev              # Inicia todos os serviços
pnpm dev:directus     # Apenas API Directus
pnpm dev:frontend     # Apenas Frontend Next.js
pnpm dev:webscraper   # Apenas Webscrapers
```

### Build e Produção
```bash
pnpm build            # Build do frontend
pnpm start            # Inicia frontend em produção
```

### Utilitários
```bash
pnpm install:all      # Instala dependências de todos os serviços
pnpm clean            # Remove node_modules
pnpm reset            # Limpa e reinstala tudo
./test-setup.sh       # Testa se o setup está correto
./health-check.sh     # Verifica saúde dos serviços
./stop.sh             # Para todos os serviços
```

## 🏗️ Estrutura do Projeto

```
news-portal/
├── frontend/          # Next.js 15 + React 19
├── api/              # Directus API
├── webscraper-service/  # Scrapers (G1, Folha, Olhar Digital)
├── setup.sh          # Setup automático
├── docker-compose.yml
└── .env              # Variáveis de ambiente centralizadas
```

## 🔧 Configuração

### Variáveis de Ambiente

Todas as variáveis estão no arquivo `.env` na raiz do projeto:

```bash
# Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_ADMIN_EMAIL=admin@example.com
DIRECTUS_ADMIN_PASSWORD=admin123

# Frontend
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
NEXT_PUBLIC_API_TOKEN=<seu-token>

# Webscraper
WEBSCRAPER_INTERVAL_MINUTES=5
G1_ENABLED=true
FOLHA_ENABLED=true
OLHAR_DIGITAL_ENABLED=true
```

## 🕷️ Webscrapers

### Portais Suportados
- **G1** - Tecnologia
- **Folha de S.Paulo** - Tec
- **Olhar Digital**

### Como Executar
```bash
# Executar um webscraper específico
cd webscraper-service
node g1.js
node folha.js
node olhar-digital.js
```

## 🎨 Frontend

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS 4
- **Markdown**: react-markdown + remark-gfm
- **WYSIWYG**: Suporte a HTML e Markdown

### Páginas
- `/` - Home com notícias em destaque
- `/categoria/[slug]` - Notícias por categoria
- `/noticia/[slug]` - Página da notícia
- `/busca` - Busca de notícias

## 🗄️ Directus

### Collections
- **noticias** - Notícias do portal
- **categorias** - Categorias (Tecnologia, Política, etc.)
- **autores** - Autores das notícias

### Editor WYSIWYG
- Suporte a HTML e Markdown
- Toolbar completa (bold, italic, headings, listas, etc.)
- Code blocks com highlight
- Imagens e tabelas

## 🐳 Docker

### Serviços
- **Directus** - CMS (porta 8055)
- **PostgreSQL** - Banco de dados (porta 5432)
- **Redis** - Cache (porta 6379)

### Comandos Docker
```bash
docker compose up -d              # Inicia containers
docker compose down               # Para containers
docker compose logs -f directus   # Ver logs do Directus
```

## 📚 Documentação Adicional

- [Setup Guide](./SETUP-GUIDE.md) - Guia detalhado de instalação
- [Troubleshooting](./TROUBLESHOOTING.md) - Solução de problemas
- [Setup Corrigido](./SETUP-CORRIGIDO.md) - Últimas correções aplicadas
- [Implementação Article Media](./IMPLEMENTACAO-ARTICLE-MEDIA.md) - Detalhes técnicos

## 🧪 Testes

```bash
# Testar setup completo
./test-setup.sh

# Verificar saúde dos serviços
./health-check.sh

# Diagnóstico completo
./diagnose.sh
```

## 🛠️ Tecnologias

### Backend
- Directus 11
- PostgreSQL 15
- Redis 7
- Node.js 18+

### Frontend
- Next.js 15
- React 19
- TypeScript 5
- Tailwind CSS 4

### Webscrapers
- Cheerio (HTML parsing)
- node-fetch (HTTP requests)
- dotenv (Variáveis de ambiente)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./license) para mais detalhes.

## 🤝 Contribuindo

Veja [CONTRIBUTING](./contributing.md) para detalhes sobre como contribuir.

## 🐛 Problemas Conhecidos

### Collections não aparecem
- **Solução**: Crie manualmente no Directus Admin ou execute `./setup.sh dev` novamente

### Token expirado
- **Solução**: Faça login no Directus e gere um novo token estático

### Porta ocupada
- **Solução**: Execute `./setup.sh dev` que limpa as portas automaticamente

---

**Desenvolvido com ❤️ usando Directus e Next.js**
