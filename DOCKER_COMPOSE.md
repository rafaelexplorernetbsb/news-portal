# 🐳 Docker Compose - Arquivo Único com Profiles

Este projeto usa **um único arquivo** `docker-compose.yml` que funciona tanto para **desenvolvimento** quanto para **produção** usando **profiles** do Docker Compose.

## 📋 Como Funciona

### 🔧 Desenvolvimento

```bash
# Inicia apenas os serviços básicos (postgres, redis, directus)
docker-compose up -d
```

**Serviços que rodam:**
- ✅ PostgreSQL (banco de dados)
- ✅ Redis (cache)
- ✅ Directus (API/CMS)

**Serviços que NÃO rodam:**
- ❌ Frontend (você roda manualmente: `cd frontend && npm run dev`)
- ❌ Nginx (não necessário em dev)
- ❌ Webscraper (você roda manualmente: `./start-webscrapers.sh`)

### 🚀 Produção

```bash
# Inicia todos os serviços incluindo frontend e nginx
docker-compose --env-file .env --profile production up -d
```

**Serviços que rodam:**
- ✅ PostgreSQL (banco de dados)
- ✅ Redis (cache)
- ✅ Directus (API/CMS)
- ✅ Frontend (Next.js buildado)
- ✅ Nginx (reverse proxy)
- ✅ Webscraper (opcional, via script separado)

## ⚙️ Configuração por Ambiente

### Desenvolvimento

```bash
# Copiar arquivo de exemplo para desenvolvimento
cp env.example .env.local

# Editar configurações
nano .env.local
```

**Configurações padrão para desenvolvimento:**
- `ENV=dev`
- `DIRECTUS_URL=http://localhost:8055`
- `CACHE_ENABLED=false`
- `LOG_LEVEL=info`
- `LOG_STYLE=pretty`
- `RATE_LIMITER_ENABLED=false`

### Produção

```bash
# Copiar arquivo de exemplo para produção
cp env.example .env

# Editar configurações
nano .env
```

**Configurações padrão para produção:**
- `ENV=prod`
- `DIRECTUS_URL=https://api.seudominio.com`
- `CACHE_ENABLED=true`
- `CACHE_STORE=redis`
- `LOG_LEVEL=warn`
- `LOG_STYLE=json`
- `RATE_LIMITER_ENABLED=true`

## 🎯 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar apenas backend
docker-compose up -d

# Ver logs
docker-compose logs -f directus

# Parar tudo
docker-compose down

# Rebuildar se mudou código
docker-compose up -d --build
```

### Produção

```bash
# Deploy completo
./deploy.sh

# Ou manualmente:
docker-compose --env-file .env --profile production up -d

# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose --profile production down
```

### Manutenção

```bash
# Backup do banco
docker-compose exec postgres pg_dump -U directus directus > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U directus directus < backup.sql

# Limpar volumes (CUIDADO: apaga dados!)
docker-compose down -v
```

## 🔍 Verificar Status

```bash
# Ver containers rodando
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f directus
docker-compose logs -f postgres
docker-compose logs -f redis
```

## 🛠️ Troubleshooting

### Problema: Container não inicia

```bash
# Ver logs detalhados
docker-compose logs directus

# Verificar se porta está ocupada
lsof -i :8055

# Rebuildar container
docker-compose up -d --build directus
```

### Problema: Banco não conecta

```bash
# Verificar se PostgreSQL está rodando
docker-compose exec postgres pg_isready -U directus

# Ver logs do banco
docker-compose logs postgres

# Resetar banco (CUIDADO: apaga dados!)
docker-compose down
docker volume rm news-portal_postgres_data
docker-compose up -d
```

### Problema: Cache Redis não funciona

```bash
# Verificar Redis
docker-compose exec redis redis-cli ping

# Limpar cache
docker-compose exec redis redis-cli FLUSHALL
```

## 📊 Monitoramento

### Health Checks

Todos os serviços têm health checks configurados:

```bash
# Verificar saúde dos serviços
docker-compose ps

# Status detalhado
docker inspect news-portal_api_dev | grep -A 10 Health
```

### Logs Estruturados

Em produção, os logs são em formato JSON para facilitar análise:

```bash
# Logs do Directus em produção
docker-compose logs directus | jq .

# Filtrar apenas erros
docker-compose logs directus | grep -i error
```

## 🔒 Segurança

### Desenvolvimento
- Portas expostas para facilitar debug
- Logs verbosos
- Cache desabilitado
- Rate limiting desabilitado

### Produção
- Portas restritas (apenas localhost para Directus)
- Logs mínimos
- Cache Redis habilitado
- Rate limiting habilitado
- HTTPS obrigatório

## ✅ Vantagens desta Abordagem

1. **Um arquivo só** - mais fácil de manter
2. **Configuração dinâmica** - baseada em variáveis de ambiente
3. **Profiles** - ativa serviços conforme necessário
4. **Flexibilidade** - funciona em qualquer ambiente
5. **Simplicidade** - menos confusão sobre qual arquivo usar

---

**Resumo:** Use `docker-compose up -d` para desenvolvimento e `docker-compose --profile production up -d` para produção! 🚀
