#!/bin/bash

# =====================================================
# SCRIPT PARA GERAR CHAVES VAPID AUTOMATICAMENTE
# =====================================================

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔑 Gerando chaves VAPID para push notifications...${NC}"

# Verificar se web-push está instalado
if ! command -v web-push &> /dev/null; then
    echo -e "${YELLOW}📦 Instalando web-push...${NC}"
    npm install -g web-push
fi

# Gerar chaves VAPID
VAPID_KEYS=$(web-push generate-vapid-keys 2>/dev/null)

if [ $? -eq 0 ]; then
    # Extrair chaves do output
    VAPID_PUBLIC_KEY=$(echo "$VAPID_KEYS" | grep "Public Key:" | cut -d: -f2 | tr -d ' ')
    VAPID_PRIVATE_KEY=$(echo "$VAPID_KEYS" | grep "Private Key:" | cut -d: -f2 | tr -d ' ')

    echo -e "${GREEN}✅ Chaves VAPID geradas com sucesso!${NC}"
    echo -e "${GREEN}   Public Key: ${VAPID_PUBLIC_KEY}${NC}"
    echo -e "${GREEN}   Private Key: ${VAPID_PRIVATE_KEY}${NC}"

    # Retornar as chaves para serem usadas pelo setup.sh
    echo "VAPID_PUBLIC_KEY=$VAPID_PUBLIC_KEY"
    echo "VAPID_PRIVATE_KEY=$VAPID_PRIVATE_KEY"
else
    echo -e "${YELLOW}⚠️  Erro ao gerar chaves VAPID. Usando chaves padrão.${NC}"
    echo "VAPID_PUBLIC_KEY=BEMOcJ6Dkj_5DeGVdERtJa80y0XZez-AQYBZfnVO0cwwm23TkpZC3XM75qMnCpvXSU1eIqA1AAPCDHZ8vrn5izM"
    echo "VAPID_PRIVATE_KEY=Qft8aiLryh3WRI05IiyXgLYpKc-lMgoPoiGBe12nRjU"
fi
