"use client";

import { useState, useEffect } from 'react';
import { 
  X, Plus, Loader2, Tag, Layers, Package, Lightbulb, 
  Info, Factory, ShoppingCart, Trash2, Hash, AlignLeft, 
  Maximize2, Minimize2 
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

type TabId = 'cadastrais' | 'fabricacao' | 'comercial';

export const ProductDetailsModal = ({ 
  isOpen, 
  onClose, 
  drawingId, 
  imageUrl, 
  products, 
  descriptions, 
  onSuccess 
}: ProductDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('cadastrais');
  const [isExpanded, setIsExpanded] = useState(false);
  const [sectors, setSectors] = useState<Option[]>([]);
  const [types, setTypes] = useState<Option[]>([]);
  const [currentLinks, setCurrentLinks] = useState<CurrentLink[]>([]);
  
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      fetchCurrentLinks();
    } else {
      setIsExpanded(false);
    }
  }, [isOpen, drawingId]);

  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      // ✅ Adicionado barra final '/' antes da query string para evitar erro 301/404
      const [secRes, typRes] = await Promise.all([
        apiFetch('/api/catalog/management/sectors/?limit=100'),
        apiFetch('/api/catalog/management/types/?limit=100')
      ]);

      if (!secRes.ok || !typRes.ok) throw new Error();

      const secData = await secRes.json();
      const typData = await typRes.json();

      setSectors(Array.isArray(secData) ? secData : secData.results || []);
      setTypes(Array.isArray(typData) ? typData : typData.results || []);
    } catch (error) {
      console.error("Erro ao carregar opções:", error);
      addToast('Erro ao carregar categorias', 'error');
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchCurrentLinks = async () => {
    setLoadingLinks(true);
    try {
      const res = await apiFetch(`/api/catalog/management/products/?drawing_code=${drawingId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCurrentLinks(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Erro ao buscar vínculos:", error);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleSaveCadastral = async () => {
    if (!selectedSector && !selectedType) {
      addToast('Selecione ao menos um Setor ou Tipo', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      let drawingDbId: number | null = null;

      // 1. Busca desenho
      const searchRes = await apiFetch(`/api/catalog/management/drawings/?search=${drawingId}`);
      const searchData = await searchRes.json();
      const drawings = Array.isArray(searchData) ? searchData : searchData.results || [];
      const existingDrawing = drawings.find((d: any) => d.code === drawingId);

      if (existingDrawing) {
        drawingDbId = existingDrawing.id;
      } else {
        // 2. Cria desenho (Nota: barra final '/' no POST é importante)
        const createRes = await apiFetch('/api/catalog/management/drawings/', {
          method: 'POST',
          body: JSON.stringify({ code: drawingId, title: `Desenho ${drawingId}` })
        });
        
        if (!createRes.ok) throw new Error("Erro ao criar registro do desenho");
        const newDrawing = await createRes.json();
        drawingDbId = newDrawing.id;
      }

      // 3. Cria vínculo
      const productRes = await apiFetch('/api/catalog/management/products/', {
        method: 'POST',
        body: JSON.stringify({
          drawing: drawingDbId,
          sector: selectedSector || null,
          product_type: selectedType || null
        })
      });

      if (productRes.ok) {
        addToast(`Vínculo cadastrado com sucesso!`, 'success');
        setSelectedSector(null);
        setSelectedType(null);
        fetchCurrentLinks(); 
        if (onSuccess) onSuccess();
      } else {
        const errorData = await productRes.json().catch(() => ({}));
        addToast(errorData.detail || errorData.non_field_errors?.[0] || "Erro ao salvar vínculo", 'error');
      }
    } catch (error: any) {
      addToast('Erro ao processar solicitação', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm("Remover esta classificação?")) return;
    try {
      const res = await apiFetch(`/api/catalog/management/products/${id}/`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        addToast("Vínculo removido", "success");
        fetchCurrentLinks();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      addToast("Erro ao remover", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4 fade-in">
      <div 
        className={`bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-[98vw] h-[96vh]' : 'w-full max-w-6xl h-[90vh]'}`}
      >
        
        {/* HEADER */}
        <div className="p-6 border-b border-border bg-bg/30 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                <Package size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-primary uppercase italic tracking-tighter">Ficha Técnica</h2>
                <p className="text-xs text-text-tertiary font-bold uppercase">{drawingId}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-text-tertiary hover:bg-bg rounded-full transition-colors hidden md:block"
                title={isExpanded ? "Reduzir" : "Expandir"}
              >
                {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button onClick={onClose} className="p-2 text-text-tertiary hover:bg-bg rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-bg/50 rounded-2xl border border-border w-fit">
            {[
              { id: 'cadastrais', label: 'Cadastrais', icon: Info },
              { id: 'fabricacao', label: 'Fabricação', icon: Factory },
              { id: 'comercial', label: 'Comercial', icon: ShoppingCart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-secondary text-white shadow-lg' : 'text-text-secondary hover:text-text-primary hover:bg-surface'}`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {activeTab === 'cadastrais' && (
            <div className={`grid grid-cols-1 gap-10 ${isExpanded ? 'lg:grid-cols-12' : 'lg:grid-cols-12'}`}>
              
              {/* COLUNA 1: IMAGEM */}
              <div className={`${isExpanded ? 'lg:col-span-7' : 'lg:col-span-5'} space-y-8`}>
                <div className="relative group bg-bg rounded-3xl border border-border shadow-inner overflow-hidden flex items-center justify-center min-h-[400px] h-full max-h-[70vh]">
                  <img 
                    src={imageUrl} 
                    alt={drawingId} 
                    className="max-w-full max-h-full object-contain transition-transform duration-700" 
                  />
                  <div className="absolute bottom-4 right-4 bg-surface/90 backdrop-blur px-3 py-1 rounded-lg border border-border/50">
                    <span className="text-[9px] font-black text-secondary uppercase italic tracking-widest">Preview Digital</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                      <Hash size={14} className="text-secondary"/> Produtos Relacionados
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {products.split(';').map((p, i) => (
                        <span key={i} className="px-3 py-1.5 bg-bg border border-border rounded-xl text-[10px] font-bold text-text-primary uppercase tracking-tighter shadow-sm">
                          {p.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                      <AlignLeft size={14} className="text-secondary"/> Descrições Técnicas
                    </h4>
                    <div className="space-y-2">
                      {descriptions.split(';').map((d, i) => (
                        <p key={i} className="text-[11px] text-text-secondary leading-relaxed border-l-2 border-secondary/20 pl-4 italic">
                          {d.trim()}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUNA 2 E 3: GESTÃO */}
              <div className={`${isExpanded ? 'lg:col-span-5' : 'lg:col-span-7'} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6`}>
                
                {/* VÍNCULOS ATUAIS */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest flex items-center justify-between px-1">
                    Vínculos Atuais
                    <span className="text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">{currentLinks.length}</span>
                  </h4>
                  
                  <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {loadingLinks ? (
                      <div className="flex justify-center py-10"><Loader2 className="animate-spin text-secondary" /></div>
                    ) : currentLinks.length > 0 ? (
                      currentLinks.map((link) => (
                        <div key={link.id} className="flex flex-col gap-3 p-4 bg-bg border border-border rounded-2xl group hover:border-secondary/40 transition-all relative">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-secondary uppercase tracking-tighter">Setor</span>
                            <span className="text-[10px] font-bold text-text-primary uppercase truncate">
                              {link.sector_name || <span className="opacity-30">Não definido</span>}
                            </span>
                          </div>
                          <div className="flex flex-col border-t border-border/30 pt-2 text-text-primary">
                            <span className="text-[8px] font-black text-text-tertiary uppercase tracking-tighter">Tipo</span>
                            <span className="text-[10px] font-bold text-text-primary uppercase truncate">
                              {link.type_name || <span className="opacity-30">Não definido</span>}
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDeleteLink(link.id)}
                            className="absolute top-3 right-3 p-1.5 text-text-tertiary hover:text-white hover:bg-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center opacity-40 text-center px-4">
                        <Layers size={32} className="mb-3 text-text-tertiary" />
                        <p className="text-[9px] font-black uppercase text-text-tertiary">Aguardando classificação</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* FORMULÁRIO */}
                <div className="bg-bg/40 p-6 rounded-[2rem] border border-border space-y-6 shadow-sm h-fit">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-text-primary uppercase italic flex items-center gap-2">
                      <Plus size={18} className="text-secondary" /> Nova Classificação
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Setor Responsável</label>
                      <select
                        value={selectedSector || ''}
                        onChange={(e) => setSelectedSector(e.target.value ? Number(e.target.value) : null)}
                        className="w-full bg-surface border border-border text-text-primary rounded-2xl px-5 py-4 text-[10px] font-bold uppercase outline-none focus:border-secondary transition-all cursor-pointer"
                      >
                        <option value="">OPCIONAL: SELECIONE O SETOR</option>
                        {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Tipo de Aplicação</label>
                      <select
                        value={selectedType || ''}
                        onChange={(e) => setSelectedType(e.target.value ? Number(e.target.value) : null)}
                        className="w-full bg-surface border border-border text-text-primary rounded-2xl px-5 py-4 text-[10px] font-bold uppercase outline-none focus:border-secondary transition-all cursor-pointer"
                      >
                        <option value="">OPCIONAL: SELECIONE O TIPO</option>
                        {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveCadastral}
                    disabled={submitting || loadingOptions}
                    className="w-full py-5 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-dark transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                    Vincular Catálogo
                  </button>
                </div>

              </div>
            </div>
          )}

          {activeTab !== 'cadastrais' && (
            <div className="flex flex-col items-center justify-center h-full py-20 opacity-30 gap-4 text-text-primary">
              <Package size={80} strokeWidth={1} />
              <p className="text-sm font-black uppercase tracking-[0.3em]">Módulo em Desenvolvimento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};