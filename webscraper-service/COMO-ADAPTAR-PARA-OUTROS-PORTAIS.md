# Como Adaptar o Webscraper para Outros Portais

Este guia explica como adaptar o webscraper para coletar notícias de outros portais como Folha de S.Paulo, UOL, etc.

## 📋 Estrutura Genérica do Scraper

O scraper atual do G1 já está preparado para ser reutilizado com outros portais. As principais funções são:

1. **`fetchRSS()`** - Busca o feed RSS do portal
2. **`scrapePage(url)`** - Extrai conteúdo da página
3. **`noticiaExiste(url, slug)`** - Verifica duplicatas
4. **`createNoticia()`** - Cria notícia no Directus

## 🔧 Passos para Adicionar Novo Portal

### 1. Configure o RSS e Domínio

```javascript
// Exemplo para Folha de S.Paulo
const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'webscraper-token-12345';
const RSS_URL = 'https://feeds.folha.uol.com.br/folha/cotidiano/rss091.xml';
const BASE_DOMAIN = 'https://www1.folha.uol.com.br'; // para URLs relativas
```

### 2. Ajuste os Seletores CSS

Cada portal tem uma estrutura HTML diferente. Ajuste os seletores na função `scrapePage()`:

```javascript
// Exemplo para Folha
const selectors = [
  '.c-news__body',           // Folha
  'article.news-item',       // UOL
  '.article-content',        // Genérico
  'div[itemprop="articleBody"]',
  'main article'
];
```

### 3. Ajuste a Extração de Metadados

```javascript
// Metadados (geralmente funciona para todos)
const titulo = $('meta[property="og:title"]').attr('content') || $('h1').first().text();
const resumo = $('meta[property="og:description"]').attr('content') || '';
const ogImage = $('meta[property="og:image"]').attr('content') || '';
```

### 4. Remova Elementos Específicos do Portal

```javascript
// Exemplo para Folha
$content('.paywall, .special-ad, .related-news').remove();

// Exemplo para UOL
$content('.publicidade, .banner, .chamada-relacionada').remove();

// Remoções por texto específico do portal
$content('p').each((i, el) => {
  const text = $content(el).text().trim().toLowerCase();
  if (text.includes('assine a folha') || text === 'continuar lendo') {
    $content(el).remove();
  }
});
```

### 5. Ajuste URLs Relativas

```javascript
// Imagens
$content('img').each((i, el) => {
  const src = $content(el).attr('src');
  if (src) {
    if (src.startsWith('//')) $content(el).attr('src', `https:${src}`);
    else if (src.startsWith('/')) $content(el).attr('src', `${BASE_DOMAIN}${src}`);
  }
});

// Links
$content('a').each((i, el) => {
  const href = $content(el).attr('href');
  if (href && href.startsWith('/')) {
    $content(el).attr('href', `${BASE_DOMAIN}${href}`);
  }
});
```

### 6. Configure Categoria e Fonte

```javascript
const noticia = {
  titulo: item.titulo,
  slug,
  resumo: item.resumo,
  conteudo: item.conteudo,
  link_original: url,
  categoria: 'politica', // Ajuste conforme o feed
  autor: 1,
  status: 'published',
  destaque: false,
  fonte_rss: 'Folha - Cotidiano', // Nome do portal
  url_imagem: item.imagem,
  video_url: item.video_url || null,
  embed_html: item.embed_html || null,
  data_publicacao: data_publicacao ? new Date(data_publicacao).toISOString() : new Date().toISOString()
};
```

## 📚 Exemplos de RSS de Portais Brasileiros

### Folha de S.Paulo
```
https://feeds.folha.uol.com.br/folha/cotidiano/rss091.xml
https://feeds.folha.uol.com.br/poder/rss091.xml
https://feeds.folha.uol.com.br/mundo/rss091.xml
```

### UOL
```
https://rss.uol.com.br/feed/noticias.xml
https://rss.uol.com.br/feed/tecnologia.xml
https://rss.uol.com.br/feed/economia.xml
```

### Estadão
```
https://www.estadao.com.br/rss/ultimas.xml
https://www.estadao.com.br/rss/politica.xml
https://www.estadao.com.br/rss/tecnologia.xml
```

### BBC Brasil
```
https://feeds.bbci.co.uk/portuguese/rss.xml
```

## 🎯 Estratégia Multi-Portal

### Opção 1: Arquivo Separado por Portal

Crie arquivos separados para cada portal:
- `index.js` (G1)
- `folha.js` (Folha)
- `uol.js` (UOL)

Execute todos em paralelo:
```bash
node index.js &
node folha.js &
node uol.js &
```

### Opção 2: Multi-portal no Mesmo Arquivo

Crie um arquivo `index-multiportal.js` que importa diferentes scrapers:

```javascript
import { scrapeG1 } from './portals/g1.js';
import { scrapeFolha } from './portals/folha.js';
import { scrapeUOL } from './portals/uol.js';

async function runAll() {
  console.log('[Multi-Scraper] Iniciando todos os portais...');
  
  await Promise.allSettled([
    scrapeG1(),
    scrapeFolha(),
    scrapeUOL()
  ]);
  
  console.log('[Multi-Scraper] Todos os portais processados!');
}

// Executar a cada 5 minutos
runAll();
setInterval(runAll, 5 * 60 * 1000);
```

## 🔍 Dicas de Debugging

### 1. Testar Seletores
```javascript
// Adicione logs temporários para testar
console.log('Seletores encontrados:');
selectors.forEach(sel => {
  console.log(`${sel}: ${$(sel).length} elementos`);
});
```

### 2. Verificar HTML Extraído
```javascript
// Salve o HTML para análise
import fs from 'fs';
fs.writeFileSync('debug.html', conteudo);
```

### 3. Testar com Uma URL
```javascript
// Comente o loop e teste com uma URL específica
const url = 'https://www1.folha.uol.com.br/cotidiano/2024/...';
const item = await scrapePage(url);
console.log(JSON.stringify(item, null, 2));
```

## ⚠️ Considerações Importantes

1. **Respeite o robots.txt** de cada portal
2. **Use delays** entre requests (2-5 segundos)
3. **User-Agent** realista para evitar bloqueios
4. **Monitore erros** e ajuste seletores quando o portal mudar
5. **Verifique licença** de uso do conteúdo
6. **Atribua créditos** ao portal original

## 🚀 Recursos Avançados

### Rate Limiting
```javascript
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

for (const url of urls) {
  await scrapePage(url);
  await delay(3000); // 3 segundos entre cada request
}
```

### Retry em Caso de Erro
```javascript
async function scrapeWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await scrapePage(url);
    } catch (error) {
      console.log(`Tentativa ${i + 1} falhou: ${error.message}`);
      if (i === maxRetries - 1) throw error;
      await delay(5000); // Aguarda 5s antes de tentar novamente
    }
  }
}
```

### Cache de URLs Já Processadas
```javascript
const processedUrls = new Set();

async function shouldProcess(url) {
  if (processedUrls.has(url)) return false;
  const existe = await noticiaExiste(url);
  if (!existe) processedUrls.add(url);
  return !existe;
}
```

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Logs do scraper
2. Estrutura HTML do portal alvo
3. Status code das respostas HTTP
4. Configurações de rede/firewall


