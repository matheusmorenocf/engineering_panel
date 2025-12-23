import React, { createContext, useContext, useEffect, useState } from "react";

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

export const ThemeProvider = ({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("colorTheme") as ColorTheme) || "default";
    }
    return "default";
  });

  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("colorMode") as ColorMode) || "dark";
    }
    return "dark";
  });

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;

    // Apply color theme
    root.removeAttribute("data-theme");
    if (colorTheme !== "default") {
      root.setAttribute("data-theme", colorTheme);
    }
    localStorage.setItem("colorTheme", colorTheme);
  }, [colorTheme]);

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

  return (
    <ThemeContext.Provider
      value={{ colorTheme, colorMode, setColorTheme, setColorMode, isDark }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
