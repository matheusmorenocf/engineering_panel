"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Loader2, Settings } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { apiFetch } from '@/lib/apiFetch';

interface Item {
  id: number;
  name: string;
}

export const ManagementModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [mode, setMode] = useState<'setor' | 'tipo'>('setor');
  const [items, setItems] = useState<Item[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = mode === 'setor' ? 'sectors' : 'types';
      
      // 1. Chamada API
      const res = await apiFetch(`/api/catalog/management/${endpoint}/?limit=100`);
      
      // 2. Extração do JSON (Necessário pois sua apiFetch retorna a Response)
      if (!res.ok) throw new Error("Erro na resposta do servidor");
      const data = await res.json();
      
      // 3. Tratamento de paginação (conforme seu print, os dados estão em .results)
      const list = Array.isArray(data) ? data : data.results || [];
      
      setItems(list);
    } catch (error) {
      console.error('Erro ao carregar lista:', error);
      addToast("Erro ao carregar lista", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!inputValue.trim()) return;
    
    try {
      const endpoint = mode === 'setor' ? 'sectors' : 'types';
      
      const res = await apiFetch(`/api/catalog/management/${endpoint}/`, {
        method: 'POST',
        body: JSON.stringify({ name: inputValue.toUpperCase() })
      });

      if (res.ok) {
        addToast(`${mode === 'setor' ? 'Setor' : 'Tipo'} criado!`, "success");
        setInputValue('');
        fetchItems();
      } else {
        addToast("Erro ao criar item", "error");
      }
    } catch (error) {
      console.error('Erro ao criar item:', error);
      addToast("Erro ao criar item", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    
    try {
      const endpoint = mode === 'setor' ? 'sectors' : 'types';
      
      const res = await apiFetch(`/api/catalog/management/${endpoint}/${id}/`, {
        method: 'DELETE',
      });

      if (res.ok || res.status === 204) {
        addToast("Item removido", "success");
        fetchItems();
      } else {
        addToast("Erro ao deletar", "error");
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      addToast("Erro ao deletar", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in">
      <div className="bg-surface border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-bg/50">
          <div className="flex items-center gap-3 text-text-primary">
             <div className="p-2 bg-secondary/10 rounded-xl">
                <Settings size={20} className="text-secondary" />
             </div>
             <div>
                <h2 className="text-lg font-black uppercase italic tracking-tighter">
                    Gestão de Parâmetros
                </h2>
                <p className="text-[9px] text-text-tertiary font-bold uppercase">
                    Configure os filtros do sistema
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors text-text-primary">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-hidden flex flex-col">
          {/* ABAS */}
          <div className="flex gap-2 p-1 bg-bg rounded-xl border border-border shrink-0">
            <button 
              onClick={() => setMode('setor')}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-lg transition-all ${mode === 'setor' ? 'bg-secondary text-white shadow-md' : 'text-text-tertiary hover:text-text-primary hover:bg-surface'}`}
            >
              Setores
            </button>
            <button 
              onClick={() => setMode('tipo')}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-lg transition-all ${mode === 'tipo' ? 'bg-secondary text-white shadow-md' : 'text-text-tertiary hover:text-text-primary hover:bg-surface'}`}
            >
              Tipos
            </button>
          </div>

          {/* INPUT */}
          <div className="flex gap-2 shrink-0">
            <input 
              type="text" 
              placeholder={`NOME DO NOVO ${mode.toUpperCase()}...`}
              className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-secondary transition-all text-text-primary"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd} disabled={!inputValue.trim()} className="p-3 bg-secondary text-white rounded-xl hover:bg-secondary-dark disabled:opacity-50 transition-colors shadow-sm">
              <Plus size={20} />
            </button>
          </div>

          {/* LISTA */}
          <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-secondary" /></div>
            ) : items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 pl-4 bg-bg/50 border border-border rounded-xl group hover:border-secondary/30 transition-all text-text-primary">
                <span className="text-[10px] font-black uppercase tracking-wide">{item.name}</span>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-text-tertiary hover:text-white hover:bg-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            
            {items.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-8 text-text-tertiary opacity-60">
                 <Settings size={24} strokeWidth={1} className="mb-2"/>
                 <p className="text-[10px] font-bold uppercase">Nenhum registro encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};