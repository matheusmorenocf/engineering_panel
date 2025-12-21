"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Palette, Moon, Sun, LogOut } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  isCollapsed: boolean;
  profileHref?: string;
};

export default function UserMenu({ isCollapsed, profileHref = "/dashboard" }: Props) {
  const { addToast } = useToast();
  const { user, loading,updatePreferences, logout } = useAuth();

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentTheme = user?.preferences?.colorMode === "dark" ? "dark" : "light";
  const currentColorTheme = user?.preferences?.theme || "default";

  // Fecha menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayGroups = Array.isArray(user?.groups)
    ? user?.groups.join(", ")
    : user?.groups;

  return (
    <div className="p-4 border-t border-border flex flex-col gap-1">
      {/* Perfil */}
      <div className={`mb-2 transition-all ${isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
        <div className="flex items-center gap-3 p-3 bg-bg/50 rounded-2xl">
          <Link
            href={profileHref}
            className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm"
          >
            {(user?.username?.slice(0, 2) || "US").toUpperCase()}
          </Link>

          <div className="flex flex-col truncate">
            <span className="text-[11px] font-black text-primary uppercase italic tracking-wider">
              {loading ? "Carregando..." : user?.username || "Usuário"}
            </span>

            <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest truncate">
              {loading ? "..." : displayGroups || ""}
            </span>

            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">
                Sincronizado
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Temas Visuais */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
          className={`
            flex items-center gap-4 px-3 py-3 w-full rounded-xl transition-all
            text-text-secondary hover:bg-bg hover:text-secondary
            ${isCollapsed ? "justify-center" : "justify-start"}
          `}
        >
          <Palette size={20} />
          {!isCollapsed && <span className="font-bold uppercase text-[10px] tracking-widest">Temas Visuais</span>}
        </button>

        {isThemeMenuOpen && (
          <div className="absolute left-full bottom-0 ml-2 p-3 bg-surface border border-border rounded-2xl shadow-2xl flex gap-3 z-50">
            {["default", "emerald", "amber", "ruby", "amethyst"].map((theme) => (
              <button
                key={theme}
                onClick={async () => {
                  setIsThemeMenuOpen(false);
                  await updatePreferences({ theme });
                  addToast("Tema atualizado.", "success");
                }}
                className={`
                  w-6 h-6 rounded-full border-2 transition-transform hover:scale-125
                  ${theme === "default" && "bg-blue-500"}
                  ${theme === "emerald" && "bg-emerald-500"}
                  ${theme === "amber" && "bg-amber-500"}
                  ${theme === "ruby" && "bg-rose-500"}
                  ${theme === "amethyst" && "bg-violet-500"}
                  ${currentColorTheme === theme ? "border-white/80" : "border-white/20"}
                `}
              />
            ))}
          </div>
        )}
      </div>

      {/* Claro / Escuro */}
      <button
        disabled={loading}
        onClick={async () => {
          if (loading) return;

          const nextTheme = currentTheme === "dark" ? "light" : "dark";

          await updatePreferences({ colorMode: nextTheme });
          addToast(
            nextTheme === "dark" ? "Modo escuro ativado." : "Modo claro ativado.",
            "success"
          );
        }}
        className={`
          flex items-center gap-4 px-3 py-3 w-full rounded-xl transition-all
          ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          text-text-secondary hover:bg-bg hover:text-secondary
          ${isCollapsed ? "justify-center" : "justify-start"}
        `}
      >
        {currentTheme === "light" ? <Moon size={20} /> : <Sun size={20} />}

        {!isCollapsed && (
          <span className="font-bold uppercase text-[10px] tracking-widest">
            {currentTheme === "light" ? "Modo Noite" : "Modo Claro"}
          </span>
        )}
      </button>


      {/* Logout */}
      <button
        onClick={() => logout({ redirectTo: "/login" })}
        className={`flex items-center gap-4 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all ${
          isCollapsed ? "justify-center" : ""
        }`}
      >
        <LogOut size={20} />
        {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>}
      </button>
    </div>
  );
}
