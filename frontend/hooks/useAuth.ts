import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/user/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Função para verificar se tem um grupo específico
  const hasGroup = (groupName: string) => user?.groups?.includes(groupName);

  // Função para verificar permissão específica (ex: 'edit_form')
  const hasPermission = (perm: string) => user?.permissions?.includes(perm) || user?.role === 'admin';

  return { user, loading, hasGroup, hasPermission };
}