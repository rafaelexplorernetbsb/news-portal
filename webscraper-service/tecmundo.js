import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';
const RSS_URL = 'https://rss.tecmundo.com.br/feed';
const BASE_DOMAIN = 'https://www.tecmundo.com.br/';


const CATEGORIAS_MAP = {
  'tecnologia': 1
};


async function getOrCreateDefaultAuthor() {
  try {
    const resp = await fetch(`${DIRECTUS_URL}/items/autores?filter[nome][_eq]=Webscraper&limit=1`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DIRECTUS_TOKEN}` }
    });
    const data = await resp.json();
    if (data.data && data.data.length > 0) return data.data[0].id;

    const create = await fetch(`${DIRECTUS_URL}/items/autores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DIRECTUS_TOKEN}` },
      body: JSON.stringify({ nome: 'Webscraper' })
    });
    if (!create.ok) throw new Error(await create.text());
    const created = await create.json();
    return created.data.id;
  } catch (e) {
    console.error('[UOL Webscraper] Erro ao garantir autor padrão:', e.message);
    return null;
  }
}

// ============================================
// RSS - FETCH E PARSING
// ============================================
async function fetchRSS() {
  console.log('[UOL Webscraper] Buscando RSS...');
  const response = await fetch(RSS_URL);
  const xml = await response.text();

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
      let url = linkMatch[1].trim();
      url = url.replace(/<!\[CDATA\[|\]\]>/g, '');

      urls.push({
        url: url,
        titulo: titleMatch[1].trim(),
        data_publicacao: dateMatch ? dateMatch[1].trim() : ''
      });
    }
  }

  console.log(`[UOL Webscraper] ${urls.length} URLs extraídas do RSS`);
  return urls;
}

// ============================================
// SCRAPING - EXTRAÇÃO DE METADADOS
// ============================================
function extractMetadata($) {
  const titulo =
    $('meta[property="og:title"]').attr('content') || $('h1').first().text();
  const resumo = $('meta[property="og:description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || $('.styles_banner__qkCmR').attr('src') || '';

  return { titulo, resumo, ogImage };
}



// ============================================
// SCRAPING - EXTRAÇÃO DE CONTEÚDO
// ============================================
export function extractContent($, html) {
    const selectors = [
      '#main-content',
      '[class*="styles_main_text__"]',
      'div[itemprop="articleBody"]',
      '.article-content',
      '.p-content',
      '.text',
      'article.content'
    ];

    let conteudo = '';
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        const h = element.html();
        if (h && h.length > conteudo.length) {
          conteudo = h;
          console.log(`[Tecmundo] Conteúdo encontrado com: ${selector} (${h.length} chars)`);
        }
      }
    }
    return conteudo;
  }

// ============================================
// LIMPEZA - REMOÇÃO DE ELEMENTOS INDESEJADOS
// ============================================
function removeScriptsAndStyles($content) {
  $content('script:not([type="application/ld+json"])').remove();
  $content('style').remove();
}

function removeAdvertisingAndSocialElements($content) {
  $content(
    '.advertising, .ad, .publicidade, .banner, .ad-container, .newsletter, .related-content, .chamada-relacionada, .comments-section, .social-share, .header, .footer, .menu, .navigation, .veja-tambem, .veja-também, .related-news, .more-news, .artigos-relacionados, .related-articles, .mais-noticias, .authors-list, .autores-lista'
  ).remove();
}

function removeVejaTambemSection(contentHtml) {
  const vejaTambemIndex = contentHtml.toLowerCase().search(/veja\s+(também|mais)/i);

  if (vejaTambemIndex !== -1) {
    const conteudoTotal = contentHtml.length;
    const percentualPosicao = (vejaTambemIndex / conteudoTotal) * 100;

    console.log(`[UOL Webscraper] "Veja também" encontrado na posição ${percentualPosicao.toFixed(1)}% do conteúdo`);

    if (percentualPosicao < 20) {
      const segundoIndex = contentHtml.toLowerCase().indexOf('veja', vejaTambemIndex + 10);
      if (segundoIndex !== -1) {
        const segundoPercentual = (segundoIndex / conteudoTotal) * 100;
        console.log(`[UOL Webscraper] Segunda ocorrência encontrada na posição ${segundoPercentual.toFixed(1)}%`);

        if (segundoPercentual > 30) {
          contentHtml = contentHtml.substring(0, segundoIndex);
          console.log('[UOL Webscraper] Segunda ocorrência de "Veja também" removida');
        }
      }
    } else {
      contentHtml = contentHtml.substring(0, vejaTambemIndex);
      console.log('[UOL Webscraper] Seção "Veja também" removida (corte no HTML)');
    }
  }

  return contentHtml;
}

function removeJupiterSummaryElements(contentHtml) {

    contentHtml = contentHtml.replace(/<div[^>]*class="[^"]*hidden[^"]*items-center[^"]*space-x-4[^"]*sm:flex[^"]*"[^>]*>[\s\S]*?<\/div>/gi,'');
    contentHtml = contentHtml.replace(/<header[^>]*class="[^"]*styles_header_voxel__[^"]*"[^>]*>[\s\S]*?<\/header>/gi,'');
    contentHtml = contentHtml.replace(/<header[^>]*class="[^"]*styles_header__[^"]*bg-theme-fill-brand-base[^"]*"[^>]*>[\s\S]*?<\/header>/gi,'');
    contentHtml = contentHtml.replace(/<header[^>]*>[\s\S]*?(logo-voxel-header\.svg|logo-tecmundo-main\.svg)[\s\S]*?<\/header>/gi,'');
    contentHtml = contentHtml.replace( /<footer[^>]*>[\s\S]*?(logo-voxel-header\.svg|logo-tecmundo-main\.svg)[\s\S]*?<\/footer>/gi,'');
    contentHtml = contentHtml.replace(/<footer[^>]*class="[^"]*(bg-theme-brand-voxel|styles_copy_content__|styles_verticals__)[^"]*"[^>]*>[\s\S]*?<\/footer>/gi,'');
    contentHtml = contentHtml.replace(/<footer[^>]*>[\s\S]*?(Voxel|Nossa rede|COPYRIGHT\s+20\d{2}|Opções de privacidade)[\s\S]*?<\/footer>/gi,'');

    console.log('[UOL Webscraper] Removidos headers (Voxel/TecMundo) e elementos Jupiter via regex');
    return contentHtml;
  }

function removeSummaryHeadings($contentClean) {
  $contentClean('*').each((i, el) => {
    const $el = $contentClean(el);
    const text = $el.text().trim();

    if (text === 'Resumo da notícia' || text === 'O que aconteceu' || text === 'Como identificar') {
      console.log('[UOL Webscraper] Removendo seção de resumo:', text);
      $el.remove();
    }
  });
}

function removeSummaryContainers($contentClean) {
  $contentClean('div, section, article').each((i, el) => {
    const $el = $contentClean(el);
    const text = $el.text().trim();
    const classes = $el.attr('class') || '';
    if (text.includes('Resumo gerado por ferramenta de IA treinada pela redação do UOL') ||
        text.includes('Esse resumo foi útil?') ||
        text.includes('Ler resumo da notícia') ||
        text.includes('Malware') && text.includes('detectado') && text.includes('preocupa usuários') ||
        classes.includes('resumo') ||
        classes.includes('summary') ||
        classes.includes('jupiter-summary')) {
      console.log('[UOL Webscraper] Removendo container de resumo automático');
      $el.remove();
    }
  });
}

function removeInteractionElements($contentClean) {
  $contentClean('*').each((i, el) => {
    const $el = $contentClean(el);
    const text = $el.text().trim();
    if (text === 'Deixe seu comentário' ||
        text === 'Comunicar erro' ||
        text === 'Ouça agora' ||
        text === 'Powered by Trinity Audio') {
      console.log('[UOL Webscraper] Removendo elemento de interação:', text);
      $el.remove();
    }
  });
}

function removeSocialShareContainers($contentClean) {
  $contentClean('div, section, span').each((i, el) => {
    const $el = $contentClean(el);
    const html = $el.html() || '';
    const text = $el.text().trim();
    if (html.includes('whatsapp') ||
        html.includes('share') ||
        html.includes('comment') ||
        text.includes('WhatsApp') ||
        text.includes('Compartilhar') ||
        (text.length < 100 && text.includes('comentário'))) {
      console.log('[UOL Webscraper] Removendo container de compartilhamento');
      $el.remove();
    }
  });
}

function removeSummaryLists($contentClean) {
  $contentClean('ul, ol').each((i, el) => {
    const $el = $contentClean(el);
    const text = $el.text().trim();
    if (text.includes('Malware') && text.includes('detectado') && text.includes('preocupa') ||
        text.includes('Malware') && text.includes('disfarça') && text.includes('comprovantes') ||
        text.includes('Aviso:') && text.includes('mensagens suspeitas')) {
      console.log('[UOL Webscraper] Removendo lista de resumo automático');
      $el.remove();
    }
  });
}

// ============================================
// LIMPEZA - REMOÇÃO DE AVATARES E AUTORES
// ============================================
function removeAvatarContainers($contentClean) {
  $contentClean('.solar-related-avatar').each((i, el) => {
    const $container = $contentClean(el);
    console.log('[UOL Webscraper] Removendo container solar-related-avatar completo');
    $container.remove();
  });

  $contentClean('.solar-related-avatar.type-vertical.container').each((i, el) => {
    const $container = $contentClean(el);
    console.log('[UOL Webscraper] Removendo classe específica: solar-related-avatar.type-vertical.container');
    $container.remove();
  });
}

function removeJupiterColumnists($contentClean) {
  $contentClean('[class*="jupiter-columnists-z-index"]').each((i, el) => {
    const $container = $contentClean(el);
    console.log('[UOL Webscraper] Removendo classe Jupiter: jupiter-columnists-z-index');
    $container.remove();
  });
}

function removeCampaignContainers($contentClean) {
  $contentClean('.stick.campaign-container').each((i, el) => {
    const $container = $contentClean(el);
    console.log('[UOL Webscraper] Removendo classe de campanha: stick campaign-container');
    $container.remove();
  });
}

function removeAuthorImages($contentClean) {
  $contentClean('img').each((i, el) => {
    const $img = $contentClean(el);
    const src = $img.attr('src') || '';
    const alt = $img.attr('alt') || '';
    const classes = $img.attr('class') || '';
    if (src.includes('avatar') || src.includes('author') || src.includes('profile') ||
        alt.toLowerCase().includes('avatar') || alt.toLowerCase().includes('autor') ||
        alt.toLowerCase().includes('profile') || alt.toLowerCase().includes('perfil') ||
        classes.includes('avatar') || classes.includes('author') || classes.includes('profile') ||
        classes.includes('solar-avatar')) {
      console.log('[UOL Webscraper] Removendo imagem de avatar:', alt || src);
      $img.remove();
    }
  });
}


// ============================================
// LIMPEZA - REMOÇÃO DE METADADOS E RUÍDO
// ============================================
function removeMetadataAndNoise($contentClean) {
  $contentClean('div, p, span').each((i, el) => {
    const $el = $contentClean(el);
    const text = $el.text().trim().toLowerCase();
    if (
      text === 'assine uol' ||
      text === 'assine o uol' ||
      text === 'continuar lendo' ||
      text === 'ops!' ||
      text === 'ok' ||
      text === 'colaboração para tilt' ||
      text === 'do uol, em são paulo' ||
      text === 'deixe seu comentário' ||
      (text.match(/^\d{2}\/\d{2}\/\d{4}\s+\d{1,2}h\d{2}$/))
    ) {
      $el.remove();
    }
  });
}

function removeEmptyContainers($contentClean) {
  $contentClean('div, section, figure').each((i, el) => {
    const $el = $contentClean(el);
    const hasMedia = $el.find('img, video, iframe').length > 0;
    const text = $el.text().trim();
    const hasText = text.length > 20;
    const hasChildren = $el.children().length > 0;
    if (!hasMedia && !hasText && !hasChildren) {
      $el.remove();
    }
  });
}

function removeTrinityAudioElements(contentHtml) {
  const trinityMatches = contentHtml.match(/<[^>]*(?:jupiter-trinity-campaign|trinity-tts-pb)[^>]*>/gi);
  const trinityCount = trinityMatches ? trinityMatches.length : 0;
  console.log(`[UOL Webscraper] Encontrados ${trinityCount} elementos Trinity Audio para remover`);

  if (trinityCount > 0) {
    contentHtml = contentHtml.replace(
      /<div[^>]*jupiter-trinity-campaign[^>]*>[\s\S]*?<\/div>/gi,
      ''
    );

    contentHtml = contentHtml.replace(
      /<div[^>]*trinity-tts-pb[^>]*>[\s\S]*?<\/div>/gi,
      ''
    );

    console.log(`[UOL Webscraper] Trinity Audio removido completamente`);
  }

  return contentHtml;
}

// ============================================
// NORMALIZAÇÃO - ADIÇÃO DE CLASSES CSS
// ============================================
function addCssClassesToElements($contentClean) {
  const elementMappings = [
    { selector: 'p', className: 'news-paragraph' },
    { selector: 'h2', className: 'news-heading-2' },
    { selector: 'h3', className: 'news-heading-3' },
    { selector: 'h4', className: 'news-heading-4' },
    { selector: 'ul, ol', className: 'news-list' },
    { selector: 'li', className: 'news-list-item' },
    { selector: 'blockquote', className: 'news-quote' },
    { selector: 'a', className: 'news-link' },
    { selector: 'video', className: 'news-video' },
    { selector: 'iframe', className: 'news-embed' },
    { selector: 'audio', className: 'news-audio' }
  ];

  elementMappings.forEach(({ selector, className }) => {
    $contentClean(selector).each((i, el) => {
      const $el = $contentClean(el);
      const originalClasses = $el.attr('class') || '';
      if (originalClasses && !originalClasses.includes(className)) {
        $el.attr('class', `${originalClasses} ${className}`);
      } else if (!originalClasses) {
        $el.addClass(className);
      }
    });
  });
}

// ============================================
// NORMALIZAÇÃO - IMAGENS
// ============================================
function normalizeImages($contentClean) {
  $contentClean('img').each((i, el) => {
    const $img = $contentClean(el);

    $img.removeAttr('hidden');
    $img.removeClass('hidden');

    const src = $img.attr('src');
    if (src) {
      if (src.startsWith('//')) $img.attr('src', `https:${src}`);
      else if (src.startsWith('/')) $img.attr('src', `${BASE_DOMAIN}${src}`);
    }

    if (!$img.attr('src') && $img.attr('data-src')) {
      $img.attr('src', $img.attr('data-src'));
    }

    if (!$img.attr('alt')) $img.attr('alt', 'Imagem da notícia');
    const originalClasses = $img.attr('class') || '';
    if (originalClasses && !originalClasses.includes('news-image')) {
      $img.attr('class', `${originalClasses} news-image`);
    } else if (!originalClasses) {
      $img.addClass('news-image');
    }
  });
}

// ============================================
// NORMALIZAÇÃO - IFRAMES (VÍDEO E ÁUDIO)
// ============================================
function normalizeIframes($contentClean) {
  $contentClean('iframe').each((i, el) => {
    const $iframe = $contentClean(el);
    const src = $iframe.attr('src');

    if (src) {
      if (src.startsWith('//')) $iframe.attr('src', `https:${src}`);
      else if (src.startsWith('/')) $iframe.attr('src', `${BASE_DOMAIN}${src}`);

      if (src.includes('spotify') || src.includes('soundcloud') ||
          src.includes('podcast') || src.includes('audio') ||
          src.includes('anchor') || src.includes('buzzsprout') ||
          src.includes('castro') || src.includes('pocketcasts')) {
        $iframe.attr({
          'height': '152',
          'width': '100%',
          'frameborder': '0',
          'allowtransparency': 'true',
          'allow': 'encrypted-media'
        }).addClass('news-audio-embed');
        console.log('[UOL Webscraper] Embed de áudio detectado:', src);
      } else if (src.includes('youtube') || src.includes('youtu.be')) {
        $iframe.attr({
          'height': '400',
          'width': '100%',
          'frameborder': '0',
          'allowfullscreen': 'true'
        }).addClass('news-video-embed');
      } else if (src.includes('vimeo')) {
        $iframe.attr({
          'height': '400',
          'width': '100%',
          'frameborder': '0',
          'allowfullscreen': 'true'
        }).addClass('news-video-embed');
      } else {
        $iframe.attr({
          'height': $iframe.attr('height') || '300',
          'width': $iframe.attr('width') || '100%',
          'frameborder': '0'
        }).addClass('news-embed');
      }
    }
  });
}

// ============================================
// NORMALIZAÇÃO - LINKS
// ============================================
function normalizeLinks($contentClean) {
  $contentClean('a').each((i, el) => {
    const href = $contentClean(el).attr('href');
    if (href && href.startsWith('/')) {
      $contentClean(el).attr('href', `${BASE_DOMAIN}${href}`);
    }
  });
}

// ============================================
// SCRAPING - FUNÇÃO PRINCIPAL
// ============================================
async function scrapePage(url) {
  console.log(`[UOL Webscraper] Fazendo scraping: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extrair metadados
  const { titulo, resumo, ogImage } = extractMetadata($);




  // Extrair conteúdo principal
  let conteudo = extractContent($, html);
  const $content = cheerio.load(conteudo);

  // Limpeza básica
  removeScriptsAndStyles($content);
  removeAdvertisingAndSocialElements($content);

  // Processar HTML string
  let contentHtml = $content.html();
  contentHtml = removeVejaTambemSection(contentHtml);
  contentHtml = removeJupiterSummaryElements(contentHtml);

  // Recarregar conteúdo limpo
  let $contentClean = cheerio.load(contentHtml, null, false);

  // Remoção de resumos e elementos de interação
  removeSummaryHeadings($contentClean);
  removeSummaryContainers($contentClean);
  removeInteractionElements($contentClean);
  removeSocialShareContainers($contentClean);
  removeSummaryLists($contentClean);

  // Remoção de avatares e autores
  removeAvatarContainers($contentClean);
  removeJupiterColumnists($contentClean);
  removeCampaignContainers($contentClean);
  removeAuthorImages($contentClean);


  // Remoção de metadados e ruído
  removeMetadataAndNoise($contentClean);
  removeEmptyContainers($contentClean);

  // Remover Trinity Audio completamente
  let finalContentHtml = $contentClean.html();
  finalContentHtml = removeTrinityAudioElements(finalContentHtml);
  $contentClean = cheerio.load(finalContentHtml, null, false);

  // Normalização
  normalizeImages($contentClean);
  normalizeIframes($contentClean);
  normalizeLinks($contentClean);
  addCssClassesToElements($contentClean);

  const bodyHtml = `<div class="news-content">${$contentClean.html() || $contentClean('body').html()}</div>`;

  console.log(`[UOL Webscraper] Scraping completo: ${titulo.substring(0, 60)}...`);
  console.log(`[UOL Webscraper] Tamanho do conteúdo: ${bodyHtml.length} chars`);

  return {
    titulo,
    resumo: resumo.substring(0, 250),
    conteudo: bodyHtml,
    imagem: ogImage,
  };
}

// ============================================
// DIRECTUS - VERIFICAÇÃO DE DUPLICATAS
// ============================================
async function noticiaExiste(url, slug) {
  try {
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
      console.log(`[UOL Webscraper] Notícia já existe (link_original): ${url}`);
      return true;
    }

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
      console.log(`[UOL Webscraper] Notícia já existe (slug): ${slug}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[UOL Webscraper] Erro ao verificar duplicata:', error.message);
    return false;
  }
}

// ============================================
// DIRECTUS - CRIAÇÃO DE NOTÍCIAS
// ============================================
function generateSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

function parsePublicationDate(data_publicacao) {
  let dataFinal = new Date().toISOString();
  if (data_publicacao) {
    try {
      const parsedDate = new Date(data_publicacao);
      if (!isNaN(parsedDate.getTime())) {
        dataFinal = parsedDate.toISOString();
      }
    } catch (e) {
      console.log(`[UOL Webscraper] ⚠️  Data inválida, usando data atual`);
    }
  }
  return dataFinal;
}

async function createNoticia(item, url, data_publicacao) {
  const slug = generateSlug(item.titulo);

  const existe = await noticiaExiste(url, slug);
  if (existe) {
    console.log(`[UOL Webscraper] Pulando notícia duplicada: ${item.titulo.substring(0, 60)}...`);
    return 'skipped';
  }

  const dataFinal = parsePublicationDate(data_publicacao);
  const autorId = await getOrCreateDefaultAuthor();

  const noticia = {
    titulo: item.titulo,
    slug,
    resumo: item.resumo,
    conteudo: item.conteudo,
    link_original: url,
    categoria: CATEGORIAS_MAP.tecnologia,
    autor: autorId,
    status: 'published',
    destaque: false,
    fonte_rss: 'Tecmundo',
    url_imagem: item.imagem,
    data_publicacao: dataFinal
  };

  console.log(`[UOL Webscraper] Criando notícia: ${item.titulo.substring(0, 60)}...`);

  const response = await fetch(`${DIRECTUS_URL}/items/noticias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DIRECTUS_TOKEN}`
    },
    body: JSON.stringify(noticia)
  });
  if (response.ok) {
    console.log('[UOL Webscraper] Notícia criada com sucesso!');
    return true;
  } else {
    const error = await response.text();
    console.log('[UOL Webscraper] ❌ Erro ao criar notícia:', error);
    return false;
  }
}

// ============================================
// IMPORTAÇÃO - PROCESSO PRINCIPAL
// ============================================
async function runImport() {
  try {
    console.log('[UOL Webscraper] Iniciando importação...');
    const urls = await fetchRSS();

    let criadas = 0;
    let puladas = 0;
    let erros = 0;

    for (let i = 0; i < urls.length; i++) {
      const { url, data_publicacao } = urls[i];
      try {
        const item = await scrapePage(url);
        item.destaque = i === 0;
        const resultado = await createNoticia(item, url, data_publicacao);

        if (resultado === true) criadas++;
        else if (resultado === 'skipped') puladas++;
        else erros++;

        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`[UOL Webscraper] ❌ Erro ao processar: ${error.message}`);
        erros++;
      }
    }

    console.log('[UOL Webscraper] ========================================');
    console.log('[UOL Webscraper] Importação concluída!');
    console.log(`[UOL Webscraper] Total processado: ${urls.length}`);
    console.log(`[UOL Webscraper] Criadas: ${criadas}`);
    console.log(`[UOL Webscraper] Puladas (duplicadas): ${puladas}`);
    console.log(`[UOL Webscraper] Erros: ${erros}`);
    console.log('[UOL Webscraper] ========================================');

  } catch (error) {
    console.error('[UOL Webscraper] ❌ Erro fatal:', error);
  }
}

// ============================================
// AGENDAMENTO - EXECUÇÃO PERIÓDICA
// ============================================
async function startScheduler() {
  console.log('[UOL Webscraper] Agendando execuções a cada 5 minutos...');

  await runImport();

  setInterval(async () => {
    await runImport();
  }, 5 * 60 * 1000);
}

startScheduler();
