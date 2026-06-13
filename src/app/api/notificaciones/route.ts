/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getDb } from '@/db/database';
import { getUserFromRequest } from '@/db/auth';

// GET /api/notificaciones
export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json([]);

  const db = getDb();
  const notificaciones = db.prepare(`
    SELECT n.id, n.user_id, n.actor_id, n.evento_id, n.tipo, n.leida, n.created_at
    FROM notificaciones n
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT 20
  `).all(user.id) as any[];

  // Enriquecer con actor username y evento titulo
  const actorIds = [...new Set(notificaciones.map(n => n.actor_id).filter(Boolean))];
  const eventoIds = [...new Set(notificaciones.map(n => n.evento_id).filter(Boolean))];

  const actoresMap: Record<string, string> = {};
  if (actorIds.length > 0) {
    const ph = actorIds.map(() => '?').join(',');
    const actores = db.prepare(`SELECT id, username FROM profiles WHERE id IN (${ph})`).all(...actorIds) as any[];
    actores.forEach(a => { actoresMap[a.id] = a.username; });
  }

  const eventosMap: Record<string, string> = {};
  if (eventoIds.length > 0) {
    const ph = eventoIds.map(() => '?').join(',');
    const eventos = db.prepare(`SELECT id, titulo FROM eventos WHERE id IN (${ph})`).all(...eventoIds) as any[];
    eventos.forEach(e => { eventosMap[e.id] = e.titulo; });
  }

  const result = notificaciones.map(n => ({
    ...n,
    leida: !!n.leida,
    actor: n.actor_id ? { username: actoresMap[n.actor_id] || 'Usuario' } : null,
    evento: n.evento_id ? { titulo: eventosMap[n.evento_id] || 'Evento' } : null,
  }));

  return NextResponse.json(result);
}

// PUT /api/notificaciones — marcar como leídas
export async function PUT(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { ids } = await request.json();

  const db = getDb();
  if (Array.isArray(ids) && ids.length > 0) {
    const ph = ids.map(() => '?').join(',');
    db.prepare(`UPDATE notificaciones SET leida = 1 WHERE id IN (${ph}) AND user_id = ?`).run(...ids, user.id);
  }

  return NextResponse.json({ ok: true });
}
