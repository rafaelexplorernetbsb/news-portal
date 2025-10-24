#!/bin/bash

# =====================================================
# SETUP DE PRODUÇÃO - PORTAL DE NOTÍCIAS
# =====================================================
# Script otimizado para deploy em produção
# Uso: bash setup-production.sh
# =====================================================

set -e  # Sair em caso de erro

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${BLUE}[SETUP]${NC} $1"; }
success() { echo -e "${GREEN}[✅]${NC} $1"; }
warning() { echo -e "${YELLOW}[⚠️ ]${NC} $1"; }
error() { echo -e "${RED}[❌]${NC} $1"; }
info() { echo -e "${CYAN}[ℹ️ ]${NC} $1"; }

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║            PORTAL DE NOTÍCIAS - SETUP PRODUÇÃO               ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# =====================================================
# 1. VERIFICAR SE ESTÁ EM PRODUÇÃO
# =====================================================
log "🔍 Verificando ambiente..."

if [ -f "/.dockerenv" ]; then
    error "Este script não deve ser executado dentro de container"
    exit 1
fi

if [ ! -f ".env" ]; then
    error "Arquivo .env não encontrado!"
    info "Copie env.prod.example para .env e configure as variáveis"
    exit 1
fi

success "Arquivo .env encontrado"

# =====================================================
# 2. VERIFICAR DEPENDÊNCIAS
# =====================================================
log "📋 Verificando dependências..."

check_dep() {
    if ! command -v $1 &> /dev/null; then
        error "$2 não instalado. Instale: $3"
        return 1
    fi
    success "$2 instalado"
    return 0
}

DEPS_OK=true
check_dep "docker" "Docker" "curl -fsSL https://get.docker.com | sh" || DEPS_OK=false
check_dep "docker-compose" "Docker Compose" "apt install docker-compose-plugin" || DEPS_OK=false
check_dep "node" "Node.js" "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -" || DEPS_OK=false
check_dep "npm" "npm" "apt install npm" || DEPS_OK=false

if [ "$DEPS_OK" = false ]; then
    error "Instale as dependências faltantes"
    exit 1
fi

# Verificar Node.js versão
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js 18+ é necessário. Versão atual: $(node --version)"
    exit 1
fi
success "Node.js versão: $(node --version)"

# =====================================================
# 3. INSTALAR PM2
# =====================================================
log "📦 Instalando PM2..."

if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    success "PM2 instalado"
else
    success "PM2 já instalado: $(pm2 --version)"
fi

# =====================================================
# 4. BUILD DO FRONTEND
# =====================================================
log "🔨 Build do frontend..."

cd frontend

# Instalar dependências
log "Instalando dependências do frontend..."
npm ci --production=false

# Build
log "Compilando frontend..."
npm run build

success "Frontend compilado"
cd ..

# =====================================================
# 5. BUILD DAS EXTENSÕES DO DIRECTUS
# =====================================================
log "🔨 Build das extensões..."

# Push Notifications
if [ -d "extensions/push-notifications" ]; then
    log "Compilando extensão push-notifications..."
    cd extensions/push-notifications
    npm ci
    npm run build
    success "Push notifications compilada"
    cd ../..
fi

# =====================================================
# 6. INICIAR SERVIÇOS COM DOCKER COMPOSE
# =====================================================
log "🐳 Iniciando serviços Docker..."

export ENV=prod
export COMPOSE_PROJECT_NAME=news-portal

# Parar containers antigos se existirem
docker-compose down 2>/dev/null || true

# Iniciar containers de produção
docker-compose --profile production up -d --pull always

# Aguardar inicialização
log "Aguardando serviços iniciarem..."
sleep 20

# Verificar se containers estão rodando
if ! docker-compose ps | grep -q "Up"; then
    error "Containers não iniciaram"
    docker-compose ps
    exit 1
fi

success "Containers Docker iniciados"

# =====================================================
# 7. EXECUTAR MIGRAÇÕES E SEEDS
# =====================================================
log "📊 Executando migrações do banco..."

# Aguardar banco estar pronto
until docker-compose exec -T db pg_isready -U directus_prod 2>/dev/null; do
    log "Aguardando PostgreSQL..."
    sleep 2
done

success "PostgreSQL pronto"

# Executar migrações
log "Rodando migrações do Directus..."
docker-compose exec -T directus npx directus database migrate:latest 2>/dev/null || warning "Migrações já aplicadas ou erro"

# Seeds (opcional em produção)
# docker-compose exec -T directus npx directus database seed 2>/dev/null || warning "Seeds não aplicados"

# =====================================================
# 8. CRIAR ADMIN USER (SE NÃO EXISTIR)
# =====================================================
log "👤 Configurando usuário admin..."

# Carregar variáveis do .env
source .env

# Verificar se admin já existe
ADMIN_EXISTS=$(docker-compose exec -T db psql -U directus_prod -d directus_prod -tAc "SELECT COUNT(*) FROM directus_users WHERE email = '$DIRECTUS_ADMIN_EMAIL';" 2>/dev/null || echo "0")

if [ "$ADMIN_EXISTS" = "0" ]; then
    log "Criando usuário admin..."
    docker-compose exec -T directus npx directus users create \
        --email "$DIRECTUS_ADMIN_EMAIL" \
        --password "$DIRECTUS_ADMIN_PASSWORD" \
        --role "Administrator" 2>/dev/null || warning "Não foi possível criar admin automaticamente"
    success "Admin criado"
else
    success "Admin já existe"
fi

# =====================================================
# 9. CRIAR TABELA PUSH_SUBSCRIPTIONS
# =====================================================
log "📱 Configurando push notifications..."

docker-compose exec -T db psql -U directus_prod -d directus_prod -c "
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint text NOT NULL UNIQUE,
    expiration_time timestamp,
    keys_p256dh text NOT NULL,
    keys_auth text NOT NULL,
    user_agent text,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);
" 2>/dev/null && success "Tabela push_subscriptions criada" || warning "Tabela já existe"

# =====================================================
# 10. CONFIGURAR PM2 PARA FRONTEND
# =====================================================
log "🚀 Configurando PM2..."

# Parar processos antigos
pm2 delete news-portal-frontend 2>/dev/null || true

# Iniciar frontend
cd frontend
pm2 start npm --name "news-portal-frontend" -- start
pm2 save

success "Frontend iniciado com PM2"
cd ..

# =====================================================
# 11. CONFIGURAR NGINX (se não estiver configurado)
# =====================================================
if [ -f "/etc/nginx/sites-available" ]; then
    log "📝 Verificando configuração Nginx..."
    
    if [ ! -f "/etc/nginx/sites-enabled/news-portal" ]; then
        warning "Nginx não configurado!"
        info "Configure manualmente usando nginx.conf.example"
        info "Ou execute: sudo cp nginx.conf.example /etc/nginx/sites-available/news-portal"
    else
        success "Nginx já configurado"
    fi
fi

# =====================================================
# 12. CONFIGURAR WEBSCRAPERS (OPCIONAL)
# =====================================================
log "🕷️  Webscrapers..."

if [ -f "start-webscrapers.sh" ]; then
    info "Para iniciar webscrapers, execute: ./start-webscrapers.sh"
fi

# =====================================================
# 13. VERIFICAR STATUS
# =====================================================
log "✅ Verificando status final..."

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉 SETUP CONCLUÍDO COM SUCESSO! 🎉              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

info "📊 STATUS DOS SERVIÇOS:"
echo ""
docker-compose ps
echo ""

info "📱 PM2 STATUS:"
pm2 status
echo ""

info "🌐 URLS:"
echo "   - Frontend: http://localhost:3000"
echo "   - Directus: http://localhost:8055"
echo ""

info "📝 PRÓXIMOS PASSOS:"
echo "   1. Configure Nginx usando nginx.conf.example"
echo "   2. Configure SSL com certbot"
echo "   3. Inicie webscrapers (opcional)"
echo "   4. Configure monitoramento"
echo ""

info "📖 COMANDOS ÚTEIS:"
echo "   - Ver logs PM2: pm2 logs"
echo "   - Ver logs Docker: docker-compose logs -f"
echo "   - Restart frontend: pm2 restart news-portal-frontend"
echo "   - Parar tudo: pm2 stop all && docker-compose down"
echo ""

success "Setup de produção finalizado!"

