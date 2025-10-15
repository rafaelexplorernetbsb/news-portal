#!/bin/bash

# =====================================================
# ATUALIZAR TOKEN DO DIRECTUS
# =====================================================
# Este script gera um novo token válido e atualiza todos os .env

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[TOKEN]${NC} $1"; }
error() { echo -e "${RED}[ERRO]${NC} $1"; }
warning() { echo -e "${YELLOW}[AVISO]${NC} $1"; }

# Verificar se Directus está rodando
if ! curl -s http://localhost:8055/server/ping > /dev/null 2>&1; then
    error "Directus não está rodando. Execute: ./setup.sh dev"
    exit 1
fi

# Fazer login e obter token
log "Fazendo login no Directus..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8055/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }' 2>/dev/null)

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
    error "Não foi possível obter o token. Verifique as credenciais."
    exit 1
fi

log "Token obtido com sucesso!"

# Atualizar .env principal
if [ -f ".env" ]; then
    log "Atualizando .env..."
    if grep -q "NEXT_PUBLIC_API_TOKEN=" .env; then
        sed -i.bak "s|NEXT_PUBLIC_API_TOKEN=.*|NEXT_PUBLIC_API_TOKEN=$ACCESS_TOKEN|" .env
    else
        echo "NEXT_PUBLIC_API_TOKEN=$ACCESS_TOKEN" >> .env
    fi

    if grep -q "DIRECTUS_TOKEN=" .env; then
        sed -i.bak "s|DIRECTUS_TOKEN=.*|DIRECTUS_TOKEN=$ACCESS_TOKEN|" .env
    else
        echo "DIRECTUS_TOKEN=$ACCESS_TOKEN" >> .env
    fi
    rm -f .env.bak
fi

# Atualizar frontend/.env.local
if [ -f "frontend/.env.local" ]; then
    log "Atualizando frontend/.env.local..."
    if grep -q "NEXT_PUBLIC_API_TOKEN=" frontend/.env.local; then
        sed -i.bak "s|NEXT_PUBLIC_API_TOKEN=.*|NEXT_PUBLIC_API_TOKEN=$ACCESS_TOKEN|" frontend/.env.local
    else
        echo "NEXT_PUBLIC_API_TOKEN=$ACCESS_TOKEN" >> frontend/.env.local
    fi
    rm -f frontend/.env.local.bak
fi

# Atualizar webscraper-service/.env
if [ -f "webscraper-service/.env" ]; then
    log "Atualizando webscraper-service/.env..."
    if grep -q "DIRECTUS_TOKEN=" webscraper-service/.env; then
        sed -i.bak "s|DIRECTUS_TOKEN=.*|DIRECTUS_TOKEN=$ACCESS_TOKEN|" webscraper-service/.env
    else
        echo "DIRECTUS_TOKEN=$ACCESS_TOKEN" >> webscraper-service/.env
    fi
    rm -f webscraper-service/.env.bak
fi

echo ""
log "✅ Token atualizado em todos os arquivos .env!"
log "Token: ${ACCESS_TOKEN:0:20}..."
echo ""
log "💡 Para usar este token manualmente, execute: cat .env | grep NEXT_PUBLIC_API_TOKEN"

