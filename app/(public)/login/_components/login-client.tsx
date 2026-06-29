'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Heart, Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!email || !password) {
      toast.error('Ingresa tu correo y contraseña');
      return;
    }
    setLoading(true);
    try {
      const result = await signIn?.('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error('Credenciales inválidas');
      } else {
        // Check role to redirect
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        const role = data?.role ?? 'psicologo';
        window.location.href = role === 'admin' ? '/admin' : '/psicologo/dashboard';
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-[420px] border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center mb-4">
              <Heart className="h-7 w-7 text-[#2ECC9A]" fill="#2ECC9A" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#1E3A5F]">Iniciar Sesión</h1>
            <p className="text-muted-foreground text-sm mt-1">Accede a tu panel de PsicoAmparo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Correo electrónico</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e: any) => setEmail(e?.target?.value ?? '')}
                  placeholder="tu@correo.com"
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Contraseña</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e: any) => setPassword(e?.target?.value ?? '')}
                  placeholder="Tu contraseña"
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <div className="text-right">
              <Link href="/recuperar-contrasena" className="text-sm text-[#2ECC9A] hover:underline font-medium">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white h-12 text-base">
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              {!loading && <LogIn className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/unirme-como-psicologo" className="text-[#2ECC9A] hover:underline font-medium">Postúlate como psicólogo</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
