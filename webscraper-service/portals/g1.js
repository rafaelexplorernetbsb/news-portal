// Configuração específica para o portal G1

export const config = {
    nome: 'G1 Tecnologia',
    rssUrl: 'https://g1.globo.com/rss/g1/tecnologia/',
    categoria: 'tecnologia',
    limiteNoticias: 3
};

export function extractContent($, html) {
    // Seletores específicos do G1
    const selectors = [
        '.mc-article-body',
        '.content-text',
        'article.content-text__container',
        '.content-text__container',
        'article[itemprop="articleBody"]'
    ];

    let conteudo = '';

    for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
            const html = element.html();
            if (html && html.length > conteudo.length) {
                conteudo = html;
                console.log(`[G1] Conteúdo encontrado com: ${selector} (${html.length} chars)`);
            }
        }
    }

    return conteudo;
}

export function processCustomElements($content) {
    // Converter TikTok embeds
    $content('amp-tiktok').each((i, el) => {
        const tiktokUrl = $content(el).attr('data-src');
        if (tiktokUrl) {
            const videoId = tiktokUrl.match(/\/video\/(\d+)/)?.[1];
            if (videoId) {
                const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
                $content(el).replaceWith(`<iframe class="news-embed" src="${embedUrl}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`);
            }
        }
    });

    // Converter Globo Video Player (bs-player)
    $content('bs-player').each((i, el) => {
        const videoId = $content(el).attr('videoid');
        if (videoId) {
            const thumb = $content(el).closest('.content-video__placeholder').find('img').attr('src');
            const videoUrl = `https://globoplay.globo.com/v/${videoId}/`;

            if (thumb) {
                $content(el).replaceWith(`
                    <div class="news-video-container">
                        <a href="${videoUrl}" target="_blank" class="news-video-link">
                            <img src="${thumb}" alt="Vídeo" class="news-image">
                            <div class="news-video-play-button">▶ Assistir vídeo</div>
                        </a>
                    </div>
                `);
            } else {
                $content(el).replaceWith(`<a href="${videoUrl}" target="_blank" class="news-link">▶ Assistir vídeo</a>`);
            }
        }
    });
}

export function extractMetadata($, html) {
    return {
        titulo: $('meta[property="og:title"]').attr('content') || $('h1').first().text(),
        resumo: $('meta[property="og:description"]').attr('content') || '',
        imagem: $('meta[property="og:image"]').attr('content') || ''
    };
}
