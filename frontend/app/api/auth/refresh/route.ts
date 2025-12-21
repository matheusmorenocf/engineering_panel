import { NextResponse } from "next/server";

const BACKEND_URL = "http://backend:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // Espera: { refresh: "..." }
    const response = await fetch(`${BACKEND_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error("ERRO_PROXY_REFRESH:", err);
    return NextResponse.json({ error: "Falha no refresh" }, { status: 502 });
  }
}
