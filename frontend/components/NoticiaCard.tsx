import Link from 'next/link';
import Image from 'next/image';
import { Noticia, getImageUrl, formatarData, capitalizarCategoria, getCategoriaNome } from '@/lib/directus';
import { useState, useEffect } from 'react';

interface NoticiaCardProps {
  noticia: Noticia;
  featured?: boolean;
  compact?: boolean;
  category?: boolean;
}

export default function NoticiaCard({
  noticia,
  featured = false,
  compact = false,
  category = false,
}: NoticiaCardProps) {
  const imagemUrl = getImageUrl(noticia.imagem, noticia.url_imagem);
  const [categoriaNome, setCategoriaNome] = useState<string>('Categoria');

  useEffect(() => {
    const loadCategoria = async () => {
      const nome = await getCategoriaNome(noticia.categoria);
      setCategoriaNome(nome);
    };
    loadCategoria();
  }, [noticia.categoria]);

  // Card compacto para sidebar
  if (compact) {
    return (
      <Link
        href={`/noticia/${noticia.slug}`}
        className="group flex gap-3 hover:bg-gray-50 p-3 rounded-lg transition-all border-b border-gray-100 last:border-b-0"
      >
        <div className="relative w-20 h-16 flex-shrink-0">
          <Image src={imagemUrl} alt={noticia.titulo} fill className="object-cover rounded" unoptimized />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-[#333333] group-hover:text-[#1c99da] transition-colors line-clamp-2 leading-snug">
            {noticia.titulo}
          </h4>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{formatarData(noticia.data_publicacao)}</p>
        </div>
      </Link>
    );
  }

  // Card em destaque (hero/principal)
  if (featured) {
    return (
      <Link
        href={`/noticia/${noticia.slug}`}
        className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imagemUrl}
            alt={noticia.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          {/* Categoria badge */}
          {noticia.categoria && (
            <div className="absolute top-3 left-3">
              <span className="inline-block px-2 py-1 bg-[#db0202] text-white text-xs font-bold uppercase tracking-wide rounded">
                {capitalizarCategoria(categoriaNome)}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-[#333333] mb-2 group-hover:text-[#1c99da] transition-colors line-clamp-2 leading-snug">
            {noticia.titulo}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{noticia.resumo}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatarData(noticia.data_publicacao)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (category) {
    return (
      <Link
        href={`/noticia/${noticia.slug}`}
        className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imagemUrl}
            alt={noticia.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-[#333333] mb-2 group-hover:text-[#1c99da] transition-colors line-clamp-2 leading-snug">
            {noticia.titulo}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{noticia.resumo}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatarData(noticia.data_publicacao)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Card normal (lista) - estilo Metrópoles
  return (
    <Link
      href={`/noticia/${noticia.slug}`}
      className="group block bg-white hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
    >
      <div className="flex gap-4 p-4">
        <div className="relative w-24 h-16 flex-shrink-0">
          <Image src={imagemUrl} alt={noticia.titulo} fill className="object-cover rounded" unoptimized />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#333333] mb-1 group-hover:text-[#1c99da] transition-colors line-clamp-2 leading-snug text-sm">
            {noticia.titulo}
          </h3>
          <p className="text-xs text-gray-500">{formatarData(noticia.data_publicacao)}</p>
        </div>
      </div>
    </Link>
  );
}
