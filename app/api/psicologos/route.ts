export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const especialidad = searchParams.get('especialidad');
    const search = searchParams.get('search');
    const soloActivos = searchParams.get('activos') !== 'false';

    const where: any = {};
    if (soloActivos) where.estadoPerfil = 'activo';
    if (especialidad) where.especialidades = { has: especialidad };
    if (search) {
      where.OR = [
        { nombreCompleto: { contains: search, mode: 'insensitive' } },
      ];
    }
    // Exclude admin role from public directory
    where.rol = 'psicologo';

    const psicologos = await prisma.psicologo.findMany({
      where,
      select: {
        id: true,
        nombreCompleto: true,
        especialidades: true,
        anosExperiencia: true,
        bio: true,
        fotoUrl: true,
        fotoIsPublic: true,
        disponibilidadSemanal: true,
        paisResidencia: true,
        estadoPerfil: true,
      },
      orderBy: { fechaRegistro: 'desc' },
    });

    // Resolve photo URLs
    const resolved = await Promise.all(
      (psicologos ?? []).map(async (p: any) => {
        let photoUrl = null;
        if (p?.fotoUrl) {
          try {
            photoUrl = await getFileUrl(p.fotoUrl, 'image/jpeg', p?.fotoIsPublic ?? true);
          } catch { photoUrl = null; }
        }
        return { ...(p ?? {}), resolvedFotoUrl: photoUrl };
      })
    );

    return NextResponse.json(resolved);
  } catch (error: any) {
    console.error('Psicologos fetch error:', error?.message);
    return NextResponse.json([], { status: 500 });
  }
}
