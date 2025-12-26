import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhysicalHeaderProps {
  onOpenForm: () => void;
}

export function PhysicalHeader({ onOpenForm }: PhysicalHeaderProps) {
  return (
    <div className="flex justify-between items-center shrink-0">
      <div>
        <h1 className="text-3xl font-black tracking-tight uppercase">Controle Físico</h1>
        <p className="text-muted-foreground text-sm font-medium">Gestão de endereçamento e rastreabilidade.</p>
      </div>
      <Button onClick={onOpenForm} className="gradient-brand gap-2 font-bold h-11 px-6 shadow-glow">
        <Plus className="h-5 w-5" /> Nova Entrada Física
      </Button>
    </div>
  );
}