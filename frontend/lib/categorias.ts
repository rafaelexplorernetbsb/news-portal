import {
  directus,
  readItems,
  readItem,
  Categoria,
  Noticia,
} from './directus-sdk';

// Buscar todas as categorias
export async function getCategorias(): Promise<Categoria[]> {
  try {
    const categorias = await directus.request(
      readItems('categorias', {
        fields: ['*'],
        sort: ['nome'],
      })
    );

    return categorias || [];
  } catch (error) {
    return [];
  }
}

// Buscar categoria por slug
export async function getCategoriaPorSlug(
  slug: string
): Promise<Categoria | null> {
  try {
    const categorias = await directus.request(
      readItems('categorias', {
        fields: ['*'],
        filter: {
          slug: {
            _eq: slug,
          },
        },
        limit: 1,
      })
    );

    return categorias[0] || null;
  } catch (error) {
    return null;
  }
}

// Buscar categoria por ID
export async function getCategoriaPorId(id: number): Promise<Categoria | null> {
  try {
    const categoria = await directus.request(readItem('categorias', id));

    return categoria || null;
  } catch (error) {
    return null;
  }
}

// Buscar categorias com contagem de notícias
export async function getCategoriasComContagem(): Promise<
  Array<Categoria & { contagem: number }>
> {
  try {
    const categorias = await directus.request(
      readItems('categorias', {
        fields: ['*'],
        sort: ['nome'],
      })
    );

    // Para cada categoria, buscar a contagem de notícias
    const categoriasComContagem = await Promise.all(
      categorias.map(async (categoria) => {
        try {
          const noticias = await directus.request(
            readItems('noticias', {
              fields: ['id'],
              filter: {
                categoria: {
                  _eq: categoria.nome,
                },
              },
            })
          );

          return {
            ...categoria,
            contagem: noticias.length,
          };
        } catch (error) {
          return {
            ...categoria,
            contagem: 0,
          };
        }
      })
    );

    return categoriasComContagem;
  } catch (error) {
    return [];
  }
}

// Buscar categorias mais populares (com mais notícias)
export async function getCategoriasPopulares(
  limit: number = 5
): Promise<Array<Categoria & { contagem: number }>> {
  try {
    const categoriasComContagem = await getCategoriasComContagem();

    // Ordenar por contagem (decrescente) e limitar
    return categoriasComContagem
      .sort((a, b) => b.contagem - a.contagem)
      .slice(0, limit);
  } catch (error) {
    return [];
  }
}

// Buscar notícias por categoria com paginação
export async function getNoticiasPorCategoriaPaginated(
  categoria: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  data: Noticia[];
  total: number;
  page: number;
  totalPages: number;
  categoria: Categoria | null;
}> {
  try {
    const offset = (page - 1) * limit;

    // Buscar notícias
    const noticias = await directus.request(
      readItems('noticias', {
        fields: ['*'],
        filter: {
          categoria: {
            _eq: categoria,
          },
        },
        limit,
        offset,
        sort: ['-data_publicacao'],
      })
    );

    // Buscar total de notícias desta categoria
    const totalNoticias = await directus.request(
      readItems('noticias', {
        fields: ['id'],
        filter: {
          categoria: {
            _eq: categoria,
          },
        },
      })
    );

    // Buscar dados da categoria
    const categoriaData = await getCategoriaPorSlug(
      categoria.toLowerCase().replace(/\s+/g, '-')
    );

    const total = totalNoticias.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data: noticias || [],
      total,
      page,
      totalPages,
      categoria: categoriaData,
    };
  } catch (error) {
    return {
      data: [],
      total: 0,
      page,
      totalPages: 0,
      categoria: null,
    };
  }
}
