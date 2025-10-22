'use client';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  animate?: boolean;
}

export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'md',
  animate = true
}: SkeletonProps) {
  const roundedClasses = {
    'none': 'rounded-none',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'xl': 'rounded-xl',
    '2xl': 'rounded-2xl',
    'full': 'rounded-full',
  };

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 ${animate ? 'animate-pulse' : ''} ${roundedClasses[rounded]} ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
      }}
    />
  );
}

// Componentes específicos de skeleton
export function SkeletonText({
  lines = 1,
  className = '',
  lastLineWidth = '75%'
}: {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="0.75rem"
          width={index === lines - 1 ? lastLineWidth : '100%'}
          className="h-3"
        />
      ))}
    </div>
  );
}

export function SkeletonImage({
  className = '',
  aspectRatio = 'aspect-video'
}: {
  className?: string;
  aspectRatio?: string;
}) {
  return (
    <Skeleton
      className={`w-full ${aspectRatio} ${className}`}
      rounded="lg"
    />
  );
}

export function SkeletonAvatar({
  size = 'md',
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <Skeleton
      className={`${sizeClasses[size]} ${className}`}
      rounded="full"
    />
  );
}

export function SkeletonButton({
  className = '',
  size = 'md'
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  return (
    <Skeleton
      className={`${sizeClasses[size]} ${className}`}
      rounded="md"
    />
  );
}
