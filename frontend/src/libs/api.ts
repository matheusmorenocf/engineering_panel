import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // Certifique-se que o /api está aqui
  headers: {
    "Content-Type": "application/json",
  },
});

// INTERCEPTOR DE REQUISIÇÃO: Envia o token em cada chamada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Ou o nome da chave que você usa
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR DE RESPOSTA: Lida com o erro 401 (Token Expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Sessão expirada ou token inválido.");
      
      // Limpa os dados de login locais
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Redireciona para o login apenas se não estiver já na página de login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;