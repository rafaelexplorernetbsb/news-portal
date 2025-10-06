# 🚀 INSTRUÇÕES RÁPIDAS - Seu Amigo

## Problemas Comuns e Soluções:

### 1️⃣ Problema: Apenas "autores" aparece, faltam "categorias" e "noticias"
### 2️⃣ Problema: "Erro ao carregar noticias" no frontend

### Solução Única para Ambos os Problemas:

```bash
# 1. Faça pull das atualizações
git pull origin main

# 2. Execute o script de correção completo
./fix-all-collections.sh

# 3. Aguarde a conclusão (vai demorar uns 3-4 minutos)

# 4. Execute o frontend
cd frontend
pnpm install
pnpm dev

# 5. Acesse http://localhost:3000
```

## O que o script faz automaticamente:

1. ✅ Remove configurações antigas que podem estar causando conflito
2. ✅ Cria as 3 tabelas: autores, categorias, noticias
3. ✅ Configura os metadados do Directus para cada coleção
4. ✅ Importa dados de demonstração
5. ✅ **Gera token de API válido automaticamente**
6. ✅ **Configura o frontend com o token**
7. ✅ Reinicia o Directus para carregar tudo

## Resultado esperado:

### No Directus (http://localhost:8055/admin):
- **autores** (ícone de pessoa)
- **categorias** (ícone de pasta) 
- **noticias** (ícone de artigo)

### No Frontend (http://localhost:3000):
- ✅ Notícias carregando normalmente
- ✅ Sem erro "Erro ao carregar noticias"
- ✅ 10 notícias de demonstração visíveis

## Se ainda não funcionar:

```bash
# Gere apenas um novo token
./generate-token.sh

# Ou execute manualmente:
docker exec -i directus-postgres-1 psql -U postgres -d directus < fix-collections-complete.sql
docker exec -i directus-postgres-1 psql -U postgres -d directus < demo_data.sql
docker-compose restart directus
```

**O script agora resolve TODOS os problemas de uma vez!** 🎉
