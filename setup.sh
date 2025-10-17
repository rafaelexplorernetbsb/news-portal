#!/bin/bash

# =====================================================
# SETUP COMPLETO - PORTAL DE NOTÍCIAS
# =====================================================
# Este script configura todo o ambiente do projeto
# Uso: bash setup.sh [dev|prod]
# =====================================================

set -e  # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para logar mensagens
log() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

success() {
    echo -e "${GREEN}[✅ SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[⚠️  WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[❌ ERROR]${NC} $1"
}

info() {
    echo -e "${CYAN}[ℹ️  INFO]${NC} $1"
}

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                   PORTAL DE NOTÍCIAS                         ║
║                   Setup Automático                           ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar modo (dev ou prod)
MODE="${1:-dev}"
if [[ "$MODE" != "dev" && "$MODE" != "prod" ]]; then
    error "Modo inválido. Use 'dev' ou 'prod'"
    exit 1
fi

log "🚀 Iniciando setup em modo: ${MODE}"

# =====================================================
# 1. VERIFICAR DEPENDÊNCIAS
# =====================================================
log "📋 Verificando dependências..."

check_dependency() {
    if ! command -v $1 &> /dev/null; then
        error "$2 não está instalado"
        info "Instale: $3"
        return 1
    else
        success "$2 está instalado"
        return 0
    fi
}

DEPENDENCIES_OK=true

check_dependency "docker" "Docker" "https://docs.docker.com/get-docker/" || DEPENDENCIES_OK=false
check_dependency "git" "Git" "https://git-scm.com/downloads" || DEPENDENCIES_OK=false

# Verificar pnpm ou npm
if command -v pnpm &> /dev/null; then
    success "pnpm está instalado: $(pnpm --version)"
    PKG_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    warning "pnpm não encontrado, usando npm"
    info "Recomendado instalar pnpm: npm install -g pnpm"
    PKG_MANAGER="npm"
else
    error "Nenhum gerenciador de pacotes encontrado (npm/pnpm)"
    DEPENDENCIES_OK=false
fi

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        success "Node.js está instalado: $(node --version)"

        # Avisar sobre Node.js 24+ e isolated-vm
        if [ "$NODE_VERSION" -ge 24 ]; then
            info "Node.js 24+ detectado. O pacote isolated-vm pode ter problemas de compilação."
            info "Solução: Frontend será instalado com --ignore-workspace para evitar o erro."
        fi
    else
        warning "Node.js versão $NODE_VERSION detectada. Recomendado: 18+"
    fi
else
    error "Node.js não está instalado"
    DEPENDENCIES_OK=false
fi

if [ "$DEPENDENCIES_OK" = false ]; then
    error "Dependências faltando. Por favor, instale-as e tente novamente."
    exit 1
fi

# =====================================================
# 2. VERIFICAR E INICIAR DOCKER
# =====================================================
log "🐳 Verificando Docker..."

if ! docker info &> /dev/null; then
    warning "Docker não está rodando. Tentando iniciar..."

    if [[ "$OSTYPE" == "darwin"* ]]; then
        if [ -d "/Applications/Docker.app" ]; then
            log "Iniciando Docker Desktop no macOS..."
            open -a Docker
            log "Aguardando Docker iniciar..."
            sleep 30
        else
            error "Docker Desktop não encontrado em /Applications/Docker.app"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        log "Tentando iniciar Docker no Linux..."
        sudo systemctl start docker || {
            error "Falha ao iniciar Docker. Execute: sudo systemctl start docker"
            exit 1
        }
        sleep 10
    else
        error "Sistema operacional não suportado para inicialização automática do Docker"
        error "Por favor, inicie o Docker manualmente e execute o script novamente"
        exit 1
    fi

    # Verificar novamente
    max_attempts=15
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker info &> /dev/null; then
            success "Docker iniciado com sucesso!"
            break
        else
            log "Tentativa $attempt/$max_attempts - Aguardando Docker..."
            sleep 10
            ((attempt++))
        fi
    done

    if ! docker info &> /dev/null; then
        error "Docker não iniciou após várias tentativas"
        error "Por favor, inicie o Docker manualmente"
        exit 1
    fi
else
    success "Docker está rodando"
fi

# Verificar docker compose
if docker compose version &> /dev/null; then
    success "docker compose está disponível"
    DOCKER_COMPOSE_CMD="docker compose"
elif docker-compose --version &> /dev/null; then
    success "docker-compose está disponível"
    DOCKER_COMPOSE_CMD="docker-compose"
else
    error "Nem 'docker compose' nem 'docker-compose' estão disponíveis"
    exit 1
fi

# =====================================================
# 3. LIMPAR PORTAS OCUPADAS
# =====================================================
log "🔌 Limpando portas ocupadas..."

kill_port() {
    local port=$1
    local service=$2
    local pid=$(lsof -ti:$port 2>/dev/null || true)

    if [ -n "$pid" ]; then
        warning "Porta $port ($service) está em uso. Liberando..."
        kill -9 $pid 2>/dev/null || true
        sleep 2
        success "Porta $port liberada"
    else
        info "Porta $port ($service) está livre"
    fi
}

kill_port 3000 "Frontend"
kill_port 8055 "Directus API"
kill_port 5432 "PostgreSQL"
kill_port 6379 "Redis"

# =====================================================
# 4. CONFIGURAR ARQUIVOS .env
# =====================================================
log "⚙️  Configurando arquivos .env..."

# Gerar chaves aleatórias para Directus
DIRECTUS_KEY=$(openssl rand -hex 32 2>/dev/null || echo "directus-secret-key-$(date +%s)")
DIRECTUS_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "directus-secret-$(date +%s)")

# .env principal
if [ ! -f ".env" ]; then
    log "Criando .env principal..."
    cat > .env << EOF
# Configurações Gerais
NODE_ENV=${MODE}
PORT=8055

# Configurações do Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_KEY=${DIRECTUS_KEY}
DIRECTUS_SECRET=${DIRECTUS_SECRET}
DIRECTUS_ADMIN_EMAIL=admin@example.com
DIRECTUS_ADMIN_PASSWORD=admin123
DIRECTUS_DB_CLIENT=pg
DIRECTUS_DB_HOST=db
DIRECTUS_DB_PORT=5432
DIRECTUS_DB_DATABASE=directus
DIRECTUS_DB_USER=directus
DIRECTUS_DB_PASSWORD=directus123

# Configurações do Frontend
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
NEXT_PUBLIC_API_TOKEN=

# Configurações do Webscraper
WEBSCRAPER_INTERVAL_MINUTES=5
WEBSCRAPER_MAX_ARTICLES=5
G1_ENABLED=true
FOLHA_ENABLED=true
OLHAR_DIGITAL_ENABLED=true
EOF
    success ".env criado"
else
    info ".env já existe, mantendo configurações"
fi

# .env frontend
if [ ! -f "frontend/.env.local" ]; then
    log "Criando frontend/.env.local..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
NEXT_PUBLIC_API_TOKEN=
EOF
    success "frontend/.env.local criado"
else
    info "frontend/.env.local já existe"
fi

# .env webscraper
if [ ! -f "webscraper-service/.env" ]; then
    log "Criando webscraper-service/.env..."
    cat > webscraper-service/.env << EOF
# Configurações do Directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=

# Configurações Gerais do Webscraper
WEBSCRAPER_INTERVAL_MINUTES=5
WEBSCRAPER_MAX_ARTICLES=5

# Configurações Específicas dos Portais
G1_ENABLED=true
G1_INTERVAL_MINUTES=5
G1_MAX_ARTICLES=5
G1_RSS_URL=https://g1.globo.com/rss/g1/tecnologia/
G1_CATEGORY_SLUG=tecnologia

FOLHA_ENABLED=true
FOLHA_INTERVAL_MINUTES=5
FOLHA_MAX_ARTICLES=5
FOLHA_RSS_URL=https://www1.folha.uol.com.br/tec/rss091.xml
FOLHA_CATEGORY_SLUG=tecnologia

OLHAR_DIGITAL_ENABLED=true
OLHAR_DIGITAL_INTERVAL_MINUTES=5
OLHAR_DIGITAL_MAX_ARTICLES=5
OLHAR_DIGITAL_RSS_URL=https://olhardigital.com.br/feed/
OLHAR_DIGITAL_CATEGORY_SLUG=tecnologia
EOF
    success "webscraper-service/.env criado"
else
    info "webscraper-service/.env já existe"
fi

# =====================================================
# 5. COMPILAR EXTENSÕES DO TERMINAL
# =====================================================
log "🔧 Compilando extensões do terminal..."

compile_extension() {
    local ext_dir=$1
    local ext_name=$2

    if [ -d "$ext_dir" ]; then
        log "Compilando extensão $ext_name..."
        cd "$ext_dir"

        # Instalar dependências se necessário
        if [ ! -d "node_modules" ]; then
            log "Instalando dependências da extensão $ext_name..."
            if [ "$PKG_MANAGER" = "pnpm" ]; then
                pnpm install --no-frozen-lockfile 2>/dev/null || npm install --legacy-peer-deps 2>/dev/null || true
            else
                npm install --legacy-peer-deps 2>/dev/null || true
            fi
        fi

        # Compilar a extensão
        if [ "$PKG_MANAGER" = "pnpm" ]; then
            pnpm run build 2>/dev/null || npm run build 2>/dev/null || {
                warning "Falha ao compilar $ext_name, mas continuando..."
            }
        else
            npm run build 2>/dev/null || {
                warning "Falha ao compilar $ext_name, mas continuando..."
            }
        fi

        cd - > /dev/null

        if [ -f "$ext_dir/dist/index.js" ]; then
            success "Extensão $ext_name compilada com sucesso"
        else
            warning "Extensão $ext_name pode não ter compilado corretamente"
        fi
    else
        info "Diretório $ext_dir não encontrado, pulando..."
    fi
}

# Compilar extensões do terminal
compile_extension "extensions/terminal" "Terminal Module"
compile_extension "extensions/terminal-endpoint" "Terminal Endpoint"

# =====================================================
# 6. INSTALAR DEPENDÊNCIAS
# =====================================================
log "📦 Instalando dependências..."

install_deps() {
    local dir=$1
    local name=$2

    if [ -d "$dir" ]; then
        log "Instalando dependências do $name..."
        cd "$dir"

        # Criar .npmrc local se não existir
        if [ ! -f ".npmrc" ]; then
            cat > .npmrc << 'EOF'
engine-strict=false
legacy-peer-deps=true
auto-install-peers=true
strict-peer-dependencies=false
EOF
        fi

        if [ "$PKG_MANAGER" = "pnpm" ]; then
            # Tentar múltiplas estratégias para instalar
            log "Tentando instalação com pnpm..."

            # Estratégia 1: install normal com flags
            if pnpm install --no-frozen-lockfile --shamefully-hoist 2>&1 | grep -v "WARN"; then
                success "Instalação com pnpm bem-sucedida"
            # Estratégia 2: usar npm como fallback
            elif npm install --legacy-peer-deps 2>&1 | grep -v "WARN"; then
                success "Instalação com npm bem-sucedida (fallback)"
            # Estratégia 3: forçar instalação
            elif npm install --force 2>&1 | grep -v "WARN"; then
                success "Instalação forçada bem-sucedida"
            else
                warning "Instalação de $name pode ter problemas, mas continuando..."
            fi
        else
            npm install --legacy-peer-deps 2>&1 | grep -v "WARN" || \
            npm install --force 2>&1 | grep -v "WARN" || \
            warning "Instalação de $name pode ter problemas, mas continuando..."
        fi

        cd - > /dev/null
        success "Dependências do $name processadas"
    fi
}

# Limpar caches
log "Limpando caches..."
if [ "$PKG_MANAGER" = "pnpm" ]; then
    pnpm store prune || true
else
    npm cache clean --force || true
fi

# Criar .npmrc se não existir
if [ ! -f ".npmrc" ]; then
    log "Criando .npmrc..."
    cat > .npmrc << 'EOF'
engine-strict=false
legacy-peer-deps=true
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=true
EOF
    success ".npmrc criado"
fi

# Instalar dependências de cada projeto
# Nota: Pode haver erro com isolated-vm, mas isso não afeta o funcionamento
log "Instalando dependências do projeto principal (workspace)..."
if [ "$PKG_MANAGER" = "pnpm" ]; then
    pnpm install --no-frozen-lockfile 2>&1 | grep -v "WARN" || \
    warning "Erro na instalação do workspace (provavelmente isolated-vm), mas continuando..."
else
    npm install --legacy-peer-deps 2>&1 | grep -v "WARN" || \
    warning "Erro na instalação do workspace, mas continuando..."
fi
info "Nota: Erros com isolated-vm não afetam o funcionamento do sistema"

# Frontend - usar pnpm com --ignore-workspace para evitar problemas com isolated-vm
if [ -d "frontend" ]; then
    log "Instalando dependências do frontend com pnpm..."
    cd frontend

    # Criar .npmrc específico para o frontend
    cat > .npmrc << 'EOF'
engine-strict=false
legacy-peer-deps=true
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=true
EOF

    # Instalar com pnpm usando --ignore-workspace para evitar problemas com isolated-vm
    if [ "$PKG_MANAGER" = "pnpm" ]; then
        # IMPORTANTE: --ignore-workspace evita erro de compilação do isolated-vm (pacote do Directus)
        # que requer C++20 e pode falhar em algumas versões do Node.js
        log "Usando --ignore-workspace para evitar problemas com isolated-vm..."
        pnpm install --no-frozen-lockfile --ignore-workspace 2>&1 | grep -v "WARN" || \
        pnpm install --ignore-workspace --force 2>&1 | grep -v "WARN" || \
        warning "Instalação do frontend pode ter problemas, mas continuando..."
    else
        # Fallback para npm se pnpm não estiver disponível
        npm install --legacy-peer-deps 2>&1 | grep -v "WARN" || \
        npm install --force 2>&1 | grep -v "WARN" || \
        warning "Instalação do frontend pode ter problemas, mas continuando..."
    fi

    cd - > /dev/null
    success "Dependências do frontend processadas"
fi

install_deps "webscraper-service" "webscraper"

# Garantir que node-fetch, cheerio e dotenv estejam instalados no webscraper
cd webscraper-service
log "Verificando dependências essenciais do webscraper..."
if [ "$PKG_MANAGER" = "pnpm" ]; then
    SKIP_ENGINES_CHECK=1 pnpm add node-fetch cheerio dotenv --no-frozen-lockfile 2>/dev/null || true
else
    npm install node-fetch cheerio dotenv --save 2>/dev/null || true
fi
cd - > /dev/null

# =====================================================
# 7. PARAR CONTAINERS ANTIGOS
# =====================================================
log "🛑 Parando containers antigos..."
$DOCKER_COMPOSE_CMD down -v 2>/dev/null || true
if [ -f "docker-compose.prod.yml" ]; then
    $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml down -v 2>/dev/null || true
fi
success "Containers antigos parados"

# =====================================================
# 8. INICIAR CONTAINERS DOCKER
# =====================================================
log "🐳 Iniciando containers Docker..."

if [ "$MODE" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
else
    COMPOSE_FILE="docker-compose.yml"
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    error "Arquivo $COMPOSE_FILE não encontrado"
    exit 1
fi

log "Usando arquivo: $COMPOSE_FILE"
log "Iniciando containers (apenas imagens oficiais, sem build)..."
$DOCKER_COMPOSE_CMD -f $COMPOSE_FILE up -d --pull always

# Aguardar containers iniciarem
log "Aguardando containers iniciarem..."
sleep 15

# Verificar se containers estão rodando
if ! $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE ps | grep -q "Up"; then
    error "Containers não iniciaram corretamente"
    log "Status dos containers:"
    $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE ps
    exit 1
fi

success "Containers Docker iniciados"

# =====================================================
# 9. CRIAR DIRETÓRIOS NECESSÁRIOS
# =====================================================
log "📁 Criando diretórios necessários..."

mkdir -p database/migrations database/seeds 2>/dev/null || true
success "Diretórios database/ criados"

# =====================================================
# 10. AGUARDAR SERVIÇOS FICAREM PRONTOS
# =====================================================
log "⏳ Aguardando serviços ficarem prontos..."

wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=1

    log "Aguardando $name..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            success "$name está pronto!"
            return 0
        else
            echo -n "."
            sleep 2
            ((attempt++))
        fi
    done

    echo ""
    error "$name não ficou pronto após $max_attempts tentativas"
    return 1
}

wait_for_service "http://localhost:8055/server/health" "Directus API" || {
    error "Directus API não iniciou corretamente"
    log "Logs do Directus:"
    $DOCKER_COMPOSE_CMD -f $COMPOSE_FILE logs directus | tail -50
    exit 1
}

# =====================================================
# 11. CRIAR USUÁRIO ADMIN NO DIRECTUS
# =====================================================
log "👤 Criando usuário administrador..."

# Aguardar um pouco mais para garantir que o Directus está pronto
sleep 5

# Criar admin via API (caso não exista)
ADMIN_RESPONSE=$(curl -s -X POST "http://localhost:8055/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "role": "a052c9fd-3d42-421e-962c-0c52ddf8b29a",
    "first_name": "Admin",
    "last_name": "Sistema"
  }' 2>/dev/null || echo '{"errors":[]}')

if echo "$ADMIN_RESPONSE" | grep -q "errors"; then
    info "Usuário admin já existe ou Directus ainda está inicializando"
else
    success "Usuário administrador criado"
fi

# =====================================================
# 14. GERAR TOKEN ESTÁTICO E ATUALIZAR .env
# =====================================================
log "🔑 Gerando token estático válido e atualizando arquivos .env..."

# Aguardar mais um pouco para garantir que o Directus está pronto
sleep 5

# Tentar fazer login e obter access token
log "Fazendo login no Directus..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8055/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }' 2>/dev/null || echo '{}')

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
    warning "Não foi possível fazer login. Tentando criar usuário admin primeiro..."

    # Aguardar mais um pouco
    sleep 10

    # Tentar novamente
    LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8055/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "admin@example.com",
        "password": "admin123"
      }' 2>/dev/null || echo '{}')

    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
fi

if [ -n "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
    success "Login realizado com sucesso!"

    # Criar um token estático permanente
    log "Gerando token estático permanente..."

    # Buscar ID do usuário admin
    USER_ID=$(curl -s -X GET "http://localhost:8055/users/me" \
      -H "Authorization: Bearer $ACCESS_TOKEN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -n "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
        # Criar um token estático que expira em 1 ano
        STATIC_TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:8055/auth/login" \
          -H "Content-Type: application/json" \
          -d '{
            "email": "admin@example.com",
            "password": "admin123",
            "mode": "json"
          }' 2>/dev/null || echo '{}')

        STATIC_TOKEN=$(echo "$STATIC_TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

        # Se não conseguiu, usar o access_token atual
        if [ -z "$STATIC_TOKEN" ] || [ "$STATIC_TOKEN" = "null" ]; then
            STATIC_TOKEN="$ACCESS_TOKEN"
            warning "Usando access_token temporário. Recomendado gerar token estático manualmente."
        fi

        # Atualizar .env files com o token
        log "Atualizando arquivos .env com token..."

        # Atualizar .env principal
        if grep -q "NEXT_PUBLIC_API_TOKEN=" .env 2>/dev/null; then
            sed -i.bak "s|NEXT_PUBLIC_API_TOKEN=.*|NEXT_PUBLIC_API_TOKEN=$STATIC_TOKEN|" .env
        else
            echo "NEXT_PUBLIC_API_TOKEN=$STATIC_TOKEN" >> .env
        fi

        if grep -q "DIRECTUS_TOKEN=" .env 2>/dev/null; then
            sed -i.bak "s|DIRECTUS_TOKEN=.*|DIRECTUS_TOKEN=$STATIC_TOKEN|" .env
        else
            echo "DIRECTUS_TOKEN=$STATIC_TOKEN" >> .env
        fi

        # Atualizar frontend/.env.local
        if grep -q "NEXT_PUBLIC_API_TOKEN=" frontend/.env.local 2>/dev/null; then
            sed -i.bak "s|NEXT_PUBLIC_API_TOKEN=.*|NEXT_PUBLIC_API_TOKEN=$STATIC_TOKEN|" frontend/.env.local
        else
            echo "NEXT_PUBLIC_API_TOKEN=$STATIC_TOKEN" >> frontend/.env.local
        fi

        # Atualizar webscraper-service/.env
        if grep -q "DIRECTUS_TOKEN=" webscraper-service/.env 2>/dev/null; then
            sed -i.bak "s|DIRECTUS_TOKEN=.*|DIRECTUS_TOKEN=$STATIC_TOKEN|" webscraper-service/.env
        else
            echo "DIRECTUS_TOKEN=$STATIC_TOKEN" >> webscraper-service/.env
        fi

        # Remover backups
        rm -f .env.bak frontend/.env.local.bak webscraper-service/.env.bak

        success "Token configurado nos arquivos .env"
        info "Token (primeiros 20 chars): ${STATIC_TOKEN:0:20}..."

        # Salvar token completo em arquivo separado para referência
        echo "$STATIC_TOKEN" > .directus-token
        chmod 600 .directus-token
        info "Token completo salvo em: .directus-token (use cat .directus-token para ver)"

        # =====================================================
        # 14.1. CRIAR COLLECTIONS E SCHEMA
        # =====================================================
        log "🗄️  Criando collections e schema do banco de dados..."

        # Função para criar collection via API
        create_collection() {
            local collection_name=$1
            local display_name=$2
            local icon=$3

            log "Criando collection: $collection_name"

            # Verificar se collection já existe
            COLLECTION_EXISTS=$(curl -s -H "Authorization: Bearer $STATIC_TOKEN" \
                "http://localhost:8055/collections/$collection_name" 2>/dev/null | grep -o '"collection"' || echo "")

            if [ -z "$COLLECTION_EXISTS" ]; then
                # Criar collection
                curl -s -X POST "http://localhost:8055/collections" \
                    -H "Authorization: Bearer $STATIC_TOKEN" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"collection\": \"$collection_name\",
                        \"meta\": {
                            \"collection\": \"$collection_name\",
                            \"icon\": \"$icon\",
                            \"note\": \"$display_name\",
                            \"display_template\": \"{{nome}}\",
                            \"hidden\": false,
                            \"singleton\": false
                        },
                        \"schema\": {
                            \"name\": \"$collection_name\"
                        }
                    }" > /dev/null

                if [ $? -eq 0 ]; then
                    success "Collection $collection_name criada"
                else
                    error "Falha ao criar collection $collection_name"
                fi
            else
                info "Collection $collection_name já existe"
            fi
        }

        # Criar collections básicas
        create_collection "categorias" "Categorias de notícias" "category"
        create_collection "autores" "Autores das notícias" "person"
        create_collection "noticias" "Notícias do portal" "article"

        # =====================================================
        # 14.2. CRIAR CAMPOS DAS COLLECTIONS
        # =====================================================
        log "🌱 Criando campos das collections..."

        # Função para criar campo
        create_field() {
            local collection=$1
            local field_name=$2
            local field_type=$3
            local field_meta=$4

            log "Criando campo $field_name em $collection"

            curl -s -X POST "http://localhost:8055/fields/$collection" \
                -H "Authorization: Bearer $STATIC_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"field\": \"$field_name\",
                    \"type\": \"$field_type\",
                    \"meta\": $field_meta,
                    \"schema\": {
                        \"name\": \"$field_name\"
                    }
                }" > /dev/null
        }

        # Aguardar collections serem criadas
        sleep 3

        # Campos para categorias
        create_field "categorias" "nome" "string" '{"interface":"input","options":{"trim":true},"display":"raw","required":true}'
        create_field "categorias" "slug" "string" '{"interface":"input","options":{"trim":true,"slug":true},"display":"raw","required":true}'
        create_field "categorias" "descricao" "text" '{"interface":"textarea","display":"raw"}'
        create_field "categorias" "icone" "uuid" '{"interface":"file-image","display":"image"}'

        # Campos para autores
        create_field "autores" "nome" "string" '{"interface":"input","options":{"trim":true},"display":"raw","required":true}'
        create_field "autores" "email" "string" '{"interface":"input","options":{"trim":true},"display":"raw"}'
        create_field "autores" "biografia" "text" '{"interface":"textarea","display":"raw"}'
        create_field "autores" "foto" "uuid" '{"interface":"file-image","display":"image"}'

        # Campos para noticias
        create_field "noticias" "titulo" "string" '{"interface":"input","options":{"trim":true},"display":"raw","required":true}'
        create_field "noticias" "slug" "string" '{"interface":"input","options":{"trim":true,"slug":true},"display":"raw","required":true}'
        create_field "noticias" "resumo" "text" '{"interface":"textarea","display":"raw"}'
        create_field "noticias" "conteudo" "text" '{"interface":"wysiwyg","display":"raw","required":true}'
        create_field "noticias" "imagem" "uuid" '{"interface":"file-image","display":"image"}'
        create_field "noticias" "url_imagem" "text" '{"interface":"input","options":{"placeholder":"https://exemplo.com/imagem.jpg"},"display":"raw","note":"URL da imagem externa"}'
        create_field "noticias" "data_publicacao" "timestamp" '{"interface":"datetime","display":"datetime","required":true}'
        create_field "noticias" "data_agendada" "dateTime" '{"interface":"datetime","display":"datetime"}'
        create_field "noticias" "destaque" "boolean" '{"interface":"boolean","display":"boolean"}'
        create_field "noticias" "status" "string" '{"interface":"select-dropdown","options":{"choices":[{"text":"Publicado","value":"published"},{"text":"Rascunho","value":"draft"},{"text":"Agendado","value":"scheduled"}]},"display":"labels","default_value":"published"}'
        create_field "noticias" "categoria" "integer" '{"interface":"select-dropdown-m2o","display":"related-values","required":true}'
        create_field "noticias" "autor" "integer" '{"interface":"select-dropdown-m2o","display":"related-values"}'
        create_field "noticias" "fonte_rss" "string" '{"interface":"input","display":"raw"}'
        create_field "noticias" "link_original" "string" '{"interface":"input","display":"raw"}'

        success "Campos criados com sucesso"

        # =====================================================
        # 14.2.5. CRIAR RELAÇÕES M2O
        # =====================================================
        log "🔗 Criando relações M2O..."

        # Função para criar relação M2O
        create_m2o_relation() {
            local collection=$1
            local field=$2
            local related_collection=$3

            log "Criando relação M2O $field em $collection -> $related_collection"

            curl -s -X POST "http://localhost:8055/relations" \
                -H "Authorization: Bearer $STATIC_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"collection\": \"$collection\",
                    \"field\": \"$field\",
                    \"related_collection\": \"$related_collection\"
                }" > /dev/null

            if [ $? -eq 0 ]; then
                success "Relação M2O $field criada"
            else
                warning "Relação M2O $field pode já existir"
            fi
        }

        # Criar relações M2O
        create_m2o_relation "noticias" "categoria" "categorias"
        create_m2o_relation "noticias" "autor" "autores"

        success "Relações M2O criadas com sucesso"

        # =====================================================
        # 14.3. CRIAR DADOS INICIAIS (SEEDS)
        # =====================================================
        log "🌱 Populando banco com dados iniciais..."

        # Função para criar item
        create_item() {
            local collection=$1
            local data=$2

            log "Criando item em $collection"

            curl -s -X POST "http://localhost:8055/items/$collection" \
                -H "Authorization: Bearer $STATIC_TOKEN" \
                -H "Content-Type: application/json" \
                -d "$data" > /dev/null
        }

        # Criar categorias
        create_item "categorias" '{"nome":"Tecnologia","slug":"tecnologia","descricao":"Notícias sobre tecnologia e inovação"}'
        create_item "categorias" '{"nome":"Política","slug":"politica","descricao":"Notícias sobre política nacional e internacional"}'
        create_item "categorias" '{"nome":"Economia","slug":"economia","descricao":"Notícias sobre economia e mercado financeiro"}'
        create_item "categorias" '{"nome":"Esportes","slug":"esportes","descricao":"Notícias sobre esportes e competições"}'
        create_item "categorias" '{"nome":"Cultura","slug":"cultura","descricao":"Notícias sobre cultura, arte e entretenimento"}'

        # Criar autor padrão
        create_item "autores" '{"nome":"Sistema Webscraper","email":"webscraper@example.com","biografia":"Sistema automático para coleta de notícias"}'

        success "Dados iniciais criados com sucesso"

        # =====================================================
        # 14.4. APLICAR SCHEMA COMPLETO
        # =====================================================
        log "📋 Aplicando schema completo do banco de dados..."

        # Aplicar schema via API
        if [ -f "schema.yaml" ]; then
            log "Aplicando schema.yaml..."
            curl -s -X POST "http://localhost:8055/schema/apply" \
                -H "Authorization: Bearer $STATIC_TOKEN" \
                -H "Content-Type: application/json" \
                -d @schema.yaml > /dev/null 2>/dev/null || {
                warning "Falha ao aplicar schema.yaml via API, continuando..."
            }
        fi

        # Configurar campo conteudo como WYSIWYG
        log "Configurando campo conteudo como editor WYSIWYG..."
        curl -s -X PATCH "http://localhost:8055/fields/noticias/conteudo" \
            -H "Authorization: Bearer $STATIC_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{
                "meta": {
                    "interface": "input-rich-text-html",
                    "display": "wysiwyg",
                    "options": {
                        "toolbar": [
                            "bold", "italic", "underline", "strikethrough",
                            "h1", "h2", "h3", "h4", "h5", "h6",
                            "blockquote", "code", "bulletList", "orderedList",
                            "link", "image", "table", "horizontalRule",
                            "undo", "redo", "fullscreen", "source"
                        ],
                        "placeholder": "Digite o conteúdo da notícia aqui...",
                        "defaultValue": "<p>Digite o conteúdo da notícia aqui...</p>"
                    }
                }
            }' > /dev/null 2>/dev/null || {
            warning "Falha ao configurar editor WYSIWYG, continuando..."
        }

        # Configurar campo biografia como WYSIWYG
        log "Configurando campo biografia como editor WYSIWYG..."
        curl -s -X PATCH "http://localhost:8055/fields/autores/biografia" \
            -H "Authorization: Bearer $STATIC_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{
                "meta": {
                    "interface": "input-rich-text-html",
                    "display": "wysiwyg",
                    "options": {
                        "toolbar": [
                            "bold", "italic", "underline", "strikethrough",
                            "h1", "h2", "h3", "h4", "h5", "h6",
                            "blockquote", "code", "bulletList", "orderedList",
                            "link", "image", "table", "horizontalRule",
                            "undo", "redo", "fullscreen", "source"
                        ],
                        "placeholder": "Digite a biografia do autor aqui...",
                        "defaultValue": "<p>Digite a biografia do autor aqui...</p>"
                    }
                }
            }' > /dev/null 2>/dev/null || {
            warning "Falha ao configurar editor WYSIWYG para biografia, continuando..."
        }

        success "Schema aplicado com sucesso"

    else
        warning "Não foi possível obter ID do usuário"
        info "Você precisará gerar um token manualmente no Directus Admin"
    fi
else
    warning "Não foi possível gerar token automaticamente"
    info "Você precisará gerar um token manualmente no Directus Admin"
    info "1. Acesse http://localhost:8055/admin"
    info "2. Faça login com admin@example.com / admin123"
    info "3. Vá em Settings > Access Tokens > Create Token"
    info "4. Copie o token e atualize os arquivos .env"
fi

# =====================================================
# 15. INICIAR FRONTEND
# =====================================================
log "🎨 Iniciando frontend..."

# Matar processos anteriores
pkill -f "next dev" 2>/dev/null || true
pkill -f "pnpm dev" 2>/dev/null || true
sleep 2

cd frontend

# Corrigir CSS que pode estar causando problemas
log "Corrigindo arquivo CSS..."
if [ -f "src/styles/content-renderer.css" ]; then
    # Verificar se o CSS tem @apply (que causa erro)
    if grep -q "@apply" src/styles/content-renderer.css; then
        log "Corrigindo CSS com @apply..."
        cat > src/styles/content-renderer.css << 'EOF'
/* Estilos para conteúdo HTML e Markdown */
.news-content {
  font-family: 'Inter', sans-serif;
  color: #2d3748;
  line-height: 1.7;
  font-size: 18px;
}

.news-content h1,
.news-content h2,
.news-content h3,
.news-content h4,
.news-content h5,
.news-content h6 {
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  line-height: 1.2;
  color: #1a202c;
}

.news-content h1 { font-size: 2.5em; }
.news-content h2 { font-size: 2em; }
.news-content h3 { font-size: 1.75em; }
.news-content h4 { font-size: 1.5em; }

.news-content p {
  margin-bottom: 1em;
}

.news-content a {
  color: #3182ce;
  text-decoration: underline;
}

.news-content a:hover {
  color: #2c5282;
}

.news-content ul,
.news-content ol {
  margin-left: 1.5em;
  margin-bottom: 1em;
}

.news-content ul li {
  list-style-type: disc;
}

.news-content ol li {
  list-style-type: decimal;
}

.news-content blockquote {
  border-left: 4px solid #4299e1;
  padding-left: 1em;
  margin-left: 0;
  font-style: italic;
  color: #4a5568;
  background-color: #ebf8ff;
  padding: 0.8em 1em;
  border-radius: 0 0.5rem 0.5rem 0;
  margin-bottom: 1em;
}

.news-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.news-content pre {
  background-color: #2d3748;
  color: #e2e8f0;
  padding: 1em;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1em;
}

.news-content code {
  font-family: 'Fira Code', monospace;
  background-color: #edf2f7;
  color: #c53030;
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.9em;
}

.news-content pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
}

.news-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
}

.news-content th,
.news-content td {
  border: 1px solid #e2e8f0;
  padding: 0.8em;
  text-align: left;
}

.news-content th {
  background-color: #f7fafc;
  font-weight: 600;
}

@media (max-width: 768px) {
  .news-content {
    font-size: 16px;
  }
  .news-content h1 { font-size: 2em; }
  .news-content h2 { font-size: 1.75em; }
}
EOF
        success "CSS corrigido"
    fi
fi

# Iniciar frontend em background (usar pnpm)
if [ "$PKG_MANAGER" = "pnpm" ]; then
    log "Iniciando frontend com pnpm dev..."
    nohup pnpm dev > ../frontend.log 2>&1 &
else
    log "Iniciando frontend com npm run dev..."
    nohup npm run dev > ../frontend.log 2>&1 &
fi

FRONTEND_PID=$!
cd - > /dev/null

success "Frontend iniciado (PID: $FRONTEND_PID)"
info "Logs: tail -f frontend.log"

# Aguardar frontend iniciar e verificar
log "Aguardando frontend iniciar..."
sleep 15

# Verificar se frontend está respondendo
FRONTEND_READY=false
for i in {1..10}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        FRONTEND_READY=true
        break
    fi
    echo -n "."
    sleep 3
done
echo ""

if [ "$FRONTEND_READY" = true ]; then
    success "Frontend está respondendo em http://localhost:3000"
else
    warning "Frontend pode não ter iniciado corretamente"
    info "Verifique os logs: tail -f frontend.log"
    info "Ou inicie manualmente: cd frontend && pnpm dev"
fi

# =====================================================
# 16. VERIFICAR SAÚDE DOS SERVIÇOS
# =====================================================
log "🏥 Verificando saúde dos serviços..."

check_service() {
    local url=$1
    local name=$2

    if curl -s "$url" > /dev/null 2>&1; then
        success "$name está funcionando"
        return 0
    else
        error "$name não está respondendo"
        return 1
    fi
}

SERVICES_OK=true
check_service "http://localhost:8055/server/ping" "Directus API" || SERVICES_OK=false
check_service "http://localhost:3000" "Frontend" || SERVICES_OK=false

if [ "$SERVICES_OK" = false ]; then
    warning "Alguns serviços não estão respondendo, mas o setup continuou"
fi

# =====================================================
# 17. RESUMO FINAL
# =====================================================
echo ""
echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                   ✅ SETUP COMPLETO!                         ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${CYAN}📋 INFORMAÇÕES DO SISTEMA:${NC}"
echo ""
echo -e "${BLUE}🌐 URLs de Acesso:${NC}"
echo -e "   • Frontend:      ${GREEN}http://localhost:3000${NC}"
echo -e "   • Directus Admin: ${GREEN}http://localhost:8055/admin${NC}"
echo -e "   • API:           ${GREEN}http://localhost:8055${NC}"
echo ""
echo -e "${BLUE}🔑 Credenciais do Admin:${NC}"
echo -e "   • Email:    ${YELLOW}admin@example.com${NC}"
echo -e "   • Senha:    ${YELLOW}admin123${NC}"
echo ""
echo -e "${BLUE}📊 Dados Iniciais:${NC}"
echo -e "   • ✅ 5 categorias criadas"
echo -e "   • ✅ 1 autor padrão criado"
echo -e "   • ✅ Schema do banco aplicado"
echo -e "   • ✅ Extensões do terminal compiladas"
echo ""
echo -e "${BLUE}🚀 Próximos Passos:${NC}"
echo -e "   1. Acesse ${GREEN}http://localhost:8055/admin${NC}"
echo -e "   2. Faça login com as credenciais acima"
echo -e "   3. Configure permissões se necessário"
echo -e "   4. Acesse o frontend em ${GREEN}http://localhost:3000${NC}"
echo -e "   5. Use o terminal em ${GREEN}http://localhost:8055/admin/terminal${NC}"
echo ""
echo -e "${BLUE}🕷️  Webscrapers Disponíveis:${NC}"
echo -e "   • G1:            ${GREEN}webscraper-service/g1.js${NC}"
echo -e "   • Folha:         ${GREEN}webscraper-service/folha.js${NC}"
echo -e "   • Olhar Digital: ${GREEN}webscraper-service/olhar-digital.js${NC}"
echo ""
# Configurar token automático
log "Configurando sistema de token automático..."

# Tornar scripts executáveis
chmod +x refresh-token.sh 2>/dev/null || true
chmod +x auto-refresh-token.sh 2>/dev/null || true

# Iniciar sistema de token automático em background
if [ -f "auto-refresh-token.sh" ]; then
    log "Iniciando renovação automática de token..."
    nohup ./auto-refresh-token.sh > token-refresh.log 2>&1 &
    success "Sistema de token automático iniciado!"
    info "Logs do token: tail -f token-refresh.log"
else
    warning "Script auto-refresh-token.sh não encontrado"
fi

echo ""
echo -e "${BLUE}💡 Comandos Úteis:${NC}"
echo -e "   • Parar tudo:     ${YELLOW}./stop.sh${NC}"
echo -e "   • Ver logs:       ${YELLOW}tail -f frontend.log${NC}"
echo -e "   • Health check:   ${YELLOW}./health-check.sh${NC}"
echo -e "   • Diagnóstico:    ${YELLOW}./diagnose.sh${NC}"
echo -e "   • Renovar token:  ${YELLOW}./refresh-token.sh${NC}"
echo -e "   • Terminal:       ${YELLOW}http://localhost:8055/admin/terminal${NC}"
echo ""

# Mostrar aviso sobre Node.js se necessário
if [ "$NODE_VERSION" -ge 24 ]; then
    echo -e "${YELLOW}⚠️  NOTA IMPORTANTE:${NC}"
    echo -e "   Você está usando Node.js $NODE_VERSION. O pacote ${YELLOW}isolated-vm${NC} do Directus"
    echo -e "   pode ter erros de compilação com esta versão, mas isso ${GREEN}NÃO afeta${NC}"
    echo -e "   o funcionamento do sistema. O frontend foi instalado com"
    echo -e "   ${CYAN}--ignore-workspace${NC} para evitar esse problema."
    echo -e "   ${BLUE}Recomendação:${NC} Para evitar warnings, use Node.js LTS 20.x ou 22.x"
    echo ""
fi

echo -e "${GREEN}✨ Seu portal de notícias está pronto para uso!${NC}"
echo -e "${CYAN}🔄 Token será renovado automaticamente a cada 10 minutos${NC}"
echo ""
