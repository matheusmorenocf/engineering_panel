import React, { useState } from "react";
import { Grid, List, Search, Filter, LayoutDashboard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DrawingStats } from "./DrawingStats";
import DrawingProcessCard from "./DrawingProcessCard";
import { KANBAN_COLUMNS } from "@/pages/Drawings"; // Importando a definição global

interface ManagementModuleProps {
  data: any[];
  onAddNew: () => void;
}

export function ManagementModule({ data, onAddNew }: ManagementModuleProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "kanban">("kanban");
  const [searchTerm, setSearchTerm] = useState("");

  const stats = { total: 125, pending: 12, stopped: 3, completed: 110 };

  const filteredData = data.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.drawingCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderGridOrList = () => (
    <div className={viewMode === "list" ? "flex flex-col gap-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
      {filteredData.map((drawing) => (
        <DrawingProcessCard 
          key={drawing.id} 
          drawing={drawing} 
          viewMode={viewMode === "kanban" ? "grid" : viewMode} 
          onClick={() => {}} 
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header Local do Módulo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 mt-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">Gestão de Desenhos</h1>
          <p className="text-muted-foreground">Monitore o andamento técnico dos projetos em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-2 border border-border/60 rounded-lg p-1 bg-card shadow-sm">
          <button 
            onClick={() => setViewMode("kanban")} 
            className={`p-1.5 rounded flex items-center gap-2 text-xs font-medium transition-all ${viewMode === "kanban" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
          >
            <LayoutDashboard className="h-4 w-4" /> Kanban
          </button>
          <div className="w-[1px] h-4 bg-border/60 mx-1" />
          <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}><Grid className="h-4 w-4" /></button>
          <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}><List className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="mb-6 flex-shrink-0">
        <DrawingStats stats={stats} />
      </div>

      <div className="glass-panel rounded-xl p-4 mb-6 flex-shrink-0 flex gap-3 shadow-sm border-border/40">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por código ou título..." 
            className="pl-9 bg-background/50 border-border/40" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <Button variant="outline" className="gap-2 border-border/60 hover:bg-muted"><Filter className="h-4 w-4" /> Filtros</Button>
        <Button onClick={onAddNew} className="gap-2 shadow-glow font-bold">
          <Plus className="h-4 w-4" /> Novo Desenho
        </Button>
      </div>

      {/* Área de Visualização */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "kanban" ? (
          <div className="flex gap-4 h-full overflow-x-auto pb-4 custom-scrollbar">
            {KANBAN_COLUMNS.map((col) => (
              <div key={col.id} className="flex-shrink-0 w-80 flex flex-col bg-muted/30 rounded-xl border border-border/40 overflow-hidden shadow-inner">
                <div className="p-3 border-b border-border/40 bg-card/60 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.color} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                    <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">{col.label}</span>
                  </div>
                  <span className="text-[10px] bg-background px-2 py-0.5 rounded-full border border-border/60 font-bold">
                    {filteredData.filter(d => d.status === col.id).length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {filteredData.filter(d => d.status === col.id).map((drawing) => (
                    <DrawingProcessCard key={drawing.id} drawing={drawing} viewMode="grid" onClick={() => {}} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-10">
            {renderGridOrList()}
          </div>
        )}
      </div>
    </div>
  );
}