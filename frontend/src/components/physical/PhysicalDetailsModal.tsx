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
  
  // Estado local para permitir a re-renderização imediata dos novos dados (Histórico)
  const [localItem, setLocalItem] = useState<any>(item);
  const [location, setLocation] = useState("");
  const [responsible, setResponsible] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (item) {
      setLocalItem(item);
      setLocation(item.location || "");
      setResponsible(item.responsible_person || "");
      setNotes(item.notes || "");
      setIsEditing(false);
      
      api.get("inventory/locations/").then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setLocations(data);
      }).catch(() => setLocations([]));
    }
  }, [item]);

  const selectedLocationObj = Array.isArray(locations) ? locations.find(l => l.name === location) : null;

  const handleUpdate = async () => {
    if (!localItem?.id) return;
    setLoading(true);
    try {
      const response = await inventoryService.update(localItem.id, { 
        location, 
        responsible_person: responsible, 
        notes 
      });
      
      addToast("Registro atualizado com sucesso!", "success");
      
      // Atualiza o estado interno com o objeto retornado pelo servidor (que já tem o novo histórico)
      setLocalItem(response.data);
      setIsEditing(false);
      
      // Notifica a lista externa para atualizar a tabela
      onRefresh();
    } catch (error) { 
      addToast("Erro ao atualizar registro.", "error"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async () => {
    if (!confirm("Deseja excluir permanentemente este registro?")) return;
    try {
      await inventoryService.delete(localItem.id);
      addToast("Registro removido.", "success");
      onClose();
      onRefresh();
    } catch { 
      addToast("Erro ao remover registro.", "error"); 
    }
  };

  if (!localItem) return null;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-card p-0 shadow-2xl border-border z-[9999]">
        {/* Header Detalhado */}
        <div className="p-8 border-b border-border bg-muted/20">
          <DialogHeader className="flex flex-row justify-between items-start">
            <div className="space-y-2">
              <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em]">Detalhes da Peça</p>
              <DialogTitle className="text-3xl font-black uppercase tracking-tighter">{localItem.product}</DialogTitle>
              <div className="flex gap-3 mt-4">
                <Badge variant="outline" className="font-mono text-[10px]">TRACKING: {localItem.tracking_code}</Badge>
                <Badge className="bg-primary font-black uppercase text-[10px]">{localItem.quantity} UNIDADES</Badge>
                {localItem.action_type && <Badge variant="secondary" className="font-black uppercase text-[10px]">{localItem.action_type}</Badge>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="font-bold">
                {isEditing ? <><X className="h-4 w-4 mr-2" /> Cancelar</> : <><Save className="h-4 w-4 mr-2" /> Editar Dados</>}
              </Button>
              <Button variant="outline" size="icon" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center border border-dashed border-border text-muted-foreground">
                  <ImageIcon className="h-6 w-6 mb-1 opacity-20" />
                  <span className="text-[8px] font-black uppercase">S/ Imagem</span>
                </div>
              ))}
            </div>
            
            <div className="p-6 rounded-2xl bg-muted/30 border border-border space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Localização & Responsável</p>
                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-primary">Localização</label>
                      <Select value={location} onValueChange={(val) => { setLocation(val); setResponsible(""); }}>
                        <SelectTrigger className="h-9 bg-background"><SelectValue placeholder="Selecionar Local" /></SelectTrigger>
                        <SelectContent>
                          {locations.map(l => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-primary">Responsável Autorizado</label>
                      <Select value={responsible} onValueChange={setResponsible} disabled={!location}>
                        <SelectTrigger className="h-9 bg-background"><SelectValue placeholder="Responsável" /></SelectTrigger>
                        <SelectContent>
                          {selectedLocationObj?.authorized_personnel?.map((p: string) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-black text-primary flex items-center gap-2 mt-2 uppercase"><MapPin className="h-4 w-4" /> {localItem.location}</p>
                    <p className="text-xs font-black flex items-center gap-2 uppercase"><User className="h-4 w-4" /> {localItem.responsible_person}</p>
                  </>
                )}
              </div>
            </div>
            <Button variant="secondary" className="w-full gap-2 font-black uppercase text-xs h-11 border border-border shadow-sm">
              <Paperclip className="h-4 w-4" /> Ver Anexos da NF
            </Button>
          </div>

          <div className="md:col-span-2 space-y-8">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase flex items-center gap-2 tracking-widest text-foreground">
                <Info className="h-4 w-4 text-primary" /> Observações do Registro
              </h4>
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[120px] bg-background" />
                  <Button className="w-full gradient-brand font-black uppercase h-11" onClick={handleUpdate} disabled={loading}>
                    {loading ? "Salvando..." : "Confirmar Alterações"}
                  </Button>
                </div>
              ) : (
                <p className="text-sm p-4 bg-muted/20 border border-dashed border-border rounded-lg italic leading-relaxed text-foreground/80">
                  {localItem.notes || "Nenhuma observação registrada."}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase flex items-center gap-2 text-muted-foreground tracking-widest">
                <History className="h-4 w-4" /> Histórico de Movimentação
              </h4>
              <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-2">
                {/* slice().reverse() para mostrar o mais recente no topo */}
                {localItem.movement_history?.slice().reverse().map((log: any, i: number) => (
                  <div key={i} className="text-[11px] p-4 bg-background rounded-xl border border-border flex justify-between items-center shadow-sm">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-4 items-center">
                        <span className="font-black text-primary uppercase">{log.location}</span>
                        <span className="text-muted-foreground font-medium uppercase">Resp: <span className="text-foreground font-black">{log.responsible}</span></span>
                      </div>
                      <span className="text-[9px] font-bold text-primary/60 uppercase italic">{log.action || "Movimentação"}</span>
                    </div>
                    <span className="opacity-60 font-mono text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}