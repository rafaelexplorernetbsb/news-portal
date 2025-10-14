#!/bin/bash

# ========================================
# SCRIPT DE DIAGNÓSTICO DO SISTEMA
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
    echo -e "${BLUE}[DIAGNOSE]${NC} $1"
}

success() {
    echo -e "${GREEN}[✅]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[⚠️]${NC} $1"
}

error() {
    echo -e "${RED}[❌]${NC} $1"
}

info() {
    echo -e "${BLUE}[ℹ️]${NC} $1"
}

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   DIAGNÓSTICO DO SISTEMA                   ║"
echo "║                   Portal de Notícias                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ========================================
# VERIFICAR SISTEMA OPERACIONAL
# ========================================
log "🖥️  Verificando sistema operacional..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    success "Sistema: Linux"
    info "Distribuição: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    success "Sistema: macOS"
    info "Versão: $(sw_vers -productVersion)"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    success "Sistema: Windows"
else
    warning "Sistema: $OSTYPE (não identificado)"
fi

# ========================================
# VERIFICAR DOCKER
# ========================================
log "🐳 Verificando Docker..."

if command -v docker &> /dev/null; then
    success "Docker está instalado"
    info "Versão: $(docker --version)"

    if docker info &> /dev/null; then
        success "Docker está funcionando"
    else
        error "Docker não está funcionando (daemon não está rodando)"
        info "Para iniciar Docker:"
        echo "  - Linux: sudo systemctl start docker"
        echo "  - macOS: Abra o Docker Desktop"
        echo "  - Windows: Abra o Docker Desktop"
    fi
else
    error "Docker não está instalado"
    info "Para instalar: https://docs.docker.com/get-docker/"
fi

# ========================================
# VERIFICAR DOCKER COMPOSE
# ========================================
log "🔧 Verificando Docker Compose..."

if command -v docker-compose &> /dev/null; then
    success "docker-compose está instalado"
    info "Versão: $(docker-compose --version)"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    success "docker compose está disponível (plugin)"
    info "Versão: $(docker compose version)"
else
    error "Docker Compose não está disponível"
    info "Para instalar: https://docs.docker.com/compose/install/"
fi

# ========================================
# VERIFICAR NODE.JS
# ========================================
log "🟢 Verificando Node.js..."

if command -v node &> /dev/null; then
    node_version=$(node --version)
    success "Node.js está instalado: $node_version"

    # Verificar versão
    major_version=$(echo $node_version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$major_version" -ge 18 ]; then
        success "Versão do Node.js é compatível (18+)"
    else
        warning "Versão do Node.js pode ser incompatível (recomendado: 18+)"
        info "Para atualizar: https://nodejs.org/"
    fi
else
    error "Node.js não está instalado"
    info "Para instalar: https://nodejs.org/"
fi

# ========================================
# VERIFICAR GERENCIADORES DE PACOTES
# ========================================
log "📦 Verificando gerenciadores de pacotes..."

if command -v pnpm &> /dev/null; then
    success "pnpm está instalado: $(pnpm --version)"
elif command -v npm &> /dev/null; then
    success "npm está instalado: $(npm --version)"
    info "Para instalar pnpm: npm install -g pnpm"
else
    error "Nenhum gerenciador de pacotes encontrado"
fi

# ========================================
# VERIFICAR NVM
# ========================================
log "🔄 Verificando NVM..."

if command -v nvm &> /dev/null; then
    success "NVM está instalado"
    if [ -f ".nvmrc" ]; then
        info "Arquivo .nvmrc encontrado: $(cat .nvmrc)"
        info "Para usar: nvm use"
    fi
else
    warning "NVM não está instalado (opcional)"
    info "Para instalar: https://github.com/nvm-sh/nvm"
fi

# ========================================
# VERIFICAR PORTAS
# ========================================
log "🔌 Verificando portas..."

ports=("3000:Frontend" "8055:Directus API" "5432:PostgreSQL" "6379:Redis")

for port_info in "${ports[@]}"; do
    port=$(echo $port_info | cut -d: -f1)
    service=$(echo $port_info | cut -d: -f2)

    if lsof -ti:$port > /dev/null 2>&1; then
        warning "$service está usando a porta $port"
        info "Processo: $(lsof -ti:$port | xargs ps -p | tail -1)"
    else
        success "Porta $port está livre para $service"
    fi
done

# ========================================
# VERIFICAR ARQUIVOS DE CONFIGURAÇÃO
# ========================================
log "📁 Verificando arquivos de configuração..."

config_files=(
    ".env:Configuração principal"
    "frontend/.env.local:Configuração do frontend"
    "webscraper-service/.env:Configuração do webscraper"
    "docker-compose.yml:Docker Compose desenvolvimento"
    "docker-compose.prod.yml:Docker Compose produção"
    ".nvmrc:Versão do Node.js"
)

for file_info in "${config_files[@]}"; do
    file=$(echo $file_info | cut -d: -f1)
    description=$(echo $file_info | cut -d: -f2)

    if [ -f "$file" ]; then
        success "$description: $file"
    else
        warning "$description não encontrado: $file"
    fi
done

# ========================================
# VERIFICAR ESPAÇO EM DISCO
# ========================================
log "💾 Verificando espaço em disco..."

if command -v df &> /dev/null; then
    disk_usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $disk_usage -lt 80 ]; then
        success "Espaço em disco: ${disk_usage}% usado"
    else
        warning "Espaço em disco: ${disk_usage}% usado (considerar limpeza)"
    fi

    available_space=$(df -h . | awk 'NR==2 {print $4}')
    info "Espaço disponível: $available_space"
fi

# ========================================
# VERIFICAR MEMÓRIA
# ========================================
log "🧠 Verificando memória..."

if command -v free &> /dev/null; then
    memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ $memory_usage -lt 80 ]; then
        success "Uso de memória: ${memory_usage}%"
    else
        warning "Uso de memória: ${memory_usage}% (considerar reiniciar)"
    fi

    total_memory=$(free -h | awk 'NR==2{print $2}')
    info "Memória total: $total_memory"
fi

# ========================================
# RESUMO E RECOMENDAÇÕES
# ========================================
echo ""
log "📋 RESUMO E RECOMENDAÇÕES:"

# Contar problemas
total_checks=0
issues=0

# Docker
if ! command -v docker &> /dev/null || ! docker info &> /dev/null; then
    ((issues++))
fi
((total_checks++))

# Docker Compose
if ! command -v docker-compose &> /dev/null && ! (command -v docker &> /dev/null && docker compose version &> /dev/null); then
    ((issues++))
fi
((total_checks++))

# Node.js
if ! command -v node &> /dev/null; then
    ((issues++))
fi
((total_checks++))

# Gerenciador de pacotes
if ! command -v pnpm &> /dev/null && ! command -v npm &> /dev/null; then
    ((issues++))
fi
((total_checks++))

echo ""
info "Verificações realizadas: $total_checks"
info "Problemas encontrados: $issues"

if [ $issues -eq 0 ]; then
    success "🎉 Sistema está pronto para executar o setup!"
    info "Execute: ./setup.sh dev"
elif [ $issues -le 2 ]; then
    warning "⚠️  Alguns problemas foram encontrados, mas o setup pode funcionar"
    info "Execute: ./setup.sh dev"
else
    error "❌ Muitos problemas encontrados. Corrija antes de executar o setup."
fi

echo ""
info "💡 Comandos úteis:"
echo "   • Setup: ./setup.sh dev"
echo "   • Parar: ./stop.sh"
echo "   • Health check: ./health-check.sh"
