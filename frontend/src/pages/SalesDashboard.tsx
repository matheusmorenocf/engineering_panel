import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download, 
  ChevronRight,
  Calendar,
  Package,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// GaugeChart ajustado para não estourar 100% visualmente
const GaugeChart = ({ value, color, size = "lg", targetLabel }: { value: number; color: string; size?: "sm" | "lg"; targetLabel?: string }) => {
  const radius = size === "lg" ? 80 : 40;
  const circumference = Math.PI * radius;
  // Visualmente o arco preenche no máximo 100%, mas o texto mostra o valor real (ex: 114%)
  const visualProgress = Math.min(value, 100); 
  const offset = circumference - (visualProgress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size === "lg" ? "220" : "110"} height={size === "lg" ? "120" : "60"} className="drop-shadow-2xl">
        <path
          d={size === "lg" ? "M 30 110 A 80 80 0 0 1 190 110" : "M 15 55 A 40 40 0 0 1 95 55"}
          fill="none"
          stroke="currentColor"
          strokeWidth={size === "lg" ? "16" : "8"}
          className="text-muted/10"
        />
        <path
          d={size === "lg" ? "M 30 110 A 80 80 0 0 1 190 110" : "M 15 55 A 40 40 0 0 1 95 55"}
          fill="none"
          stroke={color}
          strokeWidth={size === "lg" ? "18" : "10"}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        {targetLabel && <span className="text-[10px] font-bold uppercase text-muted-foreground">{targetLabel}</span>}
        <span className={cn("font-black tracking-tighter leading-none", size === "lg" ? "text-4xl" : "text-lg")} style={{ color }}>
          {value}%
        </span>
      </div>
    </div>
  );
};

export default function SalesDashboard() {
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);

  const data = {
    currentDate: "Maio 2025",
    lastMonth: "Abril 2025",
    main: {
      revenue: { total: 3496523.84, meta: 4000000.00, pct: 87, color: "#8ec641" },
      orders: { total: 4555749.00, meta: 4000000.00, pct: 114, color: "#f7941e" }
    },
    history: {
      faturamento: { total: 4155522.53, pct: 83 },
      pedidos: { total: 4472529.20, pct: 89 }
    },
    recentOrders: [
      { id: "ORD-9921", client: "VALE S.A.", value: 125400.00, time: "Há 5 min" },
      { id: "ORD-9922", client: "USIMINAS", value: 45200.50, time: "Há 12 min" },
      { id: "ORD-9923", client: "GERDAU", value: 89000.00, time: "Há 45 min" },
    ]
  };

  // Efeito de Carrossel Automático
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOrderIndex((prev) => (prev + 1) % data.recentOrders.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [data.recentOrders.length]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="h-screen flex flex-col p-6 lg:p-8 ml-2 animate-fade-in overflow-hidden bg-background">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard Comercial</h1>
          <p className="text-sm text-muted-foreground">Status em tempo real • Durit Metalduro</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-9 px-4 flex gap-2 border-border/60">
            <Calendar className="h-4 w-4 text-primary" /> {data.currentDate}
          </Badge>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-2">
            <Download className="h-4 w-4" /> Relatório
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        
        {/* Grid Superior: Mês Atual */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Card Faturamento */}
          <Card className="bg-card/40 border-border/40 p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Total Faturado</span>
                <h2 className="text-5xl lg:text-6xl font-black tracking-tight">{formatCurrency(data.main.revenue.total)}</h2>
              </div>
              <div className="flex items-center gap-10">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Meta Faturamento</span>
                  <p className="text-xl font-bold opacity-80">{formatCurrency(data.main.revenue.meta)}</p>
                </div>
                <GaugeChart value={data.main.revenue.pct} color={data.main.revenue.color} />
              </div>
            </div>
          </Card>

          {/* Card Pedidos */}
          <Card className="bg-card/40 border-border/40 p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Total Pedido</span>
                <h2 className="text-5xl lg:text-6xl font-black tracking-tight">{formatCurrency(data.main.orders.total)}</h2>
              </div>
              <div className="flex items-center gap-10">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Meta Pedidos</span>
                  <p className="text-xl font-bold opacity-80">{formatCurrency(data.main.orders.meta)}</p>
                </div>
                <GaugeChart value={data.main.orders.pct} color={data.main.orders.color} />
              </div>
            </div>
          </Card>
        </div>

        {/* Card Meio: Comparativo Mês Anterior (Full Width) */}
        <Card className="w-full bg-muted/20 border-border/40 p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-1">
              <Badge variant="secondary" className="bg-primary/10 text-primary mb-2">Histórico Consolidado</Badge>
              <h3 className="text-3xl font-black uppercase text-foreground/60">{data.lastMonth}</h3>
            </div>

            <div className="flex flex-1 justify-around items-center max-w-4xl">
              <div className="flex items-center gap-6 group">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Realizado Faturamento</span>
                  <span className="font-bold text-2xl">{formatCurrency(data.history.faturamento.total)}</span>
                </div>
                <GaugeChart value={data.history.faturamento.pct} color="#8ec641" size="sm" />
              </div>

              <div className="flex items-center gap-6 group">
                <GaugeChart value={data.history.pedidos.pct} color="#f7941e" size="sm" />
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Realizado Pedidos</span>
                  <span className="font-bold text-2xl">{formatCurrency(data.history.pedidos.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Card Inferior: Carrossel de Pedidos Recentes */}
        <Card className="w-full bg-card/60 border-primary/20 p-8 rounded-[2rem] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-primary">
              <Package className="h-6 w-6" />
              <h3 className="font-bold text-xl uppercase tracking-widest">Últimos Pedidos Abertos</h3>
            </div>
            <div className="flex gap-1">
              {data.recentOrders.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all", 
                    currentOrderIndex === i ? "bg-primary w-4" : "bg-muted"
                  )} 
                />
              ))}
            </div>
          </div>

          <div className="relative h-24 overflow-hidden">
            {data.recentOrders.map((order, index) => (
              <div
                key={order.id}
                className={cn(
                  "absolute inset-0 flex items-center justify-between transition-all duration-700 transform px-4",
                  index === currentOrderIndex ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                )}
              >
                <div className="flex items-center gap-6">
                  <div className="bg-primary/10 p-4 rounded-2xl">
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">{order.id}</p>
                    <h4 className="text-2xl font-black text-foreground">{order.client}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-primary">{formatCurrency(order.value)}</p>
                  <span className="text-xs text-muted-foreground font-medium">{order.time}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/40 flex justify-end">
             <Button variant="ghost" size="sm" className="gap-2 text-xs font-bold">
               Ver todos os pedidos <ChevronRight className="h-3 w-3" />
             </Button>
          </div>
        </Card>
      </div>

      {/* Branding */}
      <div className="mt-6 opacity-20 flex flex-col items-center">
         <span className="text-2xl font-black tracking-[0.3em]">DURIT</span>
         <span className="text-[8px] font-bold tracking-[0.5em] uppercase">Smart Sales Monitoring</span>
      </div>
    </div>
  );
}