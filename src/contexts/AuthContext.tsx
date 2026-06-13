"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Profile } from '@/types/types';

// Tipo local que reemplaza el User de Supabase
interface LocalUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: LocalUser | null;
  profile: Profile | null;
  loading: boolean;
  signInWithUsername: (loginId: string, password: string) => Promise<{ error: string | null }>;
  signUpWithUsername: (username: string, email: string, password: string) => Promise<{ error: string | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export async function getProfile(): Promise<Profile | null> {
  try {
    const res = await fetch('/api/profiles', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data as Profile;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión al montar
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email });
          setProfile({
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role,
            categorias_favoritas: data.user.categorias_favoritas,
            avatar_url: data.user.avatar_url,
            created_at: data.user.created_at,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) { setProfile(null); return; }
    const p = await getProfile();
    setProfile(p);
  }, [user]);

  const signInWithUsername = async (loginId: string, password: string): Promise<{ error: string | null }> => {
    if (!loginId.includes('@')) {
      return { error: 'Por favor ingresa tu correo electrónico' };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.error || 'Error al iniciar sesión' };
      }

      // Guardar token en localStorage como respaldo
      if (data.token) {
        localStorage.setItem('auth-token', data.token);
      }

      setUser({ id: data.user.id, email: data.user.email });
      setProfile({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        categorias_favoritas: data.user.categorias_favoritas,
        avatar_url: data.user.avatar_url,
        created_at: data.user.created_at,
      });

      return { error: null };
    } catch {
      return { error: 'Error de conexión. Intenta nuevamente.' };
    }
  };

  const signUpWithUsername = async (username: string, email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.error || 'Error al registrar' };
      }

      if (data.token) {
        localStorage.setItem('auth-token', data.token);
      }

      setUser({ id: data.user.id, email: data.user.email });
      setProfile({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        categorias_favoritas: data.user.categorias_favoritas,
        avatar_url: data.user.avatar_url,
        created_at: data.user.created_at,
      });

      return { error: null };
    } catch {
      return { error: 'Error al crear la cuenta. Intenta nuevamente.' };
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resetPasswordForEmail = async (_email: string): Promise<{ error: string | null }> => {
    // En modo offline no hay reset por email. Informar al usuario.
    return { error: 'Reset de contraseña no disponible en modo offline' };
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE', credentials: 'include' });
    } catch { /* ignore */ }
    localStorage.removeItem('auth-token');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithUsername, signUpWithUsername, resetPasswordForEmail, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
