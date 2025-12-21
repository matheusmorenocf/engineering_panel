import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg p-4 fade-in">
      <div className="w-full max-w-100 flex flex-col items-center">
        
        {/* Cabeçalho */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <LayoutDashboard className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-text-primary uppercase">
            Painel Engenharia
          </h1>
        </div>

        {/* Componente Modularizado */}
        <LoginForm />

        <footer className="mt-10">
          <p className="text-[9px] text-text-tertiary uppercase tracking-[0.3em] opacity-60 text-center">
            Sistemas de Engenharia &copy; 2025
          </p>
        </footer>
      </div>
    </div>
  );
}