import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, FileText, ClipboardList, Settings,
  ChevronLeft, ChevronRight, LogOut, Palette, Sun, Moon,
  Monitor, Check, Wrench, TrendingUp, Layout
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, ColorTheme, ColorMode } from "@/contexts/ThemeContext";
import { useToastContext } from "@/contexts/ToastContext";
import { adminService } from "@/services/adminService";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const navCategories = [
  {
    label: "Monitoramento",
    items: [
      { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", permission: null },
      { id: "sales", icon: TrendingUp, label: "Vendas & Metas", path: "/sales", permission: null },
    ],
  },
  {
    label: "Engenharia",
    items: [
      { id: "drawings", icon: FileText, label: "Desenhos", path: "/drawings", permission: "drawings.view_drawing" },
      { id: "catalog", icon: Package, label: "Catálogo", path: "/catalog", permission: "catalog.view_product" },
    ],
  },
  {
    label: "Operacional",
    items: [
      { id: "orders", icon: ClipboardList, label: "Ordens", path: "/orders", permission: "orders.view_productionorder" },
    ],
  },
  {
    label: "Admin",
    items: [
      { id: "settings", icon: Settings, label: "Ajustes", path: "/settings", permission: "admin" },
    ],
  },
];

const colorThemes: { id: ColorTheme; label: string; color: string }[] = [
  { id: "default", label: "Azul", color: "bg-blue-500" },
  { id: "emerald", label: "Esmeralda", color: "bg-emerald-500" },
  { id: "amber", label: "Âmbar", color: "bg-amber-500" },
  { id: "ruby", label: "Rubi", color: "bg-rose-500" },
  { id: "amethyst", label: "Ametista", color: "bg-violet-500" },
];

const designStyles = [
  { id: "default", label: "Padrão", icon: LayoutDashboard },
  { id: "industrial", label: "Industrial", icon: Layout },
];

const colorModes: { id: ColorMode; label: string; icon: React.ComponentType<any> }[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
  { id: "system", label: "Sistema", icon: Monitor },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [designStyle, setDesignStyle] = useState("default");
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({});
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const { colorTheme, colorMode, setColorTheme, setColorMode } = useTheme();
  const { addToast } = useToastContext();

  useEffect(() => {
    document.body.setAttribute("data-design", designStyle);
  }, [designStyle]);

  useEffect(() => {
    adminService.getUserPreferences()
      .then(res => {
        const data = res.data?.data || res.data;
        if (data?.pageVisibility) setPageVisibility(data.pageVisibility);
      })
      .catch(() => console.log("Erro ao carregar visibilidade"));
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    addToast("Logout realizado com sucesso", "info");
    navigate("/login");
  };

  const getInitials = (f = "", l = "") => (f.charAt(0) + l.charAt(0)).toUpperCase() || "U";

  return (
    <div className={cn(
      "h-screen flex flex-col border-r transition-all duration-300 relative z-40 bg-sidebar border-sidebar-border",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn("p-4 border-b border-sidebar-border", isCollapsed && "flex justify-center")}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg gradient-brand flex-shrink-0">
            <Settings className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display font-bold text-sidebar-foreground leading-none">Engenharia</h1>
              <p className="text-[10px] text-sidebar-foreground/40 font-mono tracking-widest uppercase mt-1">V3.0</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-6 overflow-y-auto custom-scrollbar">
        {navCategories.map((category) => {
          const visibleItems = category.items.filter(item => {
            if (item.permission === "admin" && !user?.isSuperuser) return false;
            if (item.permission && !hasPermission(item.permission)) return false;
            return true;
          });
          if (visibleItems.length === 0) return null;
          return (
            <div key={category.label} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[9px] font-black uppercase tracking-[0.3em] text-sidebar-foreground/30 mb-2">{category.label}</p>
              )}
              {visibleItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive ? "menu-item-active" : "text-sidebar-foreground/60 hover:bg-sidebar-accent",
                    isCollapsed && "justify-center"
                  )}>
                    <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "group-hover:scale-110 transition-transform")} />
                    {!isCollapsed && <span className={cn("text-sm", isActive ? "font-bold" : "font-medium")}>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border relative">
        <button onClick={() => setShowUserMenu(!showUserMenu)} className={cn("w-full flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-sidebar-accent text-sidebar-foreground", isCollapsed && "justify-center")}>
          <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0 font-bold text-white leading-none">
            {user ? getInitials(user.firstName, user.lastName) : "U"}
          </div>
          {!isCollapsed && user && (
            <div className="flex-1 text-left animate-fade-in overflow-hidden">
              <p className="text-sm font-bold truncate leading-tight">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-sidebar-foreground/40 truncate uppercase font-mono tracking-tighter">IndusSuite User</p>
            </div>
          )}
        </button>

        {showUserMenu && (
          <div className={cn("absolute bottom-full mb-2 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-in z-50", isCollapsed ? "left-16 w-60" : "left-3 right-3")}>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Palette className="h-3 w-3" /> Acento de Cor</p>
                <div className="flex justify-between">
                  {colorThemes.map((theme) => (
                    <button key={theme.id} onClick={() => setColorTheme(theme.id)} className={cn("w-7 h-7 rounded-full transition-all hover:scale-110", theme.color, colorTheme === theme.id && "ring-2 ring-offset-2 ring-foreground")} />
                  ))}
                </div>
              </div>
              <div className="space-y-2 p-2 bg-muted/30 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Layout className="h-3 w-3" /> Framework Visual</p>
                <div className="grid grid-cols-2 gap-1">
                  {designStyles.map((style) => (
                    <button key={style.id} onClick={() => setDesignStyle(style.id)} className={cn("flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-bold transition-all gap-1", designStyle === style.id ? "bg-primary text-primary-foreground shadow-glow" : "hover:bg-muted text-muted-foreground")}>
                      <style.icon className="h-4 w-4" />{style.label}
                    </button>
                  ))}
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-destructive hover:bg-destructive/5 rounded-xl transition-all" onClick={handleLogout}><LogOut className="h-3.5 w-3.5" /> Sair</button>
            </div>
          </div>
        )}
      </div>

      <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-20 p-1.5 rounded-full bg-card border border-border shadow-md hover:bg-muted transition-all z-50 group">
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );
}