import { NextResponse } from 'next/server';
import { loginUser, COOKIE_NAME } from '@/db/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const { user, token } = loginUser(email, password);

    const response = NextResponse.json({ user, token });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24h
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
