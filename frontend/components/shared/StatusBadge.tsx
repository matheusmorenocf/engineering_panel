import React from "react";
import { cn } from "@/lib/utils";

type Status = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA" | "CANCELADA";

const map: Record<Status, { label: string; cls: string }> = {
  PENDENTE: { label: "Pendente", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  EM_ANDAMENTO: { label: "Em andamento", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  CONCLUIDA: { label: "Concluída", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELADA: { label: "Cancelada", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const s = map[status] ?? { label: status, cls: "bg-gray-50 text-gray-700 border-gray-200" };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", s.cls, className)}>
      {s.label}
    </span>
  );
}
