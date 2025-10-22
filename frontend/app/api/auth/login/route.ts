import { NextRequest, NextResponse } from 'next/server';

// Credenciais do usuário admin que sabemos que funcionam
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
const DIRECTUS_URL = 'http://localhost:8055';

export async function POST(request: NextRequest) {
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
    console.error('Erro na autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
