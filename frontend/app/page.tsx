'use client';

import { useEffect, useState } from 'react';
import { Noticia, getNoticiasDestaque, getUltimasNoticias, getImageUrl, formatarData, capitalizarCategoria } from '@/lib/directus';
import NoticiaCard from '@/components/NoticiaCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [noticiasDestaque, setNoticiasDestaque] = useState<Noticia[]>([]);
  const [ultimasNoticias, setUltimasNoticias] = useState<Noticia[]>([]);
  const [maisLidas, setMaisLidas] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNoticias() {
      try {
        setLoading(true);
        const [destaque, ultimas] = await Promise.all([
          getNoticiasDestaque(),
          getUltimasNoticias(20),
        ]);
        console.log("DEBUG noticias destaque", destaque);
        console.log("DEBUG ultimas noticias", ultimas);
        setNoticiasDestaque(destaque);
        setUltimasNoticias(ultimas);
        // Simular "mais lidas" pegando as primeiras notícias
        setMaisLidas(ultimas.slice(0, 5));
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
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">Carregando notícias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl">
            {error}
          </div>
        ) : (
          <>
            {/* Seção de Destaques - 3 colunas ocupando toda a largura */}
            {noticiasDestaque && noticiasDestaque.length >= 5 && (
              <section className="mb-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna 1: Notícia Principal Grande */}
                    <div className="lg:col-span-1">
                      <Link
                        href={`/noticia/${noticiasDestaque[0].slug}`}
                        className="block group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full"
                      >
                        <div className="relative h-[500px] lg:h-[640px]">
                          <Image
                            src={getImageUrl(noticiasDestaque[0].imagem)}
                            alt={noticiasDestaque[0].titulo}
                            fill
                            sizes="(max-width: 1024px) 100vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-6 text-white">
                            <span className="bg-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block">
                              {capitalizarCategoria(noticiasDestaque[0].categoria)}
                            </span>
                            <h2 className="text-2xl font-bold leading-tight group-hover:text-blue-200 transition-colors mb-2">
                              {noticiasDestaque[0].titulo}
                            </h2>
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* Coluna 2: 2 Notícias Menores */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                      {noticiasDestaque.slice(1, 3).map((noticia) => (
                        <Link
                          key={noticia.id}
                          href={`/noticia/${noticia.slug}`}
                          className="block group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex-1"
                        >
                          <div className="relative h-[240px] lg:h-[308px]">
                            <Image
                              src={getImageUrl(noticia.imagem)}
                              alt={noticia.titulo}
                              fill
                              sizes="(max-width: 1024px) 100vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-4 text-white w-full">
                              <span className="bg-blue-600 text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block">
                                {capitalizarCategoria(noticia.categoria)}
                              </span>
                              <h3 className="text-base font-bold leading-tight group-hover:text-blue-200 transition-colors line-clamp-2">
                                {noticia.titulo}
                              </h3>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Coluna 3: 2 Notícias Menores */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                      {noticiasDestaque.slice(3, 5).map((noticia) => (
                        <Link
                          key={noticia.id}
                          href={`/noticia/${noticia.slug}`}
                          className="block group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex-1"
                        >
                          <div className="relative h-[240px] lg:h-[308px]">
                            <Image
                              src={getImageUrl(noticia.imagem)}
                              alt={noticia.titulo}
                              fill
                              sizes="(max-width: 1024px) 100vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-4 text-white w-full">
                              <span className="bg-blue-600 text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block">
                                {capitalizarCategoria(noticia.categoria)}
                              </span>
                              <h3 className="text-base font-bold leading-tight group-hover:text-blue-200 transition-colors line-clamp-2">
                                {noticia.titulo}
                              </h3>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}

            {/* Grid com Conteúdo Principal + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna Principal */}
              <div className="lg:col-span-2 space-y-10">
                {/* Mais Destaques */}
              {noticiasDestaque && noticiasDestaque.length > 5 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-5 pb-3 border-b-2 border-blue-600 flex items-center gap-2">
                    <span className="text-yellow-500">⭐</span>
                    Mais Destaques
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {noticiasDestaque.slice(5, 9).map((noticia) => (
                      <NoticiaCard key={noticia.id} noticia={noticia} featured />
                    ))}
                  </div>
                </section>
              )}

              {/* Todas as Notícias */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-5 pb-3 border-b-2 border-blue-600 flex items-center gap-2">
                  <span className="text-blue-600">📰</span>
                  Todas as Notícias
                </h2>
                <div className="space-y-4">
                  {ultimasNoticias && ultimasNoticias.length > 0 ? (
                    ultimasNoticias.map((noticia) => (
                      <NoticiaCard key={noticia.id} noticia={noticia} />
                    ))
                  ) : (
                    <p className="text-gray-600">Nenhuma notícia encontrada.</p>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Mais Lidas */}
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-32">
                <h3 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-red-500 flex items-center gap-2">
                  <span className="text-red-500">🔥</span>
                  Mais Lidas
                </h3>
                <div className="space-y-4">
                  {maisLidas.map((noticia) => (
                    <div key={noticia.id}>
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
    </div>
  );
}
