export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { LandingClient } from './_components/landing-client';

async function getStats() {
  try {
    const [psicologosActivos, totalPacientes, sesionesCompletadas, pacientesEstados] = await Promise.all([
      prisma.psicologo.count({ where: { estadoPerfil: 'activo', rol: 'psicologo' } }),
      prisma.paciente.count(),
      prisma.cita.count({ where: { estado: 'completada' } }),
      prisma.paciente.findMany({ select: { estadoVenezuela: true }, distinct: ['estadoVenezuela'] }),
    ]);
    const estadosCubiertos = (pacientesEstados ?? []).filter((p) => (p?.estadoVenezuela ?? '').trim().length > 0).length;
    return { psicologosActivos, totalPacientes, sesionesCompletadas, estadosCubiertos };
  } catch {
    return { psicologosActivos: 0, totalPacientes: 0, sesionesCompletadas: 0, estadosCubiertos: 0 };
  }
}

export default async function HomePage() {
  const stats = await getStats();
  return <LandingClient stats={stats} />;
}
