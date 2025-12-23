import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

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

// Demo user for frontend demonstration
const DEMO_USER: User = {
  id: "1",
  username: "engenheiro",
  firstName: "Carlos",
  lastName: "Silva",
  email: "carlos.silva@empresa.com",
  isStaff: true,
  isSuperuser: false,
  permissions: [
    "catalog.view_product",
    "catalog.add_product",
    "catalog.change_product",
    "catalog.delete_product",
    "drawings.view_drawing",
    "drawings.add_drawing",
    "orders.view_productionorder",
  ],
  groups: ["Engenharia", "Projetos"],
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Demo authentication (in production, this would be a real API call)
    if (username && password) {
      const authenticatedUser = { ...DEMO_USER, username };
      setUser(authenticatedUser);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.isSuperuser) return true;
      
      const normalizedPermission = permission.includes(".")
        ? permission
        : `catalog.${permission}`;
      
      return user.permissions.includes(normalizedPermission);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
