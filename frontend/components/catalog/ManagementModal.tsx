"use client";

import { useState } from 'react';
import { Plus, Trash2, X, Loader2, Settings } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { apiFetch } from '@/lib/apiFetch';
import { useCatalogParams } from '@/hooks/useCatalogParams';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export const ManagementModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [mode, setMode] = useState<'setor' | 'tipo'>('setor');
  const [inputValue, setInputValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  const { addToast } = useToast();
  const { sectors, types, loading, refresh } = useCatalogParams(isOpen);
  
  const currentItems = mode === 'setor' ? sectors : types;

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
        refresh();
      } else {
        addToast("Erro ao salvar no banco", "error");
      }
    } catch (error) { 
      addToast("Erro de conexão", "error"); 
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      const endpoint = mode === 'setor' ? 'sectors' : 'types';
      const res = await apiFetch(`/api/catalog/management/${endpoint}/${itemToDelete}/`, { 
        method: 'DELETE' 
      });
      
      if (res.ok) {
        addToast("Item removido com sucesso", "success");
        refresh();
      } else {
        addToast("Erro ao remover item", "error");
      }
    } catch (error) {
      addToast("Erro de conexão", "error");
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-surface border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-border flex justify-between items-center bg-bg/50">
            <div className="flex items-center gap-3 text-text-primary">
               <div className="p-2 bg-secondary/10 rounded-xl"><Settings size={20} className="text-secondary" /></div>
               <div>
                  <h2 className="text-lg font-black uppercase italic tracking-tighter">Gestão</h2>
                  <p className="text-[9px] text-text-tertiary font-bold uppercase tracking-tight">Parâmetros do Catálogo</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-bg rounded-full text-text-primary"><X size={20} /></button>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-hidden flex flex-col">
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
                placeholder={`NOVO ${mode.toUpperCase()}...`} 
                className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-secondary text-text-primary shadow-inner" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <button 
                onClick={handleAdd} 
                disabled={!inputValue.trim()} 
                className="p-3 bg-secondary text-white rounded-xl hover:bg-secondary-dark disabled:opacity-50 transition-colors shadow-sm"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
              {loading && currentItems.length === 0 ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-secondary" /></div>
              ) : currentItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 pl-4 bg-bg/50 border border-border rounded-xl group hover:border-secondary/30 transition-all text-text-primary">
                  <span className="text-[10px] font-black uppercase tracking-wide">{item.name}</span>
                  <button 
                    onClick={() => setItemToDelete(item.id)} 
                    className="p-2 text-text-tertiary hover:text-white hover:bg-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              
              {!loading && currentItems.length === 0 && (
                <div className="text-center py-10 opacity-20 italic text-[10px] uppercase font-black">Vazio</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja remover este ${mode === 'setor' ? 'setor' : 'tipo'}? Esta ação pode afetar produtos já classificados.`}
        variant="danger"
        confirmText="Excluir"
        isLoading={isDeleting}
      />
    </>
  );
};