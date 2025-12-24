import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Interface mantida para referência, mas campos agora são internos
export interface FormField {
  id: string;
  label: string;
  type: "input" | "select";
  placeholder?: string;
  halfWidth?: boolean;
  inputType?: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
}

// Definição dos campos padrão de engenharia
const DEFAULT_FIELDS: FormField[] = [
  { id: "drawingCode", label: "Código do Desenho", type: "input", placeholder: "Ex: PG4400", halfWidth: true },
  { id: "revision", label: "Revisão", type: "input", placeholder: "00", halfWidth: true },
  { id: "description", label: "Descrição/Título", type: "input", placeholder: "Nome do componente" },
  { 
    id: "project", 
    label: "Projeto/Cliente", 
    type: "select", 
    options: [
      { value: "vale", label: "VALE S.A." },
      { value: "usiminas", label: "USIMINAS" },
      { value: "gerdau", label: "GERDAU" },
    ] 
  },
  { id: "designer", label: "Projetista Responsável", type: "input", placeholder: "Nome do engenheiro" },
];

interface DrawingManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DrawingManualModal({ isOpen, onClose }: DrawingManualModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de salvamento aqui
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] glass-panel border-border/50">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-foreground">
              Inserir Novo Desenho
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Utilize este formulário para desenhos que não vieram do Protheus. 
              Preencha os dados técnicos para iniciar o fluxo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6 py-4">
            {DEFAULT_FIELDS.map((field) => (
              <div 
                key={field.id} 
                className={`space-y-2 ${field.halfWidth ? 'col-span-1' : 'col-span-2'}`}
              >
                <Label htmlFor={field.id} className="text-sm font-semibold text-foreground">
                  {field.label}
                </Label>
                
                {field.type === "input" && (
                  <Input 
                    id={field.id} 
                    type={field.inputType || "text"}
                    placeholder={field.placeholder} 
                    className="bg-background/50 border-border/40 focus:border-primary/50 transition-all" 
                  />
                )}

                {field.type === "select" && (
                  <Select defaultValue={field.defaultValue}>
                    <SelectTrigger className="bg-background/50 border-border/40 focus:ring-primary/20">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-border/50">
                      {field.options?.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} className="hover:bg-muted">
              Cancelar
            </Button>
            <Button type="submit" className="shadow-glow bg-primary text-primary-foreground hover:bg-primary/90">
              Salvar Desenho
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}