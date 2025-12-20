import React from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="space-y-8 fade-in">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-secondary mt-1">Bem-vindo ao seu painel de controle de engenharia.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={18} />
          Novo Projeto
        </Button>
      </div>

      {/* Grid de Stats Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Projetos" 
          value="24" 
          icon={<BarChart3 className="text-white" size={24} />} 
          trend="+3 este mês"
        />
        <StatCard 
          title="Em Andamento" 
          value="12" 
          icon={<Clock className="text-white" size={24} />} 
          trend="85% do tempo"
        />
        <StatCard 
          title="Concluídos" 
          value="158" 
          icon={<CheckCircle2 className="text-white" size={24} />} 
          trend="Taxa de 98%"
        />
        <StatCard 
          title="Pendências" 
          value="5" 
          icon={<AlertCircle className="text-white" size={24} />} 
          trend="Atenção necessária"
          isAlert
        />
      </div>

      {/* Seção Principal - Projetos Recentes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader 
              title="Projetos Recentes" 
              subtitle="Visão geral dos últimos projetos atualizados"
            />
            <div className="mt-4 overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome do Projeto</th>
                    <th>Status</th>
                    <th>Progresso</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  <ProjectRow name="Edifício SkyLine" status="Em Andamento" progress={65} />
                  <ProjectRow name="Ponte Rio Negro" status="Revisão" progress={90} />
                  <ProjectRow name="Planta Industrial Z" status="Planejamento" progress={15} />
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader title="Atividades Próximas" />
            <div className="space-y-4">
              <ActivityItem text="Reunião de entrega técnica" time="14:00" />
              <ActivityItem text="Aprovação de orçamentos" time="Amanhã" />
              <ActivityItem text="Vistoria de campo - Lote 4" time="22/12" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componentes Auxiliares Locais (Modulares)

function StatCard({ title, value, icon, trend, isAlert = false }: any) {
  return (
    <Card className="hover:translate-y-[-4px]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-tertiary uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <p className={`text-xs mt-2 font-medium ${isAlert ? 'text-error' : 'text-success'}`}>
            {trend}
          </p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${isAlert ? 'from-red-500 to-orange-500' : 'from-blue-600 to-cyan-500'} shadow-lg`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function ProjectRow({ name, status, progress }: any) {
  return (
    <tr>
      <td className="font-medium">{name}</td>
      <td>
        <span className="badge badge-info">{status}</span>
      </td>
      <td className="w-48">
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div className="bg-secondary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </td>
      <td>
        <Button variant="ghost" size="sm">Ver detalhes</Button>
      </td>
    </tr>
  );
}

function ActivityItem({ text, time }: any) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="h-2 w-2 rounded-full bg-accent" />
      <div className="flex-1">
        <p className="text-sm font-medium text-primary">{text}</p>
        <p className="text-xs text-tertiary">{time}</p>
      </div>
    </div>
  );
}