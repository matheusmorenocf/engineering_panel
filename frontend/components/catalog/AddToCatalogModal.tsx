"use client";

import { useState, useEffect } from 'react';
import { X, Plus, Loader2, Tag, Layers, Package } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { apiFetch } from '@/lib/apiFetch';

interface AddToCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawingId: string;
  onSuccess?: () => void;
}

interface Option {
  id: number;
  name: string;
}

export const AddToCatalogModal = ({ isOpen, onClose, drawingId, onSuccess }: AddToCatalogModalProps) => {
  const [sectors, setSectors] = useState<Option[]>([]);
  const [types, setTypes] = useState<Option[]>([]);
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  // Carregar opções ao abrir
  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [secRes, typRes] = await Promise.all([
        fetch('/api/catalog/management/sectors', { headers }),
        fetch('/api/catalog/management/types', { headers })
      ]);

      if (secRes.ok && typRes.ok) {
        setSectors(await secRes.json());
        setTypes(await typRes.json());
      } else {
        addToast('Erro ao carregar opções', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
      addToast('Erro de conexão', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSector || !selectedType) {
      addToast('Selecione setor e tipo', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');

      // 1. Verificar se o desenho já existe, senão criar
      const drawingRes = await apiFetch('/api/catalog/management/drawings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: drawingId,
          title: `Desenho ${drawingId}`
        })
      });

      let drawingDbId;
      if (drawingRes.ok) {
        const drawingData = await drawingRes.json();
        drawingDbId = drawingData.id;
      } else {
        // Se já existe, buscar o ID
        const searchRes = await apiFetch(`/api/catalog/management/drawings?code=${drawingId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (searchRes.ok) {
          const drawings = await searchRes.json();
          drawingDbId = drawings[0]?.id;
        }
      }

      if (!drawingDbId) {
        throw new Error('Não foi possível obter ID do desenho');
      }

      // 2. Criar associação Product
      const productRes = await apiFetch('/api/catalog/management/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          drawing: drawingDbId,
          sector: selectedSector,
          product_type: selectedType
        })
      });

      if (productRes.ok) {
        addToast(`${drawingId} adicionado ao catálogo!`, 'success');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        const errorData = await productRes.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Erro ao adicionar');
      }
    } catch (error: any) {
      console.error('Erro ao adicionar ao catálogo:', error);
      addToast(error.message || 'Erro ao adicionar', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in">
      <div className="bg-surface border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-bg/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <Package size={20} className="text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-text-primary uppercase italic tracking-tighter">
                Adicionar ao Catálogo
              </h2>
              <p className="text-[9px] text-text-tertiary font-bold uppercase">
                Desenho: {drawingId}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-secondary" size={32} />
            </div>
          ) : (
            <>
              {/* Setor */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                  <Layers size={14} />
                  Setor
                </label>
                <select
                  value={selectedSector || ''}
                  onChange={(e) => setSelectedSector(Number(e.target.value))}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-secondary transition-all"
                >
                  <option value="">SELECIONE O SETOR</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                  <Tag size={14} />
                  Tipo de Produto
                </label>
                <select
                  value={selectedType || ''}
                  onChange={(e) => setSelectedType(Number(e.target.value))}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-secondary transition-all"
                >
                  <option value="">SELECIONE O TIPO</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-[9px] text-blue-700 font-bold uppercase leading-relaxed">
                  💡 Após adicionar, este desenho aparecerá quando você filtrar por esse setor ou tipo
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-bg border border-border rounded-xl text-[10px] font-black uppercase hover:bg-surface transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedSector || !selectedType || submitting}
                  className="flex-1 px-4 py-3 bg-secondary text-white rounded-xl text-[10px] font-black uppercase hover:bg-secondary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Adicionar
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};