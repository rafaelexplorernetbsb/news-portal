import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, body: notificationBody, url, icon } = body;

    const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

    const response = await fetch(`${DIRECTUS_URL}/push-notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body: notificationBody,
        url,
        icon,
      }),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao enviar notificação',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

