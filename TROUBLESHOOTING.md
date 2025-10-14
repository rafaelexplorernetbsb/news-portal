# 🔧 Troubleshooting - Portal de Notícias

## Problemas Comuns e Soluções

### ❌ Erro: "Unsupported environment (bad pnpm and/or Node.js version)"

**Problema**: O projeto espera Node.js 22, mas você tem uma versão diferente.

**Solução Rápida**:
```bash
# Atualizar package.json já foi feito automaticamente
# Apenas rode o setup novamente
bash setup.sh
```

**Solução Alternativa - Usar NVM**:
```bash
# Instalar nvm se não tiver
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar Node 22
nvm install 22
nvm use 22

# Rodar setup
bash setup.sh
```

### ❌ Erro: "Unknown option: 'ignore-engines'"

**Problema**: Flags incorretas do pnpm.

**Solução**: O script foi atualizado para usar as flags corretas. Execute:
```bash
bash setup.sh
```

### ❌ Erro: "catalog:" no npm

**Problema**: O `package.json` usa `catalog:` que é específico do pnpm workspace.

**Solução**: Use pnpm em vez de npm:
```bash
npm install -g pnpm
bash setup.sh
```

### ❌ Docker não inicia

**macOS**:
```bash
open -a Docker
# Aguarde alguns segundos e rode novamente
bash setup.sh
```

**Linux**:
```bash
sudo systemctl start docker
bash setup.sh
```

**Windows**:
- Abra o Docker Desktop manualmente
- Aguarde inicializar completamente
- Execute: `bash setup.sh`

### ❌ Portas já estão em uso

**Solução Automática**:
O script `setup.sh` já libera as portas automaticamente.

**Solução Manual**:
```bash
# Liberar porta 3000 (Frontend)
lsof -ti:3000 | xargs kill -9

# Liberar porta 8055 (Directus)
lsof -ti:8055 | xargs kill -9

# Liberar porta 5432 (PostgreSQL)
lsof -ti:5432 | xargs kill -9

# Liberar porta 6379 (Redis)
lsof -ti:6379 | xargs kill -9
```

### ❌ Erro ao instalar dependências

**Limpar tudo e tentar novamente**:
```bash
# Parar tudo
./stop.sh

# Limpar node_modules
rm -rf node_modules frontend/node_modules webscraper-service/node_modules

# Limpar caches
pnpm store prune
npm cache clean --force

# Rodar setup
bash setup.sh
```

### ❌ Containers Docker não iniciam

**Ver logs**:
```bash
docker compose logs -f directus
docker compose logs -f db
docker compose logs -f redis
```

**Reiniciar containers**:
```bash
docker compose down -v
docker compose up -d
```

### ❌ Banco de dados não está populado

**Executar migrations e seeds manualmente**:
```bash
# Migration
docker compose exec -T db psql -U directus -d directus < database/migrations/001_initial_schema.sql

# Seed
docker compose exec -T db psql -U directus -d directus < database/seeds/001_initial_data.sql
```

### ❌ Frontend não carrega

**Verificar se está rodando**:
```bash
ps aux | grep "next dev"
```

**Reiniciar frontend**:
```bash
# Matar processos
pkill -f "next dev"
pkill -f "pnpm dev"

# Ir para o diretório
cd frontend

# Instalar dependências
pnpm install --no-frozen-lockfile

# Iniciar
pnpm dev
```

**Ver logs**:
```bash
tail -f frontend.log
```

### ❌ Directus Admin não carrega

**Verificar se está rodando**:
```bash
curl http://localhost:8055/server/health
```

**Verificar logs**:
```bash
docker compose logs -f directus
```

**Reiniciar Directus**:
```bash
docker compose restart directus
```

### ❌ Erro: "EADDRINUSE: address already in use"

**Liberar porta específica**:
```bash
# Descobrir qual processo está usando a porta
lsof -i :PORTA

# Matar o processo (substitua PID pelo número do processo)
kill -9 PID
```

### ❌ Erro de permissão no Docker (Linux)

```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Fazer logout e login novamente
# Ou executar:
newgrp docker

# Testar
docker ps
```

### ❌ Webscrapers não importam notícias

**Verificar token**:
```bash
# Ver arquivo .env do webscraper
cat webscraper-service/.env | grep DIRECTUS_TOKEN
```

**Gerar novo token manualmente**:
1. Acesse [http://localhost:8055/admin](http://localhost:8055/admin)
2. Faça login
3. Vá em Settings > Access Tokens
4. Gere um novo token
5. Copie o token
6. Edite `webscraper-service/.env` e cole o token em `DIRECTUS_TOKEN`

**Testar webscraper**:
```bash
cd webscraper-service
node g1.js
```

### ❌ Frontend mostra "Erro ao carregar notícias"

**Verificar se há notícias no banco**:
```bash
curl http://localhost:8055/items/noticias
```

**Verificar se as categorias existem**:
```bash
curl http://localhost:8055/items/categorias
```

**Se não houver dados, popular manualmente**:
```bash
docker compose exec -T db psql -U directus -d directus < database/seeds/001_initial_data.sql
```

### ❌ Notícias não aparecem na categoria certa

**Verificar estrutura do banco**:
```bash
# Verificar se as categorias foram criadas
docker compose exec db psql -U directus -d directus -c "SELECT * FROM categorias;"

# Verificar notícias e suas categorias
docker compose exec db psql -U directus -d directus -c "SELECT id, titulo, categoria FROM noticias LIMIT 5;"
```

## 🔍 Diagnóstico Completo

Execute o diagnóstico completo:
```bash
./diagnose.sh
```

Este script verifica:
- Docker
- Docker Compose
- Node.js
- pnpm/npm
- Portas
- Arquivos de configuração
- Espaço em disco
- Memória

## 🆘 Suporte Adicional

Se nenhuma das soluções acima funcionar:

1. **Execute o diagnóstico**:
   ```bash
   ./diagnose.sh > diagnostico.txt
   ```

2. **Colete os logs**:
   ```bash
   docker compose logs > docker-logs.txt
   tail -100 frontend.log > frontend-logs.txt
   ```

3. **Abra uma issue** no GitHub com:
   - Arquivo `diagnostico.txt`
   - Arquivo `docker-logs.txt`
   - Arquivo `frontend-logs.txt`
   - Descrição do problema
   - Sistema operacional

## 💡 Dicas

### Reiniciar do Zero

```bash
# 1. Parar tudo
./stop.sh

# 2. Remover containers e volumes
docker compose down -v

# 3. Limpar dependências
rm -rf node_modules frontend/node_modules webscraper-service/node_modules

# 4. Limpar caches
pnpm store prune
npm cache clean --force

# 5. Rodar setup
bash setup.sh
```

### Verificar Saúde dos Serviços

```bash
./health-check.sh
```

### Ver Logs em Tempo Real

```bash
# Frontend
tail -f frontend.log

# Directus
docker compose logs -f directus

# PostgreSQL
docker compose logs -f db

# Todos
docker compose logs -f
```

### Acessar o Banco de Dados Diretamente

```bash
docker compose exec db psql -U directus -d directus
```

Depois execute comandos SQL:
```sql
-- Ver todas as categorias
SELECT * FROM categorias;

-- Ver todas as notícias
SELECT id, titulo, categoria, status FROM noticias;

-- Ver autores
SELECT * FROM autores;
```

## 📚 Recursos Adicionais

- [Guia de Setup](SETUP-GUIDE.md)
- [Documentação do Directus](https://docs.directus.io/)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Docker](https://docs.docker.com/)

---

**💪 Não desista! Se você seguir os passos acima, vai conseguir resolver!**

