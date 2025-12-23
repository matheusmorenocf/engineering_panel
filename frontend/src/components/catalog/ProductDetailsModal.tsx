import React, { useState } from "react";
import { X, Image as ImageIcon, Package, FileText, Settings, DollarSign, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/contexts/ToastContext";

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

interface ProductDetailsModalProps {
  drawing: Drawing;
  onClose: () => void;
  sectors: string[];
  types: string[];
}

const tabs = [
  { id: "cadastrais", label: "Cadastrais", icon: Package },
  { id: "classificacao", label: "Classificação", icon: Settings },
  { id: "fabricacao", label: "Fabricação", icon: FileText },
  { id: "comercial", label: "Comercial", icon: DollarSign },
  { id: "desenho", label: "Desenho", icon: Pencil },
];

export default function ProductDetailsModal({ drawing, onClose, sectors, types }: ProductDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("cadastrais");
  const [selectedSector, setSelectedSector] = useState(drawing.sector);
  const [selectedType, setSelectedType] = useState(drawing.type);
  const { hasPermission } = useAuth();
  const { addToast } = useToastContext();

  const productList = drawing.products.split(";").map((p) => p.trim());
  const descriptionList = drawing.descriptions.split(";").map((d) => d.trim());

  const handleSaveClassification = () => {
    addToast("Classificação salva com sucesso!", "success");
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="glass-panel rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              {drawing.drawingId}
            </h2>
            <p className="text-muted-foreground">
              {drawing.items_count} produtos vinculados
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border px-6">
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }
                `}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "cadastrais" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image */}
              <div className="aspect-square rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                {drawing.imageUrl ? (
                  <img src={drawing.imageUrl} alt={drawing.drawingId} className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Imagem não disponível</p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Classificação Atual</h3>
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-primary/10 text-primary">
                      {drawing.sector}
                    </span>
                    <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-success/10 text-success">
                      {drawing.type}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Produtos ({productList.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {productList.map((product, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <span className="font-mono text-sm font-medium text-foreground">{product}</span>
                        {descriptionList[idx] && (
                          <span className="text-sm text-muted-foreground truncate">
                            - {descriptionList[idx]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "classificacao" && (
            <div className="space-y-6">
              <div className="glass-panel rounded-lg p-4 border border-primary/20 bg-primary/5">
                <h3 className="font-medium text-foreground mb-1">Vínculos Atuais</h3>
                <p className="text-sm text-muted-foreground">
                  Este desenho está classificado como <strong>{drawing.sector}</strong> / <strong>{drawing.type}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Setor</label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    disabled={!hasPermission("catalog.change_product")}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  >
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    disabled={!hasPermission("catalog.change_product")}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  >
                    {types.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {hasPermission("catalog.change_product") && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveClassification}>
                    <Plus className="h-4 w-4" />
                    Salvar Classificação
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === "fabricacao" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Em Desenvolvimento</h3>
              <p className="text-muted-foreground max-w-md">
                As informações de fabricação estarão disponíveis em breve, incluindo roteiros, tempos e custos de produção.
              </p>
            </div>
          )}

          {activeTab === "comercial" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Em Desenvolvimento</h3>
              <p className="text-muted-foreground max-w-md">
                As informações comerciais estarão disponíveis em breve, incluindo preços, margens e condições de venda.
              </p>
            </div>
          )}

          {activeTab === "desenho" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Pencil className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Em Desenvolvimento</h3>
              <p className="text-muted-foreground max-w-md">
                O histórico de revisões e arquivos técnicos estará disponível em breve.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
