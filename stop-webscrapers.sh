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
    echo -e "${GREEN}[✅ SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[❌ ERROR]${NC} $1"
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
║                   Parando Todos os Scrapers                 ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# =====================================================
# 1. PARAR WEBSCRAPERS VIA PID FILES
# =====================================================
log "Parando webscrapers via PID files..."

WEBSCRAPERS=(
    "g1:G1 Tecnologia"
    "folha:Folha de S.Paulo"
    "uol:UOL Tecnologia"
    "tecmundo:Tecmundo"
    "metropoles:Metrópoles"
    "olhar-digital:Olhar Digital"
)

STOPPED_COUNT=0
FAILED_COUNT=0

for scraper_info in "${WEBSCRAPERS[@]}"; do
    IFS=':' read -r SCRIPT_NAME DISPLAY_NAME <<< "$scraper_info"
    PID_FILE="logs/webscrapers/$SCRIPT_NAME.pid"

    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        log "Parando $DISPLAY_NAME (PID: $PID)..."

        # Tentar parar graciosamente
        kill -TERM "$PID" > /dev/null 2>&1
        sleep 2 # Aguardar um pouco

        if ps -p "$PID" > /dev/null 2>&1; then
            # Se ainda estiver rodando, forçar parada
            warning "Processo $DISPLAY_NAME (PID: $PID) ainda ativo. Forçando parada..."
            kill -KILL "$PID" > /dev/null 2>&1
            sleep 1
            if ps -p "$PID" > /dev/null 2>&1; then
                error "Falha ao parar $DISPLAY_NAME (PID: $PID)"
                ((FAILED_COUNT++))
            else
                success "$DISPLAY_NAME parado com sucesso (forçado)"
                rm -f "$PID_FILE"
                ((STOPPED_COUNT++))
            fi
        else
            success "$DISPLAY_NAME parado com sucesso"
            rm -f "$PID_FILE"
            ((STOPPED_COUNT++))
        fi
    else
        info "$DISPLAY_NAME não estava rodando (PID file não encontrado)"
    fi
done

# =====================================================
# 2. VERIFICAR E MATAR PROCESSOS RESTANTES
# =====================================================
log "Verificando processos node restantes..."
REMAINING=$(pgrep -f "node.*webscraper-service" | wc -l)

if [ "$REMAINING" -gt 0 ]; then
    warning "Encontrados $REMAINING processo(s) node restante(s). Finalizando..."
    pkill -TERM -f "node.*webscraper-service"
    sleep 2
    pkill -KILL -f "node.*webscraper-service" > /dev/null 2>&1
    success "Processos restantes finalizados"
fi

echo ""

# =====================================================
# RESUMO
# =====================================================
echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                   📊 RESUMO DA PARADA                       ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

if [ "$STOPPED_COUNT" -gt 0 ]; then
    success "$STOPPED_COUNT webscraper(s) parado(s) com sucesso"
fi
if [ "$FAILED_COUNT" -gt 0 ]; then
    error "$FAILED_COUNT webscraper(s) falhou(aram) ao parar"
fi

echo ""
echo -e "${BLUE}📋 COMANDOS ÚTEIS:${NC}"
echo -e "   • Ver status:     ${YELLOW}./status-webscrapers.sh${NC}"
echo -e "   • Iniciar todos:  ${YELLOW}./start-webscrapers.sh${NC}"
echo ""
echo -e "${GREEN}✨ Todos os webscrapers foram parados!${NC}"
echo ""
