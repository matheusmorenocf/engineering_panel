import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/apiFetch';

export const useCatalogParams = (isOpen: boolean) => {
  const [sectors, setSectors] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const CACHE_EXPIRATION = 60 * 60 * 1000; // 1 Hora

  const fetchParams = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      // ✅ URLs com barra final para satisfazer o Django Router
      const [secRes, typRes] = await Promise.all([
        apiFetch('/api/catalog/management/sectors/'),
        apiFetch('/api/catalog/management/types/')
      ]);

      const secData = await secRes.json();
      const typData = await typRes.json();

      const sList = Array.isArray(secData) ? secData : secData.results || [];
      const tList = Array.isArray(typData) ? typData : typData.results || [];

      setSectors(sList);
      setTypes(tList);

      localStorage.setItem('cache_management_setor', JSON.stringify({ data: sList, timestamp: Date.now() }));
      localStorage.setItem('cache_management_tipo', JSON.stringify({ data: tList, timestamp: Date.now() }));
    } catch (e) {
      console.error("Erro ao sincronizar parâmetros:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const getCached = (key: string) => {
        const cached = localStorage.getItem(`cache_management_${key}`);
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        return (Date.now() - timestamp < CACHE_EXPIRATION) ? data : null;
      };

      const s = getCached('setor');
      const t = getCached('tipo');

      if (s) setSectors(s);
      if (t) setTypes(t);
      
      fetchParams(!!(s && t)); 
    }
  }, [isOpen, fetchParams]);

  return { sectors, types, loading, refresh: fetchParams };
};