import { NextResponse } from 'next/server';
import { getDb, generateId } from '@/db/database';
import { getUserFromRequest } from '@/db/auth';

// POST /api/eventos/[id]/like — toggle like
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventoId } = await params;
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const db = getDb();

  // Verificar que el evento existe
  const evento = db.prepare('SELECT id FROM eventos WHERE id = ?').get(eventoId);
  if (!evento) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });

  // Verificar si ya tiene like
  const existing = db.prepare('SELECT id FROM likes_evento WHERE evento_id = ? AND user_id = ?').get(eventoId, user.id);

  if (existing) {
    // Quitar like
    db.prepare('DELETE FROM likes_evento WHERE evento_id = ? AND user_id = ?').run(eventoId, user.id);
    db.prepare('UPDATE eventos SET likes = MAX(0, likes - 1) WHERE id = ?').run(eventoId);
    return NextResponse.json({ liked: false });
  } else {
    // Poner like
    db.prepare('INSERT INTO likes_evento (id, evento_id, user_id) VALUES (?, ?, ?)').run(generateId(), eventoId, user.id);
    db.prepare('UPDATE eventos SET likes = likes + 1 WHERE id = ?').run(eventoId);
    return NextResponse.json({ liked: true });
  }
}
