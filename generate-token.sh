#!/bin/bash

# Script para gerar token de API válido para o Directus
# Este script faz login e gera um token de acesso

set -e

API_URL="http://localhost:8055"
EMAIL="admin@example.com"
PASSWORD="directus"

echo "🔑 Gerando token de API válido..."

# Aguardar Directus estar pronto
echo "⏳ Aguardando Directus estar pronto..."
sleep 5

# Tentar fazer login e obter token
MAX_ATTEMPTS=10
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "🔄 Tentativa $ATTEMPT de $MAX_ATTEMPTS..."
    
    # Fazer login e obter token
    RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
        2>/dev/null || echo "")
    
    if [ -n "$RESPONSE" ] && echo "$RESPONSE" | grep -q "access_token"; then
        # Extrair token da resposta
        TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$TOKEN" ]; then
            echo "✅ Token gerado com sucesso!"
            echo "$TOKEN"
            exit 0
        fi
    fi
    
    echo "❌ Tentativa $ATTEMPT falhou. Aguardando..."
    sleep 10
    ATTEMPT=$((ATTEMPT + 1))
done

echo "❌ Não foi possível gerar token após $MAX_ATTEMPTS tentativas"
echo "💡 Verifique se:"
echo "   • Directus está rodando em http://localhost:8055"
echo "   • Credenciais estão corretas (admin@example.com / directus)"
echo "   • Não há erros no Directus (docker-compose logs directus)"
exit 1
