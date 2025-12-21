import { NextResponse } from 'next/server';

// Esta função serve para GET, POST e DELETE de Setores, Tipos e Produtos
async function proxyRequest(request: Request, { params }: { params: { slug: string[] } }) {
  const path = params.slug.join('/'); // Ex: 'sectors' ou 'types'
  const { searchParams } = new URL(request.url);
  const token = request.headers.get('Authorization');
  const method = request.method;

  // Se não for GET, precisa ler o corpo (body) para enviar ao Django
  const body = method !== 'GET' ? await request.json() : undefined;

  const internalUrl = `http://backend:8000/api/catalog/management/${path}/?${searchParams.toString()}`;

  try {
    const res = await fetch(internalUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) return new NextResponse(null, { status: 204 }); // Sucesso sem conteúdo (Delete)
    
    if (!res.ok) {
        return NextResponse.json({ error: 'Erro API' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: 'Erro de conexão interna' }, { status: 502 });
  }
}

// Exporta a mesma função para todos os métodos
export { proxyRequest as GET, proxyRequest as POST, proxyRequest as DELETE, proxyRequest as PUT };