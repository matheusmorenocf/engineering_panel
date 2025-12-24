import { Link, useLocation } from "react-router-dom";
import { cn } from "@/libs/utils";
import { Wrench } from "lucide-react";

interface NavItem {
  id: string;
  icon: any;
  label: string;
  path: string;
  permission: string | null;
}

interface NavCategory {
  label: string;
  items: NavItem[];
}

interface SidebarNavigationProps {
  categories: NavCategory[];
  isCollapsed: boolean;
  hasPermission: (permission: string) => boolean;
  pageVisibility?: Record<string, boolean>;
}

export function SidebarNavigation({ 
  categories, 
  isCollapsed, 
  hasPermission,
  pageVisibility 
}: SidebarNavigationProps) {
  const location = useLocation();

  return (
    <nav className="flex-1 p-3 space-y-6 overflow-y-auto custom-scrollbar">
      {categories.map((category) => {
        const authorizedItems = category.items.filter(
          (item) => !item.permission || hasPermission(item.permission)
        );

        if (authorizedItems.length === 0) return null;

        return (
          <div key={category.label} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[9px] font-black uppercase tracking-[0.3em] text-sidebar-foreground/40 mb-2">
                {category.label}
              </p>
            )}
            {authorizedItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isUnderMaintenance = pageVisibility && pageVisibility[item.id] === false;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive
                      ? "menu-item-active shadow-sm"
                      : isUnderMaintenance
                        ? "text-amber-600 dark:text-amber-500 hover:bg-amber-500/10"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    isCollapsed && "justify-center"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                  )}

                  {/* Ícone Original (Sempre Visível) */}
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform duration-200 flex-shrink-0", 
                    isActive ? "text-primary scale-110" : isUnderMaintenance ? "text-amber-600/70" : "group-hover:scale-110"
                  )} />
                  
                  {!isCollapsed && (
                    <>
                      <span className={cn(
                        "text-sm transition-colors flex-1", 
                        isActive ? "font-bold text-primary" : "font-medium",
                        isUnderMaintenance && "text-amber-700 dark:text-amber-400 font-bold"
                      )}>
                        {item.label}
                      </span>

                      {/* Ícone de Manutenção à Direita */}
                      {isUnderMaintenance && (
                        <Wrench className="h-3 w-3 text-amber-500/60 animate-pulse ml-auto" />
                      )}
                    </>
                  )}

                  {/* No modo colapsado, o ícone de manutenção fica em cima do ícone original como um badge pequeno */}
                  {isCollapsed && isUnderMaintenance && (
                    <div className="absolute top-1 right-1 bg-background rounded-full p-0.5 shadow-sm">
                       <Wrench className="h-2 w-2 text-amber-500" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}