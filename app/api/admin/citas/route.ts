export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const citas = await prisma.cita.findMany({
      include: {
        paciente: { select: { id: true, nombreCompleto: true, correo: true, whatsapp: true, motivoConsulta: true, nivelUrgencia: true } },
        psicologo: { select: { id: true, nombreCompleto: true, correo: true } },
      },
      orderBy: { fechaSolicitud: 'desc' },
    });
    return NextResponse.json(citas ?? []);
  } catch (error: any) {
    console.error('Admin citas error:', error?.message);
    return NextResponse.json([], { status: 500 });
  }
}
