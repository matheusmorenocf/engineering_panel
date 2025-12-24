import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Clock, User, Hash, Activity, MessageSquare, Send, 
  AlertCircle, Layers, Edit3, Calendar, CheckCircle2 
} from "lucide-react";
import { format, isAfter, parseISO } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils"; // CORREÇÃO: Importação do cn adicionada

interface TimelineEvent {
  id: string;
  timestamp: Date;
  user: string;
  message: string;
  isComment?: boolean;
}

interface DrawingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawing: any;
}

export function DrawingFormModal({ isOpen, onClose, drawing }: DrawingFormModalProps) {
  const { user: authUser } = useAuth();
  
  // Estados de formulário
  const [designer, setDesigner] = useState("");
  const [drawingCode, setDrawingCode] = useState("");
  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  
  // Estados para Família de Desenhos
  const [familyCount, setFamilyCount] = useState<number>(0);
  const [familyCodes, setFamilyCodes] = useState<string[]>([]);

  // Inicializa os dados quando o modal abre
  useEffect(() => {
    if (drawing) {
      setDesigner(drawing.designer || "Não atribuído");
      setDrawingCode(drawing.drawingCode || "");
      setStatus(drawing.status || "");
      setFamilyCount(Number(drawing.familyCount) || 0);
      setFamilyCodes(drawing.familyCodes || []);
      
      // Simulação de timeline inicial
      setTimeline([
        {
          id: "1",
          timestamp: new Date(),
          user: "Sistema",
          message: `Desenho ${drawing.drawingCode} carregado para gestão.`,
        },
      ]);
    }
  }, [drawing, isOpen]);

  // Função para adicionar logs na timeline
  const addLog = (message: string, isComment = false) => {
    const newEvent: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      user: authUser?.firstName || "Usuário",
      message,
      isComment,
    };
    setTimeline((prev) => [newEvent, ...prev]);
  };

  // HANDLERS DE ALTERAÇÃO (CORREÇÃO: Funções definidas para evitar ReferenceError)
  const handleDesignerChange = (val: string) => {
    const old = designer;
    setDesigner(val);
    addLog(`Desenhista alterado de "${old}" para "${val}"`);
  };

  const handleStatusChange = (val: string) => {
    const old = status;
    setStatus(val);
    addLog(`Status alterado de "${old}" para "${val}"`);
  };

  const handleCodeChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val !== drawingCode) {
      const old = drawingCode;
      setDrawingCode(val);
      addLog(`Cód. Desenho alterado de "${old}" para "${val}"`);
    }
  };

  // Lógica de Família de Desenhos
  const handleFamilyCountChange = (count: number) => {
    const n = isNaN(count) ? 0 : Math.max(0, count);
    setFamilyCount(n);
    const newCodes = [...familyCodes];
    if (n > newCodes.length) {
      for (let i = newCodes.length; i < n; i++) newCodes.push("");
    } else {
      newCodes.splice(n);
    }
    setFamilyCodes(newCodes);
  };

  const updateFamilyCode = (index: number, code: string) => {
    const updated = [...familyCodes];
    updated[index] = code;
    setFamilyCodes(updated);
  };

  const editLog = (id: string, newMessage: string) => {
    setTimeline(prev => prev.map(event => 
      event.id === id ? { ...event, message: newMessage } : event
    ));
  };

  // Verificação de Atraso (SLA)
  const isDelayed = drawing?.deadlineDate && status !== "approved" 
    ? isAfter(new Date(), parseISO(drawing.deadlineDate)) 
    : false;

  if (!drawing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] glass-panel border-border/50 max-h-[95vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Gestão de Engenharia</span>
                {isDelayed && (
                  <Badge variant="destructive" className="animate-pulse gap-1">
                    <AlertCircle className="h-3 w-3" /> EM ATRASO
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-2xl font-display font-bold">{drawing.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 overflow-hidden">
          {/* Coluna Esquerda: Dados Técnicos e Família */}
          <ScrollArea className="pr-4">
            <div className="space-y-6">
              {/* Datas vindo do Banco */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Liberação
                  </Label>
                  <p className="text-sm font-semibold">
                    {drawing.releaseDate ? format(parseISO(drawing.releaseDate), "dd/MM/yyyy") : "Aguardando"}
                  </p>
                </div>
                <div className="space-y-1 border-l pl-4">
                  <Label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Data Limite (+5d)
                  </Label>
                  <p className={cn("text-sm font-bold", isDelayed ? "text-destructive" : "text-primary")}>
                    {drawing.deadlineDate ? format(parseISO(drawing.deadlineDate), "dd/MM/yyyy") : "---"}
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4 rounded-xl bg-card border border-border/40 shadow-sm">
                <h3 className="text-sm font-bold flex items-center gap-2 border-b pb-2">
                  <User className="h-4 w-4 text-primary" /> Atribuição
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Desenhista</Label>
                    <Select value={designer} onValueChange={handleDesignerChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Eng. Ricardo Silva">Eng. Ricardo Silva</SelectItem>
                        <SelectItem value="Tec. Fernanda Costa">Tec. Fernanda Costa</SelectItem>
                        <SelectItem value="Não atribuído">Não atribuído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status Atual</Label>
                    <Select value={status} onValueChange={handleStatusChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="management">Gestão</SelectItem>
                        <SelectItem value="elaboration">Elaboração</SelectItem>
                        <SelectItem value="verification">Verificação</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <Label>Cód. Desenho Principal</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" defaultValue={drawingCode} onBlur={handleCodeChange} />
                  </div>
                </div>
              </div>

              {/* Família de Desenhos */}
              <div className="space-y-4 p-4 rounded-xl bg-card border border-border/40 shadow-sm">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> Família de Desenhos (Sub-itens)
                </h3>
                <div className="space-y-2">
                  <Label>Qtd. de desenhos na família</Label>
                  <Input 
                    type="number" 
                    value={familyCount === 0 ? "" : familyCount} 
                    onChange={(e) => handleFamilyCountChange(parseInt(e.target.value))}
                    className="w-24"
                  />
                </div>
                {familyCount > 0 && (
                  <div className="grid grid-cols-1 gap-3 pt-2 animate-in fade-in duration-300">
                    <Label className="text-xs text-muted-foreground italic">Informe os códigos gerados:</Label>
                    {familyCodes.map((code, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="h-9 w-10 flex justify-center text-[10px]">{index + 1}</Badge>
                        <Input 
                          placeholder={`Código do desenho ${index + 1}`}
                          value={code}
                          onChange={(e) => updateFamilyCode(index, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" /> Nova Observação
                </h3>
                <Textarea 
                  placeholder="Instruções ou notas técnicas..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[80px] bg-background"
                />
                <Button size="sm" className="w-full gap-2" onClick={() => { addLog(comment, true); setComment(""); }} disabled={!comment.trim()}>
                  <Send className="h-3.5 w-3.5" /> Enviar para Timeline
                </Button>
              </div>
            </div>
          </ScrollArea>

          {/* Coluna Direita: Timeline */}
          <div className="flex flex-col h-full border-l pl-6">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-primary" /> Histórico (Timeline)
            </h3>
            <ScrollArea className="flex-1 bg-muted/10 rounded-xl p-4 border shadow-inner">
              <div className="space-y-6">
                {timeline.map((event) => (
                  <div key={event.id} className="relative pl-6 border-l-2 border-primary/20 group">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-background bg-primary" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground font-mono font-bold">
                          {format(event.timestamp, "dd/MM/yyyy HH:mm")} - {event.user}
                        </p>
                        
                        {/* Popover de Edição da Timeline (Apenas Superuser) */}
                        {authUser?.isSuperuser && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4">
                              <div className="space-y-3">
                                <h4 className="font-bold text-sm">Editar Evento</h4>
                                <Textarea 
                                  defaultValue={event.message} 
                                  id={`edit-${event.id}`}
                                  className="text-xs min-h-[100px]"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" onClick={() => {
                                    const val = (document.getElementById(`edit-${event.id}`) as HTMLTextAreaElement).value;
                                    editLog(event.id, val);
                                  }}>
                                    Salvar Alteração
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs p-2 rounded-lg",
                        event.isComment ? "bg-primary/10 border border-primary/20 italic text-foreground" : "text-foreground/80"
                      )}>
                        {event.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex-1 flex items-center gap-2 text-[10px] text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            Integrado com servidor de projetos
          </div>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button className="bg-primary shadow-glow px-8">Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}