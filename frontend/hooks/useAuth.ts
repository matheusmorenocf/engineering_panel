import { useUser } from "@/context/UserContext";

export function useAuth() {
  const { user, loading, hasGroup, hasPermission, refreshUser, logout, updatePreferences } = useUser();
  return { user, loading, hasGroup, hasPermission, refreshUser, logout, updatePreferences };
}
