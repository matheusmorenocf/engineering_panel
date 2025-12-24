import React, { useState, useEffect } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Database, Wrench } from "lucide-react";
import { adminService } from "@/services/adminService";

interface DrawingStageTabsProps {
  onAddNew: () => void;
}

export function DrawingStageTabs({ onAddNew }: DrawingStageTabsProps) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    adminService.getUserPreferences().then(res => {
      if (res.data?.data?.pageVisibility) {
        setVisibility(res.data.data.pageVisibility);
      }
    });
  }, []);

  const stages = [
    { id: "management", label: "Gestão", visibilityKey: "drawings" },
    { id: "elaboration", label: "Elaboração", visibilityKey: "drawing_elaboration" },
    { id: "verification", label: "Verificação", visibilityKey: "drawing_verification" },
    { id: "approval", label: "Aprovação", visibilityKey: "drawing_approval" },
  ];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 flex-shrink-0">
      <TabsList className="grid w-full md:w-auto grid-cols-2 lg:grid-cols-4 font-semibold p-1 bg-muted/50 border border-border/40">
        {stages.map((stage) => {
          const isUnderMaintenance = visibility[stage.visibilityKey] === false;
          
          return (
            <TabsTrigger 
              key={stage.id} 
              value={stage.id}
              className={`flex items-center gap-2 transition-all duration-300 ${
                isUnderMaintenance 
                  ? "text-amber-600 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-700" 
                  : ""
              }`}
            >
              {isUnderMaintenance && <Wrench className="h-3 w-3 animate-pulse" />}
              {stage.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="hidden md:flex gap-1 py-1 px-3 text-muted-foreground border-dashed bg-background">
          <Database className="h-3 w-3" /> Sincronizado com Protheus
        </Badge>
        <Button onClick={onAddNew} className="gap-2 shadow-sm font-bold">
          <Plus className="h-4 w-4" /> Novo Desenho
        </Button>
      </div>
    </div>
  );
}