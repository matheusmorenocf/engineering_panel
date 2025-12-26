/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, X, MapPin, Users, Loader2, Pencil, Save, UserPlus } from "lucide-react";
import { inventoryService } from "@/services/inventoryService";
import { useToastContext } from "@/contexts/ToastContext";
import api from "@/libs/api";
import { cn } from "@/libs/utils";

export function LocationManagerModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { addToast } = useToastContext();
  const [locations, setLocations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados do Formulário
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [selectedResponsibles, setSelectedResponsibles] = useState<number[]>([]);
  
  // Estado para exclusão
  const [locationToDelete, setLocationToDelete] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // CORREÇÃO: Chamada para o endpoint correto de usuários e locais
      const [resLoc, resUsers] = await Promise.all([
        inventoryService.getLocations(),
        api.get("physical-control/users/") 
      ]);
      
      const locData = Array.isArray(resLoc.data) ? resLoc.data : resLoc.data?.results || [];
      setLocations(locData);
      setUsers(resUsers.data || []);

    } catch (error) {
      addToast("Erro ao carregar dados do servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (open) fetchData(); }, [open]);

  const handleSave = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: newName.trim().toUpperCase(),
        responsibles: selectedResponsibles
      };

      if (editingId) {
        await inventoryService.updateLocation(editingId, payload);
        addToast("Localização atualizada!", "success");
      } else {
        await inventoryService.createLocation(payload);
        addToast("Nova localização adicionada!", "success");
      }
      
      resetForm();
      fetchData();
    } catch (error: any) {
      addToast("Erro ao salvar dados. Verifique os campos.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewName("");
    setEditingId(null);
    setSelectedResponsibles([]);
  };

  const startEdit = (loc: any) => {
    setEditingId(loc.id);
    setNewName(loc.name);
    // Mapeia os IDs dos responsáveis atuais para o estado de seleção
    setSelectedResponsibles(loc.responsibles || []);
    
    // Scroll suave para o topo do modal para facilitar a edição
    const container = document.querySelector('.custom-scrollbar');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    if (!locationToDelete) return;
    try {
      await inventoryService.deleteLocation(locationToDelete);
      fetchData();
      addToast("Local removido com sucesso.", "success");
    } catch {
      addToast("Erro: O local pode estar em uso por itens do inventário.", "error");
    } finally {
      setLocationToDelete(null);
    }
  };

  const toggleResponsible = (userId: number) => {
    setSelectedResponsibles(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if(!val) resetForm(); }}>
        <DialogPortal>
          <DialogOverlay className="z-[9998] bg-black/60 backdrop-blur-sm" />
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col z-[9999] bg-card border-none shadow-2xl p-0 overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader className="p-6 border-b shrink-0">
              <DialogTitle className="flex items-center justify-between text-xl font-black uppercase tracking-tight">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Gerenciar Locais
                </div>
                {editingId && (
                  <Badge className="bg-amber-500 text-white border-none font-black uppercase text-[10px]">
                    Modo Edição
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              {/* Formulário de Cadastro/Edição */}
              <div className={cn(
                "space-y-4 p-5 rounded-2xl border transition-all duration-300",
                editingId ? "bg-amber-500/5 border-amber-500/30 shadow-inner" : "bg-muted/30 border-dashed"
              )}>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                    {editingId ? "Alterar Nome do Local" : "Registrar Novo Endereço"}
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Ex: ALMOXARIFADO CENTRAL..." 
                      value={newName} 
                      onChange={e => setNewName(e.target.value)} 
                      className="h-11 font-bold bg-background border-primary/20 focus:border-primary" 
                    />
                    {editingId && (
                      <Button variant="ghost" onClick={resetForm} className="h-11 px-4 font-bold text-muted-foreground">
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                    <Button 
                      onClick={handleSave} 
                      disabled={isSubmitting || !newName.trim()}
                      className={cn("h-11 px-6 font-black uppercase shadow-glow", editingId ? "bg-amber-500 hover:bg-amber-600 text-white" : "gradient-brand")}
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        editingId ? <><Save className="mr-2 h-5 w-5" /> Salvar</> : <><Plus className="mr-2 h-5 w-5" /> Adicionar</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Seleção de Responsáveis */}
                {users.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 flex items-center gap-2">
                      <UserPlus className="h-3 w-3" /> Vincular Responsáveis
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {users.map(user => (
                        <button 
                          key={user.id} 
                          type="button"
                          onClick={() => toggleResponsible(user.id)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[10px] font-bold uppercase",
                            selectedResponsibles.includes(user.id) 
                              ? "bg-primary border-primary text-primary-foreground shadow-md scale-105" 
                              : "bg-background border-border text-muted-foreground hover:border-primary/50"
                          )}
                        >
                          {user.full_name || user.username}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de Locais */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2 ml-1">
                  <Users className="h-4 w-4" /> Locais Cadastrados
                </label>
                
                {loading && !isSubmitting ? (
                  <div className="py-12 flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {locations.map(loc => (
                      <div key={loc.id} className={cn(
                        "border p-4 rounded-xl flex justify-between items-center bg-card transition-all group",
                        editingId === loc.id ? "ring-2 ring-amber-500 border-transparent shadow-lg" : "hover:border-primary/30"
                      )}>
                        <div className="flex items-center gap-4">
                          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", editingId === loc.id ? "bg-amber-500/20" : "bg-primary/10")}>
                            <MapPin className={cn("h-5 w-5", editingId === loc.id ? "text-amber-600" : "text-primary")} />
                          </div>
                          <div>
                            <p className="font-black uppercase text-sm tracking-tight">{loc.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {loc.responsibles_details?.map((r: any) => (
                                <Badge key={r.id} variant="secondary" className="text-[8px] font-bold uppercase py-0 px-1.5 bg-muted border-none">
                                  {r.username}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="hover:text-amber-600 hover:bg-amber-500/10" onClick={() => startEdit(loc)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-600 hover:bg-red-500/10" onClick={() => setLocationToDelete(loc.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Alerta de Exclusão Corrigido com Alto Contraste */}
      <AlertDialog open={!!locationToDelete} onOpenChange={(open) => !open && setLocationToDelete(null)}>
        <AlertDialogContent className="z-[10000] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-black tracking-tight text-xl">Remover Localização?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              Atenção: Esta ação é definitiva. O local só será removido se não houver itens de estoque vinculados a ele.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="font-bold uppercase text-xs border-none hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs px-6 shadow-lg shadow-red-600/20"
            >
              Sim, Remover Local
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}