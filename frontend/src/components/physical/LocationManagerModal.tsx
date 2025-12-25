import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogPortal,
  DialogOverlay
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  X, 
  UserPlus, 
  MapPin, 
  Users,
  Loader2
} from "lucide-react";
import api from "@/libs/api";
import { useToastContext } from "@/contexts/ToastContext";

interface Location {
  id: number;
  name: string;
  authorized_personnel: string[];
}

interface LocationManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationManagerModal({ open, onOpenChange }: LocationManagerModalProps) {
  const { addToast } = useToastContext();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [newPersonName, setNewPersonName] = useState<{ [key: number]: string }>({});

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await api.get("inventory/locations/");
      // Garante que os dados sejam um array
      const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      setLocations(data);
    } catch (error) {
      addToast("Erro ao carregar localizações.", "error");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchLocations();
  }, [open]);

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) return;
    try {
      await api.post("inventory/locations/", { 
        name: newLocationName.toUpperCase(), 
        authorized_personnel: [] 
      });
      setNewLocationName("");
      fetchLocations();
      addToast("Localização adicionada!", "success");
    } catch (error) {
      addToast("Erro ao adicionar localização.", "error");
    }
  };

  const handleDeleteLocation = async (id: number) => {
    if (!confirm("Deseja excluir esta localização e todos os seus responsáveis vinculados?")) return;
    try {
      await api.delete(`inventory/locations/${id}/`);
      fetchLocations();
      addToast("Localização removida.", "success");
    } catch (error) {
      addToast("Erro ao remover localização.", "error");
    }
  };

  const handlePersonnelAction = async (loc: Location, person: string, action: 'add' | 'remove') => {
    let updatedList = [...(loc.authorized_personnel || [])];

    if (action === 'add') {
      if (!person.trim() || updatedList.includes(person)) return;
      updatedList.push(person);
    } else {
      updatedList = updatedList.filter(p => p !== person);
    }

    try {
      await api.patch(`inventory/locations/${loc.id}/`, { 
        authorized_personnel: updatedList 
      });
      
      if (action === 'add') {
        setNewPersonName(prev => ({ ...prev, [loc.id]: "" }));
      }
      
      fetchLocations();
    } catch (error) {
      addToast("Erro ao atualizar responsáveis.", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[9998] bg-black/60 backdrop-blur-sm" />
        <DialogContent 
          className="max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar z-[9999] bg-card"
          onPointerDownOutside={(e) => e.preventDefault()} // Evita fechar ao clicar por erro de foco
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
              <MapPin className="h-5 w-5 text-primary" /> Gerenciar Parâmetros
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 py-4">
            {/* Adicionar Novo Local */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-primary tracking-widest">Nova Localização</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Ex: ALMOXARIFADO CENTRAL" 
                  value={newLocationName}
                  onChange={e => setNewLocationName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddLocation()}
                  className="h-11 font-bold bg-background border-primary/20"
                />
                <Button onClick={handleAddLocation} className="gradient-brand h-11 px-6 font-bold uppercase shadow-glow">
                  <Plus className="h-5 w-5 mr-2" /> Adicionar
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Users className="h-4 w-4" /> Locais e Responsáveis Autorizados
              </label>

              {loading && locations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Carregando Parâmetros...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {locations.map(loc => (
                    <div key={loc.id} className="border border-border rounded-2xl p-5 bg-muted/30 space-y-4 transition-all hover:border-primary/30 shadow-sm">
                      <div className="flex justify-between items-center">
                        <h4 className="font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          {loc.name}
                        </h4>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full"
                          onClick={() => handleDeleteLocation(loc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Adicionar Responsável à Localização */}
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Nome do Responsável Autorizado"
                          value={newPersonName[loc.id] || ""}
                          onChange={e => setNewPersonName(prev => ({ ...prev, [loc.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handlePersonnelAction(loc, newPersonName[loc.id], 'add')}
                          className="h-9 text-xs bg-background border-dashed border-primary/20"
                        />
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handlePersonnelAction(loc, newPersonName[loc.id], 'add')}
                          className="h-9 px-3 font-bold"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Lista de Responsáveis Autorizados */}
                      <div className="flex flex-wrap gap-2">
                        {loc.authorized_personnel && loc.authorized_personnel.length > 0 ? (
                          loc.authorized_personnel.map((person, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="bg-background border border-border px-2 py-1 gap-1 text-[10px] font-black uppercase hover:border-destructive/50 transition-colors"
                            >
                              {person}
                              <X 
                                className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive" 
                                onClick={() => handlePersonnelAction(loc, person, 'remove')}
                              />
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[9px] font-black uppercase text-muted-foreground/60 italic px-1">
                            Nenhum responsável autorizado para este local.
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {locations.length === 0 && !loading && (
                    <div className="text-center py-8 border border-dashed rounded-2xl opacity-50">
                      <p className="text-xs font-bold uppercase">Nenhuma localização cadastrada.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border mt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="font-black uppercase text-xs h-10">
              Fechar Parâmetros
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}