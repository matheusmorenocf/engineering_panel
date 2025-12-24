import React from "react";
import { Wrench, Construction, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StageStatusPlaceholderProps {
  title: string;
  type: "maintenance" | "development";
  onBack?: () => void;
}

export function StageStatusPlaceholder({ title, type, onBack }: StageStatusPlaceholderProps) {
  const isMaintenance = type === "maintenance";

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-500 text-center px-4">
      <div className={`p-6 rounded-full mb-6 ${isMaintenance ? 'bg-amber-500/10' : 'bg-primary/5'}`}>
        {isMaintenance ? (
          <Wrench className="h-16 w-16 text-amber-500 animate-pulse" />
        ) : (
          <Construction className="h-16 w-16 text-primary animate-bounce" />
        )}
      </div>

      <h3 className="text-3xl font-display font-bold text-foreground">
        {isMaintenance ? "Módulo em Manutenção" : `Módulo ${title}`}
      </h3>
      
      <p className="text-muted-foreground mt-2 max-w-md text-lg">
        {isMaintenance 
          ? `O estágio de ${title} está temporariamente indisponível para ajustes técnicos.` 
          : "Estamos construindo uma experiência dedicada para este estágio do fluxo."
        }
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${
          isMaintenance ? 'bg-amber-500/5 border-amber-500/20 text-amber-600' : 'bg-primary/5 border-primary/20 text-primary'
        }`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${isMaintenance ? 'bg-amber-500' : 'bg-primary'}`} /> 
          {isMaintenance ? "Intervenção Administrativa" : "Desenvolvimento Ativo"}
        </div>
      </div>

      {onBack && (
        <Button variant="ghost" className="mt-6 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Gestão
        </Button>
      )}
    </div>
  );
}