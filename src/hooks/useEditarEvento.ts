// Hook para editar un evento propio via API local
import { useState } from 'react';
import type { Categoria } from '@/types/types';

type CategoriaEvento = Exclude<Categoria, 'Todos'>;

export interface EditarEventoInput {
  id: string;
  titulo: string;
  categoria: CategoriaEvento;
  fecha: string;
  hora: string;
  descripcion: string;
  asistentes: number;
  imagen?: string;
  direccion?: string;
}

interface UseEditarEventoResult {
  guardando: boolean;
  error: string | null;
  editarEvento: (datos: EditarEventoInput) => Promise<boolean>;
  resetError: () => void;
}

export function useEditarEvento(): UseEditarEventoResult {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editarEvento = async (datos: EditarEventoInput): Promise<boolean> => {
    setGuardando(true);
    setError(null);

    try {
      const res = await fetch(`/api/eventos/${datos.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(datos),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al actualizar el evento.');
        return false;
      }

      return true;
    } catch {
      setError('Error al actualizar el evento. Intenta nuevamente.');
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const resetError = () => setError(null);

  return { guardando, error, editarEvento, resetError };
}
