/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getDb } from '@/db/database';
import { getUserFromRequest } from '@/db/auth';

// GET /api/profiles — obtener perfil del usuario actual
export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const db = getDb();
  const profile = db.prepare('SELECT id, username, email, role, categorias_favoritas, avatar_url, created_at FROM profiles WHERE id = ?').get(user.id) as any;

  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });

  return NextResponse.json({
    ...profile,
    categorias_favoritas: JSON.parse(profile.categorias_favoritas || '[]'),
  });
}

// PUT /api/profiles — actualizar perfil
export async function PUT(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await request.json();
  const db = getDb();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.username !== undefined) {
    // Verificar unicidad
    const existing = db.prepare('SELECT id FROM profiles WHERE username = ? AND id != ?').get(body.username.trim(), user.id);
    if (existing) return NextResponse.json({ error: 'Este nombre de usuario ya está en uso' }, { status: 400 });
    updates.push('username = ?');
    values.push(body.username.trim());
  }

  if (body.avatar_url !== undefined) {
    updates.push('avatar_url = ?');
    values.push(body.avatar_url);
  }

  if (body.categorias_favoritas !== undefined) {
    updates.push('categorias_favoritas = ?');
    values.push(JSON.stringify(body.categorias_favoritas));
  }

  if (updates.length === 0) return NextResponse.json({ ok: true });

  values.push(user.id);
  db.prepare(`UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  return NextResponse.json({ ok: true });
}
