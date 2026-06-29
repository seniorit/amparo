export async function sendNotificationEmail({
  notificationId,
  recipientEmail,
  subject,
  htmlBody,
  replyTo,
}: {
  notificationId: string;
  recipientEmail: string;
  subject: string;
  htmlBody: string;
  replyTo?: string;
}) {
  try {
    const appUrl = process.env.NEXTAUTH_URL ?? '';
    let appName = 'PsicoAmparo';
    let senderEmail = 'noreply@mail.abacusai.app';
    try {
      const hostname = new URL(appUrl).hostname;
      appName = hostname?.split('.')?.[0] ?? 'PsicoAmparo';
      senderEmail = `noreply@${hostname}`;
    } catch {}

    const response = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        app_id: process.env.WEB_APP_ID,
        notification_id: notificationId,
        subject,
        body: htmlBody,
        is_html: true,
        recipient_email: recipientEmail,
        reply_to: replyTo,
        sender_email: senderEmail,
        sender_alias: appName,
      }),
    });
    const result = await response.json();
    if (!result?.success && !result?.notification_disabled) {
      console.error('Email send failed:', result?.message);
    }
    return result;
  } catch (error: any) {
    console.error('Email error:', error?.message);
    return { success: false };
  }
}
