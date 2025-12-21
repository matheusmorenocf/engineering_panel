"use client";

import Sidebar from '@/components/layout/Sidebard';
import React, { useState, useEffect } from 'react';


export type ColorTheme = 'default' | 'emerald' | 'amber' | 'ruby' | 'amethyst';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('default');
  const [mounted, setMounted] = useState(false);

  // Sincronização inicial
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const savedColor = localStorage.getItem('colorTheme') as ColorTheme;
    if (savedTheme) setTheme(savedTheme);
    if (savedColor) setColorTheme(savedColor);
  }, []);

  // Aplicação dos temas no elemento raiz
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-color-theme', colorTheme);
      localStorage.setItem('theme', theme);
      localStorage.setItem('colorTheme', colorTheme);
    }
  }, [theme, colorTheme, mounted]);

  const changeColorTheme = (newColor: ColorTheme) => {
    setColorTheme(newColor);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // IMPORTANTE: Retornamos a mesma estrutura de tags mesmo antes do mounted
  // apenas escondendo o conteúdo ou usando cores neutras para evitar o erro de hidratação.
  return (
    <div className="flex min-h-screen bg-bg antialiased transition-all duration-300">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        toggleTheme={toggleTheme}
        currentTheme={theme}
        setColorTheme={changeColorTheme}
        currentColorTheme={colorTheme}
      />

      <main 
        className={`flex-1 flex flex-col items-center p-12 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Renderiza o conteúdo apenas após montar no cliente para garantir acesso ao localStorage/theme */}
        {mounted ? children : <div className="w-full h-full" />}
      </main>
    </div>
  );
}