import { NextResponse } from 'next/server';
import { getDb, generateId } from '@/db/database';
import { getUserFromRequest } from '@/db/auth';

// POST /api/eventos/[id]/guardar — toggle guardado
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventoId } = await params;
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const db = getDb();

  const evento = db.prepare('SELECT id FROM eventos WHERE id = ?').get(eventoId);
  if (!evento) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });

  const existing = db.prepare('SELECT id FROM eventos_guardados WHERE evento_id = ? AND user_id = ?').get(eventoId, user.id);

  if (existing) {
    db.prepare('DELETE FROM eventos_guardados WHERE evento_id = ? AND user_id = ?').run(eventoId, user.id);
    return NextResponse.json({ guardado: false });
  } else {
    db.prepare('INSERT INTO eventos_guardados (id, evento_id, user_id) VALUES (?, ?, ?)').run(generateId(), eventoId, user.id);
    return NextResponse.json({ guardado: true });
  }
}
