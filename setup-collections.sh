#!/bin/bash

# Script para configurar as coleções do Directus
# Este script executa os scripts de configuração dentro do container

set -e

echo "🚀 Configurando coleções do Directus..."

# Verificar se o Docker Compose está rodando
if ! docker-compose ps | grep -q "directus.*Up"; then
    echo "❌ Directus não está rodando. Execute 'docker-compose up -d' primeiro."
    exit 1
fi

# Aguardar o Directus estar pronto
echo "⏳ Aguardando Directus estar pronto..."
sleep 10

# Executar script de criação de coleções dentro do container
echo "📝 Criando coleções..."
docker exec directus-directus-1 node create-collections.js

# Aguardar um pouco
sleep 5

# Executar script de permissões
echo "🔐 Aplicando permissões..."
docker exec directus-directus-1 node apply-permissions.js

echo "✅ Coleções configuradas com sucesso!"
echo ""
echo "🎉 Agora você pode:"
echo "   • Acessar http://localhost:8055/admin"
echo "   • Ir para 'Modelo de dados'"
echo "   • Ver as coleções: noticias, autores, categorias"
echo ""
echo "📊 Para adicionar dados de exemplo:"
echo "   • Execute: ./setup-demo-data.sh"
