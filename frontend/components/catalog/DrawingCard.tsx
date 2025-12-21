"use client";

import { useState } from 'react';
import { Package, Hash, AlignLeft, Plus } from 'lucide-react';
import { AddToCatalogModal } from './AddToCatalogModal';

interface DrawingCardProps {
  drawingId: string;
  products: string;
  descriptions: string;
  onRefresh?: () => void;
}

export const DrawingCard = ({ drawingId, products, descriptions, onRefresh }: DrawingCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-surface border border-border rounded-2xl p-6 hover:border-secondary/50 transition-all group flex flex-col shadow-sm">
        {/* HEADER DO CARD */}
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-bg rounded-xl text-secondary border border-border">
            <Package size={24} />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-secondary uppercase italic">Drawing ID</span>
            <h3 className="text-lg font-black text-text-primary uppercase italic tracking-tighter">
              {drawingId}
            </h3>
          </div>
        </div>

        {/* LISTA DE PRODUTOS (B1_COD) */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-text-tertiary">
            <Hash size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Produtos Relacionados</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {products?.split(';').map((cod, idx) => (
              <span key={idx} className="px-2 py-1 bg-bg border border-border rounded text-[9px] font-bold text-text-primary uppercase tracking-tighter">
                {cod.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* LISTA DE DESCRIÇÕES */}
        <div className="flex-1 space-y-2 mb-6 border-t border-border/50 pt-4">
          <div className="flex items-center gap-2 text-text-tertiary">
            <AlignLeft size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">Descrições Técnicas</span>
          </div>
          <div className="flex flex-col gap-2">
            {descriptions?.split(';').map((desc, idx) => (
              <p key={idx} className="text-[10px] text-text-tertiary font-bold uppercase leading-tight border-l-2 border-secondary/20 pl-2">
                {desc.trim()}
              </p>
            ))}
          </div>
        </div>

        {/* BOTÃO DE ADICIONAR AO CATÁLOGO */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3 bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-dark transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <Plus size={14} />
          Adicionar ao Catálogo
        </button>
      </div>

      {/* Modal */}
      <AddToCatalogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        drawingId={drawingId}
        onSuccess={onRefresh}
      />
    </>
  );
};