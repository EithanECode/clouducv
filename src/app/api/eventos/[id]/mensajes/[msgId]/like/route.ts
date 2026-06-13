/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getDb } from '@/db/database';
import { getUserFromRequest } from '@/db/auth';

// POST /api/eventos/[id]/mensajes/[msgId]/like — toggle like en mensaje
export async function POST(request: Request, { params }: { params: Promise<{ id: string; msgId: string }> }) {
  const { msgId } = await params;
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const db = getDb();

  const existing = db.prepare('SELECT mensaje_id FROM likes_mensaje WHERE mensaje_id = ? AND user_id = ?').get(msgId, user.id);

  if (existing) {
    db.prepare('DELETE FROM likes_mensaje WHERE mensaje_id = ? AND user_id = ?').run(msgId, user.id);
  } else {
    db.prepare('INSERT INTO likes_mensaje (mensaje_id, user_id) VALUES (?, ?)').run(msgId, user.id);
  }

  // Obtener nuevo conteo
  const result = db.prepare('SELECT COUNT(*) as count FROM likes_mensaje WHERE mensaje_id = ?').get(msgId) as any;
  const userLiked = !existing;

  return NextResponse.json({ count: result?.count || 0, userLiked });
}

// GET /api/eventos/[id]/mensajes/[msgId]/like — obtener info de like
export async function GET(request: Request, { params }: { params: Promise<{ id: string; msgId: string }> }) {
  const { msgId } = await params;
  const user = getUserFromRequest(request);

  const db = getDb();
  const result = db.prepare('SELECT COUNT(*) as count FROM likes_mensaje WHERE mensaje_id = ?').get(msgId) as any;

  let userLiked = false;
  if (user) {
    const existing = db.prepare('SELECT mensaje_id FROM likes_mensaje WHERE mensaje_id = ? AND user_id = ?').get(msgId, user.id);
    userLiked = !!existing;
  }

  return NextResponse.json({ count: result?.count || 0, userLiked });
}
