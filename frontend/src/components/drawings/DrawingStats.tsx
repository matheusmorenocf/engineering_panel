import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export interface DrawingStatsData {
  total: number;
  pending: number;
  stopped: number;
  completed: number;
}

interface DrawingStatsProps {
  stats: DrawingStatsData;
}

export function DrawingStats({ stats }: DrawingStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm border-none bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
          <List className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-l-4 border-l-yellow-500 bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-600">Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-l-4 border-l-destructive bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-destructive">Parados</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{stats.stopped}</div>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-600">Aprovados</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-500">{stats.completed}</div>
        </CardContent>
      </Card>
    </div>
  );
}