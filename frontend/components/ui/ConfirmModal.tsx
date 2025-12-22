"use client";

import { X, AlertTriangle, LogOut, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = 'info',
  isLoading = false
}: ConfirmModalProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isMounted || !isOpen) return null;

  const variants = {
    danger: {
      icon: <Trash2 size={24} />,
      lightColor: 'bg-red-500/10',
      textColor: 'text-red-500',
      btnColor: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      icon: <AlertTriangle size={24} />,
      lightColor: 'bg-amber-500/10',
      textColor: 'text-amber-500',
      btnColor: 'bg-amber-500 hover:bg-amber-600'
    },
    success: {
      icon: <CheckCircle2 size={24} />,
      lightColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-500',
      btnColor: 'bg-emerald-500 hover:bg-emerald-600'
    },
    info: {
      icon: <LogOut size={24} />,
      lightColor: 'bg-secondary/10',
      textColor: 'text-secondary',
      btnColor: 'bg-secondary hover:bg-secondary-dark'
    }
  };

  const currentVariant = variants[variant];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={isLoading ? undefined : onClose} />
      <div className="relative w-full max-w-md bg-surface border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button onClick={onClose} disabled={isLoading} className="absolute top-6 right-6 p-2 text-text-tertiary hover:bg-bg rounded-full transition-colors">
          <X size={20} />
        </button>
        <div className="p-8 flex flex-col items-center text-center">
          <div className={`p-4 ${currentVariant.lightColor} ${currentVariant.textColor} rounded-2xl mb-6`}>
            {currentVariant.icon}
          </div>
          <h3 className="text-xl font-black text-text-primary uppercase italic tracking-tighter mb-2">{title}</h3>
          <p className="text-sm text-text-tertiary font-bold leading-relaxed mb-8">{description}</p>
          <div className="flex w-full gap-3">
            <button onClick={onClose} disabled={isLoading} className="flex-1 py-4 bg-bg text-text-primary border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-border transition-all">
              {cancelText}
            </button>
            <button onClick={onConfirm} disabled={isLoading} className={`flex-1 py-4 ${currentVariant.btnColor} text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all`}>
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};