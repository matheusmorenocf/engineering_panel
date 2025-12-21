"use client";

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Loader2, PackageSearch, AlertCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

import { DrawingCard } from '@/components/catalog/DrawingCard';
import { CatalogFilters } from '@/components/catalog/CatalogFilters';
import { ManagementModal } from '@/components/catalog/ManagementModal';

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(100);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Estado dos filtros (incluindo arrays para multi-seleção)
  const [filters, setFilters] = useState({
    codigo: '',
    descricao: '',
    desenho: '',
    cliente: '',
    sectors: [] as number[],
    types: [] as number[]
  });

  const { addToast } = useToast();

  const fetchProducts = useCallback(async (currentLimit: number) => {
    setLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem('access_token');
      
      // Prepara os parâmetros para enviar ao Next.js (que repassará ao Django)
      const queryParams = new URLSearchParams({
        limit: currentLimit.toString(),
        codigo: filters.codigo,
        descricao: filters.descricao,
        desenho: filters.desenho,
        // Converte arrays [1, 2] em string "1,2"
        sectors: filters.sectors.join(','), 
        types: filters.types.join(','),
      });

      // CORREÇÃO: Chama a rota interna do Next.js (/api/...)
      // O Next.js fará a ponte com o Docker (backend:8000)
      const response = await fetch(`/api/catalog/products?${queryParams.toString()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Erro ao comunicar com o servidor");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error: any) {
      setApiError(error.message);
      console.error("DEBUG_CATALOG:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]); // Removi addToast da dependência para evitar re-renders desnecessários

  // Debounce para não chamar a API a cada letra digitada
  useEffect(() => {
    const delayDebounce = setTimeout(() => fetchProducts(limit), 600);
    return () => clearTimeout(delayDebounce);
  }, [filters, limit, fetchProducts]);

  return (
    <ProtectedRoute permission="view_product">
      <div className="w-full max-w-[1920px] flex flex-col gap-8 p-6 lg:p-10 fade-in">
        
        {/* HEADER - Visual Mantido */}
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-2xl text-secondary border border-secondary/20">
              <PackageSearch size={32} />
            </div>
            <h1 className="text-4xl font-black text-text-primary uppercase italic tracking-tighter">
              Catálogo de <span className="text-secondary">Desenhos</span>
            </h1>
          </div>
        </header>

        {/* FILTROS */}
        <CatalogFilters 
          filters={filters} 
          setFilters={setFilters} 
          onOpenManagement={() => setIsModalOpen(true)} 
        />

        {/* MODAL DE GESTÃO */}
        <ManagementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        {/* MENSAGEM DE ERRO */}
        {apiError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center gap-4 text-red-500">
            <AlertCircle size={24} />
            <div className="flex flex-col">
              <span className="font-black uppercase text-xs">Erro de Comunicação</span>
              <p className="text-sm font-bold">{apiError}</p>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-secondary" size={48} />
            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.4em]">Sincronizando...</span>
          </div>
        ) : (
          /* GRID DE CARDS */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {products.map((group: any) => (
              <DrawingCard 
                key={group.drawing_id}
                drawingId={group.drawing_id}
                products={group.drawing_product}
                descriptions={group.drawing_description}
              />
            ))}
            
            {/* Estado vazio se não houver loading nem produtos */}
            {!loading && products.length === 0 && !apiError && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                <PackageSearch size={48} className="mb-4" />
                <p className="font-bold uppercase tracking-widest text-xs">Nenhum resultado encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}