import { directus, readItems, readItem, getImageUrl, formatarData, capitalizarCategoria, getAutorNome } from './directus-sdk';

// Definir o tipo Noticia localmente para evitar problemas com Turbopack
export interface Noticia {
  id: number;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  imagem?: {
    id: string;
    filename_download: string;
  } | string;
  url_imagem?: string;
  video_url?: string;
  embed_html?: string;
  audio_url?: string;
  data_publicacao: string;
  destaque: boolean;
  categoria: {
    id: number;
    nome: string;
    slug: string;
  } | string;
  autor: {
    id: number;
    nome: string;
    biografia?: string;
    foto?: string;
    email?: string;
  } | number;
  fonte_rss: string;
  link_original: string;
}

// Buscar notícias em destaque
export async function getNoticiasDestaque(): Promise<Noticia[]> {
  try {
    const noticias = await directus.request(
      readItems('noticias', {
        fields: ['*', { categoria: ['id', 'nome', 'slug'], autor: ['id', 'nome', 'biografia', 'foto', 'email'] }],
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
    return [];
  }
}

// Buscar últimas notícias
export async function getUltimasNoticias(limit: number = 10): Promise<Noticia[]> {
  try {
    const noticias = await directus.request(
      readItems('noticias', {
        fields: ['*', { categoria: ['id', 'nome', 'slug'], autor: ['id', 'nome', 'biografia', 'foto', 'email'] }],
        limit,
        sort: ['-data_publicacao']
      })
    );

    return noticias || [];
  } catch (error) {
    return [];
  }
}

// Buscar notícias por categoria
export async function getNoticiasPorCategoria(categoria: string, limit: number = 10): Promise<Noticia[]> {
  try {
    // Primeiro, buscar a categoria pelo slug para obter o ID
    const categoriaData = await directus.request(
      readItems('categorias', {
        fields: ['id', 'nome', 'slug'],
        filter: {
          slug: {
            _eq: categoria
          }
        },
        limit: 1
      })
    );

    if (!categoriaData || categoriaData.length === 0) {
      return [];
    }

    const categoriaId = categoriaData[0].id;
    const categoriaNome = categoriaData[0].nome;

    // Buscar todas as notícias e filtrar no código
    const todasNoticias = await directus.request(
      readItems('noticias', {
        fields: ['*'],
        limit: 100,
        sort: ['-data_publicacao']
      })
    );

    // Filtrar no código as notícias da categoria
    const noticiasFiltradas = (todasNoticias || []).filter(noticia => {
      return noticia.categoria === categoriaId.toString();
    });

    // Adicionar informações da categoria a cada notícia
    const noticiasComCategoria = noticiasFiltradas.map(noticia => ({
      ...noticia,
      categoria: {
        id: categoriaId,
        nome: categoriaNome,
        slug: categoria
      }
    }));

    return noticiasComCategoria.slice(0, limit);
  } catch (error) {
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

    if (!noticias || noticias.length === 0) {
      return null;
    }

    const noticia = noticias[0];

    // Buscar informações da categoria
    const categoriaId = typeof noticia.categoria === 'string' ? parseInt(noticia.categoria, 10) : noticia.categoria;
    const categoriaData = await directus.request(
      readItems('categorias', {
        fields: ['id', 'nome', 'slug'],
        filter: {
          id: {
            _eq: categoriaId
          }
        },
        limit: 1
      })
    );

    // Adicionar informações da categoria à notícia
    const noticiaComCategoria = {
      ...noticia,
      categoria: categoriaData[0] ? {
        id: categoriaData[0].id,
        nome: categoriaData[0].nome,
        slug: categoriaData[0].slug
      } : {
        id: 0,
        nome: 'Sem Categoria',
        slug: 'sem-categoria'
      }
    };

    return noticiaComCategoria;
  } catch (error) {
    return null;
  }
}

// Buscar notícias relacionadas (mesma categoria)
export async function getNoticiasRelacionadas(categoria: string, slugExcluir: string, limit: number = 4): Promise<Noticia[]> {
  try {
    const noticias = await directus.request(
      readItems('noticias', {
        fields: ['*', { categoria: ['id', 'nome', 'slug'], autor: ['id', 'nome', 'biografia', 'foto', 'email'] }],
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
    return [];
  }
}

// Buscar notícias mais lidas (simulado por data mais recente)
export async function getMaisLidas(limit: number = 5): Promise<Noticia[]> {
  try {
    const noticias = await directus.request(
      readItems('noticias', {
        fields: ['*', { categoria: ['id', 'nome', 'slug'], autor: ['id', 'nome', 'biografia', 'foto', 'email'] }],
        limit,
        sort: ['-data_publicacao']
      })
    );

    return noticias || [];
  } catch (error) {
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
        fields: ['*', { categoria: ['id', 'nome', 'slug'], autor: ['id', 'nome', 'biografia', 'foto', 'email'] }],
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
        fields: ['*', { categoria: ['id', 'nome', 'slug'], autor: ['id', 'nome', 'biografia', 'foto', 'email'] }],
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
    return [];
  }
}

export { getImageUrl, formatarData, capitalizarCategoria, getAutorNome };

