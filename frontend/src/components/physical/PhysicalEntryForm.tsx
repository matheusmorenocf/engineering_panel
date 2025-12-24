import React, { useState } from "react";
import { Camera, Plus, Trash2, Box, MapPin, FileText, History, User, Building2, HelpCircle, CheckCircle2, Paperclip, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "@/libs/utils";

interface ItemEntry {
  id: string;
  trackingCode: string;
  partName: string;
  quantity: number;
  location: string;
  // Agora suportamos 4 fotos específicas
  photos: {
    frontal: File | null;
    superior: File | null;
    lateral: File | null;
    detalhe: File | null;
  };
}

export function PhysicalEntryForm({ onSuccess }: { onSuccess: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [nfFile, setNfFile] = useState<File | null>(null);
  
  const [items, setItems] = useState<ItemEntry[]>([
    { 
      id: crypto.randomUUID(), 
      trackingCode: Math.random().toString(36).substring(2, 9).toUpperCase(), 
      partName: "", 
      quantity: 1, 
      location: "", 
      photos: { frontal: null, superior: null, lateral: null, detalhe: null } 
    }
  ]);

  const addItem = () => {
    setItems([...items, { 
      id: crypto.randomUUID(), 
      trackingCode: Math.random().toString(36).substring(2, 9).toUpperCase(),
      partName: "", 
      quantity: 1, 
      location: "", 
      photos: { frontal: null, superior: null, lateral: null, detalhe: null } 
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(i => i.id !== id));
  };

  const handleFinalSubmit = () => {
    setShowConfirm(false);
    onSuccess();
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Cabeçalho do Remetente */}
      <Card className="bg-primary/5 border-primary/20 shadow-none">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-primary flex items-center gap-1">
              <User className="h-3 w-3" /> Remetente (Quem enviou)
            </label>
            <Input placeholder="Nome da pessoa ou transportadora" className="bg-background h-10" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-primary flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Cliente (Opcional)
            </label>
            <Input placeholder="Empresa proprietária da peça" className="bg-background h-10" />
          </div>
        </CardContent>
      </Card>

      {/* Informações da Nota e Anexo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3" /> Número da NF
          </label>
          <Input placeholder="000.000.000" className="h-11" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-muted-foreground flex items-center gap-1">
            <History className="h-3 w-3" /> Data Recebimento
          </label>
          <Input type="date" className="h-11" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-muted-foreground flex items-center gap-1">
            <Paperclip className="h-3 w-3" /> Anexar NF (PDF/Imagem)
          </label>
          <div className="relative">
            <Input 
              type="file" 
              className="h-11 opacity-0 absolute z-10 cursor-pointer" 
              onChange={(e) => setNfFile(e.target.files?.[0] || null)}
            />
            <div className={cn(
              "h-11 border-2 border-dashed rounded-md flex items-center px-3 text-xs font-medium transition-colors",
              nfFile ? "border-emerald-500 bg-emerald-500/5 text-emerald-600" : "border-border bg-background text-muted-foreground"
            )}>
              {nfFile ? nfFile.name : "Clique para selecionar arquivo"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <label className="text-xs font-black uppercase text-muted-foreground">Itens Recebidos e Fotos Ortogonais</label>
          <Badge variant="secondary" className="text-[10px] uppercase font-bold">
            {items.length} {items.length === 1 ? 'Item' : 'Itens'}
          </Badge>
        </div>
        
        {items.map((item, index) => (
          <div key={item.id} className="p-5 border border-border rounded-xl bg-muted/30 space-y-5 relative animate-in slide-in-from-right-2">
            <div className="absolute -top-2 left-4 px-2 bg-background border rounded text-[9px] font-black text-primary flex items-center gap-1">
               CÓDIGO DE RASTREIO: {item.trackingCode}
            </div>

            <div className="flex flex-col space-y-4 pt-2">
              {/* Dados da Peça */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Input placeholder="Nome ou Código da Peça" className="h-10 bg-background" />
                </div>
                <div>
                  <Input type="number" placeholder="Quantidade" className="h-10 bg-background" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input placeholder="Localização" className="h-10 pl-10 bg-background border-primary/20" />
                </div>
              </div>

              {/* Grade de 4 Fotos Ortogonais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Frontal", key: "frontal" },
                  { label: "Superior", key: "superior" },
                  { label: "Lateral", key: "lateral" },
                  { label: "Isométrica", key: "detalhe" }
                ].map((pos) => (
                  <div key={pos.key} className="space-y-1.5">
                    <div className="w-full aspect-square bg-background border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors group relative overflow-hidden">
                      <Camera className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      <span className="text-[9px] font-black text-muted-foreground group-hover:text-primary uppercase tracking-tighter">
                        Vista {pos.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Motivo do Remetente (Visualização) */}
              <div className="relative">
                <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
                <Input 
                  disabled 
                  placeholder="Motivo do envio: Aguardando resposta do remetente..." 
                  className="h-10 pl-10 bg-muted/50 italic text-[11px] border-dashed" 
                />
              </div>

              {items.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeItem(item.id)} 
                  className="text-destructive hover:bg-destructive/10 w-fit self-end"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remover Peça
                </Button>
              )}
            </div>
          </div>
        ))}

        <Button variant="outline" type="button" onClick={addItem} className="w-full border-dashed border-2 h-12 gap-2 hover:bg-primary/5">
          <Plus className="h-4 w-4" /> Adicionar Outro Item à Nota
        </Button>
      </div>

      {/* Campo de Observação Geral */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" /> Observações Gerais de Recebimento
        </label>
        <Textarea 
          placeholder="Descreva detalhes como estado da embalagem, avarias visíveis ou urgências relatadas pelo transportador..." 
          className="bg-background min-h-[100px] border-border"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="ghost" className="flex-1 h-12" onClick={onSuccess}>Cancelar</Button>
        <Button className="flex-[2] h-12 gradient-brand shadow-glow font-bold uppercase" onClick={() => setShowConfirm(true)}>
          Inserir no Sistema
        </Button>
      </div>

      {/* POPUP DE CONFIRMAÇÃO */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 text-primary mb-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <AlertDialogTitle className="text-xl">Confirmar Entrada?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                Você está registrando <strong>{items.length} item(ns)</strong> da Nota Fiscal.
              </p>
              <div className="bg-muted p-3 rounded-lg text-xs space-y-2">
                <p className="flex items-center gap-2">✅ Fotos ortogonais processadas.</p>
                <p className="flex items-center gap-2">✅ NF vinculada ao registro.</p>
                <p className="flex items-center gap-2">📧 E-mail de motivo será disparado ao remetente.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Revisar</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalSubmit} className="gradient-brand border-none">
              Confirmar e Enviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}