'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Heart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { MOTIVOS_CONSULTA, ESTADOS_VENEZUELA } from '@/lib/constants';
import { isValidVzlaPhone } from '@/lib/whatsapp';

export function AgendarCitaClient() {
  const searchParams = useSearchParams();
  const preselectedPsicId = searchParams?.get('psicologo_id') ?? null;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    motivo_consulta: '',
    primera_vez: true,
    preferencia_horario: 'Manana',
    nombre_completo: '',
    genero: 'masculino',
    estado_venezuela: '',
    correo: '',
    whatsapp: '',
    forma_contacto_preferida: 'WhatsApp',
    nivel_urgencia: 'media',
    comentarios_adicionales: '',
  });

  const updateField = (field: string, value: any) => setForm((prev: any) => ({ ...(prev ?? {}), [field]: value }));

  const handleSubmit = async () => {
    if (!form?.nombre_completo || !form?.correo || !form?.whatsapp || !form?.motivo_consulta) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }
    if (!isValidVzlaPhone(form.whatsapp)) {
      toast.error('Número de WhatsApp inválido. Usa formato venezolano: +58 4XX XXXXXXX');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, psicologo_id: preselectedPsicId }),
      });
      const data = await res.json();
      if (data?.success) {
        setSuccess(true);
      } else {
        toast.error(data?.error ?? 'Error al enviar la solicitud');
      }
    } catch {
      toast.error('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="mx-auto w-20 h-20 rounded-full bg-[#2ECC9A]/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-[#2ECC9A]" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[#1E3A5F] mb-4">¡Solicitud recibida con éxito!</h1>
          <p className="text-muted-foreground text-lg mb-2">Tu caso ha sido ingresado al sistema.</p>
          <p className="text-muted-foreground">Nuestro equipo revisará tu solicitud y te contactará en menos de 24 horas para coordinar tu cita.</p>
          <p className="text-sm text-muted-foreground mt-4">Revisa tu correo electrónico para una confirmación.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#2ECC9A]/10 flex items-center justify-center mb-4">
          <Calendar className="h-7 w-7 text-[#2ECC9A]" />
        </div>
        <h1 className="font-display text-3xl font-bold text-[#1E3A5F] tracking-tight">Solicitar Cita de Apoyo</h1>
        <p className="text-muted-foreground mt-2">Completa el formulario y te asignaremos un profesional</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-[#2ECC9A]' : 'bg-muted'}`} />
        <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-[#2ECC9A]' : 'bg-muted'}`} />
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-semibold text-[#1E3A5F] mb-6">Paso 1: Sobre tu consulta</h2>
                <div className="space-y-5">
                  <div>
                    <Label className="text-sm font-medium">Motivo de consulta *</Label>
                    <select
                      value={form?.motivo_consulta ?? ''}
                      onChange={(e: any) => updateField('motivo_consulta', e?.target?.value)}
                      className="mt-1.5 w-full h-12 px-3 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="">Selecciona un motivo</option>
                      {MOTIVOS_CONSULTA.map((m: string) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">¿Es tu primera vez recibiendo apoyo psicológico?</Label>
                    <div className="flex gap-4 mt-2">
                      {[{ label: 'Sí, es mi primera vez', val: true }, { label: 'No, he recibido antes', val: false }].map((opt: any) => (
                        <button
                          key={String(opt.val)}
                          type="button"
                          onClick={() => updateField('primera_vez', opt.val)}
                          className={`flex-1 p-3 rounded-lg border text-sm transition-colors ${
                            form?.primera_vez === opt.val ? 'border-[#2ECC9A] bg-[#2ECC9A]/5 text-[#1E3A5F] font-medium' : 'border-input hover:border-[#2ECC9A]/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preferencia de horario</Label>
                    <div className="flex gap-3 mt-2">
                      {[{ label: '🌅 Mañana', val: 'Manana' }, { label: '☀️ Tarde', val: 'Tarde' }, { label: '🌙 Noche', val: 'Noche' }].map((h: any) => (
                        <button
                          key={h.val}
                          type="button"
                          onClick={() => updateField('preferencia_horario', h.val)}
                          className={`flex-1 p-3 rounded-lg border text-sm transition-colors ${
                            form?.preferencia_horario === h.val ? 'border-[#2ECC9A] bg-[#2ECC9A]/5 font-medium text-[#1E3A5F]' : 'border-input hover:border-[#2ECC9A]/50'
                          }`}
                        >
                          {h.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => { if (!form?.motivo_consulta) { toast.error('Selecciona un motivo de consulta'); return; } setStep(2); }}
                    className="bg-[#2ECC9A] hover:bg-[#27b589] text-white h-12 px-6"
                  >
                    Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-xl font-semibold text-[#1E3A5F] mb-6">Paso 2: Tus datos</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Nombre completo *</Label>
                    <Input value={form?.nombre_completo ?? ''} onChange={(e: any) => updateField('nombre_completo', e?.target?.value)} placeholder="Tu nombre" className="mt-1.5 h-12" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Género</Label>
                    <div className="flex gap-4 mt-1.5">
                      {[{ label: 'Masculino', val: 'masculino' }, { label: 'Femenino', val: 'femenino' }].map((g: any) => (
                        <button
                          key={g.val}
                          type="button"
                          onClick={() => updateField('genero', g.val)}
                          className={`flex-1 p-3 rounded-lg border text-sm transition-colors ${
                            form?.genero === g.val ? 'border-[#2ECC9A] bg-[#2ECC9A]/5 font-medium text-[#1E3A5F]' : 'border-input hover:border-[#2ECC9A]/50'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado de Venezuela *</Label>
                    <select
                      value={form?.estado_venezuela ?? ''}
                      onChange={(e: any) => updateField('estado_venezuela', e?.target?.value)}
                      className="mt-1.5 w-full h-12 px-3 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="">Selecciona tu estado</option>
                      {ESTADOS_VENEZUELA.map((e: string) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Correo electrónico *</Label>
                    <Input type="email" value={form?.correo ?? ''} onChange={(e: any) => updateField('correo', e?.target?.value)} placeholder="tu@correo.com" className="mt-1.5 h-12" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">WhatsApp *</Label>
                    <Input value={form?.whatsapp ?? ''} onChange={(e: any) => updateField('whatsapp', e?.target?.value)} placeholder="+58 412 0000000" className="mt-1.5 h-12" />
                    <p className="text-xs text-muted-foreground mt-1">Formato venezolano: +58 4XX XXXXXXX</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Forma de contacto preferida</Label>
                    <select
                      value={form?.forma_contacto_preferida ?? 'WhatsApp'}
                      onChange={(e: any) => updateField('forma_contacto_preferida', e?.target?.value)}
                      className="mt-1.5 w-full h-12 px-3 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Llamada telefónica">Llamada telefónica</option>
                      <option value="Correo electrónico">Correo electrónico</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Nivel de urgencia</Label>
                    <div className="flex gap-3 mt-1.5">
                      {[{ label: 'Baja', val: 'baja', color: 'text-green-600' }, { label: 'Media', val: 'media', color: 'text-yellow-600' }, { label: 'Alta', val: 'alta', color: 'text-red-600' }].map((u: any) => (
                        <button
                          key={u.val}
                          type="button"
                          onClick={() => updateField('nivel_urgencia', u.val)}
                          className={`flex-1 p-3 rounded-lg border text-sm transition-colors ${
                            form?.nivel_urgencia === u.val ? 'border-[#2ECC9A] bg-[#2ECC9A]/5 font-medium text-[#1E3A5F]' : 'border-input hover:border-[#2ECC9A]/50'
                          }`}
                        >
                          <span className={u.color}>{u.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Comentarios adicionales (opcional)</Label>
                    <textarea
                      value={form?.comentarios_adicionales ?? ''}
                      onChange={(e: any) => updateField('comentarios_adicionales', e?.target?.value)}
                      rows={3}
                      className="mt-1.5 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none"
                      placeholder="Algo más que quieras compartir..."
                    />
                  </div>
                </div>
                <div className="mt-8 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-12">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading} className="bg-[#2ECC9A] hover:bg-[#27b589] text-white h-12 px-6">
                    {loading ? 'Enviando...' : 'Enviar Solicitud'}
                    {!loading && <Heart className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      <p className="text-xs text-center text-muted-foreground mt-6">Tu información es tratada con estricta confidencialidad.</p>
    </div>
  );
}
