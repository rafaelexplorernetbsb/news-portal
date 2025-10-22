'use client';

import { Skeleton, SkeletonImage, SkeletonText, SkeletonAvatar } from './Skeleton';

export function NoticiaCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Imagem skeleton */}
      <SkeletonImage className="w-full h-48" />
      
      <div className="p-6">
        {/* Categoria skeleton */}
        <div className="mb-3">
          <Skeleton width="80px" height="1.5rem" className="h-6" />
        </div>
        
        {/* Título skeleton */}
        <div className="mb-4">
          <SkeletonText lines={2} className="space-y-2" />
        </div>
        
        {/* Resumo skeleton */}
        <div className="mb-4">
          <SkeletonText lines={3} lastLineWidth="60%" />
        </div>
        
        {/* Autor e data skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SkeletonAvatar size="sm" />
            <div className="space-y-1">
              <Skeleton width="100px" height="0.75rem" />
              <Skeleton width="80px" height="0.75rem" />
            </div>
          </div>
          <Skeleton width="60px" height="0.75rem" />
        </div>
      </div>
    </div>
  );
}

export function NoticiaCardHorizontalSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex">
        {/* Imagem skeleton */}
        <div className="w-32 h-24 flex-shrink-0">
          <SkeletonImage className="w-full h-full" />
        </div>
        
        <div className="flex-1 p-4">
          {/* Categoria skeleton */}
          <div className="mb-2">
            <Skeleton width="60px" height="1rem" />
          </div>
          
          {/* Título skeleton */}
          <div className="mb-2">
            <SkeletonText lines={2} className="space-y-1" />
          </div>
          
          {/* Data skeleton */}
          <Skeleton width="80px" height="0.75rem" />
        </div>
      </div>
    </div>
  );
}

export function NoticiaCardCompactSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="flex">
        {/* Imagem skeleton */}
        <div className="w-20 h-16 flex-shrink-0">
          <SkeletonImage className="w-full h-full" />
        </div>
        
        <div className="flex-1 p-3">
          {/* Título skeleton */}
          <div className="mb-2">
            <SkeletonText lines={2} className="space-y-1" />
          </div>
          
          {/* Data skeleton */}
          <Skeleton width="60px" height="0.75rem" />
        </div>
      </div>
    </div>
  );
}
