"use client";

import { Search, Plus, Settings2, Trash2, Edit3 } from 'lucide-react';
import { useState } from 'react';

interface CatalogFiltersProps {
  filters: {
    codigo: string;
    descricao: string;
    desenho: string;
    cliente: string;
  };
  setFilters: (filters: any) => void;
  onOpenManagement: () => void;
}

export const CatalogFilters = ({ filters, setFilters, onOpenManagement }: CatalogFiltersProps) => {
  const handleInputChange = (field: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {/* GRID DE 4 CAMPOS DE TEXTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'desenho', label: 'Desenho (ID)', placeholder: 'EX: PG448...' },
          { id: 'codigo', label: 'Código (Protheus)', placeholder: 'BUSCAR NOS CÓDIGOS...' },
          { id: 'descricao', label: 'Descrição', placeholder: 'BUSCAR NAS DESCRIÇÕES...' },
          { id: 'cliente', label: 'Cliente', placeholder: 'FILTRAR POR CLIENTE...' },
        ].map((input) => (
          <div key={input.id} className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-text-tertiary uppercase tracking-widest ml-1">
              {input.label}
            </label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-secondary transition-colors" size={14} />
              <input 
                type="text"
                placeholder={input.placeholder}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-10 pr-4 text-[10px] font-bold uppercase focus:border-secondary outline-none transition-all"
                value={(filters as any)[input.id]}
                onChange={(e) => handleInputChange(input.id, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* FILTROS RÁPIDOS E GESTÃO */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-black text-text-tertiary uppercase mr-2 tracking-tighter">Filtros Rápidos:</span>
          {['Engenharia', 'Produção', 'Usinagem', 'Padrão'].map((tag) => (
            <button key={tag} className="px-4 py-1.5 rounded-full border border-border text-[9px] font-black uppercase hover:bg-secondary hover:text-white transition-all cursor-pointer">
              {tag}
            </button>
          ))}
        </div>

        {/* BOTÃO PARA ABRIR GESTÃO DE SETOR/TIPO */}
        <button 
          onClick={onOpenManagement}
          className="flex items-center gap-2 px-5 py-2.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all group"
        >
          <Settings2 size={14} className="group-hover:rotate-90 transition-transform" />
          Gerenciar Setores / Tipos
        </button>
      </div>
    </section>
  );
};