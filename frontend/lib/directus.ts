const getAPIUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('ngrok')) {
      return `${window.location.protocol}//${window.location.host}/api/directus`;
    }
  }
  return '/api/directus';
};

const API_URL = getAPIUrl();

async function fetchAPI(endpoint: string) {
  try {
    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      credentials: 'omit',
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

export interface Noticia {
  id: number;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  imagem?:
    | {
        id: string;
        filename_download: string;
      }
    | string;
  url_imagem?: string;
  video_url?: string;
  embed_html?: string;
  data_publicacao: string;
  destaque: boolean;
  categoria:
    | string
    | number
    | {
        id: number;
        nome: string;
        slug: string;
      };
  autor: {
    id: number;
    nome: string;
    biografia?: string;
    foto?: string;
    email?: string;
  };
}

export interface NoticiaResponse {
  data: Noticia[];
}

export interface SingleNoticiaResponse {
  data: Noticia;
}

export interface DirectusSettings {
  id: number;
  project_name: string;
  project_url?: string;
  project_color?: string;
  project_logo?:
    | string
    | {
        id: string;
        filename_download: string;
      };
  project_descriptor?: string;
}

export async function getNoticiasDestaque(): Promise<Noticia[]> {
  const data: NoticiaResponse = await fetchAPI(
    `/items/noticias?limit=50&sort=-data_publicacao&fields=*,imagem.*,autor.*,categoria.*,url_imagem&filter[destaque][_eq]=true&t=${Date.now()}`
  );

  return data.data || [];
}

export async function getProjectSettings(): Promise<DirectusSettings | null> {
  try {
    const result = await fetchAPI('/settings');
    return result.data || result;
  } catch (error) {
    return null;
  }
}

export function getLogoUrl(
  project_logo: DirectusSettings['project_logo']
): string | null {
  if (!project_logo) {
    return null;
  }

  let assetUrl = '/api/directus';
  if (
    typeof window !== 'undefined' &&
    window.location.hostname.includes('ngrok')
  ) {
    assetUrl = `${window.location.protocol}//${window.location.host}/api/directus`;
  }

  if (typeof project_logo === 'object' && project_logo.id) {
    return `${assetUrl}/assets/${project_logo.id}`;
  }

  if (typeof project_logo === 'string') {
    return `${assetUrl}/assets/${project_logo}`;
  }

  return null;
}

export function getProjectName(
  project_name: DirectusSettings['project_name'] | null
): string | null {
  if (!project_name) {
    return null;
  }

  return project_name;
}

export function getProjectDescriptor(
  project_descriptor: DirectusSettings['project_descriptor'] | null
): string | null {
  if (!project_descriptor) {
    return null;
  }

  return project_descriptor;
}

export async function getUltimasNoticias(
  limit: number = 10
): Promise<Noticia[]> {
  const data: NoticiaResponse = await fetchAPI(
    `/items/noticias?limit=${Math.max(limit, 100)}&sort=-data_publicacao&fields=*,imagem.*,autor.*,categoria.*,url_imagem&t=${Date.now()}`
  );

  return data.data || [];
}

export async function getNoticiaById(id: string): Promise<Noticia> {
  const data: SingleNoticiaResponse = await fetchAPI(
    `/items/noticias/${id}?fields=*,imagem.*,autor.*,url_imagem&t=${Date.now()}`
  );

  return data.data;
}

export async function getNoticiaBySlug(slug: string): Promise<Noticia> {
  const data: NoticiaResponse = await fetchAPI(
    `/items/noticias?filter[slug][_eq]=${slug}&fields=*,imagem.*,autor.*,url_imagem&limit=1&t=${Date.now()}`
  );

  if (!data.data || data.data.length === 0) {
    throw new Error('Notícia não encontrada');
  }

  const noticia = data.data[0];

  return noticia;
}

export function getImageUrl(
  imagem: Noticia['imagem'],
  url_imagem?: string
): string {
  if (url_imagem) {
    return url_imagem;
  }

  if (!imagem) {
    return '/placeholder.svg';
  }

  const assetUrl = 'http://localhost:8055';

  if (typeof imagem === 'object' && imagem.id) {
    return `${assetUrl}/assets/${imagem.id}`;
  }

  if (typeof imagem === 'string') {
    return `${assetUrl}/assets/${imagem}`;
  }

  return '/placeholder.svg';
}

export function formatarData(dataString: string): string {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export async function getCategoriaNome(
  categoria: Noticia['categoria']
): Promise<string> {
  if (!categoria) {
    return 'Categoria';
  }

  if (typeof categoria === 'string') {
    return categoria;
  }

  if (typeof categoria === 'object' && categoria.nome) {
    return categoria.nome;
  }

  if (typeof categoria === 'number') {
    try {
      const categoriasData = await fetchAPI(
        `/items/categorias?filter[id][_eq]=${categoria}&limit=1`
      );
      if (categoriasData.data && categoriasData.data.length > 0) {
        return categoriasData.data[0].nome;
      }
    } catch (error) {
      return 'Categoria';
    }
  }

  return 'Categoria';
}

export function capitalizarCategoria(categoria: string): string {
  if (!categoria || typeof categoria !== 'string') {
    return 'Categoria';
  }

  const categorias: Record<string, string> = {
    politica: 'Política',
    economia: 'Economia',
    tecnologia: 'Tecnologia',
    esportes: 'Esportes',
    cultura: 'Cultura',
    saude: 'Saúde',
    educacao: 'Educação',
  };

  return (
    categorias[categoria] ||
    categoria.charAt(0).toUpperCase() + categoria.slice(1)
  );
}

export function getAutorNome(autor: Noticia['autor']): string {
  if (autor && typeof autor === 'object' && 'nome' in autor) {
    return autor.nome;
  }

  if (typeof autor === 'number') {
    return `Autor #${autor}`;
  }

  return 'Autor não informado';
}

export async function getNoticiasPorCategoriaEspecifica(
  categoriaNome: string,
  limit: number = 12
): Promise<Noticia[]> {
  try {
    const data: NoticiaResponse = await fetchAPI(
      `/items/noticias?limit=100&sort=-data_publicacao&fields=*,imagem.*,autor.*,categoria.*,url_imagem&t=${Date.now()}`
    );

    const noticiasFiltradas =
      data.data
        ?.filter((noticia) => {
          if (typeof noticia.categoria === 'string') {
            return noticia.categoria
              .toLowerCase()
              .includes(categoriaNome.toLowerCase());
          } else if (
            typeof noticia.categoria === 'object' &&
            noticia.categoria?.nome
          ) {
            return noticia.categoria.nome
              .toLowerCase()
              .includes(categoriaNome.toLowerCase());
          }
          return false;
        })
        .slice(0, limit) || [];

    return noticiasFiltradas;
  } catch (error) {
    return [];
  }
}

export async function getNoticiasPorCategoria(
  categoria: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ noticias: Noticia[]; hasMore: boolean }> {
  try {
    const categoriaNome = capitalizarCategoria(categoria);
    const categoriasData = await fetchAPI(
      `/items/categorias?filter[nome][_eq]=${encodeURIComponent(categoriaNome)}&limit=1`
    );

    if (!categoriasData.data || categoriasData.data.length === 0) {
      return { noticias: [], hasMore: false };
    }

    const categoriaId = categoriasData.data[0].id;
    const fetchLimit = Math.max(limit * 2, 30);

    const data: NoticiaResponse = await fetchAPI(
      `/items/noticias?limit=${fetchLimit}&sort=-data_publicacao&fields=*,imagem.*,autor.*,categoria,url_imagem&filter[categoria][_eq]=${categoriaId}&t=${Date.now()}`
    );

    if (!data.data || data.data.length === 0) {
      return { noticias: [], hasMore: false };
    }

    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedNoticias = data.data.slice(startIndex, endIndex);
    const hasMore = endIndex < data.data.length;

    return {
      noticias: paginatedNoticias,
      hasMore,
    };
  } catch (error) {
    return { noticias: [], hasMore: false };
  }
}

export async function getUltimasNoticiasPorCategoria(
  categoriaNome: string,
  limit: number = 12
): Promise<Noticia[]> {
  try {
    const categoriasData = await fetchAPI(
      `/items/categorias?filter[nome][_eq]=${encodeURIComponent(categoriaNome)}&limit=1`
    );

    if (!categoriasData.data || categoriasData.data.length === 0) {
      return [];
    }

    const categoriaId = categoriasData.data[0].id;

    const data: NoticiaResponse = await fetchAPI(
      `/items/noticias?limit=${limit}&sort=-data_publicacao&fields=*,imagem.*,autor.*,categoria,url_imagem&filter[categoria][_eq]=${categoriaId}&t=${Date.now()}`
    );

    return data.data || [];
  } catch (error) {
    return [];
  }
}

export async function buscarNoticias(
  termo: string,
  limit: number = 50
): Promise<Noticia[]> {
  try {
    if (!termo || termo.trim().length === 0) {
      return [];
    }

    const data: NoticiaResponse = await fetchAPI(
      `/items/noticias?search=${encodeURIComponent(termo.trim())}&filter[status][_eq]=published&fields=*,imagem.*,autor.*,categoria,url_imagem&limit=${limit}&sort=-data_publicacao&t=${Date.now()}`
    );

    return data.data || [];
  } catch (error) {
    return [];
  }
}

export async function getNoticiaPorSlug(slug: string): Promise<Noticia | null> {
  try {
    const data: NoticiaResponse = await fetchAPI(
      `/items/noticias?filter[slug][_eq]=${slug}&fields=*,imagem.*,autor.*,categoria.*,url_imagem&limit=1&t=${Date.now()}`
    );

    if (!data.data || data.data.length === 0) {
      return null;
    }

    return data.data[0];
  } catch (error) {
    return null;
  }
}

export interface Categoria {
  id: number;
  nome: string;
  slug: string;
  descricao?: string;
  icone?: string;
}
export async function getCategorias(): Promise<Categoria[]> {
  try {
    const data = await fetchAPI(
      '/items/categorias?sort=nome&fields=id,nome,slug,descricao,icone'
    );
    return data.data || [];
  } catch (error) {
    return [];
  }
}
