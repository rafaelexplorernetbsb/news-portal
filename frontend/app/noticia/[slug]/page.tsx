'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Noticia,
  getNoticiaPorSlug,
  getImageUrl,
  formatarData,
  capitalizarCategoria,
  getUltimasNoticias,
  getCategoriaNome,
} from '@/lib/directus';
import { NoticiaPageSkeleton } from '@/components/NoticiaPageSkeleton';
import Link from 'next/link';
import NoticiaCard from '@/components/NoticiaCard';
import ArticleMedia from '@/components/ArticleMedia';
import ContentRenderer from '@/components/ContentRenderer';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export default function NoticiaPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [ultimasNoticias, setUltimasNoticias] = useState<Noticia[]>([]);
  const [noticiasRelacionadas, setNoticiasRelacionadas] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriaNome, setCategoriaNome] = useState<string>('Categoria');

  useEffect(() => {
    async function loadNoticia() {
      try {
        setLoading(true);
        const data = await getNoticiaPorSlug(slug);
        setNoticia(data);

        if (data && data.categoria) {
          const nome = await getCategoriaNome(data.categoria);
          setCategoriaNome(nome);
        }

        const ultimas = await getUltimasNoticias(6);
        setUltimasNoticias(ultimas.filter((n) => n.slug !== slug).slice(0, 5));

        if (data && data.categoria) {
          // Extrair o ID da categoria corretamente
          let categoriaId: string | number;
          if (typeof data.categoria === 'string') {
            categoriaId = data.categoria;
          } else if (typeof data.categoria === 'number') {
            categoriaId = data.categoria;
          } else if (typeof data.categoria === 'object' && data.categoria.id) {
            categoriaId = data.categoria.id;
          } else {
            categoriaId = String(data.categoria);
          }

          const params = new URLSearchParams({
            'filter[categoria][_eq]': String(categoriaId),
            'filter[slug][_neq]': slug,
            'filter[status][_eq]': 'published',
            'sort': '-data_publicacao',
            'fields': '*,imagem.*,autor.*',
            'limit': '6'
          });

          const response = await fetch(
            `/api/directus/items/noticias?${params.toString()}`
          );
          const relacionadas = await response.json();
          setNoticiasRelacionadas(relacionadas.data || []);
        }
      } catch (err) {
        console.error('Erro ao carregar notícia:', err);
        setError('Erro ao carregar notícia. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadNoticia();
    }
  }, [slug]);

  if (loading) {
    return <NoticiaPageSkeleton />;
  }

  if (error || !noticia) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl">
          {error || 'Notícia não encontrada'}
        </div>
        <Link href="/" className="inline-block mt-6 text-blue-600 hover:text-blue-800 font-medium">
          ← Voltar para Home
        </Link>
      </div>
    );
  }

  const imagemUrl = getImageUrl(noticia.imagem, noticia.url_imagem);

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          {noticia.categoria && (
            <>
              <Link
                href={`/categoria/${
                  typeof noticia.categoria === 'string'
                    ? noticia.categoria
                    : typeof noticia.categoria === 'object'
                    ? noticia.categoria.slug
                    : 'categoria'
                }`}
                className="hover:text-blue-600"
              >
                {capitalizarCategoria(categoriaNome)}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate">{noticia.titulo}</span>
        </nav>
      </div>

      <main className="container mx-auto px-2 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <ArticleMedia
                title={noticia.titulo}
                imageUrl={imagemUrl}
                imageAlt={noticia.titulo}
                embedHtml={noticia.embed_html}
                videoUrl={noticia.video_url}
                className="h-[250px] md:h-[500px]"
              />

              <div className="p-5 md:p-12">
                <div className="flex flex-wrap gap-4 mb-6">
                  {noticia.categoria && (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-blue-600 text-white uppercase tracking-wide">
                      {capitalizarCategoria(categoriaNome)}
                    </span>
                  )}
                  {noticia.data_publicacao && (
                    <span className="flex items-center gap-2 text-gray-600 font-medium">
                      <span className="text-lg">📅</span>
                      {formatarData(noticia.data_publicacao)}
                    </span>
                  )}
                </div>

                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
                  {noticia.titulo}
                </h1>

                {noticia.resumo && (
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-xl mb-8">
                    <p className="text-xl text-gray-800 italic leading-relaxed font-medium">{noticia.resumo}</p>
                  </div>
                )}

                <ContentRenderer content={noticia.conteudo || ''} className="news-content" />

                <div className="bg-gray-50 p-6 rounded-xl mt-8">
                  <p className="text-sm text-gray-600 mb-3 font-medium">Compartilhe esta notícia:</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const url = window.location.href;
                        window.open(
                          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                          '_blank',
                          'width=600,height=400'
                        );
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <FaFacebook className="text-lg" />
                    </button>
                    <button
                      onClick={() => {
                        const url = window.location.href;
                        const text = `${noticia.titulo} - Portal de Notícias`;
                        window.open(
                          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
                            text
                          )}`,
                          '_blank',
                          'width=600,height=400'
                        );
                      }}
                      className="flex-1 bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <FaXTwitter className="text-lg" />
                    </button>
                    <button
                      onClick={() => {
                        const url = window.location.href;
                        const text = `${noticia.titulo} - ${url}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <FaWhatsapp className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {noticiasRelacionadas.length > 0 && (
              <div className="mt-12 pt-12 border-t-2 border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                  <span className="text-blue-600">🔗</span>
                  Notícias Relacionadas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {noticiasRelacionadas.map((noticiaRelacionada, index) => (
                    <NoticiaCard key={`${noticiaRelacionada.id}-${index}`} noticia={noticiaRelacionada} featured />
                  ))}
                </div>
              </div>
            )}
          </article>

          <aside className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-32">
              <h3 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b-2 border-red-500 flex items-center gap-2">
                <span className="text-red-500">📰</span>
                Últimas Notícias
              </h3>
              <div className="space-y-4">
                {ultimasNoticias.map((noticia, index) => (
                  <NoticiaCard key={`${noticia.id}-${index}`} noticia={noticia} compact />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
