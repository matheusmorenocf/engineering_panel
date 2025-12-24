import React, { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { adminService } from "@/services/adminService";
import { useAuth } from "@/contexts/AuthContext";

// Imports de Componentes Locais
import { DrawingStageTabs } from "@/components/drawings/DrawingsStageTabs";
import { DrawingFormModal } from "@/components/drawings/DrawingFormModal";
import { ManagementModule } from "@/components/drawings/ManagementModule";
import { StageStatusPlaceholder } from "@/components/drawings/StageStatusPlaceholder";

// Configuração centralizada para facilitar manutenção futura
export const KANBAN_COLUMNS = [
  { id: "management", label: "Gestão", color: "bg-slate-500", vKey: "drawings" },
  { id: "elaboration", label: "Elaboração", color: "bg-blue-500", vKey: "drawing_elaboration" },
  { id: "verification", label: "Verificação", color: "bg-amber-500", vKey: "drawing_verification" },
  { id: "approval", label: "Aprovação", color: "bg-emerald-500", vKey: "drawing_approval" },
];

const MOCK_DATA = Array.from({ length: 10 }, (_, i) => ({
  id: `dwg-${i}`,
  drawingCode: `PG44${i + 8}`,
  title: i % 2 === 0 ? "Eixo Principal 50mm" : "Suporte de Fixação",
  client: i % 3 === 0 ? "VALE S.A." : "USIMINAS",
  orderNumber: `ORD-${2500 + i}`,
  designer: "Eng. Ricardo Silva",
  checker: "Tec. Fernanda Costa",
  approver: "Ana Torres",
  status: KANBAN_COLUMNS[i % 4].id,
  deadline: "2025-12-30"
}));

export default function Drawings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("management");
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Busca as configurações de visibilidade do Admin
  useEffect(() => {
    adminService.getUserPreferences().then(res => {
      if (res.data?.data?.pageVisibility) {
        setVisibility(res.data.data.pageVisibility);
      }
    });
  }, []);

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="h-screen flex flex-col p-6 lg:p-8 animate-fade-in overflow-hidden"
    >
      
      {/* 1. Navegação Superior (Nível de App) */}
      <div className="flex-shrink-0">
        <DrawingStageTabs onAddNew={() => setIsFormOpen(true)} />
      </div>

      {/* 2. Conteúdo Dinâmico por Aba */}
      <div className="flex-1 overflow-hidden">
        {KANBAN_COLUMNS.map((stage) => {
          // Lógica de Visibilidade: 
          // false no banco = Manutenção (Bloqueio)
          // undefined no código (se for aba nova) = Desenvolvimento
          const isOperational = visibility[stage.vKey] !== false;
          const isAdmin = user?.isSuperuser;

          return (
            <TabsContent 
              key={stage.id} 
              value={stage.id} 
              className="h-full m-0 focus-visible:ring-0 outline-none"
            >
              {/* Se for a aba de Gestão e estiver operacional */}
              {stage.id === "management" && isOperational ? (
                <ManagementModule 
                  data={MOCK_DATA} 
                  onAddNew={() => setIsFormOpen(true)} 
                />
              ) : !isOperational && !isAdmin ? (
                /* Caso esteja bloqueado pelo Admin e não seja Admin */
                <StageStatusPlaceholder 
                  title={stage.label} 
                  type="maintenance" 
                  onBack={() => setActiveTab("management")}
                />
              ) : (
                /* Caso esteja liberado mas ainda não tenha o módulo pronto */
                <StageStatusPlaceholder 
                  title={stage.label} 
                  type="development" 
                  onBack={() => setActiveTab("management")}
                />
              )}
            </TabsContent>
          );
        })}
      </div>

      {/* 3. Modal Global de Cadastro */}
      <DrawingFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </Tabs>
  );
}