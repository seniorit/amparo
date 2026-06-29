export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { formatWhatsapp } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nombre_completo = body?.nombre_completo ?? body?.name ?? body?.fullName ?? '';
    const correo = body?.correo ?? body?.email ?? '';
    const password = body?.password ?? '';
    const whatsapp = body?.whatsapp ?? '';
    const especialidades = body?.especialidades ?? [];
    const anos_experiencia = body?.anos_experiencia ?? '0';
    const numero_colegiado = body?.numero_colegiado ?? '';
    const pais_residencia = body?.pais_residencia ?? 'Venezuela';
    const bio = body?.bio ?? '';
    const disponibilidad_semanal = body?.disponibilidad_semanal ?? {};
    const foto_url = body?.foto_url ?? null;
    const foto_is_public = body?.foto_is_public ?? true;

    if (!correo || !password || !nombre_completo) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const existing = await prisma.psicologo.findUnique({ where: { correo } });
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con este correo' }, { status: 409 });
    }

    const contrasenaHash = await bcrypt.hash(password, 10);

    const psicologo = await prisma.psicologo.create({
      data: {
        nombreCompleto: nombre_completo,
        correo,
        contrasenaHash,
        whatsapp: formatWhatsapp(whatsapp ?? ''),
        especialidades: especialidades ?? [],
        anosExperiencia: parseInt(anos_experiencia ?? '0', 10),
        numeroColegiado: numero_colegiado ?? '',
        paisResidencia: pais_residencia ?? 'Venezuela',
        bio: bio ?? '',
        disponibilidadSemanal: disponibilidad_semanal ?? {},
        fotoUrl: foto_url ?? null,
        fotoIsPublic: foto_is_public ?? true,
        estadoPerfil: 'pendiente',
        rol: 'psicologo',
      },
    });

    return NextResponse.json({ success: true, id: psicologo.id });
  } catch (error: any) {
    console.error('Signup error:', error?.message);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
