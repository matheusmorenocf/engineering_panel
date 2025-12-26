/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const baseURL = "http://localhost:8000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const STORAGE_KEY_TOKEN = "@App:token";
const STORAGE_KEY_REFRESH = "@App:refresh";
const STORAGE_KEY_USER = "@App:user";

// Flag para evitar múltiplas tentativas simultâneas de refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Interceptor de Envio
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    // Só anexa se o token existir. Se for nulo, a requisição segue limpa (importante para triagem pública)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor de Resposta: Refresh Token + Tratamento de Rotas Públicas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH);
      
      // AJUSTE PARA ACESSO PÚBLICO: 
      // Se não houver Refresh Token e o erro for 401, significa que o usuário é um técnico sem login.
      // Retornamos o erro direto para que a página de triagem use a permissão "AllowAny" do backend.
      if (!refreshToken) {
        return Promise.reject(error);
      }

      // Se for uma tentativa de login que falhou, não fazemos refresh
      if (originalRequest.url.includes("/token/")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tenta obter um novo Access Token
        const response = await axios.post(`${baseURL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;

        localStorage.setItem(STORAGE_KEY_TOKEN, access);
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;

        processQueue(null, access);
        isRefreshing = false;

        return api(originalRequest); 
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Se o Refresh Token falhou (expirou), deslogamos
        console.warn("Sessão expirada. Redirecionando para login.");
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_REFRESH);
        localStorage.removeItem(STORAGE_KEY_USER);
        
        // Só redireciona se não for a página de triagem (que pode ser pública)
        if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/triagem")) {
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;