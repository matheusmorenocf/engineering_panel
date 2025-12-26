/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Camera, Upload, FileText, Calendar, Hash, X, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inventoryService, BatchEntryPayload } from "@/services/inventoryService";
import { useToastContext } from "@/contexts/ToastContext";
import { cn } from "@/libs/utils";

// --- SUBCOMPONENTE FILE DROPZONE (Inalterado) ---
function FileDropZone({ file, onChange, label, className, accept = "image/*,.pdf", heightClass = "h-full" }: any) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else { setPreviewUrl(null); }
  }, [file]);

  return (
    <div className={cn("relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/50 overflow-hidden", file ? "p-0 border-primary/30" : "p-2", heightClass, className)}>
      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => onChange(e.target.files?.[0] || null)} accept={accept} />
      {file ? (
        <div className="relative w-full h-full flex items-center justify-center">
          {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center"><FileText className="h-6 w-6 text-primary" /><span className="text-[8px] truncate max-w-[80px]">{file.name}</span></div>}
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange(null); }} className="absolute top-1 right-1 z-20 bg-destructive text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
        </div>
      ) : (
        <><Upload className="h-4 w-4 text-muted-foreground mb-1" /><span className="text-[10px] text-muted-foreground leading-tight">{label || "Upload"}</span></>
      )}
    </div>
  );
}

export function PhysicalEntryForm({ onSuccess }: { onSuccess: () => void }) {
  const { addToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);

  const [header, setHeader] = useState({
    nf_number: "",
    receipt_date: new Date().toISOString().split('T')[0],
    sender: "",
    general_notes: "",
    nf_file: null as File | null
  });

  const [items, setItems] = useState<any[]>([{
    id: '1', product: '', quantity: 1, location: '', notes: '',
    photo_top: null, photo_front: null, photo_side: null, photo_iso: null
  }]);

  useEffect(() => {
    inventoryService.getLocations().then(res => setLocations(res.data || []));
  }, []);

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!header.nf_file || !header.nf_number) {
      addToast("NF e Arquivo são obrigatórios", "error");
      return;
    }
    setLoading(true);
    try {
      await inventoryService.createBatch({ ...header, items } as BatchEntryPayload);
      addToast("Entrada registrada!", "success");
      onSuccess();
    } catch { addToast("Erro ao salvar", "error"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-4">
      <div className="bg-muted/40 p-5 rounded-2xl border space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Dados Gerais da NF</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5"><Label>Número da NF</Label><Input placeholder="000.000" value={header.nf_number} onChange={e => setHeader({...header, nf_number: e.target.value})} required /></div>
          <div className="space-y-1.5"><Label>Data Recebimento</Label><Input type="date" value={header.receipt_date} onChange={e => setHeader({...header, receipt_date: e.target.value})} required /></div>
          <div className="space-y-1.5"><Label>Anexo NF (PDF/IMG)</Label><FileDropZone file={header.nf_file} onChange={(f: any) => setHeader({...header, nf_file: f})} heightClass="h-[40px]" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Remetente/Fornecedor</Label><Input placeholder="Nome da empresa" value={header.sender} onChange={e => setHeader({...header, sender: e.target.value})} /></div>
          <div className="space-y-1.5"><Label>Observação Geral</Label><Input placeholder="Notas do lote" value={header.general_notes} onChange={e => setHeader({...header, general_notes: e.target.value})} /></div>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="border rounded-2xl p-5 bg-card shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-dashed">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Item #{index + 1}</span>
              {items.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-destructive h-7 px-2"><Trash2 className="h-3 w-3 mr-1" /> Remover</Button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label>Produto (Código/ID)</Label><Input value={item.product} onChange={e => updateItem(index, 'product', e.target.value)} required /></div>
              <div className="space-y-1.5"><Label>Qtd</Label><Input type="number" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} required /></div>
              <div className="space-y-1.5"><Label>Localização</Label>
                <Select value={item.location} onValueChange={v => updateItem(index, 'location', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{locations.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Observação do Item</Label><Input placeholder="Avarias, detalhes..." value={item.notes} onChange={e => updateItem(index, 'notes', e.target.value)} /></div>
            
            <div className="space-y-3 pt-2">
              <Label className="text-[10px] font-black uppercase flex items-center gap-2 text-primary"><Camera className="h-3 w-3" /> Fotos do Produto (Obrigatório 4 Vistas)</Label>
              <div className="grid grid-cols-4 gap-2 h-24">
                {['Superior', 'Frontal', 'Lateral', 'Isométrica'].map((label, idx) => {
                  const keys = ['photo_top', 'photo_front', 'photo_side', 'photo_iso'];
                  return <div key={label} className="space-y-1 h-full"><span className="text-[8px] font-black uppercase text-center block text-muted-foreground">{label}</span><FileDropZone file={item[keys[idx]]} onChange={(f: any) => updateItem(index, keys[idx], f)} /></div>
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t sticky bottom-0 bg-background pb-2">
        <Button type="button" variant="outline" onClick={() => setItems([...items, { id: Math.random().toString(), product: '', quantity: 1, location: '', notes: '', photo_top: null, photo_front: null, photo_side: null, photo_iso: null }])} className="font-bold border-primary/40 text-primary uppercase text-xs h-11">+ Item na mesma NF</Button>
        <Button type="submit" disabled={loading} className="gradient-brand px-8 font-black uppercase h-11 shadow-glow">{loading ? "Processando..." : "Finalizar Entrada"}</Button>
      </div>
    </form>
  );
}