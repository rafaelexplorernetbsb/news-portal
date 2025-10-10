// Configuração específica para o portal Folha de S.Paulo

export const config = {
    nome: 'Folha - Tec',
    rssUrl: 'https://www1.folha.uol.com.br/tec/feed/',
    categoria: 'tecnologia',
    limiteNoticias: 3
};

export function extractContent($, html) {
    // Seletores específicos da Folha
    const selectors = [
        '.c-news__body',
        'article.c-news',
        '.c-news__content',
        'div[itemprop="articleBody"]'
    ];

    let conteudo = '';

    for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
            const html = element.html();
            if (html && html.length > conteudo.length) {
                conteudo = html;
                console.log(`[Folha] Conteúdo encontrado com: ${selector} (${html.length} chars)`);
            }
        }
    }

    return conteudo;
}

export function processCustomElements($content) {
    // A Folha pode ter players customizados específicos
    // Adicionar aqui quando necessário
}

export function extractMetadata($, html) {
    return {
        titulo: $('meta[property="og:title"]').attr('content') || $('h1').first().text(),
        resumo: $('meta[property="og:description"]').attr('content') || '',
        imagem: $('meta[property="og:image"]').attr('content') || ''
    };
}

