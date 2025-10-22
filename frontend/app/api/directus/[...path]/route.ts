import { NextRequest, NextResponse } from 'next/server';

const DIRECTUS_URL = 'http://localhost:8055';

// Credenciais do usuário admin que sabemos que funcionam
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

// Cache para token do servidor
let serverToken: string | null = null;
let tokenExpiry: number = 0;

async function getServerToken(): Promise<string> {
  // Se não há token em cache ou está expirado, renova
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
      // Cache por 1 hora
      tokenExpiry = Date.now() + 3600000;

      console.log('✅ Token do servidor renovado com usuário admin do banco');
    } catch (error) {
      console.error('❌ Erro ao renovar token do servidor:', error);
      throw error;
    }
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

    // Se for um asset, redirecionar diretamente para o Directus sem autenticação
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

      // Adicionar headers CORS para funcionar via ngrok
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      };

      return new NextResponse(data, { headers: corsHeaders });
    }

    // Para outras requisições, usar autenticação
    const token = await getServerToken();

    // Constrói a URL completa
    const url = `${DIRECTUS_URL}/${path}?${searchParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro na requisição' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Adicionar headers CORS para funcionar via ngrok
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error) {
    console.error('Erro no proxy:', error);
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
        'Authorization': `Bearer ${token}`,
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

    // Adicionar headers CORS para funcionar via ngrok
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error) {
    console.error('Erro no proxy POST:', error);
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
