/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from "react";
import { Building2, MapPinned, ChevronDown, Filter } from "lucide-react";
import { cn } from "@/libs/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface PhysicalWarehouseMapProps {
  warehouseMap: any;
  onSelectItem: (item: any) => void;
}

export function PhysicalWarehouseMap({ warehouseMap, onSelectItem }: PhysicalWarehouseMapProps) {
  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    Object.values(warehouseMap).forEach((shelves: any) => {
      Object.values(shelves).forEach((slots: any) => {
        Object.values(slots).forEach((items: any) => {
          items.forEach((item: any) => {
            if (item.location_name) locs.add(item.location_name);
          });
        });
      });
    });
    return Array.from(locs).sort();
  }, [warehouseMap]);

  const [selectedLocation, setSelectedLocation] = useState<string>("");

  useEffect(() => {
    if (!selectedLocation && availableLocations.length > 0) {
      const defaultLoc = availableLocations.find(l => l.toUpperCase() === "CONTROLE FÍSICO");
      setSelectedLocation(defaultLoc || availableLocations[0]);
    }
  }, [availableLocations, selectedLocation]);

  const sortedFilteredUnits = useMemo(() => {
    if (!selectedLocation) return [];
    const units: any[] = [];

    Object.entries(warehouseMap).forEach(([unitName, shelves]: [string, any]) => {
      const filteredShelves: any = {};
      let hasItemsInUnit = false;

      Object.entries(shelves).forEach(([shelfNum, slots]: [string, any]) => {
        const filteredSlots: any = {};
        Object.entries(slots).forEach(([slotLetter, items]: [string, any]) => {
          const itemsOfSelectedLocation = items.filter(
            (item: any) => item.location_name === selectedLocation
          );
          if (itemsOfSelectedLocation.length > 0) {
            filteredSlots[slotLetter] = itemsOfSelectedLocation;
            hasItemsInUnit = true;
          }
        });
        if (Object.keys(filteredSlots).length > 0) filteredShelves[shelfNum] = filteredSlots;
      });

      if (hasItemsInUnit) units.push({ name: unitName, shelves: filteredShelves });
    });

    return units.sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [warehouseMap, selectedLocation]);

  // Função para determinar as classes de cor do slot baseado na ocupação
  const getSlotStatusClasses = (itemCount: number) => {
    if (itemCount === 0) {
      // VAZIO: Verde
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
    } else if (itemCount < 6) {
      // PARCIAL: Azul
      return "bg-blue-500/20 border-blue-500/40 cursor-pointer hover:border-blue-500 hover:shadow-md";
    } else {
      // LOTADO: Amarelo
      return "bg-amber-400/80 border-amber-600 dark:bg-amber-500 dark:border-amber-400 cursor-pointer hover:border-amber-400 hover:shadow-md";
    }
  };

  // Função para determinar as cores das peças (mini quadrados) dentro do slot
  const getItemColorClasses = (isOccupied: boolean, slotCount: number) => {
    if (!isOccupied) return "bg-emerald-500/5 border border-emerald-500/5";
    if (slotCount >= 6) return "bg-amber-900/40 dark:bg-amber-900/60 shadow-inner"; // Peça no slot lotado
    return "bg-blue-600 dark:bg-blue-400 shadow-[inset_0_0_2px_rgba(0,0,0,0.3)]"; // Peça no slot parcial
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between bg-muted/40 p-3 px-5 rounded-2xl border border-border backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <MapPinned className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Setor Atual</p>
              <h2 className="text-sm font-black uppercase text-foreground truncate max-w-[200px] md:max-w-none">
                {selectedLocation || "Selecionar Setor"}
              </h2>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-background border-border hover:bg-muted text-[10px] font-black uppercase h-9 gap-2">
                Alterar Setor <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground min-w-[200px]">
              {availableLocations.map((loc) => (
                <DropdownMenuItem 
                  key={loc} 
                  onClick={() => setSelectedLocation(loc)}
                  className={cn(
                    "text-[10px] font-black uppercase cursor-pointer py-2.5",
                    selectedLocation === loc ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  {loc}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {sortedFilteredUnits.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50 bg-muted/20 rounded-3xl border border-dashed border-border">
              <Building2 className="h-12 w-12 mb-4" />
              <p className="font-black uppercase text-sm tracking-tighter text-center">Nenhuma estrutura ocupada neste setor</p>
            </div>
          ) : (
            sortedFilteredUnits.map(({ name, shelves }) => (
              <div key={name} className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2 px-2 mb-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h3 className="font-black uppercase tracking-tighter text-lg text-foreground italic">{name}</h3>
                </div>
                
                <div className="bg-card p-4 rounded-[2rem] border-4 border-muted shadow-xl space-y-4 h-full">
                  {[4, 3, 2, 1].map((shelfNum) => (
                    <div key={shelfNum} className="relative">
                      <div className="grid grid-cols-4 gap-2 bg-muted/30 p-2 rounded-xl border border-border">
                        {['A', 'B', 'C', 'D'].map((slotLetter) => {
                          const itemsInSlot = shelves[shelfNum]?.[slotLetter] || [];
                          const itemCount = itemsInSlot.length;
                          const subSlots = Array.from({ length: 6 });

                          return (
                            <Tooltip key={slotLetter} delayDuration={0}>
                              <TooltipTrigger asChild>
                                <div className={cn(
                                  "aspect-square rounded-xl p-1 border-2 transition-all relative group grid grid-cols-2 grid-rows-3 gap-0.5",
                                  getSlotStatusClasses(itemCount)
                                )}>
                                  <span className="text-[7px] font-black absolute -top-1 -right-1 bg-background px-1 rounded-full border border-border opacity-0 group-hover:opacity-100 z-10 text-foreground">
                                    {shelfNum}{slotLetter}
                                  </span>
                                  {subSlots.map((_, idx) => (
                                    <div key={idx} className={cn(
                                      "w-full h-full transition-colors duration-300",
                                      getItemColorClasses(!!itemsInSlot[idx], itemCount),
                                      idx === 0 && "rounded-tl-[6px]", idx === 1 && "rounded-tr-[6px]", idx === 4 && "rounded-bl-[6px]", idx === 5 && "rounded-br-[6px]"
                                    )} />
                                  ))}
                                </div>
                              </TooltipTrigger>
                              {itemCount > 0 && (
                                <TooltipContent side="top" className="bg-background border-border text-popover-foreground p-0 overflow-hidden min-w-[200px] rounded-xl shadow-2xl z-[110]">
                                  <div className={cn(
                                    "px-3 py-1.5 border-b border-border flex justify-between items-center",
                                    itemCount === 6 ? "bg-amber-500/20" : "bg-blue-500/10"
                                  )}>
                                    <span className={cn(
                                      "text-[10px] font-bold",
                                      itemCount === 6 ? "text-amber-600 dark:text-amber-500" : "text-blue-600 dark:text-blue-400"
                                    )}>Posição {shelfNum}{slotLetter}</span>
                                    <span className="text-[9px] font-medium opacity-70 bg-muted px-1.5 rounded-full">{itemCount}/6</span>
                                  </div>
                                  <div className="p-2 space-y-1">
                                    {itemsInSlot.map((item: any, i: number) => (
                                      <button key={i} onClick={() => onSelectItem(item)} className="w-full text-left p-2 hover:bg-muted rounded-lg flex flex-col gap-0.5 group/item transition-colors">
                                        <p className="text-[10px] font-bold truncate text-foreground group-hover/item:text-primary">{item.product}</p>
                                        <div className="flex justify-between text-[8px] text-muted-foreground font-mono">
                                          <span>NF: {item.nf_number}</span>
                                          <span>ID: {item.control_id}</span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          );
                        })}
                      </div>
                      <div className="h-2 w-full bg-muted mt-1 rounded-full border-t border-border shadow-inner" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}