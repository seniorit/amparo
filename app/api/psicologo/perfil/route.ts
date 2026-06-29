export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const psicologo = await prisma.psicologo.findUnique({ where: { id: userId } });
    if (!psicologo) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    const { contrasenaHash, ...safe } = psicologo ?? ({} as any);
    return NextResponse.json(safe);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const body = (await request.json()) ?? {};
    const { bio, disponibilidad_semanal, foto_url, foto_is_public } = body;

    const data: any = {};
    if (bio !== undefined) data.bio = bio;
    if (disponibilidad_semanal !== undefined) data.disponibilidadSemanal = disponibilidad_semanal;
    if (foto_url !== undefined) data.fotoUrl = foto_url;
    if (foto_is_public !== undefined) data.fotoIsPublic = foto_is_public;

    await prisma.psicologo.update({ where: { id: userId }, data });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}
