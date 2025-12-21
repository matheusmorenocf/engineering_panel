import { NextResponse } from 'next/server';

const backendHost = process.env.BACKEND_HOST || 'backend';
const backendPort = process.env.BACKEND_PORT || '8000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('Authorization');
    
    const internalUrl = `http://${backendHost}:${backendPort}/api/catalog/management/drawings?${searchParams.toString()}`;
    
    console.log('[DRAWINGS] GET:', internalUrl);

    const res = await fetch(internalUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[DRAWINGS] Error:', errorText);
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[DRAWINGS] Connection error:', error);
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization');
    const body = await request.json();
    
    const internalUrl = `http://${backendHost}:${backendPort}/api/catalog/management/drawings`;
    
    console.log('[DRAWINGS] POST:', internalUrl, body);

    const res = await fetch(internalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[DRAWINGS] Error:', errorText);
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[DRAWINGS] Connection error:', error);
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}