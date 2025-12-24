import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { adminService } from "./services/adminService";

import DashboardLayout from "./components/layout/DashboardLayout";
import Catalog from "./pages/Catalog";
import Drawings from "./pages/Drawings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Maintenance from "./pages/Maintenance";

const queryClient = new QueryClient();

// Guardião de Manutenção - Protege o acesso direto via URL
const MaintenanceGuard = ({ children, pageId }: { children: React.ReactNode, pageId: string }) => {
  const { user } = useAuth();
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    // Timeout de segurança: Se a API não responder em 3s, libera a página para não travar o usuário
    const safetyTimer = setTimeout(() => {
      if (visible === null) setVisible(true);
    }, 3000);

    const checkStatus = async () => {
      try {
        const res = await adminService.getUserPreferences();
        const visibility = res.data?.data?.pageVisibility;
        
        // Se a página estiver marcada como false E o usuário não for Admin -> Bloqueia
        if (visibility && visibility[pageId] === false && !user?.isSuperuser) {
          setVisible(false);
        } else {
          setVisible(true);
        }
      } catch (error) {
        setVisible(true); // Libera em caso de erro na API
      }
    };

    if (user) {
      checkStatus();
    } else {
      setVisible(true);
    }

    return () => clearTimeout(safetyTimer);
  }, [pageId, user]);

  if (visible === null) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground font-medium">Validando acesso...</p>
      </div>
    );
  }
  
  if (visible === false) return <Navigate to="/maintenance" replace />;

  return <>{children}</>;
};

// Componente para proteger rotas autenticadas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para proteger rotas exclusivas de Admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user?.isSuperuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Lógica da Rota Raiz: 
          Se autenticado -> Dashboard
          Se não autenticado -> Login 
      */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Rota Pública de Login - Redireciona para dashboard se já estiver logado */}
      <Route 
        path="/login" 
        element={
          !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
        } 
      />
      
      {/* Rota de Manutenção */}
      <Route path="/maintenance" element={<Maintenance />} />

      {/* Rotas Protegidas dentro do Layout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route 
          path="/catalog" 
          element={
            <MaintenanceGuard pageId="catalog">
              <Catalog />
            </MaintenanceGuard>
          } 
        />
        
        <Route 
          path="/drawings" 
          element={
            <MaintenanceGuard pageId="drawings">
              <Drawings />
            </MaintenanceGuard>
          } 
        />

        <Route 
          path="/orders" 
          element={
            <MaintenanceGuard pageId="orders">
              <div className="p-8">Módulo de Ordens de Produção</div>
            </MaintenanceGuard>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <AdminRoute>
              <Settings />
            </AdminRoute>
          } 
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ToastProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;