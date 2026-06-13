/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDb, generateId } from './database';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'clouducv-offline-secret-2026';
const JWT_EXPIRES = '24h';
const COOKIE_NAME = 'auth-token';

export interface LocalUser {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  avatar_url: string | null;
  categorias_favoritas: string[];
  created_at: string;
}

export interface AuthResult {
  user: LocalUser;
  token: string;
}

// ===== REGISTRO =====
export function registerUser(username: string, email: string, password: string): AuthResult {
  const db = getDb();

  // Verificar email duplicado
  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingEmail) throw new Error('El correo electrónico ya está registrado');

  // Verificar username duplicado
  const existingUsername = db.prepare('SELECT id FROM profiles WHERE username = ?').get(username);
  if (existingUsername) throw new Error('El nombre de usuario ya está en uso');

  const userId = generateId();
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.transaction(() => {
    db.prepare('INSERT INTO users (id, email, encrypted_password) VALUES (?, ?, ?)').run(userId, email, hashedPassword);
    db.prepare('INSERT INTO profiles (id, username, email, role) VALUES (?, ?, ?, ?)').run(userId, username, email, 'user');
  })();

  return createSession(userId);
}

// ===== LOGIN =====
export function loginUser(email: string, password: string): AuthResult {
  const db = getDb();

  const user = db.prepare('SELECT id, encrypted_password FROM users WHERE email = ?').get(email) as any;
  if (!user) throw new Error('Credenciales inválidas');

  if (!bcrypt.compareSync(password, user.encrypted_password)) {
    throw new Error('Credenciales inválidas');
  }

  return createSession(user.id);
}

// ===== SESIÓN =====
function createSession(userId: string): AuthResult {
  const db = getDb();
  const profile = db.prepare(`
    SELECT p.id, p.username, p.email, p.role, p.avatar_url, p.categorias_favoritas, p.created_at
    FROM profiles p WHERE p.id = ?
  `).get(userId) as any;

  if (!profile) throw new Error('Perfil no encontrado');

  const localUser: LocalUser = {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    role: profile.role,
    avatar_url: profile.avatar_url || null,
    categorias_favoritas: JSON.parse(profile.categorias_favoritas || '[]'),
    created_at: profile.created_at,
  };

  const token = jwt.sign({ userId: localUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  return { user: localUser, token };
}

// ===== VERIFICAR TOKEN =====
export function verifyToken(token: string): LocalUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const db = getDb();
    const profile = db.prepare(`
      SELECT p.id, p.username, p.email, p.role, p.avatar_url, p.categorias_favoritas, p.created_at
      FROM profiles p WHERE p.id = ?
    `).get(decoded.userId) as any;

    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      role: profile.role,
      avatar_url: profile.avatar_url || null,
      categorias_favoritas: JSON.parse(profile.categorias_favoritas || '[]'),
      created_at: profile.created_at,
    };
  } catch {
    return null;
  }
}

// ===== OBTENER USUARIO DESDE REQUEST =====
export async function getCurrentUser(): Promise<LocalUser | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(COOKIE_NAME);
    if (!tokenCookie?.value) return null;
    return verifyToken(tokenCookie.value);
  } catch {
    return null;
  }
}

// ===== OBTENER USUARIO DESDE HEADER (para API routes) =====
export function getUserFromRequest(request: Request): LocalUser | null {
  // Intentar desde header Authorization
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return verifyToken(authHeader.substring(7));
  }

  // Intentar desde cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/auth-token=([^;]+)/);
  if (match) {
    return verifyToken(match[1]);
  }

  return null;
}

export { COOKIE_NAME, JWT_SECRET };
