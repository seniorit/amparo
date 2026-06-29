'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1E3A5F] text-white/80 py-12">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-[#2ECC9A]" fill="#2ECC9A" />
            <span className="font-display font-bold text-lg text-white">PsicoAmparo</span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm">
            <Link href="/psicologos" className="hover:text-[#2ECC9A] transition-colors">Directorio</Link>
            <Link href="/agendar-cita" className="hover:text-[#2ECC9A] transition-colors">Agendar Cita</Link>
            <Link href="/unirme-como-psicologo" className="hover:text-[#2ECC9A] transition-colors">Únete como Psicólogo</Link>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-white/20 text-center text-xs text-white/50">
          © {new Date().getFullYear()} PsicoAmparo. Teleconsulta psicológica gratuita para Venezuela.
        </div>
      </div>
    </footer>
  );
}
