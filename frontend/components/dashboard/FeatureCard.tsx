import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  borderColor?: string; // Ex: "border-blue-500"
}

export default function FeatureCard({ 
  icon, 
  title, 
  desc, 
  borderColor = "border-secondary" 
}: FeatureCardProps) {
  return (
    <div className={`
      bg-surface border border-border border-l-4 ${borderColor} 
      p-8 rounded-2xl shadow-sm hover:shadow-md transition-all 
      group cursor-default w-full
    `}>
      <div className="flex items-center gap-3 mb-4 text-secondary">
        <div className="p-2 bg-bg border border-border rounded-lg group-hover:bg-secondary group-hover:text-white transition-colors">
          {icon}
        </div>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-text-primary italic">
          {title}
        </h3>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">
        {/* Lógica para negrito dinâmico baseada em asteriscos */}
        {desc.split('**').map((part, i) => 
          i % 2 === 1 ? <strong key={i} className="text-text-primary">{part}</strong> : part
        )}
      </p>
    </div>
  );
}