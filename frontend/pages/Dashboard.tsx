import React from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Package, 
  ClipboardList, 
  Settings,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/AuthContext";

const features = [
  {
    icon: Package,
    title: "Catálogo Inteligente",
    description: "Consulte produtos integrados ao Protheus com filtros avançados e classificação por setores.",
    link: "/catalog",
    color: "primary",
    permission: "catalog.view_product",
  },
  {
    icon: FileText,
    title: "Desenhos Técnicos",
    description: "Gerencie revisões, aprovações e histórico de todos os desenhos técnicos do sistema.",
    link: "/drawings",
    color: "emerald",
    permission: "drawings.view_drawing",
  },
  {
    icon: ClipboardList,
    title: "Ordens de Produção",
    description: "Acompanhe status, notas e andamento das ordens de produção em tempo real.",
    link: "/orders",
    color: "amber",
    permission: "orders.view_productionorder",
  },
  {
    icon: Settings,
    title: "Configurações",
    description: "Personalize o sistema, gerencie parâmetros e configure integrações.",
    link: "/settings",
    color: "ruby",
    permission: null,
  },
];

const stats = [
  { label: "Desenhos Aprovados", value: "1,847", icon: CheckCircle, trend: "+12%", color: "success" },
  { label: "Em Revisão", value: "23", icon: Clock, trend: "-5%", color: "warning" },
  { label: "Ordens Ativas", value: "342", icon: TrendingUp, trend: "+8%", color: "primary" },
  { label: "Pendências", value: "7", icon: AlertTriangle, trend: "-2", color: "destructive" },
];

export default function Dashboard() {
  const { user, hasPermission } = useAuth();

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
      emerald: { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
      amber: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
      ruby: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
      success: { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
      warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
      destructive: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="min-h-screen p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Olá, {user?.firstName || "Usuário"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao Painel de Engenharia. Aqui está o resumo do seu dia.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <div
              key={stat.label}
              className="glass-panel rounded-xl p-5 hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${colors.bg}`}>
                  <stat.icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-display font-semibold text-foreground mb-4">
          Módulos do Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            const isDisabled = feature.permission && !hasPermission(feature.permission);

            return (
              <div
                key={feature.title}
                className={`
                  glass-panel rounded-xl p-6 group transition-all duration-300
                  ${isDisabled ? "opacity-60" : "hover-lift hover:border-primary/30"}
                  animate-slide-up
                `}
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border`}>
                    <feature.icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    {isDisabled ? (
                      <span className="text-xs text-muted-foreground italic">
                        Sem permissão de acesso
                      </span>
                    ) : (
                      <Link to={feature.link}>
                        <Button variant="ghost" size="sm" className="group/btn -ml-2">
                          Acessar
                          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-panel rounded-xl p-6 animate-slide-up" style={{ animationDelay: "800ms" }}>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">
          Ações Rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/catalog">
            <Button variant="default">
              <Package className="h-4 w-4" />
              Consultar Catálogo
            </Button>
          </Link>
          <Button variant="outline" disabled={!hasPermission("drawings.add_drawing")}>
            <FileText className="h-4 w-4" />
            Novo Desenho
          </Button>
          <Button variant="outline" disabled={!hasPermission("catalog.add_product")}>
            <Settings className="h-4 w-4" />
            Gerenciar Setores
          </Button>
        </div>
      </div>
    </div>
  );
}
