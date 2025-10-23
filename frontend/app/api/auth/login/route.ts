import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Credenciais do usuário admin que sabemos que funcionam
    const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;
    const DIRECTUS_URL = process.env.DIRECTUS_URL;

    if (!ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'DIRECTUS_ADMIN_EMAIL não está definida nas variáveis de ambiente' },
        { status: 500 }
      );
    }

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'DIRECTUS_ADMIN_PASSWORD não está definida nas variáveis de ambiente' },
        { status: 500 }
      );
    }

    if (!DIRECTUS_URL) {
      return NextResponse.json(
        { error: 'DIRECTUS_URL não está definida nas variáveis de ambiente' },
        { status: 500 }
      );
    }
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
      return NextResponse.json(
        { error: 'Falha na autenticação' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Retorna apenas os dados necessários, sem expor tokens completos
    return NextResponse.json({
      success: true,
      expires: data.data.expires,
      // Não retornamos o token completo para o frontend
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
