/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhysicalEntryForm } from "@/components/physical/PhysicalEntryForm";
import { PhysicalDetailsModal } from "@/components/physical/PhysicalDetailsModal";
import { LocationManagerModal } from "@/components/physical/LocationManagerModal";
import { inventoryService } from "@/services/inventoryService";
import { useToastContext } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

import { PhysicalHeader } from "@/components/physical/PhysicalHeader";
import { PhysicalControls } from "@/components/physical/PhysicalControls";
import { PhysicalWarehouseMap } from "@/components/physical/PhysicalWarehouseMap";
import { PhysicalGroupedView } from "@/components/physical/PhysicalGroupedView";
import { PhysicalKanbanView } from "@/components/physical/PhysicalKanbanView";

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
      String(item.product || "").toLowerCase().includes(term) ||
      String(item.nf_number || "").toLowerCase().includes(term) ||
      String(item.control_id || "").toLowerCase().includes(term) ||
      String(item.customer || "").toLowerCase().includes(term)
    );
  }, [items, search]);

  const warehouseMap = useMemo(() => {
    const map: any = {};
    filteredItems.forEach(item => {
      if (!item.physical_location || !item.physical_location.includes('-')) return;

      const parts = item.physical_location.split('-').map((s: string) => s.trim());
      
      // Validação Estrita: Só cria se tiver Unidade, Prateleira e Slot preenchidos
      if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
        const unit = parts[0]; 
        const shelf = parts[1];
        const slot = parts[2].toUpperCase();

        if (!map[unit]) map[unit] = {};
        if (!map[unit][shelf]) map[unit][shelf] = {};
        if (!map[unit][shelf][slot]) map[unit][shelf][slot] = [];
        map[unit][shelf][slot].push(item);
      }
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
        {viewMode === "map" && (
          <PhysicalWarehouseMap warehouseMap={warehouseMap} onSelectItem={setSelectedItem} />
        )}

        {viewMode === "kanban" && (
          <PhysicalKanbanView items={filteredItems} onSelectItem={setSelectedItem} />
        )}

        {viewMode === "grouped" && (
          <PhysicalGroupedView items={filteredItems} onSelectItem={setSelectedItem} />
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col z-[9999]">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="uppercase font-black tracking-tight">Registrar Recebimento</DialogTitle>
          </DialogHeader>
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