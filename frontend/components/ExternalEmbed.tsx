'use client';

import React, { useState } from 'react';
import { canEmbed, getDomain, isVideoUrl, isAudioUrl } from '@/lib/embed';

interface ExternalEmbedProps {
  src: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  allowFullScreen?: boolean;
}

export default function ExternalEmbed({
  src,
  title = 'Conteúdo externo',
  width = '100%',
  height = '400',
  className = '',
  allowFullScreen = true,
}: ExternalEmbedProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const domain = getDomain(src);
  const canBeEmbedded = canEmbed(src);
  const isVideo = isVideoUrl(src);
  const isAudio = isAudioUrl(src);

  // Se não pode ser exibido em iframe ou houve erro, mostrar link externo
  if (!canBeEmbedded || hasError) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <div className="mb-4">
          {isVideo ? (
            <div className="text-6xl mb-2">🎥</div>
          ) : isAudio ? (
            <div className="text-6xl mb-2">🎵</div>
          ) : (
            <div className="text-6xl mb-2">🔗</div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {isVideo ? 'Vídeo do G1' : isAudio ? 'Áudio' : 'Conteúdo Externo'}
        </h3>
        <p className="text-gray-600 mb-4">
          Este conteúdo não pode ser exibido diretamente nesta página.
        </p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          <span className="mr-2">
            {isVideo ? '▶' : isAudio ? '🎵' : '🔗'}
          </span>
          {isVideo ? 'Assistir no G1' : isAudio ? 'Ouvir Áudio' : 'Abrir no Site Original'}
        </a>
        <p className="text-xs text-gray-500 mt-2">
          {domain}
        </p>
      </div>
    );
  }

  // Renderizar iframe normalmente
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Carregando...</div>
        </div>
      )}
      <iframe
        src={src}
        title={title}
        width={width}
        height={height}
        allowFullScreen={allowFullScreen}
        className={`w-full rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        sandbox="allow-scripts allow-same-origin allow-presentation"
      />
    </div>
  );
}

// Componente específico para vídeos com proporção 16:9
export function VideoEmbed(props: Omit<ExternalEmbedProps, 'height'>) {
  return (
    <ExternalEmbed
      {...props}
      height="400"
      className={`aspect-video ${props.className || ''}`}
    />
  );
}

// Componente específico para áudio com altura reduzida
export function AudioEmbed(props: Omit<ExternalEmbedProps, 'height'>) {
  return (
    <ExternalEmbed
      {...props}
      height="80"
      className={`h-20 ${props.className || ''}`}
    />
  );
}

