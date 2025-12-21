import { NextResponse } from 'next/server';

const backendHost = process.env.BACKEND_HOST || 'backend';
const backendPort = process.env.BACKEND_PORT || '8000';

async function proxyRequest(request: Request, method: string) {
  try {
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('Authorization');
    
    let body = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.json();
      } catch (e) {
        console.warn('[PRODUCTS] No body or invalid JSON');
      }
    }
    
    const queryString = searchParams.toString();
    const internalUrl = `http://${backendHost}:${backendPort}/api/catalog/management/products${queryString ? `?${queryString}` : ''}`;
    
    console.log(`[PRODUCTS ${method}]:`, internalUrl, body || '');

    const res = await fetch(internalUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[PRODUCTS ${method}] Error:`, errorText);
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error(`[PRODUCTS ${method}] Connection error:`, error);
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}

export async function GET(request: Request) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: Request) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: Request) {
  return proxyRequest(request, 'PUT');
}

export async function DELETE(request: Request) {
  return proxyRequest(request, 'DELETE');
}