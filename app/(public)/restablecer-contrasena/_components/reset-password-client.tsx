'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    async function validate() {
      if (!token) {
        setTokenValid(false);
        setChecking(false);
        return;
      }
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (active) setTokenValid(!!data?.valid);
      } catch {
        if (active) setTokenValid(false);
      } finally {
        if (active) setChecking(false);
      }
    }
    validate();
    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!password || !confirmPassword) {
      toast.error('Completa ambos campos');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push('/login'), 2500);
      } else {
        toast.error(data?.error ?? 'No se pudo restablecer la contraseña');
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
            <h1 className="font-display text-2xl font-bold text-[#1E3A5F]">Nueva Contraseña</h1>
            <p className="text-muted-foreground text-sm mt-1">Crea una contraseña segura para tu cuenta</p>
          </div>

          {checking ? (
            <p className="text-center text-sm text-muted-foreground">Validando enlace...</p>
          ) : done ? (
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#2ECC9A]/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-[#2ECC9A]" />
              </div>
              <p className="text-sm text-[#1E3A5F] font-medium mb-2">¡Contraseña actualizada!</p>
              <p className="text-sm text-muted-foreground mb-6">Tu contraseña se restableció correctamente. Te redirigiremos al inicio de sesión.</p>
              <Link href="/login">
                <Button className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white h-12">Iniciar Sesión</Button>
              </Link>
            </div>
          ) : !tokenValid ? (
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-sm text-[#1E3A5F] font-medium mb-2">Enlace inválido o expirado</p>
              <p className="text-sm text-muted-foreground mb-6">Este enlace ya no es válido. Solicita uno nuevo para restablecer tu contraseña.</p>
              <Link href="/recuperar-contrasena">
                <Button className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white h-12">Solicitar nuevo enlace</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nueva contraseña</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e: any) => setPassword(e?.target?.value ?? '')}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Confirmar contraseña</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e: any) => setConfirmPassword(e?.target?.value ?? '')}
                    placeholder="Repite la contraseña"
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white h-12 text-base">
                {loading ? 'Guardando...' : 'Restablecer Contraseña'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
