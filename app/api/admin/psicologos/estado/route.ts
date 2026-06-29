export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { sendNotificationEmail } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const { psicologo_id, estado } = (await request.json()) ?? {};
    if (!psicologo_id || !estado) {
      return NextResponse.json({ error: 'Datos faltantes' }, { status: 400 });
    }

    const updated = await prisma.psicologo.update({
      where: { id: psicologo_id },
      data: { estadoPerfil: estado },
    });

    // Notify if approved
    if (estado === 'activo') {
      const notifId = process.env.NOTIF_ID_PSICLOGO_APROBADO;
      if (notifId && updated?.correo) {
        sendNotificationEmail({
          notificationId: notifId,
          recipientEmail: updated.correo,
          subject: 'PsicoAmparo - ¡Tu postulación fue aprobada!',
          htmlBody: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <div style="background:#1E3A5F;padding:24px;text-align:center;border-radius:8px 8px 0 0">
                <h1 style="color:#2ECC9A;margin:0">🎉 ¡Bienvenido/a!</h1>
              </div>
              <div style="padding:24px;background:#f8f9fa;border-radius:0 0 8px 8px">
                <p>Hola <strong>${updated?.nombreCompleto ?? ''}</strong>,</p>
                <p>Tu postulación como psicólogo voluntario en PsicoAmparo ha sido aprobada.</p>
                <p>Ya puedes ingresar a tu dashboard y comenzar a atender pacientes.</p>
                <p style="margin-top:16px">¡Gracias por ser parte de esta comunidad!</p>
              </div>
            </div>
          `,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update estado error:', error?.message);
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 });
  }
}
