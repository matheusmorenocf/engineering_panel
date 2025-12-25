import React, { useState, useEffect } from "react";
import { Plus, MapPin, Building2, Package, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "../ui/card";
import { inventoryService } from "@/services/inventoryService";
import { useToastContext } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/libs/api";

export function PhysicalEntryForm({ onSuccess }: { onSuccess: () => void }) {
  const { addToast } = useToastContext();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);

  const [sender, setSender] = useState("");
  const [clientName, setClientName] = useState("");
  const [nfNumber, setNfNumber] = useState("");
  const [purpose, setPurpose] = useState("");
  const [items, setItems] = useState<any[]>([
    { id: crypto.randomUUID(), partName: "", quantity: 1, location: "" }
  ]);

  useEffect(() => {
    api.get("inventory/locations/")
      .then(res => setLocations(res.data))
      .catch(() => addToast("Erro ao carregar locais", "error"));
  }, []);

  const handleFinalSubmit = async () => {
    if (items.some(i => !i.partName || !i.location)) {
      addToast("Preencha o nome da peça e o local para todos os itens.", "error");
      return;
    }

    setLoading(true);
    // Usando firstName e lastName conforme suas propriedades
    const currentResponsible = user ? `${user.firstName} ${user.lastName}`.trim() : "Sistema";
    
    const payload = items.map(item => ({
      product: item.partName,
      quantity: parseInt(item.quantity.toString()),
      location: item.location,
      responsible_person: currentResponsible,
      sender: sender,
      client_name: clientName,
      nf_number: nfNumber,
      action_type: purpose 
    }));

    try {
      await inventoryService.create(payload);
      addToast(`${items.length} item(ns) registrados com sucesso!`, "success");
      onSuccess();
    } catch (error) {
      addToast("Erro ao salvar registros no banco de dados.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <Card className="bg-primary/5 border-primary/20 shadow-none">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-primary">Remetente / Origem</label>
            <Input 
              className="bg-background h-10" 
              value={sender} 
              onChange={(e) => setSender(e.target.value)} 
              placeholder="Ex: Durit Brasil"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-primary">Responsável p/ Entrada</label>
            <Input 
              disabled 
              className="bg-muted h-10 font-bold" 
              value={user ? `${user.firstName} ${user.lastName}` : "Carregando..."} 
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-muted-foreground">Nota Fiscal</label>
          <Input placeholder="Nº da NF" value={nfNumber} onChange={(e) => setNfNumber(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-muted-foreground">Finalidade</label>
          <Input placeholder="Ex: Manutenção / Orçamento" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-black uppercase flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" /> Itens do Recebimento
        </label>
        
        {items.map((item, index) => (
          <div key={item.id} className="p-4 border rounded-xl bg-muted/30 space-y-4 relative">
             <div className="absolute -top-2 left-4 px-2 bg-background border rounded text-[9px] font-black text-primary">
               ITEM #{index + 1}
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input 
                  placeholder="Nome da Peça" 
                  value={item.partName} 
                  onChange={(e) => setItems(items.map(i => i.id === item.id ? {...i, partName: e.target.value} : i))} 
                />
                <Input 
                  type="number" 
                  placeholder="Qtd"
                  value={item.quantity} 
                  onChange={(e) => setItems(items.map(i => i.id === item.id ? {...i, quantity: e.target.value} : i))} 
                />
                <Select 
                  value={item.location} 
                  onValueChange={(val) => setItems(items.map(i => i.id === item.id ? {...i, location: val} : i))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Localização" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>

             {items.length > 1 && (
               <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive h-7 px-2 absolute -top-2 -right-2 bg-background border hover:bg-destructive/10"
                onClick={() => setItems(items.filter(i => i.id !== item.id))}
               >
                 Remover
               </Button>
             )}
          </div>
        ))}

        <Button 
          variant="outline" 
          className="w-full border-dashed" 
          onClick={() => setItems([...items, { id: crypto.randomUUID(), partName: "", quantity: 1, location: "" }])}
        >
          <Plus className="h-4 w-4 mr-2" /> Adicionar Outra Peça
        </Button>
      </div>

      <Button 
        className="w-full gradient-brand h-12 font-bold uppercase tracking-wider" 
        onClick={handleFinalSubmit} 
        disabled={loading}
      >
        {loading ? "Processando..." : "Confirmar e Gerar Rastreio"}
      </Button>
    </div>
  );
}