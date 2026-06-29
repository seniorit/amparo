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

    const [totalPacientes, psicologosActivos, citasCompletadas, citasPendientes, totalCitas] = await Promise.all([
      prisma.paciente.count(),
      prisma.psicologo.count({ where: { estadoPerfil: 'activo', rol: 'psicologo' } }),
      prisma.cita.count({ where: { estado: 'completada' } }),
      prisma.cita.count({ where: { estado: 'pendiente_asignar' } }),
      prisma.cita.count(),
    ]);

    return NextResponse.json({
      totalPacientes,
      psicologosActivos,
      citasCompletadas,
      citasPendientes,
      totalCitas,
      tasaOcupacion: totalCitas > 0 ? Math.round((citasCompletadas / totalCitas) * 100) : 0,
    });
  } catch (error: any) {
    console.error('Stats error:', error?.message);
    return NextResponse.json({}, { status: 500 });
  }
}
