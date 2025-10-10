import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as g1Portal from './portals/g1.js';
import * as folhaPortal from './portals/folha.js';
import * as uolPortal from './portals/uol.js';

const DIRECTUS_URL = 'http://localhost:8055';
const DIRECTUS_TOKEN = 'webscraper-token-12345';

// Lista de portais configurados
const PORTALS = [
    g1Portal,
    // folhaPortal,  // Descomentar para ativar
    // uolPortal     // Descomentar para ativar
];

console.log('[Multi-Portal Webscraper] Serviço iniciado');
console.log(`[Multi-Portal Webscraper] Portais ativos: ${PORTALS.length}`);

async function fetchRSS(portal) {
    console.log(`[${portal.config.nome}] Buscando RSS...`);
    const response = await fetch(portal.config.rssUrl);
    const xml = await response.text();

    // Extrair URLs dos itens
    const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
    const urls = [];

    for (let i = 0; i < Math.min(itemMatches.length, portal.config.limiteNoticias); i++) {
        const item = itemMatches[i];
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s) || item.match(/<title>(.*?)<\/title>/s);
        const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);

        if (linkMatch && titleMatch) {
            urls.push({
                url: linkMatch[1].trim(),
                titulo: titleMatch[1].trim(),
                data_publicacao: dateMatch ? dateMatch[1].trim() : ''
            });
        }
    }

    console.log(`[${portal.config.nome}] ${urls.length} URLs extraídas`);
    return urls;
}

async function scrapePage(url, portal) {
    console.log(`[${portal.config.nome}] Fazendo scraping: ${url}`);

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    // Usar funções específicas do portal
    const metadata = portal.extractMetadata($, html);
    let conteudo = portal.extractContent($, html);

    // Se ainda não encontrou nada substancial, tentar pegar todos os parágrafos
    if (!conteudo || conteudo.length < 500) {
        console.log(`[${portal.config.nome}] Conteúdo muito curto, extraindo todos os parágrafos`);
        const paragraphs = $('p, h2, h3, h4, ul, ol, blockquote').toArray();
        conteudo = paragraphs.map(p => $.html(p)).join('\n');
    }

    // Processar conteúdo
    const $content = cheerio.load(conteudo);

    // Remover APENAS elementos indesejados (mantendo imagens e vídeos)
    $content('script:not([type="application/ld+json"])').remove();
    $content('style').remove();
    $content('.advertising, .ad-container, .ads').remove();
    $content('.newsletter').remove();
    $content('.related-content, .related').remove();
    $content('.comments-section, .comments').remove();
    $content('.social-share').remove();
    $content('.header, .footer, .menu, .navigation').remove();

    // Adicionar classes personalizadas
    $content('p').addClass('news-paragraph');
    $content('h2').addClass('news-heading-2');
    $content('h3').addClass('news-heading-3');
    $content('h4').addClass('news-heading-4');
    $content('ul').addClass('news-list');
    $content('ol').addClass('news-list');
    $content('li').addClass('news-list-item');
    $content('blockquote').addClass('news-quote');
    $content('a').addClass('news-link');
    $content('img').addClass('news-image');
    $content('figure').addClass('news-figure');
    $content('video').addClass('news-video');
    $content('iframe').addClass('news-embed');
    $content('audio').addClass('news-audio');

    // Converter URLs relativas para absolutas
    const baseUrl = new URL(url).origin;

    $content('img').each((i, el) => {
        const src = $content(el).attr('src');
        const dataSrc = $content(el).attr('data-src');
        const srcset = $content(el).attr('srcset');

        if (src) {
            if (src.startsWith('//')) {
                $content(el).attr('src', `https:${src}`);
            } else if (src.startsWith('/')) {
                $content(el).attr('src', `${baseUrl}${src}`);
            }
        }

        if (dataSrc) {
            if (dataSrc.startsWith('//')) {
                $content(el).attr('data-src', `https:${dataSrc}`);
                if (!src) $content(el).attr('src', `https:${dataSrc}`);
            } else if (dataSrc.startsWith('/')) {
                $content(el).attr('data-src', `${baseUrl}${dataSrc}`);
                if (!src) $content(el).attr('src', `${baseUrl}${dataSrc}`);
            }
        }

        if (srcset) {
            const fixedSrcset = srcset.split(',').map(item => {
                const [url, descriptor] = item.trim().split(/\s+/);
                let fixedUrl = url;
                if (url.startsWith('//')) {
                    fixedUrl = `https:${url}`;
                } else if (url.startsWith('/')) {
                    fixedUrl = `${baseUrl}${url}`;
                }
                return descriptor ? `${fixedUrl} ${descriptor}` : fixedUrl;
            }).join(', ');
            $content(el).attr('srcset', fixedSrcset);
        }
    });

    // Processar elementos customizados do portal
    portal.processCustomElements($content);

    // Processar iframes, vídeos e áudios
    $content('iframe').each((i, el) => {
        const src = $content(el).attr('src');
        if (src) {
            if (src.startsWith('//')) {
                $content(el).attr('src', `https:${src}`);
            } else if (src.startsWith('/')) {
                $content(el).attr('src', `${baseUrl}${src}`);
            }
        }
        if (!$content(el).attr('allowfullscreen')) {
            $content(el).attr('allowfullscreen', 'true');
        }
    });

    $content('video source, audio source').each((i, el) => {
        const src = $content(el).attr('src');
        if (src) {
            if (src.startsWith('//')) {
                $content(el).attr('src', `https:${src}`);
            } else if (src.startsWith('/')) {
                $content(el).attr('src', `${baseUrl}${src}`);
            }
        }
    });

    $content('a').each((i, el) => {
        const href = $content(el).attr('href');
        if (href && href.startsWith('/')) {
            $content(el).attr('href', `${baseUrl}${href}`);
        }
    });

    return {
        ...metadata,
        conteudo: `<div class="news-content">${$content.html()}</div>`
    };
}

async function createNoticia(item, url, data_publicacao, portal) {
    // Gerar slug
    const slug = item.titulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 200);

    const noticia = {
        titulo: item.titulo,
        slug: slug,
        resumo: item.resumo.substring(0, 250),
        conteudo: item.conteudo,
        link_original: url,
        categoria: portal.config.categoria,
        autor: 1,
        status: 'published',
        destaque: item.destaque || false,
        fonte_rss: portal.config.nome,
        url_imagem: item.imagem,
        data_publicacao: data_publicacao ? new Date(data_publicacao).toISOString() : new Date().toISOString()
    };

    console.log(`[${portal.config.nome}] Criando notícia: ${noticia.titulo.substring(0, 50)}...`);

    // Enviar para Directus via API
    const response = await fetch(`${DIRECTUS_URL}/items/noticias`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DIRECTUS_TOKEN}`
        },
        body: JSON.stringify(noticia)
    });

    if (response.ok) {
        console.log(`[${portal.config.nome}] Notícia criada com sucesso!`);
        return true;
    } else {
        const error = await response.text();
        console.log(`[${portal.config.nome}] Erro ao criar notícia:`, error);
        return false;
    }
}

async function processPortal(portal) {
    try {
        console.log(`\n[${portal.config.nome}] Iniciando importação...`);

        // 1. Buscar URLs do RSS
        const urls = await fetchRSS(portal);

        // 2. Para cada URL, fazer scraping
        for (let i = 0; i < urls.length; i++) {
            const { url, titulo, data_publicacao } = urls[i];

            try {
                const item = await scrapePage(url, portal);

                // 3. Criar notícia no Directus
                item.destaque = i === 0; // Primeira notícia é destaque
                await createNoticia(item, url, data_publicacao, portal);

                // Aguardar um pouco entre requisições
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                console.error(`[${portal.config.nome}] Erro ao processar ${url}:`, error.message);
            }
        }

        console.log(`[${portal.config.nome}] Importação concluída!\n`);

    } catch (error) {
        console.error(`[${portal.config.nome}] Erro:`, error);
    }
}

async function runAll() {
    console.log('\n=== Iniciando importação de todos os portais ===\n');

    for (const portal of PORTALS) {
        await processPortal(portal);
        // Aguardar entre portais
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log('\n=== Importação de todos os portais concluída ===\n');
}

// Executar a cada 5 minutos
console.log('[Multi-Portal Webscraper] Agendando execuções a cada 5 minutos...');
runAll(); // Executar imediatamente
setInterval(runAll, 5 * 60 * 1000); // 5 minutos

