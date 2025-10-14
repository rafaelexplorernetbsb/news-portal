# 🚀 Guia de Setup Rápido - Portal de Notícias

Este guia mostra como configurar o Portal de Notícias do zero em apenas **1 comando**.

## ⚡ Setup Instantâneo

```bash
bash setup.sh
```

**É isso!** O script fará tudo automaticamente:

1. ✅ Verificar dependências (Docker, Node.js, pnpm)
2. ✅ Iniciar Docker (se necessário)
3. ✅ Limpar portas ocupadas
4. ✅ Configurar arquivos `.env`
5. ✅ Instalar todas as dependências
6. ✅ Iniciar containers Docker (PostgreSQL, Redis, Directus)
7. ✅ Executar migrations do banco de dados
8. ✅ Popular banco com dados iniciais:
   - 5 categorias (Tecnologia, Política, Economia, Esportes, Cultura)
   - 1 autor padrão (Sistema Webscraper)
9. ✅ Criar usuário administrador
10. ✅ Gerar token de autenticação
11. ✅ Iniciar frontend Next.js
12. ✅ Verificar saúde de todos os serviços

## 📋 Pré-requisitos

Antes de executar o setup, você precisa ter instalado:

- **Docker Desktop** (ou Docker Engine + Docker Compose)
- **Node.js 18+**
- **pnpm** (recomendado) ou npm
- **Git**

### Instalar pnpm (Recomendado)

```bash
npm install -g pnpm
```

## 🎯 Modos de Setup

### Desenvolvimento (Padrão)

```bash
bash setup.sh dev
# ou simplesmente
bash setup.sh
```

### Produção

```bash
bash setup.sh prod
```

## 🌐 Acessando o Sistema

Após o setup concluir, você pode acessar:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Directus Admin**: [http://localhost:8055/admin](http://localhost:8055/admin)
- **API**: [http://localhost:8055](http://localhost:8055)

### 🔑 Credenciais Padrão

- **Email**: `admin@example.com`
- **Senha**: `admin123`

> ⚠️ **IMPORTANTE**: Altere estas credenciais em produção!

## 📊 Dados Iniciais

O setup automaticamente cria:

### Categorias

1. **Tecnologia** (ID: 1, slug: `tecnologia`)
2. **Política** (ID: 2, slug: `politica`)
3. **Economia** (ID: 3, slug: `economia`)
4. **Esportes** (ID: 4, slug: `esportes`)
5. **Cultura** (ID: 5, slug: `cultura`)

### Autor Padrão

- **Nome**: Sistema Webscraper (ID: 1)
- **Usado por**: Todos os webscrapers automáticos

## 🕷️ Rodando Webscrapers

Após o setup, você pode rodar os webscrapers:

```bash
# G1 - Tecnologia
cd webscraper-service
node g1.js

# Folha - Tecnologia
node folha.js

# Olhar Digital
node olhar-digital.js
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

## 🐳 Comandos Docker

### Ver Status dos Containers

```bash
docker compose ps
```

### Ver Logs do Directus

```bash
docker compose logs -f directus
```

### Ver Logs do PostgreSQL

```bash
docker compose logs -f db
```

### Parar Containers

```bash
docker compose down
```

### Parar e Remover Volumes

```bash
docker compose down -v
```

## 🔧 Estrutura de Arquivos

```
directus/
├── database/
│   ├── migrations/          # Migrations SQL
│   │   └── 001_initial_schema.sql
│   └── seeds/               # Seeds SQL
│       └── 001_initial_data.sql
├── frontend/                # Next.js frontend
│   ├── .env.local          # Configurações do frontend
│   └── ...
├── webscraper-service/      # Webscrapers
│   ├── .env                # Configurações dos webscrapers
│   ├── g1.js
│   ├── folha.js
│   └── olhar-digital.js
├── .env                    # Configurações principais
├── setup.sh                # Setup automático
├── stop.sh                 # Parar todos os serviços
├── health-check.sh         # Verificar saúde dos serviços
└── docker-compose.yml      # Docker Compose (desenvolvimento)
```

## 🔍 Troubleshooting

### Docker não inicia

```bash
# macOS
open -a Docker

# Linux
sudo systemctl start docker
```

### Portas já estão em uso

O script `setup.sh` automaticamente libera as portas. Se ainda assim houver problemas:

```bash
# Liberar porta 3000
lsof -ti:3000 | xargs kill -9

# Liberar porta 8055
lsof -ti:8055 | xargs kill -9
```

### Erro de permissão no Docker

```bash
# Linux
sudo usermod -aG docker $USER
# Depois, faça logout e login novamente
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

## 📝 Variáveis de Ambiente

### Principais

- `DIRECTUS_URL`: URL do Directus (padrão: `http://localhost:8055`)
- `DIRECTUS_ADMIN_EMAIL`: Email do admin (padrão: `admin@example.com`)
- `DIRECTUS_ADMIN_PASSWORD`: Senha do admin (padrão: `admin123`)
- `NEXT_PUBLIC_DIRECTUS_URL`: URL do Directus para o frontend

### Webscrapers

- `G1_ENABLED`: Habilitar webscraper do G1 (padrão: `true`)
- `FOLHA_ENABLED`: Habilitar webscraper da Folha (padrão: `true`)
- `OLHAR_DIGITAL_ENABLED`: Habilitar webscraper do Olhar Digital (padrão: `true`)
- `WEBSCRAPER_INTERVAL_MINUTES`: Intervalo entre execuções (padrão: `5`)
- `WEBSCRAPER_MAX_ARTICLES`: Máximo de artigos por execução (padrão: `5`)

## 🚀 Deploy em Produção

Para produção, use:

```bash
bash setup.sh prod
```

E configure as variáveis de ambiente em `.env` com valores seguros:

- Altere `DIRECTUS_ADMIN_PASSWORD`
- Configure domínios reais
- Configure SSL/HTTPS (usando Nginx ou Caddy)
- Use senhas fortes para o banco de dados

## 📚 Próximos Passos

1. **Acesse o Directus Admin**: [http://localhost:8055/admin](http://localhost:8055/admin)
2. **Configure permissões** se necessário
3. **Teste o frontend**: [http://localhost:3000](http://localhost:3000)
4. **Rode os webscrapers** para importar notícias
5. **Personalize o visual** do frontend conforme necessário

## 🆘 Suporte

Se encontrar problemas:

1. Execute o diagnóstico: `./diagnose.sh`
2. Verifique os logs: `tail -f frontend.log`
3. Verifique os logs do Docker: `docker compose logs -f`
4. Abra uma issue no GitHub

---

**✨ Divirta-se com seu Portal de Notícias!**

