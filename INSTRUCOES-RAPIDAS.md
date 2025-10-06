# 🚀 INSTRUÇÕES RÁPIDAS - Seu Amigo

## Problema: Apenas "autores" aparece, faltam "categorias" e "noticias"

### Solução Rápida:

```bash
# 1. Faça pull das atualizações
git pull origin main

# 2. Execute o script de correção completo
./fix-all-collections.sh

# 3. Aguarde a conclusão (vai demorar uns 2-3 minutos)

# 4. Acesse http://localhost:8055/admin
# 5. Vá para "Modelo de dados"
# 6. Agora deve aparecer: autores, categorias, noticias
```

## Se ainda não funcionar:

```bash
# Execute este comando manualmente:
docker exec -i directus-postgres-1 psql -U postgres -d directus < fix-collections-complete.sql
docker exec -i directus-postgres-1 psql -U postgres -d directus < demo_data.sql
docker-compose restart directus
```

## O que o script faz:

1. ✅ Remove configurações antigas que podem estar causando conflito
2. ✅ Cria as 3 tabelas: autores, categorias, noticias
3. ✅ Configura os metadados do Directus para cada coleção
4. ✅ Importa dados de demonstração
5. ✅ Reinicia o Directus para carregar tudo

## Resultado esperado:

- **autores** (ícone de pessoa)
- **categorias** (ícone de pasta) 
- **noticias** (ícone de artigo)

Todas as 3 coleções devem aparecer na seção "Modelo de dados" do Directus!
