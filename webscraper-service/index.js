import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'webscraper-token-12345';
const RSS_URL = 'https://g1.globo.com/rss/g1/tecnologia/';

console.log('[Webscraper] Serviço iniciado - G1 Tecnologia');

async function fetchRSS() {
  console.log('[Webscraper] Buscando RSS...');
  const response = await fetch(RSS_URL);
  const xml = await response.text();

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

  const html = await response.text();
  const $ = cheerio.load(html);

  // Metadados
  const titulo =
    $('meta[property="og:title"]').attr('content') || $('h1').first().text();
  const resumo = $('meta[property="og:description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';

  // Vídeo
  let video_url = null;
  let embed_html = null;

  // bs-player (Globoplay)
  const bsPlayer = $('bs-player').first();
  if (bsPlayer.length > 0) {
    const videoId = bsPlayer.attr('videoid');
    if (videoId) {
      video_url = `https://globoplay.globo.com/v/${videoId}/`;
      console.log(`[Webscraper] Vídeo Globoplay: ${video_url}`);
    }
  }

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

  // Conteúdo do artigo
  let conteudo = '';
  const selectors = [
    '.mc-article-body',
    '.content-text',
    'article.content-text__container',
    '.content-text__container',
    'article[itemprop="articleBody"]',
    '.mc-column.content-text',
    '.content-text.mc-column',
    'div[itemprop="articleBody"]',
    '.article-content',
    'main article'
  ];

  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      const h = element.html();
      if (h && h.length > conteudo.length) {
        conteudo = h;
        console.log(
          `[Webscraper] Conteúdo com ${selector} (${h.length} chars)`
        );
      }
    }
  }

  if (!conteudo || conteudo.length < 500) {
    console.log('[Webscraper] Conteúdo curto, pegando parágrafos do body');
    const paragraphs = $('p, h2, h3, h4, ul, ol, blockquote').toArray();
    conteudo = paragraphs.map(p => $.html(p)).join('\n');
  }

  const $content = cheerio.load(conteudo);

  // Limpezas básicas
  $content('script:not([type="application/ld+json"])').remove();
  $content('style').remove();
  $content(
    '.advertising, .ad-container, .newsletter, .related-content, .comments-section, .social-share, .header, .footer, .menu, .navigation'
  ).remove();

  // Remoções por texto
  $content('div').each((i, el) => {
    const $div = $content(el);
    const text = $div.text().trim();
    if (
      text === 'Inscreva-se e receba a newsletter' ||
      text === 'Para se inscrever, entre ou crie uma conta Globo gratuita.' ||
      text === 'Veja mais:' ||
      text === 'Veja também:' ||
      text === 'Ops!' ||
      text === 'Ok'
    ) {
      $div.remove();
    }
  });
  $content('p').each((i, el) => {
    const $p = $content(el);
    const text = $p.text().trim();
    const normalized = text.replace(/[\s\u00A0]+/g, ' ').trim().toLowerCase();
    if (normalized === 'ops!' || normalized === 'ok') $p.remove();
  });

  // Remover bloco de newsletter "Resumo do dia"
  $content('h1,h2,h3,h4').each((i, el) => {
    const $h = $content(el);
    const t = $h.text().replace(/[\s\u00A0]+/g, ' ').trim().toLowerCase();
    if (t === 'resumo do dia') {
      const $container = $h.closest('section, article, div');
      if ($container && $container.length) {
        $container.remove();
      } else {
        $h.next('p').remove();
        $h.remove();
      }
    }
  });
  $content('p').each((i, el) => {
    const t = $content(el).text().replace(/[\s\u00A0]+/g, ' ').trim().toLowerCase();
    if (/notícias que você não pode perder.*e-mail/.test(t)) {
      const $parentBlock = $content(el).closest('section, article, div');
      if ($parentBlock && $parentBlock.length) $parentBlock.remove();
      else $content(el).remove();
    }
  });

  // Remover elementos unitários com texto trivial "Ok" ou "Ops!" (independente da tag)
  $content('*').each((i, el) => {
    const $el = $content(el);
    if ($el.children().length === 0) {
      const t = $el.text().replace(/[\s\u00A0]+/g, ' ').trim().toLowerCase();
      if (t === 'ok' || t === 'ops!') $el.remove();
    }
  });

  // Containers vazios
  $content('.content-media-container').each((i, el) => {
    const $container = $content(el);
    const hasContent =
      $container.find('img, video, iframe, amp-img, bs-player').length > 0;
    const hasText = $container.text().trim().length > 0;
    if (!hasContent && !hasText) $container.remove();
  });

  // Normalização de imagens
  $content('img').each((i, el) => {
    const $img = $content(el);
    $img.removeAttr('hidden style');
    $img.removeClass('hidden');
    if (!$img.attr('src') && $img.attr('data-src')) {
      $img.attr('src', $img.attr('data-src'));
    }
    if (!$img.attr('alt')) $img.attr('alt', 'Imagem da notícia');
  });

  $content('figure').each((i, el) => {
    const $figure = $content(el);
    const $img = $figure.find('img');
    if ($img.length > 0) {
      $figure.removeAttr('hidden style');
      $figure.removeClass('hidden');
    }
  });

  $content('amp-img').each((i, el) => {
    const $ampImg = $content(el);
    const src = $ampImg.attr('src') || $ampImg.attr('srcset');
    const alt = $ampImg.attr('alt') || 'Imagem da notícia';
    if (src) {
      $ampImg.replaceWith(`<img src="${src}" alt="${alt}" class="news-image">`);
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
      else if (src.startsWith('/')) $content(el).attr('src', `https://g1.globo.com${src}`);
    }
    if (dataSrc) {
      if (dataSrc.startsWith('//')) {
        $content(el).attr('data-src', `https:${dataSrc}`);
        if (!src) $content(el).attr('src', `https:${dataSrc}`);
      } else if (dataSrc.startsWith('/')) {
        $content(el).attr('data-src', `https://g1.globo.com${dataSrc}`);
        if (!src) $content(el).attr('src', `https://g1.globo.com${dataSrc}`);
      }
    }
    if (srcset) {
      const fixedSrcset = srcset
        .split(',')
        .map(item => {
          const [url0, descriptor] = item.trim().split(/\s+/);
          let fixedUrl = url0;
          if (url0.startsWith('//')) fixedUrl = `https:${url0}`;
          else if (url0.startsWith('/')) fixedUrl = `https://g1.globo.com${url0}`;
          return descriptor ? `${fixedUrl} ${descriptor}` : fixedUrl;
        })
        .join(', ');
      $content(el).attr('srcset', fixedSrcset);
    }
  });

  // TikTok → iframe
  $content('amp-tiktok').each((i, el) => {
    const tiktokUrl = $content(el).attr('data-src');
    if (tiktokUrl) {
      const videoId = tiktokUrl.match(/\/video\/(\d+)/)?.[1];
      if (videoId) {
        const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
        $content(el).replaceWith(
          `<iframe class="news-embed" src="${embedUrl}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`
        );
      }
    }
  });

  // ======= bs-player (Globoplay) → Card com play, sem duplicar miniatura =======
  $content('bs-player').each((i, el) => {
    const $bs = $content(el);
    const videoId = $bs.attr('videoid');
    console.log(`[Webscraper] Encontrado bs-player com videoId: ${videoId}`);

    if (!videoId) {
      $bs.remove();
      return;
    }

    const videoUrl = `https://globoplay.globo.com/v/${videoId}/`;

    // Container típico que agrega bs-player + img
    const $container = $bs.closest(
      '.cxm-video-block, [data-block-type="backstage"], .content-media, .content-media-container, figure, .media-wrapper'
    );

    // Miniatura preferencial: a do container; fallback: og:image; por fim, placeholder
    let thumbnailUrl = '';
    const $imgInContainer = $container.length
      ? $container.find('img').first()
      : $bs.parent().find('img').first();

    if ($imgInContainer && $imgInContainer.length > 0) {
      thumbnailUrl = $imgInContainer.attr('src') || $imgInContainer.attr('data-src') || '';
    }
    if (!thumbnailUrl) thumbnailUrl = ogImage;
    if (!thumbnailUrl) thumbnailUrl = 'https://via.placeholder.com/800x450/1a365d/ffffff?text=Vídeo+G1';

    if (thumbnailUrl.startsWith('//')) thumbnailUrl = `https:${thumbnailUrl}`;
    else if (thumbnailUrl.startsWith('/')) thumbnailUrl = `https://g1.globo.com${thumbnailUrl}`;

    const videoCardHtml = `
      <div class="news-video-thumbnail">
        <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="news-video-thumbnail-link">
          <img src="${thumbnailUrl}" alt="Vídeo do G1" class="news-video-thumbnail-img">
          <div class="news-video-play-overlay"><div class="news-video-play-icon">▶</div></div>
        </a>
      </div>
    `;

    // Substituir o CONTAINER inteiro (remove a img que ficava por cima)
    if ($container && $container.length) $container.replaceWith(videoCardHtml);
    else $bs.replaceWith(videoCardHtml);
  });

  // Limpeza de blocos de mídia vazios
  $content('.cxm-video-block, [data-block-type="backstage"]').each((i, el) => {
    const $block = $content(el);
    const hasMedia = $block.find('img, iframe, video, .news-video-thumbnail').length > 0;
    const hasText = $block.find('p, h1, h2, h3, h4').length > 0;
    if (!hasMedia && !hasText) $block.remove();
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
      else if (src.startsWith('/')) $content(el).attr('src', `https://g1.globo.com${src}`);
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
      $content(el).attr('href', `https://g1.globo.com${href}`);
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

async function createNoticia(item, url, data_publicacao) {
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

  const noticia = {
    titulo: item.titulo,
    slug,
    resumo: item.resumo,
    conteudo: item.conteudo,
    link_original: url,
    categoria: 'tecnologia',
    autor: 1,
    status: 'published',
    destaque: false,
    fonte_rss: 'G1 Tecnologia',
    url_imagem: item.imagem,     // agora SEMPRE vem com og:image
    video_url: item.video_url || null,
    embed_html: item.embed_html || null,
    data_publicacao: data_publicacao ? new Date(data_publicacao).toISOString() : new Date().toISOString()
  };

  console.log(`[Webscraper] Criando notícia: ${noticia.titulo.substring(0, 50)}...`);

  const response = await fetch(`${DIRECTUS_URL}/items/noticias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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

async function run() {
  try {
    console.log('[Webscraper] Iniciando importação...');
    const urls = await fetchRSS();

    let criadas = 0;
    let puladas = 0;
    let erros = 0;

    for (let i = 0; i < urls.length; i++) {
      const { url, data_publicacao } = urls[i];
      try {
        const item = await scrapePage(url);
        item.destaque = i === 0; // primeira é destaque
        const resultado = await createNoticia(item, url, data_publicacao);

        if (resultado === true) criadas++;
        else if (resultado === 'skipped') puladas++;
        else erros++;

        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`[Webscraper] Erro ao processar ${url}:`, error.message);
        erros++;
      }
    }

    console.log('[Webscraper] ========================================');
    console.log(`[Webscraper] Importação concluída!`);
    console.log(`[Webscraper] Total processado: ${urls.length}`);
    console.log(`[Webscraper] Criadas: ${criadas}`);
    console.log(`[Webscraper] Puladas (duplicadas): ${puladas}`);
    console.log(`[Webscraper] Erros: ${erros}`);
    console.log('[Webscraper] ========================================');
  } catch (error) {
    console.error('[Webscraper] Erro:', error);
  }
}

// Executar a cada 5 minutos
console.log('[Webscraper] Agendando execuções a cada 5 minutos...');
run(); // imediato
setInterval(run, 5 * 60 * 1000); // 5 minutos
