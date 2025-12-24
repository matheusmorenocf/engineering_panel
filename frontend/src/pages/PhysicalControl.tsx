import React, { useState, useMemo } from "react";
import { 
  Plus, Search, MapPin, Package, History, LayoutGrid, List, 
  MoreHorizontal, User, HelpCircle, Eye, Link as LinkIcon, 
  FileText, ExternalLink, Calendar, Info, Columns, Box, 
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PhysicalEntryForm } from "@/components/physical/PhysicalEntryForm";
import { cn } from "@/libs/utils";
import { useToastContext } from "@/contexts/ToastContext";

export default function PhysicalControl() {
  const { addToast } = useToastContext();
  const [viewMode, setViewMode] = useState<"grouped" | "list" | "kanban">("grouped");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mockItems = [
    { 
      id: 1, part: "Eixo de Transmissão 45mm", nf: "NF-9082", qty: 12, loc: "PRATELEIRA A-04", 
      sender: "Transportadora TransLog", client: "Industrial S.A.", date: "2025-12-24",
      trackingCode: "XP-7721", reason: null, notes: "Item 1/2 da NF-9082. Embalagem ok.",
      photos: { frontal: "https://via.placeholder.com/300", superior: "https://via.placeholder.com/300", lateral: "https://via.placeholder.com/300", isometrica: "https://via.placeholder.com/300" }
    },
    { 
      id: 2, part: "Acoplamento Flexível AC-20", nf: "NF-9082", qty: 4, loc: "PALLET 02", 
      sender: "Transportadora TransLog", client: "Industrial S.A.", date: "2025-12-24",
      trackingCode: "AC-1190", reason: "Reforma Geral", notes: "Item 2/2 da NF-9082.",
      photos: { frontal: "https://via.placeholder.com/300", superior: "https://via.placeholder.com/300", lateral: "https://via.placeholder.com/300", isometrica: "https://via.placeholder.com/300" }
    },
    { 
      id: 3, part: "Vedações Viton G1/2", nf: "NF-8910", qty: 100, loc: "ALMOX-SUL", 
      sender: "Sedex (Correios)", client: "AgroForte Ltda", date: "2025-12-23",
      trackingCode: "SD-9921", reason: null, notes: "Carga individual.",
      photos: { frontal: "https://via.placeholder.com/300", superior: "https://via.placeholder.com/300", lateral: "https://via.placeholder.com/300", isometrica: "https://via.placeholder.com/300" }
    },
    { 
      id: 4, part: "Motor Elétrico 5cv - WEG", nf: "NF-9100", qty: 1, loc: "ÁREA DE TESTES", 
      sender: "Cliente Direto", client: "Moinho Central", date: "2025-12-24",
      trackingCode: "MOT-882", reason: "Análise de Garantia", notes: "Cheiro de queimado.",
      photos: { frontal: "https://via.placeholder.com/300", superior: "https://via.placeholder.com/300", lateral: "https://via.placeholder.com/300", isometrica: "https://via.placeholder.com/300" }
    }
  ];

  const groupedByNF = useMemo(() => {
    return mockItems.reduce((acc: any, item) => {
      if (!acc[item.nf]) acc[item.nf] = { nf: item.nf, sender: item.sender, client: item.client, date: item.date, products: [] };
      acc[item.nf].products.push(item);
      return acc;
    }, {});
  }, [mockItems]);

  const kanbanColumns = useMemo(() => {
    return mockItems.reduce((acc: any, item) => {
      if (!acc[item.loc]) acc[item.loc] = [];
      acc[item.loc].push(item);
      return acc;
    }, {});
  }, [mockItems]);

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/external/form/${code}`;
    navigator.clipboard.writeText(url);
    addToast("Link de formulário copiado!", "success");
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Controle Físico</h1>
          <p className="text-muted-foreground text-sm font-medium">Gestão de endereçamento e rastreabilidade.</p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-brand gap-2 h-11 px-6 shadow-glow text-primary-foreground font-bold border-none">
              <Plus className="h-5 w-5" /> Nova Entrada Física
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
            <DialogHeader><DialogTitle>Registrar Recebimento</DialogTitle></DialogHeader>
            <PhysicalEntryForm onSuccess={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 w-full text-foreground">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por NF, Remetente ou Produto..." 
            className="pl-10 h-11 bg-background border-input text-foreground" 
          />
        </div>
        <div className="flex bg-muted p-1 rounded-lg border border-border">
          <Button variant={viewMode === "grouped" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grouped")} className="h-9 px-3 gap-2">
            <LayoutGrid className="h-4 w-4" /> <span className="text-xs font-bold">Notas</span>
          </Button>
          <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-9 px-3 gap-2">
            <List className="h-4 w-4" /> <span className="text-xs font-bold">Lista</span>
          </Button>
          <Button variant={viewMode === "kanban" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("kanban")} className="h-9 px-3 gap-2">
            <Columns className="h-4 w-4" /> <span className="text-xs font-bold">Mapa</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
        {/* VIEW KANBAN */}
        {viewMode === "kanban" && (
          <div className="flex gap-6 h-full pb-4 overflow-x-auto">
            {Object.entries(kanbanColumns).map(([location, products]: any) => (
              <div key={location} className="w-80 flex-shrink-0 flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> {location}
                  </h3>
                  <Badge variant="secondary" className="font-black">
                    {products.length}
                  </Badge>
                </div>
                <div className="flex-1 space-y-4 p-4 rounded-2xl bg-muted/30 border border-dashed border-border overflow-y-auto max-h-[70vh]">
                  {products.map((p: any) => (
                    <Card key={p.id} className="bg-card text-card-foreground border border-border shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden" onClick={() => setSelectedItem(p)}>
                      <div className="aspect-video w-full overflow-hidden bg-muted relative">
                        <img src={p.photos.frontal} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-2 right-2"><Badge className="bg-foreground text-background border-none font-black text-[10px]">{p.qty} un</Badge></div>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <p className="text-xs font-black uppercase group-hover:text-primary transition-colors line-clamp-2">{p.part}</p>
                        <div className={cn("text-[9px] font-black uppercase p-2 rounded-lg text-center border shadow-inner", p.reason ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20")}>
                          {p.reason || "Aguardando Motivo"}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW AGRUPADA */}
        {viewMode === "grouped" && (
          <div className="space-y-6">
            {Object.values(groupedByNF).map((group: any) => (
              <Card key={group.nf} className="bg-card text-card-foreground border border-border shadow-md overflow-hidden">
                <div className="bg-muted/50 p-4 border-b border-border flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><FileText className="h-6 w-6" /></div>
                    <div>
                      <h2 className="text-lg font-black flex items-center gap-2">{group.nf} <Badge variant="outline" className="bg-background">{group.products.length} ITENS</Badge></h2>
                      <p className="text-[10px] text-muted-foreground font-black uppercase">DE: {group.sender} • {group.date}</p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Cliente Destino</p>
                    <p className="text-xs font-black flex items-center gap-1 justify-end"><Building2 className="h-3 w-3 text-primary" /> {group.client}</p>
                  </div>
                </div>
                <Table>
                  <TableBody>
                    {group.products.map((product: any) => (
                      <TableRow key={product.id} className="hover:bg-muted/30 cursor-pointer border-border" onClick={() => setSelectedItem(product)}>
                        <TableCell className="w-[80px]"><div className="h-12 w-12 rounded-lg overflow-hidden border border-border bg-muted"><img src={product.photos.frontal} className="h-full w-full object-cover" /></div></TableCell>
                        <TableCell><p className="font-black text-sm uppercase text-foreground line-clamp-1">{product.part}</p><p className="text-[10px] text-muted-foreground font-bold font-mono">ID: {product.trackingCode}</p></TableCell>
                        <TableCell><Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-black uppercase text-[10px]"><MapPin className="h-3 w-3 mr-1" /> {product.loc}</Badge></TableCell>
                        <TableCell className="text-right pr-6"><Button variant="ghost" size="icon" className="hover:text-primary"><Eye className="h-5 w-5" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ))}
          </div>
        )}

        {/* VIEW LISTA (ITEM A ITEM) CORRIGIDA */}
        {viewMode === "list" && (
          <Card className="bg-card text-card-foreground border border-border shadow-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50 border-b border-border">
                <TableRow>
                  <TableHead className="text-foreground font-black uppercase text-[11px] tracking-widest pl-6">Peça</TableHead>
                  <TableHead className="text-foreground font-black uppercase text-[11px] tracking-widest">NF</TableHead>
                  <TableHead className="text-foreground font-black uppercase text-[11px] tracking-widest text-center">Qtd</TableHead>
                  <TableHead className="text-foreground font-black uppercase text-[11px] tracking-widest">Localização</TableHead>
                  <TableHead className="text-right pr-6 text-foreground font-black uppercase text-[11px] tracking-widest">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 cursor-pointer border-border" onClick={() => setSelectedItem(item)}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3 py-1">
                        <img src={item.photos.frontal} className="h-10 w-10 rounded-lg object-cover border border-border shadow-sm" />
                        <div>
                          <p className="font-black text-sm uppercase text-foreground">{item.part}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">DE: {item.sender}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-muted-foreground">{item.nf}</TableCell>
                    <TableCell className="text-center font-black text-xs text-foreground">{item.qty}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-primary font-black border-primary/20 bg-primary/5 uppercase text-[10px]">
                        <MapPin className="h-3 w-3 mr-1" /> {item.loc}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Eye className="h-5 w-5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* MODAL DETALHES */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-card text-card-foreground border-border shadow-2xl p-0">
          {selectedItem && (
            <div className="space-y-0">
              <div className="p-8 border-b border-border bg-muted/20">
                <DialogHeader>
                  <div className="space-y-2 text-card-foreground">
                    <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em]">Entrada Física</p>
                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter line-clamp-2">{selectedItem.part}</DialogTitle>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <Badge variant="outline" className="font-mono text-xs border-border bg-background px-3 py-1 text-foreground">TRACKING: {selectedItem.trackingCode}</Badge>
                      <Badge className="bg-primary text-primary-foreground font-black px-3 py-1">{selectedItem.qty} UNIDADES</Badge>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border space-y-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest font-mono">Documentação</p>
                      <p className="font-black flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> {selectedItem.nf}</p>
                      <p className="text-xs font-bold text-muted-foreground"><Calendar className="h-4 w-4 inline mr-2" /> {selectedItem.date}</p>
                    </div>
                    <div className="space-y-1 pt-4 border-t border-border">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest font-mono">Localização</p>
                      <p className="font-black flex items-center gap-2 text-primary uppercase text-lg italic tracking-tight"><MapPin className="h-5 w-5" /> {selectedItem.loc}</p>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 space-y-4 shadow-inner">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Ações</p>
                    <div className="flex gap-2">
                      <Input readOnly value={selectedItem.trackingCode} className="bg-background border-border text-xs text-foreground font-bold h-9" />
                      <Button size="icon" onClick={() => copyLink(selectedItem.trackingCode)} className="h-9 w-9 shrink-0 shadow-md"><LinkIcon className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-8">
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selectedItem.photos).map(([key, src]: any) => (
                      <div key={key} className="aspect-square rounded-2xl border border-border overflow-hidden bg-muted group relative shadow-sm">
                        <div className="absolute top-3 left-3 z-10 bg-foreground/90 text-background px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest font-mono">Vista {key}</div>
                        <img src={src} className="h-full w-full object-cover group-hover:scale-110 transition-all duration-500" />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ExternalLink className="text-white h-6 w-6" /></div>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 rounded-2xl bg-muted/20 border border-border space-y-3 shadow-inner">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> Observações</h4>
                    <p className="text-sm font-bold leading-relaxed text-foreground">{selectedItem.notes || "Sem observações."}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}