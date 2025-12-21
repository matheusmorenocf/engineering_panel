"use client";

import React, { useState } from 'react';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Chamada para o endpoint de token do Django
      const response = await fetch('/api/token/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password 
        }),
      });

      const contentType = response.headers.get("content-type");
      
      // Proteção contra erros de sistema (HTML) do Django
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Erro interno no servidor. Verifique as migrações do banco de dados.");
      }

      const data = await response.json();

      if (response.ok) {
        // Salva os tokens JWT conforme configurado no SimpleJWT
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        // Redireciona para o dashboard
        router.push('/dashboard');
      } else {
        // Erro de credenciais (ex: usuário ou senha inválidos)
        setError(data.detail || 'Usuário ou senha incorretos.');
      }
    } catch (err: any) {
      console.error("Erro no processo de login:", err);
      setError(err.message || 'Falha na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full shadow-2xl border border-border bg-surface rounded-lg p-8">
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-text-primary uppercase tracking-widest ml-1">
            Usuário
          </label>
          <Input 
            type="text" 
            placeholder="Digite seu usuário" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-text-primary uppercase tracking-widest ml-1">
            Senha
          </label>
          <div className="relative">
            <Input 
              type="password" 
              placeholder="••••••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 justify-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <AlertCircle className="text-red-500" size={14} />
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider text-center">
              {error}
            </p>
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              <span>Autenticando...</span>
            </div>
          ) : (
            "Entrar no Painel"
          )}
        </Button>

        <div className="text-center">
          <a href="#" className="text-[11px] text-secondary hover:underline font-semibold">
            Esqueceu sua senha?
          </a>
        </div>
      </form>
    </div>
  );
}