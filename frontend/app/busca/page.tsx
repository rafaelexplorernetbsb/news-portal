'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Noticia, buscarNoticias } from '@/lib/directus';
import NoticiaCard from '@/components/NoticiaCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function BuscaContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [resultados, setResultados] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function buscarNoticiasHandler() {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const noticias = await buscarNoticias(query, 50);
        setResultados(noticias);
      } catch (err) {
        console.error('Erro na busca:', err);
        setError('Erro ao realizar a busca. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    buscarNoticiasHandler();
  }, [query]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Resultados da Busca
        </h1>
        {query && (
          <p className="text-gray-600">
            Buscando por: <span className="font-semibold text-gray-900">&quot;{query}&quot;</span>
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#1c99da]"></div>
          <p className="mt-4 text-gray-600">Buscando...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      ) : resultados.length > 0 ? (
        <div>
          <p className="text-gray-600 mb-6">
            {resultados.length} {resultados.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </p>
          <div className="space-y-4">
            {resultados.map((noticia, index) => (
              <NoticiaCard key={`${noticia.id}-${index}`} noticia={noticia} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nenhum resultado encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Tente usar palavras-chave diferentes ou verifique a ortografia
          </p>
        </div>
      )}
    </main>
  );
}

export default function BuscaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#1c99da]"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </main>
      }>
        <BuscaContent />
      </Suspense>
      <Footer />
    </div>
  );
}
