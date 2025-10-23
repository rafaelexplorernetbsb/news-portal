#!/bin/bash

# =====================================================
# SCRIPT DE DEPLOY PARA PRODUÇÃO
# =====================================================

set -e  # Parar em caso de erro

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════╗
║            DEPLOY DO PORTAL DE NOTÍCIAS                     ║
║                 Crônica Digital                              ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

# Verificar se está em produção
if [ "$ENV" != "prod" ]; then
    echo -e "${RED}ERRO: Este script deve ser executado apenas em produção!${NC}"
    echo -e "${YELLOW}Configure ENV=prod no arquivo .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ambiente de produção detectado${NC}\n"

# 1. Parar serviços existentes
echo -e "${BLUE}[1/7] Parando serviços existentes...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 stop news-portal-frontend || true
fi
./stop-webscrapers.sh > /dev/null 2>&1 || true
docker-compose down || true
echo -e "${GREEN}✅ Serviços parados${NC}\n"

# 2. Atualizar código
echo -e "${BLUE}[2/7] Atualizando código...${NC}"
git pull origin main
echo -e "${GREEN}✅ Código atualizado${NC}\n"

# 3. Instalar dependências
echo -e "${BLUE}[3/7] Instalando dependências...${NC}"
cd api && npm install --production && cd ..
cd frontend && npm install && cd ..
echo -e "${GREEN}✅ Dependências instaladas${NC}\n"

# 4. Build do frontend
echo -e "${BLUE}[4/7] Criando build de produção do frontend...${NC}"
cd frontend && npm run build && cd ..
echo -e "${GREEN}✅ Build criado${NC}\n"

# 5. Iniciar containers Docker
echo -e "${BLUE}[5/7] Iniciando containers Docker...${NC}"
docker-compose --env-file .env --profile production up -d
echo -e "${GREEN}✅ Containers iniciados${NC}\n"

# 6. Aguardar Directus inicializar
echo -e "${BLUE}[6/7] Aguardando Directus inicializar...${NC}"
sleep 10
MAX_RETRIES=30
for i in $(seq 1 $MAX_RETRIES); do
    if curl -s http://localhost:8055/server/health > /dev/null; then
        echo -e "${GREEN}✅ Directus está pronto${NC}\n"
        break
    fi
    if [ $i -eq $MAX_RETRIES ]; then
        echo -e "${RED}❌ Timeout aguardando Directus${NC}"
        exit 1
    fi
    echo -n "."
    sleep 2
done

# 7. Iniciar serviços adicionais
echo -e "${BLUE}[7/7] Iniciando serviços adicionais...${NC}"

# Frontend com PM2
if command -v pm2 &> /dev/null; then
    cd frontend
    pm2 start npm --name "news-portal-frontend" -- start || pm2 restart news-portal-frontend
    pm2 save
    cd ..
    echo -e "${GREEN}✅ Frontend iniciado com PM2${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 não encontrado. Inicie o frontend manualmente:${NC}"
    echo -e "   cd frontend && npm run start"
fi

# Webscrapers
./start-webscrapers.sh
echo -e "${GREEN}✅ Webscrapers iniciados${NC}\n"

# =====================================================
# RESUMO
# =====================================================
echo -e "${BLUE}
╔══════════════════════════════════════════════════════════════╗
║                   🎉 DEPLOY CONCLUÍDO!                      ║
╚══════════════════════════════════════════════════════════════╝
${NC}"

echo -e "${GREEN}✅ Todos os serviços foram iniciados com sucesso!${NC}\n"
echo -e "${BLUE}📋 INFORMAÇÕES:${NC}"
echo -e "   • Frontend: ${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}"
echo -e "   • API:      ${DIRECTUS_URL:-http://localhost:8055}"
echo -e "   • Admin:    ${DIRECTUS_URL:-http://localhost:8055}/admin"
echo ""
echo -e "${BLUE}📊 VERIFICAR STATUS:${NC}"
echo -e "   • Containers:   ${YELLOW}docker-compose ps${NC}"
echo -e "   • Frontend:     ${YELLOW}pm2 status${NC}"
echo -e "   • Webscrapers:  ${YELLOW}./status-webscrapers.sh${NC}"
echo ""
echo -e "${BLUE}📝 VER LOGS:${NC}"
echo -e "   • Directus:     ${YELLOW}docker-compose logs -f directus${NC}"
echo -e "   • Frontend:     ${YELLOW}pm2 logs news-portal-frontend${NC}"
echo -e "   • Webscrapers:  ${YELLOW}tail -f logs/webscrapers/*.log${NC}"
echo ""
echo -e "${GREEN}🚀 Portal de Notícias está no ar!${NC}\n"

