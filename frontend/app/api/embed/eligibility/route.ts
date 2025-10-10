import { NextRequest, NextResponse } from 'next/server';
import { NON_EMBED_HOSTS } from '@/lib/embed/policy';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ embeddable: false, reason: 'missing_url' }, { status: 400 });
  }

  let host: string | null = null;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return NextResponse.json({ embeddable: false, reason: 'invalid_url' }, { status: 400 });
  }

  if (NON_EMBED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))) {
    return NextResponse.json({ embeddable: false, reason: 'blocked_by_policy', host });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);

    const xfo = res.headers.get('x-frame-options')?.toLowerCase() || '';
    const csp = res.headers.get('content-security-policy')?.toLowerCase() || '';
    const frameAncestorsDenied = /frame-ancestors\s+('none'|none)/.test(csp);
    const sameorigin = xfo.includes('sameorigin');
    const deny = xfo.includes('deny');

    if (deny || sameorigin || frameAncestorsDenied) {
      return NextResponse.json({ embeddable: false, reason: 'headers_block', xfo, csp, host });
    }

    return NextResponse.json({ embeddable: true, reason: 'ok', host });
  } catch (e) {
    return NextResponse.json({ embeddable: false, reason: 'network_error', host }, { status: 200 });
  }
}





