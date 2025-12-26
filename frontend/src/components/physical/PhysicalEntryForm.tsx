/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Camera, Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inventoryService, BatchEntryPayload } from "@/services/inventoryService";
import { useToastContext } from "@/contexts/ToastContext";
import { cn } from "@/libs/utils";

// --- SUBCOMPONENTE FILE DROPZONE ---
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
    <div className={cn(
      "relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/50 overflow-hidden transition-all",
      file ? "border-primary/50 bg-primary/5" : "border-muted-foreground/20 p-2",
      heightClass,
      className
    )}>
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        onChange={(e) => onChange(e.target.files?.[0] || null)} 
        accept={accept} 
      />
      
      {file ? (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-background">
          {previewUrl ? (
            <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <div className="flex flex-col items-center p-1">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-[7px] truncate max-w-[60px] mt-1 uppercase font-bold">{file.name}</span>
            </div>
          )}
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); onChange(null); }} 
            className="absolute top-1 right-1 z-20 bg-destructive text-white rounded-full p-0.5 shadow-lg hover:scale-110 transition-transform"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Upload className="h-4 w-4 text-muted-foreground/60 mb-1" />
          <span className="text-[9px] font-bold text-muted-foreground/60 uppercase leading-tight">{label || "Upload"}</span>
        </div>
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
    customer: "", // Campo Cliente
    general_notes: "",
    nf_file: null as File | null
  });

  const [items, setItems] = useState<any[]>([{
    id: '1', product: '', quantity: 1, location: '', 
    selected_closet: '', row: '', column: '', 
    physical_location: '', notes: '',
    photo_top: null, photo_front: null, photo_side: null, photo_iso: null
  }]);

  useEffect(() => {
    inventoryService.getLocations().then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setLocations(data);
    });
  }, []);

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (['selected_closet', 'row', 'column'].includes(field)) {
      const current = newItems[index];
      const closet = field === 'selected_closet' ? value : current.selected_closet;
      const row = field === 'row' ? value : current.row;
      const col = field === 'column' ? value : current.column;
      
      if (closet && row && col) {
        newItems[index].physical_location = `${closet}-${row}-${col.toUpperCase()}`;
      } else {
        newItems[index].physical_location = closet || '';
      }
    }

    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalNfNumber = header.nf_number.trim() || "S/NF";
    
    setLoading(true);
    try {
      // Garantindo que todos os campos do header, incluindo customer, sejam enviados
      const payload: BatchEntryPayload = {
        nf_number: finalNfNumber,
        receipt_date: header.receipt_date,
        sender: header.sender,
        customer: header.customer, // Explicitamente adicionado para segurança
        general_notes: header.general_notes,
        nf_file: header.nf_file,
        items: items
      };

      await inventoryService.createBatch(payload);
      addToast("Entrada registrada com sucesso!", "success");
      onSuccess();
    } catch { 
        addToast("Erro ao salvar entrada. Verifique os dados.", "error"); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative space-y-6 pb-20">
      <div className="bg-muted/40 p-5 rounded-2xl border border-dashed space-y-4">
        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <FileText className="w-3 h-3" /> Dados do Recebimento (NF Opcional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold opacity-70">Número da NF</Label>
            <Input placeholder="S/NF" value={header.nf_number} onChange={e => setHeader({...header, nf_number: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold opacity-70">Data Recebimento</Label>
            <Input type="date" value={header.receipt_date} onChange={e => setHeader({...header, receipt_date: e.target.value})} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold opacity-70">Cliente (Opcional)</Label>
            <Input 
              placeholder="Nome do Cliente" 
              value={header.customer} 
              onChange={e => setHeader({...header, customer: e.target.value})} 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold opacity-70">Anexo NF</Label>
            <FileDropZone file={header.nf_file} onChange={(f: any) => setHeader({...header, nf_file: f})} heightClass="h-10" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold opacity-70">Remetente/Fornecedor</Label><Input placeholder="Nome da empresa" value={header.sender} onChange={e => setHeader({...header, sender: e.target.value})} /></div>
          <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold opacity-70">Observação Geral</Label><Input placeholder="Notas do lote" value={header.general_notes} onChange={e => setHeader({...header, general_notes: e.target.value})} /></div>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const selectedLoc = locations.find(l => String(l.id) === item.location);
          const availableClosets = selectedLoc?.physical_structure || [];

          return (
            <div key={item.id} className="border rounded-2xl p-5 bg-card shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center pb-2 border-b border-dashed">
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Item {index + 1}</span>
                {items.length > 1 && (
                  <Button type="button" variant="ghost" onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-destructive h-6 px-2 text-[10px] uppercase font-black hover:bg-destructive/10">
                    <Trash2 className="h-3 w-3 mr-1" /> Remover
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold opacity-70">Produto (Código/ID)</Label><Input value={item.product} onChange={e => updateItem(index, 'product', e.target.value)} required /></div>
                <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold opacity-70">Qtd</Label><Input type="number" min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} required /></div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold opacity-70">Depósito/Local</Label>
                  <Select value={item.location} onValueChange={v => updateItem(index, 'location', v)} required>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent className="z-[9999]">{locations.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 p-3 rounded-xl border border-dashed">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold opacity-70">Armário / Volume</Label>
                  <Select 
                    disabled={!item.location} 
                    value={item.selected_closet} 
                    onValueChange={v => updateItem(index, 'selected_closet', v)}
                  >
                    <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent className="z-[9999]">
                      {availableClosets.map((c: any) => (
                        <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold opacity-70">Linha</Label>
                    <Input 
                      type="number" 
                      placeholder="0"
                      value={item.row} 
                      onChange={e => updateItem(index, 'row', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold opacity-70">Coluna</Label>
                    <Input 
                      placeholder="A, B..." 
                      maxLength={1}
                      className="uppercase"
                      value={item.column} 
                      onChange={e => updateItem(index, 'column', e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                   <Label className="text-[10px] uppercase font-bold opacity-40 italic">Padrão do Sistema</Label>
                   <div className="h-10 flex items-center px-3 bg-muted rounded border font-mono text-xs font-bold text-primary">
                    {item.physical_location || "Selecione a posição..."}
                   </div>
                </div>
              </div>

              <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold opacity-70">Observação do Item</Label><Input placeholder="Avarias, detalhes..." value={item.notes} onChange={e => updateItem(index, 'notes', e.target.value)} /></div>
              
              <div className="space-y-3 pt-2">
                <Label className="text-[9px] font-black uppercase flex items-center gap-2 text-primary tracking-tighter">
                  <Camera className="h-3 w-3" /> Fotos do Produto (4 Vistas Obrigatórias)
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {['Superior', 'Frontal', 'Lateral', 'Iso'].map((label, idx) => {
                    const keys = ['photo_top', 'photo_front', 'photo_side', 'photo_iso'];
                    return (
                      <div key={label} className="space-y-1 flex flex-col">
                        <span className="text-[7px] font-black uppercase text-center text-muted-foreground">{label}</span>
                        <FileDropZone 
                          file={item[keys[idx]]} 
                          onChange={(f: any) => updateItem(index, keys[idx], f)} 
                          heightClass="aspect-square h-auto w-full" 
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed md:absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t flex justify-between gap-4 z-30">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setItems([...items, { id: Math.random().toString(), product: '', quantity: 1, location: '', selected_closet: '', row: '', column: '', physical_location: '', notes: '', photo_top: null, photo_front: null, photo_side: null, photo_iso: null }])} 
          className="font-black border-primary/20 text-primary uppercase text-[10px] h-11 tracking-widest bg-background"
        >
          <Plus className="w-4 h-4 mr-2" /> Item na mesma NF
        </Button>
        <Button 
          type="submit" 
          disabled={loading} 
          className="gradient-brand px-10 font-black uppercase h-11 shadow-glow tracking-widest flex-1 md:flex-none"
        >
          {loading ? "Processando..." : "Finalizar Entrada"}
        </Button>
      </div>
    </form>
  );
}