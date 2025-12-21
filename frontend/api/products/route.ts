import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. Pegar a URL e os parâmetros da requisição original
    const { searchParams } = new URL(request.url);
    
    // 2. Pegar o Token que o navegador enviou
    const token = request.headers.get('Authorization');

    // 3. Montar a URL interna do Docker (Server-to-Server)
    // O container do Next acessa o Django via http://backend:8000
    const internalUrl = `http://backend:8000/api/catalog/products/?${searchParams.toString()}`;

    // 4. Chamar o Django
    const res = await fetch(internalUrl, {
      headers: {
        'Content-Type': 'application/json',
        // Repassa o token para o Django validar
        'Authorization': token || '',
      },
      cache: 'no-store' // Garante dados frescos
    });

    // 5. Tratar erros do Django
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Erro no Backend Django' },
        { status: res.status }
      );
    }

    // 6. Devolver os dados para o navegador
    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Erro no Route Handler:", error);
    return NextResponse.json(
      { error: "Falha na comunicação com o servidor interno" },
      { status: 502 }
    );
  }
}