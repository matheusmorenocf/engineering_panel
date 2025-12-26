/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { inventoryService } from "@/services/inventoryService";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // IMPORTAÇÃO CORRIGIDA
import { ClipboardCheck, Timer, Package, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/libs/utils";
import { ItemProcessingForm } from "@/components/physical/ItemProcessingForm";

export function ProcessingQueuePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      // 1. Se houver ID na URL, busca o item individual (Rota Pública)
      if (id) {
        try {
          const resSingle = await inventoryService.getSingleProcessing(Number(id));
          setSelectedItem(resSingle.data);
        } catch (err) {
          console.error("Erro ao buscar item específico (404 ou Rede)");
          setError(true);
        }
      }

      // 2. Se o usuário estiver LOGADO, busca a fila lateral
      if (isAuthenticated) {
        try {
          const resQueue = await inventoryService.getProcessingQueue();
          setQueue(resQueue.data || []);
        } catch (err) {
          console.error("Erro ao carregar fila lateral");
        }
      }
    } catch (err) {
      console.error("Erro geral na sincronização");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [id, isAuthenticated]);

  // Tela de erro caso o ID não exista ou link esteja quebrado
  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="bg-card p-8 rounded-3xl border shadow-2xl flex flex-col items-center text-center max-w-sm">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Registro não encontrado</h2>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mt-2 leading-relaxed">
            O link acessado é inválido ou o item já foi removido do sistema de triagem.
          </p>
          <Button onClick={() => navigate("/")} className="mt-8 w-full font-black uppercase text-xs h-12">
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 min-h-screen bg-background">
      <div className="flex flex-col gap-1 text-center md:text-left">
        <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center justify-center md:justify-start gap-3">
          <ClipboardCheck className="h-8 w-8 text-primary" /> Triagem Técnica
        </h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Sistema de Recebimento e Conferência de Materiais
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista Lateral: SÓ APARECE PARA USUÁRIOS LOGADOS */}
        {isAuthenticated && (
          <div className="lg:col-span-1 space-y-3">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Fila de Pendentes</label>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {queue.filter(q => q.status === "Pendente").length === 0 && (
                <p className="text-[10px] italic text-muted-foreground p-4">Nenhum item pendente.</p>
              )}
              {queue.filter(q => q.status === "Pendente").map((item) => (
                <Card 
                  key={item.id} 
                  className={cn(
                    "p-4 cursor-pointer transition-all border-2", 
                    selectedItem?.id === item.id ? "border-primary bg-primary/5 shadow-md" : "hover:border-primary/20"
                  )}
                  onClick={() => navigate(`/triagem/${item.id}`)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="outline" className="font-mono text-[9px]">{item.control_id}</Badge>
                    <Badge className="bg-amber-500/10 text-amber-600 border-none text-[8px] font-black">{item.status}</Badge>
                  </div>
                  <h3 className="font-black uppercase text-xs truncate">{item.product_name}</h3>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Área do Formulário: Centralizada se não estiver logado */}
        <div className={cn(isAuthenticated ? "lg:col-span-2" : "lg:col-span-3 max-w-2xl mx-auto w-full")}>
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-3">
               <Loader2 className="h-10 w-10 animate-spin text-primary" />
               <p className="text-[10px] font-black uppercase text-muted-foreground">Carregando ficha...</p>
             </div>
          ) : selectedItem ? (
            <ItemProcessingForm 
              data={selectedItem} 
              onFinished={() => { 
                if (isAuthenticated) navigate("/triagem");
                fetchData(); 
              }} 
            />
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center bg-muted/5 opacity-40">
              <Package className="h-12 w-12 mb-4" />
              <p className="text-xs font-bold uppercase">Aguardando seleção de item</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}