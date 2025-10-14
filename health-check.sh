#!/bin/bash

# ========================================
# SCRIPT DE VERIFICAÇÃO DE SAÚDE
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
    echo -e "${BLUE}[HEALTH]${NC} $1"
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
echo "║                   VERIFICAÇÃO DE SAÚDE                      ║"
echo "║                   Portal de Notícias                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ========================================
# VERIFICAR CONTAINERS DOCKER
# ========================================
log "🐳 Verificando containers Docker..."

if docker-compose ps | grep -q "Up"; then
    success "Containers Docker estão rodando"
    docker-compose ps
else
    warning "Nenhum container Docker está rodando"
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
        success "$service está rodando na porta $port"
    else
        warning "$service não está rodando na porta $port"
    fi
done

# ========================================
# VERIFICAR API DIRECTUS
# ========================================
log "🔧 Verificando Directus API..."

if curl -f -s http://localhost:8055/server/ping > /dev/null 2>&1; then
    success "Directus API está respondendo"

    # Verificar se o admin existe
    admin_check=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5ZjZjMDVlLWNmZmMtNGNlYi04NmU0LWJmYmM0N2VmY2ZkZSIsInJvbGUiOiI3MWYxYzIyZi1jOGMyLTRjYjctOGMzNS1jNDA1MDY4M2UwYmEiLCJhcHBfYWNjZXNzIjp0cnVlLCJhZG1pbl9hY2Nlc3MiOnRydWUsImlhdCI6MTc1OTMyNzQ4NCwiZXhwIjoxNzkwODYzNDg0LCJpc3MiOiJkaXJlY3R1cyJ9.-Vs4DXspNGEjFZZGM6YmDmyh43hcFuzgaLVMCFILScU" \
        http://localhost:8055/users/me 2>/dev/null)

    if [ "$admin_check" = "200" ]; then
        success "Usuário admin está configurado"
    else
        warning "Usuário admin pode não estar configurado"
    fi
else
    error "Directus API não está respondendo"
fi

# ========================================
# VERIFICAR FRONTEND
# ========================================
log "🎨 Verificando Frontend..."

if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    success "Frontend está respondendo"
else
    warning "Frontend não está respondendo"
fi

# ========================================
# VERIFICAR WEBSCRAPERS
# ========================================
log "🕷️  Verificando Webscrapers..."

webscrapers=("g1.js:G1" "folha.js:Folha" "olhar-digital.js:Olhar Digital")

for scraper_info in "${webscrapers[@]}"; do
    script=$(echo $scraper_info | cut -d: -f1)
    name=$(echo $scraper_info | cut -d: -f2)

    if pgrep -f "$script" > /dev/null; then
        success "$name está rodando"
    else
        warning "$name não está rodando"
    fi
done

# ========================================
# VERIFICAR LOGS
# ========================================
log "📋 Verificando logs..."

if [ -d "logs" ]; then
    log_files=$(ls logs/*.log 2>/dev/null | wc -l)
    if [ $log_files -gt 0 ]; then
        success "Logs encontrados: $log_files arquivos"

        # Mostrar tamanho dos logs
        for log_file in logs/*.log; do
            if [ -f "$log_file" ]; then
                size=$(du -h "$log_file" | cut -f1)
                info "  $(basename $log_file): $size"
            fi
        done
    else
        warning "Nenhum arquivo de log encontrado"
    fi
else
    warning "Diretório de logs não existe"
fi

# ========================================
# VERIFICAR ESPAÇO EM DISCO
# ========================================
log "💾 Verificando espaço em disco..."

disk_usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $disk_usage -lt 80 ]; then
    success "Espaço em disco: ${disk_usage}% usado"
else
    warning "Espaço em disco: ${disk_usage}% usado (considerar limpeza)"
fi

# ========================================
# VERIFICAR MEMÓRIA
# ========================================
log "🧠 Verificando uso de memória..."

if command -v free &> /dev/null; then
    memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ $memory_usage -lt 80 ]; then
        success "Uso de memória: ${memory_usage}%"
    else
        warning "Uso de memória: ${memory_usage}% (considerar reiniciar)"
    fi
fi

# ========================================
# RESUMO FINAL
# ========================================
echo ""
log "📊 RESUMO DA VERIFICAÇÃO:"

# Contar serviços funcionando
total_services=0
working_services=0

# API
if curl -f -s http://localhost:8055/server/ping > /dev/null 2>&1; then
    ((working_services++))
fi
((total_services++))

# Frontend
if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    ((working_services++))
fi
((total_services++))

# Webscrapers
if pgrep -f "g1.js\|folha.js\|olhar-digital.js" > /dev/null; then
    ((working_services++))
fi
((total_services++))

echo ""
info "Serviços funcionando: $working_services/$total_services"

if [ $working_services -eq $total_services ]; then
    success "🎉 Todos os serviços estão funcionando perfeitamente!"
elif [ $working_services -gt 0 ]; then
    warning "⚠️  Alguns serviços podem precisar de atenção"
else
    error "❌ Nenhum serviço está funcionando. Execute: ./setup.sh dev"
fi

echo ""
info "💡 Comandos úteis:"
echo "   • Reiniciar: ./setup.sh dev"
echo "   • Parar: ./stop.sh"
echo "   • Logs: tail -f logs/*.log"
echo "   • Status Docker: docker-compose ps"
