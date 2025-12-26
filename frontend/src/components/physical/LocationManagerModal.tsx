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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, X, MapPin, Users, Loader2, Pencil, Save, UserPlus, Box, LayoutGrid, Check } from "lucide-react";
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
  
  // Estados do Formulário (Aba Dados Básicos)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [selectedResponsibles, setSelectedResponsibles] = useState<number[]>([]);
  
  // Estados para Aba Estrutura Física
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [physicalStructure, setPhysicalStructure] = useState<any[]>([]); // Array de objetos {name, rows, cols}
  const [newCloset, setNewCloset] = useState({ name: "", rows: 4, cols: 4 });
  const [editingClosetName, setEditingClosetName] = useState<string | null>(null);

  // Estado para exclusão
  const [locationToDelete, setLocationToDelete] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
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

  useEffect(() => {
    if (selectedLocationId) {
      const loc = locations.find(l => l.id.toString() === selectedLocationId);
      setPhysicalStructure(loc?.physical_structure || []);
    } else {
      setPhysicalStructure([]);
      cancelClosetEdit();
    }
  }, [selectedLocationId, locations]);

  const handleSaveBasic = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: newName.trim().toUpperCase(),
        responsibles: selectedResponsibles,
      };

      if (editingId) {
        await inventoryService.updateLocation(editingId, payload);
        addToast("Setor atualizado!", "success");
      } else {
        await inventoryService.createLocation(payload);
        addToast("Novo setor adicionado!", "success");
      }
      
      resetForm();
      fetchData();
    } catch (error: any) {
      addToast("Erro ao salvar dados básicos.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveStructure = async () => {
    if (!selectedLocationId) return;
    setIsSubmitting(true);
    try {
      await inventoryService.updateLocation(Number(selectedLocationId), {
        physical_structure: physicalStructure
      });
      addToast("Estrutura física atualizada!", "success");
      fetchData();
    } catch (error: any) {
      addToast("Erro ao salvar estrutura física.", "error");
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
    setSelectedResponsibles(loc.responsibles || []);
    
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
      addToast("Erro: O local pode estar em uso.", "error");
    } finally {
      setLocationToDelete(null);
    }
  };

  const addCloset = () => {
    const name = newCloset.name.trim().toUpperCase();
    if (!name) return;

    if (editingClosetName) {
      // Lógica de Edição
      setPhysicalStructure(prev => 
        prev.map(c => c.name === editingClosetName ? { ...newCloset, name } : c)
      );
      cancelClosetEdit();
    } else {
      // Lógica de Novo
      if (physicalStructure.some(c => c.name === name)) {
          addToast("Este armário já foi adicionado.", "error");
          return;
      }
      setPhysicalStructure(prev => [...prev, { ...newCloset, name }]);
      setNewCloset({ name: "", rows: 4, cols: 4 });
    }
  };

  const startEditCloset = (closet: any) => {
    setEditingClosetName(closet.name);
    setNewCloset({ name: closet.name, rows: closet.rows, cols: closet.cols });
  };

  const cancelClosetEdit = () => {
    setEditingClosetName(null);
    setNewCloset({ name: "", rows: 4, cols: 4 });
  };

  const removeCloset = (name: string) => {
    setPhysicalStructure(prev => prev.filter(c => c.name !== name));
    if (editingClosetName === name) cancelClosetEdit();
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
                  <MapPin className="h-5 w-5 text-primary" /> Gestão de Almoxarifado
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <Tabs defaultValue="basic" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl h-12">
                  <TabsTrigger value="basic" className="rounded-lg font-bold uppercase text-[10px] data-[state=active]:bg-background">
                    <Users className="h-3.5 w-3.5 mr-2" /> 1. Setores e Responsáveis
                  </TabsTrigger>
                  <TabsTrigger value="structure" className="rounded-lg font-bold uppercase text-[10px] data-[state=active]:bg-background">
                    <LayoutGrid className="h-3.5 w-3.5 mr-2" /> 2. Estrutura Física
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 mt-0 outline-none">
                  <div className={cn(
                    "space-y-4 p-5 rounded-2xl border transition-all duration-300",
                    editingId ? "bg-amber-500/5 border-amber-500/30" : "bg-muted/30 border-dashed"
                  )}>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                        {editingId ? "Editar Nome do Setor" : "Novo Setor / Localização"}
                      </label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Ex: TI, MANUTENÇÃO, PROJETOS..." 
                          value={newName} 
                          onChange={e => setNewName(e.target.value)} 
                          className="h-11 font-bold bg-background border-primary/20" 
                        />
                        <Button 
                          onClick={handleSaveBasic} 
                          disabled={isSubmitting || !newName.trim()}
                          className={cn("h-11 px-6 font-black uppercase shadow-glow", editingId ? "bg-amber-500 hover:bg-amber-600 text-white" : "gradient-brand")}
                        >
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
                        </Button>
                        {editingId && <Button variant="ghost" onClick={resetForm} className="h-11"><X className="h-4 w-4" /></Button>}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 flex items-center gap-2">
                        <UserPlus className="h-3 w-3" /> Responsáveis Técnicos
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {users.map(user => (
                          <button 
                            key={user.id} 
                            onClick={() => setSelectedResponsibles(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])}
                            className={cn(
                              "px-3 py-1.5 rounded-full border transition-all text-[10px] font-bold uppercase",
                              selectedResponsibles.includes(user.id) ? "bg-primary border-primary text-primary-foreground shadow-md" : "bg-background border-border text-muted-foreground"
                            )}
                          >
                            {user.full_name || user.username}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {locations.map(loc => (
                      <div key={loc.id} className="border p-3 rounded-xl flex justify-between items-center bg-card group hover:border-primary/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-primary/40" />
                          <span className="font-black uppercase text-xs">{loc.name}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(loc)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setLocationToDelete(loc.id)} className="hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="structure" className="space-y-6 mt-0 outline-none">
                  <div className="space-y-4 p-5 rounded-2xl border bg-muted/30">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                        1. Selecione o Setor Destino
                      </label>
                      <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                        <SelectTrigger className="h-11 bg-background font-bold">
                          <SelectValue placeholder="Escolha um setor já cadastrado..." />
                        </SelectTrigger>
                        <SelectContent className="z-[10000]">
                          {locations.map(loc => (
                            <SelectItem key={loc.id} value={loc.id.toString()} className="font-bold uppercase text-xs">
                              {loc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedLocationId && (
                      <div className="space-y-5 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                        <div className={cn(
                          "space-y-3 p-4 rounded-xl transition-colors",
                          editingClosetName ? "bg-amber-500/10 border border-amber-500/20" : ""
                        )}>
                          <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                            {editingClosetName ? `Editando: ${editingClosetName}` : `2. Configurar Novo Volume em "${locations.find(l => l.id.toString() === selectedLocationId)?.name}"`}
                          </label>
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-6">
                              <Input 
                                placeholder="Nome (Ex: Armário 01)" 
                                value={newCloset.name} 
                                onChange={e => setNewCloset({...newCloset, name: e.target.value})} 
                                className="h-11 font-bold bg-background border-primary/20" 
                              />
                            </div>
                            <div className="col-span-2">
                              <Input 
                                type="number"
                                placeholder="Linhas" 
                                value={newCloset.rows} 
                                onChange={e => setNewCloset({...newCloset, rows: parseInt(e.target.value) || 0})} 
                                className="h-11 font-bold bg-background border-primary/20 text-center" 
                              />
                            </div>
                            <div className="col-span-2">
                              <Input 
                                type="number"
                                placeholder="Colunas" 
                                value={newCloset.cols} 
                                onChange={e => setNewCloset({...newCloset, cols: parseInt(e.target.value) || 0})} 
                                className="h-11 font-bold bg-background border-primary/20 text-center" 
                              />
                            </div>
                            <div className="col-span-2 flex gap-1">
                              <Button 
                                type="button" 
                                onClick={addCloset} 
                                variant={editingClosetName ? "warning" : "secondary"} 
                                className={cn("h-11 w-full", editingClosetName && "bg-amber-500 hover:bg-amber-600 text-white")}
                              >
                                {editingClosetName ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                              </Button>
                              {editingClosetName && (
                                <Button type="button" onClick={cancelClosetEdit} variant="ghost" className="h-11">
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 flex items-center justify-between">
                            Volumes Configurados <span>{physicalStructure.length} itens</span>
                          </label>
                          <div className="grid gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {physicalStructure.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-8 rounded-xl bg-background/50 border border-dashed border-border">
                                <Box className="h-8 w-8 mb-2 stroke-[1] text-muted-foreground" />
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Nenhum volume definido</p>
                              </div>
                            ) : (
                              physicalStructure.map((closet, idx) => (
                                <div key={idx} className={cn(
                                  "flex items-center justify-between p-3 rounded-xl border transition-all shadow-sm group",
                                  editingClosetName === closet.name ? "bg-amber-500/5 border-amber-500/40 ring-1 ring-amber-500/20" : "bg-background/80 border-border hover:border-primary/40"
                                )}>
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "h-8 w-8 rounded-lg flex items-center justify-center",
                                      editingClosetName === closet.name ? "bg-amber-500/20" : "bg-primary/10"
                                    )}>
                                      <LayoutGrid className={cn("h-4 w-4", editingClosetName === closet.name ? "text-amber-600" : "text-primary")} />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-black uppercase text-xs leading-none">{closet.name}</span>
                                      <span className="text-[9px] font-bold text-muted-foreground mt-1">
                                        Grade: {closet.rows} Linhas x {closet.cols} Colunas
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => startEditCloset(closet)}
                                      className="h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => removeCloset(closet.name)}
                                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <Button 
                          onClick={handleSaveStructure} 
                          disabled={isSubmitting}
                          className="w-full h-11 font-black uppercase gradient-brand shadow-glow"
                        >
                          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Salvar Estrutura do Setor</>}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <AlertDialog open={!!locationToDelete} onOpenChange={(open) => !open && setLocationToDelete(null)}>
        <AlertDialogContent className="z-[10000] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-black tracking-tight text-xl">Remover Setor?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              Atenção: O setor só será removido se não houver itens vinculados a ele.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold uppercase text-xs border-none">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs">Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}