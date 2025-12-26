/* eslint-disable @typescript-eslint/no-explicit-any */
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
import SalesDashboard from "./pages/SalesDashboard";
import Settings from "./pages/Settings";
import Maintenance from "./pages/Maintenance";
import PhysicalControl from "./pages/PhysicalControl";
import { ProcessingQueuePage } from "./pages/ProcessingQueuePage"; // Import novo

const queryClient = new QueryClient();

const MaintenanceGuard = ({ children, pageId }: { children: React.ReactNode, pageId: string }) => {
  const { user } = useAuth();
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (visible === null) setVisible(true);
    }, 3000);

    const checkStatus = async () => {
      try {
        if (user?.isSuperuser) {
          setVisible(true);
          return;
        }
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

    if (user) checkStatus();
    else setVisible(true);
    
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user?.isSuperuser) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

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

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/maintenance" element={<Maintenance />} />

      {/* ROTA PÚBLICA DE TRIAGEM (Acessível via Link com ID) */}
      <Route path="/triagem/:id" element={<ProcessingQueuePage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales" element={<MaintenanceGuard pageId="sales"><SalesDashboard /></MaintenanceGuard>} />
        <Route path="/catalog" element={<MaintenanceGuard pageId="catalog"><Catalog /></MaintenanceGuard>} />
        <Route path="/drawings" element={<MaintenanceGuard pageId="drawings"><Drawings /></MaintenanceGuard>} />
        <Route path="/physical-control" element={<MaintenanceGuard pageId="physical"><PhysicalControl /></MaintenanceGuard>} />
        
        {/* Fila Geral de Triagem Protegida */}
        <Route path="/triagem" element={<ProcessingQueuePage />} />

        <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
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