'use client';

import { Skeleton, SkeletonText } from './Skeleton';
import {
  NoticiaCardSkeleton,
  NoticiaCardHorizontalSkeleton,
} from './NoticiaCardSkeleton';

export function CategoriaPageSkeleton() {
  return (
    <div className="container mx-auto px-2 py-8">
      {/* Header da categoria */}
      <div className="mb-8">
        <div className="text-center">
          {/* Título da categoria skeleton */}
          <Skeleton width="200px" height="2rem" className="h-8 mx-auto mb-4" />

          {/* Descrição skeleton */}
          <SkeletonText lines={2} className="max-w-2xl mx-auto" />
        </div>
      </div>

      {/* Grid de notícias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <NoticiaCardSkeleton key={index} />
        ))}
      </div>

      {/* Lista horizontal de mais notícias */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width="150px" height="1.5rem" className="h-6" />
          <Skeleton width="100px" height="2rem" className="h-8" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <NoticiaCardHorizontalSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
