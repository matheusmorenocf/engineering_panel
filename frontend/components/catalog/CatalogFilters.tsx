"use client";

import { Search, Settings2, Layers, Tag, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { apiFetch } from '@/lib/apiFetch';

interface CatalogFiltersProps {
  filters: {
    codigo: string;
    descricao: string;
    desenho: string;
    cliente: string;
    sectors: number[];
    types: number[];
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

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        console.log('[FILTERS] Fetching sectors and types...');

        const [secRes, typRes] = await Promise.all([
          apiFetch("/api/catalog/management/sectors"),
          apiFetch("/api/catalog/management/types"),
        ]);

        if (secRes.ok && typRes.ok) {
          const secData = await secRes.json();
          const typData = await typRes.json();

          const sectors = Array.isArray(secData) ? secData : secData?.results || [];
          const types = Array.isArray(typData) ? typData : typData?.results || [];

          setSectorsOptions(sectors);
          setTypesOptions(types);
        }

        console.log('[FILTERS] Response status:', { 
          sectors: secRes.status, 
          types: typRes.status 
        });

        if (secRes.ok && typRes.ok) {
          const sectors = await secRes.json();
          const types = await typRes.json();
          
          setSectorsOptions(sectors);
          setTypesOptions(types);
          
          console.log('[FILTERS] Loaded:', { 
            sectors: sectors.length, 
            types: types.length 
          });
        } else {
          // ✅ CORREÇÃO: Tratamento de erro mais robusto
          const secError = !secRes.ok ? await secRes.text().catch(() => 'Erro desconhecido') : null;
          const typError = !typRes.ok ? await typRes.text().catch(() => 'Erro desconhecido') : null;
          
          console.error('[FILTERS] Error loading filters:', { 
            sectorsStatus: secRes.status,
            typesStatus: typRes.status,
            sectorsError: secError,
            typesError: typError
          });
          
          addToast('Erro ao carregar filtros', 'warning');
        }
      } catch (error) {
        console.error("[FILTERS] Fatal error:", error);
        addToast('Erro de conexão ao carregar filtros', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOptions();
  }, [addToast]);

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
              
              {/* Mensagem se não houver filtros cadastrados */}
              {!loading && sectorsOptions.length === 0 && typesOptions.length === 0 && (
                <div className="text-center py-4 text-text-tertiary text-xs">
                  <p className="font-bold uppercase">Nenhum filtro cadastrado</p>
                  <p className="mt-1">Clique em &quot;Gerenciar Filtros&quot; para adicionar</p>
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