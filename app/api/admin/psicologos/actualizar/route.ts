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
    const id = body?.id;
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const target = await prisma.psicologo.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: 'Psicólogo no encontrado' }, { status: 404 });
    }

    const data: any = {};
    if (typeof body?.nombreCompleto === 'string' && body.nombreCompleto.trim()) data.nombreCompleto = body.nombreCompleto.trim();
    if (typeof body?.whatsapp === 'string') data.whatsapp = body.whatsapp ? formatWhatsapp(body.whatsapp) : '';
    if (body?.especialidades !== undefined) {
      data.especialidades = Array.isArray(body.especialidades)
        ? body.especialidades
        : String(body.especialidades).split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (body?.anosExperiencia !== undefined) data.anosExperiencia = parseInt(String(body.anosExperiencia), 10) || 0;
    if (typeof body?.numeroColegiado === 'string') data.numeroColegiado = body.numeroColegiado.trim();
    if (typeof body?.bio === 'string') data.bio = body.bio;
    if (typeof body?.estadoPerfil === 'string' && ['pendiente', 'activo', 'inactivo'].includes(body.estadoPerfil)) {
      data.estadoPerfil = body.estadoPerfil;
    }

    if (typeof body?.correo === 'string' && body.correo.trim()) {
      const nuevoCorreo = body.correo.trim().toLowerCase();
      if (nuevoCorreo !== target.correo) {
        const dup = await prisma.psicologo.findUnique({ where: { correo: nuevoCorreo } });
        if (dup) {
          return NextResponse.json({ error: 'Ya existe una cuenta con este correo' }, { status: 409 });
        }
        data.correo = nuevoCorreo;
      }
    }

    if (body?.password && String(body.password).length >= 6) {
      data.contrasenaHash = await bcrypt.hash(String(body.password), 10);
    } else if (body?.password && String(body.password).length > 0) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    await prisma.psicologo.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update psicologo error:', error?.message);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
