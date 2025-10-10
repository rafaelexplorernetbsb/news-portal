import { directus, readItems, readItem, Noticia, getImageUrl, formatarData, capitalizarCategoria, getAutorNome } from './directus-sdk';

// Buscar notícias em destaque
export async function getNoticiasDestaque(): Promise<Noticia[]> {
  try {
    const noticias = await directus.request(
      readItems('noticias', {
        fields: ['*'],
        filter: {
          destaque: {
            _eq: true
          }
        },
        limit: 3,
        sort: ['-data_publicacao']
      })
    );

    return noticias || [];
  } catch (error) {
    console.error('Erro ao buscar notícias em destaque:', error);
    return [];
  }
}

// Buscar últimas notícias
export async function getUltimasNoticias(limit: number = 10): Promise<Noticia[]> {
  try {
    const noticias = await directus.request(
      readItems('noticias', {
        fields: ['*'],
        limit,
        sort: ['-data_publicacao']
      })
    );

    return noticias || [];
  } catch (error) {
    console.error('Erro ao buscar últimas notícias:', error);
    return [];
  }
}

// Buscar notícias por categoria
export async function getNoticiasPorCategoria(categoria: string, limit: number = 10): Promise<Noticia[]> {
  try {
    const noticias = await directus.request(
      readItems('noticias', {
        fields: ['*'],
        filter: {
          categoria: {
            _eq: categoria
          }
        },
        limit,
        sort: ['-data_publicacao']
      })
    );

    return noticias || [];
  } catch (error) {
    console.error(`Erro ao buscar notícias da categoria ${categoria}:`, error);
    return [];
  }
}

// Buscar notícia por slug
export async function getNoticiaPorSlug(slug: string): Promise<Noticia | null> {
  try {
    const noticias = await directus.request(
      readItems('noticias', {
        fields: ['*'],
        filter: {
          slug: {
            _eq: slug
          }
        },
        limit: 1
      })
    );

    return noticias[0] || null;
  } catch (error) {
    console.error(`Erro ao buscar notícia com slug ${slug}:`, error);
    return null;
  }
}

// Buscar notícias relacionadas (mesma categoria)
export async function getNoticiasRelacionadas(categoria: string, slugExcluir: string, limit: number = 4): Promise<Noticia[]> {
  try {
    const noticias = await directus.request(
      readItems('noticias', {
        fields: ['*'],
        filter: {
          _and: [
            {
              categoria: {
                _eq: categoria
              }
            },
            {
              slug: {
                _neq: slugExcluir
              }
            }
          ]
        },
        limit,
        sort: ['-data_publicacao']
      })
    );

    return noticias || [];
  } catch (error) {
    console.error(`Erro ao buscar notícias relacionadas:`, error);
    return [];
  }
}

// Buscar notícias mais lidas (simulado por data mais recente)
export async function getMaisLidas(limit: number = 5): Promise<Noticia[]> {
  try {
    const noticias = await directus.request(
      readItems('noticias', {
        fields: ['*'],
        limit,
        sort: ['-data_publicacao']
      })
    );

    return noticias || [];
  } catch (error) {
    console.error('Erro ao buscar notícias mais lidas:', error);
    return [];
  }
}

// Buscar todas as notícias com paginação
export async function getAllNoticias(page: number = 1, limit: number = 10): Promise<{
  data: Noticia[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    const offset = (page - 1) * limit;

    const noticias = await directus.request(
      readItems('noticias', {
        fields: ['*'],
        limit,
        offset,
        sort: ['-data_publicacao']
      })
    );

    // Para obter o total, fazemos uma segunda consulta sem limit
    const totalNoticias = await directus.request(
      readItems('noticias', {
        fields: ['id']
      })
    );

    const total = totalNoticias.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data: noticias || [],
      total,
      page,
      totalPages
    };
  } catch (error) {
    console.error('Erro ao buscar todas as notícias:', error);
    return {
      data: [],
      total: 0,
      page,
      totalPages: 0
    };
  }
}

// Buscar notícias por busca de texto
export async function buscarNoticias(termo: string, limit: number = 10): Promise<Noticia[]> {
  try {
    const noticias = await directus.request(
      readItems('noticias', {
        fields: ['*'],
        filter: {
          _or: [
            {
              titulo: {
                _icontains: termo
              }
            },
            {
              resumo: {
                _icontains: termo
              }
            },
            {
              conteudo: {
                _icontains: termo
              }
            }
          ]
        },
        limit,
        sort: ['-data_publicacao']
      })
    );

    return noticias || [];
  } catch (error) {
    console.error(`Erro ao buscar notícias com termo "${termo}":`, error);
    return [];
  }
}

// Exportar funções auxiliares também
export { getImageUrl, formatarData, capitalizarCategoria, getAutorNome };

