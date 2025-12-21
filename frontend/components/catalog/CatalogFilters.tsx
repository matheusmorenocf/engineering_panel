"use client";

import { Search, Settings2, Layers, Tag, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

// USANDO A VARIÁVEL DE AMBIENTE
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface CatalogFiltersProps {
  filters: {
    codigo: string;
    descricao: string;
    desenho: string;
    cliente: string;
    sectors: number[]; // Array de IDs
    types: number[];   // Array de IDs
  };
  setFilters: (filters: any) => void;
  onOpenManagement: () => void;
}

interface FilterOption {
  id: number;
  name: string;
}

export const CatalogFilters = ({ filters, setFilters, onOpenManagement }: CatalogFiltersProps) => {
  const [sectorsOptions, setSectorsOptions] = useState<FilterOption[]>([]);
  const [typesOptions, setTypesOptions] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // 1. Carregar opções do Backend
  useEffect(() => {
    const fetchOptions = async () => {
      if (!API_BASE_URL) {
        console.error("NEXT_PUBLIC_API_URL não definida!");
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [secRes, typRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/catalog/management/sectors/`, { headers }),
          fetch(`${API_BASE_URL}/api/catalog/management/types/`, { headers })
        ]);

        if (secRes.ok && typRes.ok) {
          setSectorsOptions(await secRes.json());
          setTypesOptions(await typRes.json());
        }
      } catch (error) {
        console.error("Erro ao carregar filtros", error);
        // Não mostramos toast de erro aqui para não poluir a tela se falhar silenciosamente
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [field]: value }));
  };

  // 2. Lógica de Toggle (Adicionar/Remover do Array)
  const toggleFilter = (id: number, field: 'sectors' | 'types') => {
    setFilters((prev: any) => {
      const currentList = prev[field] || [];
      const exists = currentList.includes(id);
      
      let newList;
      if (exists) {
        // Remove se já existe
        newList = currentList.filter((item: number) => item !== id);
      } else {
        // Adiciona se não existe
        newList = [...currentList, id];
      }
      return { ...prev, [field]: newList };
    });
  };

  return (
    <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      {/* GRID DE INPUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'desenho', label: 'Desenho (ID)', placeholder: 'EX: PG448...' },
          { id: 'codigo', label: 'Código', placeholder: 'BUSCAR CÓDIGO...' },
          { id: 'descricao', label: 'Descrição', placeholder: 'BUSCAR DESCRIÇÃO...' },
          { id: 'cliente', label: 'Cliente', placeholder: 'FILTRAR CLIENTE...' },
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

      {/* ÁREA DE FILTROS RÁPIDOS */}
      <div className="flex flex-col xl:flex-row gap-6 border-t border-border pt-6 justify-between">
        
        <div className="flex flex-col gap-4 flex-1">
          {loading ? (
            <div className="flex items-center gap-2 text-text-tertiary">
              <Loader2 className="animate-spin" size={16} />
              <span className="text-[10px] uppercase font-bold">Carregando filtros...</span>
            </div>
          ) : (
            <>
              {/* SETORES */}
              {sectorsOptions.length > 0 && (
                <div className="flex items-center flex-wrap gap-2">
                   <div className="flex items-center gap-1.5 mr-2 text-text-tertiary min-w-20">
                    <Layers size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Setores:</span>
                  </div>
                  {sectorsOptions.map((opt) => {
                    const isActive = filters.sectors?.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => toggleFilter(opt.id, 'sectors')}
                        className={`
                          px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase transition-all
                          ${isActive 
                            ? 'bg-secondary text-white border-secondary shadow-md shadow-secondary/20' 
                            : 'bg-bg border-border text-text-tertiary hover:border-secondary hover:text-secondary'}
                        `}
                      >
                        {opt.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TIPOS */}
              {typesOptions.length > 0 && (
                <div className="flex items-center flex-wrap gap-2">
                   <div className="flex items-center gap-1.5 mr-2 text-text-tertiary min-w-20">
                    <Tag size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Tipos:</span>
                  </div>
                  {typesOptions.map((opt) => {
                    const isActive = filters.types?.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => toggleFilter(opt.id, 'types')}
                        className={`
                          px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase transition-all
                          ${isActive 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' 
                            : 'bg-bg border-border text-text-tertiary hover:border-blue-600 hover:text-blue-600'}
                        `}
                      >
                        {opt.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* BOTÃO DE GESTÃO */}
        <button 
          onClick={onOpenManagement}
          className="shrink-0 self-start xl:self-center flex items-center gap-2 px-5 py-3 bg-secondary/5 text-secondary border border-secondary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all group"
        >
          <Settings2 size={16} className="group-hover:rotate-90 transition-transform" />
          Gerenciar Filtros
        </button>
      </div>
    </section>
  );
};