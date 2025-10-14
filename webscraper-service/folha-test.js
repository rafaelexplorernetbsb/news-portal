import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';
const RSS_URL = 'https://feeds.folha.uol.com.br/tec/rss091.xml';


const CATEGORIAS_MAP = {
  'tecnologia': 1,
  'politica': 2,
  'economia': 3,
  'esportes': 4,
  'cultura': 5
};


async function fetchRSS() {
  console.log('[Folha Test] Buscando RSS...');
  const response = await fetch(RSS_URL);
  const xml = await response.text();

  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  const urls = [];

  for (let i = 0; i < Math.min(itemMatches.length, 3); i++) {
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

  console.log(`[Folha Test] ${urls.length} URLs extraídas (limitado a 3)`);
  return urls;
}

async function scrapePage(url) {
  console.log(`[Folha Test] Fazendo scraping: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Charset': 'UTF-8'
    }
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  // Função para corrigir caracteres mal codificados
  function corrigirEncoding(texto) {
    if (!texto) return texto;

    return texto
      // Corrigir caracteres de substituição Unicode (U+FFFD)
      .replace(/\uFFFD/g, 'ó')
      // Corrigir padrões específicos com caracteres mal codificados
      .replace(/D[^\x20-\x7E]lar/g, 'Dólar')
      .replace(/D.{1}lar/g, 'Dólar')
      .replace(/Ú[^\x20-\x7E]timas/g, 'Últimas')
      .replace(/Ú.{1}timas/g, 'Últimas')
      .replace(/fin[^\x20-\x7E]anas/g, 'Finanças')
      .replace(/fin.{1}anas/g, 'Finanças')
      .replace(/cm[^\x20-\x7E]bio/g, 'Câmbio')
      .replace(/cm.{1}bio/g, 'Câmbio')
      .replace(/cont[^\x20-\x7E]edo/g, 'Conteúdo')
      .replace(/cont.{1}edo/g, 'Conteúdo')
      .replace(/rod[^\x20-\x7E]p/g, 'Rodapé')
      .replace(/rod.{1}p/g, 'Rodapé')
      .replace(/not[^\x20-\x7E]cias/g, 'Notícias')
      .replace(/not.{1}cias/g, 'Notícias')
      .replace(/ao vivo/g, 'Ao vivo')
      .replace(/mercado financeiro/g, 'Mercado financeiro')
      .replace(/julgamento de Bolsonaro/g, 'Julgamento de Bolsonaro')
      // Corrigir outros caracteres comuns
      .replace(/Ã¡/g, 'á')
      .replace(/Ã©/g, 'é')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã¢/g, 'â')
      .replace(/Ãª/g, 'ê')
      .replace(/Ã´/g, 'ô')
      .replace(/Ã /g, 'à')
      .replace(/Ã§/g, 'ç')
      .replace(/Ã£/g, 'ã')
      .replace(/Ãµ/g, 'õ');
  }

  const titulo = corrigirEncoding(
    $('meta[property="og:title"]').attr('content') ||
    $('h1').first().text()
  );
  const resumo = corrigirEncoding($('meta[property="og:description"]').attr('content') || '');
  const ogImage = $('meta[property="og:image"]').attr('content') || '';

  let video_url = null;
  const videoIframe = $('iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="vimeo"]').first();
  if (videoIframe.length > 0) {
    video_url = videoIframe.attr('src');
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
    console.log(`[Folha Test] Conteúdo com .c-news__body (${conteudo.length} chars)`);
  } else {
    // Fallback para outros selectors se .c-news__body não existir
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        const h = element.html();
        if (h && h.length > conteudo.length) {
          conteudo = h;
          console.log(`[Folha Test] Fallback com ${selector} (${h.length} chars)`);
        }
      }
    }
  }

  // Fallback mais agressivo se ainda não tiver conteúdo suficiente
  if (!conteudo || conteudo.length < 1000) {
    console.log('[Folha Test] Conteúdo curto, usando fallback agressivo');
    const paragraphs = $('p, h2, h3, h4, ul, ol, blockquote, div.c-news__text').toArray();
    conteudo = paragraphs.map(p => $.html(p)).join('\n');
    console.log(`[Folha Test] Fallback: ${conteudo.length} chars`);
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
    const html = $el.html() || '';

    // NÃO remover elementos que contêm imagens do artigo
    if ($el.find('img').length > 0) {
      console.log(`[Folha Test] Preservando elemento com imagem: ${text.substring(0, 30)}...`);
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
      console.log(`[Folha Test] Removendo compartilhamento: ${text.substring(0, 30)}...`);
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
      console.log(`[Folha Test] Removendo navegação: ${text.substring(0, 30)}...`);
      $el.remove();
      return;
    }

    // Remover elementos de carregamento
    if (
      lowerText.includes('carregando') ||
      lowerText.includes('loading')
    ) {
      console.log(`[Folha Test] Removendo loading: ${text.substring(0, 30)}...`);
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
      console.log(`[Folha Test] Removendo paywall: ${text.substring(0, 30)}...`);
      $el.remove();
    }
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
      console.log(`[Folha Test] Preservando div de vídeo: ${html.substring(0, 50)}...`);
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

      console.log(`[Folha Test] Processando imagem: ${src.substring(0, 50)}...`);
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

      console.log(`[Folha Test] Processando figure com imagem`);
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

      console.log(`[Folha Test] Processando vídeo YouTube: ${src.substring(0, 50)}...`);
    }
    // Verificar outros tipos de vídeo
    else if (src.includes('vimeo.com') || src.includes('dailymotion.com')) {
      $iframe.attr('frameborder', '0');
      $iframe.attr('allowfullscreen', 'true');

      if (!$iframe.hasClass('news-video')) {
        $iframe.addClass('news-video');
      }

      console.log(`[Folha Test] Processando vídeo: ${src.substring(0, 50)}...`);
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
    const dataVideo = $videoEl.attr('data-video') || '';

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
        console.log(`[Folha Test] Convertendo elemento de vídeo da Folha para embed: ${videoId}`);
      }
    }
  });

  // Processar links de vídeo do YouTube que podem estar como texto
  $content('a').each((i, el) => {
    const $a = $content(el);
    const href = $a.attr('href') || '';
    const text = $a.text().trim();

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
        console.log(`[Folha Test] Convertendo link YouTube para embed: ${videoId}`);
      }
    }
  });

  const bodyHtml = `<div class="news-content">${corrigirEncoding($content.html())}</div>`;

  console.log(`[Folha Test] ✅ Título: ${titulo.substring(0, 60)}...`);
  console.log(`[Folha Test] ✅ Resumo: ${resumo.substring(0, 80)}...`);
  console.log(`[Folha Test] ✅ Imagem: ${ogImage ? 'SIM' : 'NÃO'}`);
  console.log(`[Folha Test] ✅ Conteúdo: ${bodyHtml.length} chars`);

  return {
    titulo,
    resumo: resumo.substring(0, 250),
    conteudo: bodyHtml,
    imagem: ogImage,
    video_url,
    embed_html: null
  };
}

async function createNoticia(item, url, data_publicacao) {
  const slug = item.titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 200);

  const noticia = {
    titulo: item.titulo,
    slug,
    resumo: item.resumo,
    conteudo: item.conteudo,
    link_original: url,
    categoria: 'tecnologia',
    autor: 1, // ID do autor "Sistema Webscraper"
    status: 'published',
    destaque: false,
    fonte_rss: 'Folha - Tec',
    url_imagem: item.imagem,
    video_url: item.video_url || null,
    embed_html: item.embed_html || null,
    data_publicacao: data_publicacao ? new Date(data_publicacao).toISOString() : new Date().toISOString()
  };

  console.log(`[Folha Test] 📝 Criando notícia...`);
  console.log(`[Folha Test] - Categoria: ${noticia.categoria}`);
  console.log(`[Folha Test] - URL Imagem: ${noticia.url_imagem ? 'SIM' : 'NÃO'}`);
  console.log(`[Folha Test] - Conteúdo: ${noticia.conteudo.length} chars`);
  console.log(`[Folha Test] - Token (primeiros 20 chars): ${DIRECTUS_TOKEN.substring(0, 20)}...`);

  const response = await fetch(`${DIRECTUS_URL}/items/noticias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DIRECTUS_TOKEN}`
    },
    body: JSON.stringify(noticia)
  });

  if (response.ok) {
    const data = await response.json();
    console.log(`[Folha Test] ✅ Notícia criada com sucesso! ID: ${data.data.id}`);
    return true;
  } else {
    const error = await response.text();
    console.log(`[Folha Test] ❌ Erro ao criar notícia:`, error);
    return false;
  }
}

async function run() {
  try {
    console.log('\n[Folha Test] ========================================');
    console.log('[Folha Test] TESTE DO WEBSCRAPER FOLHA');
    console.log('[Folha Test] ========================================\n');

    const urls = await fetchRSS();

    let criadas = 0;
    let erros = 0;

    for (let i = 0; i < urls.length; i++) {
      console.log(`\n[Folha Test] --- Processando ${i + 1}/${urls.length} ---`);
      const { url, data_publicacao } = urls[i];

      try {
        const item = await scrapePage(url);
        const resultado = await createNoticia(item, url, data_publicacao);

        if (resultado === true) criadas++;
        else erros++;

        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`[Folha Test] ❌ Erro:`, error.message);
        erros++;
      }
    }

    console.log('\n[Folha Test] ========================================');
    console.log(`[Folha Test] Total processado: ${urls.length}`);
    console.log(`[Folha Test] ✅ Criadas: ${criadas}`);
    console.log(`[Folha Test] ❌ Erros: ${erros}`);
    console.log('[Folha Test] ========================================\n');
  } catch (error) {
    console.error('[Folha Test] ❌ Erro fatal:', error);
  }
}

run();

