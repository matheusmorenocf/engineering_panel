/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/libs/api";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isStaff: boolean;
  isSuperuser: boolean;
  permissions: string[];
  groups: string[];
  preferences?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  updatePreferences: (newPrefs: Record<string, any>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("@App:user");
    localStorage.removeItem("@App:token");
    localStorage.removeItem("@App:refresh");
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get("user/me/");
      const userData = response.data;
      
      const formattedUser: User = {
        id: String(userData.id),
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name || "",
        email: userData.email || "",
        isStaff: userData.is_staff,
        isSuperuser: userData.is_superuser,
        permissions: userData.permissions || [],
        groups: userData.groups || [],
        preferences: userData.preferences
      };

      setUser(formattedUser);
      localStorage.setItem("@App:user", JSON.stringify(formattedUser));
      return formattedUser;
    } catch (error) {
      logout();
      return null;
    }
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("@App:user");
      const token = localStorage.getItem("@App:token");
      if (token) {
        api.defaults.headers.Authorization = `Bearer ${token}`;
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        // Sempre valida o token/perfil ao carregar o app
        await fetchUserProfile();
      }
      setIsLoading(false);
    };
    initAuth();
  }, [fetchUserProfile]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post("token/", { username, password });
      const { access, refresh } = response.data;

      localStorage.setItem("@App:token", access);
      localStorage.setItem("@App:refresh", refresh);
      api.defaults.headers.Authorization = `Bearer ${access}`;

      await fetchUserProfile();
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Erro na autenticação:", error);
      setIsLoading(false);
      return false;
    }
  }, [fetchUserProfile]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.isSuperuser) return true;
      return user.permissions.includes(permission);
    },
    [user]
  );

  // FUNÇÃO CORRIGIDA
  const updatePreferences = useCallback(async (newPrefs: Record<string, any>) => {
    try {
      // 1. URL corrigida para bater com o seu urls.py: userprefs/me/
      // 2. Enviamos newPrefs diretamente para que o Python receba o dicionário
      const response = await api.patch("userprefs/me/", newPrefs);
      
      if (user) {
        // O seu backend retorna o objeto serializado, pegamos o campo 'data' dele
        const updatedUser = { 
          ...user, 
          preferences: response.data.data || response.data 
        };
        setUser(updatedUser);
        localStorage.setItem("@App:user", JSON.stringify(updatedUser));
      }
      return true;
    } catch (error) {
      console.error("Erro ao salvar preferências no servidor:", error);
      return false;
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        updatePreferences,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}