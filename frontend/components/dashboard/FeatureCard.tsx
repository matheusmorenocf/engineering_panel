"use client";

import React from 'react';
import Link from 'next/link';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

export default function FeatureCard({ icon, title, description = "", href }: FeatureCardProps) {
  // Fallback de segurança para evitar erro de .split() em undefined
  const desc = description || "";

  return (
    <Link 
      href={href} 
      className="group p-6 bg-surface border border-border rounded-2xl hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-300 flex flex-col gap-4"
    >
      {/* Usamos a cor 'secondary' do tema atual. 
          A opacidade (bg-secondary/10) funciona dinamicamente com Tailwind 
      */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-secondary/20 bg-secondary/10 text-secondary transition-colors duration-300">
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary group-hover:text-secondary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          {desc.split('**').map((part, i) => 
            i % 2 === 1 ? (
              <strong key={i} className="text-text-primary font-bold">
                {part}
              </strong>
            ) : part
          )}
        </p>
      </div>
    </Link>
  );
}