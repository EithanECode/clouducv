import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { NotificacionRow } from '@/types/types'

export function useNotificaciones() {
  const { user } = useAuth()
  const [notificaciones, setNotificaciones] = useState<NotificacionRow[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [cargando, setCargando] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchNotificaciones = useCallback(async () => {
    if (!user) {
      setNotificaciones([])
      setNoLeidas(0)
      setCargando(false)
      return
    }

    try {
      const res = await fetch('/api/notificaciones', { credentials: 'include' })
      if (!res.ok) throw new Error('Error al cargar notificaciones')

      const data = await res.json()
      const filas = Array.isArray(data) ? (data as NotificacionRow[]) : []

      setNotificaciones(filas)
      setNoLeidas(filas.filter(t => !t.leida).length)
    } catch (err) {
      console.error('Error fetching notificaciones:', err)
    } finally {
      setCargando(false)
    }
  }, [user])

  useEffect(() => {
    fetchNotificaciones()

    if (!user) return

    // Polling cada 10 segundos (reemplaza Realtime)
    intervalRef.current = setInterval(() => {
      fetchNotificaciones()
    }, 10000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user, fetchNotificaciones])

  const marcarComoLeidas = async () => {
    if (!user || noLeidas === 0) return
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
    setNoLeidas(0)

    const unreadIds = notificaciones.filter(n => !n.leida).map(n => n.id)
    if (unreadIds.length > 0) {
      await fetch('/api/notificaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: unreadIds }),
      })
    }
  }

  return { notificaciones, noLeidas, cargando, marcarComoLeidas, recargar: fetchNotificaciones }
}
