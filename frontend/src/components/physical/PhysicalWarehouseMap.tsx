/* eslint-disable @typescript-eslint/no-explicit-any */
import { Building2, Box, Info } from "lucide-react";
import { cn } from "@/libs/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PhysicalWarehouseMapProps {
  warehouseMap: any;
  onSelectItem: (item: any) => void;
}

export function PhysicalWarehouseMap({ warehouseMap, onSelectItem }: PhysicalWarehouseMapProps) {
  return (
    <TooltipProvider>
      {/* Container com scroll horizontal. 
          Snap-x faz com que o scroll "trave" no armário ao deslizar.
      */}
      <div className="flex gap-8 pb-10 overflow-x-auto custom-scrollbar snap-x snap-mandatory">
        {Object.entries(warehouseMap).map(([closetNum, shelves]: any) => (
          <div 
            key={closetNum} 
            className="min-w-[calc(33.33%-1rem)] max-w-[calc(33.33%-1rem)] flex-shrink-0 snap-start"
          >
            {/* Título do Armário */}
            <div className="flex items-center gap-2 px-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="font-black uppercase tracking-tighter text-xl">Armário {closetNum}</h3>
            </div>

            {/* Estrutura do Armário */}
            <div className="bg-slate-900 p-4 rounded-[2rem] border-4 border-slate-800 shadow-2xl space-y-4">
              {[4, 3, 2, 1].map((shelfNum) => (
                <div key={shelfNum} className="relative">
                  {/* Grade da Prateleira */}
                  <div className="grid grid-cols-4 gap-2 bg-slate-800/40 p-2 rounded-xl border border-white/5">
                    {['A', 'B', 'C', 'D'].map((slotLetter) => {
                      const itemsInSlot = shelves[shelfNum]?.[slotLetter] || [];
                      const hasItems = itemsInSlot.length > 0;
                      const mainItem = itemsInSlot[0];
                      
                      return (
                        <Tooltip key={slotLetter}>
                          <TooltipTrigger asChild>
                            <div 
                              onClick={() => hasItems && onSelectItem(mainItem)}
                              className={cn(
                                "aspect-square rounded-lg flex flex-col items-center justify-between p-1.5 border-2 transition-all relative group overflow-hidden",
                                hasItems 
                                  ? "bg-primary/10 border-primary/60 shadow-[0_0_15px_rgba(var(--primary),0.2)] cursor-pointer hover:scale-105 hover:border-primary hover:bg-primary/20" 
                                  : "bg-slate-950/40 border-slate-800 opacity-20"
                              )}
                            >
                              <span className="text-[8px] font-black absolute top-0.5 left-1 opacity-40">{shelfNum}{slotLetter}</span>
                              
                              {hasItems && (
                                <div className="flex flex-col items-center justify-center flex-1 w-full gap-0.5">
                                  <span className="text-[7px] font-bold text-primary truncate w-full text-center">NF: {mainItem.nf_number}</span>
                                  <Box className="h-4 w-4 text-primary" />
                                  <span className="text-[7px] font-mono font-black text-white/90 bg-slate-900 px-1 rounded-sm truncate w-full text-center">
                                    {mainItem.control_id}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          
                          {hasItems && (
                            <TooltipContent side="top" className="bg-slate-900 border-primary/50 text-white p-3 max-w-xs rounded-xl shadow-2xl">
                              <div className="space-y-2">
                                <p className="text-xs font-bold">{mainItem.product}</p>
                                <div className="flex gap-2 text-[9px] text-muted-foreground font-mono">
                                  <span>NF: {mainItem.nf_number}</span><span>•</span><span>ID: {mainItem.control_id}</span>
                                </div>
                                <div className="pt-2 border-t border-white/10 text-[9px] text-primary font-bold italic flex items-center gap-1">
                                  <Info className="h-3 w-3" /> Clique para detalhes
                                </div>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      );
                    })}
                  </div>
                  {/* Prateleira física (design) */}
                  <div className="h-2 w-full bg-gradient-to-b from-slate-700 to-slate-800 mt-1 rounded-full shadow-lg border-t border-white/5" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}