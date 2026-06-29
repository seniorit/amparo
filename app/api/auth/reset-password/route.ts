export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = (body?.token ?? '').trim();
    const password = body?.password ?? '';

    if (!token || !password) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'El enlace es inválido o ha expirado. Solicita uno nuevo.' }, { status: 400 });
    }

    const contrasenaHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.psicologo.update({
        where: { id: resetToken.psicologoId },
        data: { contrasenaHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error: any) {
    console.error('Reset password error:', error?.message);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = (searchParams.get('token') ?? '').trim();
    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    const valid = !!resetToken && !resetToken.used && resetToken.expiresAt > new Date();
    return NextResponse.json({ valid });
  } catch (error: any) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
