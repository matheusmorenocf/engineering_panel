import React, { useState, useEffect } from "react";
import { Layout, EyeOff, Save, RefreshCw, ChevronDown, ChevronUp, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminService } from "@/services/adminService";
import { useToastContext } from "@/contexts/ToastContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function PagesTab() {
  const { addToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openDrawings, setOpenDrawings] = useState(false);
  
  const [pageStatus, setPageStatus] = useState({
    catalog: true,
    drawings: true,
    orders: true,
    dashboard: true,
    drawing_elaboration: true,
    drawing_verification: true,
    drawing_approval: true
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUserPreferences();
      // Verificamos se os dados estão em res.data.data ou apenas res.data
      const savedData = res.data?.data || res.data;
      if (savedData?.pageVisibility) {
        setPageStatus(prev => ({ ...prev, ...savedData.pageVisibility }));
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleToggle = (id: string) => {
    setPageStatus(prev => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Buscamos o estado atual completo (Cores, Temas, etc.)
      const res = await adminService.getUserPreferences();
      const currentFullData = res.data?.data || res.data || {};

      // 2. Criamos o payload mantendo as configurações de estilo e atualizando visibilidade
      const finalPayload = {
        ...currentFullData,
        pageVisibility: pageStatus
      };

      // 3. Enviamos para o endpoint correto via adminService
      await adminService.updateUserPreferences(finalPayload);
      
      addToast("Configurações de módulos salvas com sucesso!", "success");
      
      // Recarregar para sincronizar Sidebar e Rotas
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      addToast("Erro ao comunicar com o servidor.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="glass-panel border-border/40">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Gerenciamento de Módulos</CardTitle>
        <CardDescription>Defina quais páginas e sub-módulos estão operacionais para a equipe.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><RefreshCw className="animate-spin h-6 w-6 text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {/* Catalog */}
            <div className="flex items-center justify-between p-4 border rounded-xl bg-background/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${pageStatus.catalog ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                  {pageStatus.catalog ? <Layout className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-bold text-sm">Catálogo</p>
                  <p className="text-[10px] text-muted-foreground font-mono">/catalog</p>
                </div>
              </div>
              <Switch checked={pageStatus.catalog} onCheckedChange={() => handleToggle('catalog')} />
            </div>

            {/* Drawings with Sub-modules */}
            <Collapsible open={openDrawings} onOpenChange={setOpenDrawings} className="border rounded-xl bg-background/50 overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 font-bold text-sm">
                  <div className={`p-2 rounded-lg ${pageStatus.drawings ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                    <Layout className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    Desenhos Técnicos
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                        {openDrawings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <Switch checked={pageStatus.drawings} onCheckedChange={() => handleToggle('drawings')} />
              </div>
              
              <CollapsibleContent className="bg-muted/30 px-4 pb-4 space-y-2 animate-in slide-in-from-top-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-2 px-1">Sub-módulos da Engenharia</div>
                {[
                  { id: "drawing_elaboration", name: "Elaboração" },
                  { id: "drawing_verification", name: "Verificação" },
                  { id: "drawing_approval", name: "Aprovação" }
                ].map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-2 pl-4 border border-border/40 rounded-lg bg-background/40">
                    <div className="flex items-center gap-2">
                      {!pageStatus[sub.id as keyof typeof pageStatus] && <Wrench className="h-3 w-3 text-amber-500" />}
                      <span className={`text-xs ${!pageStatus[sub.id as keyof typeof pageStatus] ? 'text-amber-600 font-medium' : 'text-foreground'}`}>
                        {sub.name}
                      </span>
                    </div>
                    <Switch 
                      className="scale-75"
                      checked={pageStatus[sub.id as keyof typeof pageStatus]} 
                      onCheckedChange={() => handleToggle(sub.id)} 
                    />
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Orders */}
            <div className="flex items-center justify-between p-4 border rounded-xl bg-background/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${pageStatus.orders ? 'bg-amber-500/10 text-amber-500' : 'bg-destructive/10 text-destructive'}`}>
                  <Layout className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Ordens de Produção</p>
                  <p className="text-[10px] text-muted-foreground font-mono">/orders</p>
                </div>
              </div>
              <Switch checked={pageStatus.orders} onCheckedChange={() => handleToggle('orders')} />
            </div>
          </div>
        )}
        <div className="flex justify-end pt-4">
          <Button className="gap-2 shadow-lg" onClick={handleSave} disabled={saving || loading}>
            {saving ? <RefreshCw className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
            Salvar Alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}