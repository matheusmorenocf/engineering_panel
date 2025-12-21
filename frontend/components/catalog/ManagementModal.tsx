"use client";

import { useState } from 'react';
import { Plus, Trash2, Edit3, X } from 'lucide-react';

export const ManagementModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [mode, setMode] = useState<'setor' | 'tipo'>('setor');
  const [inputValue, setInputValue] = useState('');
  
  // Exemplo de lista vinda do banco (você carregará da sua API)
  const [items, setItems] = useState([
    { id: 1, name: 'Engenharia', type: 'setor' },
    { id: 2, name: 'Peça Pronta', type: 'tipo' },
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in">
      <div className="bg-surface border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center bg-bg/50">
          <h2 className="text-xl font-black text-text-primary uppercase italic tracking-tighter">Gestão de <span className="text-secondary">Parâmetros</span></h2>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* SELETOR RADIO */}
          <div className="flex gap-4 p-1 bg-bg rounded-2xl border border-border">
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

          {/* INPUT DE CRIAÇÃO */}
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder={`NOME DO NOVO ${mode.toUpperCase()}...`}
              className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-secondary transition-all"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="p-3 bg-secondary text-white rounded-xl hover:scale-105 transition-transform">
              <Plus size={20} />
            </button>
          </div>

          {/* LISTA DE ITENS PARA EDITAR/EXCLUIR */}
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {items.filter(i => i.type === mode).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-bg/50 border border-border rounded-xl group hover:border-secondary/30 transition-all">
                <span className="text-[10px] font-black uppercase text-text-primary">{item.name}</span>
                <div className="flex gap-1">
                  <button className="p-2 text-text-tertiary hover:text-secondary transition-colors"><Edit3 size={14} /></button>
                  <button className="p-2 text-text-tertiary hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};