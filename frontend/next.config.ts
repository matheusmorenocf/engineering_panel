import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Desabilita StrictMode para evitar dupla renderização em dev
  reactStrictMode: false,

  // ✅ Variáveis de ambiente (opcional, já que usamos direto nos Route Handlers)
  env: {
    BACKEND_HOST: process.env.BACKEND_HOST || "backend",
    BACKEND_PORT: process.env.BACKEND_PORT || "8000",
  },

  // ✅ Configuração de imagens (se usar next/image com Django media)
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "backend", // ✅ Container Docker
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },

  // ✅ REMOVIDO: Headers não são necessários pois usamos Route Handlers
  // O CORS é tratado no Django

  // ✅ REMOVIDO: Rewrites não são necessários pois usamos Route Handlers
  // Os Route Handlers fazem o proxy manualmente

  // ✅ Webpack config para Hot Reload no Docker
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,           // ✅ Polling a cada 1 segundo
      aggregateTimeout: 300, // ✅ Debounce de 300ms
    };
    return config;
  },

  // ✅ Desabilita telemetria
  telemetry: {
    enabled: false,
  },

  // ✅ Output (útil para produção)
  // output: 'standalone', // Descomente para deploy otimizado
};

export default nextConfig;