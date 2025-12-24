import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  color: string;
  index: number;
}

export const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
    emerald: { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
    amber: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
    ruby: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
    success: { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
    warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
    destructive: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
  };
  return colors[color] || colors.primary;
};

export function StatCard({ label, value, icon: Icon, trend, color, index }: StatCardProps) {
  const colors = getColorClasses(color);

  return (
    <div
      className="glass-panel rounded-xl p-5 hover-lift animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
          {trend}
        </span>
      </div>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}