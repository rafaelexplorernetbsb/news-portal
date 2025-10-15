#!/bin/bash

# Script para renovar token automaticamente a cada 10 minutos
# Execute: ./auto-refresh-token.sh

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[AUTO-TOKEN]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AUTO-TOKEN]${NC} ⚠️  $1"
}

error() {
    echo -e "${RED}[AUTO-TOKEN]${NC} ❌ $1"
}

# Carregar variáveis de ambiente
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    error "Arquivo .env não encontrado na raiz do projeto."
    exit 1
fi

DIRECTUS_URL=${DIRECTUS_URL:-http://localhost:8055}
ADMIN_EMAIL=${DIRECTUS_ADMIN_EMAIL:-admin@example.com}
ADMIN_PASSWORD=${DIRECTUS_ADMIN_PASSWORD:-admin123}

log "🔄 Iniciando renovação automática de token (a cada 10 minutos)"
log "Pressione Ctrl+C para parar"

while true; do
    log "Renovando token..."

    # Fazer login
    LOGIN_RESPONSE=$(curl -s -X POST "${DIRECTUS_URL}/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "'"${ADMIN_EMAIL}"'",
        "password": "'"${ADMIN_PASSWORD}"'"
      }' || echo '{}')

    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        error "Não foi possível obter o token de acesso"
        sleep 60
        continue
    fi

    log "✅ Token renovado com sucesso!"

    # Atualizar .env principal
    sed -i.bak "s|NEXT_PUBLIC_API_TOKEN=.*|NEXT_PUBLIC_API_TOKEN=$ACCESS_TOKEN|" .env
    sed -i.bak "s|DIRECTUS_TOKEN=.*|DIRECTUS_TOKEN=$ACCESS_TOKEN|" .env
    rm -f .env.bak

    # Atualizar frontend/.env.local
    if [ -f "frontend/.env.local" ]; then
        sed -i.bak "s|NEXT_PUBLIC_API_TOKEN=.*|NEXT_PUBLIC_API_TOKEN=$ACCESS_TOKEN|" frontend/.env.local
        rm -f frontend/.env.local.bak
    fi

    # Atualizar webscraper-service/.env
    if [ -f "webscraper-service/.env" ]; then
        sed -i.bak "s|DIRECTUS_TOKEN=.*|DIRECTUS_TOKEN=$ACCESS_TOKEN|" webscraper-service/.env
        rm -f webscraper-service/.env.bak
    fi

    log "🕐 Aguardando 10 minutos para próxima renovação..."
    sleep 600  # 10 minutos
done
