import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, LayoutDashboard, TrendingUp, FileText, Package, ClipboardList, Settings, Box } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToastContext } from "@/contexts/ToastContext";
import { cn } from "@/libs/utils";
import { adminService } from "@/services/adminService"; // Importado para buscar visibilidade global
import { SidebarHeader } from "../sidebar/SidebarHeader";
import { SidebarNavigation } from "../sidebar/SidebarNavigation";
import { SidebarUserMenu } from "../sidebar/SidebarUserMenu";

const navCategories = [
  {
    label: "Monitoramento",
    items: [
      { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", permission: null },
      { id: "sales", icon: TrendingUp, label: "Vendas", path: "/sales", permission: null },
    ],
  },
  {
    label: "Engenharia",
    items: [
      { id: "orders", icon: ClipboardList, label: "Ordens", path: "/orders", permission: "orders.view_productionorder" },
      { id: "drawings", icon: FileText, label: "Desenhos", path: "/drawings", permission: "drawings.view_drawing" },
      { id: "catalog", icon: Package, label: "Catálogo", path: "/catalog", permission: "catalog.view_product" },
    ],
  },
  {
    label: "Operacional",
    items: [
      { id: "physical", icon: Box, label: "Controle Físico", path: "/physical-control", permission: null },
    ],
  },
  {
    label: "Admin",
    items: [
      { id: "settings", icon: Settings, label: "Ajustes", path: "/settings", permission: "admin" },
    ],
  },
];

const themeColors = [
  { id: "default", class: "bg-blue-500" },
  { id: "emerald", class: "bg-emerald-500" },
  { id: "amber", class: "bg-amber-500" },
  { id: "ruby", class: "bg-rose-500" },
  { id: "amethyst", class: "bg-violet-500" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [globalVisibility, setGlobalVisibility] = useState<Record<string, boolean>>({}); // Estado para visibilidade global
  const navigate = useNavigate();
  const { user, logout, hasPermission, updatePreferences } = useAuth();
  const { colorTheme, colorMode, setColorTheme, setColorMode } = useTheme();
  const { addToast } = useToastContext();

  const designStyle = user?.preferences?.designStyle || "default";

  // Busca as configurações de visibilidade para todos os usuários
  useEffect(() => {
    adminService.getUserPreferences()
      .then(res => {
        const visibility = res.data?.data?.pageVisibility || res.data?.pageVisibility;
        if (visibility) {
          setGlobalVisibility(visibility);
        }
      })
      .catch(() => console.log("Erro ao carregar visibilidade na Sidebar"));
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-design", designStyle);
  }, [designStyle]);

  const handleLogout = () => {
    logout();
    addToast("Logout realizado com sucesso", "info");
    navigate("/login");
  };

  const getInitials = (f = "", l = "") => (f.charAt(0) + (l?.charAt(0) || "")).toUpperCase() || "U";

  return (
    <div className={cn(
      "h-screen flex flex-col border-r transition-all duration-300 relative z-40 bg-sidebar border-sidebar-border",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <SidebarHeader isCollapsed={isCollapsed} />
      
      <SidebarNavigation 
        categories={navCategories} 
        isCollapsed={isCollapsed} 
        hasPermission={hasPermission}
        pageVisibility={globalVisibility} // Usa o estado global buscado do serviço
      />

      <SidebarUserMenu 
        user={user}
        isCollapsed={isCollapsed}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        colorTheme={colorTheme}
        colorMode={colorMode}
        designStyle={designStyle}
        themeColors={themeColors}
        setColorTheme={setColorTheme}
        setColorMode={setColorMode}
        updatePreferences={updatePreferences}
        handleLogout={handleLogout}
        getInitials={getInitials}
      />

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="absolute -right-3 top-20 p-1.5 rounded-full bg-background border border-border shadow-md z-50 hover:bg-accent transition-colors"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );
}