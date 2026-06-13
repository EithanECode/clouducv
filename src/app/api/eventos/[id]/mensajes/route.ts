/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getDb, generateId } from '@/db/database';
import { getUserFromRequest } from '@/db/auth';

// GET /api/eventos/[id]/mensajes — obtener mensajes del evento
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventoId } = await params;
  const db = getDb();

  const mensajes = db.prepare(`
    SELECT m.id, m.evento_id, m.remitente_id, m.contenido, m.created_at, m.reply_to_id
    FROM mensajes_evento m
    WHERE m.evento_id = ?
    ORDER BY m.created_at ASC
    LIMIT 100
  `).all(eventoId) as any[];

  // Obtener perfiles de remitentes
  const remitenteIds = [...new Set(mensajes.map(m => m.remitente_id))];
  const perfilesMap = new Map<string, { username: string; avatar_url: string | null }>();

  if (remitenteIds.length > 0) {
    const placeholders = remitenteIds.map(() => '?').join(',');
    const perfiles = db.prepare(`SELECT id, username, avatar_url FROM profiles WHERE id IN (${placeholders})`).all(...remitenteIds) as any[];
    perfiles.forEach(p => perfilesMap.set(p.id, { username: p.username, avatar_url: p.avatar_url }));
  }

  // Obtener conteo de likes por mensaje
  const mensajeIds = mensajes.map(m => m.id);
  const likesMap = new Map<string, number>();
  if (mensajeIds.length > 0) {
    const ph = mensajeIds.map(() => '?').join(',');
    const likesCounts = db.prepare(`SELECT mensaje_id, COUNT(*) as count FROM likes_mensaje WHERE mensaje_id IN (${ph}) GROUP BY mensaje_id`).all(...mensajeIds) as any[];
    likesCounts.forEach(lc => likesMap.set(lc.mensaje_id, lc.count));
  }

  // Construir mensajes enriquecidos
  const mensajesProcesados = mensajes.map(m => {
    const profiles = perfilesMap.get(m.remitente_id) || null;

    // Reply-to info
    let reply_to = null;
    if (m.reply_to_id) {
      const parent = mensajes.find((p: any) => p.id === m.reply_to_id);
      if (parent) {
        const parentProfile = perfilesMap.get(parent.remitente_id);
        reply_to = { profiles: parentProfile || null };
      }
    }

    return {
      ...m,
      profiles,
      likes: [{ count: likesMap.get(m.id) || 0 }],
      reply_to,
    };
  });

  return NextResponse.json(mensajesProcesados);
}

// POST /api/eventos/[id]/mensajes — enviar mensaje
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventoId } = await params;
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { contenido, reply_to_id } = await request.json();

  const texto = (contenido || '').trim();
  if (!texto) return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 });
  if (texto.length > 500) return NextResponse.json({ error: 'Máximo 500 caracteres' }, { status: 400 });

  const db = getDb();

  // Verificar que el evento existe
  const evento = db.prepare('SELECT id FROM eventos WHERE id = ?').get(eventoId);
  if (!evento) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });

  const id = generateId();
  db.prepare(`
    INSERT INTO mensajes_evento (id, evento_id, remitente_id, contenido, reply_to_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, eventoId, user.id, texto, reply_to_id || null);

  // Obtener perfil del remitente para devolver mensaje enriquecido
  const profile = db.prepare('SELECT username, avatar_url FROM profiles WHERE id = ?').get(user.id) as any;

  return NextResponse.json({
    id,
    evento_id: eventoId,
    remitente_id: user.id,
    contenido: texto,
    reply_to_id: reply_to_id || null,
    created_at: new Date().toISOString(),
    profiles: profile || null,
    likes: [{ count: 0 }],
    reply_to: null,
  }, { status: 201 });
}
