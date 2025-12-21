"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Adicionado useRouter
import { 
  Palette, Moon, Sun, LogOut, ChevronLeft, Cpu 
} from 'lucide-react';
import { NavItem } from './NavItem';
import { DASHBOARD_ROUTES } from '@/lib/routes-config';
import { ColorTheme } from '@/app/(dashboard)/layout';
import { useToast } from '@/context/ToastContext'; // Para feedback visual

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  toggleTheme: () => void;
  currentTheme: 'light' | 'dark';
  setColorTheme: (theme: ColorTheme) => void;
  currentColorTheme: ColorTheme;
}

export default function Sidebar({ 
  isCollapsed, 
  setIsCollapsed, 
  toggleTheme, 
  currentTheme,
  setColorTheme,
  currentColorTheme 
}: SidebarProps) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter(); // Hook de navegação
  const { addToast } = useToast();

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FUNÇÃO DE LOGOUT ---
  const handleLogout = () => {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      addToast("Até logo! Logout realizado.", "success");
      router.push('/login');
    } catch (error) {
      console.error("Erro no logout", error);
    }
  };

  return (
    <aside className={`
      border-r border-border bg-surface flex flex-col fixed h-full z-50 transition-all duration-300
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      
      {/* Header com Link na CPU */}
      <div className={`p-6 flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 fade-in">
            <Link 
              href="/dashboard" 
              className="w-8 h-8 border border-secondary rounded-lg flex items-center justify-center hover:bg-secondary/10 transition-colors cursor-pointer"
            >
              <Cpu size={18} className="text-secondary" />
            </Link>
            <span className="font-black text-primary italic tracking-tighter text-lg">ENG.V3</span>
          </div>
        )}
        {isCollapsed && (
          <Link 
            href="/dashboard" 
            className="w-8 h-8 border border-secondary rounded-lg flex items-center justify-center hover:bg-secondary/10 transition-colors cursor-pointer"
          >
            <Cpu size={18} className="text-secondary" />
          </Link>
        )}
        <button 
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1 hover:bg-bg rounded-full text-text-tertiary transition-transform duration-300 cursor-pointer ${isCollapsed ? 'rotate-180 mt-4 absolute -right-3 bg-surface border border-border shadow-sm' : ''}`}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Menu Principal Dinâmico */}
      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {DASHBOARD_ROUTES.map((route) => (
          <NavItem 
            key={route.href}
            icon={route.icon} 
            label={route.label} 
            href={route.href}
            isCollapsed={isCollapsed} 
            active={pathname === route.href}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border flex flex-col gap-1">
        
        {/* Seção Quem está conectado (Perfil) - Mantida Exatamente Igual */}
        <div className={`mb-2 transition-all ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 p-3 bg-bg/50 rounded-2xl border border-transparent">
            <div className="w-10 h-10 bg-secondary rounded-full flex min-w-10 items-center justify-center text-white font-bold text-xs shadow-sm">
              MA
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[11px] font-black text-primary uppercase italic tracking-wider leading-none">Master</span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Sincronizado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Temas Visuais */}
        <div className="relative" ref={menuRef}>
          <button 
            type="button"
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className={`
              flex items-center gap-4 px-3 py-3 w-full rounded-xl transition-all group cursor-pointer
              text-text-secondary hover:bg-bg hover:text-secondary
              ${isCollapsed ? 'justify-center' : 'justify-start'}
              ${isThemeMenuOpen ? 'bg-bg text-secondary' : ''}
            `}
          >
            <Palette size={20} className="group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span className="font-bold uppercase tracking-widest text-[10px]">Temas Visuais</span>}
          </button>

          {isThemeMenuOpen && (
            <div className={`
              absolute left-full bottom-0 ml-2 p-3 bg-surface border border-border rounded-2xl shadow-2xl
              flex gap-3 fade-in z-50
            `}>
              <button type="button" onClick={() => { setColorTheme('default'); setIsThemeMenuOpen(false); }} className="w-6 h-6 bg-blue-500 rounded-full cursor-pointer hover:scale-125 transition-transform border-2 border-white/20 shadow-sm" />
              <button type="button" onClick={() => { setColorTheme('emerald'); setIsThemeMenuOpen(false); }} className="w-6 h-6 bg-emerald-500 rounded-full cursor-pointer hover:scale-125 transition-transform border-2 border-white/20 shadow-sm" />
              <button type="button" onClick={() => { setColorTheme('amber'); setIsThemeMenuOpen(false); }} className="w-6 h-6 bg-amber-500 rounded-full cursor-pointer hover:scale-125 transition-transform border-2 border-white/20 shadow-sm" />
              <button type="button" onClick={() => { setColorTheme('ruby'); setIsThemeMenuOpen(false); }} className="w-6 h-6 bg-rose-500 rounded-full cursor-pointer hover:scale-125 transition-transform border-2 border-white/20 shadow-sm" />
              <button type="button" onClick={() => { setColorTheme('amethyst'); setIsThemeMenuOpen(false); }} className="w-6 h-6 bg-violet-500 rounded-full cursor-pointer hover:scale-125 transition-transform border-2 border-white/20 shadow-sm" />
            </div>
          )}
        </div>

        {/* Botão Modo Claro/Escuro */}
        <button 
          type="button"
          onClick={toggleTheme}
          className={`
            flex items-center gap-4 px-3 py-3 w-full rounded-xl transition-all group cursor-pointer
            text-text-secondary hover:bg-bg hover:text-secondary
            ${isCollapsed ? 'justify-center' : 'justify-start'}
          `}
        >
          {currentTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          {!isCollapsed && (
            <span className="font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">
              {currentTheme === 'light' ? 'Modo Noite' : 'Modo Claro'}
            </span>
          )}
        </button>

        {/* Botão Sair (Agora com ação) */}
        <button 
          type="button"
          onClick={handleLogout}
          className={`flex items-center gap-4 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all group mt-2 cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>}
        </button>
      </div>
    </aside>
  );
}