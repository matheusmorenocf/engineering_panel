"use client";

import { useState, useEffect } from 'react';
import { X, Plus, Loader2, Layers, Package, Info, Factory, ShoppingCart, Trash2, Hash, AlignLeft, Maximize2, Minimize2, Image as ImageIcon, Tag } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { apiFetch } from '@/lib/apiFetch';
import { useCatalogParams } from '@/hooks/useCatalogParams';

export const ProductDetailsModal = ({ isOpen, onClose, drawingId, imageUrl, products, descriptions, onSuccess }: any) => {
  const [activeTab, setActiveTab] = useState('cadastrais');
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentLinks, setCurrentLinks] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { addToast } = useToast();
  // ✅ Hook Unificado
  const { sectors, types, loading: loadingParams } = useCatalogParams(isOpen);

  useEffect(() => {
    if (isOpen && drawingId) fetchCurrentLinks();
  }, [isOpen, drawingId]);

  const fetchCurrentLinks = async () => {
    try {
      const res = await apiFetch(`/api/catalog/management/products/?drawing_code=${drawingId}`);
      const data = await res.json();
      setCurrentLinks(Array.isArray(data) ? data : data.results || []);
    } catch (e) { console.error(e); }
  };

  const handleSaveFlow = async () => {
    if (!selectedSector && !selectedType) {
      addToast('Selecione ao menos um Setor ou Tipo', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      let drawingDbId: number | null = null;
      const searchRes = await apiFetch(`/api/catalog/management/drawings/?search=${drawingId}`);
      const searchData = await searchRes.json();
      const drawings = Array.isArray(searchData) ? searchData : searchData.results || [];
      const existing = drawings.find((d: any) => d.code.toUpperCase() === drawingId.toUpperCase());

      if (existing) drawingDbId = existing.id;
      else {
        // ✅ Barra "/" obrigatória no POST
        const createRes = await apiFetch('/api/catalog/management/drawings/', {
          method: 'POST',
          body: JSON.stringify({ code: drawingId, title: `DESENHO ${drawingId}` })
        });
        const newDrawing = await createRes.json();
        drawingDbId = newDrawing.id;
      }

      // ✅ Barra "/" obrigatória no POST de products
      const productRes = await apiFetch('/api/catalog/management/products/', {
        method: 'POST',
        body: JSON.stringify({
          drawing: drawingDbId,
          product_type: selectedType || null,
          sector: selectedSector || null
        })
      });

      if (productRes.ok) {
        addToast(`Vínculo salvo!`, 'success');
        setSelectedSector(null);
        setSelectedType(null);
        fetchCurrentLinks(); 
        if (onSuccess) onSuccess();
      }
    } catch (error) { addToast('Erro ao processar', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm("Remover?")) return;
    await apiFetch(`/api/catalog/management/products/${id}/`, { method: 'DELETE' });
    fetchCurrentLinks();
    if (onSuccess) onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-text-primary">
      <div className={`bg-surface border border-border rounded-3xl shadow-2xl flex flex-col transition-all duration-300 ${isExpanded ? 'w-[98vw] h-[96vh]' : 'w-full max-w-7xl h-[90vh]'}`}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-border bg-bg/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-secondary" />
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Ficha Técnica</h2>
              <p className="text-xs text-text-tertiary font-bold uppercase">{drawingId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-text-tertiary hover:bg-bg rounded-full hidden md:block transition-colors">
              {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button onClick={onClose} className="p-2 text-text-tertiary hover:bg-bg rounded-full transition-colors"><X size={24} /></button>
          </div>
        </div>

        {/* TABS */}
        <div className="px-6 py-2 border-b border-border bg-bg/10 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'cadastrais', label: 'Cadastrais', icon: Info },
            { id: 'classificacao', label: 'Classificação', icon: Tag },
            { id: 'fabricacao', label: 'Fabricação', icon: Factory },
            { id: 'comercial', label: 'Comercial', icon: ShoppingCart },
            { id: 'desenho', label: 'Desenho', icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${activeTab === tab.id ? 'bg-secondary text-white' : 'text-text-tertiary hover:bg-bg'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'cadastrais' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in fade-in">
              <div className="lg:col-span-8 bg-bg rounded-3xl border border-border flex items-center justify-center h-[500px] md:h-[600px] shadow-inner overflow-hidden">
                <img src={imageUrl} alt={drawingId} className="w-full h-full object-contain p-6" />
              </div>
              <div className="lg:col-span-4 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-text-tertiary uppercase flex items-center gap-2 tracking-widest"><Hash size={14} className="text-secondary"/> Itens Protheus</h4>
                  <div className="flex flex-wrap gap-2">
                    {products.split(';').map((p: string, i: number) => (
                      <span key={i} className="px-3 py-2 bg-bg border border-border rounded-xl text-[10px] font-black tracking-tight">{p.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-text-tertiary uppercase flex items-center gap-2 tracking-widest"><AlignLeft size={14} className="text-secondary"/> Descrições</h4>
                  <div className="space-y-3">
                    {descriptions.split(';').map((d: string, i: number) => (
                      <p key={i} className="text-[11px] text-text-secondary border-l-2 border-secondary/30 pl-4 italic leading-relaxed">{d.trim()}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'classificacao' && (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 items-start animate-in slide-in-from-bottom-4">
              <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
                <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest px-1">Classificações Existentes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentLinks.map((link) => (
                    <div key={link.id} className="p-5 bg-bg border border-border rounded-2xl group relative transition-all hover:border-secondary/30">
                      <div className="flex flex-col gap-3 text-[10px] font-bold uppercase">
                        <div className="flex flex-col"><span className="text-[7px] text-secondary font-black mb-1">Setor</span>{link.sector_name || '-'}</div>
                        <div className="flex flex-col border-t border-border/30 pt-3"><span className="text-[7px] text-text-tertiary font-black mb-1">Tipo</span>{link.type_name || '-'}</div>
                      </div>
                      <button onClick={() => handleDeleteLink(link.id)} className="absolute top-4 right-4 p-2 text-text-tertiary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6 order-1 lg:order-2">
                <div className="bg-bg/40 p-6 rounded-[2rem] border border-border space-y-6 shadow-sm">
                  <h3 className="text-xs font-black uppercase italic flex items-center gap-2"><Plus size={16} className="text-secondary" /> Vincular</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-text-tertiary uppercase ml-1">Setor</label>
                      <select value={selectedSector || ''} onChange={(e) => setSelectedSector(Number(e.target.value) || null)} className="w-full bg-surface border border-border rounded-xl px-4 py-4 text-[11px] font-bold uppercase outline-none focus:border-secondary transition-all cursor-pointer">
                        <option value="">{loadingParams ? '...' : 'SELECIONE SETOR'}</option>
                        {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-text-tertiary uppercase ml-1">Tipo</label>
                      <select value={selectedType || ''} onChange={(e) => setSelectedType(Number(e.target.value) || null)} className="w-full bg-surface border border-border rounded-xl px-4 py-4 text-[11px] font-bold uppercase outline-none focus:border-secondary transition-all cursor-pointer">
                        <option value="">{loadingParams ? '...' : 'SELECIONE TIPO'}</option>
                        {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={handleSaveFlow} disabled={submitting} className="w-full py-5 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase hover:bg-secondary-dark shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Salvar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};