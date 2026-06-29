'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!email) {
      toast.error('Ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        toast.error(data?.error ?? 'Ocurrió un error. Intenta de nuevo.');
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
            <h1 className="font-display text-2xl font-bold text-[#1E3A5F]">Recuperar Contraseña</h1>
            <p className="text-muted-foreground text-sm mt-1">Te enviaremos un enlace para restablecerla</p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#2ECC9A]/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-[#2ECC9A]" />
              </div>
              <p className="text-sm text-[#1E3A5F] font-medium mb-2">Revisa tu correo</p>
              <p className="text-sm text-muted-foreground mb-6">
                Si existe una cuenta con <span className="font-medium">{email}</span>, recibirás un enlace para restablecer tu contraseña en los próximos minutos. Revisa también tu carpeta de spam.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full h-12">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Iniciar Sesión
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <Button type="submit" disabled={loading} className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white h-12 text-base">
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                <Link href="/login" className="text-[#2ECC9A] hover:underline font-medium inline-flex items-center">
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Volver a Iniciar Sesión
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
