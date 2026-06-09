// Hook para comentarios de eventos con Realtime
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
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

  const cargarMensajes = useCallback(async () => {
    if (!eventoId) return;
    setCargando(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('mensajes_evento')
      .select(`
        id, 
        evento_id, 
        remitente_id, 
        contenido, 
        created_at, 
        reply_to_id,
        profiles!mensajes_evento_remitente_id_fkey(username, avatar_url),
        likes:likes_mensaje(count)
      `)
      .eq('evento_id', eventoId)
      .order('created_at', { ascending: true })
      .limit(100);

    setCargando(false);
    if (err) {
      console.error(err);
      setError('No se pudieron cargar los comentarios.');
      return;
    }
    
    // Necesitamos cargar el nombre del usuario al que se le responde si hay reply_to_id
    let mensajesProcesados = Array.isArray(data) ? (data as unknown as MensajeEvento[]) : [];
    
    // Un simple mapeo para obtener el nombre del usuario padre
    const mensajesMap = new Map(mensajesProcesados.map(m => [m.id, m]));
    mensajesProcesados = mensajesProcesados.map(m => {
      if (m.reply_to_id && mensajesMap.has(m.reply_to_id)) {
        const parentMsg = mensajesMap.get(m.reply_to_id);
        m.reply_to = { profiles: parentMsg?.profiles };
      }
      return m;
    });
    
    setMensajes(mensajesProcesados);
  }, [eventoId]);

  // Cargar al montar o cuando cambia el eventoId
  useEffect(() => {
    if (!eventoId) { setMensajes([]); return; }
    cargarMensajes();
  }, [eventoId, cargarMensajes]);

  // Suscripción Realtime para mensajes en tiempo real
  useEffect(() => {
    if (!eventoId) return;

    const channel = supabase
      .channel(`mensajes-evento-${eventoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_evento',
          filter: `evento_id=eq.${eventoId}`,
        },
        async (payload) => {
          // Enriquecer el nuevo mensaje con el username y avatar del remitente
          const nuevo = payload.new as MensajeEvento;
          const { data: perfilData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', nuevo.remitente_id)
            .maybeSingle();

          setMensajes((prev) => {
            // Evitar duplicados
            if (prev.some((m) => m.id === nuevo.id)) return prev;
            
            const msgToInsert = { ...nuevo, profiles: perfilData, likes: [{ count: 0 }] };
            
            // Asignar reply_to si corresponde
            if (msgToInsert.reply_to_id) {
              const parentMsg = prev.find(p => p.id === msgToInsert.reply_to_id);
              if (parentMsg) {
                msgToInsert.reply_to = { profiles: parentMsg.profiles };
              }
            }
            
            return [...prev, msgToInsert];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventoId]);

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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Debes iniciar sesión para enviar un mensaje.');
      setEnviando(false);
      return false;
    }

    const { error: err } = await supabase.from('mensajes_evento').insert({
      evento_id: eventoId,
      remitente_id: user.id,
      contenido: texto,
      reply_to_id: replyToId || null
    });

    setEnviando(false);
    if (err) {
      console.error(err);
      setError('Error al enviar el mensaje.');
      return false;
    }
    return true;
  };

  const toggleLikeMensaje = async (mensajeId: string): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;
    
    // Check if like exists
    const { data: existingLike } = await supabase
      .from('likes_mensaje')
      .select('mensaje_id')
      .eq('mensaje_id', mensajeId)
      .eq('user_id', session.user.id)
      .maybeSingle();
      
    if (existingLike) {
      const { error } = await supabase
        .from('likes_mensaje')
        .delete()
        .eq('mensaje_id', mensajeId)
        .eq('user_id', session.user.id);
      return !error;
    } else {
      const { error } = await supabase
        .from('likes_mensaje')
        .insert({ mensaje_id: mensajeId, user_id: session.user.id });
      return !error;
    }
  };

  const getMensajeLikes = async (mensajeId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    const { count } = await supabase
      .from('likes_mensaje')
      .select('*', { count: 'exact', head: true })
      .eq('mensaje_id', mensajeId);
      
    let userLiked = false;
    if (session?.user) {
      const { data } = await supabase
        .from('likes_mensaje')
        .select('mensaje_id')
        .eq('mensaje_id', mensajeId)
        .eq('user_id', session.user.id)
        .maybeSingle();
      userLiked = !!data;
    }
    
    return { count: count || 0, userLiked };
  };

  const resetError = useCallback(() => setError(null), []);

  return { mensajes, cargando, enviando, error, enviarMensaje, toggleLikeMensaje, getMensajeLikes, resetError };
}
