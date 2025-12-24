import { Settings } from "lucide-react";
import { cn } from "@/libs/utils";

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

export function SidebarHeader({ isCollapsed }: SidebarHeaderProps) {
  return (
    <div className={cn("p-4 border-b border-sidebar-border", isCollapsed && "flex justify-center")}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg gradient-brand flex-shrink-0">
          <Settings className="h-5 w-5 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <div className="animate-fade-in">
            <h1 className="font-bold text-sidebar-foreground">IndusSuite</h1>
            <p className="text-[10px] text-sidebar-foreground/60 font-mono tracking-widest uppercase">V3.0</p>
          </div>
        )}
      </div>
    </div>
  );
}