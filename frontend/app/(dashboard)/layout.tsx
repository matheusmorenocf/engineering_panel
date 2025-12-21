"use client";

import Sidebar from "@/components/layout/Sidebard";
import { apiFetch } from "@/lib/apiFetch";
import React, { useState, useEffect } from "react";

export type ColorTheme = "default" | "emerald" | "amber" | "ruby" | "amethyst";

type UserPreferences = {
  colorMode?: "light" | "dark" | "system";
  theme?: ColorTheme;
};

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
}

function applyColorTheme(color: ColorTheme) {
  document.documentElement.setAttribute("data-color-theme", color);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default");

  useEffect(() => {
    // 1) aplica cache local imediatamente (sem flicker)
    try {
      const raw = localStorage.getItem("userPreferences");
      if (raw) {
        const prefs = JSON.parse(raw) as UserPreferences;

        // dark/light
        const savedMode = prefs.colorMode;
        if (savedMode === "dark" || savedMode === "light") {
          setCurrentTheme(savedMode);
          applyTheme(savedMode);
        } else {
          applyTheme("light");
        }

        // cor
        if (prefs.theme) {
          setColorTheme(prefs.theme);
          applyColorTheme(prefs.theme);
        } else {
          applyColorTheme("default");
        }
      } else {
        // padrão se não houver cache
        applyTheme("light");
        applyColorTheme("default");
      }
    } catch {
      applyTheme("light");
      applyColorTheme("default");
    }

    // 2) sincroniza com o backend (banco)
    async function syncFromBackend() {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await apiFetch("/api/user/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json().catch(() => ({}));
      const prefs: UserPreferences = data?.preferences || {};

      // salva no cache local para próximo load (e para o script do RootLayout)
      localStorage.setItem("userPreferences", JSON.stringify(prefs));

      // aplica tema claro/escuro
      if (prefs.colorMode === "dark" || prefs.colorMode === "light") {
        setCurrentTheme(prefs.colorMode);
        applyTheme(prefs.colorMode);
      }

      // aplica cor
      if (prefs.theme) {
        setColorTheme(prefs.theme);
        applyColorTheme(prefs.theme);
      }
    }

    syncFromBackend();
  }, []);

  // Alternar claro/escuro (a UI muda na hora; o UserMenu já faz PATCH e salva no banco)
  const toggleTheme = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(newTheme);
    applyTheme(newTheme);

    // mantém cache local coerente
    try {
      const raw = localStorage.getItem("userPreferences");
      const prefs = raw ? (JSON.parse(raw) as UserPreferences) : {};
      prefs.colorMode = newTheme;
      localStorage.setItem("userPreferences", JSON.stringify(prefs));
    } catch {}
  };

  // Alterar tema de cor (UI + cache local; backend salva via UserMenu)
  const handleSetColorTheme = (theme: ColorTheme) => {
    setColorTheme(theme);
    applyColorTheme(theme);

    try {
      const raw = localStorage.getItem("userPreferences");
      const prefs = raw ? (JSON.parse(raw) as UserPreferences) : {};
      prefs.theme = theme;
      localStorage.setItem("userPreferences", JSON.stringify(prefs));
    } catch {}
  };

  return (
    <div className="flex min-h-screen bg-bg antialiased transition-colors duration-300">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        toggleTheme={toggleTheme}
        currentTheme={currentTheme}
        setColorTheme={handleSetColorTheme}
        currentColorTheme={colorTheme}
      />

      <main
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300
          ${isCollapsed ? "ml-20" : "ml-64"}
        `}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
