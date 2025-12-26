/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { adminService } from "@/services/adminService";
import { useAuth } from "@/contexts/AuthContext";

// Imports de Componentes Locais
import { DrawingStageTabs } from "@/components/drawings/DrawingsStageTabs";
// Modal para novos cadastros manuais
import { DrawingManualModal } from "@/components/drawings/DrawingManualModal";
// Modal de Detalhes/Edição que contém a Timeline, SLA e Família de Desenhos
import { DrawingFormModal } from "@/components/drawings/DrawingFormModal";
import { ManagementModule } from "@/components/drawings/ManagementModule";
import { StageStatusPlaceholder } from "@/components/drawings/StageStatusPlaceholder";

// Configuração das colunas do Kanban
export const KANBAN_COLUMNS = [
  { id: "management", label: "Gestão", color: "bg-slate-500", vKey: "drawings" },
  { id: "elaboration", label: "Elaboração", color: "bg-blue-500", vKey: "drawing_elaboration" },
  { id: "verification", label: "Verificação", color: "bg-amber-500", vKey: "drawing_verification" },
  { id: "approval", label: "Aprovação", color: "bg-emerald-500", vKey: "drawing_approval" },
];

// MOCK_DATA revisado com os campos que o Backend deve fornecer
const MOCK_DATA = Array.from({ length: 10 }, (_, i) => {
  // Simulação: o item 1 e 4 estarão em atraso (deadline no passado em relação a dez/2025)
  const isDelayedMock = i === 1 || i === 4;
  
  return {
    id: `dwg-${i}`,
    drawingCode: `PG44${i + 8}`,
    title: i % 2 === 0 ? "Eixo Principal 50mm" : "Suporte de Fixação",
    client: i % 3 === 0 ? "VALE S.A." : "USIMINAS",
    orderNumber: `ORD-${2500 + i}`,
    designer: i % 2 === 0 ? "Eng. Ricardo Silva" : "Tec. Fernanda Costa",
    checker: "Tec. Fernanda Costa",
    approver: "Ana Torres",
    status: KANBAN_COLUMNS[i % 4].id,
    
    // --- CAMPOS PARA O BACKEND IMPLEMENTAR ---
    releaseDate: "2025-12-10T08:00:00Z", // Data de liberação do Protheus/Sistema
    deadlineDate: isDelayedMock 
      ? "2025-12-15T17:00:00Z"  // Data limite já vencida
      : "2025-12-30T17:00:00Z", // Data limite futura
    familyCount: i === 0 ? 3 : 0,    // Quantidade de desenhos na mesma família
    familyCodes: i === 0 ? ["PG4408-01", "PG4408-02", "PG4408-03"] : [], // Lista de códigos filhos
    // ------------------------------------------
    
    deadline: "2025-12-30" // Campo legado para compatibilidade
  };
});

export default function Drawings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("management");
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  
  // Estados para controle dos Modais
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState<any>(null);

  // Busca as configurações de visibilidade do Admin
  useEffect(() => {
    adminService.getUserPreferences().then(res => {
      if (res.data?.data?.pageVisibility) {
        setVisibility(res.data.data.pageVisibility);
      }
    });
  }, []);

  // Função disparada ao clicar em um card no ManagementModule/ManagementView
  const handleCardClick = (drawing: any) => {
    setSelectedDrawing(drawing);
    setIsEditModalOpen(true);
  };

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="h-screen flex flex-col p-6 lg:p-8 animate-fade-in overflow-hidden"
    >
      
      {/* 1. Navegação Superior */}
      <div className="flex-shrink-0">
        <DrawingStageTabs onAddNew={() => setIsManualModalOpen(true)} />
      </div>

      {/* 2. Conteúdo Dinâmico por Aba */}
      <div className="flex-1 overflow-hidden">
        {KANBAN_COLUMNS.map((stage) => {
          const isOperational = visibility[stage.vKey] !== false;
          const isAdmin = user?.isSuperuser;

          return (
            <TabsContent 
              key={stage.id} 
              value={stage.id} 
              className="h-full m-0 focus-visible:ring-0 outline-none"
            >
              {/* Se for a aba de gestão e estiver operacional OU for Admin */}
              {stage.id === "management" && (isOperational || isAdmin) ? (
                <ManagementModule 
                  data={MOCK_DATA} 
                  onAddNew={() => setIsManualModalOpen(true)} 
                  onCardClick={handleCardClick}
                />
              ) : !isOperational && !isAdmin ? (
                /* Se não estiver operacional e NÃO for Admin, mostra Manutenção */
                <StageStatusPlaceholder 
                  title={stage.label} 
                  type="maintenance" 
                  onBack={() => setActiveTab("management")}
                />
              ) : (
                /* Caso esteja liberado/Admin mas ainda em desenvolvimento */
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

      {/* MODAL 1: Inserção Manual (Novo Registro) */}
      <DrawingManualModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
      />

      {/* MODAL 2: Gestão de Processo (Edição, Timeline, SLA, Família) */}
      <DrawingFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDrawing(null);
        }} 
        drawing={selectedDrawing}
      />
    </Tabs>
  );
}