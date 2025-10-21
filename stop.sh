#!/bin/bash

# ========================================
# SCRIPT PARA PARAR TODOS OS SERVIÇOS
# ========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[STOP]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

log "🛑 Parando todos os serviços do Portal de Notícias..."

# Parar containers Docker
log "🐳 Parando containers Docker..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# Parar processos Node.js
log "🕷️  Parando webscrapers..."
pkill -f "g1.js" 2>/dev/null || true
pkill -f "folha.js" 2>/dev/null || true
pkill -f "olhar-digital.js" 2>/dev/null || true
pkill -f "uol.js" 2>/dev/null || true

# Parar frontend
log "🎨 Parando frontend..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Liberar portas específicas
log "🔓 Liberando portas..."
ports=("3000" "8055" "5432" "6379")

for port in "${ports[@]}"; do
    pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pid" ]; then
        info "Finalizando processo $pid na porta $port..."
        kill -9 $pid 2>/dev/null || true
    fi
done

success "✅ Todos os serviços foram parados!"
success "🚀 Para reiniciar, execute: ./setup.sh dev"
