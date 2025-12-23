import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

export type ColorTheme = "default" | "emerald" | "amber" | "ruby" | "amethyst";
export type ColorMode = "light" | "dark" | "system";

interface ThemeContextType {
  colorTheme: ColorTheme;
  colorMode: ColorMode;
  setColorTheme: (theme: ColorTheme) => void;
  setColorMode: (mode: ColorMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, updatePreferences } = useAuth();

  // Estados iniciais baseados no localStorage para evitar "flash" de luz/cor ao carregar
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("colorTheme") as ColorTheme) || "default";
    }
    return "default";
  });

  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("colorMode") as ColorMode) || "dark";
    }
    return "dark";
  });

  const [isDark, setIsDark] = useState(true);

  // Sincroniza estados quando o usuário loga e traz preferências do DB
  useEffect(() => {
    if (user?.preferences) {
      if (user.preferences.colorTheme) {
        setColorThemeState(user.preferences.colorTheme);
      }
      if (user.preferences.colorMode) {
        setColorModeState(user.preferences.colorMode);
      }
    }
  }, [user]);

  // Aplicação do Tema de Cores (emerald, ruby, etc)
  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute("data-theme");
    if (colorTheme !== "default") {
      root.setAttribute("data-theme", colorTheme);
    }
    localStorage.setItem("colorTheme", colorTheme);
  }, [colorTheme]);

  // Aplicação do Modo (light/dark/system)
  useEffect(() => {
    const root = document.documentElement;

    const applyDarkMode = (dark: boolean) => {
      if (dark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      setIsDark(dark);
    };

    if (colorMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyDarkMode(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyDarkMode(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      applyDarkMode(colorMode === "dark");
    }

    localStorage.setItem("colorMode", colorMode);
  }, [colorMode]);

  // Funções para alterar e persistir no backend
  const setColorTheme = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
    if (user) {
      updatePreferences({ colorTheme: theme });
    }
  }, [user, updatePreferences]);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    if (user) {
      updatePreferences({ colorMode: mode });
    }
  }, [user, updatePreferences]);

  return (
    <ThemeContext.Provider
      value={{ colorTheme, colorMode, setColorTheme, setColorMode, isDark }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}