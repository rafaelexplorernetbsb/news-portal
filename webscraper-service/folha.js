import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import iconv from 'iconv-lite';

// Carregar variáveis de ambiente
dotenv.config({ path: './env.local' });

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';

const RSS_FEEDS = [
  { url: 'https://feeds.folha.uol.com.br/folha/tec/rss091.xml', categoria: 'tecnologia' },
  { url: 'https://feeds.folha.uol.com.br/folha/esporte/rss091.xml', categoria: 'esportes' },
  { url: 'https://feeds.folha.uol.com.br/folha/dinheiro/rss091.xml', categoria: 'economia' },
  { url: 'https://feeds.folha.uol.com.br/folha/brasil/rss091.xml', categoria: 'cultura' },
  { url: 'https://feeds.folha.uol.com.br/folha/poder/rss091.xml', categoria: 'politica' }
];

const CATEGORIAS_MAP = {
  'tecnologia': 1,
  'politica': 2,
  'economia': 3,
  'esportes': 4,
  'cultura': 5
};

async function fetchRSS(feedUrl, categoria) {
  console.log(`[Webscraper] Buscando RSS de ${categoria}: ${feedUrl}...`);
  const response = await fetch(feedUrl);
  const buffer = await response.buffer();
  
  // RSS feeds geralmente são UTF-8, mas vamos verificar
  const contentType = response.headers.get('content-type') || '';
  let charset = 'utf-8';
  const charsetMatch = contentType.match(/charset=([^;]+)/i);
  if (charsetMatch) {
    charset = charsetMatch[1].trim().toLowerCase();
  }
  
  const xml = iconv.decode(buffer, charset);

  // Extrair URLs dos itens
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  const urls = [];

  for (let i = 0; i < itemMatches.length; i++) {
    const item = itemMatches[i];
    const linkMatch = item.match(/<link>(.*?)<\/link>/);
    const titleMatch =
      item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s) ||
      item.match(/<title>(.*?)<\/title>/s);
    const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);

    if (linkMatch && titleMatch) {
      urls.push({
        url: linkMatch[1].trim(),
        titulo: titleMatch[1].trim(),
        data_publicacao: dateMatch ? dateMatch[1].trim() : ''
      });
    }
  }

  console.log(`[Webscraper] ${urls.length} URLs extraídas do RSS`);
  return urls;
}

async function scrapePage(url) {
  console.log(`[Webscraper] Fazendo scraping: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  // Pegar o buffer e detectar encoding correto
  const buffer = await response.buffer();
  const contentType = response.headers.get('content-type') || '';
  
  // Detectar charset do Content-Type ou do HTML
  let charset = 'utf-8';
  const charsetMatch = contentType.match(/charset=([^;]+)/i);
  if (charsetMatch) {
    charset = charsetMatch[1].trim().toLowerCase();
    console.log(`[Webscraper] Charset detectado no header: ${charset}`);
  } else {
    // Tentar detectar do HTML (meta tag)
    const htmlSnippet = buffer.toString('latin1', 0, 1024);
    const metaCharsetMatch = htmlSnippet.match(/<meta[^>]+charset=["']?([^"'\s>]+)/i);
    if (metaCharsetMatch) {
      charset = metaCharsetMatch[1].toLowerCase();
      console.log(`[Webscraper] Charset detectado no HTML: ${charset}`);
    }
  }
  
  // Decodificar com o charset correto
  let html;
  if (iconv.encodingExists(charset)) {
    html = iconv.decode(buffer, charset);
  } else {
    console.log(`[Webscraper] Charset desconhecido (${charset}), usando UTF-8`);
    html = iconv.decode(buffer, 'utf-8');
  }
  
  const $ = cheerio.load(html, { decodeEntities: true });
  

  // Metadados
  const titulo = 
    $('meta[property="og:title"]').attr('content') ||
    $('h1.c-content-head__title').first().text().trim() ||
    $('h1').first().text();
  const resumo = $('meta[property="og:description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  
  // Debug: mostrar preview do título para verificar encoding
  console.log(`[Webscraper] Preview título: ${titulo.substring(0, 100)}...`);

  // Vídeo
  let video_url = null;
  let embed_html = null;

  // iframes (YouTube/Vimeo)
  const videoIframe = $(
    'iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="vimeo"]'
  ).first();
  if (videoIframe.length > 0) {
    const src = videoIframe.attr('src');
    if (src) {
      video_url = src;
      console.log(`[Webscraper] Vídeo iframe: ${video_url}`);
    }
  }

  // Conteúdo do artigo - PRIORIZANDO CONTEÚDO REAL DO ARTIGO
  let conteudo = '';
  const selectors = [
    '.c-news__body',           // MELHOR: Conteúdo real do artigo (4,600 chars, 10 parágrafos)
    'article .c-news__body',   // Alternativa: dentro do article
    'main .c-news__body',      // Alternativa: dentro do main
    '.c-news__content',        // Fallback: conteúdo mais amplo
    'article.c-news',          // Fallback: article completo
    'article',                 // Fallback: qualquer article
    'main'                     // Último recurso: main completo
  ];

  // PRIORIZAR .c-news__body que é o conteúdo real do artigo
  const newsBody = $('.c-news__body');
  if (newsBody.length > 0) {
    conteudo = newsBody.html();
    console.log(`[Webscraper] Conteúdo com .c-news__body (${conteudo.length} chars)`);
  } else {
    // Fallback para outros selectors se .c-news__body não existir
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        const h = element.html();
        if (h && h.length > conteudo.length) {
          conteudo = h;
          console.log(`[Webscraper] Fallback com ${selector} (${h.length} chars)`);
        }
      }
    }
  }

  // Fallback mais agressivo se ainda não tiver conteúdo suficiente
  if (!conteudo || conteudo.length < 1000) {
    console.log('[Webscraper] Conteúdo curto, usando fallback agressivo');
    const paragraphs = $('p, h2, h3, h4, ul, ol, blockquote, div.c-news__text').toArray();
    conteudo = paragraphs.map(p => $.html(p)).join('\n');
    console.log(`[Webscraper] Fallback: ${conteudo.length} chars`);
  }

  const $content = cheerio.load(conteudo);

  // Limpezas básicas - AGRESSIVAS PARA REMOVER ELEMENTOS DESNECESSÁRIOS
  $content('script:not([type="application/ld+json"])').remove();
  $content('style').remove();

  // Remover elementos de compartilhamento e interação
  $content('.social-share, .c-share, .share-buttons, .compartilhar, .redes-sociais').remove();
  $content('.facebook, .whatsapp, .twitter, .x, .messenger, .linkedin, .email, .e-mail').remove();
  $content('[class*="share"], [class*="social"], [class*="compartilhar"]').remove();

  // Remover elementos de navegação e interação
  $content('.voltar, .back, .navegacao, .navigation, .menu, .leia-mais, .read-more').remove();
  $content('[class*="voltar"], [class*="back"], [class*="navegacao"], [class*="menu"]').remove();

  // Remover elementos de carregamento e loading
  $content('.loading, .carregando, .spinner, [class*="loading"], [class*="carregando"]').remove();

  // Remover elementos de publicidade e newsletter
  $content('.advertising, .ad-container, .newsletter, .related-content, .comments-section, .c-advertising, .c-newsletter, .c-share, .c-related, .paywall, .c-paywall').remove();

  // Remover elementos com ícones e botões (mas preservar imagens do artigo)
  $content('.icon, .btn, .button, [class*="icon"], [class*="btn"], [class*="button"]').not('img').remove();

  // Remoções por texto - ESPECÍFICAS PARA ELEMENTOS DESNECESSÁRIOS
  $content('div, p, span, a, button').each((i, el) => {
    const $el = $content(el);
    const text = $el.text().trim();
    const lowerText = text.toLowerCase();
    // const html = $el.html() || ''; // Não utilizado no momento

    // NÃO remover elementos que contêm imagens do artigo
    if ($el.find('img').length > 0) {
      console.log(`[Webscraper] Preservando elemento com imagem: ${text.substring(0, 30)}...`);
      return;
    }

    // Remover elementos de compartilhamento social
    if (
      lowerText.includes('facebook') ||
      lowerText.includes('whatsapp') ||
      lowerText.includes('twitter') ||
      lowerText.includes('messenger') ||
      lowerText.includes('linkedin') ||
      lowerText.includes('e-mail') ||
      lowerText.includes('copiar link') ||
      lowerText.includes('compartilhe') ||
      lowerText.includes('compartilhar')
    ) {
      console.log(`[Webscraper] Removendo compartilhamento: ${text.substring(0, 30)}...`);
      $el.remove();
      return;
    }

    // Remover elementos de navegação
    if (
      text === 'Voltar' ||
      text === 'Back' ||
      lowerText.includes('leia mais') ||
      lowerText.includes('read more') ||
      lowerText.includes('ver novamente') ||
      lowerText.includes('see again')
    ) {
      console.log(`[Webscraper] Removendo navegação: ${text.substring(0, 30)}...`);
      $el.remove();
      return;
    }

    // Remover elementos de carregamento
    if (
      lowerText.includes('carregando') ||
      lowerText.includes('loading')
    ) {
      console.log(`[Webscraper] Removendo loading: ${text.substring(0, 30)}...`);
      $el.remove();
      return;
    }

    // Remover elementos de paywall/assinatura
    if (
      text === 'Leia também' ||
      text === 'Veja também' ||
      text === 'Leia mais' ||
      text === 'Ops!' ||
      text === 'Ok' ||
      lowerText.includes('benefício do assinante') ||
      lowerText.includes('recurso exclusivo para assinantes') ||
      lowerText.includes('assine') ||
      lowerText.includes('cadastre-se') ||
      lowerText.includes('faça login')
    ) {
      console.log(`[Webscraper] Removendo paywall: ${text.substring(0, 30)}...`);
      $el.remove();
    }
  });

  $content('p').each((i, el) => {
    const $p = $content(el);
    const text = $p.text().trim();
    const normalized = text.replace(/[\s\u00A0]+/g, ' ').trim().toLowerCase();
    if (normalized === 'ops!' || normalized === 'ok') $p.remove();
  });

  // Remover elementos vazios e limpar espaços em branco
  $content('div:empty, p:empty, span:empty, section:empty, article:empty').remove();

  // Remover elementos que só contêm espaços ou quebras de linha
  $content('*').each((i, el) => {
    const $el = $content(el);
    const text = $el.text().trim();
    const html = $el.html() || '';

    // Remover se está vazio ou só tem espaços/quebras
    if (text === '' && (html === '' || html === '<br>' || html === '<br/>' || html === '<br />' || /^\s*$/.test(html))) {
      $el.remove();
    }
  });

  // Remover br múltiplos e espaços excessivos
  $content('br + br, br + br + br').remove();

  // Remover divs que só contêm <br> ou espaços (mas preservar elementos de vídeo)
  $content('div').each((i, el) => {
    const $div = $content(el);
    const html = $div.html() || '';
    const text = $div.text().trim();

    // NÃO remover elementos de vídeo
    if ($div.hasClass('c-video') || $div.hasClass('js-widget-youtube') || $div.hasClass('widget-youtube')) {
      console.log(`[Webscraper] Preservando div de vídeo: ${html.substring(0, 50)}...`);
      return;
    }

    if (text === '' && (html === '<br>' || html === '<br/>' || html === '<br />' || /^[\s\n\r]*$/.test(html))) {
      $div.remove();
    }
  });

  // Processar imagens - PRESERVAR IMAGENS DO CORPO DA MATÉRIA
  $content('img').each((i, el) => {
    const $img = $content(el);
    const src = $img.attr('src') || $img.attr('data-src');
    const alt = $img.attr('alt') || '';
    const title = $img.attr('title') || '';

    if (src) {
      // Corrigir URLs relativas para absolutas
      if (src.startsWith('//')) {
        $img.attr('src', `https:${src}`);
      } else if (src.startsWith('/')) {
        $img.attr('src', `https://www1.folha.uol.com.br${src}`);
      }

      // Remover atributos que podem esconder a imagem
      $img.removeAttr('hidden');
      $img.removeClass('hidden');

      // Adicionar classes para styling
      if (!$img.hasClass('news-image')) {
        $img.addClass('news-image');
      }

      // Preservar atributos importantes
      if (alt) $img.attr('alt', alt);
      if (title) $img.attr('title', title);

      console.log(`[Webscraper] Processando imagem: ${src.substring(0, 50)}...`);
    } else {
      $img.remove();
    }
  });

  // Processar figures com imagens
  $content('figure').each((i, el) => {
    const $figure = $content(el);
    const $img = $figure.find('img');

    if ($img.length > 0) {
      // Remover atributos que podem esconder
      $figure.removeAttr('hidden');
      $figure.removeClass('hidden');

      // Adicionar classes para styling
      if (!$figure.hasClass('news-figure')) {
        $figure.addClass('news-figure');
      }

      // Preservar figcaption se existir
      const $caption = $figure.find('figcaption');
      if ($caption.length > 0) {
        if (!$caption.hasClass('news-caption')) {
          $caption.addClass('news-caption');
        }
      }

      console.log(`[Webscraper] Processando figure com imagem`);
    } else {
      // Remover figures sem imagens
      $figure.remove();
    }
  });

  // Processar vídeos do YouTube - SUPORTE COMPLETO PARA EMBEDS
  $content('iframe').each((i, el) => {
    const $iframe = $content(el);
    const src = $iframe.attr('src') || '';

    // Verificar se é um vídeo do YouTube
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      // Garantir que seja um embed responsivo
      $iframe.attr('frameborder', '0');
      $iframe.attr('allowfullscreen', 'true');
      $iframe.attr('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');

      // Adicionar classes para styling responsivo
      if (!$iframe.hasClass('news-video')) {
        $iframe.addClass('news-video');
      }

      console.log(`[Webscraper] Processando vídeo YouTube: ${src.substring(0, 50)}...`);
    }
    // Verificar outros tipos de vídeo
    else if (src.includes('vimeo.com') || src.includes('dailymotion.com')) {
      $iframe.attr('frameborder', '0');
      $iframe.attr('allowfullscreen', 'true');

      if (!$iframe.hasClass('news-video')) {
        $iframe.addClass('news-video');
      }

      console.log(`[Webscraper] Processando vídeo: ${src.substring(0, 50)}...`);
    }
    // Se não for um vídeo conhecido, remover
    else {
      $iframe.remove();
    }
  });

  // Processar elementos de vídeo da Folha com iframe vazio mas data-href
  $content('.c-video, .js-widget-youtube, .widget-youtube').each((i, el) => {
    const $videoEl = $content(el);
    const dataHref = $videoEl.attr('data-href') || '';


    // Verificar se tem data-href com YouTube
    if (dataHref.includes('youtube.com/watch') || dataHref.includes('youtu.be/')) {
      let videoId = '';

      if (dataHref.includes('youtube.com/watch')) {
        const match = dataHref.match(/[?&]v=([^&]+)/);
        if (match) videoId = match[1];
      } else if (dataHref.includes('youtu.be/')) {
        const match = dataHref.match(/youtu\.be\/([^?]+)/);
        if (match) videoId = match[1];
      }

      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const iframe = `<iframe src="${embedUrl}" frameborder="0" allowfullscreen class="news-video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;

        $videoEl.replaceWith(iframe);
        console.log(`[Webscraper] Convertendo elemento de vídeo da Folha para embed: ${videoId}`);
      }
    }
  });

  // Processar links de vídeo do YouTube que podem estar como texto
  $content('a').each((i, el) => {
    const $a = $content(el);
    const href = $a.attr('href') || '';
    // const text = $a.text().trim(); // Não utilizado no momento

    // Verificar se é um link do YouTube
    if (href.includes('youtube.com/watch') || href.includes('youtu.be/')) {
      // Converter link em iframe embed
      let videoId = '';

      if (href.includes('youtube.com/watch')) {
        const match = href.match(/[?&]v=([^&]+)/);
        if (match) videoId = match[1];
      } else if (href.includes('youtu.be/')) {
        const match = href.match(/youtu\.be\/([^?]+)/);
        if (match) videoId = match[1];
      }

      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const iframe = `<iframe src="${embedUrl}" frameborder="0" allowfullscreen class="news-video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;

        $a.replaceWith(iframe);
        console.log(`[Webscraper] Convertendo link YouTube para embed: ${videoId}`);
      }
    }
  });

  // Classes utilitárias
  $content('p').addClass('news-paragraph');
  $content('h2').addClass('news-heading-2');
  $content('h3').addClass('news-heading-3');
  $content('h4').addClass('news-heading-4');
  $content('ul, ol').addClass('news-list');
  $content('li').addClass('news-list-item');
  $content('blockquote').addClass('news-quote');
  $content('a').addClass('news-link');
  $content('img').addClass('news-image');
  $content('figure').addClass('news-figure');
  $content('video').addClass('news-video');
  $content('iframe').addClass('news-embed');
  $content('audio').addClass('news-audio');

  // URLs absolutas em imagens
  $content('img').each((i, el) => {
    const src = $content(el).attr('src');
    const dataSrc = $content(el).attr('data-src');
    const srcset = $content(el).attr('srcset');

    if (src) {
      if (src.startsWith('//')) $content(el).attr('src', `https:${src}`);
      else if (src.startsWith('/')) $content(el).attr('src', `https://www1.folha.uol.com.br${src}`);
    }
    if (dataSrc) {
      if (dataSrc.startsWith('//')) {
        $content(el).attr('data-src', `https:${dataSrc}`);
        if (!src) $content(el).attr('src', `https:${dataSrc}`);
      } else if (dataSrc.startsWith('/')) {
        $content(el).attr('data-src', `https://www1.folha.uol.com.br${dataSrc}`);
        if (!src) $content(el).attr('src', `https://www1.folha.uol.com.br${dataSrc}`);
      }
    }
    if (srcset) {
      const fixedSrcset = srcset
        .split(',')
        .map(item => {
          const [url0, descriptor] = item.trim().split(/\s+/);
          let fixedUrl = url0;
          if (url0.startsWith('//')) fixedUrl = `https:${url0}`;
          else if (url0.startsWith('/')) fixedUrl = `https://www1.folha.uol.com.br${url0}`;
          return descriptor ? `${fixedUrl} ${descriptor}` : fixedUrl;
        })
        .join(', ');
      $content(el).attr('srcset', fixedSrcset);
    }
  });

  // Ajustes em iframes
  $content('iframe[src*="youtube.com"], iframe[src*="youtu.be"]').each((i, el) => {
    const src = $content(el).attr('src');
    if (src && src.startsWith('//')) $content(el).attr('src', `https:${src}`);
    $content(el).addClass('news-embed');
    if (!$content(el).attr('allowfullscreen')) $content(el).attr('allowfullscreen', 'true');
  });

  $content('iframe').each((i, el) => {
    const src = $content(el).attr('src');
    if (src) {
      if (src.startsWith('//')) $content(el).attr('src', `https:${src}`);
      else if (src.startsWith('/')) $content(el).attr('src', `https://www1.folha.uol.com.br${src}`);
    }
    if (!$content(el).attr('allowfullscreen')) $content(el).attr('allowfullscreen', 'true');
  });

  // Áudio / podcast
  $content('iframe[class*="podcast"], iframe[class*="audio"], iframe[src*="podcast"], iframe[src*="audio"]').each((i, el) => {
    $content(el).attr('height', '80').addClass('news-audio-embed');
  });

  $content('iframe').each((i, el) => {
    const src = $content(el).attr('src') || '';
    if (src.includes('podcast') || src.includes('audio')) {
      $content(el).attr('height', '80').addClass('news-audio-embed');
    } else if (src.includes('youtube')) {
      $content(el).attr('height', '400');
    } else if (!$content(el).attr('height')) {
      $content(el).attr('height', '300');
    }
  });

  // Links absolutos
  $content('a').each((i, el) => {
    const href = $content(el).attr('href');
    if (href && href.startsWith('/')) {
      $content(el).attr('href', `https://www1.folha.uol.com.br${href}`);
    }
  });

  const bodyHtml = `<div class="news-content">${$content.html()}</div>`;

  console.log(`[Webscraper] Scraping completo: ${titulo.substring(0, 50)}...`);
  console.log(`[Webscraper] Tamanho do conteúdo: ${bodyHtml.length} chars`);

  return {
    titulo,
    resumo: resumo.substring(0, 250),
    conteudo: bodyHtml,
    imagem: ogImage,          // <-- mantém a imagem de destaque sempre
    video_url,
    embed_html
  };
}

async function noticiaExiste(url, slug) {
  try {
    // Verificar por link_original
    const responseUrl = await fetch(
      `${DIRECTUS_URL}/items/noticias?filter[link_original][_eq]=${encodeURIComponent(url)}&limit=1`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DIRECTUS_TOKEN}`
        }
      }
    );

    const dataUrl = await responseUrl.json();
    if (dataUrl.data && dataUrl.data.length > 0) {
      console.log(`[Webscraper] Notícia já existe (link_original): ${url}`);
      return true;
    }

    // Verificar por slug
    const responseSlug = await fetch(
      `${DIRECTUS_URL}/items/noticias?filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DIRECTUS_TOKEN}`
        }
      }
    );

    const dataSlug = await responseSlug.json();
    if (dataSlug.data && dataSlug.data.length > 0) {
      console.log(`[Webscraper] Notícia já existe (slug): ${slug}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Webscraper] Erro ao verificar duplicata:', error.message);
    return false; // Em caso de erro, permite criar (evita bloquear todo o processo)
  }
}

async function createNoticia(item, url, data_publicacao, categoria) {
  const slug = item.titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);

  // Verificar se já existe
  const existe = await noticiaExiste(url, slug);
  if (existe) {
    console.log(`[Webscraper] Pulando notícia duplicada: ${item.titulo.substring(0, 50)}...`);
    return 'skipped';
  }

  const categoriaId = CATEGORIAS_MAP[item.categoria] || CATEGORIAS_MAP['tecnologia'];

  const noticia = {
    titulo: item.titulo,
    slug,
    resumo: item.resumo,
    conteudo: item.conteudo,
    link_original: url,
    categoria: categoriaId,
    autor: 1,
    status: 'published',
    destaque: false,
    fonte_rss: 'Folha - Tec',
    url_imagem: item.imagem,     // agora SEMPRE vem com og:image
    video_url: item.video_url || null,
    embed_html: item.embed_html || null,
    data_publicacao: data_publicacao ? new Date(data_publicacao).toISOString() : new Date().toISOString()
  };

  console.log(`[Webscraper] Criando notícia: ${noticia.titulo.substring(0, 50)}...`);

  const response = await fetch(`${DIRECTUS_URL}/items/noticias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${DIRECTUS_TOKEN}`
    },
    body: JSON.stringify(noticia)
  });

  if (response.ok) {
    console.log('[Webscraper] Notícia criada com sucesso!');
    return true;
  } else {
    const error = await response.text();
    console.log('[Webscraper] Erro ao criar notícia:', error);
    return false;
  }
}

async function runImport() {
  try {
   let criadas = 0;
   let puladas = 0;
   let erros = 0;
   let totalProcessado = 0;

   for (const feed of RSS_FEEDS) {
     console.log(`\n[Olhar Digital Test] ========================================`);
     console.log(`[Olhar Digital Test] Processando feed: ${feed.categoria.toUpperCase()}`);
     console.log(`[Olhar Digital Test] URL: ${feed.url}`);
     console.log(`[Olhar Digital Test] ========================================\n`);
     
     const urls = await fetchRSS(feed.url, feed.categoria);

     for (let i = 0; i < urls.length; i++) {
      const {url, data_publicacao } = urls[i];
      try {
        totalProcessado++;
        const item = await scrapePage(url);

        if (!item) {
          erros++;
          continue;
        }
        if (item && item.titulo) {
          const tituloLower = item.titulo.toLowerCase();
          if (tituloLower.includes('oferta') ||
              tituloLower.includes('promoção') ||
              tituloLower.includes('promocao') ||
              tituloLower.includes('desconto') ||
              tituloLower.includes('venda') ||
              tituloLower.includes('preço') ||
              tituloLower.includes('preco') ||
              tituloLower.includes('compra') ||
              tituloLower.includes('review') ||
              tituloLower.includes('análise') ||
              tituloLower.includes('analise')) {
            console.log(`[Olhar Digital Test] 🚫 FILTRANDO artigo de oferta/promoção: ${item.titulo.substring(0, 50)}...`);
            continue; // Pular para o próximo item
          }
        }
        item.categoria = feed.categoria;
        item.destaque = i === 0 && criadas === 0; // Primeira notícia em destaque (apenas a primeira de todos os feeds)
        const resultado = await createNoticia(item, url, data_publicacao, feed.categoria);

        if (resultado === true) criadas++;
        else if (resultado === 'skipped') puladas++;
        else erros++;

        await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa entre requisições
      } catch (error) {
        console.error(`[Olhar Digital Test] ❌ Erro ao processar: ${error.message}`);
        erros++;
      }
      }
     }

      } catch (error) {
        console.error(`[Olhar Digital Test] ❌ Erro ao processar feed: ${error.message}`);

      }
    }
// Executar a cada 5 minutos
console.log('[Webscraper] Agendando execuções a cada 5 minutos...');
runImport(); // imediato
setInterval(runImport, 5 * 60 * 1000); // 5 minutos

