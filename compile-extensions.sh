#!/bin/bash

# Script para compilar extensões do Directus após clonar o projeto
# Uso: bash compile-extensions.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[COMPILE]${NC} $1"; }
success() { echo -e "${GREEN}[✅ SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[⚠️  WARNING]${NC} $1"; }
error() { echo -e "${RED}[❌ ERROR]${NC} $1"; }

echo -e "${BLUE}🔧 Compilando extensões do Directus...${NC}"

# Verificar se estamos no diretório correto
if [ ! -d "extensions" ]; then
    error "Diretório 'extensions' não encontrado. Execute na raiz do projeto."
    exit 1
fi

# Verificar gerenciador de pacotes
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
else
    error "Nenhum gerenciador de pacotes encontrado (npm/pnpm)"
    exit 1
fi

success "Usando $PKG_MANAGER"

# Função para compilar extensão
compile_extension() {
    local ext_dir=$1
    local ext_name=$2

    if [ -d "$ext_dir" ]; then
        log "Compilando $ext_name..."
        cd "$ext_dir"

        if [ ! -f "package.json" ]; then
            warning "package.json não encontrado em $ext_dir"
            cd - > /dev/null
            return 1
        fi

        # Instalar dependências
        if [ "$PKG_MANAGER" = "pnpm" ]; then
            pnpm install --no-frozen-lockfile --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps 2>/dev/null || true
        else
            npm install --legacy-peer-deps 2>/dev/null || true
        fi

        # Compilar
        if grep -q '"build"' package.json; then
            if [ "$PKG_MANAGER" = "pnpm" ]; then
                pnpm run build 2>/dev/null || npm run build 2>/dev/null || true
            else
                npm run build 2>/dev/null || true
            fi
        fi

        cd - > /dev/null

        if [ -f "$ext_dir/dist/index.js" ]; then
            success "$ext_name compilada com sucesso"
            return 0
        else
            warning "$ext_name não foi compilada corretamente"
            return 1
        fi
    else
        info "$ext_dir não encontrado"
        return 1
    fi
}

# Compilar extensões
EXTENSIONS_COMPILED=0

compile_extension "extensions/terminal" "Terminal Module" && EXTENSIONS_COMPILED=$((EXTENSIONS_COMPILED + 1))
compile_extension "extensions/terminal-endpoint" "Terminal Endpoint" && EXTENSIONS_COMPILED=$((EXTENSIONS_COMPILED + 1))
compile_extension "extensions/push-notifications" "Push Notifications" && EXTENSIONS_COMPILED=$((EXTENSIONS_COMPILED + 1))

echo ""
echo -e "${BLUE}📊 RESUMO:${NC}"
echo -e "   • ✅ Compiladas: ${GREEN}$EXTENSIONS_COMPILED${NC}"

if [ $EXTENSIONS_COMPILED -gt 0 ]; then
    echo ""
    echo -e "${GREEN}✨ Extensões compiladas!${NC}"
    echo -e "${BLUE}🔄 Próximos passos:${NC}"
    echo -e "   1. Reinicie o Directus: ${YELLOW}docker compose restart directus${NC}"
    echo -e "   2. Acesse: ${GREEN}http://localhost:8055/admin/terminal${NC}"
else
    echo ""
    echo -e "${RED}❌ Nenhuma extensão foi compilada${NC}"
    echo -e "${BLUE}🔧 Soluções:${NC}"
    echo -e "   1. Verifique se Node.js está instalado"
    echo -e "   2. Execute: ${YELLOW}npm install -g @directus/extensions-sdk${NC}"
fi

echo ""