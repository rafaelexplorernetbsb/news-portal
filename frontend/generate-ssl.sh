#!/bin/bash

# =====================================================
# SCRIPT PARA GERAR CERTIFICADOS SSL DE DESENVOLVIMENTO
# =====================================================

set -e # Sair em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Gerando certificados SSL para desenvolvimento...${NC}"

# Criar diretório ssl se não existir
mkdir -p ssl

# Verificar se openssl está instalado
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}❌ OpenSSL não está instalado. Instale primeiro:${NC}"
    echo -e "${YELLOW}   macOS: brew install openssl${NC}"
    echo -e "${YELLOW}   Ubuntu: sudo apt-get install openssl${NC}"
    exit 1
fi

# Gerar chave privada
echo -e "${YELLOW}📝 Gerando chave privada...${NC}"
openssl genrsa -out ssl/key.pem 2048

# Gerar certificado auto-assinado
echo -e "${YELLOW}📜 Gerando certificado auto-assinado...${NC}"
openssl req -new -x509 -key ssl/key.pem -out ssl/cert.pem -days 365 -subj "/C=BR/ST=Brasil/L=Brasilia/O=News Portal/OU=Development/CN=localhost"

# Verificar se os arquivos foram criados
if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
    echo -e "${GREEN}✅ Certificados SSL gerados com sucesso!${NC}"
    echo -e "${YELLOW}   Certificado: ssl/cert.pem${NC}"
    echo -e "${YELLOW}   Chave: ssl/key.pem${NC}"
    echo -e "${YELLOW}   Válido por: 365 dias${NC}\n"
    
    echo -e "${BLUE}📋 Para usar em produção:${NC}"
    echo -e "${YELLOW}   1. Substitua por certificados válidos (Let's Encrypt, etc.)${NC}"
    echo -e "${YELLOW}   2. Configure seu domínio real${NC}"
    echo -e "${YELLOW}   3. Atualize as configurações do nginx.conf${NC}\n"
    
    echo -e "${GREEN}🚀 Pronto para desenvolvimento com HTTPS!${NC}"
else
    echo -e "${RED}❌ Erro ao gerar certificados SSL.${NC}"
    exit 1
fi
