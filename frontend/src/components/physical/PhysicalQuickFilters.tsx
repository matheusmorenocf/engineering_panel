/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/libs/utils";

interface PhysicalQuickFiltersProps {
  locations: string[];
  selectedLocation?: string;
  onLocationChange?: (loc: string) => void;
  isVisible: boolean;
}

export function PhysicalQuickFilters({
  locations,
  selectedLocation,
  onLocationChange,
  isVisible
}: PhysicalQuickFiltersProps) {
  if (!isVisible || locations.length === 0) return null;

  return (
    <div className="flex items-center gap-2 pt-2 border-t border-dashed animate-in fade-in slide-in-from-top-1">
      <span className="text-[10px] font-black uppercase text-muted-foreground mr-2 tracking-widest">
        Setores:
      </span>
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {locations.map((loc) => (
          <button
            key={loc}
            onClick={() => onLocationChange?.(loc)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all border whitespace-nowrap",
              selectedLocation === loc
                ? "bg-primary text-primary-foreground border-primary shadow-glow-sm"
                : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
            )}
          >
            {loc}
          </button>
        ))}
      </div>
    </div>
  );
}