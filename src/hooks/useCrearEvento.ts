// Hook para crear nuevos eventos via API local
import { useState } from 'react';
import type { Categoria } from '@/types/types';

export interface NuevoEventoInput {
  titulo: string;
  categoria: Exclude<Categoria, 'Todos'>;
  fecha: string;
  hora: string;
  descripcion: string;
  asistentes: number;
  imagen?: string;
  direccion?: string;
}

interface UseCrearEventoResult {
  guardando: boolean;
  error: string | null;
  crearEvento: (datos: NuevoEventoInput) => Promise<boolean>;
  resetError: () => void;
}

export function useCrearEvento(): UseCrearEventoResult {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearEvento = async (datos: NuevoEventoInput): Promise<boolean> => {
    setGuardando(true);
    setError(null);

    try {
      const res = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(datos),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al crear el evento.');
        return false;
      }

      return true;
    } catch {
      setError('Error al crear el evento. Intenta nuevamente.');
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const resetError = () => setError(null);

  return { guardando, error, crearEvento, resetError };
}
