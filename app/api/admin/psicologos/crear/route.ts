export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatWhatsapp } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const nombre = (body?.nombreCompleto ?? '').trim();
    const correo = (body?.correo ?? '').trim().toLowerCase();
    const password = body?.password ?? '';
    const whatsapp = body?.whatsapp ?? '';
    const especialidades = Array.isArray(body?.especialidades)
      ? body.especialidades
      : (body?.especialidades ?? '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const anosExperiencia = parseInt(String(body?.anosExperiencia ?? '0'), 10) || 0;
    const numeroColegiado = (body?.numeroColegiado ?? '').trim();
    const bio = body?.bio ?? '';

    if (!nombre || !correo || !password) {
      return NextResponse.json({ error: 'Nombre, correo y contraseña son obligatorios' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const existing = await prisma.psicologo.findUnique({ where: { correo } });
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con este correo' }, { status: 409 });
    }

    const contrasenaHash = await bcrypt.hash(password, 10);
    const psicologo = await prisma.psicologo.create({
      data: {
        nombreCompleto: nombre,
        correo,
        contrasenaHash,
        whatsapp: whatsapp ? formatWhatsapp(whatsapp) : '',
        especialidades,
        anosExperiencia,
        numeroColegiado,
        paisResidencia: body?.paisResidencia ?? 'Venezuela',
        bio,
        estadoPerfil: 'activo',
        rol: 'psicologo',
      },
    });

    return NextResponse.json({ success: true, id: psicologo.id });
  } catch (error: any) {
    console.error('Create psicologo error:', error?.message);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
