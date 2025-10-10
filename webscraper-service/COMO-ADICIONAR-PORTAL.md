# 📰 Como Adicionar um Novo Portal

Este guia mostra como adicionar suporte para importar notícias de outros portais de notícias.

## 🎯 Passo a Passo

### 1️⃣ Criar arquivo de configuração do portal

Crie um novo arquivo em `portals/nome-do-portal.js`:

```javascript
// Configuração específica para o portal [NOME]

export const config = {
    nome: '[NOME] Tecnologia',           // Nome que aparecerá em fonte_rss
    rssUrl: 'https://exemplo.com/rss',   // URL do feed RSS
    categoria: 'tecnologia',              // Categoria das notícias
    limiteNoticias: 3                     // Quantas notícias importar por vez
};

export function extractContent($, html) {
    // Seletores CSS específicos do portal
    const selectors = [
        '.article-content',
        'article.main',
        'div[itemprop="articleBody"]'
    ];
    
    let conteudo = '';
    
    for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
            const html = element.html();
            if (html && html.length > conteudo.length) {
                conteudo = html;
                console.log(`[NOME] Conteúdo encontrado com: ${selector}`);
            }
        }
    }
    
    return conteudo;
}

export function processCustomElements($content) {
    // Processar elementos customizados específicos do portal
    // Exemplo: converter players de vídeo proprietários
}

export function extractMetadata($, html) {
    return {
        titulo: $('meta[property="og:title"]').attr('content') || $('h1').first().text(),
        resumo: $('meta[property="og:description"]').attr('content') || '',
        imagem: $('meta[property="og:image"]').attr('content') || ''
    };
}
```

### 2️⃣ Adicionar portal ao serviço

Abra `index-multiportal.js` e adicione o import:

```javascript
import * as nomePortal from './portals/nome-do-portal.js';
```

Depois adicione à lista de portais:

```javascript
const PORTALS = [
    g1Portal,
    folhaPortal,
    uolPortal,
    nomePortal    // ← Adicionar aqui
];
```

### 3️⃣ Testar o portal

Execute o serviço:

```bash
node index-multiportal.js
```

Verifique os logs para ver se o scraping está funcionando corretamente.

## 🔍 Como Descobrir os Seletores CSS

### Método 1: Inspecionar no navegador

1. Abra uma notícia do portal no navegador
2. Clique com botão direito no conteúdo da matéria
3. Selecione "Inspecionar elemento"
4. Procure por:
   - `<article>` tags
   - Classes como `.article-content`, `.post-content`, `.entry-content`
   - Atributos `itemprop="articleBody"`

### Método 2: Ver o código fonte

1. Abra a página da notícia
2. Pressione `Ctrl+U` (ou `Cmd+U` no Mac)
3. Procure por palavras-chave:
   - "article"
   - "content"
   - "body"
   - "post"

### Método 3: Usar o próprio serviço

Execute um teste rápido modificando temporariamente `extractContent`:

```javascript
export function extractContent($, html) {
    // Logar todas as possíveis classes
    console.log('Articles:', $('article').map((i, el) => $(el).attr('class')).get());
    console.log('Divs com content:', $('div[class*="content"]').map((i, el) => $(el).attr('class')).get());
    
    // ... resto do código
}
```

## 📋 Exemplos de Portais Brasileiros

### Folha de S.Paulo
- RSS: `https://www1.folha.uol.com.br/tec/feed/`
- Seletor: `.c-news__body`

### UOL Tecnologia
- RSS: `https://rss.uol.com.br/feed/tecnologia.xml`
- Seletor: `.text` ou `.p-content`

### Estadão
- RSS: `https://www.estadao.com.br/rss/link.xml`
- Seletor: `.styles__ArticleContent`

### TecMundo
- RSS: `https://www.tecmundo.com.br/rss`
- Seletor: `.tec--article__body`

### Olhar Digital
- RSS: `https://olhardigital.com.br/feed/`
- Seletor: `.mat-content`

## ⚙️ Configurações Avançadas

### Processar elementos customizados

Se o portal usa players de vídeo proprietários, adicione o processamento em `processCustomElements`:

```javascript
export function processCustomElements($content) {
    // Exemplo: converter player customizado
    $content('.custom-video-player').each((i, el) => {
        const videoUrl = $content(el).attr('data-video-url');
        const thumb = $content(el).attr('data-thumbnail');
        
        if (videoUrl && thumb) {
            $content(el).replaceWith(`
                <div class="news-video-container">
                    <a href="${videoUrl}" target="_blank" class="news-video-link">
                        <img src="${thumb}" alt="Vídeo" class="news-image">
                        <div class="news-video-play-button">▶ Assistir vídeo</div>
                    </a>
                </div>
            `);
        }
    });
}
```

### Alterar categoria por portal

No `config`, altere o campo `categoria`:

```javascript
export const config = {
    nome: 'Portal XYZ',
    rssUrl: 'https://xyz.com/rss',
    categoria: 'esportes',  // ← Alterar aqui
    limiteNoticias: 5
};
```

### Importar mais notícias

Aumente o `limiteNoticias`:

```javascript
export const config = {
    // ...
    limiteNoticias: 10  // Importar 10 notícias por vez
};
```

## 🚀 Executar com múltiplos portais

Depois de configurar todos os portais, execute:

```bash
# Parar serviço antigo
pkill -f "node index.js"

# Iniciar serviço multi-portal
nohup node index-multiportal.js > webscraper.log 2>&1 &
```

## 📊 Monitoramento

Ver logs em tempo real:

```bash
tail -f webscraper.log
```

Ver quantas notícias foram importadas por portal:

```sql
SELECT fonte_rss, COUNT(*) as total 
FROM noticias 
GROUP BY fonte_rss 
ORDER BY total DESC;
```

