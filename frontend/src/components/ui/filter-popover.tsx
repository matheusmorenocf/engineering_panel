import React from "react";
import { Filter, User, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/libs/utils";

interface FilterOption {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface FilterPopoverProps {
  title: string;
  label: string;
  options: string[] | FilterOption[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  icon?: React.ElementType;
}

export function FilterPopover({
  title,
  label,
  options,
  selectedValue,
  onSelect,
  icon: Icon = User,
}: FilterPopoverProps) {
  // Normaliza as opções (aceita array de strings ou objetos)
  const normalizedOptions: FilterOption[] = options.map((opt) =>
    typeof opt === "string" ? { id: opt, label: opt } : opt
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={selectedValue ? "default" : "outline"}
          className={cn(
            "gap-2 border-border/60 transition-all",
            selectedValue && "shadow-glow bg-primary text-primary-foreground"
          )}
        >
          <Filter className="h-4 w-4" />
          <span className="max-w-[120px] truncate">
            {selectedValue || label}
          </span>
          {selectedValue && (
            <X
              className="h-3.5 w-3.5 ml-1 hover:scale-125 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 glass-panel" align="end">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase text-muted-foreground px-2 py-1.5 tracking-wider">
            {title}
          </p>
          <div className="max-h-56 overflow-y-auto custom-scrollbar">
            {normalizedOptions.map((option) => {
              const isSelected = selectedValue === option.id;
              const OptionIcon = option.icon || Icon;

              return (
                <button
                  key={option.id}
                  onClick={() => onSelect(option.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-all flex items-center justify-between group",
                    isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <OptionIcon className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
          {selectedValue && (
            <>
              <div className="h-px bg-border my-1" />
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-9 text-destructive hover:bg-destructive/10"
                onClick={() => onSelect(null)}
              >
                Limpar Filtro
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}