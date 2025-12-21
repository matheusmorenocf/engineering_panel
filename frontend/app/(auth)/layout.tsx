"use client";

import Sidebar from '@/components/layout/Sidebard';
import React, { useState, useEffect } from 'react';


export type ColorTheme = 'default' | 'emerald' | 'amber' | 'ruby' | 'amethyst';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as any;
    const savedColor = localStorage.getItem('colorTheme') as any;
    if (savedTheme) setTheme(savedTheme);
    if (savedColor) setColorTheme(savedColor);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-color-theme', colorTheme);
      localStorage.setItem('theme', theme);
      localStorage.setItem('colorTheme', colorTheme);
    }
  }, [theme, colorTheme, mounted]);

  if (!mounted) return <div className="min-h-screen bg-[#f8fafc]" />;

  return (
    <div className="flex min-h-screen bg-bg antialiased transition-all duration-500">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        toggleTheme={() => setTheme(p => p === 'light' ? 'dark' : 'light')}
        currentTheme={theme}
        setColorTheme={setColorTheme}
        currentColorTheme={colorTheme}
      />
      <main className={`flex-1 flex flex-col items-center p-12 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
}