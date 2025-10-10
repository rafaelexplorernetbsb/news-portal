'use client';

import Image from 'next/image';
import React from 'react';

type ExternalVideoCardProps = {
  url: string;
  imageUrl?: string;
  title?: string;
  className?: string;
};

export default function ExternalVideoCard({ url, imageUrl, title = 'Vídeo externo', className = '' }: ExternalVideoCardProps) {
  return (
    <div className={`relative rounded-xl overflow-hidden bg-gray-100 ${className}`}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          width={1280}
          height={720}
          className="w-full h-full object-cover"
          priority={false}
          unoptimized
        />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center text-5xl">🎥</div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

      {/* CTA */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-3 rounded-lg bg-white/95 hover:bg-white text-gray-900 font-semibold shadow-lg transition-colors"
        >
          <span className="mr-2">▶</span>
          Assistir no site original
        </a>
      </div>
    </div>
  );
}


