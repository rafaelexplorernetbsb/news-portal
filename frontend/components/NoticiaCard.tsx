import Link from 'next/link';
import Image from 'next/image';
import { Noticia, getImageUrl, formatarData, capitalizarCategoria, getAutorNome } from '@/lib/directus';

interface NoticiaCardProps {
  noticia: Noticia;
  featured?: boolean;
  compact?: boolean;
}

export default function NoticiaCard({ noticia, featured = false, compact = false }: NoticiaCardProps) {
  const imagemUrl = getImageUrl(noticia.imagem, noticia.url_imagem);

  // Card compacto para sidebar
  if (compact) {
    return (
      <Link
        href={`/noticia/${noticia.slug}`}
        className="group flex gap-3 hover:bg-gray-50 p-2 rounded-lg transition-all"
      >
        <div className="relative w-20 h-20 flex-shrink-0">
          <Image
            src={imagemUrl}
            alt={noticia.titulo}
            fill
            className="object-cover rounded-lg"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-3 leading-snug">
            {noticia.titulo}
          </h4>
        </div>
      </Link>
    );
  }

  // Card em destaque (hero/principal)
  if (featured) {
    return (
      <Link
        href={`/noticia/${noticia.slug}`}
        className="group block bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
      >
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={imagemUrl}
            alt={noticia.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          {/* Categoria badge */}
          {noticia.categoria && (
            <div className="absolute top-4 left-4">
              <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wide rounded-full">
                {capitalizarCategoria(typeof noticia.categoria === 'string' ? noticia.categoria : typeof noticia.categoria === 'object' && noticia.categoria?.nome ? noticia.categoria.nome : 'tecnologia')}
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {noticia.titulo}
          </h3>
          <p className="text-gray-600 mb-3 line-clamp-2 text-sm leading-relaxed">
            {noticia.resumo}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              📅 {formatarData(noticia.data_publicacao)}
            </span>
            {noticia.autor && (
              <span className="flex items-center gap-1">
                👤 {getAutorNome(noticia.autor)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Card normal (lista)
  return (
    <Link
      href={`/noticia/${noticia.slug}`}
      className="group flex gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
    >
      <div className="relative w-32 h-24 flex-shrink-0">
        <Image
          src={imagemUrl}
          alt={noticia.titulo}
          fill
          className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
          unoptimized
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
          {noticia.titulo}
        </h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
          {noticia.resumo}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            📅 {formatarData(noticia.data_publicacao)}
          </span>
        </div>
      </div>
    </Link>
  );
}
