'use client';

import { Skeleton, SkeletonImage, SkeletonText } from './Skeleton';
import { NoticiaCardSkeleton, NoticiaCardCompactSkeleton } from './NoticiaCardSkeleton';

export function HomePageSkeleton() {
  return (
    <div className="container mx-auto px-2 py-8">
      {/* Hero section skeleton */}
      <div className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <SkeletonImage className="w-full h-64 lg:h-96" />
          
          <div className="p-6 lg:p-8">
            <div className="mb-4">
              <Skeleton width="100px" height="1.5rem" className="h-6" />
            </div>
            
            <div className="mb-4">
              <SkeletonText lines={2} className="space-y-3" />
            </div>
            
            <div className="mb-6">
              <SkeletonText lines={3} lastLineWidth="60%" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton width="40px" height="40px" rounded="full" />
                <div className="space-y-1">
                  <Skeleton width="100px" height="0.875rem" />
                  <Skeleton width="80px" height="0.75rem" />
                </div>
              </div>
              <Skeleton width="80px" height="0.75rem" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Seção de notícias em destaque */}
      <div className="mb-12">
        <div className="mb-6">
          <Skeleton width="200px" height="1.75rem" className="h-7" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <NoticiaCardSkeleton key={index} />
          ))}
        </div>
      </div>
      
      {/* Seção de últimas notícias */}
      <div className="mb-12">
        <div className="mb-6">
          <Skeleton width="180px" height="1.75rem" className="h-7" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna principal */}
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <NoticiaCardSkeleton key={index} />
            ))}
          </div>
          
          {/* Coluna lateral */}
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <NoticiaCardCompactSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Seção de categorias */}
      <div className="mb-12">
        <div className="mb-6">
          <Skeleton width="150px" height="1.75rem" className="h-7" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-4 text-center">
              <Skeleton width="40px" height="40px" rounded="full" className="mx-auto mb-3" />
              <Skeleton width="80px" height="1rem" className="mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
