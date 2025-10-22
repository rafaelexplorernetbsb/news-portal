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

warning() {
    echo -e "${YELLOW}[⚠️  WARNING]${NC} $1"
}

# =====================================================
# HEADER
# =====================================================
echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                   WEBSCRAPERS MANAGER                       ║
║                   Iniciando Todos os Scrapers               ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# =====================================================
# 1. VERIFICAR SE O DIRECTUS ESTÁ RODANDO
# =====================================================
log "Verificando se o Directus está rodando..."
if curl -s http://localhost:8055/server/health > /dev/null 2>&1; then
    success "Directus está rodando"
else
    error "Directus não está rodando. Por favor, inicie o Directus antes de iniciar os webscrapers."
    error "Execute: docker-compose up -d"
    exit 1
fi

# =====================================================
# 2. CRIAR DIRETÓRIO DE LOGS
# =====================================================
mkdir -p logs/webscrapers

# =====================================================
# 3. PARAR WEBSCRAPERS EXISTENTES (PARA EVITAR DUPLICIDADE)
# =====================================================
log "Parando webscrapers existentes (se houver)..."
pkill -f "node.*webscraper-service" > /dev/null 2>&1
sleep 2

# =====================================================
# 4. INICIAR WEBSCRAPERS EM BACKGROUND
# =====================================================
log "Iniciando todos os webscrapers..."

WEBSCRAPERS=(
    "g1:G1 Tecnologia"
    "folha:Folha de S.Paulo"
    "uol:UOL Tecnologia"
    "tecmundo:Tecmundo"
    "metropoles:Metrópoles"
    "olhar-digital:Olhar Digital"
)

SUCCESS_COUNT=0
FAILURE_COUNT=0

for scraper_info in "${WEBSCRAPERS[@]}"; do
    IFS=':' read -r SCRIPT_NAME DISPLAY_NAME <<< "$scraper_info"

    log "Iniciando $DISPLAY_NAME ($SCRIPT_NAME.js)..."

    # Executar o webscraper em background, redirecionar stdout/stderr para um arquivo de log
    # e armazenar o PID em um arquivo .pid
    cd webscraper-service
    nohup node "$SCRIPT_NAME.js" > ../logs/webscrapers/"$SCRIPT_NAME".log 2>&1 &
    PID=$!
    echo "$PID" > ../logs/webscrapers/"$SCRIPT_NAME".pid
    cd ..

    # Aguardar um pouco para verificar se o processo iniciou
    sleep 1

    if ps -p $PID > /dev/null 2>&1; then
        success "$DISPLAY_NAME iniciado com sucesso (PID: $PID)"
        info "Logs: tail -f logs/webscrapers/$SCRIPT_NAME.log"
        ((SUCCESS_COUNT++))
    else
        error "Falha ao iniciar $DISPLAY_NAME"
        ((FAILURE_COUNT++))
    fi
done

echo ""

# =====================================================
# RESUMO
# =====================================================
echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                   📊 RESUMO DA INICIALIZAÇÃO                ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

if [ "$SUCCESS_COUNT" -gt 0 ]; then
    success "$SUCCESS_COUNT webscraper(s) iniciado(s) com sucesso"
fi
if [ "$FAILURE_COUNT" -gt 0 ]; then
    error "$FAILURE_COUNT webscraper(s) falhou(aram) ao iniciar"
fi

echo ""
echo -e "${BLUE}📋 COMANDOS ÚTEIS:${NC}"
echo -e "   • Ver status:     ${YELLOW}./status-webscrapers.sh${NC}"
echo -e "   • Parar todos:    ${YELLOW}./stop-webscrapers.sh${NC}"
echo -e "   • Ver logs:       ${YELLOW}tail -f logs/webscrapers/[nome].log${NC}"
echo -e "   • Ver todos logs: ${YELLOW}tail -f logs/webscrapers/*.log${NC}"
echo ""
echo -e "${GREEN}✨ Webscrapers rodando em background!${NC}"
echo -e "${CYAN}🔄 Eles coletarão notícias automaticamente${NC}"
echo ""
