import React from 'react';
import { Settings, LucideIcon } from 'lucide-react';

interface InfoBannerProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  decorativeIcon?: LucideIcon;
}

export default function InfoBanner({ 
  icon, 
  title, 
  description, 
  decorativeIcon: DecorativeIcon = Settings 
}: InfoBannerProps) {
  return (
    <div className="w-full bg-bg border border-border rounded-3xl p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
      <div className="flex items-center gap-6 relative z-10">
        <div className="w-12 h-12 bg-surface border border-border rounded-2xl flex items-center justify-center shadow-sm text-secondary">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-text-primary uppercase italic tracking-widest">
            {title}
          </span>
          <p className="text-sm text-text-secondary mt-1">
            {description}
          </p>
        </div>
      </div>
      
      {/* Ícone decorativo ao fundo com rotação no hover */}
      <DecorativeIcon 
        size={80} 
        className="absolute -right-6 -bottom-6 text-text-primary opacity-[0.03] rotate-12 group-hover:rotate-45 transition-transform duration-1000" 
      />
    </div>
  );
}