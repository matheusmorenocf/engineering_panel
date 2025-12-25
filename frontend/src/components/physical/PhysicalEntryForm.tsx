import React, { useState, useEffect } from "react";
import { Plus, Trash2, MapPin, Package, Camera, Info, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [generalNotes, setGeneralNotes] = useState("");
  const [items, setItems] = useState<any[]>([
    { id: crypto.randomUUID(), partName: "", quantity: 1, location: "" }
  ]);

  // Carregamento de localizações com tratamento de erro e formato de dados
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get("inventory/locations/");
        // Trata resposta direta ou paginada (comum no Django Rest Framework)
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        console.log("Localizações carregadas no EntryForm:", data);
        setLocations(data);
      } catch (error) {
        console.error("Erro ao buscar localizações no EntryForm:", error);
        addToast("Não foi possível carregar as localizações.", "error");
      }
    };

    fetchLocations();
  }, []);

  const handleFinalSubmit = async () => {
    if (items.some(i => !i.partName || !i.location)) {
      addToast("Preencha o nome da peça e a localização de todos os itens.", "error");
      return;
    }
    setLoading(true);
    
    // Fallback para nomes de usuários (firstName/lastName ou first_name/last_name)
    const currentResponsible = user 
      ? `${user.firstName || user.first_name || ""} ${user.lastName || user.last_name || ""}`.trim() 
      : "Sistema";

    const payload = items.map(item => ({
      product: item.partName,
      quantity: parseInt(item.quantity.toString()),
      location: item.location,
      responsible_person: currentResponsible,
      sender: sender,
      client_name: clientName,
      nf_number: nfNumber,
      action_type: purpose,
      notes: generalNotes
    }));

    try {
      await inventoryService.create(payload);
      addToast(`${items.length} item(ns) registrados com sucesso!`, "success");
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar entrada:", error);
      addToast("Erro ao processar entrada no servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), partName: "", quantity: 1, location: "" }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <Card className="bg-primary/5 border-primary/20 shadow-none overflow-hidden">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-primary tracking-widest">Remetente / Origem</label>
            <Input className="bg-background h-10 font-bold border-primary/10" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="Quem enviou?" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-primary tracking-widest">Responsável pela Entrada</label>
            <Input disabled className="bg-muted h-10 font-black border-dashed" value={user ? `${user.firstName || user.first_name || ""} ${user.lastName || user.last_name || ""}` : "Carregando..."} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-muted-foreground">Número da NF</label>
          <Input placeholder="000.000" className="h-11 font-bold" value={nfNumber} onChange={(e) => setNfNumber(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-muted-foreground">Finalidade do Envio</label>
          <Input placeholder="Ex: Orçamentação" className="h-11 font-bold" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-muted-foreground">Cliente / Dono</label>
          <Input placeholder="Opcional" className="h-11 font-bold" value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <label className="text-xs font-black uppercase text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Itens Recebidos
          </label>
          <Badge variant="secondary" className="font-black">{items.length} ITENS NA NF</Badge>
        </div>
        
        {items.map((item, index) => (
          <div key={item.id} className="p-6 border border-border rounded-2xl bg-muted/30 space-y-5 relative group">
             <div className="absolute -top-3 left-6 px-3 py-1 bg-background border border-border rounded-full text-[10px] font-black text-primary uppercase shadow-sm">
               Item #{index + 1}
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="md:col-span-2 space-y-1">
                  <Input placeholder="Nome da Peça" className="bg-background h-10 font-bold" value={item.partName} onChange={(e) => updateItem(item.id, "partName", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Input type="number" placeholder="Qtd" className="bg-background h-10 font-black" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", e.target.value)} />
                </div>
                <div className="space-y-1">
                  {/* Forçamos a re-renderização baseada no tamanho da lista de localizações */}
                  <Select 
                    key={`select-loc-${locations.length}-${index}`}
                    value={item.location} 
                    onValueChange={(val) => updateItem(item.id, "location", val)}
                  >
                    <SelectTrigger className="bg-background h-10 font-bold border-primary/20">
                      <SelectValue placeholder={locations.length > 0 ? "Localização" : "Carregando..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.length > 0 ? (
                        locations.map((loc: any) => (
                          <SelectItem key={loc.id} value={loc.name}>
                            {loc.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Nenhuma localização cadastrada</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
             </div>

             <div className="grid grid-cols-4 gap-2">
                {["Frontal", "Lateral", "Superior", "NF"].map(label => (
                  <div key={label} className="aspect-video bg-background border border-dashed border-border rounded-lg flex flex-col items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-[8px] font-black uppercase text-muted-foreground">{label}</span>
                  </div>
                ))}
             </div>

             {items.length > 1 && (
                <Button variant="ghost" size="sm" className="text-destructive h-8 px-3 font-black uppercase text-[10px] hover:bg-destructive/10" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-3 w-3 mr-2" /> Remover Item
                </Button>
             )}
          </div>
        ))}

        <Button variant="outline" className="w-full border-dashed border-2 h-12 font-black uppercase text-xs hover:bg-primary/5 transition-colors" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Outra Peça à Nota
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" /> Observações de Recebimento
        </label>
        <Textarea className="bg-background min-h-[100px] font-medium" placeholder="Descreva o estado das peças..." value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} />
      </div>

      <Button className="w-full gradient-brand h-14 font-black uppercase text-sm shadow-glow tracking-widest" onClick={handleFinalSubmit} disabled={loading}>
        {loading ? "Processando Registro..." : "Confirmar Recebimento e Gerar Rastreio"}
      </Button>
    </div>
  );
}