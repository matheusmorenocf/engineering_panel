import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Package, CheckCircle, Clock } from "lucide-react";

export const Dashboard = () {
  const [stats, setStats] = useState({
    totalDrawings: 0,
    totalProducts: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Faz chamadas paralelas para otimizar o carregamento
        const [drawingsRes, productsRes] = await Promise.all([
          api.get("/api/drawings/"),
          api.get("/api/catalog/products/")
        ]);
        
        setStats({
          totalDrawings: drawingsRes.data.length,
          totalProducts: productsRes.data.length,
          pendingOrders: 0 // Ajuste conforme seu endpoint de ordens
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao sistema de gestão de engenharia.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Desenhos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDrawings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        {/* Adicione mais cards conforme necessário mantendo seu padrão visual */}
      </div>
    </div>
  );
}