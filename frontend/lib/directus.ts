// URL da API - sempre usa localhost pois agora é Client-Side Rendering
const API_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
// Token de autenticação do Directus - obtido das variáveis de ambiente
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

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
  url_imagem?: string; // ← Novo campo para URL de imagem externa
  video_url?: string; // ← URL do vídeo (Globoplay, YouTube, etc.)
  embed_html?: string; // ← HTML do player embed
  data_publicacao: string;
  destaque: boolean;
  categoria: string | number | {
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
  project_logo?: string | {
    id: string;
    filename_download: string;
  };
  project_descriptor?: string;
}

async function fetchAPI(endpoint: string) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export async function getNoticiasDestaque(): Promise<Noticia[]> {
  const data: NoticiaResponse = await fetchAPI(
    `/items/noticias?limit=50&sort=-data_publicacao&fields=*,imagem.*,autor.*,categoria.*,url_imagem&filter[destaque][_eq]=true&t=${Date.now()}`
  );

  return data.data || [];
}

export async function getProjectSettings(): Promise<DirectusSettings | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
    const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';
    
    const response = await fetch(`${API_URL}/settings`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Erro ao buscar configurações do projeto:', error);
    return null;
  }

}

export function getLogoUrl(project_logo: DirectusSettings['project_logo']): string | null {
  if (!project_logo) {
    return null;
  }

  const assetUrl = 'http://localhost:8055';

  if (typeof project_logo === 'object' && project_logo.id) {
    return `${assetUrl}/assets/${project_logo.id}`;
  }

  if (typeof project_logo === 'string') {
    return `${assetUrl}/assets/${project_logo}`;
  }

  return null;
}

  export function getProjectName(project_name: DirectusSettings['project_name'] | null): string | null {
    if (!project_name) {
      return null;
    }

    return project_name;
  }

export function getProjectDescriptor(project_descriptor: DirectusSettings['project_descriptor'] | null): string | null {
  if (!project_descriptor) {
    return null;
  }

  return project_descriptor;
}


export async function getUltimasNoticias(limit: number = 10): Promise<Noticia[]> {
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

export function getImageUrl(imagem: Noticia['imagem'], url_imagem?: string): string {
  // Prioridade 1: URL de imagem externa
  if (url_imagem) {
    return url_imagem;
  }

  // Prioridade 2: Imagem do Directus
  if (!imagem) {
    return '/placeholder.svg';
  }

  // Sempre usa localhost:8055 para assets pois é acessado pelo navegador
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

export async function getCategoriaNome(categoria: Noticia['categoria']): Promise<string> {
  if (!categoria) {
    return 'Categoria';
  }

  if (typeof categoria === 'string') {
    return categoria;
  }

  if (typeof categoria === 'object' && categoria.nome) {
    return categoria.nome;
  }

  // Se categoria é um número (ID), buscar o nome
  if (typeof categoria === 'number') {
    try {
      const categoriasData = await fetchAPI(`/items/categorias?filter[id][_eq]=${categoria}&limit=1`);
      if (categoriasData.data && categoriasData.data.length > 0) {
        return categoriasData.data[0].nome;
      }
    } catch (error) {
      console.error(`Erro ao buscar categoria com ID ${categoria}:`, error);
    }
  }

  return 'Categoria';
}

export function capitalizarCategoria(categoria: string): string {
  // Verificar se categoria é válida
  if (!categoria || typeof categoria !== 'string') {
    return 'Categoria';
  }

  const categorias: Record<string, string> = {
    'politica': 'Política',
    'economia': 'Economia',
    'tecnologia': 'Tecnologia',
    'esportes': 'Esportes',
    'cultura': 'Cultura',
    'saude': 'Saúde',
    'educacao': 'Educação',
  };

  return categorias[categoria] || categoria.charAt(0).toUpperCase() + categoria.slice(1);
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

export async function getNoticiasPorCategoriaEspecifica(categoriaNome: string, limit: number = 12): Promise<Noticia[]> {
  try {
    // Buscar mais notícias para garantir que temos o suficiente para filtrar
    const data: NoticiaResponse = await fetchAPI(
      `/items/noticias?limit=100&sort=-data_publicacao&fields=*,imagem.*,autor.*,categoria.*,url_imagem&t=${Date.now()}`
    );

    console.log(`Debug - Total de notícias buscadas: ${data.data?.length || 0}`);
    console.log(`Debug - Primeiras 5 datas:`, data.data?.slice(0, 5).map(n => n.data_publicacao));

    // Filtrar localmente por categoria
    const noticiasFiltradas = data.data?.filter(noticia => {
      if (typeof noticia.categoria === 'string') {
        return noticia.categoria.toLowerCase().includes(categoriaNome.toLowerCase());
      } else if (typeof noticia.categoria === 'object' && noticia.categoria?.nome) {
        return noticia.categoria.nome.toLowerCase().includes(categoriaNome.toLowerCase());
      }
      return false;
    }).slice(0, limit) || [];

    console.log(`Debug - Notícias filtradas para "${categoriaNome}": ${noticiasFiltradas.length}`);
    console.log(`Debug - Datas das notícias filtradas:`, noticiasFiltradas.map(n => n.data_publicacao));

    return noticiasFiltradas;
  } catch (error) {
    console.error(`Erro ao buscar notícias da categoria ${categoriaNome}:`, error);
    return [];
  }
}

export async function getNoticiasPorCategoria(categoria: string, limit: number = 10, offset: number = 0): Promise<{ noticias: Noticia[], hasMore: boolean }> {
  try {
    // Primeiro, buscar o ID da categoria pelo nome (capitalizado)
    const categoriaNome = capitalizarCategoria(categoria);
    const categoriasData = await fetchAPI(`/items/categorias?filter[nome][_eq]=${encodeURIComponent(categoriaNome)}&limit=1`);

    if (!categoriasData.data || categoriasData.data.length === 0) {
      console.warn(`Categoria "${categoriaNome}" não encontrada`);
      return { noticias: [], hasMore: false };
    }

    const categoriaId = categoriasData.data[0].id;

    // Buscar mais notícias para compensar a paginação
    const fetchLimit = Math.max(limit * 2, 30);

    // Buscar as notícias por ID da categoria diretamente da API
    const data: NoticiaResponse = await fetchAPI(
      `/items/noticias?limit=${fetchLimit}&sort=-data_publicacao&fields=*,imagem.*,autor.*,categoria,url_imagem&filter[categoria][_eq]=${categoriaId}&t=${Date.now()}`
    );

    if (!data.data || data.data.length === 0) {
      return { noticias: [], hasMore: false };
    }

    // Aplicar paginação no resultado
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedNoticias = data.data.slice(startIndex, endIndex);

    // Verificar se há mais notícias disponíveis
    const hasMore = endIndex < data.data.length;

    return {
      noticias: paginatedNoticias,
      hasMore
    };
  } catch (error) {
    console.error(`Erro ao buscar notícias da categoria ${categoria}:`, error);
    return { noticias: [], hasMore: false };
  }
}

export async function getUltimasNoticiasPorCategoria(categoriaNome: string, limit: number = 12): Promise<Noticia[]> {
  try {
    // Primeiro, buscar o ID da categoria pelo nome
    const categoriasData = await fetchAPI(`/items/categorias?filter[nome][_eq]=${encodeURIComponent(categoriaNome)}&limit=1`);

    if (!categoriasData.data || categoriasData.data.length === 0) {
      console.warn(`Categoria "${categoriaNome}" não encontrada`);
      return [];
    }

    const categoriaId = categoriasData.data[0].id;

    // Agora buscar as notícias por ID da categoria
    const data: NoticiaResponse = await fetchAPI(
      `/items/noticias?limit=${limit}&sort=-data_publicacao&fields=*,imagem.*,autor.*,categoria,url_imagem&filter[categoria][_eq]=${categoriaId}&t=${Date.now()}`
    );

    return data.data || [];
  } catch (error) {
    console.error(`Erro ao buscar notícias da categoria ${categoriaNome}:`, error);
    return [];
  }
}

export async function buscarNoticias(termo: string, limit: number = 50): Promise<Noticia[]> {
  try {
    if (!termo || termo.trim().length === 0) {
      return [];
    }

    const data: NoticiaResponse = await fetchAPI(
      `/items/noticias?search=${encodeURIComponent(termo.trim())}&filter[status][_eq]=published&fields=*,imagem.*,autor.*,categoria,url_imagem&limit=${limit}&sort=-data_publicacao&t=${Date.now()}`
    );

    return data.data || [];
  } catch (error) {
    console.error(`Erro ao buscar notícias com termo "${termo}":`, error);
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
    console.error('Erro ao buscar notícia por slug:', error);
    return null;
  }
}
