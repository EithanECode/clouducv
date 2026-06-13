/* eslint-disable @typescript-eslint/no-explicit-any */
// Hook para obtener eventos desde API local
import { useState, useEffect } from 'react';
import type { Evento } from '@/types/types';
import { useAuth } from '@/contexts/AuthContext';

interface UseEventosResult {
  eventos: Evento[];
  cargando: boolean;
  error: string | null;
  recargar: () => void;
}

export function useEventos(): UseEventosResult {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contador, setContador] = useState(0);

  useEffect(() => {
    let cancelado = false;

    const fetchEventos = async () => {
      setCargando(true);
      setError(null);

      try {
        const res = await fetch('/api/eventos', { credentials: 'include' });
        if (!res.ok) throw new Error('Error al cargar eventos');

        const data = await res.json();
        if (cancelado) return;

        const eventosConEstado: Evento[] = (data as any[]).map((row) => ({
          ...row,
          likes: row.likes || 0,
          guardado: row.guardado || false,
          like_local: row.like_local || false,
        }));

        setEventos(eventosConEstado);
      } catch {
        if (!cancelado) setError('No se pudieron cargar los eventos. Intenta nuevamente.');
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    fetchEventos();

    return () => { cancelado = true; };
  }, [contador, user]);

  const recargar = () => setContador((c) => c + 1);

  return { eventos, cargando, error, recargar };
}
