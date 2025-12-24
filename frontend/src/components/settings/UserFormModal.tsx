import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { adminService } from "@/services/adminService";
import { useToastContext } from "@/contexts/ToastContext";
import { Eye, EyeOff } from "lucide-react";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groups: any[];
  editingUser?: any;
}

export function UserFormModal({ isOpen, onClose, onSuccess, groups, editingUser }: UserFormModalProps) {
  const { register, handleSubmit, setValue, reset, watch, formState: { isSubmitting } } = useForm();
  const { addToast } = useToastContext();
  
  // Estado para controlar a visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);

  const groupValue = watch("group");

  useEffect(() => {
    if (isOpen) {
      setShowPassword(false); // Reseta a visualização ao abrir
      if (editingUser) {
        reset({
          first_name: editingUser.first_name || "",
          last_name: editingUser.last_name || "",
          username: editingUser.username || "",
          email: editingUser.email || "",
          group: editingUser.groups?.[0]?.toString() || "",
          password: "" 
        });
      } else {
        reset({
          first_name: "",
          last_name: "",
          username: "",
          email: "",
          group: "",
          password: ""
        });
      }
    }
  }, [isOpen, editingUser, reset]);

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        groups: data.group ? [parseInt(data.group)] : []
      };

      if (editingUser) {
        if (!data.password) delete payload.password;
        await adminService.updateUser(editingUser.id, payload);
        addToast("Usuário atualizado com sucesso!", "success");
      } else {
        await adminService.createUser(payload);
        addToast("Usuário cadastrado com sucesso!", "success");
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      addToast(
        editingUser ? "Erro ao atualizar usuário." : "Erro ao criar usuário.", 
        "error"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass-panel border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold">
            {editingUser ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nome</Label>
              <Input id="first_name" {...register("first_name", { required: true })} placeholder="João" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Sobrenome</Label>
              <Input id="last_name" {...register("last_name", { required: true })} placeholder="Silva" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Login / Usuário</Label>
            <Input 
              id="username" 
              {...register("username", { required: true })} 
              placeholder="joao.silva" 
              disabled={!!editingUser} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register("email", { required: true })} placeholder="joao@empresa.com" />
          </div>

          <div className="space-y-2">
            <Label>Grupo de Permissão</Label>
            <Select 
              value={groupValue} 
              onValueChange={(val) => setValue("group", val)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border shadow-md z-[100]">
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id.toString()}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {editingUser ? "Nova Senha (deixe em branco para não alterar)" : "Senha Provisória"}
            </Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                {...register("password", { required: !editingUser })} 
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : editingUser ? "Salvar Alterações" : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}