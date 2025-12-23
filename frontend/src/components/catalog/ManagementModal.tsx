import React, { useState } from "react";
import { X, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";


interface ManagementModalProps {
  onClose: () => void;
  sectors: string[];
  types: string[];
}

export const ManagementModal = ({ onClose, sectors: initialSectors, types: initialTypes }: ManagementModalProps) {
  const [activeTab, setActiveTab] = useState<"sectors" | "types">("sectors");
  const [sectors, setSectors] = useState(initialSectors);
  const [types, setTypes] = useState(initialTypes);
  const [newSector, setNewSector] = useState("");
  const [newType, setNewType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { addToast } = useToastContext();

  const handleAddSector = async () => {
    if (!newSector.trim()) return;
    
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    
    setSectors([...sectors, newSector.toUpperCase().trim()]);
    setNewSector("");
    addToast("Setor adicionado com sucesso!", "success");
    setIsLoading(false);
  };

  const handleAddType = async () => {
    if (!newType.trim()) return;
    
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    
    setTypes([...types, newType.toUpperCase().trim()]);
    setNewType("");
    addToast("Tipo adicionado com sucesso!", "success");
    setIsLoading(false);
  };

  const handleDelete = async (item: string, type: "sector" | "type") => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    
    if (type === "sector") {
      setSectors(sectors.filter((s) => s !== item));
    } else {
      setTypes(types.filter((t) => t !== item));
    }
    
    setDeleteConfirm(null);
    addToast(`${type === "sector" ? "Setor" : "Tipo"} removido com sucesso!`, "success");
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="glass-panel rounded-2xl w-full max-w-lg overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Gerenciar Parâmetros
            </h2>
            <p className="text-sm text-muted-foreground">
              Adicione ou remova setores e tipos de produtos
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
          <div className="flex gap-1 -mb-px">
            <button
              onClick={() => setActiveTab("sectors")}
              className={`
                px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === "sectors"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }
              `}
            >
              Setores ({sectors.length})
            </button>
            <button
              onClick={() => setActiveTab("types")}
              className={`
                px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === "types"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }
              `}
            >
              Tipos ({types.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "sectors" && (
            <div className="space-y-4">
              {/* Add New */}
              <div className="flex gap-2">
                <Input
                  placeholder="Novo setor..."
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSector()}
                  className="flex-1"
                />
                <Button onClick={handleAddSector} disabled={isLoading || !newSector.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Adicionar
                </Button>
              </div>

              {/* List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sectors.map((sector) => (
                  <div
                    key={sector}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group"
                  >
                    <span className="font-medium text-foreground">{sector}</span>
                    
                    {deleteConfirm === sector ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-warning">Confirmar?</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(sector, "sector")}
                          disabled={isLoading}
                        >
                          Sim
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Não
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(sector)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-destructive transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "types" && (
            <div className="space-y-4">
              {/* Add New */}
              <div className="flex gap-2">
                <Input
                  placeholder="Novo tipo..."
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddType()}
                  className="flex-1"
                />
                <Button onClick={handleAddType} disabled={isLoading || !newType.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Adicionar
                </Button>
              </div>

              {/* List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {types.map((type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group"
                  >
                    <span className="font-medium text-foreground">{type}</span>
                    
                    {deleteConfirm === type ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-warning">Confirmar?</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(type, "type")}
                          disabled={isLoading}
                        >
                          Sim
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Não
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(type)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-destructive/10 text-destructive transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
