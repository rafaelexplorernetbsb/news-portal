#!/bin/bash

# =====================================================
# SCRIPT PARA INICIAR SERVIÇOS DE MONITORAMENTO
# =====================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando serviços de monitoramento...${NC}"
echo ""

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando!${NC}"
    exit 1
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}💡 Execute ./setup.sh primeiro${NC}"
    exit 1
fi

# Criar diretórios necessários
echo -e "${YELLOW}📁 Criando diretórios de monitoramento...${NC}"
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/grafana/dashboards

# Iniciar serviços de monitoramento
echo -e "${YELLOW}🐳 Iniciando containers de monitoramento...${NC}"
docker-compose --profile monitoring up -d

# Aguardar serviços ficarem prontos
echo -e "${YELLOW}⏳ Aguardando serviços ficarem prontos...${NC}"
sleep 10

# Verificar status
echo ""
echo -e "${GREEN}✅ Serviços de monitoramento iniciados!${NC}"
echo ""
echo -e "${BLUE}📊 Acessos:${NC}"
echo -e "   • Grafana:    ${GREEN}http://localhost:3001${NC}"
echo -e "     Login:      ${YELLOW}admin${NC}"
echo -e "     Senha:      ${YELLOW}admin123${NC}"
echo ""
echo -e "   • Prometheus: ${GREEN}http://localhost:9090${NC}"
echo ""
echo -e "   • Node Exp.:  ${GREEN}http://localhost:9100${NC}"
echo ""
echo -e "${BLUE}💡 Comandos:${NC}"
echo -e "   • Ver logs:   ${YELLOW}docker-compose logs -f prometheus grafana${NC}"
echo -e "   • Parar:      ${YELLOW}docker-compose --profile monitoring down${NC}"
echo -e "   • Restart:    ${YELLOW}docker-compose --profile monitoring restart${NC}"
echo ""
