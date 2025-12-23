import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/layout/DashboardLayout";

// Importação das páginas
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Catalog from "./pages/Catalog";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rota pública de Login */}
              <Route path="/login" element={<Login />} />
              
              {/* Rota raiz/Landing page (opcional, redireciona ou mostra Index) */}
              <Route path="/" element={<Index />} />

              {/* Rotas protegidas dentro do DashboardLayout */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/catalog" element={<Catalog />} />
              </Route>

              {/* Rota 404 - Not Found */}
              <Route path="*" element={<NotFound />} />
              
              {/* Redirecionamento padrão caso não encontre nada */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;