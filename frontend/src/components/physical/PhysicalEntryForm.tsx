import React, { useState, useEffect } from "react";
import { Plus, Trash2, Camera, Info, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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
    { id: crypto.randomUUID(), partName: "", quantity: 1, location: "", files: {} }
  ]);

  useEffect(() => {
    api.get("inventory/locations/").then(res => {
      setLocations(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    });
  }, []);

  const handleFileChange = (itemId: string, label: string, file: File | null) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, files: { ...item.files, [label]: file } } : item
    ));
  };

  const handleFinalSubmit = async () => {
    if (items.some(i => !i.partName || !i.location)) {
      addToast("Preencha todos os campos obrigatórios.", "error");
      return;
    }
    setLoading(true);

    try {
      const currentResponsible = user ? `${user.firstName || user.first_name || ""} ${user.lastName || user.last_name || ""}`.trim() : "Sistema";

      for (const item of items) {
        const formData = new FormData();
        formData.append('product', item.partName);
        formData.append('quantity', item.quantity.toString());
        formData.append('location', item.location);
        formData.append('responsible_person', currentResponsible);
        formData.append('sender', sender);
        formData.append('client_name', clientName);
        formData.append('nf_number', nfNumber);
        formData.append('action_type', purpose);
        formData.append('notes', generalNotes);
        
        if (user?.id) formData.append('created_by', user.id.toString());

        // IMPORTANTE: Enviar cada arquivo e tipo separadamente para o Django ler como lista
        Object.entries(item.files).forEach(([label, file]) => {
          if (file instanceof File) {
            formData.append('uploaded_attachments', file);
            formData.append('attachment_types', label);
          }
        });

        await api.post("inventory/physical-control/", formData);
      }

      addToast(`${items.length} item(ns) registados!`, "success");
      onSuccess();
    } catch (error) {
      console.error("Erro no upload:", error);
      addToast("Erro 400: Verifique os ficheiros ou dados enviados.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <Card className="bg-primary/5 border-primary/20 shadow-none">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-primary">Remetente</label>
            <Input className="bg-background h-10 font-bold" value={sender} onChange={(e) => setSender(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-primary">Responsável</label>
            <Input disabled className="bg-muted h-10 font-black" value={user ? `${user.firstName || user.first_name || ""} ${user.lastName || user.last_name || ""}` : "..."} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input placeholder="NF" className="font-bold" value={nfNumber} onChange={(e) => setNfNumber(e.target.value)} />
        <Input placeholder="Finalidade" className="font-bold" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        <Input placeholder="Cliente" className="font-bold" value={clientName} onChange={(e) => setClientName(e.target.value)} />
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={item.id} className="p-6 border rounded-2xl bg-muted/30 space-y-5 relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input className="md:col-span-2 bg-background font-bold" placeholder="Peça" value={item.partName} onChange={(e) => updateItem(item.id, "partName", e.target.value)} />
              <Input type="number" className="bg-background font-black" placeholder="Qtd" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", e.target.value)} />
              <Select value={item.location} onValueChange={(val) => updateItem(item.id, "location", val)}>
                <SelectTrigger className="bg-background font-bold"><SelectValue placeholder="Local" /></SelectTrigger>
                <SelectContent>{locations.map(loc => <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {["FRONTAL", "LATERAL", "SUPERIOR", "NF"].map(label => (
                <label key={label} className={`relative aspect-video border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${item.files[label] ? 'bg-primary/10 border-primary' : 'bg-background hover:bg-primary/5'}`}>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileChange(item.id, label, e.target.files?.[0] || null)} />
                  {item.files[label] ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Camera className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-[8px] font-black uppercase mt-1">{label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full border-dashed border-2 font-black" onClick={() => setItems([...items, { id: crypto.randomUUID(), partName: "", quantity: 1, location: "", files: {} }])}><Plus className="h-4 w-4 mr-2"/>Adicionar Item</Button>
      </div>

      <Textarea className="bg-background font-medium" placeholder="Notas gerais..." value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} />

      <Button className="w-full gradient-brand h-14 font-black uppercase" onClick={handleFinalSubmit} disabled={loading}>
        {loading ? "Processando..." : "Confirmar Entrada"}
      </Button>
    </div>
  );

  function updateItem(id: string, field: string, value: any) {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  }
}