import React, { useEffect, useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { adminService } from "@/services/adminService";
import { useToastContext } from "@/contexts/ToastContext";

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingGroup?: any;
}

export function GroupFormModal({ isOpen, onClose, onSuccess, editingGroup }: GroupFormModalProps) {
  const { addToast } = useToastContext();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<any[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
  const [groupName, setGroupName] = useState("");
  const [permSearch, setPermSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchPerms = async () => {
        try {
          const res = await adminService.getPermissions();
          const allPerms = res.data.results || (Array.isArray(res.data) ? res.data : []);
          
          const blacklist = ['logentry', 'permission', 'contenttype', 'session', 'admin', 'token', 'userpreferences'];
          const onlyAppPerms = allPerms.filter((p: any) => {
            const code = p.codename.toLowerCase();
            return !blacklist.some(term => code.includes(term));
          });

          setPermissions(onlyAppPerms);
          setFilteredPermissions(onlyAppPerms);
        } catch (error) {
          addToast("Erro ao carregar permissões.", "error");
        }
      };
      fetchPerms();

      if (editingGroup) {
        setGroupName(editingGroup.name || "");
        setSelectedPerms(editingGroup.permissions || []);
      } else {
        setGroupName("");
        setSelectedPerms([]);
        setPermSearch("");
      }
    }
  }, [isOpen, editingGroup, addToast]);

  useEffect(() => {
    const search = permSearch.toLowerCase();
    const filtered = permissions.filter(p => 
      p.name.toLowerCase().includes(search) || 
      p.codename.toLowerCase().includes(search)
    );
    setFilteredPermissions(filtered);
  }, [permSearch, permissions]);

  const handleSave = async () => {
    if (!groupName) {
      addToast("O nome do grupo é obrigatório.", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = { name: groupName, permissions: selectedPerms };
      if (editingGroup) {
        await adminService.updateGroup(editingGroup.id, payload);
        addToast("Grupo atualizado com sucesso!", "success");
      } else {
        await adminService.createGroup(payload);
        addToast("Grupo criado com sucesso!", "success");
      }
      onSuccess();
      onClose();
    } catch (error) {
      addToast("Erro ao salvar o grupo.", "error");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (id: number) => {
    setSelectedPerms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const translatePerm = (name: string) => {
    return name
      .replace(/Can add/i, 'Criar')
      .replace(/Can change/i, 'Editar')
      .replace(/Can view/i, 'Ver')
      .replace(/Can delete/i, 'Excluir');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] glass-panel border-border/50 max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-display font-bold text-foreground">
            {editingGroup ? "Editar Grupo" : "Novo Grupo"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="group_name">Nome do Grupo</Label>
            <Input 
              id="group_name" 
              placeholder="Ex: Engenharia, PCP..." 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="flex-1 flex flex-col space-y-4 min-h-0 pb-6">
            <div className="flex flex-col gap-3">
               <Label className="text-base font-semibold">Permissões de Acesso</Label>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filtrar permissões..." 
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    className="pl-9 bg-background/50 h-9 text-sm"
                  />
               </div>
            </div>
            
            {/* ROLAGEM CORRIGIDA: Div nativa com overflow-y-auto e altura máxima */}
            <div className="flex-1 border rounded-md bg-muted/20 overflow-y-auto min-h-[200px] max-h-[400px] custom-scrollbar">
              <div className="p-4 space-y-3">
                {filteredPermissions.length > 0 ? (
                  filteredPermissions.map((perm) => (
                    <div key={perm.id} className="flex items-center space-x-3 hover:bg-muted/30 p-1.5 rounded-md transition-colors border-b border-border/10 last:border-0">
                      <Checkbox 
                        id={`p-${perm.id}`} 
                        checked={selectedPerms.includes(perm.id)}
                        onCheckedChange={() => togglePermission(perm.id)}
                      />
                      <div className="grid gap-1 leading-none">
                        <label htmlFor={`p-${perm.id}`} className="text-sm font-medium cursor-pointer text-foreground">
                          {translatePerm(perm.name)}
                        </label>
                        <p className="text-[10px] text-muted-foreground font-mono">{perm.codename}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground italic">
                    {permissions.length === 0 ? "Carregando..." : "Nenhuma permissão encontrada."}
                  </div>
                )}
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground text-right">
              {selectedPerms.length} permissões selecionadas
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-border/50 bg-muted/5">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Grupo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}