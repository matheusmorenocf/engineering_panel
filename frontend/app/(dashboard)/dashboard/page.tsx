"use client";

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import FeatureCard from '@/components/dashboard/FeatureCard';
import { Database, Settings, Lock } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, hasPermission } = useAuth();

  if (loading) return (
    <div className="p-10 flex items-center justify-center">
      <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary animate-pulse">
        Verificando credenciais...
      </p>
    </div>
  );

  return (
    /* Ajuste de Layout: 
       - w-full para ocupar todo o espaço disponível
       - max-w-[1920px] para telas ultra-wide
       - p-6 lg:p-10 para igualar ao espaçamento do Catálogo
    */
    <div className="w-full max-w-[1920px] flex flex-col gap-8 fade-in p-6 lg:p-10">
      
      <header className="flex flex-col gap-1">
        <h1 className="text-4xl font-black text-text-primary uppercase italic tracking-tighter">
          Painel de <span className="text-secondary">Controle</span>
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          <p className="text-text-tertiary text-[10px] font-black uppercase tracking-[0.2em]">
            Bem-vindo, {user?.username || 'Operador'}
          </p>
        </div>
      </header>

      {/* Grid de Cards - Ajustado para responsividade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        <FeatureCard 
          icon={<Database size={24} />} 
          title="Base de Dados" 
          description="Visualização técnica de materiais e registros SB1010." 
          href="/catalog" // Ajustado para o catálogo que criamos
        />

        {/* Só mostra o card de Sistema se for Admin ou tiver permissão específica */}
        {hasPermission('admin_access') ? (
          <FeatureCard 
            icon={<Settings size={24} />} 
            title="Configurações" 
            description="Administração global do sistema e parâmetros." 
            href="/settings" 
          />
        ) : (
          <div className="p-8 bg-surface/50 border border-dashed border-border rounded-2xl opacity-60 flex flex-col gap-4 grayscale">
             <Lock className="text-text-tertiary" size={24} />
             <div className="flex flex-col gap-1">
                <h3 className="text-[11px] font-black uppercase text-text-tertiary tracking-widest italic">Acesso Restrito</h3>
                <p className="text-[10px] font-bold text-text-tertiary uppercase leading-tight">Contate o administrador para obter permissões de edição.</p>
             </div>
          </div>
        )}
      </div>

      {/* Seção de Ações Rápidas */}
      <div className="mt-4 p-8 bg-surface border border-border rounded-2xl shadow-sm">
        <h2 className="text-[12px] font-black text-text-primary uppercase italic mb-6 tracking-widest border-b border-border pb-4">
          Ações Rápidas
        </h2>
        
        <div className="flex flex-wrap gap-4">
          <button 
            disabled={!hasPermission('core.change_desenho')}
            className="px-8 py-3 bg-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-secondary/20"
          >
            {hasPermission('core.change_desenho') ? "Salvar Alterações" : "Apenas Visualização"}
          </button>
          
          <button className="px-8 py-3 bg-bg border border-border text-text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-surface transition-all">
            Gerar Relatório
          </button>
        </div>
      </div>
    </div>
  );
}