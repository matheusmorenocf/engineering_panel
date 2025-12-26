/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X, MapPin, Users, Loader2 } from "lucide-react";
import { inventoryService } from "@/services/inventoryService";
import { useToastContext } from "@/contexts/ToastContext";

export function LocationManagerModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { addToast } = useToastContext();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getLocations();
      setLocations(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch (error) {
      addToast("Erro ao carregar locais.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (open) fetchLocations(); }, [open]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await inventoryService.createLocation({ name: newName.toUpperCase(), responsibles: [] });
      setNewName("");
      fetchLocations();
      addToast("Local adicionado!", "success");
    } catch {
      addToast("Erro ao adicionar local.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este local?")) return;
    try {
      await inventoryService.deleteLocation(id);
      fetchLocations();
      addToast("Local removido.", "success");
    } catch {
      addToast("Erro ao remover.", "error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[9998] bg-black/60 backdrop-blur-sm" />
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto z-[9999] bg-card" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
              <MapPin className="h-5 w-5 text-primary" /> Gerenciar Locais
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 py-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-primary tracking-widest">Novo Local</label>
              <div className="flex gap-2">
                <Input placeholder="Ex: ALMOXARIFADO A" value={newName} onChange={e => setNewName(e.target.value)} className="h-11 font-bold" />
                <Button onClick={handleAdd} className="gradient-brand h-11 px-6 font-bold uppercase"><Plus className="mr-2 h-5 w-5" /> Adicionar</Button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2"><Users className="h-4 w-4" /> Locais Cadastrados</label>
              {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /> : (
                <div className="grid gap-3">
                  {locations.map(loc => (
                    <div key={loc.id} className="border p-4 rounded-xl flex justify-between items-center bg-muted/20">
                      <div>
                        <p className="font-black uppercase text-sm">{loc.name}</p>
                        <div className="flex gap-1 mt-1">
                          {loc.responsibles_details?.map((r: any) => (
                            <Badge key={r.id} variant="secondary" className="text-[9px]">{r.username}</Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(loc.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}