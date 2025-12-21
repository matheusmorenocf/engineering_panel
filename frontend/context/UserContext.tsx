"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

export type ColorTheme = "default" | "emerald" | "amber" | "ruby" | "amethyst";

export type UserPreferences = {
  colorMode?: "light" | "dark" | "system";
  theme?: ColorTheme;
};

export type UserProfile = {
  id: number;
  username: string;
  first_name?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  permissions?: string[];
  groups?: string[];
  preferences?: UserPreferences;
};

type UserContextValue = {
  user: UserProfile | null;
  loading: boolean;

  refreshUser: () => Promise<void>;
  logout: (opts?: { redirectTo?: string }) => void;

  hasGroup: (groupName: string) => boolean;
  hasPermission: (perm: string) => boolean;

  updatePreferences: (patch: Partial<UserPreferences>) => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

function applyThemeAttrs(prefs?: UserPreferences) {
  // mantém seu padrão atual (data-theme e data-color-theme)
  const mode = prefs?.colorMode;
  const theme = prefs?.theme;

  if (mode === "dark" || mode === "light") {
    document.documentElement.setAttribute("data-theme", mode);
  }

  if (theme) {
    document.documentElement.setAttribute("data-color-theme", theme);
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUser(null);
        return;
      }

      // ✅ apiFetch faz refresh automático se precisar
      const response = await apiFetch("/api/user/me", { method: "GET" });

      if (response.ok) {
        const data = (await response.json()) as UserProfile;
        setUser(data);

        // cache + aplica preferências (se vierem)
        const prefs = data.preferences ?? {};
        localStorage.setItem("userPreferences", JSON.stringify(prefs));
        applyThemeAttrs(prefs);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Erro ao carregar usuário:", e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // aplica cache de preferências antes (evita flicker dentro do app)
    try {
      const raw = localStorage.getItem("userPreferences");
      if (raw) applyThemeAttrs(JSON.parse(raw));
    } catch {}

    refreshUser();
  }, [refreshUser]);

  const updatePreferences = useCallback(async (patch: Partial<UserPreferences>) => {
    // otimista: cache e html attrs
    try {
      const raw = localStorage.getItem("userPreferences");
      const current = raw ? (JSON.parse(raw) as UserPreferences) : {};
      const next = { ...current, ...patch };
      localStorage.setItem("userPreferences", JSON.stringify(next));
      applyThemeAttrs(next);

      // mantém user em memória consistente
      setUser((prev) => (prev ? { ...prev, preferences: { ...(prev.preferences || {}), ...patch } } : prev));
    } catch {}

    // persiste no backend (via proxy)
    const res = await apiFetch("/api/user/me", {
      method: "PATCH",
      body: JSON.stringify(patch),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("Falha ao salvar preferences:", res.status);
      // fallback: re-sync
      await refreshUser();
    }
  }, [refreshUser]);

  const hasGroup = useCallback(
    (groupName: string) => Boolean(user?.groups?.includes(groupName)),
    [user]
  );

  const hasPermission = useCallback(
    (perm: string) => {
      if (user?.is_superuser) return true;
      return Boolean(user?.permissions?.includes(perm));
    },
    [user]
  );

  const logout = useCallback((opts?: { redirectTo?: string }) => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.setAttribute("data-color-theme", "default");
    } catch {}

    setUser(null);

    if (opts?.redirectTo) {
      window.location.href = opts.redirectTo;
    }
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      loading,
      refreshUser,
      logout,
      hasGroup,
      hasPermission,
      updatePreferences,
    }),
    [user, loading, refreshUser, logout, hasGroup, hasPermission, updatePreferences]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
