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
  categoria: string;
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
    `/items/noticias?limit=15&sort=-data_publicacao&fields=*,imagem.*,autor.*,url_imagem&t=${Date.now()}`
  );

  return data.data || [];
}

export async function getUltimasNoticias(limit: number = 10): Promise<Noticia[]> {
  const data: NoticiaResponse = await fetchAPI(
    `/items/noticias?limit=${limit}&sort=-data_publicacao&fields=*,imagem.*,autor.*,url_imagem&t=${Date.now()}`
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

export async function getNoticiasPorCategoria(categoria: string, limit: number = 10, offset: number = 0): Promise<{ noticias: Noticia[], hasMore: boolean }> {
  try {
    // Buscar mais notícias para compensar a filtragem no frontend
    const fetchLimit = Math.max(limit * 3, 50); // Buscar pelo menos 3x o limite para compensar filtros
    const data: NoticiaResponse = await fetchAPI(
      `/items/noticias?limit=${fetchLimit}&fields=*,imagem.*,autor.*,categoria.*,url_imagem&t=${Date.now()}`
    );

    if (!data.data || data.data.length === 0) {
      return { noticias: [], hasMore: false };
    }

    // Filtrar por categoria no frontend
    const noticiasFiltradas = data.data.filter(noticia => {
      if (typeof noticia.categoria === 'object' && noticia.categoria?.slug) {
        return noticia.categoria.slug === categoria;
      }
      return false;
    });

    // Aplicar paginação no resultado filtrado
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedNoticias = noticiasFiltradas.slice(startIndex, endIndex);

    // Verificar se há mais notícias disponíveis
    const hasMore = endIndex < noticiasFiltradas.length;

    return {
      noticias: paginatedNoticias,
      hasMore
    };
  } catch (error) {
    return { noticias: [], hasMore: false };
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
