#!/bin/bash

# Script simples para corrigir as coleções do Directus
# Execute este script se as coleções não aparecerem no "Modelo de dados"

set -e

echo "🔧 Corrigindo coleções do Directus..."

# Verificar se o Docker está rodando
if ! docker-compose ps | grep -q "directus.*Up"; then
    echo "❌ Directus não está rodando. Execute primeiro:"
    echo "   docker-compose up -d"
    exit 1
fi

echo "⏳ Aguardando Directus estar pronto..."
sleep 15

echo "📊 Criando coleções via SQL..."
docker exec -i directus-postgres-1 psql -U postgres -d directus < create-collections-sql.sql

echo "📝 Importando dados de demonstração..."
docker exec -i directus-postgres-1 psql -U postgres -d directus < demo_data.sql

echo "🔄 Reiniciando Directus para carregar as mudanças..."
docker-compose restart directus

echo "⏳ Aguardando Directus reiniciar..."
sleep 15

echo "✅ Coleções configuradas com sucesso!"
echo ""
echo "🎉 Agora acesse:"
echo "   • http://localhost:8055/admin"
echo "   • Vá para 'Modelo de dados'"
echo "   • Você deve ver: autores, categorias, noticias"
echo ""
echo "📊 Dados de exemplo incluídos:"
echo "   • 5 categorias"
echo "   • 4 autores"
echo "   • 10 notícias"
