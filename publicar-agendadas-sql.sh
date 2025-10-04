#!/bin/bash

# Script para publicar notícias agendadas usando SQL direto
# Execute via cron a cada minuto

# Definir PATH completo para encontrar docker
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

DOCKER="/opt/homebrew/bin/docker"

echo "=== Verificando notícias agendadas - $(date) ==="

# SQL para atualizar notícias agendadas cuja data já passou
# Usa CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo' para comparar no timezone correto
SQL="
UPDATE noticias
SET status = 'published',
    data_publicacao = CASE WHEN data_publicacao IS NULL THEN data_agendada ELSE data_publicacao END
WHERE status = 'scheduled'
  AND data_agendada IS NOT NULL
  AND data_agendada <= CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'
RETURNING id, titulo, data_agendada;
"

# Executar no banco
RESULT=$($DOCKER exec directus-postgres-1 psql -U postgres -d directus -t -c "$SQL")

# Verificar se houve atualizações
if [ -z "$RESULT" ] || [ "$RESULT" = " " ]; then
  echo "Nenhuma notícia para publicar no momento."
else
  echo "Notícias publicadas:"
  echo "$RESULT"
  echo "✓ Publicação automática concluída!"
fi

echo "=== Finalizado ==="

