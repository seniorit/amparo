/**
 * Formats a Venezuelan phone number to international WhatsApp format.
 * Accepts: 04121234567, 0412-123-4567, +584121234567, 584121234567, +58 412 1234567, etc.
 * Returns: +58 412 1234567
 */
export function formatWhatsapp(raw: string): string {
  const digits = (raw ?? '').replace(/[^0-9]/g, '');
  let cleaned = digits;
  if (cleaned.startsWith('58')) {
    cleaned = cleaned.slice(2);
  }
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  if (cleaned.length < 10) return raw ?? '';
  const area = cleaned.slice(0, 3);
  const rest = cleaned.slice(3);
  return `+58 ${area} ${rest}`;
}

/**
 * Get WhatsApp link from a phone number
 */
export function getWhatsappLink(phone: string): string {
  const digits = (phone ?? '').replace(/[^0-9]/g, '');
  let num = digits;
  if (!num.startsWith('58') && num.startsWith('0')) {
    num = '58' + num.slice(1);
  } else if (!num.startsWith('58')) {
    num = '58' + num;
  }
  return `https://wa.me/${num}`;
}

/**
 * Validates that the number looks like a Venezuelan phone
 */
export function isValidVzlaPhone(raw: string): boolean {
  const digits = (raw ?? '').replace(/[^0-9]/g, '');
  let cleaned = digits;
  if (cleaned.startsWith('58')) cleaned = cleaned.slice(2);
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  return cleaned.length === 10 && ['412','414','416','424','426'].some(p => cleaned.startsWith(p));
}
