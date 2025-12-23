import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // '0.0.0.0' garante que o Vite aceite conexões de fora do container
    host: "0.0.0.0",
    // Fixamos a porta em 5173 para bater com o docker-compose.yml
    port: 5173,
    // Garante que o HMR (Hot Module Replacement) funcione corretamente no Docker
    watch: {
      usePolling: true,
    },
    strictPort: true,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));