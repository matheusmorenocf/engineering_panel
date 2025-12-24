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
import SalesDashboard from "./pages/SalesDashboard"; // Importando o novo Dashboard
import Settings from "./pages/Settings";
import Maintenance from "./pages/Maintenance";

const queryClient = new QueryClient();

// Guardião de Manutenção
const MaintenanceGuard = ({ children, pageId }: { children: React.ReactNode, pageId: string }) => {
  const { user } = useAuth();
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (visible === null) setVisible(true);
    }, 3000);

    const checkStatus = async () => {
      try {
        const res = await adminService.getUserPreferences();
        const visibility = res.data?.data?.pageVisibility;
        if (visibility && visibility[pageId] === false && !user?.isSuperuser) {
          setVisible(false);
        } else {
          setVisible(true);
        }
      } catch (error) {
        setVisible(true);
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

  // Proteção contra fechamento acidental da aba
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAuthenticated) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Rota Raiz: Redirecionamento lógico baseado no estado de login */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } 
      />

      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
      />
      
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

        {/* Rota de Vendas (Sales Dashboard) */}
        <Route 
          path="/sales" 
          element={
            <MaintenanceGuard pageId="sales">
              <SalesDashboard />
            </MaintenanceGuard>
          } 
        />
        
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