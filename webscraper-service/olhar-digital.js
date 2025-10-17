import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';
const RSS_FEEDS = [
  { url: 'https://olhardigital.com.br/carros-e-tecnologia/feed', categoria: 'tecnologia' },
  { url: 'https://olhardigital.com.br/economia-e-negocios/feed', categoria: 'economia' },
];

const CATEGORIAS_MAP = {
  'tecnologia': 1,
  'politica': 2,
  'economia': 3,
  'esportes': 4,
  'cultura': 5
};

// Função para buscar URLs do RSS
async function fetchRSS(feedUrl, categoria) {
  try {
    console.log(`[Webscraper] Buscando RSS de ${categoria}: ${feedUrl}...`);
    const response = await fetch(feedUrl);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    const urls = [];
    $('item').each((i, el) => {
      const $item = $(el);
      const link = $item.find('link').text().trim();
      const pubDate = $item.find('pubDate').text().trim();

      if (link) {
        urls.push({
          url: link,
          data_publicacao: pubDate
        });
      }
    });

    console.log(`[Webscraper] ${urls.length} URLs extraídas do RSS`);
    return urls;
  } catch (error) {
    console.error('[Webscraper] ❌ Erro ao buscar RSS:', error.message);
    return [];
  }
}

// Função para fazer scraping de uma página
async function scrapePage(url) {
  try {
    console.log(`[Webscraper] Fazendo scraping: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extrair título
    const titulo = $('h1').first().text().trim() || $('title').text().trim();

    // Extrair resumo (primeiro parágrafo do article)
    let resumo = '';
    const article = $('article');
    if (article.length > 0) {
      const primeiroParagrafo = article.find('p').first();
      if (primeiroParagrafo.length > 0) {
        resumo = primeiroParagrafo.text().trim();
        // Limitar resumo a 200 caracteres
        if (resumo.length > 200) {
          resumo = resumo.substring(0, 200) + '...';
        }
      }
    }

    // Extrair imagem principal (primeira imagem do article)
    let imagem = '';
    if (article.length > 0) {
      const primeiraImagem = article.find('img').first();
      if (primeiraImagem.length > 0) {
        imagem = primeiraImagem.attr('src') || primeiraImagem.attr('data-src') || '';
        // Converter para URL absoluta se necessário
        if (imagem && imagem.startsWith('//')) {
          imagem = `https:${imagem}`;
        } else if (imagem && imagem.startsWith('/')) {
          imagem = `https://olhardigital.com.br${imagem}`;
        }
      }
    }

    // Extrair conteúdo principal
    let conteudo = '';
    if (article.length > 0) {
      conteudo = article.html() || '';
      console.log(`[Webscraper] Conteúdo com article (${conteudo.length} chars)`);
    }

    // Se não encontrou article, usar fallback
    if (!conteudo || conteudo.length < 1000) {
      console.log('[Webscraper] Conteúdo curto, usando fallback');
      const paragraphs = $('p, h2, h3, h4, ul, ol, blockquote').toArray();
      conteudo = paragraphs.map(p => $.html(p)).join('\n');
      console.log(`[Webscraper] Fallback: ${conteudo.length} chars`);
    }

    // Processar conteúdo com Cheerio
    const $content = cheerio.load(conteudo);

    // Limpezas básicas
    $content('script').remove();
    $content('style').remove();

    // Remover elementos desnecessários
    $content('.social-share, .share-buttons, .compartilhar, .redes-sociais').remove();
    $content('.facebook, .whatsapp, .twitter, .x, .messenger, .linkedin, .email, .e-mail').remove();
    $content('[class*="share"], [class*="social"], [class*="compartilhar"]').remove();

    $content('.voltar, .back, .navegacao, .navigation, .menu, .leia-mais, .read-more').remove();
    $content('[class*="voltar"], [class*="back"], [class*="navegacao"], [class*="menu"]').remove();

    $content('.loading, .carregando, .spinner, [class*="loading"], [class*="carregando"]').remove();

    $content('.advertising, .ad-container, .newsletter, .related-content, .comments-section, .c-advertising, .c-newsletter, .c-share, .c-related, .paywall, .c-paywall').remove();

    $content('.icon, .btn, .button, [class*="icon"], [class*="btn"], [class*="button"]').not('img').remove();

    // Remoções por texto específicas do Olhar Digital
    $content('div, p, span, a, button').each((i, el) => {
      const $el = $content(el);
      const text = $el.text().trim();
      const lowerText = text.toLowerCase();
      const html = $el.html() || '';

    // NÃO remover elementos que contêm imagens do artigo
    if ($el.find('img').length > 0) {
      console.log(`[Webscraper] Preservando elemento com imagem: ${text.substring(0, 30)}...`);
      return;
    }

    // NÃO remover elementos que contêm vídeos ou embeds
    if ($el.find('iframe, video, embed').length > 0) {
      console.log(`[Webscraper] Preservando elemento com vídeo/embed: ${text.substring(0, 30)}...`);
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

      // Remover elementos específicos do Olhar Digital
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
        lowerText.includes('faça login') ||
        lowerText.includes('o post') && lowerText.includes('apareceu primeiro em olhar digital')
      ) {
        console.log(`[Webscraper] Removendo elemento do Olhar Digital: ${text.substring(0, 30)}...`);
        $el.remove();
      }
    });

    // Limpeza de elementos vazios
    // Remover elementos vazios (mas preservar os que contêm imagens)
  $content('div:empty, p:empty, span:empty, section:empty, article:empty').each((i, el) => {
    const $el = $content(el);
    // NÃO remover se contém imagens (em qualquer nível)
    const hasImages = $el.find('img').length > 0;
    if (!hasImages) {
      $el.remove();
    }
  });

    $content('*').each((i, el) => {
      const $el = $content(el);
      const text = $el.text().trim();
      const html = $el.html() || '';

      // NÃO remover se o elemento É uma imagem ou contém imagens
      const isImage = $el.is('img');
      const hasImages = $el.find('img').length > 0;

      if (isImage || hasImages) {
        return; // Preservar
      }

      if (text === '' && (html === '' || html === '<br>' || html === '<br/>' || html === '<br />' || /^\s*$/.test(html))) {
        $el.remove();
      }
    });

    $content('br + br, br + br + br').remove();

    $content('div').each((i, el) => {
      const $div = $content(el);
      const html = $div.html() || '';
      const text = $div.text().trim();

      if (text === '' && (html === '<br>' || html === '<br/>' || html === '<br />' || /^[\s\n\r]*$/.test(html))) {
        const hasImages = $div.find('img').length > 0;
        if (!hasImages) {
          $div.remove();
        }
      }
    });

    // 1. EXTRAIR PRIMEIRA IMAGEM COMO DESTAQUE
    let primeiraImagem = null;
    const $primeiraImg = $content('img').first();
    if ($primeiraImg.length > 0) {
      const src = $primeiraImg.attr('src') || $primeiraImg.attr('data-src');
      const alt = $primeiraImg.attr('alt') || '';
      const classes = $primeiraImg.attr('class') || '';

      // Verificar se é uma imagem válida do artigo (não publicidade)
      const isArticleImage = classes.includes('wp-image') || src.includes('img.odcdn.com.br');
      const isNotAd = !src.includes('amazon.com') &&
                     !src.includes('amzn') &&
                     !src.includes('/ads/') &&
                     !src.includes('ad-') &&
                     !alt.toLowerCase().includes('vendido por') &&
                     !alt.toLowerCase().includes('amazon');

      if (src && isArticleImage && isNotAd) {
        // Converter para URL absoluta
        let finalSrc = src;
        if (src.startsWith('//')) {
          finalSrc = `https:${src}`;
        } else if (src.startsWith('/')) {
          finalSrc = `https://olhardigital.com.br${src}`;
        }

        primeiraImagem = finalSrc;

        // REMOVER a primeira imagem do corpo da matéria
        $primeiraImg.remove();
      }
    }

    // 2. PROCESSAR IMAGENS RESTANTES NO CORPO DA MATÉRIA
    $content('img').each((i, el) => {
      const $img = $content(el);
      const src = $img.attr('src') || $img.attr('data-src');
      const alt = $img.attr('alt') || '';
      const title = $img.attr('title') || '';
      const classes = $img.attr('class') || '';

      if (src) {
        // PRESERVAR imagens do artigo (wp-image-* ou img.odcdn.com.br)
        const isArticleImage = classes.includes('wp-image') || src.includes('img.odcdn.com.br');

        // Remover imagens de publicidade (Amazon, etc.) - MAS NÃO IMAGENS DO ARTIGO
        if (!isArticleImage && (
            src.includes('amazon.com') ||
            src.includes('amzn') ||
            src.includes('/ads/') ||
            src.includes('ad-') ||
            alt.toLowerCase().includes('vendido por') ||
            alt.toLowerCase().includes('amazon'))) {
          $img.remove();
          return;
        }

        // Converter para URL absoluta se necessário
        let finalSrc = src;
        if (src.startsWith('//')) {
          finalSrc = `https:${src}`;
        } else if (src.startsWith('/')) {
          finalSrc = `https://olhardigital.com.br${src}`;
        }

        $img.attr('src', finalSrc);

        $img.removeAttr('hidden');
        $img.removeClass('hidden');

        if (!$img.hasClass('news-image')) {
          $img.addClass('news-image');
        }

        if (alt) $img.attr('alt', alt);
        if (title) $img.attr('title', title);
      } else {
        // Só remover se não tiver data-src
        if (!$img.attr('data-src')) {
          $img.remove();
        }
      }
    });

    // Processar figures
    $content('figure').each((i, el) => {
      const $figure = $content(el);
      const $img = $figure.find('img');

      if ($img.length > 0) {
        $figure.removeAttr('hidden');
        $figure.removeClass('hidden');

        if (!$figure.hasClass('news-figure')) {
          $figure.addClass('news-figure');
        }

        const $caption = $figure.find('figcaption');
        if ($caption.length > 0) {
          if (!$caption.hasClass('news-caption')) {
            $caption.addClass('news-caption');
          }
        }

        console.log(`[Webscraper] Processando figure com imagem`);
      } else {
        $figure.remove();
      }
    });

    // Processar vídeos do YouTube
    $content('iframe').each((i, el) => {
      const $iframe = $content(el);
      const src = $iframe.attr('src') || '';

      if (src.includes('youtube.com') || src.includes('youtu.be')) {
        $iframe.attr('frameborder', '0');
        $iframe.attr('allowfullscreen', 'true');
        $iframe.attr('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');

        if (!$iframe.hasClass('news-video')) {
          $iframe.addClass('news-video');
        }

        console.log(`[Webscraper] Processando vídeo YouTube: ${src.substring(0, 50)}...`);
      }
      else if (src.includes('vimeo.com') || src.includes('dailymotion.com')) {
        $iframe.attr('frameborder', '0');
        $iframe.attr('allowfullscreen', 'true');

        if (!$iframe.hasClass('news-video')) {
          $iframe.addClass('news-video');
        }

        console.log(`[Webscraper] Processando vídeo: ${src.substring(0, 50)}...`);
      }
      else {
        $iframe.remove();
      }
    });

    // Processar links de vídeo do YouTube
    $content('a').each((i, el) => {
      const $a = $content(el);
      const href = $a.attr('href') || '';
      const text = $a.text().trim();

      if (href.includes('youtube.com/watch') || href.includes('youtu.be/')) {
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

    // 3. PROCESSAR SUBTÍTULOS (H2, H3) PARA DESTACÁ-LOS
    $content('h2, h3').each((i, el) => {
      const $heading = $content(el);
      const text = $heading.text().trim();

      // Verificar se é um subtítulo válido (não muito curto e não é metadados)
      if (text.length > 3 &&
          !text.toLowerCase().includes('compartilhar') &&
          !text.toLowerCase().includes('leia mais') &&
          !text.toLowerCase().includes('veja também')) {

        // Adicionar classes específicas para subtítulos
        if ($heading.is('h2')) {
          $heading.addClass('news-heading-2 news-subtitle');
        } else if ($heading.is('h3')) {
          $heading.addClass('news-heading-3 news-subtitle');
        }
      }
    });

    // Limpar estrutura HTML aninhada desnecessária
  let cleanHtml = $content.html();

  // Remover <html><body> aninhados se existirem
  cleanHtml = cleanHtml.replace(/<html[^>]*>|<\/html>/gi, '');
  cleanHtml = cleanHtml.replace(/<body[^>]*>|<\/body>/gi, '');

  const bodyHtml = `<div class="news-content">${cleanHtml}</div>`;

    console.log(`[Webscraper] Scraping completo: ${titulo.substring(0, 60)}...`);
    console.log(`[Webscraper] Tamanho do conteúdo: ${bodyHtml.length} chars`);

    return {
      titulo,
      resumo,
      conteudo: bodyHtml,
      imagem: primeiraImagem, // Usar a primeira imagem extraída
      link_original: url,
      fonte_rss: 'Olhar Digital',
      categoria: 'tecnologia', // slug da categoria tecnologia
      autor: 1 // ID do autor padrão
    };

  } catch (error) {
    console.error(`[Webscraper] ❌ Erro no scraping: ${error.message}`);
    return null;
  }
}

// Função para verificar se a notícia já existe
async function noticiaExiste(url, slug) {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/noticias?filter[link_original][_eq]=${encodeURIComponent(url)}&limit=1`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`
      }
    });

    if (!response.ok) {
      console.log(`[Webscraper] Erro ao verificar notícia existente: ${response.status}`);
      return false;
    }

    const data = await response.json();
    return data.data && data.data.length > 0;
  } catch (error) {
    console.log(`[Webscraper] Erro ao verificar notícia existente: ${error.message}`);
    return false;
  }
}

// Função para criar slug
function criarSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Função para criar notícia no Directus
async function createNoticia(item, url, data_publicacao, categoria) {
  try {
    const slug = criarSlug(item.titulo);

    console.log(`[Webscraper] Criando notícia: ${item.titulo.substring(0, 60)}...`);

    // Verificar se já existe
    const existe = await noticiaExiste(url, slug);
    if (existe) {
      console.log(`[Webscraper] Notícia já existe, pulando: ${slug}`);
      return 'skipped';
    }

    // Parse da data de forma segura
    let dataFinal = new Date().toISOString();
    if (data_publicacao) {
      try {
        const dataParseada = new Date(data_publicacao);
        if (!isNaN(dataParseada.getTime())) {
          dataFinal = dataParseada.toISOString();
        }
      } catch (e) {
        console.log('[Webscraper] Erro ao parsear data, usando data atual');
      }
    }

    const categoriaId = CATEGORIAS_MAP[item.categoria] || CATEGORIAS_MAP['tecnologia'];

    const dadosNoticia = {
      titulo: item.titulo,
      slug: slug,
      resumo: item.resumo,
      conteudo: item.conteudo,
      url_imagem: item.imagem,
      data_publicacao: dataFinal,
      link_original: item.link_original,
      fonte_rss: item.fonte_rss,
      categoria: categoriaId,
      autor: item.autor,
      destaque: false
    };

    const response = await fetch(`${DIRECTUS_URL}/items/noticias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIRECTUS_TOKEN}`
      },
      body: JSON.stringify(dadosNoticia)
    });

    if (response.ok) {
      console.log(`[Webscraper] Notícia criada com sucesso!`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`[Webscraper] ❌ Erro ao criar notícia: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('[Webscraper] ❌ Erro ao criar notícia:', error);
    return false;
  }
}

// Função principal de importação
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
console.log('[Olhar Digital Webscraper] Agendando execuções a cada 5 minutos...');
runImport(); // imediato
setInterval(runImport, 5 * 60 * 1000); // 5 minutos
