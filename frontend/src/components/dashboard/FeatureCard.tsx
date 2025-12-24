import React from "react";
import { Link } from "react-router-dom";
import { LucideIcon, Wrench, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
  color: string;
  index: number;
  isDisabled?: boolean;
  isUnderMaintenance?: boolean;
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  link, 
  color, 
  index, 
  isDisabled, 
  isUnderMaintenance 
}: FeatureCardProps) {
  
  // Cores dinâmicas baseadas na prop 'color' original
  const colorVariants: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    ruby: "text-rose-500 bg-rose-500/10",
  };

  // Se estiver em manutenção, forçamos o estilo de alerta (âmbar)
  const activeColorClass = isUnderMaintenance 
    ? "text-amber-600 bg-amber-500/10 border-amber-500/20" 
    : colorVariants[color] || colorVariants.primary;

  const content = (
    <Card className={`
      group relative overflow-hidden transition-all duration-300 
      ${isDisabled ? "opacity-60 cursor-not-allowed" : "hover-lift cursor-pointer"}
      ${isUnderMaintenance ? "border-amber-500/30" : "border-border/40"}
      glass-panel
    `}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl transition-colors duration-300 ${activeColorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          
          {isUnderMaintenance && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 animate-pulse">
              <Wrench className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Manutenção</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3 className={`font-display font-bold text-lg ${isUnderMaintenance ? "text-amber-700 dark:text-amber-500" : "text-foreground"}`}>
            {title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-6 flex items-center text-sm font-medium transition-colors">
          <span className={`${isUnderMaintenance ? "text-amber-600" : "text-primary"}`}>
            {isDisabled ? "Acesso Suspenso" : "Acessar Módulo"}
          </span>
          <ChevronRight className={`ml-1 h-4 w-4 transition-transform group-hover:translate-x-1 ${isUnderMaintenance ? "text-amber-600" : "text-primary"}`} />
        </div>
      </CardContent>
      
      {/* Detalhe decorativo de fundo para manutenção */}
      {isUnderMaintenance && (
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-amber-500/5 rounded-full blur-2xl" />
      )}
    </Card>
  );

  if (isDisabled) {
    return <div className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>{content}</div>;
  }

  return (
    <Link to={link} className="block animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
      {content}
    </Link>
  );
}