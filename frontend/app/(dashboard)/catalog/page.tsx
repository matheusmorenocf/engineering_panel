"use client";

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Loader2, PackageSearch, AlertCircle, Terminal } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

// Importação dos subcomponentes
import { DrawingCard } from '@/components/catalog/DrawingCard';
import { CatalogFilters } from '@/components/catalog/CatalogFilters';
import { ManagementModal } from '@/components/catalog/ManagementModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface GroupedProduct {
  drawing_id: string;
  drawing_product: string;
  drawing_description: string;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<GroupedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(100);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiError, setApiError] = useState<{message: string, trace?: string} | null>(null);

  const [filters, setFilters] = useState({
    codigo: '',
    descricao: '',
    desenho: '',
    cliente: ''
  });

  const { addToast } = useToast();

  const fetchProducts = useCallback(async (currentLimit: number) => {
    setLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem('access_token');
      const queryParams = new URLSearchParams({
        limit: currentLimit.toString(),
        codigo: filters.codigo,
        descricao: filters.descricao,
        desenho: filters.desenho,
      });

      const response = await fetch(`${API_BASE_URL}/api/catalog/products/?${queryParams.toString()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError({
          message: data.error || "Erro interno no servidor (Django)",
          trace: data.trace
        });
        addToast("Falha na sincronização", "error");
        return;
      }

      setProducts(data);
    } catch (error: any) {
      setApiError({ message: "Não foi possível conectar ao servidor. Verifique se o Backend está rodando." });
      addToast("Erro de conexão", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts(limit);
    }, 600);
    return () => clearTimeout(delayDebounce);
  }, [filters, limit, fetchProducts]);

  return (
    <ProtectedRoute permission="view_product">
      <div className="w-full max-w-[1920px] flex flex-col gap-8 fade-in p-6 lg:p-10">
        
        {/* HEADER */}
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-2xl text-secondary border border-secondary/20">
              <PackageSearch size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-text-primary uppercase italic tracking-tighter">
                Catálogo de <span className="text-secondary">Desenhos</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-text-tertiary text-[10px] font-black uppercase tracking-[0.2em]">
                  Base de Dados Durit (SB1010)
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* FILTROS */}
        <CatalogFilters 
          filters={filters} 
          setFilters={setFilters} 
          onOpenManagement={() => setIsModalOpen(true)} 
        />

        <ManagementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        {/* AREA DE DEBUG (Aparece apenas em caso de erro) */}
        {apiError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle size={20} />
              <span className="font-black uppercase text-xs tracking-widest">Erro Detectado na API</span>
            </div>
            <p className="text-sm text-text-primary font-bold">{apiError.message}</p>
            {apiError.trace && (
              <div className="bg-black/20 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center gap-2 mb-2 text-text-tertiary uppercase text-[9px] font-black">
                  <Terminal size={12} /> Traceback do Servidor
                </div>
                <pre className="text-[10px] text-text-tertiary leading-relaxed font-mono">
                  {apiError.trace}
                </pre>
              </div>
            )}
            <button 
              onClick={() => fetchProducts(limit)}
              className="w-fit px-6 py-2 bg-red-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-600 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* LISTAGEM */}
        {loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-secondary" size={48} />
            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.4em]">
              Sincronizando registros...
            </span>
          </div>
        ) : (
          <>
            {!apiError && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {products.map((group) => (
                  <DrawingCard 
                    key={group.drawing_id}
                    drawingId={group.drawing_id}
                    products={group.drawing_product}
                    descriptions={group.drawing_description}
                  />
                ))}
              </div>
            ) : !loading && !apiError && (
              <div className="flex flex-col items-center justify-center py-20 bg-surface/30 rounded-3xl border border-dashed border-border">
                <span className="text-[11px] font-black text-text-tertiary uppercase tracking-widest italic">
                  Nenhum desenho encontrado.
                </span>
              </div>
            )}

            {!loading && products.length >= limit && (
              <button 
                onClick={() => setLimit(prev => prev + 100)}
                className="w-full py-5 mt-4 bg-surface border border-border rounded-2xl text-[11px] font-black uppercase tracking-[0.5em] text-text-tertiary hover:text-secondary hover:border-secondary transition-all shadow-sm mb-10"
              >
                Carregar mais
              </button>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}