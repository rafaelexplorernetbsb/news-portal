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
  getAutorNome,
} from '@/lib/directus';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NoticiaCard from '@/components/NoticiaCard';
import ArticleMedia from '@/components/ArticleMedia';
import ContentRenderer from '@/components/ContentRenderer';
import { FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const API_URL = 'http://localhost:8055';
const API_TOKEN = '094d174e18964f1fbd01a13a8a96870e517e629de8c2c9884760864153d2281c';

export default function NoticiaPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [ultimasNoticias, setUltimasNoticias] = useState<Noticia[]>([]);
  const [noticiasRelacionadas, setNoticiasRelacionadas] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNoticia() {
      try {
        setLoading(true);
        const data = await getNoticiaPorSlug(slug);
        setNoticia(data);

        // Carregar últimas notícias (excluindo a atual)
        const ultimas = await getUltimasNoticias(6);
        setUltimasNoticias(ultimas.filter((n) => n.slug !== slug).slice(0, 5));

        // Carregar notícias relacionadas (mesma categoria)
        if (data && data.categoria) {
          const response = await fetch(
            `${API_URL}/items/noticias?filter[categoria][_eq]=${data.categoria}&filter[slug][_neq]=${slug}&filter[status][_eq]=published&sort=-data_publicacao&fields=*,imagem.*,autor.*&limit=6`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_TOKEN}`,
              },
            },
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
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 text-lg font-medium">Carregando notícia...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl">
            {error || 'Notícia não encontrada'}
          </div>
          <Link href="/" className="inline-block mt-6 text-blue-600 hover:text-blue-800 font-medium">
            ← Voltar para Home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const imagemUrl = getImageUrl(noticia.imagem, noticia.url_imagem);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
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
                  href={`/categoria/${typeof noticia.categoria === 'string' ? noticia.categoria : noticia.categoria.slug}`}
                  className="hover:text-blue-600"
                >
                  {capitalizarCategoria(
                    typeof noticia.categoria === 'string' ? noticia.categoria : noticia.categoria.nome,
                  )}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 font-medium truncate">{noticia.titulo}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Artigo Principal */}
          <article className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Mídia Principal (Vídeo ou Imagem) */}
              <ArticleMedia
                title={noticia.titulo}
                imageUrl={imagemUrl}
                imageAlt={noticia.titulo}
                embedHtml={noticia.embed_html}
                videoUrl={noticia.video_url}
                className="h-[500px]"
              />

              {/* Conteúdo */}
              <div className="p-8 lg:p-12">
                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {noticia.categoria && (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-blue-600 text-white uppercase tracking-wide">
                      {capitalizarCategoria(
                        typeof noticia.categoria === 'string' ? noticia.categoria : noticia.categoria.nome,
                      )}
                    </span>
                  )}
                  {noticia.autor && (
                    <span className="flex items-center gap-2 text-gray-600 font-medium">
                      <span className="text-lg">👤</span>
                      {getAutorNome(noticia.autor)}
                    </span>
                  )}
                  {noticia.data_publicacao && (
                    <span className="flex items-center gap-2 text-gray-600 font-medium">
                      <span className="text-lg">📅</span>
                      {formatarData(noticia.data_publicacao)}
                    </span>
                  )}
                </div>

                {/* Título */}
                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
                  {noticia.titulo}
                </h1>

                {/* Resumo */}
                {noticia.resumo && (
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-xl mb-8">
                    <p className="text-xl text-gray-800 italic leading-relaxed font-medium">{noticia.resumo}</p>
                  </div>
                )}

                {/* Conteúdo (HTML ou Markdown) */}
                <ContentRenderer
                  content={noticia.conteudo || ''}
                  className="news-content"
                />

                {/* Botão Compartilhar */}
                <div className="bg-gray-50 p-6 rounded-xl mt-8">
                  <p className="text-sm text-gray-600 mb-3 font-medium">Compartilhe esta notícia:</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const url = window.location.href;
                        window.open(
                          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                          '_blank',
                          'width=600,height=400',
                        );
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <FaFacebook className="text-lg" />
                      Facebook
                    </button>
                    <button
                      onClick={() => {
                        const url = window.location.href;
                        const text = `${noticia.titulo} - Portal de Notícias`;
                        window.open(
                          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
                          '_blank',
                          'width=600,height=400',
                        );
                      }}
                      className="flex-1 bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <FaXTwitter className="text-lg" />
                      Twitter
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
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notícias Relacionadas */}
            {noticiasRelacionadas.length > 0 && (
              <div className="mt-12 pt-12 border-t-2 border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                  <span className="text-blue-600">🔗</span>
                  Notícias Relacionadas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {noticiasRelacionadas.map((noticiaRelacionada) => (
                    <NoticiaCard key={noticiaRelacionada.id} noticia={noticiaRelacionada} featured />
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Últimas Notícias */}
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-32">
              <h3 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b-2 border-red-500 flex items-center gap-2">
                <span className="text-red-500">📰</span>
                Últimas Notícias
              </h3>
              <div className="space-y-4">
                {ultimasNoticias.map((noticia) => (
                  <NoticiaCard key={noticia.id} noticia={noticia} compact />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
