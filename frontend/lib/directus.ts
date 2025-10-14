// URL da API - sempre usa localhost pois agora é Client-Side Rendering
const API_URL = 'http://localhost:8055';
// Token de autenticação do Directus
const API_TOKEN = '094d174e18964f1fbd01a13a8a96870e517e629de8c2c9884760864153d2281c';

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
    `/items/noticias?filter[destaque][_eq]=true&filter[status][_eq]=published&limit=15&sort=-data_publicacao&fields=*,imagem.*,autor.*,url_imagem&t=${Date.now()}`
  );

  return data.data;
}

export async function getUltimasNoticias(limit: number = 10): Promise<Noticia[]> {
  const data: NoticiaResponse = await fetchAPI(
    `/items/noticias?filter[status][_eq]=published&limit=${limit}&sort=-data_publicacao&fields=*,imagem.*,autor.*,url_imagem&t=${Date.now()}`
  );

  return data.data;
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
