/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/db/auth';
import path from 'path';
import fs from 'fs';

// POST /api/upload — subir archivo a disco local
export async function POST(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo excede el tamaño máximo (5MB)' }, { status: 400 });
    }

    // Crear directorio de uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', bucket, user.id);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Nombre único
    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    // Guardar archivo
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // URL pública
    const publicUrl = `/uploads/${bucket}/${user.id}/${fileName}`;

    return NextResponse.json({ publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al subir archivo' }, { status: 500 });
  }
}
