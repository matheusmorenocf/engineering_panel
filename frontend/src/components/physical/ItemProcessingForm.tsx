/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { inventoryService } from "@/services/inventoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToastContext } from "@/contexts/ToastContext";
import { 
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Save, AlertCircle, Lock, Timer, 
  Package, MapPin, User, FileText, ImageIcon, 
  Calendar, Maximize2, X, Paperclip, ExternalLink
} from "lucide-react";
import { cn } from "@/libs/utils";

export function ItemProcessingForm({ data, onFinished }: { data: any; onFinished: () => void }) {
  const { addToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    reason: data.reason || "",
    observation: data.observation || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      addToast("O motivo é obrigatório", "error");
      return;
    }

    setLoading(true);
    try {
      await inventoryService.updateItemProcessing(data.id, {
        ...formData,
        status: "Concluído" 
      });
      addToast("Triagem enviada com sucesso!", "success");
      onFinished();
    } catch (err: any) {
      addToast("Erro ao salvar triagem", "error");
    } finally {
      setLoading(false);
    }
  };

  if (data.status === "Concluído") {
    return (
      <div className="bg-card border-2 border-primary/20 rounded-3xl p-12 shadow-sm flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95">
        <Lock className="h-12 w-12 text-primary mb-2" />
        <h2 className="text-2xl font-black uppercase tracking-tight">Triagem Finalizada</h2>
        <div className="p-6 bg-muted/50 rounded-2xl border text-left space-y-4 w-full max-w-md">
            <p className="text-sm font-bold uppercase"><span className="opacity-50 block text-[10px]">Motivo:</span> {data.reason}</p>
            <p className="text-sm text-muted-foreground"><span className="opacity-50 block text-[10px] font-black text-foreground">Obs:</span> {data.observation || "N/A"}</p>
        </div>
        <Button onClick={onFinished} variant="outline" className="mt-6 uppercase font-bold px-8">Voltar</Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b bg-muted/30">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em]">Dados do Material</p>
                  <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{data.product_name || "PRODUTO NÃO IDENTIFICADO"}</h2>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="outline" className="font-mono text-primary border-primary/20 bg-primary/5">{data.control_id}</Badge>
                    <Badge className="bg-foreground text-background font-black uppercase">NF {data.nf_number || "N/A"}</Badge>
                  </div>
                </div>
                <Package className="h-8 w-8 text-primary opacity-20 hidden md:block" />
             </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="grid grid-cols-2 gap-2">
                {[data.photo_top, data.photo_front, data.photo_side, data.photo_iso].map((src, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => src && setPreviewImage(src)}
                    className={cn(
                      "aspect-square bg-muted rounded-xl border border-border overflow-hidden relative group",
                      src ? "cursor-zoom-in" : ""
                    )}
                  >
                    {src ? (
                      <>
                        <img src={src} className="object-cover w-full h-full transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="text-white h-5 w-5" />
                        </div>
                      </>
                    ) : (
                      <ImageIcon className="opacity-10 h-6 w-6 absolute inset-0 m-auto" />
                    )}
                  </div>
                ))}
             </div>

             <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-muted/50 border space-y-3">
                   <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div>
                         <p className="text-[9px] font-black uppercase opacity-50">Localização</p>
                         <p className="text-xs font-bold uppercase">{data.location_name || "N/A"}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-primary" />
                      <div>
                         <p className="text-[9px] font-black uppercase opacity-50">Responsável Entrada</p>
                         <p className="text-xs font-bold uppercase">{data.responsible_name || "N/A"}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                         <p className="text-[9px] font-black uppercase opacity-50">Data</p>
                         <p className="text-xs font-bold uppercase">{data.receipt_date || "N/A"}</p>
                      </div>
                   </div>
                </div>
                
                <div className="p-4 rounded-2xl border border-dashed space-y-1">
                   <p className="text-[9px] font-black uppercase opacity-50">Notas de Entrada</p>
                   <p className="text-xs italic text-muted-foreground">{data.item_notes || "Sem observações."}</p>
                </div>

                {/* CORREÇÃO: Exibição da NF vindo diretamente de data.nf_file */}
                {data.nf_file && (
                  <Button asChild variant="outline" className="w-full font-black uppercase text-[10px] h-11 tracking-widest border-primary/20 hover:bg-primary/5 shadow-sm">
                    <a href={data.nf_file} target="_blank" rel="noreferrer">
                      <Paperclip className="h-4 w-4 mr-2" /> Ver Nota Fiscal Anexa
                    </a>
                  </Button>
                )}
             </div>
          </div>
        </div>

        <div className="bg-card p-8 border-primary/20 shadow-lg border-2 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <Timer className="h-6 w-6 text-primary" />
            <h3 className="font-black uppercase text-lg leading-none">Preencher Laudo de Triagem</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Motivo do Envio *</Label>
                <Input 
                  placeholder="EX: MANUTENÇÃO, REVISÃO..." 
                  className="h-12 font-bold uppercase"
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value.toUpperCase()})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Observações Técnicas</Label>
                <Textarea 
                  placeholder="Detalhes do serviço..." 
                  className="min-h-[100px] bg-muted/20"
                  value={formData.observation}
                  onChange={e => setFormData({...formData, observation: e.target.value})}
                />
              </div>
            </div>

            <Button type="submit" className="w-full gradient-brand h-14 font-black uppercase text-sm" disabled={loading}>
              {loading ? "Salvando..." : "Finalizar e Bloquear Triagem"}
            </Button>
          </form>
        </div>
      </div>

      {/* Lightbox de Imagem */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-none flex items-center justify-center z-[110] outline-none shadow-none">
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
    </>
  );
}