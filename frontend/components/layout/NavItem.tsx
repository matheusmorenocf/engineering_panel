import Link from 'next/link';
import React from 'react';

interface NavItemProps {
  icon: any; // Usamos any aqui para aceitar tanto o componente quanto o elemento JSX
  label: string;
  href: string;
  isCollapsed: boolean;
  active: boolean;
}

export const NavItem = ({ icon: Icon, label, href, isCollapsed, active }: NavItemProps) => {
  return (
    <Link 
      href={href} 
      className={`
        flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
        ${active 
          ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
          : 'text-text-tertiary hover:bg-surface hover:text-text-primary'
        }
      `}
    >
      {/* Se o Icon for uma função (Componente), renderizamos <Icon />. 
          Se for um objeto (JSX), renderizamos diretamente {Icon} */}
      <div className={active ? 'text-white' : 'group-hover:text-secondary'}>
        {React.isValidElement(Icon) ? (
          Icon
        ) : (
          <Icon size={20} />
        )}
      </div>

      {!isCollapsed && (
        <span className="text-[10px] font-black uppercase tracking-widest italic whitespace-nowrap">
          {label}
        </span>
      )}
    </Link>
  );
};