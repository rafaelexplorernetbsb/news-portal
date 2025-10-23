#!/bin/bash

# =====================================================
# SCRIPT DE BACKUP AUTOMÁTICO
# =====================================================

# Diretório de backups
BACKUP_DIR="/var/backups/news-portal"
mkdir -p $BACKUP_DIR

# Data atual
DATE=$(date +%Y%m%d_%H%M%S)

# Nome do backup
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

echo "🔄 Iniciando backup do banco de dados..."

# Fazer backup do PostgreSQL
docker-compose exec -T postgres pg_dump -U directus directus > $BACKUP_FILE

if [ $? -eq 0 ]; then
    # Comprimir backup
    gzip $BACKUP_FILE
    echo "✅ Backup criado com sucesso: ${BACKUP_FILE}.gz"

    # Manter apenas os últimos 7 dias de backups
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
    echo "🗑️  Backups antigos removidos (mantidos últimos 7 dias)"
else
    echo "❌ Erro ao criar backup"
    exit 1
fi

# Backup dos uploads do Directus (opcional)
UPLOADS_BACKUP="$BACKUP_DIR/uploads_$DATE.tar.gz"
docker run --rm -v news-portal_directus_uploads:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/uploads_$DATE.tar.gz -C /data .

if [ $? -eq 0 ]; then
    echo "✅ Backup dos uploads criado: ${UPLOADS_BACKUP}"
else
    echo "⚠️  Aviso: Não foi possível fazer backup dos uploads"
fi

echo ""
echo "📊 Tamanho total dos backups:"
du -sh $BACKUP_DIR

echo ""
echo "✨ Backup concluído com sucesso!"

