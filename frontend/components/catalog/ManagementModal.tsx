"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Loader2, Settings } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { apiFetch } from '@/lib/apiFetch';

interface Item {
  id: number;
  name: string;
}

const CACHE_EXPIRATION = 60 * 60 * 1000;

export const ManagementModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [mode, setMode] = useState<'setor' | 'tipo'>('setor');
  
  // ✅ MELHORIA: Estados separados para evitar o "branco" ao trocar de aba
  const [sectors, setSectors] = useState<Item[]>([]);
  const [types, setTypes] = useState<Item[]>([]);
  
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Determina quais itens exibir com base no modo atual
  const currentItems = mode === 'setor' ? sectors : types;

  useEffect(() => {
    if (isOpen) {
      // Carrega ambos inicialmente para garantir rapidez na troca
      loadInitialData();
    }
  }, [isOpen]);

  // Se o usuário trocar de aba e ela estiver vazia, força um fetch
  useEffect(() => {
    if (isOpen && currentItems.length === 0) {
      fetchItems(mode);
    }
  }, [mode]);

  const loadInitialData = () => {
    const cachedSectors = getCachedData('setor');
    const cachedTypes = getCachedData('tipo');

    if (cachedSectors) setSectors(cachedSectors);
    if (cachedTypes) setTypes(cachedTypes);

    // Busca atualizações em background
    fetchItems('setor', true);
    fetchItems('tipo', true);
  };

  const getCachedData = (key: string): Item[] | null => {
    const cached = localStorage.getItem(`cache_management_${key}`);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRATION) return null;
    return data;
  };

  const fetchItems = async (targetMode: 'setor' | 'tipo', isBackground = false) => {
    if (!isBackground && ((targetMode === 'setor' ? sectors : types).length === 0)) {
      setLoading(true);
    }
    
    try {
      const endpoint = targetMode === 'setor' ? 'sectors' : 'types';
      const res = await apiFetch(`/api/catalog/management/${endpoint}/?limit=100`);
      
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.results || []);
      
      if (targetMode === 'setor') setSectors(list);
      else setTypes(list);
      
      const cacheValue = { data: list, timestamp: Date.now() };
      localStorage.setItem(`cache_management_${targetMode}`, JSON.stringify(cacheValue));
    } catch (error) {
      if (!isBackground) addToast("Erro ao sincronizar", "error");
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
        fetchItems(mode); 
      }
    } catch (error) { addToast("Erro ao criar", "error"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir item?")) return;
    try {
      const endpoint = mode === 'setor' ? 'sectors' : 'types';
      const res = await apiFetch(`/api/catalog/management/${endpoint}/${id}/`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        addToast("Removido", "success");
        fetchItems(mode);
      }
    } catch (error) { addToast("Erro ao deletar", "error"); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in">
      <div className="bg-surface border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border flex justify-between items-center bg-bg/50">
          <div className="flex items-center gap-3 text-text-primary">
             <div className="p-2 bg-secondary/10 rounded-xl">
                <Settings size={20} className="text-secondary" />
             </div>
             <div>
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Gestão</h2>
                <p className="text-[9px] text-text-tertiary font-bold uppercase tracking-tight">Parâmetros do Catálogo</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-full text-text-primary"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-hidden flex flex-col">
          {/* ABAS - Agora a troca aqui é instantânea */}
          <div className="flex gap-2 p-1 bg-bg rounded-xl border border-border shrink-0">
            <button 
              onClick={() => setMode('setor')} 
              className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${mode === 'setor' ? 'bg-secondary text-white shadow-md' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              Setores
            </button>
            <button 
              onClick={() => setMode('tipo')} 
              className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${mode === 'tipo' ? 'bg-secondary text-white shadow-md' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              Tipos
            </button>
          </div>

          <div className="flex gap-2 shrink-0">
            <input 
              type="text" 
              placeholder={`NOVO ${mode === 'setor' ? 'SETOR' : 'TIPO'}...`} 
              className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-secondary text-text-primary" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd} disabled={!inputValue.trim()} className="p-3 bg-secondary text-white rounded-xl hover:bg-secondary-dark disabled:opacity-50 shadow-sm">
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
            {loading && currentItems.length === 0 ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-secondary" /></div>
            ) : (
              currentItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 pl-4 bg-bg/50 border border-border rounded-xl group hover:border-secondary/30 transition-all text-text-primary">
                  <span className="text-[10px] font-black uppercase">{item.name}</span>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-text-tertiary hover:text-white hover:bg-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
            
            {!loading && currentItems.length === 0 && (
              <div className="text-center py-10 opacity-20 italic text-[10px] uppercase font-black">Vazio</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};