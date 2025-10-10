# Webscraper UOL Tecnologia

## 🧪 Como Testar

### 1. Teste Único (recomendado primeiro)

Execute o script de teste que processa apenas 3 notícias:

```bash
cd /Users/rafaelsoares/directus/webscraper-service
node uol-test.js
```

Este script vai:
- ✅ Buscar apenas 3 notícias do RSS do UOL Tecnologia
- ✅ Fazer scraping de cada uma
- ✅ Verificar se já existem no banco
- ✅ Criar no Directus se não existirem
- ✅ Mostrar estatísticas detalhadas
- ✅ **Não roda em loop** (executa uma vez e para)

### 2. Modo Produção (loop contínuo)

Se o teste funcionou bem, execute em produção:

```bash
node uol.js
```

Este script vai:
- ✅ Processar **TODAS** as notícias do RSS
- ✅ Verificar duplicatas automaticamente
- ✅ Rodar automaticamente a cada 5 minutos
- ✅ Continuar rodando até você parar (Ctrl+C)

## 📊 Saída Esperada do Teste

```
============================================================
[UOL Test] 🚀 TESTE DO WEBSCRAPER UOL TECNOLOGIA
============================================================

[UOL Test] Buscando RSS...
[UOL Test] 3 URLs extraídas (limitado a 3 para teste)

────────────────────────────────────────────────────────────
[UOL Test] Processando 1/3
────────────────────────────────────────────────────────────

[UOL Test] Fazendo scraping: https://...
[UOL Test] Conteúdo encontrado com .content-text (12543 chars)
[UOL Test] ✅ Título: Apple anuncia novo iPhone...
[UOL Test] ✅ Resumo: Empresa divulga detalhes...
[UOL Test] ✅ Imagem: SIM
[UOL Test] ✅ Tamanho conteúdo: 12845 chars
[UOL Test] 📝 Criando notícia no Directus...
[UOL Test] ✅ Notícia criada com sucesso!

============================================================
[UOL Test] 📊 RESULTADO DO TESTE
============================================================
Total processado:     3
✅ Criadas:           3
⏭️  Puladas:           0
❌ Erros:             0
============================================================

[UOL Test] ✨ Teste concluído!
[UOL Test] 💡 Se tudo funcionou, execute: node uol.js
```

## 🔧 Ajustes Específicos do UOL

O scraper do UOL tem:

### Seletores CSS Específicos
```javascript
const selectors = [
  '.content-text',      // Seletor principal do UOL
  'article.news-item',  // Alternativa
  '.p-content',         // Alternativa
  'div.text',           // Fallback
  // ... mais fallbacks genéricos
];
```

### Limpezas Específicas
- Remove blocos "Assine UOL"
- Remove "Continuar lendo"
- Remove publicidade e banners
- Remove chamadas relacionadas

### Metadados
- **Categoria**: tecnologia
- **Fonte RSS**: UOL Tecnologia
- **RSS URL**: https://rss.uol.com.br/feed/tecnologia.xml

## 🚫 Parar o Scraper

Se estiver rodando `uol.js` em loop:

```bash
# Pressione Ctrl+C no terminal
# Ou encontre o processo e mate:
ps aux | grep "node uol.js"
kill <PID>
```

## 📝 Logs

O scraper mostra:
- 🔍 Cada URL sendo processada
- ✅ Sucesso na criação
- ⏭️  Notícias puladas (duplicadas)
- ❌ Erros encontrados
- 📊 Estatísticas finais

## 🔄 Comparação G1 vs UOL

| Característica | G1 (index.js) | UOL (uol.js) |
|---------------|---------------|--------------|
| RSS URL | g1.globo.com | rss.uol.com.br |
| Categoria | tecnologia | tecnologia |
| Fonte | G1 Tecnologia | UOL Tecnologia |
| Seletor Principal | .mc-article-body | .content-text |
| Vídeos Especiais | bs-player (Globoplay) | Não |
| Frequência | A cada 5 min | A cada 5 min |

## ✨ Próximos Passos

1. ✅ Teste com `node uol-test.js`
2. ✅ Verifique as notícias no frontend (localhost:3000)
3. ✅ Se funcionou, rode `node uol.js` para produção
4. 🔄 Para rodar G1 e UOL juntos:
   ```bash
   node index.js &  # G1 em background
   node uol.js &    # UOL em background
   ```

## 🐛 Troubleshooting

### "Cannot find module 'node-fetch'"
```bash
cd /Users/rafaelsoares/directus/webscraper-service
npm install
```

### "Erro ao criar notícia: Unauthorized"
Verifique se o `DIRECTUS_TOKEN` está correto em `uol.js`

### "Conteúdo curto, pegando parágrafos"
Os seletores CSS podem ter mudado. Inspecione a página do UOL e atualize os seletores.

### Nenhuma notícia criada
Todas podem já existir! O scraper pula duplicatas automaticamente.


