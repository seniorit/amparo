export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendNotificationEmail } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const correo = (body?.correo ?? body?.email ?? '').trim().toLowerCase();

    if (!correo) {
      return NextResponse.json({ error: 'Ingresa tu correo electrónico' }, { status: 400 });
    }

    // Always respond success to avoid leaking which emails exist
    const genericResponse = NextResponse.json({
      success: true,
      message: 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.',
    });

    const usuario = await prisma.psicologo.findFirst({
      where: { correo: { equals: correo, mode: 'insensitive' } },
    });

    if (!usuario) {
      return genericResponse;
    }

    // Invalidate previous unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { psicologoId: usuario.id, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        correo: usuario.correo,
        psicologoId: usuario.id,
        expiresAt,
      },
    });

    const appUrl = process.env.NEXTAUTH_URL ?? '';
    const resetLink = `${appUrl}/restablecer-contrasena?token=${token}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1E3A5F;">
        <div style="text-align:center; padding: 24px 0;">
          <h1 style="color:#1E3A5F; margin:0;">PsicoAmparo</h1>
        </div>
        <div style="background:#f8f9fa; border-radius:12px; padding:32px;">
          <h2 style="margin-top:0; color:#1E3A5F;">Restablece tu contraseña</h2>
          <p style="font-size:15px; line-height:1.6; color:#333;">Hola ${usuario.nombreCompleto},</p>
          <p style="font-size:15px; line-height:1.6; color:#333;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña. Este enlace expirará en 1 hora.</p>
          <div style="text-align:center; margin: 28px 0;">
            <a href="${resetLink}" style="background:#2ECC9A; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold; display:inline-block;">Restablecer Contraseña</a>
          </div>
          <p style="font-size:13px; line-height:1.6; color:#666;">Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.</p>
          <p style="font-size:13px; line-height:1.6; color:#666;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br/><a href="${resetLink}" style="color:#2ECC9A; word-break:break-all;">${resetLink}</a></p>
        </div>
        <p style="text-align:center; font-size:12px; color:#999; margin-top:24px;">PsicoAmparo — Apoyo psicológico gratuito para Venezuela</p>
      </div>
    `;

    await sendNotificationEmail({
      notificationId: process.env.NOTIF_ID_RESTABLECER_CONTRASEA ?? '',
      recipientEmail: usuario.correo,
      subject: 'Restablece tu contraseña — PsicoAmparo',
      htmlBody,
    });

    return genericResponse;
  } catch (error: any) {
    console.error('Forgot password error:', error?.message);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
