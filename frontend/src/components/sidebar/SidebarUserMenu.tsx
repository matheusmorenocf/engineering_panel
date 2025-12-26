import { LogOut, Palette, Sun, Moon, Monitor, Layout } from "lucide-react";
import { cn } from "@/libs/utils";
import { ColorTheme, ColorMode } from "@/contexts/ThemeContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SidebarUserMenuProps {
  user: any;
  isCollapsed: boolean;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  colorTheme: ColorTheme;
  colorMode: ColorMode;
  designStyle: string;
  themeColors: any[];
  setColorTheme: (t: ColorTheme) => void;
  setColorMode: (m: ColorMode) => void;
  updatePreferences: (prefs: any) => void;
  handleLogout: () => void;
  getInitials: (f: string, l: string) => string;
}

export function SidebarUserMenu({
  user, isCollapsed, showUserMenu, setShowUserMenu,
  colorTheme, colorMode, designStyle, themeColors,
  setColorTheme, setColorMode, updatePreferences, handleLogout, getInitials
}: SidebarUserMenuProps) {
  return (
    <div className="p-3 border-t border-sidebar-border relative">
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className={cn(
          "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors",
          isCollapsed && "justify-center"
        )}
      >
        <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center font-bold text-white shadow-sm">
          {user ? getInitials(user.firstName, user.lastName) : "U"}
        </div>
        {!isCollapsed && user && (
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-bold truncate leading-tight text-sidebar-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[10px] text-sidebar-foreground/60 uppercase font-mono truncate">
              {user.isSuperuser ? "Admin" : (user.groups?.[0] || "Usuário")}
            </p>
          </div>
        )}
      </button>

      {showUserMenu && (
        <div className={cn(
          "absolute bottom-full mb-2 bg-sidebar rounded-2xl shadow-2xl border sidebar-border overflow-hidden p-4 space-y-4 z-50 animate-in fade-in slide-in-from-bottom-2",
          isCollapsed ? "left-16 w-60" : "left-3 right-3"
        )}>
          {/* Seção de Cores */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Palette className="h-3 w-3" /> Cores
            </p>
            <div className="flex justify-between gap-1">
              {themeColors.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setColorTheme(t.id)}
                  className={cn(
                    "w-7 h-7 rounded-full border border-border/50 transition-transform hover:scale-110 flex-shrink-0",
                    t.class,
                    colorTheme === t.id && "ring-2 ring-offset-2 ring-primary"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Seção de Design */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Layout className="h-3 w-3" /> Design
            </p>
            <div className="grid grid-cols-2 gap-1">
              {["default", "industrial"].map((s) => (
                <button
                  key={s}
                  onClick={() => updatePreferences({ designStyle: s })}
                  className={cn(
                    "py-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-colors",
                    designStyle === s ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  <Monitor className="h-4 w-4" />{s === "default" ? "Padrão" : "Industrial"}
                </button>
              ))}
            </div>
          </div>

          {/* Seção de Interface */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Sun className="h-3 w-3" /> Interface
            </p>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'light', icon: Sun, label: 'Claro' },
                { id: 'dark', icon: Moon, label: 'Escuro' },
                { id: 'system', icon: Monitor, label: 'Auto' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setColorMode(m.id as ColorMode)}
                  className={cn(
                    "p-2 rounded-lg flex flex-col items-center gap-1 transition-colors",
                    colorMode === m.id ? "bg-muted text-foreground" : "hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  <m.icon className="h-4 w-4" />
                  <span className="text-[9px]">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Modal de Confirmação de Logout */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-200 border border-transparent hover:border-red-100 dark:hover:border-red-900/50">
                <LogOut className="h-3.5 w-3.5" /> Sair
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deseja realmente sair?</AlertDialogTitle>
                <AlertDialogDescription>
                  Sua sessão será encerrada e você precisará fazer login novamente para acessar o painel.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirmar Saída
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}