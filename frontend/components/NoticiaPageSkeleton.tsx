'use client';

import {
  Skeleton,
  SkeletonImage,
  SkeletonText,
  SkeletonAvatar,
} from './Skeleton';

export function NoticiaPageSkeleton() {
  return (
    <div className="container mx-auto px-2 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Artigo principal */}
        <article className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Imagem principal skeleton */}
            <SkeletonImage className="w-full h-64 lg:h-80" />

            <div className="p-6 lg:p-8">
              {/* Categoria skeleton */}
              <div className="mb-4">
                <Skeleton width="100px" height="1.5rem" className="h-6" />
              </div>

              {/* Título skeleton */}
              <div className="mb-6">
                <SkeletonText lines={3} className="space-y-3" />
              </div>

              {/* Meta informações skeleton */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <SkeletonAvatar size="md" />
                  <div className="space-y-1">
                    <Skeleton width="120px" height="0.875rem" />
                    <Skeleton width="100px" height="0.75rem" />
                  </div>
                </div>
                <Skeleton width="100px" height="0.75rem" />
              </div>

              {/* Conteúdo skeleton */}
              <div className="prose max-w-none">
                <SkeletonText lines={8} className="space-y-3 mb-6" />
                <SkeletonText lines={6} className="space-y-3 mb-6" />
                <SkeletonText lines={4} lastLineWidth="70%" />
              </div>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Notícias relacionadas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <Skeleton width="150px" height="1.25rem" className="h-5" />
            </div>

            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex space-x-3">
                  <SkeletonImage className="w-16 h-12 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <SkeletonText lines={2} className="space-y-1" />
                    <Skeleton width="60px" height="0.75rem" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mais notícias */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <Skeleton width="120px" height="1.25rem" className="h-5" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <SkeletonText lines={2} className="space-y-1" />
                  <Skeleton width="50px" height="0.75rem" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
