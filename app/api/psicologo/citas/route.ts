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

    const citas = await prisma.cita.findMany({
      where: { psicologoId: userId },
      include: {
        paciente: {
          select: { id: true, nombreCompleto: true, whatsapp: true, motivoConsulta: true, nivelUrgencia: true, preferenciaHorario: true },
        },
      },
      orderBy: { fechaSolicitud: 'desc' },
    });

    return NextResponse.json(citas ?? []);
  } catch (error: any) {
    console.error('Psicologo citas error:', error?.message);
    return NextResponse.json([], { status: 500 });
  }
}
