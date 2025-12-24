import React from "react";
import { Link } from "react-router-dom";
import { Hammer, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Maintenance() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
      <div className="p-6 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-6">
        <Hammer className="h-16 w-16 text-amber-600 dark:text-amber-500 animate-bounce" />
      </div>
      <h1 className="text-4xl font-display font-bold text-foreground mb-2">Módulo em Manutenção</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Este recurso foi temporariamente suspenso pela administração para atualizações ou ajustes técnicos. 
        Por favor, tente novamente mais tarde.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline" className="gap-2">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Início
          </Link>
        </Button>
        <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg border border-amber-200">
          <ShieldAlert className="h-4 w-4" /> Acesso restrito a administradores
        </div>
      </div>
    </div>
  );
}