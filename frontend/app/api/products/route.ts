import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('Authorization');

    // Comunicação Interna: Next.js -> Docker Backend
    const internalUrl = `http://backend:8000/api/catalog/products/?${searchParams.toString()}`;

    const res = await fetch(internalUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      cache: 'no-store'
    });

    if (!res.ok) {
        return NextResponse.json({ error: 'Erro no Django' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Erro Proxy:", error);
    return NextResponse.json({ error: "Falha na comunicação interna" }, { status: 502 });
  }
}