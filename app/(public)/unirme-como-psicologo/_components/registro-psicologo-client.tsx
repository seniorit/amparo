'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { CheckCircle2, UserPlus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ESPECIALIDADES, DIAS_SEMANA, FRANJAS_HORARIAS } from '@/lib/constants';

export function RegistroPsicologoClient() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({
    nombre_completo: '',
    correo: '',
    password: '',
    whatsapp: '',
    especialidades: [] as string[],
    anos_experiencia: '',
    numero_colegiado: '',
    pais_residencia: 'Venezuela',
    bio: '',
    disponibilidad_semanal: {} as Record<string, string[]>,
  });

  const updateField = (field: string, value: any) => setForm((prev: any) => ({ ...(prev ?? {}), [field]: value }));

  const toggleEspecialidad = (esp: string) => {
    const current = form?.especialidades ?? [];
    updateField('especialidades', current.includes(esp) ? current.filter((e: string) => e !== esp) : [...current, esp]);
  };

  const toggleDisponibilidad = (dia: string, franja: string) => {
    const disp = { ...(form?.disponibilidad_semanal ?? {}) };
    const current = disp[dia] ?? [];
    disp[dia] = current.includes(franja) ? current.filter((f: string) => f !== franja) : [...current, franja];
    updateField('disponibilidad_semanal', disp);
  };

  const handleSubmit = async () => {
    if (!form?.nombre_completo || !form?.correo || !form?.password || !form?.whatsapp) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    if ((form?.password?.length ?? 0) < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data?.success) {
        setSuccess(true);
        // Auto login
        await signIn?.('credentials', {
          email: form?.correo,
          password: form?.password,
          redirect: true,
          callbackUrl: '/psicologo/dashboard',
        });
      } else {
        toast.error(data?.error ?? 'Error al registrar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="mx-auto w-20 h-20 rounded-full bg-[#2ECC9A]/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-[#2ECC9A]" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[#1E3A5F] mb-4">¡Postulación enviada!</h1>
          <p className="text-muted-foreground text-lg">Tu postulación está bajo revisión. Nuestro equipo la evaluará y te notificará cuando sea aprobada.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center mb-4">
          <UserPlus className="h-7 w-7 text-[#1E3A5F]" />
        </div>
        <h1 className="font-display text-3xl font-bold text-[#1E3A5F] tracking-tight">Postularme como Psicólogo Voluntario</h1>
        <p className="text-muted-foreground mt-2">Únete a nuestra red de profesionales y ayuda a venezolanos que lo necesitan</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Nombre completo *</Label>
              <Input value={form?.nombre_completo ?? ''} onChange={(e: any) => updateField('nombre_completo', e?.target?.value)} className="mt-1.5 h-12" />
            </div>
            <div>
              <Label className="text-sm font-medium">Correo electrónico *</Label>
              <Input type="email" value={form?.correo ?? ''} onChange={(e: any) => updateField('correo', e?.target?.value)} className="mt-1.5 h-12" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Contraseña *</Label>
              <Input type="password" value={form?.password ?? ''} onChange={(e: any) => updateField('password', e?.target?.value)} className="mt-1.5 h-12" placeholder="Mínimo 8 caracteres" />
            </div>
            <div>
              <Label className="text-sm font-medium">WhatsApp *</Label>
              <Input value={form?.whatsapp ?? ''} onChange={(e: any) => updateField('whatsapp', e?.target?.value)} placeholder="+58 412 0000000" className="mt-1.5 h-12" />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Especialidades *</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ESPECIALIDADES.map((esp: string) => (
                <button
                  key={esp}
                  type="button"
                  onClick={() => toggleEspecialidad(esp)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    (form?.especialidades ?? []).includes(esp)
                      ? 'bg-[#2ECC9A] text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {esp}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Años de experiencia</Label>
              <Input type="number" value={form?.anos_experiencia ?? ''} onChange={(e: any) => updateField('anos_experiencia', e?.target?.value)} className="mt-1.5 h-12" min="0" />
            </div>
            <div>
              <Label className="text-sm font-medium">Número colegiado</Label>
              <Input value={form?.numero_colegiado ?? ''} onChange={(e: any) => updateField('numero_colegiado', e?.target?.value)} className="mt-1.5 h-12" />
            </div>
            <div>
              <Label className="text-sm font-medium">País de residencia</Label>
              <Input value={form?.pais_residencia ?? ''} onChange={(e: any) => updateField('pais_residencia', e?.target?.value)} className="mt-1.5 h-12" />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Bio (máximo 300 caracteres)</Label>
            <textarea
              value={form?.bio ?? ''}
              onChange={(e: any) => updateField('bio', (e?.target?.value ?? '').slice(0, 300))}
              rows={3}
              className="mt-1.5 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none"
              placeholder="Cuéntanos sobre tu experiencia y enfoque terapéutico..."
            />
            <p className="text-xs text-muted-foreground mt-1">{(form?.bio?.length ?? 0)}/300</p>
          </div>

          <div>
            <Label className="text-sm font-medium">Disponibilidad semanal</Label>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Día</th>
                    {FRANJAS_HORARIAS.map((f: string) => <th key={f} className="p-2 text-center">{f}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {DIAS_SEMANA.map((dia: string) => (
                    <tr key={dia} className="border-t border-muted">
                      <td className="p-2 capitalize font-medium">{dia}</td>
                      {FRANJAS_HORARIAS.map((franja: string) => {
                        const isActive = ((form?.disponibilidad_semanal ?? {})[dia] ?? []).includes(franja);
                        return (
                          <td key={franja} className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => toggleDisponibilidad(dia, franja)}
                              className={`w-8 h-8 rounded-lg transition-colors ${
                                isActive ? 'bg-[#2ECC9A] text-white' : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              {isActive ? '✓' : ''}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSubmit} disabled={loading} className="w-full bg-[#1E3A5F] hover:bg-[#162d4a] text-white h-14 text-base">
              {loading ? 'Enviando postulación...' : 'Enviar Postulación'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
