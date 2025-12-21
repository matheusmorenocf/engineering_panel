import React from 'react';
import { Zap, ShieldCheck, LayoutGrid, Settings2 } from 'lucide-react';
import FeatureCard from '@/components/dashboard/FeatureCard';
import InfoBanner from '@/components/dashboard/InfoBanner';

export default function DashboardPage() {
  return (
    <div className="w-full max-w-6xl flex flex-col items-center fade-in">
      
      {/* Header Central */}
      <div className="flex flex-col items-center mb-16">
        <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center shadow-sm mb-6 text-secondary font-mono text-2xl font-bold">
          <span className="opacity-40">{`>`}</span>
          <span className="animate-pulse">_</span>
        </div>
        <h1 className="text-5xl font-black text-secondary italic tracking-tighter uppercase mb-2">Master</h1>
        <div className="flex items-center gap-2 text-[11px] font-black text-text-tertiary uppercase tracking-[0.2em]">
          <span>Acesso Autorizado</span>
          <span className="text-border">•</span>
          <span>Eng.V3</span>
        </div>
        <p className="mt-6 text-center text-text-secondary max-w-2xl text-lg leading-relaxed">
          Você está no núcleo de processamento da <strong className="text-text-primary">Engenharia V3</strong>.
        </p>
      </div>

      {/* Grid de FeatureCards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
        <FeatureCard 
          icon={<Zap size={20} />} 
          title="Fluxo de Produção" 
          desc="Acesse as **Ordens de Produção** para monitorar o status em tempo real."
          borderColor="border-blue-500"
        />
        <FeatureCard 
          icon={<ShieldCheck size={20} />} 
          title="Matriz de Controle" 
          desc="Gestão de segurança granular. No módulo de **Administração**, defina privilégios."
          borderColor="border-blue-400"
        />
        <FeatureCard 
          icon={<LayoutGrid size={20} />} 
          title="Núcleo Técnico" 
          desc="Integração direta com **desenhos e especificações** técnicas."
          borderColor="border-orange-400"
        />
      </div>

      {/* Banner Modular */}
      <InfoBanner 
        icon={<Settings2 size={24} />}
        title="Instrução de Navegação"
        description="Utilize o menu lateral para transitar entre os módulos operacionais. Cada ação realizada é registrada sob sua assinatura digital."
      />
    </div>
  );
}