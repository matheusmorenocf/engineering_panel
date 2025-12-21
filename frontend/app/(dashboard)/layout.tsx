"use client";

import Sidebar from '@/components/layout/Sidebard';
import React, { useState, useEffect } from 'react';

// Definição dos tipos de temas de cores disponíveis
export type ColorTheme = 'default' | 'emerald' | 'amber' | 'ruby' | 'amethyst';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Estados de controle da interface
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('default');

  // Inicialização: Tenta recuperar preferências salvas no navegador
  useEffect(() => {
    // Recupera do localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const savedColor = localStorage.getItem('colorTheme') as ColorTheme;
    
    // CORREÇÃO: Usar setAttribute em vez de classList para o Tema Escuro
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Define um padrão se não houver nada salvo
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Aplica a cor do tema
    if (savedColor) {
      setColorTheme(savedColor);
      document.documentElement.setAttribute('data-color-theme', savedColor);
    }
  }, []);

  // Alternar entre modo claro e escuro
  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Atualiza estado e storage
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // CORREÇÃO: Atualiza o atributo no HTML para ativar o CSS [data-theme="dark"]
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Alterar o tema de cor (azul, verde, amarelo, etc)
  const handleSetColorTheme = (theme: ColorTheme) => {
    setColorTheme(theme);
    localStorage.setItem('colorTheme', theme);
    
    // Mantém a lógica correta que já existia para cor
    document.documentElement.setAttribute('data-color-theme', theme);
  };

  return (
    <div className="flex min-h-screen bg-bg antialiased transition-colors duration-300">
      
      {/* Sidebar Fixa */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        toggleTheme={toggleTheme}
        currentTheme={currentTheme}
        setColorTheme={handleSetColorTheme}
        currentColorTheme={colorTheme}
      />
      
      {/* Área de Conteúdo Principal */}
      <main 
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300
          ${isCollapsed ? 'ml-20' : 'ml-64'}
        `}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}