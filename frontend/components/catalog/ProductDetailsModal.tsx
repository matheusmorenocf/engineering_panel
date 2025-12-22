"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  X, Plus, Loader2, Layers, Package, 
  Info, Factory, ShoppingCart, Trash2, Hash, AlignLeft, 
  Maximize2, Minimize2, Image as ImageIcon, Tag
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { apiFetch } from '@/lib/apiFetch';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawingId: string; 
  imageUrl: string;
  products: string; 
  descriptions: string; 
  onSuccess?: () => void;
}

interface Option {
  id: number;
  name: string;
}

interface CurrentLink {
  id: number;
  sector_name: string | null;
  type_name: string | null;
}

const CACHE_EXPIRATION = 60 * 60 * 1000;

export const ProductDetailsModal = ({ 
  isOpen, onClose, drawingId, imageUrl, products, descriptions, onSuccess 
}: ProductDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState('cadastrais');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [sectors, setSectors] = useState<Option[]>([]);
  const [types, setTypes] = useState<Option[]>([]);
  const [currentLinks, setCurrentLinks] = useState<CurrentLink[]>([]);
  
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadInitialOptions();
      fetchCurrentLinks();
    }
  }, [isOpen, drawingId]);

  const loadInitialOptions = useCallback(() => {
    const getCached = (key: string) => {
      if (typeof window === 'undefined') return null;
      const cached = localStorage.getItem(`cache_management_${key}`);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      return (Date.now() - timestamp < CACHE_EXPIRATION) ? data : null;
    };

    const s = getCached('setor');
    const t = getCached('tipo');

    if (s) setSectors(s);
    if (t) setTypes(t);

    syncOptions();
  }, []);

  const syncOptions = async () => {
    try {
      const [secRes, typRes] = await Promise.all([
        apiFetch('/api/catalog/management/sectors/'),
        apiFetch('/api/catalog/management/types/')
      ]);
      const secData = await secRes.json();
      const typData = await typRes.json();
      
      const sList = Array.isArray(secData) ? secData : secData.results || [];
      const tList = Array.isArray(typData) ? typData : typData.results || [];

      setSectors(sList);
      setTypes(tList);

      localStorage.setItem('cache_management_setor', JSON.stringify({ data: sList, timestamp: Date.now() }));
      localStorage.setItem('cache_management_tipo', JSON.stringify({ data: tList, timestamp: Date.now() }));
    } catch (e) { console.error("Erro sync options", e); }
  };

  const fetchCurrentLinks = async () => {
    setLoadingLinks(true);
    try {
      // ✅ Adicionada barra final '/' antes da query string
      const res = await apiFetch(`/api/catalog/management/products/?drawing_code=${drawingId}`);
      const data = await res.json();
      setCurrentLinks(Array.isArray(data) ? data : data.results || []);
    } catch (e) { console.error(e); }
    finally { setLoadingLinks(false); }
  };

  const handleSaveFlow = async () => {
    if (!selectedSector && !selectedType) {
      addToast('Selecione ao menos um Setor ou Tipo', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      let drawingDbId: number | null = null;

      // 1. Buscar desenho (Garantindo a barra '/' e URL exata do Search)
      const searchRes = await apiFetch(`/api/catalog/management/drawings/?search=${drawingId}`);
      const searchData = await searchRes.json();
      const drawingsList = Array.isArray(searchData) ? searchData : (searchData.results || []);
      const existing = drawingsList.find((d: any) => d.code.toUpperCase() === drawingId.toUpperCase());

      if (existing) {
        drawingDbId = existing.id;
      } else {
        // 2. Criar desenho (Barra final '/' obrigatória)
        const createRes = await apiFetch('/api/catalog/management/drawings/', {
          method: 'POST',
          body: JSON.stringify({ 
            code: drawingId, 
            title: `DESENHO ${drawingId}`,
          })
        });
        
        if (!createRes.ok) throw new Error("Erro ao criar desenho");
        const newDrawing = await createRes.json();
        drawingDbId = newDrawing.id;
      }

      // 3. Criar vínculo de produto (✅ BARRA FINAL '/' OBRIGATÓRIA PARA EVITAR 404)
      const productRes = await apiFetch('/api/catalog/management/products/', {
        method: 'POST',
        body: JSON.stringify({
          drawing: drawingDbId,
          product_type: selectedType || null,
          sector: selectedSector || null
        })
      });

      if (productRes.ok) {
        addToast(`Vínculo salvo com sucesso!`, 'success');
        setSelectedSector(null);
        setSelectedType(null);
        fetchCurrentLinks();
        if (onSuccess) onSuccess();
      } else {
        const err = await productRes.json();
        addToast(err.detail || "Erro ao salvar classificação", 'error');
      }
    } catch (error) {
      addToast('Erro ao processar. Verifique o console.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm("Remover esta classificação?")) return;
    try {
      // ✅ Barra final '/' obrigatória
      const res = await apiFetch(`/api/catalog/management/products/${id}/`, { method: 'DELETE' });
      if (res.ok) fetchCurrentLinks();
    } catch (e) { addToast("Erro ao remover", "error"); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`bg-surface border border-border rounded-3xl shadow-2xl flex flex-col transition-all duration-300 ${isExpanded ? 'w-[98vw] h-[96vh]' : 'w-full max-w-7xl h-[90vh]'}`}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-border bg-bg/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 text-text-primary">
            <Package size={24} className="text-secondary" />
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Ficha Técnica</h2>
              <p className="text-xs text-text-tertiary font-bold uppercase">{drawingId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-text-tertiary hover:bg-bg rounded-full hidden md:block">
              {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button onClick={onClose} className="p-2 text-text-tertiary hover:bg-bg rounded-full"><X size={24} /></button>
          </div>
        </div>

        {/* ABAS */}
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in fade-in duration-300">
              <div className="lg:col-span-8 bg-bg rounded-3xl border border-border flex items-center justify-center h-[500px] md:h-[600px] shadow-inner overflow-hidden">
                <img src={imageUrl} alt={drawingId} className="w-full h-full object-contain p-6" />
              </div>
              <div className="lg:col-span-4 space-y-8 text-text-primary">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-text-tertiary uppercase flex items-center gap-2 tracking-widest"><Hash size={14} className="text-secondary"/> Itens Protheus</h4>
                  <div className="flex flex-wrap gap-2">
                    {products.split(';').map((p, i) => (
                      <span key={i} className="px-3 py-2 bg-bg border border-border rounded-xl text-[10px] font-black tracking-tight">{p.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-text-tertiary uppercase flex items-center gap-2 tracking-widest"><AlignLeft size={14} className="text-secondary"/> Descrições</h4>
                  <div className="space-y-3">
                    {descriptions.split(';').map((d, i) => (
                      <p key={i} className="text-[11px] text-text-secondary border-l-2 border-secondary/30 pl-4 italic leading-relaxed">{d.trim()}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'classificacao' && (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 items-start animate-in slide-in-from-bottom-4 duration-300">
              <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
                <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest px-1 flex justify-between">Vínculos Atuais <span>{currentLinks.length}</span></h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentLinks.map((link) => (
                    <div key={link.id} className="p-5 bg-bg border border-border rounded-2xl group relative transition-all hover:border-secondary/30 shadow-sm">
                      <div className="flex flex-col gap-3 text-[10px] font-bold uppercase">
                        <div className="flex flex-col"><span className="text-[7px] text-secondary font-black mb-1">Setor</span>{link.sector_name || '-'}</div>
                        <div className="flex flex-col border-t border-border/30 pt-3"><span className="text-[7px] text-text-tertiary font-black mb-1">Tipo</span>{link.type_name || '-'}</div>
                      </div>
                      <button onClick={() => handleDeleteLink(link.id)} className="absolute top-4 right-4 p-2 text-text-tertiary hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6 order-1 lg:order-2">
                <div className="bg-bg/40 p-6 rounded-[2rem] border border-border space-y-6 text-text-primary shadow-sm">
                  <h3 className="text-xs font-black uppercase italic flex items-center gap-2"><Plus size={16} className="text-secondary" /> Novo</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-text-tertiary uppercase ml-1">Setor</label>
                      <select 
                        value={selectedSector || ''} 
                        onChange={(e) => setSelectedSector(Number(e.target.value) || null)} 
                        className="w-full bg-surface border border-border rounded-xl px-4 py-4 text-[11px] font-bold uppercase outline-none focus:border-secondary transition-all appearance-none cursor-pointer"
                      >
                        <option value="">SELECIONE SETOR</option>
                        {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-text-tertiary uppercase ml-1">Tipo</label>
                      <select 
                        value={selectedType || ''} 
                        onChange={(e) => setSelectedType(Number(e.target.value) || null)} 
                        className="w-full bg-surface border border-border rounded-xl px-4 py-4 text-[11px] font-bold uppercase outline-none focus:border-secondary transition-all appearance-none cursor-pointer"
                      >
                        <option value="">SELECIONE TIPO</option>
                        {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={handleSaveFlow} disabled={submitting} className="w-full py-5 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase hover:bg-secondary-dark shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Salvar
                  </button>
                </div>
              </div>
            </div>
          )}

          {['fabricacao', 'comercial', 'desenho'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full py-20 opacity-20 gap-4 text-text-primary">
              <Package size={80} strokeWidth={1} />
              <p className="text-sm font-black uppercase tracking-[0.3em]">Módulo em Desenvolvimento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};