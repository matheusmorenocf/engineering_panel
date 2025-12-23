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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar dados do perfil (reutilizável)
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get("/api/user/me/");
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
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("@App:user");
    const token = localStorage.getItem("@App:token");

    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        fetchUserProfile();
      }
    }
    setIsLoading(false);
  }, [fetchUserProfile]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // 1. Obtém o Token
      const response = await api.post("/api/token/", { username, password });
      const { access, refresh } = response.data;

      localStorage.setItem("@App:token", access);
      localStorage.setItem("@App:refresh", refresh);
      api.defaults.headers.Authorization = `Bearer ${access}`;

      // 2. Busca os dados reais do perfil que você criou no urls.py
      await fetchUserProfile();
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Erro na autenticação:", error);
      setIsLoading(false);
      return false;
    }
  }, [fetchUserProfile]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("@App:user");
    localStorage.removeItem("@App:token");
    localStorage.removeItem("@App:refresh");
    delete api.defaults.headers.Authorization;
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.isSuperuser) return true;
      
      // Verifica se a permissão existe na lista retornada pelo Django
      return user.permissions.includes(permission);
    },
    [user]
  );
const updatePreferences = useCallback(async (newPrefs: Record<string, any>) => {
    try {
      // Usamos PATCH para aproveitar a lógica de merge que você criou no views.py
      const response = await api.patch("/api/preferences/me/", newPrefs);
      
      if (user) {
        const updatedUser = { 
          ...user, 
          preferences: response.data.data // seu serializer retorna { data: {...} }
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
        updatePreferences, // Exponha a função aqui
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}