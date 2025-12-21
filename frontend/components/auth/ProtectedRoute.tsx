"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { apiFetch } from '@/lib/apiFetch';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string | null;
}

export default function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          addToast("Acesso Restrito: Por favor, faça login.", "warning");
          // Pequeno atraso para garantir que o Toast seja registrado antes da troca de rota
          setTimeout(() => router.push('/login'), 150);
          return;
        }

        const response = await apiFetch('/api/user/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const perms = data.permissions || [];
          
          if (data.is_superuser || !permission || perms.includes(permission)) {
            setIsAuthorized(true);
          } else {
            addToast("Você não tem permissão para acessar esta área.", "error");
            setTimeout(() => router.push('/dashboard'), 150);
          }
        } else {
          localStorage.removeItem('access_token');
          addToast("Sessão expirada.", "info");
          setTimeout(() => router.push('/login'), 150);
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [permission, router, addToast]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg">
        <Loader2 className="animate-spin text-secondary" size={32} />
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}