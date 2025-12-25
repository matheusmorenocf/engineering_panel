import React, { useState, useMemo, useEffect } from "react";
import { 
  Plus, Search, MapPin, LayoutGrid, List, Columns, 
  Building2, FileText, Eye, RefreshCw, Settings, Image as ImageIcon 
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
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PhysicalEntryForm } from "@/components/physical/PhysicalEntryForm";
import { PhysicalDetailsModal } from "@/components/physical/PhysicalDetailsModal";
import { LocationManagerModal } from "@/components/physical/LocationManagerModal";

import { inventoryService } from "@/services/inventoryService";
import { useToastContext } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/libs/utils";

export default function PhysicalControl() {
  const { addToast } = useToastContext();
  const { user } = useAuth();
  
  // Estados de Visualização e Modais
  const [viewMode, setViewMode] = useState<"grouped" | "list" | "kanban">("grouped");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLocationMgrOpen, setIsLocationMgrOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchItems = async () => {
    setIsRefreshing(true);
    try {
      const response = await inventoryService.getAll();
      const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      setItems(data);
    } catch (error) {
      addToast("Erro ao carregar registros do inventário.", "error");
      setItems([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchItems(); 
  }, []);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const term = search.toLowerCase();
    return items.filter(item => {
      return (
        String(item.product).toLowerCase().includes(term) ||
        (item.nf_number || "").toLowerCase().includes(term) ||
        (item.tracking_code || "").toLowerCase().includes(term) ||
        (item.sender || "").toLowerCase().includes(term)
      );
    });
  }, [items, search]);

  const groupedByNF = useMemo(() => {
    return filteredItems.reduce((acc: any, item) => {
      const nf = item.nf_number || "SEM NOTA FISCAL";
      if (!acc[nf]) acc[nf] = { nf, sender: item.sender, client: item.client_name, products: [] };
      acc[nf].products.push(item);
      return acc;
    }, {});
  }, [filteredItems]);

  const kanbanColumns = useMemo(() => {
    return filteredItems.reduce((acc: any, item) => {
      const loc = item.location || "NÃO ENDEREÇADO";
      if (!acc[loc]) acc[loc] = [];
      acc[loc].push(item);
      return acc;
    }, {});
  }, [filteredItems]);

  return (
    <div className="p-6 space-y-6 flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Controle Físico</h1>
          <p className="text-muted-foreground text-sm font-medium">Gestão de endereçamento e rastreabilidade de peças.</p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-brand gap-2 font-bold border-none shadow-glow h-11 px-6">
              <Plus className="h-5 w-5" /> Nova Entrada Física
            </Button>
          </DialogTrigger>
          <DialogContent 
            onPointerDownOutside={(e) => e.preventDefault()} 
            className="max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle className="uppercase font-black">Registrar Recebimento</DialogTitle>
            </DialogHeader>
            <PhysicalEntryForm onSuccess={() => { setIsFormOpen(false); fetchItems(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 items-center bg-card p-4 rounded-xl border shadow-sm shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por NF, Peça ou Rastreio..." 
            className="pl-10 h-11 bg-background" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className={cn("h-11 w-11 transition-all", isRefreshing && "animate-spin text-primary")}
            onClick={fetchItems}
            disabled={isRefreshing}
            title="Sincronizar"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>

          {/* Verificação de permissão corrigida para as suas propriedades de User */}
          {(user?.isStaff || user?.isSuperuser) && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-11 w-11 border-primary/20 hover:bg-primary/5 text-primary" 
              onClick={() => setIsLocationMgrOpen(true)}
              title="Gerenciar Locais"
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}

          <div className="flex bg-muted p-1 rounded-lg border ml-2">
            <Button variant={viewMode === "grouped" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grouped")} className="h-9 px-3 gap-2">
              <LayoutGrid className="h-4 w-4" /> <span className="text-xs font-bold hidden sm:inline">Notas</span>
            </Button>
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-9 px-3 gap-2">
              <List className="h-4 w-4" /> <span className="text-xs font-bold hidden sm:inline">Lista</span>
            </Button>
            <Button variant={viewMode === "kanban" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("kanban")} className="h-9 px-3 gap-2">
              <Columns className="h-4 w-4" /> <span className="text-xs font-bold hidden sm:inline">Mapa</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid de Conteúdo */}
      <div className="flex-1 overflow-auto custom-scrollbar pr-2">
        {viewMode === "kanban" && (
          <div className="flex gap-6 h-full pb-4 overflow-x-auto custom-scrollbar">
            {Object.entries(kanbanColumns).map(([location, products]: any) => (
              <div key={location} className="w-80 flex-shrink-0 flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> {location}
                  </h3>
                  <Badge variant="secondary" className="font-black">{products.length}</Badge>
                </div>
                <div className="flex-1 space-y-4 p-4 rounded-2xl bg-muted/30 border border-dashed border-border overflow-y-auto max-h-[60vh] custom-scrollbar">
                  {products.map((p: any) => (
                    <Card 
                      key={p.id} 
                      className="bg-card border border-border shadow-sm hover:shadow-md transition-all cursor-pointer group" 
                      onClick={() => setSelectedItem(p)}
                    >
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                            <ImageIcon className="h-10 w-10" />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-foreground text-background font-black text-[10px]">{p.quantity} un</Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs font-black uppercase group-hover:text-primary transition-colors line-clamp-2">{p.product}</p>
                        <div className="mt-2 text-[9px] font-black uppercase p-1.5 rounded bg-warning/10 text-warning border border-warning/20 text-center">
                          {p.tracking_code}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "grouped" && (
          <div className="space-y-6">
            {Object.values(groupedByNF).map((group: any) => (
              <Card key={group.nf} className="bg-card border border-border shadow-md overflow-hidden">
                <div className="bg-muted/50 p-4 border-b border-border flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight">{group.nf}</h2>
                      <p className="text-[10px] text-muted-foreground font-black uppercase">Origem: {group.sender || "Não informado"}</p>
                    </div>
                  </div>
                </div>
                <Table>
                  <TableBody>
                    {group.products.map((product: any) => (
                      <TableRow 
                        key={product.id} 
                        className="hover:bg-muted/30 cursor-pointer border-border" 
                        onClick={() => setSelectedItem(product)}
                      >
                        <TableCell className="w-[80px]">
                          <div className="h-12 w-12 rounded-lg overflow-hidden border bg-muted flex items-center justify-center text-muted-foreground/20">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-black text-sm uppercase line-clamp-1">{product.product}</p>
                          <p className="text-[10px] text-muted-foreground font-bold font-mono">{product.tracking_code}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-black uppercase text-[10px]">
                            <MapPin className="h-3 w-3 mr-1" /> {product.location}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                           <Eye className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes - Abre quando selecionamos um item */}
      {selectedItem && (
        <PhysicalDetailsModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onRefresh={fetchItems} 
        />
      )}

      {/* Modal de Configurações de Localização */}
      <LocationManagerModal 
        open={isLocationMgrOpen} 
        onOpenChange={setIsLocationMgrOpen} 
      />
    </div>
  );
}