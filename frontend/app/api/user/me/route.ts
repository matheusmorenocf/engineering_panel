import { NextResponse } from "next/server";

const BACKEND_URL = "http://backend:8000";

function getToken(request: Request) {
  return request.headers.get("authorization") || request.headers.get("Authorization");
}

export async function GET(request: Request) {
  try {
    const token = getToken(request);

    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/user/me/`, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("ERRO_PROXY_USER_ME_GET:", error);
    return NextResponse.json({ error: "Falha na comunicação interna" }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  try {
    const token = getToken(request);

    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    const response = await fetch(`${BACKEND_URL}/api/preferences/me/`, {
      method: "PATCH",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("ERRO_PROXY_USER_ME_PATCH:", error);
    return NextResponse.json({ error: "Falha na comunicação interna" }, { status: 502 });
  }
}
