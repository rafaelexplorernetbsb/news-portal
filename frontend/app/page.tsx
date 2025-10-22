'use client';

import { useEffect, useState } from 'react';
import {
  Noticia,
  getNoticiasDestaque,
  getUltimasNoticias,
  getImageUrl,
  formatarData,
  capitalizarCategoria,
  getNoticiasPorCategoriaEspecifica,
} from '@/lib/directus';
import { HomePageSkeleton } from '@/components/HomePageSkeleton';
import NoticiaCard from '@/components/NoticiaCard';
import NotificationPopup from '@/components/NotificationPopup';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [noticiasDestaque, setNoticiasDestaque] = useState<Noticia[]>([]);
  const [ultimasNoticias, setUltimasNoticias] = useState<Noticia[]>([]);
  const [maisLidas, setMaisLidas] = useState<Noticia[]>([]);
  const [categoriasComNoticias, setCategoriasComNoticias] = useState<Array<{ categoria: any; noticias: Noticia[] }>>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNoticias() {
      try {
        setLoading(true);
        const [destaque, ultimas] = await Promise.all([getNoticiasDestaque(), getUltimasNoticias(200)]);
        setNoticiasDestaque(destaque);
        setUltimasNoticias(ultimas);
        setMaisLidas(ultimas.slice(0, 5));

        const categoriasUnicas = new Set<string>();
        ultimas.forEach((noticia) => {
          if (typeof noticia.categoria === 'string') {
            categoriasUnicas.add(noticia.categoria);
          } else if (typeof noticia.categoria === 'object' && noticia.categoria?.nome) {
            categoriasUnicas.add(noticia.categoria.nome);
          }
        });

        const categoriasComNoticiasData = await Promise.all(
          Array.from(categoriasUnicas)
            .slice(0, 6)
            .map(async (categoriaNome) => {
              let noticiasCategoria;

              if (categoriaNome.toLowerCase().includes('cultura')) {
                noticiasCategoria = await getNoticiasPorCategoriaEspecifica('Cultura', 12);
              } else {
                noticiasCategoria = ultimas
                  .filter((noticia) => {
                    if (typeof noticia.categoria === 'string') {
                      return noticia.categoria.toLowerCase() === categoriaNome.toLowerCase();
                    } else if (typeof noticia.categoria === 'object' && noticia.categoria?.nome) {
                      return noticia.categoria.nome.toLowerCase() === categoriaNome.toLowerCase();
                    }
                    return false;
                  })
                  .slice(0, 12);
              }

              return {
                categoria: {
                  id: categoriaNome.toLowerCase().replace(/\s+/g, '-'),
                  nome: categoriaNome,
                  slug: categoriaNome.toLowerCase().replace(/\s+/g, '-'),
                  contagem: noticiasCategoria.length,
                },
                noticias: noticiasCategoria,
              };
            })
        );

        const categoriasComNoticiasFiltradas = categoriasComNoticiasData.filter((item) => item.noticias.length > 0);

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
    return <HomePageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl">{error}</div>
      ) : (
        <>
            {noticiasDestaque && noticiasDestaque.length > 0 && (
              <section className="mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            {capitalizarCategoria(
                              typeof noticiasDestaque[0].categoria === 'string'
                                ? noticiasDestaque[0].categoria
                                : typeof noticiasDestaque[0].categoria === 'object' &&
                                  noticiasDestaque[0].categoria?.nome
                                ? noticiasDestaque[0].categoria.nome
                                : 'tecnologia'
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h1 className="text-2xl lg:text-3xl font-bold text-[#333333] mb-3 group-hover:text-[#1c99da] transition-colors leading-tight">
                          {noticiasDestaque[0].titulo}
                        </h1>
                        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{noticiasDestaque[0].resumo}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{formatarData(noticiasDestaque[0].data_publicacao)}</span>
                        </div>
                      </div>
                    </Link>

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

                  <div className="space-y-4">
                    {noticiasDestaque.slice(1, 5).map((noticia, index) => (
                      <NoticiaCard key={`${noticia.id}-${index}`} noticia={noticia} featured />
                    ))}
                  </div>
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <section className="mb-8">
                  <h2 className="text-xl font-bold text-[#333333] mb-4 pb-2 border-b-2 border-[#1c99da]">
                    Últimas Notícias
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {ultimasNoticias && ultimasNoticias.length > 0 ? (
                      ultimasNoticias
                        .slice(0, 12)
                        .map((noticia, index) => (
                          <NoticiaCard key={`${noticia.id}-${index}`} noticia={noticia} featured />
                        ))
                    ) : (
                      <div className="col-span-full p-8 text-center text-gray-600">
                        <p>Nenhuma notícia encontrada.</p>
                      </div>
                    )}
                  </div>
                </section>

                {categoriasComNoticias.map(({ categoria, noticias }, categoriaIndex) => (
                  <section key={categoria.id} className="mb-8">
                    <div className="flex items-center mb-4">
                      <h2
                        className="text-xl font-bold text-white pb-2 bg-[#db0202] w-[40%] px-4 py-2 rounded-l-lg"
                        style={{ clipPath: 'polygon(0 0, 95% 0, 90% 100%, 0 100%)' }}
                      >
                        {categoria.nome}
                      </h2>
                      <div
                        className="bg-[#db0202] h-11 w-14 -ml-7"
                        style={{ clipPath: 'polygon(42% 0, 95% 0, 55% 100%, 0 100%)' }}
                      />
                      <div
                        className="bg-[#db0202] h-11 w-14 -ml-2"
                        style={{ clipPath: 'polygon(42% 0, 95% 0, 55% 100%, 0 100%)' }}
                      />
                      <div
                        className="bg-[#db0202] h-11 w-10 rounded-r-xl -ml-2"
                        style={{ clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 0 100%)' }}
                      />

                      <div className="flex-grow" />
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

              <aside className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-4 sticky top-32">
                  <h3 className="text-lg font-bold text-[#333333] mb-4 pb-2 border-b-2 border-[#db0202]">Mais Lidas</h3>
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

      <NotificationPopup />
    </div>
  );
}
