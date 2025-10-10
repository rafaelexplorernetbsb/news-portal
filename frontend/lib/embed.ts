/**
 * Helper para verificar se uma URL pode ser exibida em iframe
 */

// Domínios que bloqueiam iframes (X-Frame-Options: sameorigin)
const BLOCKED_DOMAINS = [
  'globoplay.globo.com',
  'g1.globo.com',
  'globo.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'tiktok.com',
];

// Domínios que permitem iframes
const ALLOWED_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'soundcloud.com',
  'spotify.com',
  'open.spotify.com',
];

/**
 * Verifica se uma URL pode ser exibida em iframe
 * @param url - URL para verificar
 * @returns true se pode ser exibida em iframe, false caso contrário
 */
export function canEmbed(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Verificar se está na lista de domínios bloqueados
    if (BLOCKED_DOMAINS.some(domain => hostname.includes(domain))) {
      return false;
    }
    
    // Verificar se está na lista de domínios permitidos
    if (ALLOWED_DOMAINS.some(domain => hostname.includes(domain))) {
      return true;
    }
    
    // Por padrão, assumir que pode ser exibido (mas pode falhar)
    return true;
  } catch {
    return false;
  }
}

/**
 * Extrai o domínio de uma URL
 * @param url - URL para extrair domínio
 * @returns domínio da URL ou string vazia se inválida
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Verifica se uma URL é de vídeo
 * @param url - URL para verificar
 * @returns true se é uma URL de vídeo
 */
export function isVideoUrl(url: string): boolean {
  const videoDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'globoplay.globo.com'];
  const domain = getDomain(url);
  return videoDomains.some(videoDomain => domain.includes(videoDomain));
}

/**
 * Verifica se uma URL é de áudio
 * @param url - URL para verificar
 * @returns true se é uma URL de áudio
 */
export function isAudioUrl(url: string): boolean {
  const audioDomains = ['soundcloud.com', 'spotify.com', 'open.spotify.com'];
  const domain = getDomain(url);
  return audioDomains.some(audioDomain => domain.includes(audioDomain));
}

