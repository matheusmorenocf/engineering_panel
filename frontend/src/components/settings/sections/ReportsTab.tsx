import React from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportsTab() {
  return (
    <Card className="max-w-xl shadow-sm border-border/40 animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Relatórios Automáticos</CardTitle>
        <CardDescription>Configuração de envio de dados por e-mail.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="report-emails">E-mails dos Destinatários</Label>
          <Input id="report-emails" placeholder="exemplo@empresa.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="report-freq">Frequência</Label>
          <select id="report-freq" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
            <option>Diário</option>
            <option>Semanal (Segunda-feira)</option>
            <option>Mensal (Dia 1)</option>
          </select>
        </div>
        <Button className="w-full gap-2"><Save className="h-4 w-4" /> Salvar Configuração</Button>
      </CardContent>
    </Card>
  );
}