#!/bin/bash

# Script definitivo para corrigir todas as coleções do Directus
# Execute este script se apenas os autores aparecerem

set -e

echo "🔧 Corrigindo TODAS as coleções do Directus..."

# Verificar se o Docker está rodando
if ! docker-compose ps | grep -q "directus.*Up"; then
    echo "❌ Directus não está rodando. Execute primeiro:"
    echo "   docker-compose up -d"
    exit 1
fi

echo "⏳ Aguardando Directus estar pronto..."
sleep 10

echo "🗑️  Limpando configurações existentes..."
docker exec -i directus-postgres-1 psql -U postgres -d directus << 'EOF'
-- Remover registros existentes
DELETE FROM directus_permissions WHERE collection IN ('noticias', 'autores', 'categorias');
DELETE FROM directus_relations WHERE many_collection IN ('noticias', 'autores', 'categorias') OR one_collection IN ('noticias', 'autores', 'categorias');
DELETE FROM directus_fields WHERE collection IN ('noticias', 'autores', 'categorias');
DELETE FROM directus_collections WHERE collection IN ('noticias', 'autores', 'categorias');
EOF

echo "📊 Criando coleções completas..."
docker exec -i directus-postgres-1 psql -U postgres -d directus < fix-collections-complete.sql

echo "📝 Importando dados de demonstração..."
docker exec -i directus-postgres-1 psql -U postgres -d directus < demo_data.sql

echo "🔄 Reiniciando Directus..."
docker-compose restart directus

echo "⏳ Aguardando Directus reiniciar..."
sleep 20

echo "🔑 Gerando token de API válido..."
# Gerar token de API
API_TOKEN=""
MAX_ATTEMPTS=10
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "🔄 Tentativa $ATTEMPT de $MAX_ATTEMPTS para gerar token..."
    
    # Fazer login e obter token
    RESPONSE=$(curl -s -X POST "http://localhost:8055/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@example.com","password":"directus"}' \
        2>/dev/null || echo "")
    
    if [ -n "$RESPONSE" ] && echo "$RESPONSE" | grep -q "access_token"; then
        # Extrair token da resposta
        API_TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$API_TOKEN" ]; then
            echo "✅ Token gerado com sucesso!"
            break
        fi
    fi
    
    echo "❌ Tentativa $ATTEMPT falhou. Aguardando..."
    sleep 10
    ATTEMPT=$((ATTEMPT + 1))
done

if [ -n "$API_TOKEN" ]; then
    echo "⚙️  Configurando frontend com token válido..."
    
    # Criar arquivo .env.local no frontend
    cat > frontend/.env.local << EOF
# Configurações do Directus
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=$API_TOKEN

# Token de API válido (gerado automaticamente)
# Este token permite acesso às notícias, autores e categorias
EOF
    
    echo "✅ Frontend configurado com token válido!"
fi

echo "✅ TODAS as coleções foram configuradas!"
echo ""
echo "🎉 Agora acesse:"
echo "   • http://localhost:8055/admin"
echo "   • Vá para 'Modelo de dados'"
echo "   • Você deve ver: autores, categorias, noticias"
echo ""
echo "🌐 Para executar o frontend:"
echo "   cd frontend && pnpm install && pnpm dev"
echo ""
echo "📊 Se ainda não aparecer, tente:"
echo "   • F5 para atualizar a página"
echo "   • Logout e login novamente"
echo "   • Limpar cache do navegador"
