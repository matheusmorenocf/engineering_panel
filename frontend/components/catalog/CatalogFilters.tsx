"use client";

import { Search, Settings2, Layers, Tag, Loader2 } from 'lucide-react';
import { useCatalogParams } from '@/hooks/useCatalogParams';

export const CatalogFilters = ({ filters, setFilters, onOpenManagement }: any) => {
  const { sectors, types, loading } = useCatalogParams(true); // Sempre ativo na tela principal

  const handleInputChange = (field: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleFilter = (id: number, field: 'sectors' | 'types') => {
    setFilters((prev: any) => {
      const currentList = prev[field] || [];
      const exists = currentList.includes(id);
      const newList = exists 
        ? currentList.filter((item: number) => item !== id)
        : [...currentList, id];
      return { ...prev, [field]: newList };
    });
  };

  return (
    <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'desenho', label: 'Desenho (ID)', placeholder: 'EX: PG448...' },
          { id: 'codigo', label: 'Código', placeholder: 'BUSCAR CÓDIGO...' },
          { id: 'descricao', label: 'Descrição', placeholder: 'BUSCAR DESCRIÇÃO...' },
          { id: 'cliente', label: 'Cliente', placeholder: 'FILTRAR CLIENTE...' },
        ].map((input) => (
          <div key={input.id} className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-text-tertiary uppercase tracking-widest ml-1">{input.label}</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-secondary transition-colors" size={14} />
              <input 
                type="text"
                placeholder={input.placeholder}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-10 pr-4 text-[10px] font-bold uppercase focus:border-secondary outline-none transition-all text-text-primary"
                value={(filters as any)[input.id]}
                onChange={(e) => handleInputChange(input.id, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-6 border-t border-border pt-6 justify-between">
        <div className="flex flex-col gap-4 flex-1">
          {loading && sectors.length === 0 ? (
            <div className="flex items-center gap-2 text-text-tertiary">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-[10px] uppercase font-bold">Carregando...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center flex-wrap gap-2">
                <div className="flex items-center gap-1.5 mr-2 text-text-tertiary min-w-20">
                  <Layers size={14} /><span className="text-[9px] font-black uppercase tracking-tighter">Setores:</span>
                </div>
                {sectors.map((opt) => (
                  <button key={opt.id} onClick={() => toggleFilter(opt.id, 'sectors')} className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase transition-all ${filters.sectors?.includes(opt.id) ? 'bg-secondary text-white border-secondary shadow-md' : 'bg-bg border-border text-text-tertiary hover:border-secondary'}`}>
                    {opt.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <div className="flex items-center gap-1.5 mr-2 text-text-tertiary min-w-20">
                  <Tag size={14} /><span className="text-[9px] font-black uppercase tracking-tighter">Tipos:</span>
                </div>
                {types.map((opt) => (
                  <button key={opt.id} onClick={() => toggleFilter(opt.id, 'types')} className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase transition-all ${filters.types?.includes(opt.id) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-bg border-border text-text-tertiary hover:border-blue-600'}`}>
                    {opt.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button onClick={onOpenManagement} className="shrink-0 self-start xl:self-center flex items-center gap-2 px-5 py-3 bg-secondary/5 text-secondary border border-secondary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all group">
          <Settings2 size={16} className="group-hover:rotate-90 transition-transform" />
          Gerenciar Filtros
        </button>
      </div>
    </section>
  );
};