import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Package, 
  ClipboardList, 
  Settings,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wrench
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/adminService";

// Componentes Extraídos
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { FeatureCard } from "@/components/dashboard/FeatureCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Configuração dos Módulos (Features)
const features = [
  {
    id: "catalog",
    icon: Package,
    title: "Catálogo Inteligente",
    description: "Consulte produtos integrados ao Protheus com filtros avançados e classificação por setores.",
    link: "/catalog",
    color: "primary",
    permission: "catalog.view_product",
  },
  {
    id: "drawings",
    icon: FileText,
    title: "Desenhos Técnicos",
    description: "Gerencie revisões, aprovações e histórico de todos os desenhos técnicos do sistema.",
    link: "/drawings",
    color: "emerald",
    permission: "drawings.view_drawing",
  },
  {
    id: "orders",
    icon: ClipboardList,
    title: "Ordens de Produção",
    description: "Acompanhe status, notas e andamento das ordens de produção em tempo real.",
    link: "/orders",
    color: "amber",
    permission: "orders.view_productionorder",
  },
  {
    id: "settings",
    icon: Settings,
    title: "Configurações",
    description: "Personalize o sistema, gerencie parâmetros e configure integrações.",
    link: "/settings",
    color: "ruby",
    permission: "admin",
  },
];

const statsData = [
  { label: "Desenhos Aprovados", value: "1,847", icon: CheckCircle, trend: "+12%", color: "success" },
  { label: "Em Revisão", value: "23", icon: Clock, trend: "-5%", color: "warning" },
  { label: "Ordens Ativas", value: "342", icon: TrendingUp, trend: "+8%", color: "primary" },
  { label: "Pendências", value: "7", icon: AlertTriangle, trend: "-2", color: "destructive" },
];

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const [pageVisibility, setPageVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    adminService.getUserPreferences()
      .then(res => {
        if (res.data?.data?.pageVisibility) {
          setPageVisibility(res.data.data.pageVisibility);
        }
      })
      .catch(() => console.log("Erro ao carregar visibilidade no Dashboard"));
  }, []);

  const modulesUnderMaintenance = Object.entries(pageVisibility)
    .filter(([key, visible]) => !visible && key !== 'dashboard')
    .map(([key]) => features.find(f => f.id === key)?.title)
    .filter(Boolean);

  return (
    <div className="h-screen flex flex-col p-6 lg:p-8 animate-fade-in overflow-hidden">
      {/* Cabeçalho e Saudação - Fixo */}
      <div className="flex-shrink-0 mb-8">
        <DashboardHeader userName={user?.firstName || "Usuário"} />
        
        {/* Alerta de Manutenção */}
        {modulesUnderMaintenance.length > 0 && (
          <Alert className="mt-6 border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-500 animate-slide-up">
            <Wrench className="h-4 w-4" />
            <AlertTitle className="font-bold">Aviso de Manutenção</AlertTitle>
            <AlertDescription className="text-sm">
              Módulos em manutenção: <strong>{modulesUnderMaintenance.join(", ")}</strong>.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* ÁREA DE CONTEÚDO COM SCROLL INTERNO */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Grid de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statsData.map((stat, index) => (
            <StatCard key={stat.label} {...stat} index={index} />
          ))}
        </div>

        {/* Seção de Módulos */}
        <div className="mb-10">
          <h2 className="text-xl font-display font-semibold text-foreground mb-4">
            Módulos do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              if (feature.permission === "admin" && !user?.isSuperuser) return null;
              if (feature.permission && feature.permission !== "admin" && !hasPermission(feature.permission)) return null;

              const isUnderMaintenance = pageVisibility[feature.id] === false;
              const isDisabledForUser = isUnderMaintenance && !user?.isSuperuser;

              return (
                <FeatureCard
                  key={feature.title}
                  {...feature}
                  index={index}
                  isDisabled={isDisabledForUser}
                  isUnderMaintenance={isUnderMaintenance}
                />
              );
            })}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="pb-8">
          <QuickActions hasPermission={hasPermission} user={user} />
        </div>
      </div>
    </div>
  );
}