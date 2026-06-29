'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X, Heart, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { data: session } = useSession() || {};
  const [open, setOpen] = useState(false);
  const role = (session?.user as any)?.role;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-7 w-7 text-[#2ECC9A]" fill="#2ECC9A" />
          <span className="font-display font-bold text-xl text-[#1E3A5F]">PsicoAmparo</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/psicologos">
            <Button variant="ghost" size="sm">Directorio</Button>
          </Link>
          <Link href="/agendar-cita">
            <Button variant="ghost" size="sm">Agendar Cita</Button>
          </Link>
          {!session ? (
            <Link href="/login">
              <Button variant="outline" size="sm">Iniciar Sesión</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-1">
              <Link href={role === 'admin' ? '/admin' : '/psicologo/dashboard'}>
                <Button variant="ghost" size="sm"><LayoutDashboard className="h-4 w-4 mr-1" />Dashboard</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut?.({ callbackUrl: '/' })}>
                <LogOut className="h-4 w-4 mr-1" />Salir
              </Button>
            </div>
          )}
          <Link href="/agendar-cita">
            <Button size="sm" className="bg-[#2ECC9A] hover:bg-[#27b589] text-white ml-2">
              Solicitar Cita
            </Button>
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menú">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 pb-4 space-y-2">
          <Link href="/psicologos" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">Directorio</Button>
          </Link>
          <Link href="/agendar-cita" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">Agendar Cita</Button>
          </Link>
          {!session ? (
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full">Iniciar Sesión</Button>
            </Link>
          ) : (
            <>
              <Link href={role === 'admin' ? '/admin' : '/psicologo/dashboard'} onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <LayoutDashboard className="h-4 w-4 mr-2" />Dashboard
                </Button>
              </Link>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { signOut?.({ callbackUrl: '/' }); setOpen(false); }}>
                <LogOut className="h-4 w-4 mr-2" />Cerrar Sesión
              </Button>
            </>
          )}
          <Link href="/agendar-cita" onClick={() => setOpen(false)}>
            <Button className="w-full bg-[#2ECC9A] hover:bg-[#27b589] text-white">Solicitar Cita →</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
