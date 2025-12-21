import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // CONEXÃO DOCKER: O container 'frontend' chama o 'backend' pelo nome do serviço
    const response = await fetch('http://backend:8000/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("ERRO_PROXY_TOKEN:", error);
    return NextResponse.json(
      { detail: "O Frontend não conseguiu alcançar o container Backend. Verifique se o serviço 'backend' está rodando na porta 8000." }, 
      { status: 502 }
    );
  }
}