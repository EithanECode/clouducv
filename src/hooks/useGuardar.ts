import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useGuardar() {
  const { user } = useAuth();
  const [cargando, setCargando] = useState<Record<string, boolean>>({});

  const toggleGuardado = useCallback(async (eventoId: string): Promise<boolean | null> => {
    if (!user) return null;
    if (cargando[eventoId]) return null;
    
    setCargando(prev => ({ ...prev, [eventoId]: true }));
    
    try {
      const res = await fetch(`/api/eventos/${eventoId}/guardar`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!res.ok) {
        toast.error('No se pudo actualizar el estado del evento');
        return null;
      }
      
      const data = await res.json();
      return data.guardado as boolean;
    } catch {
      toast.error('No se pudo actualizar el estado del evento');
      return null;
    } finally {
      setCargando(prev => ({ ...prev, [eventoId]: false }));
    }
  }, [user, cargando]);

  return { toggleGuardado, guardadoCargando: cargando };
}