import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, FileText, Settings } from "lucide-react";

interface QuickActionsProps {
  hasPermission: (permission: string) => boolean;
}

export function QuickActions({ hasPermission }: QuickActionsProps) {
  return (
    <div className="glass-panel rounded-xl p-6 animate-slide-up" style={{ animationDelay: "800ms" }}>
      <h2 className="text-lg font-display font-semibold text-foreground mb-4">
        Ações Rápidas
      </h2>
      <div className="flex flex-wrap gap-3">
        {/* Só mostra se puder ver o catálogo */}
        {hasPermission("catalog.view_product") && (
          <Link to="/catalog">
            <Button variant="default">
              <Package className="h-4 w-4 mr-2" />
              Consultar Catálogo
            </Button>
          </Link>
        )}
        
        {/* Só mostra se puder adicionar desenhos */}
        {hasPermission("drawings.add_drawing") && (
          <Link to="/drawings">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Novo Desenho
            </Button>
          </Link>
        )}
        
        {/* Só mostra se puder gerenciar o catálogo/setores */}
        {hasPermission("catalog.add_product") && (
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Setores
          </Button>
        )}
      </div>
    </div>
  );
}