export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) ?? {};
    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña son requeridos' }, { status: 400 });
    }
    const user = await prisma.psicologo.findUnique({ where: { correo: email } });
    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.contrasenaHash);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }
    return NextResponse.json({ success: true, role: user.rol, estadoPerfil: user.estadoPerfil });
  } catch (error: any) {
    console.error('Login error:', error?.message);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
