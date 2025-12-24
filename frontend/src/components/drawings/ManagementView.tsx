// frontend/src/components/drawings/ManagementView.tsx
import React from "react";
import { cn } from "@/libs/utils";
import DrawingProcessCard from "./DrawingProcessCard";

interface Column {
  id: string;
  label: string;
  color: string;
}

interface ManagementViewProps {
  viewMode: "grid" | "list" | "kanban";
  columns: Column[];
  filteredData: any[];
  onCardClick: (drawing: any) => void;
}

export function ManagementView({ viewMode, columns, filteredData, onCardClick }: ManagementViewProps) {
  if (viewMode === "kanban") {
    return (
      <div className="flex gap-4 h-full overflow-x-auto pb-4 custom-scrollbar">
        {columns.map((col) => (
          <div 
            key={col.id} 
            className="flex-1 min-w-[300px] flex flex-col bg-muted/30 rounded-xl border border-border/40 overflow-hidden shadow-inner h-full"
          >
            <div className="p-3 border-b border-border/40 bg-card/60 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground truncate max-w-[150px]">
                  {col.label}
                </span>
              </div>
              <span className="text-[10px] bg-background px-2 py-0.5 rounded-full border border-border/60 font-bold">
                {filteredData.filter(d => d.status === col.id).length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {filteredData.filter(d => d.status === col.id).map((drawing) => (
                <DrawingProcessCard 
                  key={drawing.id} 
                  drawing={drawing} 
                  viewMode="grid" 
                  onClick={() => onCardClick(drawing)} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-10">
      <div className={cn(
        viewMode === "list" ? "flex flex-col gap-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      )}>
        {filteredData.map((drawing) => (
          <DrawingProcessCard 
            key={drawing.id} 
            drawing={drawing} 
            viewMode={viewMode} 
            onClick={() => onCardClick(drawing)}
          />
        ))}
      </div>
    </div>
  );
}