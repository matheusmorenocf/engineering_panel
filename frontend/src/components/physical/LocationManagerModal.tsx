import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
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
      setLocations(response.data);
    } catch (error) {
      addToast("Erro ao carregar localizações.", "error");
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
    let updatedList = [...loc.authorized_personnel];

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
      
      // Limpa o input específico deste local se for adição
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
            <MapPin className="h-5 w-5 text-primary" /> Gerenciar Parâmetros
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Adicionar Novo Local */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Nova Localização</label>
            <div className="flex gap-2">
              <Input 
                placeholder="Ex: ALMOXARIFADO CENTRAL" 
                value={newLocationName}
                onChange={e => setNewLocationName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddLocation()}
                className="h-11 font-bold"
              />
              <Button onClick={handleAddLocation} className="gradient-brand h-11 px-6 font-bold">
                <Plus className="h-5 w-5 mr-2" /> Adicionar
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <Users className="h-4 w-4" /> Locais e Responsáveis Autorizados
            </label>

            {loading && locations.length === 0 ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="grid gap-4">
                {locations.map(loc => (
                  <div key={loc.id} className="border border-border rounded-xl p-5 bg-muted/20 space-y-4 transition-all hover:border-primary/30">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-foreground uppercase tracking-tight">{loc.name}</h4>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
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
                        className="h-9 text-xs bg-background"
                      />
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handlePersonnelAction(loc, newPersonName[loc.id], 'add')}
                        className="h-9 px-3"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Lista de Responsáveis Autorizados (Array) */}
                    <div className="flex flex-wrap gap-2">
                      {loc.authorized_personnel.length > 0 ? (
                        loc.authorized_personnel.map((person, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="bg-background border border-border px-2 py-1 gap-1 text-[10px] font-black uppercase"
                          >
                            {person}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                              onClick={() => handlePersonnelAction(loc, person, 'remove')}
                            />
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Nenhum responsável autorizado para este local.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="font-bold">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}