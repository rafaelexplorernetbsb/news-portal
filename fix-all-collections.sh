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

echo "✅ TODAS as coleções foram configuradas!"
echo ""
echo "🎉 Agora acesse:"
echo "   • http://localhost:8055/admin"
echo "   • Vá para 'Modelo de dados'"
echo "   • Você deve ver: autores, categorias, noticias"
echo ""
echo "📊 Se ainda não aparecer, tente:"
echo "   • F5 para atualizar a página"
echo "   • Logout e login novamente"
echo "   • Limpar cache do navegador"
