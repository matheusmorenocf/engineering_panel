import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react";
import { useTheme, type ColorMode, type ColorTheme } from "../../contexts/ThemeContext";
import { useToastContext } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";


const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", permission: null },
  { icon: Package, label: "Catálogo", path: "/catalog", permission: "catalog.view_product" },
  { icon: FileText, label: "Desenhos", path: "/drawings", permission: "drawings.view_drawing" },
  { icon: ClipboardList, label: "Ordens", path: "/orders", permission: "orders.view_productionorder" },
  { icon: Settings, label: "Configurações", path: "/settings", permission: null },
];

const colorThemes: { id: ColorTheme; label: string; color: string }[] = [
  { id: "default", label: "Azul", color: "bg-blue-500" },
  { id: "emerald", label: "Esmeralda", color: "bg-emerald-500" },
  { id: "amber", label: "Âmbar", color: "bg-amber-500" },
  { id: "ruby", label: "Rubi", color: "bg-rose-500" },
  { id: "amethyst", label: "Ametista", color: "bg-violet-500" },
];

const colorModes: { id: ColorMode; label: string; icon: React.ComponentType<any> }[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
  { id: "system", label: "Sistema", icon: Monitor },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const { colorTheme, colorMode, setColorTheme, setColorMode } = useTheme();
  const { addToast } = useToastContext();

  const handleLogout = () => {
    logout();
    addToast("Logout realizado com sucesso", "info");
    navigate("/login");
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div
      className={`
        h-screen bg-sidebar flex flex-col border-r border-sidebar-border
        transition-all duration-300 relative
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Header */}
      <div className={`p-4 border-b border-sidebar-border ${isCollapsed ? "flex justify-center" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg gradient-brand flex-shrink-0">
            <Settings className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display font-bold text-sidebar-foreground">Engenharia</h1>
              <p className="text-xs text-sidebar-foreground/60">V3.0</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isDisabled = item.permission && !hasPermission(item.permission);

          return (
            <Link
              key={item.path}
              to={isDisabled ? "#" : item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : isDisabled
                    ? "text-sidebar-foreground/30 cursor-not-allowed"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }
                ${isCollapsed ? "justify-center" : ""}
              `}
              onClick={(e) => isDisabled && e.preventDefault()}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
              {!isCollapsed && (
                <span className="font-medium animate-fade-in">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="p-3 border-t border-sidebar-border relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`
            w-full flex items-center gap-3 p-2 rounded-lg transition-all
            hover:bg-sidebar-accent text-sidebar-foreground
            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary-foreground">
              {user ? getInitials(user.firstName, user.lastName) : "U"}
            </span>
          </div>
          {!isCollapsed && user && (
            <div className="flex-1 text-left animate-fade-in">
              <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user.groups.join(", ")}
              </p>
            </div>
          )}
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <div className={`
            absolute bottom-full mb-2 bg-card rounded-xl shadow-lg border border-border overflow-hidden
            animate-scale-in z-50
            ${isCollapsed ? "left-16 w-56" : "left-3 right-3"}
          `}>
            {/* Theme Section */}
            <div className="p-3 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Palette className="h-3 w-3" /> Tema de Cor
              </p>
              <div className="flex gap-2">
                {colorThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setColorTheme(theme.id)}
                    className={`
                      w-7 h-7 rounded-full ${theme.color} flex items-center justify-center
                      transition-all hover:scale-110
                      ${colorTheme === theme.id ? "ring-2 ring-offset-2 ring-offset-card ring-foreground" : ""}
                    `}
                    title={theme.label}
                  >
                    {colorTheme === theme.id && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Section */}
            <div className="p-3 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Modo</p>
              <div className="flex gap-1">
                {colorModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setColorMode(mode.id)}
                    className={`
                      flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium
                      transition-all
                      ${colorMode === mode.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground"
                      }
                    `}
                  >
                    <mode.icon className="h-3.5 w-3.5" />
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 p-1.5 rounded-full bg-card border border-border shadow-md hover:bg-muted transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
