'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  CalendarCheck, Clock, Users, CheckCircle, XCircle, Phone,
  MessageCircle, AlertTriangle, Edit, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getWhatsappLink } from '@/lib/whatsapp';

interface Cita {
  id: string;
  estado: string;
  fechaHoraCita: string | null;
  fechaSolicitud: string;
  metodoContacto: string;
  notasInternas: string | null;
  paciente: {
    id: string;
    nombreCompleto: string;
    whatsapp: string;
    motivoConsulta: string;
    nivelUrgencia: string;
    preferenciaHorario: string;
  } | null;
}

const estadoColors: Record<string, string> = {
  pendiente_asignar: 'bg-yellow-100 text-yellow-700',
  confirmada: 'bg-blue-100 text-blue-700',
  completada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-700',
};

const estadoLabels: Record<string, string> = {
  pendiente_asignar: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export function PsicologoDashboardClient() {
  const { data: session } = useSession() || {};
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const estadoPerfil = (session?.user as any)?.estadoPerfil;

  const fetchCitas = () => {
    fetch('/api/psicologo/citas')
      .then((r: any) => r?.json?.())
      .then((data: any) => setCitas(data ?? []))
      .catch(() => setCitas([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCitas(); }, []);

  const updateEstado = async (citaId: string, estado: string) => {
    try {
      const res = await fetch('/api/psicologo/citas/estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cita_id: citaId, estado }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success('Estado actualizado');
        fetchCitas();
      } else {
        toast.error('Error al actualizar');
      }
    } catch { toast.error('Error de conexión'); }
  };

  const pendientes = (citas ?? []).filter((c: Cita) => c?.estado === 'confirmada')?.length ?? 0;
  const completadas = (citas ?? []).filter((c: Cita) => c?.estado === 'completada')?.length ?? 0;
  const totalPacientes = new Set((citas ?? []).map((c: Cita) => c?.paciente?.id).filter(Boolean))?.size ?? 0;

  if (estadoPerfil === 'pendiente') {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-[#1E3A5F] mb-3">Perfil en revisión</h1>
        <p className="text-muted-foreground">Tu postulación está siendo evaluada por nuestro equipo. Te notificaremos cuando sea aprobada.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-[#1E3A5F] tracking-tight">
          Hola, {session?.user?.name ?? 'Psicólogo'}
        </h1>
        <p className="text-muted-foreground mt-1">Revisa tu agenda y gestiona tus citas</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Citas Confirmadas', value: pendientes, icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'Completadas', value: completadas, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Total Pacientes', value: totalPacientes, icon: Users, color: 'text-purple-600 bg-purple-50' },
        ].map((m: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center`}>
                  <m.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1E3A5F]">{m.value}</p>
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Citas List */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="font-display text-xl text-[#1E3A5F]">Mis Citas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i: number) => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : (citas?.length ?? 0) === 0 ? (
            <div className="text-center py-12">
              <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No tienes citas asignadas aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(citas ?? []).map((cita: Cita, i: number) => (
                <motion.div
                  key={cita?.id ?? i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-[#f8f9fa] hover:bg-white transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#1E3A5F] truncate">{cita?.paciente?.nombreCompleto ?? 'Paciente'}</h3>
                        <Badge className={`text-xs ${estadoColors[cita?.estado ?? ''] ?? 'bg-gray-100'}`}>
                          {estadoLabels[cita?.estado ?? ''] ?? cita?.estado}
                        </Badge>
                        {cita?.paciente?.nivelUrgencia === 'alta' && (
                          <Badge className="bg-red-100 text-red-700 text-xs">Urgente</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{cita?.paciente?.motivoConsulta ?? ''}</p>
                      {cita?.fechaHoraCita && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {new Date(cita.fechaHoraCita).toLocaleString('es-VE', { timeZone: 'America/Caracas', dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {cita?.paciente?.whatsapp && (
                        <a href={getWhatsappLink(cita.paciente.whatsapp)} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="bg-[#25D366] hover:bg-[#20bd5a] text-white h-9">
                            <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                          </Button>
                        </a>
                      )}
                      {cita?.estado === 'confirmada' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => updateEstado(cita?.id ?? '', 'completada')} className="h-9">
                            <CheckCircle className="h-4 w-4 mr-1" /> Completar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateEstado(cita?.id ?? '', 'cancelada')} className="h-9 text-red-600 hover:text-red-700">
                            <XCircle className="h-4 w-4 mr-1" /> Cancelar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
