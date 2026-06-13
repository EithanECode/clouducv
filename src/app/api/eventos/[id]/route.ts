/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getDb } from '@/db/database';
import { getUserFromRequest } from '@/db/auth';

// GET /api/eventos/[id] — detalle de un evento
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const user = getUserFromRequest(request);

  const evento = db.prepare(`
    SELECT id, titulo, categoria, descripcion, fecha, hora, asistentes, imagen, avatares, direccion, likes, created_at, user_id
    FROM eventos WHERE id = ?
  `).get(id) as any;

  if (!evento) {
    return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
  }

  // Parsear avatares
  evento.avatares = JSON.parse(evento.avatares || '[]');

  // Obtener username del creador
  let creadorUsername: string | null = null;
  if (evento.user_id) {
    const profile = db.prepare('SELECT username FROM profiles WHERE id = ?').get(evento.user_id) as any;
    creadorUsername = profile?.username || null;
  }

  // Estado del usuario actual
  let like_local = false;
  let guardado = false;
  if (user) {
    const likeRow = db.prepare('SELECT id FROM likes_evento WHERE evento_id = ? AND user_id = ?').get(id, user.id);
    like_local = !!likeRow;
    const guardadoRow = db.prepare('SELECT id FROM eventos_guardados WHERE evento_id = ? AND user_id = ?').get(id, user.id);
    guardado = !!guardadoRow;
  }

  return NextResponse.json({ ...evento, creadorUsername, like_local, guardado });
}

// PUT /api/eventos/[id] — editar evento (solo dueño)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const db = getDb();
  const body = await request.json();

  // Verificar que es el dueño
  const evento = db.prepare('SELECT user_id FROM eventos WHERE id = ?').get(id) as any;
  if (!evento) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
  if (evento.user_id !== user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const avataresPorCategoria: Record<string, string[]> = {
    'Académicos': ['#3B82F6', '#06B6D4', '#8B5CF6'],
    'Culturales': ['#D946EF', '#A855F7', '#FF6B9D'],
    'Deportivos': ['#10B981', '#F59E0B', '#34D399'],
    'Comerciales': ['#F59E0B', '#F97316', '#EF4444'],
  };

  const imagenesPorCategoria: Record<string, string> = {
    'Académicos': '/images/logo/logo-dark.svg',
    'Culturales': '/images/logo/logo-dark.svg',
    'Deportivos': '/images/logo/logo-dark.svg',
    'Comerciales': '/images/logo/logo-dark.svg',
  };

  const imagenFinal = body.imagen?.trim() || imagenesPorCategoria[body.categoria] || '/images/logo/logo-dark.svg';
  const avataresFinal = avataresPorCategoria[body.categoria] || ['#a855f7'];

  db.prepare(`
    UPDATE eventos SET titulo = ?, categoria = ?, fecha = ?, hora = ?, descripcion = ?,
    asistentes = ?, imagen = ?, avatares = ?, direccion = ? WHERE id = ? AND user_id = ?
  `).run(
    body.titulo?.trim(), body.categoria, body.fecha?.trim(), body.hora?.trim(),
    (body.descripcion || '').trim(), body.asistentes || 0, imagenFinal,
    JSON.stringify(avataresFinal), body.direccion?.trim() || null, id, user.id
  );

  return NextResponse.json({ ok: true });
}

// DELETE /api/eventos/[id] — eliminar evento (solo dueño)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const db = getDb();
  const evento = db.prepare('SELECT user_id FROM eventos WHERE id = ?').get(id) as any;
  if (!evento) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
  if (evento.user_id !== user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  db.prepare('DELETE FROM eventos WHERE id = ? AND user_id = ?').run(id, user.id);

  return NextResponse.json({ ok: true });
}
