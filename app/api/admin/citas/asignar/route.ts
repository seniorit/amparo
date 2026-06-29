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
    const { cita_id, psicologo_id, fecha_hora_cita } = (await request.json()) ?? {};
    if (!cita_id || !psicologo_id) {
      return NextResponse.json({ error: 'Datos faltantes' }, { status: 400 });
    }

    const cita = await prisma.cita.update({
      where: { id: cita_id },
      data: {
        psicologoId: psicologo_id,
        estado: 'confirmada',
        fechaHoraCita: fecha_hora_cita ? new Date(fecha_hora_cita) : null,
      },
      include: {
        paciente: true,
        psicologo: true,
      },
    });

    // Notify psychologist
    const psicNotifId = process.env.NOTIF_ID_CITA_ASIGNADA_A_PSICLOGO;
    if (psicNotifId && cita?.psicologo?.correo) {
      sendNotificationEmail({
        notificationId: psicNotifId,
        recipientEmail: cita.psicologo.correo,
        subject: 'PsicoAmparo - Nueva cita asignada',
        htmlBody: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#1E3A5F;padding:24px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="color:#2ECC9A;margin:0">📅 Nueva Cita Asignada</h1>
            </div>
            <div style="padding:24px;background:#f8f9fa;border-radius:0 0 8px 8px">
              <p>Hola <strong>${cita.psicologo?.nombreCompleto ?? ''}</strong>,</p>
              <p>Se te ha asignado una nueva cita:</p>
              <ul>
                <li><strong>Paciente:</strong> ${cita.paciente?.nombreCompleto ?? 'N/A'}</li>
                <li><strong>Motivo:</strong> ${cita.paciente?.motivoConsulta ?? 'N/A'}</li>
                ${fecha_hora_cita ? `<li><strong>Fecha:</strong> ${new Date(fecha_hora_cita).toLocaleString('es-VE', { timeZone: 'America/Caracas' })}</li>` : ''}
              </ul>
              <p>Ingresa a tu dashboard para más detalles.</p>
            </div>
          </div>
        `,
      }).catch(() => {});
    }

    // Notify patient
    const pacNotifId = process.env.NOTIF_ID_CITA_ASIGNADA_NOTIFICACIN_PACIENTE;
    if (pacNotifId && cita?.paciente?.correo) {
      sendNotificationEmail({
        notificationId: pacNotifId,
        recipientEmail: cita.paciente.correo,
        subject: 'PsicoAmparo - Tu cita ha sido confirmada',
        htmlBody: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#1E3A5F;padding:24px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="color:#2ECC9A;margin:0">✅ Cita Confirmada</h1>
            </div>
            <div style="padding:24px;background:#f8f9fa;border-radius:0 0 8px 8px">
              <p>Hola <strong>${cita.paciente?.nombreCompleto ?? ''}</strong>,</p>
              <p>Tu cita ha sido asignada a <strong>${cita.psicologo?.nombreCompleto ?? 'un profesional'}</strong>.</p>
              ${fecha_hora_cita ? `<p>Fecha programada: <strong>${new Date(fecha_hora_cita).toLocaleString('es-VE', { timeZone: 'America/Caracas' })}</strong></p>` : ''}
              <p>Pronto te contactarán para coordinar los detalles.</p>
            </div>
          </div>
        `,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Assign cita error:', error?.message);
    return NextResponse.json({ error: 'Error al asignar cita' }, { status: 500 });
  }
}
