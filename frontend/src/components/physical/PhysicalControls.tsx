/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search, RefreshCw, Settings, LayoutGrid, Columns, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";

interface PhysicalControlsProps {
  search: string;
  setSearch: (val: string) => void;
  viewMode: "grouped" | "kanban" | "map";
  setViewMode: (val: "grouped" | "kanban" | "map") => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenLocationMgr: () => void;
  showAdminActions: boolean;
}

export function PhysicalControls({
  search,
  setSearch,
  viewMode,
  setViewMode,
  isRefreshing,
  onRefresh,
  onOpenLocationMgr,
  showAdminActions,
}: PhysicalControlsProps) {
  return (
    <div className="flex gap-4 items-center bg-card p-4 rounded-xl border shadow-sm shrink-0">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por Produto, Cliente, NF ou ID..."
          className="pl-10 h-11 bg-background"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className={cn("h-11 w-11", isRefreshing && "animate-spin")} 
          onClick={onRefresh}
        >
          <RefreshCw className="h-5 w-5" />
        </Button>

        {showAdminActions && (
          <Button 
            variant="outline" 
            size="icon" 
            className="h-11 w-11 border-primary/20 text-primary" 
            onClick={onOpenLocationMgr}
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}

        <div className="flex bg-muted p-1 rounded-lg border ml-2">
          <Button
            variant={viewMode === "grouped" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grouped")}
            title="Agrupado por NF"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "kanban" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            title="Fluxo Kanban"
          >
            <Columns className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "map" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("map")}
            title="Mapa Físico"
          >
            <Building2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}