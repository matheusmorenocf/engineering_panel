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
      // Chamada POST para a rota que você validou
      const response = await fetch('/api/token/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Armazena os tokens JWT retornados (access e refresh)
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        // Redireciona para o dashboard após o sucesso
        router.push('/dashboard');
      } else {
        // Trata erro de credenciais inválidas (conforme o JSON de erro do Django)
        setError(data.detail || 'Usuário ou senha incorretos.');
      }
    } catch (err: any) {
      console.error("Erro na autenticação:", err);
      setError('Não foi possível conectar ao servidor de engenharia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full shadow-2xl border border-border bg-surface rounded-lg p-8">
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        
        {/* Campo Usuário */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-text-primary uppercase tracking-widest ml-1">
            Usuário do Sistema
          </label>
          <Input 
            type="text" 
            placeholder="Digite seu usuário" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Campo Senha */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-text-primary uppercase tracking-widest ml-1">
            Senha de Acesso
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

        {/* Mensagem de Erro Visual */}
        {error && (
          <div className="flex items-center gap-2 justify-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <AlertCircle className="text-red-500" size={14} />
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">
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
          <a href="#" className="text-[11px] text-secondary hover:underline font-semibold transition-all">
            Esqueceu sua senha?
          </a>
        </div>
      </form>
    </div>
  );
}