import { NextRequest, NextResponse } from 'next/server';

let serverToken: string | null = null;
let tokenExpiry: number = 0;

async function getServerToken(): Promise<string> {
  const DIRECTUS_URL = process.env.DIRECTUS_URL;
  const ADMIN_EMAIL =
    process.env.DIRECTUS_PROXY_EMAIL || process.env.DIRECTUS_ADMIN_EMAIL;
  const ADMIN_PASSWORD =
    process.env.DIRECTUS_PROXY_PASSWORD || process.env.DIRECTUS_ADMIN_PASSWORD;

  if (!DIRECTUS_URL) {
    throw new Error('DIRECTUS_URL não está definida nas variáveis de ambiente');
  }

  if (!ADMIN_EMAIL) {
    throw new Error(
      'DIRECTUS_PROXY_EMAIL ou DIRECTUS_ADMIN_EMAIL não está definida nas variáveis de ambiente'
    );
  }

  if (!ADMIN_PASSWORD) {
    throw new Error(
      'DIRECTUS_PROXY_PASSWORD ou DIRECTUS_ADMIN_PASSWORD não está definida nas variáveis de ambiente'
    );
  }

  if (!serverToken || Date.now() > tokenExpiry) {
    try {
      const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na autenticação: ${response.status}`);
      }

      const data = await response.json();
      serverToken = data.data.access_token;
      tokenExpiry = Date.now() + 3600000;
    } catch (error) {
      throw error;
    }
  }

  if (!serverToken) {
    throw new Error('Failed to get server token');
  }

  return serverToken;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const searchParams = request.nextUrl.searchParams;

    if (path.startsWith('assets/')) {
      const url = `${DIRECTUS_URL}/${path}?${searchParams.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Erro na requisição do asset' },
          { status: response.status }
        );
      }

      const data = await response.arrayBuffer();

      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type':
          response.headers.get('Content-Type') || 'application/octet-stream',
      };

      return new NextResponse(data, { headers: corsHeaders });
    }

    const token = await getServerToken();
    const url = `${DIRECTUS_URL}/${path}?${searchParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro na requisição' },
        { status: response.status }
      );
    }

    const data = await response.json();

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const token = await getServerToken();
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const body = await request.json();

    const response = await fetch(`${DIRECTUS_URL}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro na requisição' },
        { status: response.status }
      );
    }

    const data = await response.json();

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
