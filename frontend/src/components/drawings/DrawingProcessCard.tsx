import React from "react";
import { User, ShieldCheck, Briefcase, ChevronRight, FileSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DrawingProcess {
  id: string;
  drawingCode: string;
  title: string;
  client: string;
  orderNumber: string;
  designer: string;
  checker: string;
  approver: string;
  status: string;
}

interface DrawingProcessCardProps {
  drawing: DrawingProcess;
  viewMode: "grid" | "list";
  onClick: () => void;
}

export default function DrawingProcessCard({ drawing, viewMode, onClick }: DrawingProcessCardProps) {
  if (viewMode === "list") {
    return (
      <div
        onClick={onClick}
        className="glass-panel rounded-lg p-4 flex items-center gap-6 cursor-pointer border hover:border-primary/50 bg-card/50 transition-all group"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono font-bold text-primary text-sm">{drawing.drawingCode}</span>
            <Badge variant="outline" className="text-[10px] font-normal">
              <Briefcase className="h-3 w-3 mr-1" /> {drawing.client}
            </Badge>
          </div>
          <h4 className="font-semibold text-foreground truncate">{drawing.title}</h4>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-xs">
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Desenhista</span>
            <span className="font-medium">{drawing.designer}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground flex items-center gap-1"><FileSearch className="h-3 w-3" /> Verificador</span>
            <span className="font-medium">{drawing.checker || "---"}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="glass-panel rounded-xl border bg-card/50 p-5 cursor-pointer hover:border-primary/50 transition-all"
    >
      <div className="flex justify-between mb-4">
        <span className="font-mono font-bold text-primary text-xs bg-primary/5 px-2 py-1 rounded">{drawing.drawingCode}</span>
        <Badge variant="secondary" className="text-[10px]">{drawing.orderNumber}</Badge>
      </div>
      <h4 className="font-bold text-sm mb-1">{drawing.title}</h4>
      <p className="text-xs text-muted-foreground mb-4">{drawing.client}</p>
      <div className="space-y-2 pt-3 border-t text-[11px]">
        <div className="flex justify-between"><span>Desenhista:</span><span className="font-medium">{drawing.designer}</span></div>
        <div className="flex justify-between"><span>Verificador:</span><span className="font-medium">{drawing.checker || "---"}</span></div>
      </div>
    </div>
  );
}