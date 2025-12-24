import React from "react";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-display font-bold text-foreground mb-2">
        Olá, {userName}! 👋
      </h1>
      <p className="text-muted-foreground">
        Bem-vindo ao Painel de Engenharia. Aqui está o resumo do seu dia.
      </p>
    </div>
  );
}