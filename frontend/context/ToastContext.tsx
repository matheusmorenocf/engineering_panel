"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // O TEMPO É CONFIGURADO AQUI (3000ms = 3 segundos)
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* CONTAINER: Centralizado no topo com largura reduzida (max-w-xs) */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-3 w-full max-w-xs px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`relative flex items-center gap-3 p-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 bg-surface overflow-hidden pointer-events-auto border-border/50`}
          >
            {/* Ícone de Status */}
            <div className={`shrink-0 ${
              toast.type === 'success' ? 'text-emerald-500' :
              toast.type === 'error' ? 'text-red-500' :
              toast.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
            }`}>
              {toast.type === 'success' && <CheckCircle2 size={16} />}
              {toast.type === 'error' && <AlertCircle size={16} />}
              {toast.type === 'warning' && <AlertTriangle size={16} />}
              {toast.type === 'info' && <Info size={16} />}
            </div>

            {/* Mensagem compacta */}
            <p className="text-[9px] font-black text-text-primary uppercase tracking-wider flex-1 italic leading-tight">
              {toast.message}
            </p>

            {/* Botão Fechar */}
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-bg rounded-md text-text-tertiary transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>

            {/* BARRA DE PROGRESSO: O tempo aqui deve bater com o setTimeout (5s) */}
            <div className="absolute bottom-0 left-0 h-0.75 bg-border/20 w-full">
              <div 
                className={`h-full ${
                  toast.type === 'success' ? 'bg-emerald-500' :
                  toast.type === 'error' ? 'bg-red-500' :
                  toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ 
                  animation: 'toast-progress 3s linear forwards' 
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);