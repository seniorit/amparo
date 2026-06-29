export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

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
    if (target.rol === 'admin') {
      return NextResponse.json({ error: 'No se puede eliminar una cuenta de administrador desde aquí' }, { status: 400 });
    }

    const citasCount = await prisma.cita.count({ where: { psicologoId: id } });
    if (citasCount > 0) {
      return NextResponse.json({
        error: `No se puede eliminar: este psicólogo tiene ${citasCount} cita(s) asociada(s). Puedes marcarlo como inactivo en su lugar.`,
      }, { status: 409 });
    }

    await prisma.psicologo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete psicologo error:', error?.message);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
