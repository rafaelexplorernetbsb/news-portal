#!/bin/bash

# =====================================================
# SCRIPT DE VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE
# =====================================================

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════╗
║            VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE              ║
║                 Portal de Notícias                          ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}💡 Copie o arquivo de exemplo:${NC}"
    echo -e "   cp env.example .env.local  # Para desenvolvimento"
    echo -e "   cp env.example .env          # Para produção"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo .env encontrado${NC}\n"

# Carregar variáveis do arquivo .env
source .env

# Lista de variáveis obrigatórias
REQUIRED_VARS=(
    "DIRECTUS_URL"
    "DIRECTUS_ADMIN_EMAIL"
    "DIRECTUS_ADMIN_PASSWORD"
    "DIRECTUS_DB_DATABASE"
    "DIRECTUS_DB_USER"
    "DIRECTUS_DB_PASSWORD"
    "DIRECTUS_KEY"
    "DIRECTUS_SECRET"
    "NEXT_PUBLIC_DIRECTUS_URL"
    "NEXT_PUBLIC_SITE_URL"
    "NEXT_PUBLIC_SITE_NAME"
    "NEXT_PUBLIC_VAPID_PUBLIC_KEY"
    "VAPID_PUBLIC_KEY"
    "VAPID_PRIVATE_KEY"
)

# Lista de variáveis opcionais (mas recomendadas)
OPTIONAL_VARS=(
    "DIRECTUS_PROXY_EMAIL"
    "DIRECTUS_PROXY_PASSWORD"
    "REDIS_PASSWORD"
    "CACHE_ENABLED"
    "LOG_LEVEL"
    "RATE_LIMITER_ENABLED"
)

echo -e "${BLUE}🔍 Verificando variáveis obrigatórias...${NC}\n"

# Verificar variáveis obrigatórias
MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
        echo -e "${RED}❌ $var${NC} - Não definida"
    else
        echo -e "${GREEN}✅ $var${NC} - Definida"
    fi
done

echo ""

# Verificar variáveis opcionais
echo -e "${BLUE}🔍 Verificando variáveis opcionais...${NC}\n"

for var in "${OPTIONAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${YELLOW}⚠️  $var${NC} - Não definida (opcional)"
    else
        echo -e "${GREEN}✅ $var${NC} - Definida"
    fi
done

echo ""

# Resultado final
if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo -e "${GREEN}
╔══════════════════════════════════════════════════════════════╗
║                   ✅ VALIDAÇÃO CONCLUÍDA!                  ║
║              Todas as variáveis obrigatórias estão OK       ║
╚══════════════════════════════════════════════════════════════╝
${NC}"
    exit 0
else
    echo -e "${RED}
╔══════════════════════════════════════════════════════════════╗
║                   ❌ VALIDAÇÃO FALHOU!                      ║
║              Variáveis obrigatórias em falta:                ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

    for var in "${MISSING_VARS[@]}"; do
        echo -e "${RED}   • $var${NC}"
    done

    echo ""
    echo -e "${YELLOW}💡 Dica: Edite o arquivo .env e defina as variáveis em falta${NC}"
    exit 1
fi
