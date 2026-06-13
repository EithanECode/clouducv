// Hook para comentarios de eventos con polling (reemplaza Realtime)
import { useState, useEffect, useCallback, useRef } from 'react';
import type { MensajeEvento } from '@/types/types';

interface UseMensajesEventoResult {
  mensajes: MensajeEvento[];
  cargando: boolean;
  enviando: boolean;
  error: string | null;
  enviarMensaje: (contenido: string, replyToId?: string) => Promise<boolean>;
  toggleLikeMensaje: (mensajeId: string) => Promise<boolean>;
  getMensajeLikes: (mensajeId: string) => Promise<{ count: number, userLiked: boolean }>;
  resetError: () => void;
}

export function useMensajesEvento(eventoId: string | null): UseMensajesEventoResult {
  const [mensajes, setMensajes] = useState<MensajeEvento[]>([]);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cargarMensajes = useCallback(async () => {
    if (!eventoId) return;

    try {
      const res = await fetch(`/api/eventos/${eventoId}/mensajes`, { credentials: 'include' });
      if (!res.ok) throw new Error('Error al cargar mensajes');

      const data = await res.json();
      setMensajes(data as MensajeEvento[]);
    } catch (err) {
      console.error(err);
    }
  }, [eventoId]);

  // Cargar al montar
  useEffect(() => {
    if (!eventoId) { setMensajes([]); return; }
    setCargando(true);
    setError(null);
    cargarMensajes().finally(() => setCargando(false));
  }, [eventoId, cargarMensajes]);

  // Polling cada 5 segundos (reemplaza Realtime)
  useEffect(() => {
    if (!eventoId) return;

    intervalRef.current = setInterval(() => {
      cargarMensajes();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [eventoId, cargarMensajes]);

  const enviarMensaje = async (contenido: string, replyToId?: string): Promise<boolean> => {
    if (!eventoId) return false;

    const texto = contenido.trim();
    if (!texto) {
      setError('El mensaje no puede estar vacío.');
      return false;
    }
    if (texto.length > 500) {
      setError('El mensaje no puede superar los 500 caracteres.');
      return false;
    }

    setEnviando(true);
    setError(null);

    try {
      const res = await fetch(`/api/eventos/${eventoId}/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ contenido: texto, reply_to_id: replyToId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al enviar el comentario.');
        return false;
      }

      const nuevoMsg = await res.json();
      setMensajes(prev => {
        if (prev.some(m => m.id === nuevoMsg.id)) return prev;
        return [...prev, nuevoMsg];
      });

      return true;
    } catch {
      setError('Error al enviar el comentario.');
      return false;
    } finally {
      setEnviando(false);
    }
  };

  const toggleLikeMensaje = async (mensajeId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/eventos/${eventoId}/mensajes/${mensajeId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const getMensajeLikes = async (mensajeId: string) => {
    try {
      const res = await fetch(`/api/eventos/${eventoId}/mensajes/${mensajeId}/like`, { credentials: 'include' });
      if (!res.ok) return { count: 0, userLiked: false };
      return await res.json();
    } catch {
      return { count: 0, userLiked: false };
    }
  };

  const resetError = useCallback(() => setError(null), []);

  return { mensajes, cargando, enviando, error, enviarMensaje, toggleLikeMensaje, getMensajeLikes, resetError };
}
