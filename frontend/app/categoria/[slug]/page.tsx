'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Noticia, capitalizarCategoria, getNoticiasPorCategoria } from '@/lib/directus';
import NoticiaCard from '@/components/NoticiaCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Usar as variáveis de ambiente do .env
const API_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

const NOTICIAS_POR_PAGINA = 9;

export default function CategoriaPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadNoticias = async (currentOffset: number, append: boolean = false) => {
    try {

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Usar a função getNoticiasPorCategoria com offset
      const result = await getNoticiasPorCategoria(slug, NOTICIAS_POR_PAGINA, currentOffset);
      const novasNoticias = result.noticias;


      if (append) {
        setNoticias((prev) => {
          // Criar um Map para evitar duplicatas baseado no ID
          const existingIds = new Set(prev.map(n => n.id));
          const uniqueNovasNoticias = novasNoticias.filter(n => !existingIds.has(n.id));
          return [...prev, ...uniqueNovasNoticias];
        });
      } else {
        setNoticias(novasNoticias);
      }

      // Usar o hasMore retornado pela função
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Erro ao carregar notícias:', err);
      setError('Erro ao carregar notícias da categoria.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (slug) {
      setOffset(0);
      setNoticias([]);
      loadNoticias(0, false);
    }
  }, [slug]);

  const handleLoadMore = () => {
    const newOffset = offset + NOTICIAS_POR_PAGINA;
    setOffset(newOffset);
    loadNoticias(newOffset, true);
  };

  const categoriaNome = capitalizarCategoria(slug);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Banner da Categoria */}
      <div className="bg-[#333333] text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">{categoriaNome}</h1>
          <p className="text-gray-300">Todas as notícias sobre {categoriaNome.toLowerCase()}</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#1c99da]"></div>
            <p className="mt-4 text-gray-600">Carregando notícias...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Coluna Principal */}
            <div className="lg:col-span-3">
              {noticias.length > 0 ? (
                <>
                  {/* Grid de Notícias */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                    {noticias.map((noticia, index) => (
                      <NoticiaCard key={`${noticia.id}-${index}`} noticia={noticia} />
                    ))}
                  </div>

                  {/* Botão Carregar Mais */}
                  {hasMore && (
                    <div className="text-center mt-8">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="bg-[#1c99da] hover:bg-[#1a8bc7] text-white font-bold px-8 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingMore ? (
                          <span className="flex items-center gap-2">
                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Carregando...
                          </span>
                        ) : (
                          'Mais Notícias'
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📰</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma notícia encontrada</h2>
                  <p className="text-gray-600 mb-6">Não há notícias nesta categoria no momento.</p>
                </div>
              )}
            </div>

            {/* Sidebar - Outras Categorias */}
            <aside className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-32">
                <h3 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b-2 border-blue-600">
                  📂 Outras Categorias
                </h3>
                <ul className="space-y-3">
                  {['politica', 'economia', 'tecnologia', 'esportes', 'cultura', 'saude', 'educacao']
                    .filter((cat) => cat !== slug)
                    .map((categoria) => (
                      <li key={categoria}>
                        <a
                          href={`/categoria/${categoria}`}
                          className="block px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium text-gray-700"
                        >
                          {capitalizarCategoria(categoria)}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
