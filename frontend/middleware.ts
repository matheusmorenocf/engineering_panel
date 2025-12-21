import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  // Verificamos se existe o token nos cookies (ou você pode validar no cliente)
  // Nota: Para o middleware do Next.js ler, o token precisaria estar em Cookies.
  // Se estiver usando apenas localStorage, a proteção deve ser feita no layout.tsx
  
  return NextResponse.next();
}