/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getDb, generateId } from '@/db/database';
import { getUserFromRequest } from '@/db/auth';
import type { Categoria } from '@/types/types';

type CategoriaEvento = Exclude<Categoria, 'Todos'>;

// Imágenes por defecto según categoría
const imagenesPorCategoria: Record<CategoriaEvento, string> = {
  Académicos: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8d9b64f4-18b1-4183-8598-a0520a34a4e0.jpg',
  Culturales: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_42dbeeaa-8abb-4162-a0c7-d11855f2a132.jpg',
  Deportivos: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e25eaacf-0471-4668-aa28-7624012722eb.jpg',
  Comerciales: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8d9b64f4-18b1-4183-8598-a0520a34a4e0.jpg',
};

const avataresPorCategoria: Record<CategoriaEvento, string[]> = {
  Académicos: ['#3B82F6', '#06B6D4', '#8B5CF6'],
  Culturales: ['#D946EF', '#A855F7', '#FF6B9D'],
  Deportivos: ['#10B981', '#F59E0B', '#34D399'],
  Comerciales: ['#F59E0B', '#F97316', '#EF4444'],
};
// GET /api/eventos — listar todos los eventos
export async function GET(request: Request) {
  const db = getDb();
  const user = getUserFromRequest(request);

  const eventos = db.prepare(`
    SELECT id, titulo, categoria, descripcion, fecha, hora, asistentes, imagen, avatares, direccion, likes, created_at, user_id
    FROM eventos
    ORDER BY created_at ASC
  `).all() as any[];

  // Si hay usuario, obtener sus likes y guardados
  let likesSet = new Set<string>();
  let guardadosSet = new Set<string>();

  if (user) {
    const likesRows = db.prepare('SELECT evento_id FROM likes_evento WHERE user_id = ?').all(user.id) as any[];
    likesSet = new Set(likesRows.map(r => r.evento_id));

    const guardadosRows = db.prepare('SELECT evento_id FROM eventos_guardados WHERE user_id = ?').all(user.id) as any[];
    guardadosSet = new Set(guardadosRows.map(r => r.evento_id));
  }

  const eventosConEstado = eventos.map(ev => ({
    ...ev,
    avatares: JSON.parse(ev.avatares || '[]'),
    likes: ev.likes || 0,
    guardado: guardadosSet.has(ev.id),
    like_local: likesSet.has(ev.id),
  }));

  return NextResponse.json(eventosConEstado);
}

// POST /api/eventos — crear evento
export async function POST(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 });
  }

  const body = await request.json();
  const { titulo, categoria, fecha, hora, descripcion, asistentes, imagen, direccion } = body;

  if (!titulo || !categoria || !fecha || !hora) {
    return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
  }

  const imagenFinal = imagen?.trim() || imagenesPorCategoria[categoria as CategoriaEvento] || imagenesPorCategoria['Académicos'];
  const avataresFinal = avataresPorCategoria[categoria as CategoriaEvento] || ['#a855f7'];

  const db = getDb();
  const id = generateId();

  db.prepare(`
    INSERT INTO eventos (id, titulo, categoria, fecha, hora, descripcion, asistentes, imagen, avatares, user_id, direccion, likes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(id, titulo.trim(), categoria, fecha.trim(), hora.trim(), (descripcion || '').trim(), asistentes || 0, imagenFinal, JSON.stringify(avataresFinal), user.id, direccion?.trim() || null);

  return NextResponse.json({ id }, { status: 201 });
}
