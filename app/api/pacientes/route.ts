export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatWhatsapp } from '@/lib/whatsapp';
import { sendNotificationEmail } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nombre_completo, genero, correo, whatsapp, estado_venezuela,
      motivo_consulta, primera_vez, preferencia_horario,
      forma_contacto_preferida, nivel_urgencia, comentarios_adicionales,
      psicologo_id,
    } = body ?? {};

    if (!nombre_completo || !correo || !motivo_consulta) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    const paciente = await prisma.paciente.create({
      data: {
        nombreCompleto: nombre_completo,
        genero: genero ?? 'masculino',
        correo,
        whatsapp: formatWhatsapp(whatsapp ?? ''),
        estadoVenezuela: estado_venezuela ?? '',
        motivoConsulta: motivo_consulta,
        primeraVez: primera_vez ?? true,
        preferenciaHorario: preferencia_horario ?? 'Manana',
        formaContactoPreferida: forma_contacto_preferida ?? 'WhatsApp',
        nivelUrgencia: nivel_urgencia ?? 'media',
        comentariosAdicionales: comentarios_adicionales ?? null,
      },
    });

    // Create cita
    await prisma.cita.create({
      data: {
        pacienteId: paciente.id,
        psicologoId: psicologo_id ?? null,
        estado: psicologo_id ? 'confirmada' : 'pendiente_asignar',
        origenWhatsapp: 'Web_Directo',
      },
    });

    // Send email to patient
    const notifId = process.env.NOTIF_ID_SOLICITUD_DE_CITA_RECIBIDA;
    if (notifId) {
      await sendNotificationEmail({
        notificationId: notifId,
        recipientEmail: correo,
        subject: 'PsicoAmparo - Tu solicitud de cita fue recibida',
        htmlBody: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#1E3A5F;padding:24px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="color:#2ECC9A;margin:0;font-size:24px">💚 PsicoAmparo</h1>
            </div>
            <div style="padding:24px;background:#f8f9fa;border-radius:0 0 8px 8px">
              <h2 style="color:#1E3A5F">¡Hola ${nombre_completo}!</h2>
              <p>Tu solicitud de cita ha sido recibida exitosamente.</p>
              <p>Nuestro equipo está revisando tu caso y pronto te asignaremos un profesional. Recibirás una notificación cuando tu cita sea confirmada.</p>
              <p style="margin-top:16px;color:#666;font-size:13px">Si tienes alguna pregunta, contáctanos por WhatsApp.</p>
            </div>
          </div>
        `,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, id: paciente.id });
  } catch (error: any) {
    console.error('Paciente create error:', error?.message);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
