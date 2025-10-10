// Configuração específica para o portal UOL

export const config = {
    nome: 'UOL Tecnologia',
    rssUrl: 'https://rss.uol.com.br/feed/tecnologia.xml',
    categoria: 'tecnologia',
    limiteNoticias: 3
};

export function extractContent($, html) {
    // Seletores específicos do UOL
    const selectors = [
        '.text',
        'article.content',
        '.p-content',
        'div[itemprop="articleBody"]',
        '.article-content'
    ];

    let conteudo = '';

    for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
            const html = element.html();
            if (html && html.length > conteudo.length) {
                conteudo = html;
                console.log(`[UOL] Conteúdo encontrado com: ${selector} (${html.length} chars)`);
            }
        }
    }

    return conteudo;
}

export function processCustomElements($content) {
    // O UOL pode ter players customizados específicos
    // Adicionar aqui quando necessário
}

export function extractMetadata($, html) {
    return {
        titulo: $('meta[property="og:title"]').attr('content') || $('h1').first().text(),
        resumo: $('meta[property="og:description"]').attr('content') || '',
        imagem: $('meta[property="og:image"]').attr('content') || ''
    };
}

