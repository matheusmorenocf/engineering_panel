import { NextResponse } from 'next/server';

const backendHost = process.env.BACKEND_HOST || 'backend';
const backendPort = process.env.BACKEND_PORT || '8000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('Authorization');

    const internalUrl = `http://${backendHost}:${backendPort}/api/catalog/products/?${searchParams.toString()}`;

    const res = await fetch(internalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
      },
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json().catch(() => ({}))
      : await res.text().catch(() => '');

    if (!res.ok) {
      return NextResponse.json(
        typeof data === 'string' ? { error: data } : data,
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[CATALOG_PRODUCTS] Connection error:', error);
    return NextResponse.json({ error: error.message || 'Erro de conexão interna' }, { status: 502 });
  }
}
