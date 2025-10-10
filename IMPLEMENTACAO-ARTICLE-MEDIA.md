# ArticleMedia Component - Renderização Mutuamente Exclusiva

## Resumo da Implementação

Implementei um componente `ArticleMedia` que resolve o problema de renderização dupla de mídia (miniatura + embed). O componente garante que **apenas uma mídia seja renderizada por vez**:

- **Se há vídeo** (`embedHtml` ou `videoUrl`) → renderiza **apenas** o player
- **Se não há vídeo** → renderiza **apenas** a imagem
- **Nunca renderiza ambos simultaneamente**

## Arquivos Criados/Modificados

### 1. Componente Principal
- **`/frontend/components/ArticleMedia.tsx`** - Componente principal com lógica de renderização mutuamente exclusiva

### 2. Helper para Embed
- **`/frontend/lib/embed.ts`** - Funções para verificar se URLs podem ser exibidas em iframe

### 3. Configuração Next.js
- **`/frontend/next.config.ts`** - Adicionados domínios de imagem do G1/Globo

### 4. Interface TypeScript
- **`/frontend/lib/directus.ts`** - Adicionados campos `video_url` e `embed_html` à interface `Noticia`

### 5. Página de Notícia
- **`/frontend/app/noticia/[slug]/page.tsx`** - Atualizada para usar `ArticleMedia`

### 6. Webscraper
- **`/webscraper-service/index.js`** - Atualizado para extrair informações de vídeo

### 7. Banco de Dados
- **Campos adicionados**: `video_url` e `embed_html` na tabela `noticias`

## Como Testar

### 1. Limpar Cache e Reiniciar
```bash
# No terminal do frontend
cd frontend
rm -rf .next
npm run dev
```

### 2. Limpar Notícias e Reimportar
```bash
# No terminal principal
docker compose exec postgres psql -U postgres -d directus -c "DELETE FROM noticias;"
cd webscraper-service
node index.js
```

### 3. Verificar no Browser
1. Acesse `http://localhost:3000`
2. Clique em uma notícia que tenha vídeo
3. **Verificar no DevTools**:
   - **Com vídeo**: Deve existir `<iframe>` e **NÃO** deve existir `<img>` na área de mídia
   - **Sem vídeo**: Deve existir `<img>` e **NÃO** deve existir `<iframe>` na área de mídia

### 4. Teste Manual no DevTools
```javascript
// No console do browser
// Verificar se não há elementos duplicados
document.querySelectorAll('.news-content iframe').length
document.querySelectorAll('.news-content img').length

// Deve retornar apenas 1 de cada tipo por notícia
```

## Comportamento Esperado

### ✅ Cenário 1: Notícia COM vídeo
- **Renderiza**: Apenas o player de vídeo (iframe ou embed HTML)
- **NÃO renderiza**: Imagem de miniatura sobreposta
- **Resultado**: Player limpo sem elementos conflitantes

### ✅ Cenário 2: Notícia SEM vídeo  
- **Renderiza**: Apenas a imagem principal
- **NÃO renderiza**: Elementos de vídeo
- **Resultado**: Imagem limpa sem placeholders de vídeo

### ✅ Cenário 3: Vídeo bloqueado (Globoplay)
- **Renderiza**: Card com link "Assistir no site original"
- **NÃO renderiza**: Iframe quebrado ou imagem duplicada
- **Resultado**: UX consistente mesmo com bloqueios

## Estrutura do Componente

```typescript
type ArticleMediaProps = {
  title: string;
  imageUrl?: string;      // URL da imagem
  imageAlt?: string;     // Alt text da imagem
  embedHtml?: string;    // HTML do player (prioridade)
  videoUrl?: string;      // URL do vídeo (fallback)
  className?: string;     // Classes CSS adicionais
};
```

## Lógica de Prioridade

1. **`embedHtml`** (maior prioridade) - HTML pronto do player
2. **`videoUrl`** (segunda prioridade) - URL para criar iframe
3. **`imageUrl`** (fallback) - Imagem quando não há vídeo
4. **`null`** (último caso) - Não renderiza nada

## Testes Automatizados

Criei testes em `/frontend/components/__tests__/ArticleMedia.test.tsx` que verificam:
- Renderização mutuamente exclusiva
- Prioridade de `embedHtml` sobre `videoUrl`
- Comportamento com URLs bloqueadas
- Casos edge (sem mídia)

## Próximos Passos

1. **Testar** a implementação com notícias reais
2. **Verificar** se não há regressões visuais
3. **Ajustar** estilos se necessário
4. **Documentar** para outros desenvolvedores

## Troubleshooting

### Erro: "Module not found: clsx"
- **Solução**: `npm install clsx` (já resolvido)

### Erro: "Can't resolve '@/lib/embed'"
- **Verificar**: Se o arquivo `/frontend/lib/embed.ts` existe

### Vídeos não aparecem
- **Verificar**: Se os campos `video_url` e `embed_html` foram adicionados ao banco
- **Verificar**: Se o webscraper está extraindo URLs de vídeo corretamente

### Imagens quebradas
- **Verificar**: Se os domínios estão configurados no `next.config.ts`
- **Verificar**: Se as URLs das imagens são válidas



