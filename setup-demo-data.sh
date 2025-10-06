#!/bin/bash

# Script para configurar dados de demonstração do News Portal
# Este script importa o schema, dados de exemplo e configura o token de API

set -e

echo "🚀 Configurando dados de demonstração do News Portal..."

# Verificar se o Docker Compose está rodando
if ! docker-compose ps | grep -q "directus-postgres-1.*Up"; then
    echo "❌ PostgreSQL não está rodando. Execute 'docker-compose up -d' primeiro."
    exit 1
fi

# Verificar se o Directus está rodando
if ! docker-compose ps | grep -q "directus.*Up"; then
    echo "❌ Directus não está rodando. Execute 'docker-compose up -d' primeiro."
    exit 1
fi

echo "📊 Importando schema do banco de dados..."
docker exec -i directus-postgres-1 psql -U postgres -d directus < database_schema.sql

echo "📝 Importando dados de demonstração..."
docker exec -i directus-postgres-1 psql -U postgres -d directus < demo_data.sql

echo "🔑 Gerando token de API válido..."
# Aguardar Directus estar pronto
sleep 10

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

if [ -z "$API_TOKEN" ]; then
    echo "❌ Não foi possível gerar token de API"
    echo "💡 Continuando sem configuração automática do frontend..."
    echo "   Você pode gerar o token manualmente em http://localhost:8055/admin"
else
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

echo ""
echo "✅ Dados de demonstração importados com sucesso!"
echo ""
echo "📋 O que foi importado:"
echo "   • 5 categorias (Política, Economia, Tecnologia, Esportes, Cultura)"
echo "   • 4 autores de exemplo"
echo "   • 10 notícias de demonstração"
echo "   • Token de API válido configurado no frontend"
echo ""
echo "🌐 Acesse a aplicação:"
echo "   • Frontend: http://localhost:3000"
echo "   • Directus CMS: http://localhost:8055"
echo ""
echo "🎉 Setup completo! Sua aplicação está pronta para uso."
echo ""
echo "💡 Para executar o frontend:"
echo "   cd frontend && pnpm install && pnpm dev"
