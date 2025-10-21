'use client';

import Image from 'next/image';
import React from 'react';
import ExternalVideoCard from '@/components/ExternalVideoCard';
import { isEmbeddable } from '@/lib/embed/policy';

type ArticleMediaProps = {
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  embedHtml?: string;
  videoUrl?: string;
  providerHost?: string;
  className?: string;
};

function extractSrcFromEmbedHtml(html: string | undefined | null): string | null {
  if (!html) return null;

  try {
    const match = html.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function renderIframe(url: string) {
  try {
    const u = new URL(url);

    return (
      <iframe src={u.toString()} loading="lazy" allowFullScreen className="w-full h-full border-0" title="Vídeo" />
    );
  } catch {
    return null;
  }
}

export default function ArticleMedia({
  title,
  imageUrl,
  imageAlt,
  embedHtml,
  videoUrl,
  className = '',
}: ArticleMediaProps) {
  const hasVideo = Boolean(embedHtml || videoUrl);

  const candidateUrl = videoUrl || extractSrcFromEmbedHtml(embedHtml);
  const canEmbedHere = isEmbeddable(candidateUrl || undefined);

  if (hasVideo) {
    if (!canEmbedHere) {
      return <ExternalVideoCard url={candidateUrl || '#'} imageUrl={imageUrl} title={title} className={className} />;
    }

    if (embedHtml && candidateUrl && isEmbeddable(candidateUrl)) {
      return (
        <div className={`w-full rounded-xl overflow-hidden bg-gray-100 ${className}`} style={{ aspectRatio: '16/9' }}>
          <div className="w-full h-full">
            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: embedHtml }} />
          </div>
        </div>
      );
    }

    if (candidateUrl) {
      return (
        <div className={`w-full aspect-video rounded-xl overflow-hidden bg-gray-100 ${className}`}>
          {renderIframe(candidateUrl)}
        </div>
      );
    }
  }

  if (imageUrl) {
    return (
      <div className={`relative w-full rounded-xl overflow-hidden ${className}`}>
        <Image
          src={imageUrl}
          alt={imageAlt || title || 'Imagem da matéria'}
          fill
          className="object-cover"
          priority={false}
          unoptimized
        />
      </div>
    );
  }

  return null;
}

export function VideoEmbed(props: Omit<ArticleMediaProps, 'height'>) {
  return <ArticleMedia {...props} className={`aspect-video ${props.className || ''}`} />;
}

export function AudioEmbed(props: Omit<ArticleMediaProps, 'height'>) {
  return <ArticleMedia {...props} className={`h-20 ${props.className || ''}`} />;
}
