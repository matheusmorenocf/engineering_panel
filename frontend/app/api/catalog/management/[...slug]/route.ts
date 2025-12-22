import { NextResponse } from "next/server";

const backendHost = process.env.BACKEND_HOST || "backend";
const backendPort = process.env.BACKEND_PORT || "8000";

type Params = { slug: string[] };
type Ctx = { params: Promise<Params> | Params };

async function proxy(request: Request, context: Ctx) {
  try {
    const method = request.method;

    const token =
      request.headers.get("authorization") ||
      request.headers.get("Authorization") ||
      "";

    const { searchParams } = new URL(request.url);

    // ✅ Next (versões novas): params pode ser Promise
    const resolvedParams = await Promise.resolve(context.params);
    const slug = resolvedParams?.slug;
    const pathParts = Array.isArray(slug) ? slug : [];

    if (pathParts.length === 0) {
      return NextResponse.json(
        { error: "Rota inválida. Use /api/catalog/management/<endpoint> (ex: types, sectors)." },
        { status: 400 }
      );
    }

    const path = pathParts.join("/");
    const queryString = searchParams.toString();

    const internalUrl = `http://${backendHost}:${backendPort}/api/catalog/management/${path}/${
      queryString ? `?${queryString}` : ""
    }`;

    let body: any = undefined;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      body = await request.json().catch(() => undefined);
    }

    const res = await fetch(internalUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    if (res.status === 204) return new NextResponse(null, { status: 204 });

    const contentType = res.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro no backend", status: res.status, details: payload },
        { status: res.status }
      );
    }

    return NextResponse.json(payload, { status: res.status });
  } catch (err: any) {
    console.error("[MGMT PROXY] ERROR:", err);
    return NextResponse.json(
      { error: "Erro no proxy", details: String(err?.message || err) },
      { status: 502 }
    );
  }
}

export async function GET(request: Request, context: Ctx) {
  return proxy(request, context);
}
export async function POST(request: Request, context: Ctx) {
  return proxy(request, context);
}
export async function PUT(request: Request, context: Ctx) {
  return proxy(request, context);
}
export async function PATCH(request: Request, context: Ctx) {
  return proxy(request, context);
}
export async function DELETE(request: Request, context: Ctx) {
  return proxy(request, context);
}
