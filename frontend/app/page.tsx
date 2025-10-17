'use client';

import { useEffect, useState } from 'react';
import { Noticia, getNoticiasDestaque, getUltimasNoticias, getImageUrl, formatarData, capitalizarCategoria, getNoticiasPorCategoriaEspecifica } from '@/lib/directus';
import NoticiaCard from '@/components/NoticiaCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NotificationPopup from '@/components/NotificationPopup';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [noticiasDestaque, setNoticiasDestaque] = useState<Noticia[]>([]);
  const [ultimasNoticias, setUltimasNoticias] = useState<Noticia[]>([]);
  const [maisLidas, setMaisLidas] = useState<Noticia[]>([]);
  const [categoriasComNoticias, setCategoriasComNoticias] = useState<Array<{categoria: any, noticias: Noticia[]}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNoticias() {
      try {
        setLoading(true);
        const [destaque, ultimas] = await Promise.all([
          getNoticiasDestaque(),
          getUltimasNoticias(200), // Aumentar para ter mais notícias para filtrar
        ]);
        setNoticiasDestaque(destaque);
        setUltimasNoticias(ultimas);
        // Simular "mais lidas" pegando as primeiras notícias
        setMaisLidas(ultimas.slice(0, 5));

        // Criar categorias baseadas nas notícias disponíveis
        const categoriasUnicas = new Set<string>();
        ultimas.forEach(noticia => {
          if (typeof noticia.categoria === 'string') {
            categoriasUnicas.add(noticia.categoria);
          } else if (typeof noticia.categoria === 'object' && noticia.categoria?.nome) {
            categoriasUnicas.add(noticia.categoria.nome);
          }
        });

        // Criar seções por categoria
        const categoriasComNoticiasData = await Promise.all(
          Array.from(categoriasUnicas)
            .slice(0, 6) // Limitar a 6 categorias
            .map(async (categoriaNome) => {
              let noticiasCategoria;

              // Para categoria Cultura, buscar diretamente da API
              if (categoriaNome.toLowerCase().includes('cultura')) {
                noticiasCategoria = await getNoticiasPorCategoriaEspecifica('Cultura', 12);
              } else {
                // Para outras categorias, usar filtro local
                noticiasCategoria = ultimas.filter(noticia => {
                  if (typeof noticia.categoria === 'string') {
                    return noticia.categoria.toLowerCase() === categoriaNome.toLowerCase();
                  } else if (typeof noticia.categoria === 'object' && noticia.categoria?.nome) {
                    return noticia.categoria.nome.toLowerCase() === categoriaNome.toLowerCase();
                  }
                  return false;
                }).slice(0, 12);
              }

              return {
                categoria: {
                  id: categoriaNome.toLowerCase().replace(/\s+/g, '-'),
                  nome: categoriaNome,
                  slug: categoriaNome.toLowerCase().replace(/\s+/g, '-'),
                  contagem: noticiasCategoria.length
                },
                noticias: noticiasCategoria
              };
            })
        );

        const categoriasComNoticiasFiltradas = categoriasComNoticiasData.filter(item => item.noticias.length > 0);

        setCategoriasComNoticias(categoriasComNoticiasFiltradas);
      } catch (err) {
        console.error('Erro ao carregar notícias:', err);
        setError('Erro ao carregar notícias. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }

    loadNoticias();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#1c99da]"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">Carregando notícias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl">
            {error}
          </div>
        ) : (
          <>
            {/* Seção Principal - Destaque */}
            {noticiasDestaque && noticiasDestaque.length > 0 && (
              <section className="mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Notícia Principal */}
                  <div className="lg:col-span-2">
                    <Link
                      href={`/noticia/${noticiasDestaque[0].slug}`}
                      className="block group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative h-80 lg:h-96">
                        <Image
                          src={getImageUrl(noticiasDestaque[0].imagem, noticiasDestaque[0].url_imagem)}
                          alt={noticiasDestaque[0].titulo}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-[#db0202] text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                            {capitalizarCategoria(typeof noticiasDestaque[0].categoria === 'string' ? noticiasDestaque[0].categoria : typeof noticiasDestaque[0].categoria === 'object' && noticiasDestaque[0].categoria?.nome ? noticiasDestaque[0].categoria.nome : 'tecnologia')}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h1 className="text-2xl lg:text-3xl font-bold text-[#333333] mb-3 group-hover:text-[#1c99da] transition-colors leading-tight">
                          {noticiasDestaque[0].titulo}
                        </h1>
                        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                          {noticiasDestaque[0].resumo}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{formatarData(noticiasDestaque[0].data_publicacao)}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Notícias Adicionais abaixo da principal */}
                    {noticiasDestaque.length > 4 && (
                      <div className="mt-6">
                        <h2 className="text-lg font-bold text-[#333333] mb-4 pb-2 border-b-2 border-[#1c99da]">
                          Mais Destaques
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {noticiasDestaque.slice(4, 8).map((noticia, index) => (
                            <NoticiaCard key={`${noticia.id}-${index}`} noticia={noticia} featured />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar com outras notícias */}
                  <div className="space-y-4">
                    {noticiasDestaque.slice(1, 5).map((noticia, index) => (
                      <NoticiaCard key={`${noticia.id}-${index}`} noticia={noticia} featured />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Coluna Principal */}
              <div className="lg:col-span-3">
                {/* Últimas Notícias - Grid 4x3 */}
                <section className="mb-8">
                  <h2 className="text-xl font-bold text-[#333333] mb-4 pb-2 border-b-2 border-[#1c99da]">
                    Últimas Notícias
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {ultimasNoticias && ultimasNoticias.length > 0 ? (
                      ultimasNoticias.slice(0, 12).map((noticia, index) => (
                        <NoticiaCard key={`${noticia.id}-${index}`} noticia={noticia} featured />
                      ))
                    ) : (
                      <div className="col-span-full p-8 text-center text-gray-600">
                        <p>Nenhuma notícia encontrada.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Seções por Categoria */}
                {categoriasComNoticias.map(({ categoria, noticias }, categoriaIndex) => (
                  <section key={categoria.id} className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-[#333333] pb-2 border-b-2 border-[#1c99da]">
                        {categoria.nome}
                      </h2>
                      <Link
                        href={`/categoria/${categoria.slug}`}
                        className="text-[#1c99da] hover:text-[#1a8bc7] font-medium text-sm transition-colors"
                      >
                        Ver todas →
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {noticias.slice(0, 12).map((noticia, index) => (
                        <NoticiaCard key={`${categoria.id}-${noticia.id}-${index}`} noticia={noticia} featured />
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* Mais Lidas */}
                <div className="bg-white rounded-lg shadow-sm p-4 sticky top-32">
                  <h3 className="text-lg font-bold text-[#333333] mb-4 pb-2 border-b-2 border-[#db0202]">
                    Mais Lidas
                  </h3>
                  <div className="space-y-2">
                    {maisLidas.map((noticia, index) => (
                      <div key={noticia.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <NoticiaCard noticia={noticia} compact />
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* Popup de Notificações */}
      <NotificationPopup />
    </div>
  );
}
