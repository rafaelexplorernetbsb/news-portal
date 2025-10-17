#!/bin/bash

# Script para executar comandos no host através do Docker
# Este script é executado dentro do container mas executa comandos no host

COMMAND="$1"
WORKING_DIR="$2"

# Se não especificado, usar diretório do projeto
if [ -z "$WORKING_DIR" ]; then
    WORKING_DIR="/Users/rafaelsoares/news-portal"
fi

# Executar comando no host usando docker-compose exec
# Isso permite executar comandos diretamente no sistema host
docker-compose exec -T directus sh -c "cd '$WORKING_DIR' && $COMMAND"
