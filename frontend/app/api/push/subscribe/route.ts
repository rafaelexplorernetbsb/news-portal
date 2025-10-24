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

export async function POST(request: NextRequest) {
  try {
    const DIRECTUS_URL = process.env.DIRECTUS_URL;
    const subscription = await request.json();
    const token = await getServerToken();

    const response = await fetch(`${DIRECTUS_URL}/items/push_subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        expiration_time: subscription.expirationTime || null,
        keys_p256dh: subscription.keys.p256dh,
        keys_auth: subscription.keys.auth,
        user_agent: request.headers.get('user-agent') || null,
      }),
    });

    if (!response.ok) {
      if (response.status === 400 || response.status === 409) {
        const searchResponse = await fetch(
          `${DIRECTUS_URL}/items/push_subscriptions?filter[endpoint][_eq]=${encodeURIComponent(subscription.endpoint)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.data && searchData.data.length > 0) {
            const existingId = searchData.data[0].id;
            const updateResponse = await fetch(
              `${DIRECTUS_URL}/items/push_subscriptions/${existingId}`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  expiration_time: subscription.expirationTime || null,
                  keys_p256dh: subscription.keys.p256dh,
                  keys_auth: subscription.keys.auth,
                  user_agent: request.headers.get('user-agent') || null,
                  updated_at: new Date().toISOString(),
                }),
              }
            );

            if (updateResponse.ok) {
              return NextResponse.json(
                { success: true, message: 'Subscrição atualizada com sucesso' },
                { status: 200 }
              );
            }
          }
        }
      }

      throw new Error(`Erro ao salvar subscrição: ${response.status}`);
    }

    return NextResponse.json(
      { success: true, message: 'Subscrição salva com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Erro ao processar subscrição push:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar subscrição',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const DIRECTUS_URL = process.env.DIRECTUS_URL;
    const { endpoint } = await request.json();
    const token = await getServerToken();

    const searchResponse = await fetch(
      `${DIRECTUS_URL}/items/push_subscriptions?filter[endpoint][_eq]=${encodeURIComponent(endpoint)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error('Erro ao buscar subscrição');
    }

    const searchData = await searchResponse.json();
    if (!searchData.data || searchData.data.length === 0) {
      return NextResponse.json(
        { success: true, message: 'Subscrição não encontrada' },
        { status: 200 }
      );
    }

    const subscriptionId = searchData.data[0].id;
    const deleteResponse = await fetch(
      `${DIRECTUS_URL}/items/push_subscriptions/${subscriptionId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!deleteResponse.ok) {
      throw new Error('Erro ao deletar subscrição');
    }

    return NextResponse.json(
      { success: true, message: 'Subscrição removida com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao remover subscrição' },
      { status: 500 }
    );
  }
}
