import React, { useState } from "react";
import { Search, Plus, Settings2, Trash2, Maximize2, Minimize2, User, LayoutDashboard, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DrawingStats } from "./DrawingStats";
import { ManagementView } from "./ManagementView"; // Componente de visualização separado
import { FilterPopover } from "@/components/ui/filter-popover"; // Novo componente de UI
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/libs/utils";

interface Column {
  id: string;
  label: string;
  color: string;
}

interface ManagementModuleProps {
  data: any[];
  onAddNew: () => void;
  onCardClick: (drawing: any) => void;
}

export function ManagementModule({ data, onAddNew, onCardClick }: ManagementModuleProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "kanban">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState<string | null>(null);
  
  const [columns, setColumns] = useState<Column[]>([
    { id: "management", label: "Sem Atribuição", color: "bg-slate-500" },
    { id: "elaboration", label: "Em andamento", color: "bg-blue-500" },
    { id: "verification", label: "Em Verificação", color: "bg-emerald-500" },
    { id: "correction", label: "Para Correção", color: "bg-amber-500" },
    { id: "approved", label: "Aprovado", color: "bg-emerald-500" },
  ]);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatusLabel, setNewStatusLabel] = useState("");

  const designers = Array.from(new Set(data.map(d => d.designer))).filter(Boolean);

  const filteredData = data.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.drawingCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDesigner = selectedDesigner ? d.designer === selectedDesigner : true;
    return matchesSearch && matchesDesigner;
  });

  const addStatus = () => {
    if (!newStatusLabel.trim()) return;
    const id = newStatusLabel.toLowerCase().replace(/\s+/g, '-');
    setColumns([...columns, { id, label: newStatusLabel, color: "bg-purple-500" }]);
    setNewStatusLabel("");
  };

  const removeStatus = (id: string) => {
    setColumns(columns.filter(col => col.id !== id));
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 mt-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">Gestão de Desenhos</h1>
          {!isExpanded && <p className="text-muted-foreground">Monitore o andamento técnico dos projetos em tempo real.</p>}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsStatusModalOpen(true)} className="gap-2 border-primary/20 text-primary">
            <Settings2 className="h-4 w-4" /> Configurar Status
          </Button>

          <div className="flex items-center gap-2 border border-border/60 rounded-lg p-1 bg-card shadow-sm ml-2">
            <button onClick={() => setIsExpanded(!isExpanded)} className={cn("p-1.5 rounded", isExpanded ? "bg-amber-100 text-amber-700" : "hover:bg-muted text-muted-foreground")}>
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <div className="w-[1px] h-4 bg-border/60 mx-1" />
            <button onClick={() => setViewMode("kanban")} className={`p-1.5 rounded flex items-center gap-2 text-xs font-medium ${viewMode === "kanban" ? "bg-primary text-primary-foreground" : ""}`}>
              <LayoutDashboard className="h-4 w-4" /> Kanban
            </button>
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-primary text-primary-foreground" : ""}`}><Grid className="h-4 w-4" /></button>
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "bg-primary text-primary-foreground" : ""}`}><List className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {!isExpanded && <div className="mb-6 flex-shrink-0"><DrawingStats stats={{total: 125, pending: 12, stopped: 3, completed: 110}} /></div>}

      {!isExpanded && (
        <div className="glass-panel rounded-xl p-4 mb-6 flex-shrink-0 flex gap-3 shadow-sm border-border/40">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por código ou título..." className="pl-9 bg-background/50 border-border/40" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <FilterPopover 
            title="Filtrar por Desenhista"
            label="Filtros"
            options={designers}
            selectedValue={selectedDesigner}
            onSelect={setSelectedDesigner}
            icon={User}
          />

          <Button onClick={onAddNew} className="gap-2 shadow-glow font-bold">
            <Plus className="h-4 w-4" /> Novo Desenho
          </Button>
        </div>
      )}

      {/* Visualização Separada */}
      <div className="flex-1 overflow-hidden">
        <ManagementView 
          viewMode={viewMode}
          columns={columns}
          filteredData={filteredData}
          onCardClick={onCardClick}
        />
      </div>

      {/* Modal de Status */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Configurar Colunas de Status</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Novo status..." value={newStatusLabel} onChange={(e) => setNewStatusLabel(e.target.value)} />
              <Button onClick={addStatus} size="icon"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
              {columns.map((col) => (
                <div key={col.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${col.color}`} />
                    <span className="text-sm font-medium">{col.label}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeStatus(col.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter><Button onClick={() => setIsStatusModalOpen(false)}>Concluído</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}