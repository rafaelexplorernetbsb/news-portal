import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'webscraper-token-12345';
const RSS_URL = 'https://rss.uol.com.br/feed/tecnologia.xml';
const BASE_DOMAIN = 'https://www.uol.com.br';

console.log('[UOL Webscraper] Serviço iniciado - UOL Tecnologia');

async function fetchRSS() {
  console.log('[UOL Webscraper] Buscando RSS...');
  const response = await fetch(RSS_URL);
  const xml = await response.text();

  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  const urls = [];

  // Processar TODOS os itens (sem limite)
  for (let i = 0; i < itemMatches.length; i++) {
    const item = itemMatches[i];
    const linkMatch = item.match(/<link>(.*?)<\/link>/);
    const titleMatch =
      item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s) ||
      item.match(/<title>(.*?)<\/title>/s);
    const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);

    if (linkMatch && titleMatch) {
      // Remover CDATA da URL se presente
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

async function scrapePage(url) {
  console.log(`[UOL Webscraper] Fazendo scraping: ${url}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  const titulo =
    $('meta[property="og:title"]').attr('content') || $('h1').first().text();
  const resumo = $('meta[property="og:description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';

  let video_url = null;
  let audio_url = null;
  let embed_html = null;

  const videoIframe = $(
    'iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="vimeo"]'
  ).first();
  if (videoIframe.length > 0) {
    const src = videoIframe.attr('src');
    if (src) {
      video_url = src;
      console.log(`[UOL Webscraper] Vídeo encontrado: ${video_url}`);
    }
  }

  // iframes de áudio (Spotify, SoundCloud, podcasts, etc.)
  const audioIframe = $(
    'iframe[src*="spotify"], iframe[src*="soundcloud"], iframe[src*="podcast"], iframe[src*="audio"], iframe[src*="anchor"], iframe[src*="buzzsprout"], iframe[src*="castro"], iframe[src*="pocketcasts"]'
  ).first();
  if (audioIframe.length > 0) {
    const src = audioIframe.attr('src');
    if (src) {
      audio_url = src;
      console.log(`[UOL Webscraper] Áudio iframe: ${audio_url}`);
    }
  }

  // Elementos audio HTML5
  const audioElement = $('audio').first();
  if (audioElement.length > 0) {
    const src = audioElement.attr('src');
    if (src) {
      audio_url = src;
      console.log(`[UOL Webscraper] Áudio HTML5: ${audio_url}`);
    }
  }

  let conteudo = '';
  const selectors = [
    'main',                              // UOL usa <main> para todo conteúdo
    '.content-text',                     // Alternativa
    'article[itemprop="articleBody"]',   // Alternativa semântica
    'article.news-item',                 // Fallback
    '.p-content',                        // Fallback
    'div.text',                          // Fallback
    '.article-content'                   // Fallback genérico
  ];

  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      const h = element.html();
      if (h && h.length > conteudo.length) {
        conteudo = h;
        console.log(`[UOL Webscraper] Conteúdo com ${selector} (${h.length} chars)`);
      }
    }
  }

  if (!conteudo || conteudo.length < 500) {
    console.log('[UOL Webscraper] Conteúdo curto, pegando parágrafos do body');
    const paragraphs = $('p, h2, h3, h4, ul, ol, blockquote').toArray();
    conteudo = paragraphs.map(p => $.html(p)).join('\n');
  }

  const $content = cheerio.load(conteudo);

  $content('script:not([type="application/ld+json"])').remove();
  $content('style').remove();
  $content(
    '.advertising, .ad, .publicidade, .banner, .ad-container, .newsletter, .related-content, .chamada-relacionada, .comments-section, .social-share, .header, .footer, .menu, .navigation, .veja-tambem, .veja-também, .related-news, .more-news, .artigos-relacionados, .related-articles, .mais-noticias, .authors-list, .autores-lista'
  ).remove();

  // NÃO remover elementos Trinity Audio - eles são containers para o player
  // Apenas remover elementos de loading que NÃO são Trinity Audio
  $content('strong, div, span').each((i, el) => {
    const $el = $content(el);
    const text = $el.text().trim().toLowerCase();
    const classes = $el.attr('class') || '';
    const id = $el.attr('id') || '';

    // NÃO remover se for um elemento Trinity Audio
    if (classes.includes('trinity') || classes.includes('tts') ||
        id.includes('trinity') || id.includes('tts') ||
        classes.includes('jupiter-trinity') || classes.includes('trinity-tts')) {
      console.log('[UOL Webscraper] Preservando elemento Trinity Audio:', classes || id);
      return; // Não remover
    }

    // Remover APENAS se for exatamente o texto de loading E não for Trinity Audio
    if ((text === 'carregando player de áudio' ||
         text === 'carregando player' ||
         text === 'loading audio player') &&
        text.length < 50 && // Só remover se for texto curto
        $el.children().length === 0) { // E não tiver filhos (não é um container)
      console.log('[UOL Webscraper] Removendo elemento "Carregando player de áudio":', text);
      $el.remove();
    }
  });

  // Verificar se há iframes de áudio no conteúdo (antes de qualquer limpeza)
  const audioIframes = $content('iframe[src*="spotify"], iframe[src*="soundcloud"], iframe[src*="podcast"], iframe[src*="audio"], iframe[src*="trinity"], iframe[src*="tts"]');
  if (audioIframes.length > 0) {
    console.log(`[UOL Webscraper] ${audioIframes.length} iframe(s) de áudio encontrado(s) no conteúdo`);
    audioIframes.each((i, el) => {
      const src = $content(el).attr('src');
      console.log(`[UOL Webscraper] Áudio iframe ${i + 1}: ${src}`);
    });
  }

  // Verificar se há elementos Trinity Audio ou TTS no conteúdo
  const trinityElements = $content('[class*="trinity"], [id*="trinity"], [class*="tts"], [id*="tts"], [class*="audio-player"], [id*="audio-player"]');
  if (trinityElements.length > 0) {
    console.log(`[UOL Webscraper] ${trinityElements.length} elemento(s) Trinity Audio/TTS encontrado(s)`);
    trinityElements.each((i, el) => {
      const $el = $content(el);
      const classes = $el.attr('class') || '';
      const id = $el.attr('id') || '';
      const text = $el.text().trim();
      console.log(`[UOL Webscraper] Trinity/TTS ${i + 1}: classes="${classes}", id="${id}", text="${text.substring(0, 50)}..."`);
    });
  }

  // Verificar se há scripts que carregam players de áudio
  $content('script').each((i, el) => {
    const $script = $content(el);
    const content = $script.html() || '';

    if (content.includes('trinity') || content.includes('tts') || content.includes('audio-player') || content.includes('ouça agora')) {
      console.log(`[UOL Webscraper] Script de áudio encontrado: ${content.substring(0, 100)}...`);
    }
  });

  // Estratégia inteligente: remover "Veja também" mas preservar conteúdo principal
  let contentHtml = $content.html();

  // Procurar por "Veja também" no HTML
  const vejaTambemIndex = contentHtml.toLowerCase().search(/veja\s+(também|mais)/i);

  if (vejaTambemIndex !== -1) {
    const conteudoTotal = contentHtml.length;
    const percentualPosicao = (vejaTambemIndex / conteudoTotal) * 100;

    console.log(`[UOL Webscraper] "Veja também" encontrado na posição ${percentualPosicao.toFixed(1)}% do conteúdo`);

    // Se estiver muito cedo (primeiros 20%), buscar por uma segunda ocorrência mais adiante
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
      // Se estiver após 20%, remover normalmente
      contentHtml = contentHtml.substring(0, vejaTambemIndex);
      console.log('[UOL Webscraper] Seção "Veja também" removida (corte no HTML)');
    }
  }

  // Recarregar o conteúdo limpo
  let $contentClean = cheerio.load(contentHtml);

  // ===== NOVAS REMOÇÕES ESPECÍFICAS DO UOL =====

  // 1. Remover seções de resumo automático (Resumo da notícia, O que aconteceu)
  $contentClean('*').each((i, el) => {
    const $el = $contentClean(el);
    const text = $el.text().trim();

    // Remover seções com títulos específicos de resumo
    if (text === 'Resumo da notícia' || text === 'O que aconteceu' || text === 'Como identificar') {
      console.log('[UOL Webscraper] Removendo seção de resumo:', text);
      $el.remove();
    }
  });

  // 2. Remover containers com resumos automáticos (bordas roxas)
  $contentClean('div, section, article').each((i, el) => {
    const $el = $contentClean(el);
    const text = $el.text().trim();
    const classes = $el.attr('class') || '';

    // Remover containers que contêm texto de resumo automático
    if (text.includes('Resumo gerado por ferramenta de IA treinada pela redação do UOL') ||
        text.includes('Esse resumo foi útil?') ||
        text.includes('Malware') && text.includes('detectado') && text.includes('preocupa usuários') ||
        classes.includes('resumo') || classes.includes('summary')) {
      console.log('[UOL Webscraper] Removendo container de resumo automático');
      $el.remove();
    }
  });

  // 3. Remover botões de compartilhamento e comentários
  $contentClean('*').each((i, el) => {
    const $el = $contentClean(el);
    const text = $el.text().trim();

    // Remover elementos com textos específicos de compartilhamento
    if (text === 'Deixe seu comentário' ||
        text === 'Comunicar erro' ||
        text === 'Ouça agora' ||
        text === 'Powered by Trinity Audio') {
      console.log('[UOL Webscraper] Removendo elemento de interação:', text);
      $el.remove();
    }
  });

  // 4. Remover containers com ícones de compartilhamento (WhatsApp, share, etc.)
  $contentClean('div, section, span').each((i, el) => {
    const $el = $contentClean(el);
    const html = $el.html() || '';
    const text = $el.text().trim();

    // Remover containers que contêm ícones de compartilhamento
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

  // 5. Remover listas de pontos que são resumos automáticos
  $contentClean('ul, ol').each((i, el) => {
    const $el = $contentClean(el);
    const text = $el.text().trim();

    // Remover listas que contêm resumos automáticos
    if (text.includes('Malware') && text.includes('detectado') && text.includes('preocupa') ||
        text.includes('Malware') && text.includes('disfarça') && text.includes('comprovantes') ||
        text.includes('Aviso:') && text.includes('mensagens suspeitas')) {
      console.log('[UOL Webscraper] Removendo lista de resumo automático');
      $el.remove();
    }
  });

  // ===== REMOÇÕES EXISTENTES =====

  // Remover container completo dos avatars relacionados (solar-related-avatar)
  $contentClean('.solar-related-avatar').each((i, el) => {
    const $container = $contentClean(el);
    console.log('[UOL Webscraper] Removendo container solar-related-avatar completo');
    $container.remove();
  });

  // Remover classe específica identificada pelo usuário
  $contentClean('.solar-related-avatar.type-vertical.container').each((i, el) => {
    const $container = $contentClean(el);
    console.log('[UOL Webscraper] Removendo classe específica: solar-related-avatar.type-vertical.container');
    $container.remove();
  });

  // Remover classe do sistema Jupiter (colunistas)
  $contentClean('[class*="jupiter-columnists-z-index"]').each((i, el) => {
    const $container = $contentClean(el);
    console.log('[UOL Webscraper] Removendo classe Jupiter: jupiter-columnists-z-index');
    $container.remove();
  });

  // Remover classe de campanhas grudadas
  $contentClean('.stick.campaign-container').each((i, el) => {
    const $container = $contentClean(el);
    console.log('[UOL Webscraper] Removendo classe de campanha: stick campaign-container');
    $container.remove();
  });

  // Remover também outros containers que podem conter avatars - MAIS AGRESSIVO
  $contentClean('[class*="avatar"], [class*="related"], [class*="campaign"], [class*="columnist"], [class*="author"], [class*="profile"]').each((i, el) => {
    const $el = $contentClean(el);
    const classes = $el.attr('class') || '';
    const text = $el.text().trim();

    // Lista expandida de autores conhecidos do UOL
    const autoresConhecidos = [
      'Alicia Klein', 'PVC', 'Sakamoto', 'Jamil Chade',
      'José Roberto de Toledo', 'Josias de Souza', 'TixaNews', 'Tony Marlon',
      'Helton Simões Gomes', 'Nobel', 'CBF', 'Ancelotti', 'Trump'
    ];
    const hasAuthor = autoresConhecidos.some(autor => text.includes(autor));

    // Remover se contém avatar/autor OU se tem características de bloco de autor
    if (hasAuthor ||
        classes.includes('avatar') ||
        classes.includes('related') ||
        classes.includes('campaign') ||
        classes.includes('columnist') ||
        classes.includes('author') ||
        classes.includes('profile') ||
        (text.length < 200 && text.split('\n').length <= 3)) { // Blocos pequenos que podem ser autores
      console.log('[UOL Webscraper] Removendo container com avatar/autor:', classes);
      $el.remove();
    }
  });

  // Remover imagens que são avatars de autores
  $contentClean('img').each((i, el) => {
    const $img = $contentClean(el);
    const src = $img.attr('src') || '';
    const alt = $img.attr('alt') || '';
    const classes = $img.attr('class') || '';

    // Remover imagens que são avatars de autores
    if (src.includes('avatar') || src.includes('author') || src.includes('profile') ||
        alt.toLowerCase().includes('avatar') || alt.toLowerCase().includes('autor') ||
        alt.toLowerCase().includes('profile') || alt.toLowerCase().includes('perfil') ||
        classes.includes('avatar') || classes.includes('author') || classes.includes('profile') ||
        classes.includes('solar-avatar')) {

      console.log('[UOL Webscraper] Removendo imagem de avatar:', alt || src);
      $img.remove();
    }
  });

  // Remover elementos que contêm os títulos específicos dos autores
  $contentClean('*').each((i, el) => {
    const $el = $contentClean(el);
    const text = $el.text().trim();

    // Lista expandida de títulos específicos que aparecem com os avatars
    const titulosAutores = [
      'CBF vai reforçar treino de árbitros no fim do Brasileiro',
      'Ancelotti dá aula de futebol em teoria e prática',
      'Trump não é herói; EUA têm dívida com palestinos',
      'Nobel ignora caráter universal da literatura',
      'Melhora na avaliação do governo fez oposição reagir',
      'Por que \'Bessias\' é favorito na corrida por vaga no STF',
      'A guerra de Trump pela paz mundial',
      'Movimento busca incluir o sonho como direito básico'
    ];

    // Se o elemento contém exatamente um desses títulos, remover
    if (titulosAutores.includes(text)) {
      console.log('[UOL Webscraper] Removendo título de autor:', text);
      $el.remove();
    }
  });

  // Remover blocos de colunistas que aparecem no final dos artigos
  $contentClean('div, section, article').each((i, el) => {
    const $el = $contentClean(el);
    const text = $el.text().trim();
    const html = $el.html() || '';

    // Verificar se é um bloco de colunista/autor
    if (text.length < 300 && // Texto curto
        (html.includes('<img') || html.includes('src=')) && // Contém imagem
        (text.includes('José Roberto de Toledo') ||
         text.includes('Josias de Souza') ||
         text.includes('TixaNews') ||
         text.includes('Tony Marlon') ||
         text.includes('Melhora na avaliação') ||
         text.includes('Bessias') ||
         text.includes('guerra de Trump') ||
         text.includes('direito básico'))) {
      console.log('[UOL Webscraper] Removendo bloco de colunista completo');
      $el.remove();
    }
  });

  // Remover apenas elementos pequenos que contêm APENAS nomes de autores conhecidos
  $contentClean('div, p, span, h3, h4, h5, h6').each((i, el) => {
    const $el = $contentClean(el);
    const text = $el.text().trim();

    // Lista de nomes de autores/jornalistas que aparecem frequentemente
    const autoresConhecidos = [
      'Alicia Klein', 'PVC', 'Sakamoto', 'Jamil Chade', 'Nobel', 'CBF', 'Ancelotti', 'Trump'
    ];

    // Só remover se o elemento contém APENAS o nome do autor (texto muito curto)
    if (text.length < 50 && autoresConhecidos.some(autor => text === autor || text.includes(autor))) {
      console.log('[UOL Webscraper] Removendo elemento pequeno com autor conhecido:', text);
      $el.remove();
    }
  });

  $contentClean('div, p, span').each((i, el) => {
    const $el = $contentClean(el);
    const text = $el.text().trim().toLowerCase();

    // Remover apenas elementos específicos que são metadados/ruído
    if (
      text === 'assine uol' ||
      text === 'assine o uol' ||
      text === 'continuar lendo' ||
      text === 'ops!' ||
      text === 'ok' ||
      text === 'colaboração para tilt' ||
      text === 'do uol, em são paulo' ||
      text === 'deixe seu comentário' ||
      (text.match(/^\d{2}\/\d{2}\/\d{4}\s+\d{1,2}h\d{2}$/)) // Remove datas como "09/10/2025 10h50"
    ) {
      $el.remove();
    }
  });

  // Remover containers vazios - MAIS CONSERVADOR
  $contentClean('div, section, figure').each((i, el) => {
    const $el = $contentClean(el);
    const hasMedia = $el.find('img, video, iframe').length > 0;
    const text = $el.text().trim();
    const hasText = text.length > 20; // pelo menos 20 caracteres
    const hasChildren = $el.children().length > 0;

    // Remover APENAS se for realmente vazio
    if (!hasMedia && !hasText && !hasChildren) {
      $el.remove();
    }
  });

  // Classes utilitárias - PRESERVANDO classes originais da UOL
  $contentClean('p').each((i, el) => {
    const $p = $contentClean(el);
    const originalClasses = $p.attr('class') || '';
    if (originalClasses && !originalClasses.includes('news-paragraph')) {
      $p.attr('class', `${originalClasses} news-paragraph`);
    } else if (!originalClasses) {
      $p.addClass('news-paragraph');
    }
  });

  $contentClean('h2').each((i, el) => {
    const $h2 = $contentClean(el);
    const originalClasses = $h2.attr('class') || '';
    if (originalClasses && !originalClasses.includes('news-heading-2')) {
      $h2.attr('class', `${originalClasses} news-heading-2`);
    } else if (!originalClasses) {
      $h2.addClass('news-heading-2');
    }
  });

  $contentClean('h3').each((i, el) => {
    const $h3 = $contentClean(el);
    const originalClasses = $h3.attr('class') || '';
    if (originalClasses && !originalClasses.includes('news-heading-3')) {
      $h3.attr('class', `${originalClasses} news-heading-3`);
    } else if (!originalClasses) {
      $h3.addClass('news-heading-3');
    }
  });

  $contentClean('h4').each((i, el) => {
    const $h4 = $contentClean(el);
    const originalClasses = $h4.attr('class') || '';
    if (originalClasses && !originalClasses.includes('news-heading-4')) {
      $h4.attr('class', `${originalClasses} news-heading-4`);
    } else if (!originalClasses) {
      $h4.addClass('news-heading-4');
    }
  });

  $contentClean('ul, ol').each((i, el) => {
    const $list = $contentClean(el);
    const originalClasses = $list.attr('class') || '';
    if (originalClasses && !originalClasses.includes('news-list')) {
      $list.attr('class', `${originalClasses} news-list`);
    } else if (!originalClasses) {
      $list.addClass('news-list');
    }
  });

  $contentClean('li').each((i, el) => {
    const $li = $contentClean(el);
    const originalClasses = $li.attr('class') || '';
    if (originalClasses && !originalClasses.includes('news-list-item')) {
      $li.attr('class', `${originalClasses} news-list-item`);
    } else if (!originalClasses) {
      $li.addClass('news-list-item');
    }
  });

  $contentClean('blockquote').each((i, el) => {
    const $quote = $contentClean(el);
    const originalClasses = $quote.attr('class') || '';
    if (originalClasses && !originalClasses.includes('news-quote')) {
      $quote.attr('class', `${originalClasses} news-quote`);
    } else if (!originalClasses) {
      $quote.addClass('news-quote');
    }
  });

  $contentClean('a').each((i, el) => {
    const $a = $contentClean(el);
    const originalClasses = $a.attr('class') || '';
    if (originalClasses && !originalClasses.includes('news-link')) {
      $a.attr('class', `${originalClasses} news-link`);
    } else if (!originalClasses) {
      $a.addClass('news-link');
    }
  });

  $contentClean('video').each((i, el) => {
    const $video = $contentClean(el);
    const originalClasses = $video.attr('class') || '';
    if (originalClasses && !originalClasses.includes('news-video')) {
      $video.attr('class', `${originalClasses} news-video`);
    } else if (!originalClasses) {
      $video.addClass('news-video');
    }
  });

  $contentClean('iframe').each((i, el) => {
    const $iframe = $contentClean(el);
    const originalClasses = $iframe.attr('class') || '';
    if (originalClasses && !originalClasses.includes('news-embed')) {
      $iframe.attr('class', `${originalClasses} news-embed`);
    } else if (!originalClasses) {
      $iframe.addClass('news-embed');
    }
  });

  $contentClean('audio').each((i, el) => {
    const $audio = $contentClean(el);
    const originalClasses = $audio.attr('class') || '';
    if (originalClasses && !originalClasses.includes('news-audio')) {
      $audio.attr('class', `${originalClasses} news-audio`);
    } else if (!originalClasses) {
      $audio.addClass('news-audio');
    }
  });

  // Remover completamente elementos Trinity Audio
  let finalContentHtml = contentHtml;

  // Contar quantos elementos Trinity Audio existem
  const trinityMatches = finalContentHtml.match(/<[^>]*(?:jupiter-trinity-campaign|trinity-tts-pb)[^>]*>/gi);
  const trinityCount = trinityMatches ? trinityMatches.length : 0;

  console.log(`[UOL Webscraper] Encontrados ${trinityCount} elementos Trinity Audio para remover`);

  if (trinityCount > 0) {
    // Remover elementos Trinity Audio completamente usando regex
    // Primeiro remover jupiter-trinity-campaign (elemento pai)
    finalContentHtml = finalContentHtml.replace(
      /<div[^>]*jupiter-trinity-campaign[^>]*>[\s\S]*?<\/div>/gi,
      ''
    );

    // Depois remover trinity-tts-pb (elemento filho que pode ter sobrado)
    finalContentHtml = finalContentHtml.replace(
      /<div[^>]*trinity-tts-pb[^>]*>[\s\S]*?<\/div>/gi,
      ''
    );

    console.log(`[UOL Webscraper] Trinity Audio removido completamente`);

    // Recarregar o HTML modificado
    $contentClean = cheerio.load(finalContentHtml);
  }

  // Normalização de imagens - PRESERVANDO estilos CSS originais
  $contentClean('img').each((i, el) => {
    const $img = $contentClean(el);

    // Remover apenas atributos que quebram a exibição
    $img.removeAttr('hidden');
    $img.removeClass('hidden');

    // PRESERVAR estilos CSS inline originais (width, height, style, etc.)
    // Só corrigir src se necessário
    const src = $img.attr('src');
    if (src) {
      if (src.startsWith('//')) $img.attr('src', `https:${src}`);
      else if (src.startsWith('/')) $img.attr('src', `${BASE_DOMAIN}${src}`);
    }

    if (!$img.attr('src') && $img.attr('data-src')) {
      $img.attr('src', $img.attr('data-src'));
    }

    // Adicionar alt apenas se não existir
    if (!$img.attr('alt')) $img.attr('alt', 'Imagem da notícia');

    // Preservar classes CSS originais da UOL
    const originalClasses = $img.attr('class') || '';
    if (originalClasses && !originalClasses.includes('news-image')) {
      $img.attr('class', `${originalClasses} news-image`);
    } else if (!originalClasses) {
      $img.addClass('news-image');
    }
  });

  // Ajustes em iframes - MELHORADO para áudio
  $contentClean('iframe').each((i, el) => {
    const $iframe = $contentClean(el);
    const src = $iframe.attr('src');

    if (src) {
      // Corrigir URLs relativas
      if (src.startsWith('//')) $iframe.attr('src', `https:${src}`);
      else if (src.startsWith('/')) $iframe.attr('src', `${BASE_DOMAIN}${src}`);

      // Configurar altura e classes baseado no tipo de conteúdo
      if (src.includes('spotify') || src.includes('soundcloud') ||
          src.includes('podcast') || src.includes('audio') ||
          src.includes('anchor') || src.includes('buzzsprout') ||
          src.includes('castro') || src.includes('pocketcasts')) {
        // Áudio/Podcast - configurações otimizadas
        $iframe.attr({
          'height': '152',
          'width': '100%',
          'frameborder': '0',
          'allowtransparency': 'true',
          'allow': 'encrypted-media'
        }).addClass('news-audio-embed');
        console.log('[UOL Webscraper] Embed de áudio detectado:', src);
      } else if (src.includes('youtube') || src.includes('youtu.be')) {
        // Vídeo YouTube
        $iframe.attr({
          'height': '400',
          'width': '100%',
          'frameborder': '0',
          'allowfullscreen': 'true'
        }).addClass('news-video-embed');
      } else if (src.includes('vimeo')) {
        // Vídeo Vimeo
        $iframe.attr({
          'height': '400',
          'width': '100%',
          'frameborder': '0',
          'allowfullscreen': 'true'
        }).addClass('news-video-embed');
      } else {
        // Outros iframes
        $iframe.attr({
          'height': $iframe.attr('height') || '300',
          'width': $iframe.attr('width') || '100%',
          'frameborder': '0'
        }).addClass('news-embed');
      }
    }
  });

  $contentClean('a').each((i, el) => {
    const href = $contentClean(el).attr('href');
    if (href && href.startsWith('/')) {
      $contentClean(el).attr('href', `${BASE_DOMAIN}${href}`);
    }
  });

  const bodyHtml = `<div class="news-content">${$contentClean.html()}</div>`;

  console.log(`[UOL Webscraper] Scraping completo: ${titulo.substring(0, 60)}...`);
  console.log(`[UOL Webscraper] Tamanho do conteúdo: ${bodyHtml.length} chars`);

  return {
    titulo,
    resumo: resumo.substring(0, 250),
    conteudo: bodyHtml,
    imagem: ogImage,
    video_url,
    audio_url,               // <-- novo campo para áudio
    embed_html
  };
}

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

  const existe = await noticiaExiste(url, slug);
  if (existe) {
    console.log(`[UOL Webscraper] Pulando notícia duplicada: ${item.titulo.substring(0, 60)}...`);
    return 'skipped';
  }

  // Parse da data de forma segura
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
    fonte_rss: 'UOL Tecnologia',
    url_imagem: item.imagem,
    video_url: item.video_url || null,
    audio_url: item.audio_url || null,  // <-- novo campo para áudio
    embed_html: item.embed_html || null,
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
        item.destaque = i === 0; // Primeira notícia em destaque
        const resultado = await createNoticia(item, url, data_publicacao);

        if (resultado === true) criadas++;
        else if (resultado === 'skipped') puladas++;
        else erros++;

        await new Promise(resolve => setTimeout(resolve, 2000)); // Pausa entre requisições
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

// Executar importação a cada 5 minutos
async function startScheduler() {
  console.log('[UOL Webscraper] Agendando execuções a cada 5 minutos...');

  // Executar imediatamente
  await runImport();

  // Agendar próximas execuções
  setInterval(async () => {
    await runImport();
  }, 5 * 60 * 1000); // 5 minutos
}

startScheduler();
