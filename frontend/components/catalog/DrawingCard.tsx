"use client";

import { useState } from 'react';
import { Hash, AlignLeft, Plus, ImageOff } from 'lucide-react';
import { AddToCatalogModal, ProductDetailsModal } from './ProductDetailsModal';


interface DrawingCardProps {
  drawingId: string;
  products: string;
  descriptions: string;
  imageUrl: string;
  onRefresh?: () => void;
}

// URL base do backend
const API_BASE_URL = "http://localhost:8000"; 

export const DrawingCard = ({ drawingId, products, descriptions, imageUrl, onRefresh }: DrawingCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Se o backend mandar caminho relativo (/media/...), adiciona o domínio
  const finalSrc = imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;

  return (
    <>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-secondary/50 transition-all group flex flex-col shadow-sm w-full">
        
        {/* IMAGEM */}
        <div className="h-80 w-full bg-bg relative overflow-hidden border-b border-border/50">
          {!hasError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={finalSrc}
              alt={`Desenho ${drawingId}`}
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-transform duration-500"
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-tertiary flex-col gap-2">
                <ImageOff size={32} strokeWidth={1.5} />
                <span className="text-[10px] font-bold uppercase">Img Indisponível</span>
            </div>
          )}
          
          <div className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-sm border border-border/50 px-3 py-1.5 rounded-lg shadow-sm">
             <span className="text-[9px] font-black text-secondary uppercase italic block leading-none mb-0.5">Drawing ID</span>
             <h3 className="text-sm font-black text-text-primary uppercase tracking-tighter leading-none">
               {drawingId}
             </h3>
          </div>
        </div>

        {/* INFO */}
        <div className="p-5 flex flex-col flex-1">
          {/* Produtos */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-text-tertiary">
              <Hash size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Produtos Relacionados</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {products?.split(';').map((cod, idx) => (
                <span key={idx} className="px-2 py-1 bg-bg border border-border rounded text-[9px] font-bold text-text-primary uppercase tracking-tighter hover:border-secondary/30 transition-colors cursor-default">
                  {cod.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Descrições */}
          <div className="flex-1 space-y-2 mb-6 border-t border-border/50 pt-4">
            <div className="flex items-center gap-2 text-text-tertiary">
              <AlignLeft size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Descrições Técnicas</span>
            </div>
            <div className="flex flex-col gap-2">
              {descriptions?.split(';').map((desc, idx) => (
                <p key={idx} className="text-[10px] text-text-tertiary font-bold uppercase leading-tight border-l-2 border-secondary/20 pl-2 line-clamp-2 hover:line-clamp-none transition-all">
                  {desc.trim()}
                </p>
              ))}
            </div>
          </div>

          {/* BOTÃO 'VER MAIS' (Menor e com novo texto) */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2 bg-secondary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-secondary-dark transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <Plus size={12} />
            Ver mais
          </button>
        </div>
      </div>

      <ProductDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        drawingId={drawingId}
        imageUrl={finalSrc}
        products={products}
        descriptions={descriptions}
        onSuccess={onRefresh}
      />
    </>
  );
};