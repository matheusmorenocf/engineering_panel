"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

// Ajuste a URL se estiver usando Docker no Windows
const API_BASE_URL = 'http://127.0.0.1:8000';

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

  // Carregar dados ao abrir ou trocar de aba
  useEffect(() => {
    if (isOpen) fetchItems();
  }, [isOpen, mode]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const endpoint = mode === 'setor' ? 'sectors' : 'types';
      const res = await fetch(`${API_BASE_URL}/api/catalog/management/${endpoint}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setItems(await res.json());
    } catch (error) {
      addToast("Erro ao carregar lista", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!inputValue.trim()) return;
    try {
      const token = localStorage.getItem('access_token');
      const endpoint = mode === 'setor' ? 'sectors' : 'types';
      
      const res = await fetch(`${API_BASE_URL}/api/catalog/management/${endpoint}/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ name: inputValue })
      });

      if (res.ok) {
        addToast(`${mode === 'setor' ? 'Setor' : 'Tipo'} criado!`, "success");
        setInputValue('');
        fetchItems();
      } else {
        addToast("Erro ao criar item", "error");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
      const token = localStorage.getItem('access_token');
      const endpoint = mode === 'setor' ? 'sectors' : 'types';
      
      const res = await fetch(`${API_BASE_URL}/api/catalog/management/${endpoint}/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        addToast("Item removido", "success");
        fetchItems();
      }
    } catch (error) {
      addToast("Erro ao deletar", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in">
      <div className="bg-surface border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border flex justify-between items-center bg-bg/50">
          <h2 className="text-xl font-black text-text-primary uppercase italic tracking-tighter">
            Gestão de <span className="text-secondary">Parâmetros</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-hidden flex flex-col">
          {/* ABAS */}
          <div className="flex gap-4 p-1 bg-bg rounded-2xl border border-border shrink-0">
            <button 
              onClick={() => setMode('setor')}
              className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${mode === 'setor' ? 'bg-secondary text-white shadow-lg' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              Setores
            </button>
            <button 
              onClick={() => setMode('tipo')}
              className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${mode === 'tipo' ? 'bg-secondary text-white shadow-lg' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              Tipos
            </button>
          </div>

          {/* INPUT */}
          <div className="flex gap-2 shrink-0">
            <input 
              type="text" 
              placeholder={`NOVO ${mode.toUpperCase()}...`}
              className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-secondary transition-all"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button onClick={handleAdd} className="p-3 bg-secondary text-white rounded-xl hover:scale-105 transition-transform">
              <Plus size={20} />
            </button>
          </div>

          {/* LISTA (Scrollável) */}
          <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-1">
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-secondary" /></div>
            ) : items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-bg/50 border border-border rounded-xl group hover:border-secondary/30 transition-all">
                <span className="text-[10px] font-black uppercase text-text-primary">{item.name}</span>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-text-tertiary hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {items.length === 0 && !loading && (
              <p className="text-center text-[10px] text-text-tertiary italic py-4">Nenhum registro encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};