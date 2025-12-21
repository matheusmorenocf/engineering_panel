import React from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  small?: boolean;
  isCollapsed?: boolean;
}

export default function NavItem({ icon, label, small = false, isCollapsed = false }: NavItemProps) {
  return (
    <button className={`
      flex items-center gap-4 px-3 py-3 w-full rounded-xl transition-all group cursor-pointer
      text-text-secondary hover:bg-bg hover:text-secondary
      ${isCollapsed ? 'justify-center' : 'justify-start'}
    `}>
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      {!isCollapsed && (
        <span className={`font-bold uppercase tracking-widest whitespace-nowrap fade-in ${small ? 'text-[10px]' : 'text-[11px]'}`}>
          {label}
        </span>
      )}
    </button>
  );
}