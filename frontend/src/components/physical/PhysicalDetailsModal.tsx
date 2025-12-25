import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, MapPin, Info, Trash2, User, Save, X, History, Image as ImageIcon, Paperclip } from "lucide-react";
import { inventoryService } from "@/services/inventoryService";
import { useToastContext } from "@/contexts/ToastContext";
import api from "@/libs/api";

export function PhysicalDetailsModal({ item, onClose, onRefresh }: { item: any; onClose: () => void; onRefresh: () => void }) {
  const { addToast } = useToastContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  
  const [location, setLocation] = useState("");
  const [responsible, setResponsible] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (item) {
      setLocation(item.location || "");
      setResponsible(item.responsible_person || "");
      setNotes(item.notes || "");
      api.get("inventory/locations/").then(res => setLocations(res.data));
    }
  }, [item]);

  const selectedLocationObj = locations.find(l => l.name === location);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await inventoryService.update(item.id, { location, responsible_person: responsible, notes });
      addToast("Sucesso!", "success");
      setIsEditing(false);
      onRefresh();
    } catch { addToast("Erro", "error"); }
    finally { setLoading(false); }
  };

  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-card p-0">
        <div className="p-8 border-b bg-muted/20 flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-primary font-black uppercase text-[10px]">Controle Físico</p>
            <DialogTitle className="text-3xl font-black uppercase">{item.product}</DialogTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>{isEditing ? "Cancelar" : "Editar"}</Button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-muted/30 border space-y-4">
              <p className="text-[10px] font-black uppercase">Localização & Responsável</p>
              {isEditing ? (
                <div className="space-y-3">
                  <Select value={location} onValueChange={(val) => { setLocation(val); setResponsible(""); }}>
                    <SelectTrigger className="h-9 bg-background"><SelectValue placeholder="Local" /></SelectTrigger>
                    <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={responsible} onValueChange={setResponsible} disabled={!location}>
                    <SelectTrigger className="h-9 bg-background"><SelectValue placeholder="Responsável" /></SelectTrigger>
                    <SelectContent>
                      {selectedLocationObj?.authorized_personnel.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  <p className="font-black text-primary flex items-center gap-2"><MapPin className="h-4 w-4" /> {item.location}</p>
                  <p className="text-xs font-black flex items-center gap-2"><User className="h-4 w-4" /> {item.responsible_person}</p>
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> Observações</h4>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                <Button className="w-full gradient-brand" onClick={handleUpdate} disabled={loading}>Salvar</Button>
              </div>
            ) : (
              <p className="text-sm p-4 bg-muted/20 border border-dashed rounded-lg italic">{item.notes || "Sem obs."}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}