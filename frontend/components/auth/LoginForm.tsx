import React from 'react';
import { Lock } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  return (
    <div className="w-full shadow-2xl border border-border bg-surface rounded-lg p-8">
      <form className="flex flex-col gap-6">
        
        {/* Campo E-mail */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-text-primary uppercase tracking-widest ml-1">
            E-mail Corporativo
          </label>
          <Input 
            type="text" 
            placeholder="master" 
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
              required
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
          </div>
        </div>

        <Button type="submit">
          Entrar no Painel
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