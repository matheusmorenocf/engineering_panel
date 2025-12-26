/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhysicalEntryForm } from "@/components/physical/PhysicalEntryForm";
import { PhysicalDetailsModal } from "@/components/physical/PhysicalDetailsModal";
import { LocationManagerModal } from "@/components/physical/LocationManagerModal";
import { inventoryService } from "@/services/inventoryService";
import { useToastContext } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

// Novos Componentes
import { PhysicalHeader } from "@/components/physical/PhysicalHeader";
import { PhysicalControls } from "@/components/physical/PhysicalControls";
import { PhysicalWarehouseMap } from "@/components/physical/PhysicalWarehouseMap";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { MapPin, FileText, ImageIcon, Eye } from "lucide-react";

export default function PhysicalControl() {
  const { addToast } = useToastContext();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grouped" | "kanban" | "map">("grouped");
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
      addToast("Erro ao carregar inventário.", "error");
      setItems([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase();
    return items.filter(item => 
      String(item.product).toLowerCase().includes(term) ||
      (item.nf_number || "").toLowerCase().includes(term) ||
      (item.control_id || "").toLowerCase().includes(term)
    );
  }, [items, search]);

  const groupedByNF = useMemo(() => {
    return filteredItems.reduce((acc: any, item) => {
      const nf = item.nf_number || "SEM NF";
      if (!acc[nf]) acc[nf] = { nf, sender: item.sender, products: [] };
      acc[nf].products.push(item);
      return acc;
    }, {});
  }, [filteredItems]);

  const kanbanColumns = useMemo(() => {
    return filteredItems.reduce((acc: any, item) => {
      const loc = item.location_name || "NÃO ENDEREÇADO";
      if (!acc[loc]) acc[loc] = [];
      acc[loc].push(item);
      return acc;
    }, {});
  }, [filteredItems]);

  const warehouseMap = useMemo(() => {
    const map: any = {};
    filteredItems.forEach(item => {
      if (!item.physical_location) return;
      const parts = item.physical_location.split(/[^a-zA-Z0-9]+/).filter(Boolean);
      let closet, shelf, slot;
      if (parts.length >= 4 && parts[0].toLowerCase().includes("armario")) {
        closet = parts[1]; shelf = parts[2]; slot = parts[3].toUpperCase();
      } else if (parts.length >= 3) {
        closet = parts[0]; shelf = parts[1]; slot = parts[2].toUpperCase();
      } else return;
      if (!map[closet]) map[closet] = {};
      if (!map[closet][shelf]) map[closet][shelf] = {};
      if (!map[closet][shelf][slot]) map[closet][shelf][slot] = [];
      map[closet][shelf][slot].push(item);
    });
    return map;
  }, [filteredItems]);

  return (
    <div className="p-6 space-y-6 flex flex-col h-screen bg-background text-foreground">
      <PhysicalHeader onOpenForm={() => setIsFormOpen(true)} />
      
      <PhysicalControls 
        search={search}
        setSearch={setSearch}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isRefreshing={isRefreshing}
        onRefresh={fetchItems}
        onOpenLocationMgr={() => setIsLocationMgrOpen(true)}
        showAdminActions={!!(user?.isStaff || user?.isSuperuser)}
      />

      <div className="flex-1 overflow-auto custom-scrollbar pr-2">
        {viewMode === "map" && <PhysicalWarehouseMap warehouseMap={warehouseMap} onSelectItem={setSelectedItem} />}

        {viewMode === "kanban" && (
          <div className="flex gap-6 h-full pb-4 overflow-x-auto custom-scrollbar">
            {Object.entries(kanbanColumns).map(([location, products]: any) => (
              <div key={location} className="w-80 flex-shrink-0 flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black uppercase flex items-center gap-2 tracking-widest"><MapPin className="h-4 w-4 text-primary" /> {location}</h3>
                  <Badge variant="secondary" className="font-black">{products.length}</Badge>
                </div>
                <div className="flex-1 space-y-4 p-4 rounded-2xl bg-muted/30 border border-dashed overflow-y-auto max-h-[60vh] custom-scrollbar">
                  {products.map((p: any) => (
                    <Card key={p.id} className="bg-card border border-border shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedItem(p)}>
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                          {p.photo_top ? <img src={p.photo_top} className="object-cover w-full h-full" /> : <ImageIcon className="h-10 w-10" />}
                        </div>
                        <div className="absolute top-2 right-2"><Badge className="bg-foreground text-background font-black text-[10px]">{p.quantity} un</Badge></div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs font-black uppercase group-hover:text-primary transition-colors line-clamp-2">{p.product}</p>
                        <div className="mt-2 text-[9px] font-black uppercase p-1.5 rounded bg-warning/10 text-warning border border-warning/20 text-center font-mono">{p.control_id}</div>
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
                <div className="bg-muted/50 p-4 border-b flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-primary" />
                    <div><h2 className="text-lg font-black uppercase tracking-tight">NF: {group.nf}</h2><p className="text-[10px] text-muted-foreground font-black uppercase">Remetente: {group.sender || "N/A"}</p></div>
                  </div>
                </div>
                <Table>
                  <TableBody>
                    {group.products.map((product: any) => (
                      <TableRow key={product.id} className="hover:bg-muted/30 cursor-pointer border-border" onClick={() => setSelectedItem(product)}>
                        <TableCell className="w-[80px]">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {product.photo_top ? <img src={product.photo_top} className="object-cover h-full w-full" /> : <ImageIcon className="h-6 w-6 text-muted-foreground/20" />}
                          </div>
                        </TableCell>
                        <TableCell><p className="font-black text-sm uppercase line-clamp-1">{product.product}</p><p className="text-[10px] text-muted-foreground font-bold font-mono">ID: {product.control_id}</p></TableCell>
                        <TableCell><Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-black uppercase text-[10px]"><MapPin className="h-3 w-3 mr-1" /> {product.location_name}</Badge></TableCell>
                        <TableCell className="text-right pr-6"><Eye className="h-5 w-5 text-muted-foreground" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col z-[9999]" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="px-6 py-4 border-b"><DialogTitle className="uppercase font-black tracking-tight">Registrar Recebimento</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <PhysicalEntryForm onSuccess={() => { setIsFormOpen(false); fetchItems(); }} />
          </div>
        </DialogContent>
      </Dialog>

      <PhysicalDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} onRefresh={fetchItems} />
      <LocationManagerModal open={isLocationMgrOpen} onOpenChange={setIsLocationMgrOpen} />
    </div>
  );
}