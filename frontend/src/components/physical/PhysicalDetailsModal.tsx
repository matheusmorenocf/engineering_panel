/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  MapPin,
  Trash2,
  History,
  ImageIcon,
  Paperclip,
  Clock,
  User,
  Save,
  X,
  Maximize2,
  Loader2
} from "lucide-react";
import { inventoryService } from "@/services/inventoryService";
import { useToastContext } from "@/contexts/ToastContext";
import { cn } from "@/libs/utils";
import api from "@/libs/api";

export function PhysicalDetailsModal({ item, onClose, onRefresh }: { item: any; onClose: () => void; onRefresh: () => void }) {
  const { addToast } = useToastContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  const [localItem, setLocalItem] = useState<any>(item);
  const [editData, setEditData] = useState({
    location: "",
    notes: "",
  });

  useEffect(() => {
    if (item) {
      setLocalItem(item);
      setEditData({
        location: String(item.location || ""),
        notes: item.item_notes || "",
      });
      setIsEditing(false);

      api.get("physical-control/locations/").then(res => {
        setLocations(Array.isArray(res.data) ? res.data : res.data?.results || []);
      });
    }
  }, [item]);

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await inventoryService.deleteItem(localItem.id);
      addToast("Registro removido com sucesso", "success");
      onClose(); 
      onRefresh(); 
    } catch {
      addToast("Erro ao remover registro", "error");
    } finally {
      setLoading(false);
      setShowDeleteAlert(false);
    }
  };

  const confirmSave = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.updateItem(localItem.id, {
        location: editData.location,
        item_notes: editData.notes,
      });
      
      setLocalItem(response.data);
      setIsEditing(false); 
      setShowSaveAlert(false); 
      onRefresh(); 
      addToast("Alterações aplicadas com sucesso!", "success");
    } catch (error) {
      addToast("Erro ao atualizar dados. Verifique a conexão.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!localItem) return null;

  return (
    <>
      <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
          className="max-w-4xl max-h-[95vh] overflow-y-auto bg-card p-0 z-[50] custom-scrollbar border-none shadow-2xl"
          onPointerDownOutside={(e) => {
            if (showDeleteAlert || showSaveAlert || previewImage) e.preventDefault();
          }}
        >
          <div className="p-8 border-b bg-muted/30">
            <DialogHeader className="flex flex-row justify-between items-start">
              <div className="space-y-1">
                <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em]">Ficha de Rastreabilidade</p>
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter leading-none">
                  {localItem.product}
                </DialogTitle>
                <div className="flex gap-2 mt-4">
                  <Badge variant="outline" className="font-mono text-primary border-primary/20 bg-primary/5">{localItem.control_id}</Badge>
                  <Badge className="bg-foreground text-background font-black uppercase">{localItem.quantity} UNIDADES</Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn("font-bold uppercase text-[10px]", isEditing && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
                >
                  {isEditing ? <><X className="h-4 w-4 mr-2" /> Cancelar</> : <><Save className="h-4 w-4 mr-2" /> Editar</>}
                </Button>
                {!isEditing && (
                  <Button variant="outline" size="icon" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => setShowDeleteAlert(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </DialogHeader>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-2">
                {[localItem.photo_top, localItem.photo_front, localItem.photo_side, localItem.photo_iso].map((src, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => src && setPreviewImage(src)}
                    className={cn("aspect-square bg-muted rounded-xl flex items-center justify-center border border-border overflow-hidden shadow-inner group relative", src ? "cursor-zoom-in" : "")}
                  >
                    {src ? (
                      <>
                        <img src={src} alt="View" className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="text-white h-5 w-5" />
                        </div>
                      </>
                    ) : <ImageIcon className="opacity-10 h-8 w-8" />}
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Endereçamento</p>
                  {isEditing ? (
                    <Select value={editData.location} onValueChange={(val) => setEditData({ ...editData, location: val })}>
                      <SelectTrigger className="bg-background mt-2"><SelectValue placeholder="Selecione o local" /></SelectTrigger>
                      <SelectContent className="z-[100]">
                        {locations.map((loc) => <SelectItem key={loc.id} value={String(loc.id)}>{loc.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-black text-primary text-lg flex items-center gap-2 uppercase leading-none mt-1"><MapPin className="h-5 w-5" /> {localItem.location_name}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Responsável Atual</p>
                  <p className="font-bold text-foreground flex items-center gap-2 text-sm uppercase"><User className="h-4 w-4 opacity-40" /> {localItem.responsible_name}</p>
                </div>
              </div>

              {localItem.nf_file && (
                <Button asChild variant="outline" className="w-full font-black uppercase text-[10px] h-11 tracking-widest border-primary/20 hover:bg-primary/5">
                  <a href={localItem.nf_file} target="_blank" rel="noreferrer"><Paperclip className="h-4 w-4 mr-2" /> Download Nota Fiscal</a>
                </Button>
              )}
            </div>

            <div className="md:col-span-2 space-y-8">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase flex items-center gap-2 tracking-[0.2em] text-foreground"><FileText className="h-4 w-4 text-primary" /> Observações</h4>
                {isEditing ? (
                  <div className="space-y-4">
                    <Textarea 
                      value={editData.notes} 
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      className="min-h-[120px] bg-background"
                      placeholder="Adicione observações sobre a movimentação ou estado da peça..."
                    />
                    <Button className="w-full gradient-brand font-black uppercase text-xs h-12 shadow-glow" onClick={() => setShowSaveAlert(true)} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} 
                      Confirmar Alterações
                    </Button>
                  </div>
                ) : (
                  <div className="p-5 bg-muted/20 border border-border rounded-2xl text-sm italic leading-relaxed text-muted-foreground">
                    <p className="mb-2"><span className="not-italic font-black text-foreground mr-2 text-[10px] uppercase">Geral NF:</span> {localItem.nf_notes || "N/A"}</p>
                    <p><span className="not-italic font-black text-foreground mr-2 text-[10px] uppercase">Item:</span> {localItem.item_notes || "N/A"}</p>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase flex items-center gap-2 text-muted-foreground tracking-[0.2em]"><History className="h-4 w-4" /> Timeline de Movimentações</h4>
                  <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                    {localItem.movement_history?.slice().reverse().map((log: any, i: number) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary border-4 border-background" />
                        <div className="p-4 bg-background rounded-2xl border border-border shadow-sm flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-black uppercase text-primary">{log.location}</span>
                            <Badge variant="outline" className="text-[9px] font-mono opacity-60 flex gap-1 items-center"><Clock className="h-3 w-3" /> {log.date}</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-medium uppercase">{log.action} por <span className="text-foreground font-black">{log.responsible}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 1. Preview de Imagem (Lightbox) */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-none flex items-center justify-center z-[110] outline-none">
          <DialogTitle className="sr-only">Visualização de Imagem</DialogTitle>
          <div className="relative">
            <img src={previewImage!} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" alt="Preview" />
            <Button 
              onClick={() => setPreviewImage(null)}
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4 rounded-full shadow-2xl z-[120] h-10 w-10 border-2 border-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Confirmação Exclusão */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="z-[120]">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-black">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover o item <span className="font-bold">{localItem.control_id}</span>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold">
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 3. Confirmação Alteração */}
      <AlertDialog open={showSaveAlert} onOpenChange={setShowSaveAlert}>
        <AlertDialogContent className="z-[120]">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-black">Aplicar Alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Uma nova entrada será registrada no histórico com a nova localização e observações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">Revisar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSave} 
              className="gradient-brand text-white font-bold"
            >
              Confirmar e Salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}