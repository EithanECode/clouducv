import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useLikes() {
  const { user } = useAuth();
  const [cargando, setCargando] = useState<Record<string, boolean>>({});

  const toggleLike = useCallback(async (eventoId: string): Promise<boolean> => {
    if (!user) return false;
    if (cargando[eventoId]) return false;
    
    setCargando(prev => ({ ...prev, [eventoId]: true }));
    
    try {
      const res = await fetch(`/api/eventos/${eventoId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!res.ok) return false;
      return true;
    } catch {
      return false;
    } finally {
      setCargando(prev => ({ ...prev, [eventoId]: false }));
    }
  }, [user, cargando]);

  return { toggleLike, likesCargando: cargando };
}