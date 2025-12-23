import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Você pode precisar instalar o @types/node: npm install -D @types/node

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
  }
})