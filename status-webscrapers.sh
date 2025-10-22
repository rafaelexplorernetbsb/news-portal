#!/bin/bash

# Cores para a saída do terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para exibir mensagens de log
log() {
    echo -e "${BLUE}[WEBSCRAPERS]${NC} $1"
}

success() {
    echo -e "${GREEN}[✅ RUNNING]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[⚠️  STOPPED]${NC} $1"
}

info() {
    echo -e "${CYAN}[ℹ️  INFO]${NC} $1"
}

# =====================================================
# HEADER
# =====================================================
echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                   WEBSCRAPERS MANAGER                       ║
║                   Status dos Scrapers                       ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# =====================================================
# 1. VERIFICAR STATUS DOS WEBSCRAPERS
# =====================================================
log "Verificando status dos webscrapers..."
echo ""

WEBSCRAPERS=(
    "g1:G1 Tecnologia"
    "folha:Folha de S.Paulo"
    "uol:UOL Tecnologia"
    "tecmundo:Tecmundo"
    "metropoles:Metrópoles"
    "olhar-digital:Olhar Digital"
)

RUNNING_COUNT=0
STOPPED_COUNT=0

for scraper_info in "${WEBSCRAPERS[@]}"; do
    IFS=':' read -r SCRIPT_NAME DISPLAY_NAME <<< "$scraper_info"
    PID_FILE="logs/webscrapers/$SCRIPT_NAME.pid"
    LOG_FILE="logs/webscrapers/$SCRIPT_NAME.log"

    # Formatar nome para exibição alinhada
    printf "%-25s" "$DISPLAY_NAME:"

    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            # Processo está rodando
            UPTIME=$(ps -p "$PID" -o etime= 2>/dev/null | awk '{print $1}' | xargs)
            if [ -z "$UPTIME" ]; then UPTIME="N/A"; fi

            LOG_SIZE="0K"
            if [ -f "$LOG_FILE" ]; then
                LOG_SIZE=$(du -h "$LOG_FILE" 2>/dev/null | awk '{print $1}')
            fi

            echo -e "${GREEN}✓ Rodando${NC}  │ PID: ${CYAN}$PID${NC}  │ Uptime: ${YELLOW}$UPTIME${NC}  │ Log: ${BLUE}$LOG_SIZE${NC}"
            ((RUNNING_COUNT++))
        else
            # PID file existe, mas processo não está rodando
            echo -e "${RED}✗ Parado${NC}    │ PID file órfão (processo não encontrado)"
            rm -f "$PID_FILE" # Remover PID file órfão
            ((STOPPED_COUNT++))
        fi
    else
        # PID file não existe
        echo -e "${RED}✗ Parado${NC}    │ Não iniciado"
        ((STOPPED_COUNT++))
    fi
done

echo ""

# =====================================================
# 2. VERIFICAR PROCESSOS NODE RELACIONADOS (EXTRA)
# =====================================================
log "Verificando processos node relacionados aos webscrapers..."
NODE_PROCESSES=$(pgrep -f "node.*webscraper-service" 2>/dev/null)

if [ -n "$NODE_PROCESSES" ]; then
    info "Processos node encontrados:"
    echo ""
    ps aux | grep "node.*webscraper-service" | grep -v grep | while read line; do
        echo "  $line"
    done
    echo ""
else
    info "Nenhum processo node relacionado encontrado"
fi

# =====================================================
# RESUMO
# =====================================================
echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                   📊 RESUMO DO STATUS                        ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

if [ "$RUNNING_COUNT" -gt 0 ]; then
    success "$RUNNING_COUNT webscraper(s) rodando"
fi
if [ "$STOPPED_COUNT" -gt 0 ]; then
    warning "$STOPPED_COUNT webscraper(s) parado(s)"
fi

echo ""
echo -e "${BLUE}📋 COMANDOS ÚTEIS:${NC}"
echo -e "   • Iniciar todos:  ${YELLOW}./start-webscrapers.sh${NC}"
echo -e "   • Parar todos:    ${YELLOW}./stop-webscrapers.sh${NC}"
echo -e "   • Ver logs:       ${YELLOW}tail -f logs/webscrapers/[nome].log${NC}"
echo ""

# =====================================================
# 3. VERIFICAR DIRECTUS
# =====================================================
log "Verificando conexão com Directus..."
if curl -s http://localhost:8055/server/health > /dev/null 2>&1; then
    success "Directus está rodando e acessível"
else
    warning "Directus não está respondendo em http://localhost:8055"
    info "Os webscrapers precisam do Directus para funcionar"
fi

echo ""
