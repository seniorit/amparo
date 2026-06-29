export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const { cita_id, estado } = (await request.json()) ?? {};
    if (!cita_id || !estado) {
      return NextResponse.json({ error: 'Datos faltantes' }, { status: 400 });
    }

    // Verify cita belongs to this psychologist
    const cita = await prisma.cita.findFirst({ where: { id: cita_id, psicologoId: userId } });
    if (!cita) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    await prisma.cita.update({
      where: { id: cita_id },
      data: { estado },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update cita estado error:', error?.message);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
