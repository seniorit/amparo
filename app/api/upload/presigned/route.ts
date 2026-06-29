export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { generatePresignedUploadUrl } from '@/lib/s3';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const { fileName, contentType, isPublic } = (await request.json()) ?? {};
    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'Datos faltantes' }, { status: 400 });
    }
    const result = await generatePresignedUploadUrl(fileName, contentType, isPublic ?? true);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Presigned URL error:', error?.message);
    return NextResponse.json({ error: 'Error al generar URL' }, { status: 500 });
  }
}
