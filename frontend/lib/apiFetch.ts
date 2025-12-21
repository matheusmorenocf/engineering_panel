type ApiFetchOptions = RequestInit & {
  retryOn401?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

function logoutHard() {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {}
  window.location.href = "/login";
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;

  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return null;

  const data = (await res.json().catch(() => null)) as any;
  const newAccess = data?.access;

  if (typeof newAccess !== "string" || !newAccess) return null;

  localStorage.setItem("access_token", newAccess);
  return newAccess;
}

/**
 * apiFetch: faz fetch com Bearer token e renova automaticamente em 401.
 * - Funciona no CLIENT (usa localStorage).
 * - Reexecuta a request 1x após refresh bem sucedido.
 */
export async function apiFetch(input: RequestInfo | URL, init: ApiFetchOptions = {}) {
  const retryOn401 = init.retryOn401 ?? true;

  const access = localStorage.getItem("access_token");
  const headers = new Headers(init.headers || {});
  if (access) headers.set("Authorization", `Bearer ${access}`);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");

  const doRequest = (token?: string | null) => {
    const h = new Headers(headers);
    if (token) h.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers: h });
  };

  let res = await doRequest(access ? access : null);

  // Se não é 401, acabou
  if (res.status !== 401 || !retryOn401) return res;

  // 401: tenta refresh com lock (uma vez só para várias requests)
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  const newAccess = await refreshPromise;

  // Se refresh falhou → logout
  if (!newAccess) {
    logoutHard();
    // retorna a resposta original (não deve chegar aqui normalmente por causa do redirect)
    return res;
  }

  // repete 1x com o novo token
  res = await doRequest(newAccess);
  if (res.status === 401) {
    // token ainda inválido → logout
    logoutHard();
  }

  return res;
}
