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
    const psicologos = await prisma.psicologo.findMany({
      where: { rol: 'psicologo' },
      orderBy: { fechaRegistro: 'desc' },
    });
    // Remove password hash
    const safe = (psicologos ?? []).map((p: any) => {
      const { contrasenaHash, ...rest } = p ?? {};
      return rest;
    });
    return NextResponse.json(safe);
  } catch (error: any) {
    console.error('Admin psicologos error:', error?.message);
    return NextResponse.json([], { status: 500 });
  }
}
