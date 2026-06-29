'use client';

import { MessageCircle } from 'lucide-react';

export function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/584120000000?text=Hola%20PsicoAmparo%2C%20necesito%20apoyo"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full px-4 py-3 shadow-lg transition-all hover:scale-105"
      aria-label="Soporte WhatsApp"
    >
      <MessageCircle className="h-5 w-5" fill="white" />
      <span className="hidden sm:inline text-sm font-medium">Soporte PsicoAmparo</span>
    </a>
  );
}
