// Hook para eliminar un evento propio via API local
import { useState } from 'react';

interface UseEliminarEventoResult {
  eliminando: boolean;
  error: string | null;
  eliminarEvento: (id: string) => Promise<boolean>;
  resetError: () => void;
}

export function useEliminarEvento(): UseEliminarEventoResult {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eliminarEvento = async (id: string): Promise<boolean> => {
    setEliminando(true);
    setError(null);

    try {
      const res = await fetch(`/api/eventos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al eliminar el evento.');
        return false;
      }

      return true;
    } catch {
      setError('Error al eliminar el evento. Intenta nuevamente.');
      return false;
    } finally {
      setEliminando(false);
    }
  };

  const resetError = () => setError(null);

  return { eliminando, error, eliminarEvento, resetError };
}
