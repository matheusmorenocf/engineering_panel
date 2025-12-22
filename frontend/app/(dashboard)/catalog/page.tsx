"use client";

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Loader2, PackageSearch, AlertCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

import { DrawingCard } from '@/components/catalog/DrawingCard';
import { CatalogFilters } from '@/components/catalog/CatalogFilters';
import { ManagementModal } from '@/components/catalog/ManagementModal';
import { apiFetch } from '@/lib/apiFetch';

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(500); // 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Estado dos filtros
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
      // Prepara os parâmetros
      const queryParams = new URLSearchParams({
        limit: currentLimit.toString(),
        codigo: filters.codigo,
        descricao: filters.descricao,
        desenho: filters.desenho,
        sectors: filters.sectors.join(','), 
        types: filters.types.join(','),
      });

      console.log('[CATALOG] Fetching:', `/api/catalog/products?${queryParams.toString()}`);

      const response = await apiFetch(`/api/catalog/products?${queryParams.toString()}`);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errData.error || `Erro ${response.status}`);
      }

      const data = await response.json();
      
      // ✅ CORREÇÃO: API agora retorna { count, results }
      if (data.results && Array.isArray(data.results)) {
        setProducts(data.results);
        setTotalCount(data.count || data.results.length);
        console.log(`[CATALOG] Loaded ${data.results.length} groups (total: ${data.count})`);
      } else if (Array.isArray(data)) {
        // ✅ Fallback: Se a API ainda retornar array direto
        setProducts(data);
        setTotalCount(data.length);
        console.log(`[CATALOG] Loaded ${data.length} groups (legacy format)`);
      } else {
        throw new Error('Formato de resposta inválido');
      }

    } catch (error: any) {
      setApiError(error.message);
      console.error("[CATALOG] Error:", error);
      addToast(`Erro: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  // Debounce para não chamar a API a cada letra digitada
  useEffect(() => {
    const delayDebounce = setTimeout(() => fetchProducts(limit), 600);
    return () => clearTimeout(delayDebounce);
  }, [filters, limit, fetchProducts]);

  return (
    <ProtectedRoute permission="view_product">
      <div className="w-full max-w-480 flex flex-col gap-8 p-6 lg:p-10 fade-in">
        
        {/* HEADER */}
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-2xl text-secondary border border-secondary/20">
              <PackageSearch size={32} />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-black text-text-primary uppercase italic tracking-tighter">
                Catálogo de <span className="text-secondary">Desenhos</span>
              </h1>
              {totalCount > 0 && (
                <p className="text-sm text-text-tertiary mt-1">
                  {totalCount} {totalCount === 1 ? 'grupo encontrado' : 'grupos encontrados'}
                </p>
              )}
            </div>
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
            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.4em]">
              Sincronizando...
            </span>
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
            
            {/* Estado vazio */}
            {!loading && products.length === 0 && !apiError && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                <PackageSearch size={48} className="mb-4" />
                <p className="font-bold uppercase tracking-widest text-xs">
                  Nenhum resultado encontrado
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}