// frontend/src/libs/api.ts
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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor de Resposta: A "mágica" do Refresh acontece aqui
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de login ou um retry
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes("/token/")) {
      
      if (isRefreshing) {
        // Se já houver um refresh em curso, coloca a requisição na fila
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

      const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH);

      if (refreshToken) {
        try {
          // Tenta obter um novo Access Token
          const response = await axios.post(`${baseURL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;

          // Atualiza o storage e o cabeçalho da requisição atual
          localStorage.setItem(STORAGE_KEY_TOKEN, access);
          api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
          originalRequest.headers.Authorization = `Bearer ${access}`;

          processQueue(null, access);
          isRefreshing = false;

          return api(originalRequest); // Refaz a requisição original que falhou
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;

          // Se o Refresh Token também expirou, aí sim deslogamos
          console.warn("Refresh token expirado. Redirecionando para login.");
          localStorage.removeItem(STORAGE_KEY_TOKEN);
          localStorage.removeItem(STORAGE_KEY_REFRESH);
          localStorage.removeItem(STORAGE_KEY_USER);
          
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;