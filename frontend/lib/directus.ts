// URL da API - sempre usa localhost pois agora é Client-Side Rendering
const API_URL = 'http://localhost:8055';
// Token de longa duração (365 dias) - expira em 2026
const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5ZjZjMDVlLWNmZmMtNGNlYi04NmU0LWJmYmM0N2VmY2ZkZSIsInJvbGUiOiI3MWYxYzIyZi1jOGMyLTRjYjctOGMzNS1jNDA1MDY4M2UwYmEiLCJhcHBfYWNjZXNzIjp0cnVlLCJhZG1pbl9hY2Nlc3MiOnRydWUsImlhdCI6MTc1OTMyNzQ4NCwiZXhwIjoxNzkwODYzNDg0LCJpc3MiOiJkaXJlY3R1cyJ9.-Vs4DXspNGEjFZZGM6YmDmyh43hcFuzgaLVMCFILScU';

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
    `/items/noticias?filter[destaque][_eq]=true&filter[status][_eq]=published&limit=15&sort=-data_publicacao&fields=*,imagem.*,autor.*&t=${Date.now()}`
  );
  console.log('🔍 getNoticiasDestaque - Primeira notícia autor:', JSON.stringify(data.data[0]?.autor, null, 2));
  return data.data;
}

export async function getUltimasNoticias(limit: number = 10): Promise<Noticia[]> {
  const data: NoticiaResponse = await fetchAPI(
    `/items/noticias?filter[status][_eq]=published&limit=${limit}&sort=-data_publicacao&fields=*,imagem.*,autor.*&t=${Date.now()}`
  );
  return data.data;
}

export async function getNoticiaById(id: string): Promise<Noticia> {
  const data: SingleNoticiaResponse = await fetchAPI(
    `/items/noticias/${id}?fields=*,imagem.*,autor.*&t=${Date.now()}`
  );
  return data.data;
}

export async function getNoticiaBySlug(slug: string): Promise<Noticia> {
  const data: NoticiaResponse = await fetchAPI(
    `/items/noticias?filter[slug][_eq]=${slug}&fields=*,imagem.*,autor.*&limit=1&t=${Date.now()}`
  );
  if (!data.data || data.data.length === 0) {
    throw new Error('Notícia não encontrada');
  }
  const noticia = data.data[0];
  console.log('🔍 getNoticiaBySlug - Autor recebido:', JSON.stringify(noticia.autor, null, 2));
  console.log('🔍 getNoticiaBySlug - Tipo do autor:', typeof noticia.autor);
  return noticia;
}

export function getImageUrl(imagem: Noticia['imagem']): string {
  if (!imagem) return '/placeholder.svg';

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
