#!/bin/bash

# Script para configurar dados de demonstração do News Portal
# Este script importa o schema e os dados de exemplo para o banco

set -e

echo "🚀 Configurando dados de demonstração do News Portal..."

# Verificar se o Docker Compose está rodando
if ! docker-compose ps | grep -q "directus-postgres-1.*Up"; then
    echo "❌ PostgreSQL não está rodando. Execute 'docker-compose up -d' primeiro."
    exit 1
fi

echo "📊 Importando schema do banco de dados..."
docker exec -i directus-postgres-1 psql -U postgres -d directus < database_schema.sql

echo "📝 Importando dados de demonstração..."
docker exec -i directus-postgres-1 psql -U postgres -d directus < demo_data.sql

echo "✅ Dados de demonstração importados com sucesso!"
echo ""
echo "📋 O que foi importado:"
echo "   • 5 categorias (Política, Economia, Tecnologia, Esportes, Cultura)"
echo "   • 4 autores de exemplo"
echo "   • 10 notícias de demonstração"
echo ""
echo "🌐 Acesse a aplicação:"
echo "   • Frontend: http://localhost:3000"
echo "   • Directus CMS: http://localhost:8055"
echo ""
echo "🎉 Setup completo! Sua aplicação está pronta para uso."
