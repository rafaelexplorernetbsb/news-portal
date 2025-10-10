/**
 * Static embed policy utilities.
 * We don't attempt to read response headers on the client due to CORS.
 * For known providers that block iframes, we short-circuit on the client.
 */

export const NON_EMBED_HOSTS: string[] = [
  'globoplay.globo.com',
  'g1.globo.com',
];

export function isEmbeddable(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    const host = hostname.toLowerCase();
    return !NON_EMBED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
  } catch {
    return false;
  }
}

export function getHost(url: string | undefined | null): string | null {
  try {
    if (!url) return null;
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}


