import {
  createDirectus,
  rest,
  readItems,
  readItem,
  readSingleton,
} from '@directus/sdk';

// Configuração do Directus
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

if (!DIRECTUS_URL) {
  throw new Error(
    'NEXT_PUBLIC_DIRECTUS_URL não está definida nas variáveis de ambiente'
  );
}

// Tipos TypeScript para o SDK
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
  audio_url?: string;
  data_publicacao: string;
  destaque: boolean;
  categoria:
    | {
        id: number;
        nome: string;
        slug: string;
      }
    | string;
  autor: {
    id: number;
    nome: string;
    biografia?: string;
    foto?: string;
    email?: string;
  };
  fonte_rss: string;
  link_original: string;
}

export interface Categoria {
  id: number;
  nome: string;
  slug: string;
  descricao?: string;
  cor?: string;
  icone?: string;
}

export interface Autor {
  id: number;
  nome: string;
  biografia?: string;
  foto?: string;
  email?: string;
}

// Schema do Directus
export interface DirectusSchema {
  noticias: Noticia[];
  categorias: Categoria[];
  autores: Autor[];
}

// Criar instância do Directus com configuração otimizada
export const directus = createDirectus<DirectusSchema>(DIRECTUS_URL).with(
  rest({
    onRequest: (options) => ({
      ...options,
      cache: 'no-store', // Evita cache para dados sempre atualizados
      headers: {
        ...options.headers,
        Authorization: `Bearer ${API_TOKEN}`,
      },
    }),
  })
);

// Funções auxiliares para URLs de imagem
export function getImageUrl(imagem: any, urlImagem?: string): string {
  if (urlImagem) {
    return urlImagem;
  }

  if (typeof imagem === 'string') {
    return imagem;
  }

  if (imagem && imagem.filename_download) {
    return `${DIRECTUS_URL}/assets/${imagem.filename_download}`;
  }

  return '/placeholder-image.jpg';
}

// Função para formatar data
export function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Função para capitalizar categoria
export function capitalizarCategoria(categoria: string): string {
  return categoria
    .split(' ')
    .map(
      (palavra) =>
        palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
    )
    .join(' ');
}

// Função para obter nome do autor
export function getAutorNome(autor: any): string {
  if (!autor) return 'Autor não informado';

  if (typeof autor === 'string') {
    return autor;
  }

  if (autor.nome) {
    return autor.nome;
  }

  return 'Autor não informado';
}

export { readItems, readItem, readSingleton };
