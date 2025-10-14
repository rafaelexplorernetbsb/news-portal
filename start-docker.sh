#!/bin/bash

# ========================================
# SCRIPT PARA INICIAR DOCKER
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
    echo -e "${BLUE}[DOCKER]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    INICIANDO DOCKER                         ║"
echo "║                   Portal de Notícias                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se Docker já está funcionando
if docker info &> /dev/null; then
    success "Docker já está funcionando!"
    exit 0
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado"
fi

log "Iniciando Docker..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if [ -d "/Applications/Docker.app" ]; then
        log "Iniciando Docker Desktop no macOS..."
        open -a Docker

        log "Aguardando Docker iniciar..."
        sleep 30

        # Verificar se Docker iniciou
        max_attempts=15
        attempt=1

        while [ $attempt -le $max_attempts ]; do
            if docker info &> /dev/null; then
                success "Docker iniciado com sucesso!"
                success "Agora você pode executar: ./setup.sh dev"
                exit 0
            else
                log "Tentativa $attempt/$max_attempts - Aguardando Docker..."
                sleep 10
                ((attempt++))
            fi
        done

        warning "Docker não iniciou automaticamente"
        warning "Por favor, inicie o Docker Desktop manualmente"
        exit 1

    else
        error "Docker Desktop não encontrado. Instale: https://docs.docker.com/desktop/mac/install/"
    fi

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    log "Iniciando Docker no Linux..."

    if sudo systemctl start docker 2>/dev/null; then
        success "Docker iniciado com sucesso!"
        success "Agora você pode executar: ./setup.sh dev"
    else
        error "Falha ao iniciar Docker no Linux"
        error "Execute: sudo systemctl start docker"
    fi

elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows
    log "Iniciando Docker Desktop no Windows..."

    # Tentar abrir Docker Desktop
    if command -v start &> /dev/null; then
        start "Docker Desktop"
    else
        log "Por favor, abra o Docker Desktop manualmente"
    fi

    log "Aguardando Docker iniciar..."
    sleep 30

    # Verificar se Docker iniciou
    max_attempts=15
    attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker info &> /dev/null; then
            success "Docker iniciado com sucesso!"
            success "Agora você pode executar: ./setup.sh dev"
            exit 0
        else
            log "Tentativa $attempt/$max_attempts - Aguardando Docker..."
            sleep 10
            ((attempt++))
        fi
    done

    warning "Docker não iniciou automaticamente"
    warning "Por favor, inicie o Docker Desktop manualmente"
    exit 1

else
    error "Sistema operacional não suportado: $OSTYPE"
fi
