import React from "react";
import { Image as ImageIcon, Package, ChevronRight } from "lucide-react";

interface Drawing {
  id: string;
  drawingId: string;
  sector: string;
  type: string;
  items_count: number;
  products: string;
  descriptions: string;
  imageUrl: string | null;
}

interface DrawingCardProps {
  drawing: Drawing;
  viewMode: "grid" | "list";
  onClick: () => void;
  style?: React.CSSProperties;
}

export const DrawingCard = ({ drawing, viewMode, onClick, style }: DrawingCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={onClick}
        className="glass-panel rounded-lg p-4 flex items-center gap-4 cursor-pointer hover-lift animate-slide-up group"
        style={style}
      >
        {/* Image */}
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {drawing.imageUrl ? (
            <img src={drawing.imageUrl} alt={drawing.drawingId} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-foreground">{drawing.drawingId}</span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
              {drawing.sector}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-success/10 text-success">
              {drawing.type}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {truncateText(drawing.descriptions, 80)}
          </p>
        </div>

        {/* Count & Arrow */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">{drawing.items_count}</p>
            <p className="text-xs text-muted-foreground">produtos</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="glass-panel rounded-xl overflow-hidden cursor-pointer hover-lift animate-slide-up group"
      style={style}
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {drawing.imageUrl ? (
          <img
            src={drawing.imageUrl}
            alt={drawing.drawingId}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sem imagem</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-primary/90 text-primary-foreground backdrop-blur-sm">
            {drawing.sector}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-success/90 text-success-foreground backdrop-blur-sm">
            {drawing.type}
          </span>
        </div>

        {/* Item Count */}
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-card/90 text-foreground backdrop-blur-sm">
            <Package className="h-3 w-3" />
            {drawing.items_count}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-mono font-bold text-lg text-foreground">{drawing.drawingId}</h3>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Produtos</p>
            <p className="text-sm text-foreground truncate">{truncateText(drawing.products, 40)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Descrições</p>
            <p className="text-sm text-foreground line-clamp-2">
              {truncateText(drawing.descriptions, 60)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <span className="text-sm text-primary font-medium group-hover:underline">
            Ver detalhes →
          </span>
        </div>
      </div>
    </div>
  );
}
