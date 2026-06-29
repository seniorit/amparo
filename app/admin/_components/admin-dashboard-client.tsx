'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, CalendarCheck, TrendingUp, Clock, UserCheck,
  UserX, CheckCircle, XCircle, AlertCircle, Search,
  ArrowRight, Calendar, ChevronDown, Download, Plus,
  Pencil, Trash2, Shield, UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { AvailabilityPicker } from './availability-picker';

interface Stats {
  totalPacientes: number;
  psicologosActivos: number;
  citasCompletadas: number;
  citasPendientes: number;
  totalCitas: number;
  tasaOcupacion: number;
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

const perfilColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  activo: 'bg-green-100 text-green-700',
  inactivo: 'bg-red-100 text-red-700',
};

export function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [psicologos, setPsicologos] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstadoCita, setFiltroEstadoCita] = useState('');
  const [asignando, setAsignando] = useState<string | null>(null);
  const [asignarForm, setAsignarForm] = useState({ psicologo_id: '', fecha_hora_cita: '' });

  // Export
  const [exporting, setExporting] = useState(false);

  // Psicologo create/edit modal
  const emptyPsic = { id: '', nombreCompleto: '', correo: '', password: '', whatsapp: '', especialidades: '', anosExperiencia: '0', numeroColegiado: '', bio: '' };
  const [psicModalOpen, setPsicModalOpen] = useState(false);
  const [psicModalMode, setPsicModalMode] = useState<'crear' | 'editar'>('crear');
  const [psicForm, setPsicForm] = useState<any>(emptyPsic);
  const [psicSaving, setPsicSaving] = useState(false);

  // Delete confirmation
  const [psicToDelete, setPsicToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // Admin create/edit modal
  const emptyAdmin = { id: '', nombreCompleto: '', correo: '', password: '', whatsapp: '' };
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminModalMode, setAdminModalMode] = useState<'crear' | 'editar'>('crear');
  const [adminForm, setAdminForm] = useState<any>(emptyAdmin);
  const [adminSaving, setAdminSaving] = useState(false);

  // Admin delete confirmation
  const [adminToDelete, setAdminToDelete] = useState<any>(null);
  const [adminDeleting, setAdminDeleting] = useState(false);

  const fetchAll = async () => {
    try {
      const [statsRes, citasRes, psicRes, adminRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/citas'),
        fetch('/api/admin/psicologos'),
        fetch('/api/admin/administradores'),
      ]);
      setStats(await statsRes?.json?.() ?? null);
      setCitas(await citasRes?.json?.() ?? []);
      setPsicologos(await psicRes?.json?.() ?? []);
      setAdmins(await adminRes?.json?.() ?? []);
    } catch {
      toast.error('Error cargando datos');
    } finally { setLoading(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/pacientes/export');
      if (!res.ok) { toast.error('No se pudo generar el archivo'); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pacientes-psicoamparo-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Archivo Excel descargado');
    } catch {
      toast.error('Error al descargar el archivo');
    } finally {
      setExporting(false);
    }
  };

  const openCrearPsic = () => { setPsicModalMode('crear'); setPsicForm(emptyPsic); setPsicModalOpen(true); };
  const openEditarPsic = (p: any) => {
    setPsicModalMode('editar');
    setPsicForm({
      id: p?.id ?? '',
      nombreCompleto: p?.nombreCompleto ?? '',
      correo: p?.correo ?? '',
      password: '',
      whatsapp: p?.whatsapp ?? '',
      especialidades: (p?.especialidades ?? []).join(', '),
      anosExperiencia: String(p?.anosExperiencia ?? '0'),
      numeroColegiado: p?.numeroColegiado ?? '',
      bio: p?.bio ?? '',
    });
    setPsicModalOpen(true);
  };

  const handleSavePsic = async () => {
    if (!psicForm?.nombreCompleto?.trim() || !psicForm?.correo?.trim()) {
      toast.error('Nombre y correo son obligatorios'); return;
    }
    if (psicModalMode === 'crear' && (!psicForm?.password || psicForm.password.length < 6)) {
      toast.error('La contraseña debe tener al menos 6 caracteres'); return;
    }
    setPsicSaving(true);
    try {
      const endpoint = psicModalMode === 'crear' ? '/api/admin/psicologos/crear' : '/api/admin/psicologos/actualizar';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(psicForm),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(psicModalMode === 'crear' ? 'Psicólogo creado correctamente' : 'Psicólogo actualizado');
        setPsicModalOpen(false);
        fetchAll();
      } else { toast.error(data?.error ?? 'Error al guardar'); }
    } catch { toast.error('Error de conexión'); } finally { setPsicSaving(false); }
  };

  const handleDeletePsic = async () => {
    if (!psicToDelete?.id) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/psicologos/eliminar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: psicToDelete.id }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success('Psicólogo eliminado');
        setPsicToDelete(null);
        fetchAll();
      } else { toast.error(data?.error ?? 'No se pudo eliminar'); }
    } catch { toast.error('Error de conexión'); } finally { setDeleting(false); }
  };

  const openCrearAdmin = () => { setAdminModalMode('crear'); setAdminForm(emptyAdmin); setAdminModalOpen(true); };
  const openEditarAdmin = (a: any) => {
    setAdminModalMode('editar');
    setAdminForm({
      id: a?.id ?? '',
      nombreCompleto: a?.nombreCompleto ?? '',
      correo: a?.correo ?? '',
      password: '',
      whatsapp: a?.whatsapp ?? '',
    });
    setAdminModalOpen(true);
  };

  const handleSaveAdmin = async () => {
    if (!adminForm?.nombreCompleto?.trim() || !adminForm?.correo?.trim()) {
      toast.error('Nombre y correo son obligatorios'); return;
    }
    if (adminModalMode === 'crear' && (!adminForm?.password || adminForm.password.length < 6)) {
      toast.error('La contraseña debe tener al menos 6 caracteres'); return;
    }
    setAdminSaving(true);
    try {
      const res = await fetch('/api/admin/administradores', {
        method: adminModalMode === 'crear' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(adminModalMode === 'crear' ? 'Administrador creado correctamente' : 'Administrador actualizado');
        setAdminModalOpen(false);
        setAdminForm(emptyAdmin);
        fetchAll();
      } else { toast.error(data?.error ?? 'Error al guardar administrador'); }
    } catch { toast.error('Error de conexión'); } finally { setAdminSaving(false); }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete?.id) return;
    setAdminDeleting(true);
    try {
      const res = await fetch('/api/admin/administradores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adminToDelete.id }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success('Administrador eliminado');
        setAdminToDelete(null);
        fetchAll();
      } else { toast.error(data?.error ?? 'No se pudo eliminar'); }
    } catch { toast.error('Error de conexión'); } finally { setAdminDeleting(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const psicologosActivos = (psicologos ?? []).filter((p: any) => p?.estadoPerfil === 'activo');
  const psicologosPendientes = (psicologos ?? []).filter((p: any) => p?.estadoPerfil === 'pendiente');

  const citasFiltradas = filtroEstadoCita
    ? (citas ?? []).filter((c: any) => c?.estado === filtroEstadoCita)
    : (citas ?? []);

  const handleAsignar = async (citaId: string) => {
    if (!asignarForm?.psicologo_id) { toast.error('Selecciona un psicólogo'); return; }
    try {
      const res = await fetch('/api/admin/citas/asignar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cita_id: citaId,
          psicologo_id: asignarForm.psicologo_id,
          fecha_hora_cita: asignarForm.fecha_hora_cita || null,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success('Cita asignada exitosamente. Notificaciones enviadas.');
        setAsignando(null);
        setAsignarForm({ psicologo_id: '', fecha_hora_cita: '' });
        fetchAll();
      } else { toast.error(data?.error ?? 'Error al asignar'); }
    } catch { toast.error('Error de conexión'); }
  };

  const handleEstadoPsicologo = async (id: string, estado: string) => {
    try {
      const res = await fetch('/api/admin/psicologos/estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ psicologo_id: id, estado }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(estado === 'activo' ? 'Psicólogo aprobado. Notificación enviada.' : 'Psicólogo suspendido.');
        fetchAll();
      } else { toast.error('Error al actualizar'); }
    } catch { toast.error('Error de conexión'); }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i: number) => <div key={i} className="h-28 bg-white rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#1E3A5F] tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground mt-1">Gestiona citas, psicólogos y métricas de PsicoAmparo</p>
        </div>
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="bg-[#2ECC9A] hover:bg-[#27b589] text-white h-11 self-start sm:self-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Generando...' : 'Exportar Pacientes (Excel)'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pacientes', value: stats?.totalPacientes ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Psicólogos Activos', value: stats?.psicologosActivos ?? 0, icon: UserCheck, color: 'text-green-600 bg-green-50' },
          { label: 'Citas Pendientes', value: stats?.citasPendientes ?? 0, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Tasa Ocupación', value: `${stats?.tasaOcupacion ?? 0}%`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
        ].map((m: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-0 shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${m.color} flex items-center justify-center`}>
                    <m.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1E3A5F]">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="citas" className="space-y-6">
        <TabsList className="bg-white shadow-sm">
          <TabsTrigger value="citas" className="text-sm">Citas ({citas?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="psicologos" className="text-sm">Psicólogos ({psicologos?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="administradores" className="text-sm">Administradores ({admins?.length ?? 0})</TabsTrigger>
        </TabsList>

        {/* Citas Tab */}
        <TabsContent value="citas">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="font-display text-xl text-[#1E3A5F]">Gestión de Citas</CardTitle>
              <select
                value={filtroEstadoCita}
                onChange={(e: any) => setFiltroEstadoCita(e?.target?.value ?? '')}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente_asignar">Pendiente de asignar</option>
                <option value="confirmada">Confirmada</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(citasFiltradas?.length ?? 0) === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarCheck className="h-10 w-10 mx-auto mb-3" />
                    <p>No hay citas con este filtro</p>
                  </div>
                ) : (
                  (citasFiltradas ?? []).map((cita: any, i: number) => (
                    <div key={cita?.id ?? i} className="p-4 rounded-xl bg-[#f8f9fa] hover:bg-white transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-[#1E3A5F]">{cita?.paciente?.nombreCompleto ?? 'Paciente'}</h4>
                            <Badge className={`text-xs ${estadoColors[cita?.estado ?? ''] ?? ''}`}>
                              {estadoLabels[cita?.estado ?? ''] ?? cita?.estado}
                            </Badge>
                            {cita?.paciente?.nivelUrgencia === 'alta' && (
                              <Badge className="bg-red-100 text-red-700 text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />Urgente
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{cita?.paciente?.motivoConsulta ?? ''}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            {cita?.psicologo && <span>Psicólogo: <strong>{cita.psicologo?.nombreCompleto}</strong></span>}
                            {cita?.fechaHoraCita && (
                              <span>
                                <Calendar className="inline h-3 w-3 mr-0.5" />
                                {new Date(cita.fechaHoraCita).toLocaleString('es-VE', { timeZone: 'America/Caracas', dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            )}
                            <span>Origen: {(cita?.origenWhatsapp ?? '').replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {cita?.estado === 'pendiente_asignar' && (
                            <Button
                              size="sm"
                              onClick={() => { setAsignando(asignando === cita?.id ? null : cita?.id); setAsignarForm({ psicologo_id: '', fecha_hora_cita: '' }); }}
                              className="bg-[#2ECC9A] hover:bg-[#27b589] text-white h-9"
                            >
                              Asignar Psicólogo <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Assign form */}
                      {asignando === cita?.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 p-4 bg-white rounded-lg border border-border"
                        >
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm">Psicólogo activo *</Label>
                              <select
                                value={asignarForm?.psicologo_id ?? ''}
                                onChange={(e: any) => setAsignarForm((prev: any) => ({ ...(prev ?? {}), psicologo_id: e?.target?.value, fecha_hora_cita: '' }))}
                                className="mt-1 w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                              >
                                <option value="">Seleccionar...</option>
                                {(psicologosActivos ?? []).map((p: any) => (
                                  <option key={p?.id} value={p?.id ?? ''}>{p?.nombreCompleto} ({(p?.especialidades ?? []).join(', ')})</option>
                                ))}
                              </select>
                            </div>
                            {asignarForm?.psicologo_id ? (
                              <AvailabilityPicker
                                resetKey={asignarForm?.psicologo_id}
                                disponibilidad={(psicologosActivos ?? []).find((p: any) => p?.id === asignarForm?.psicologo_id)?.disponibilidadSemanal}
                                onChange={(value: string) => setAsignarForm((prev: any) => ({ ...(prev ?? {}), fecha_hora_cita: value }))}
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground">Selecciona un psicólogo para ver sus días disponibles.</p>
                            )}
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => setAsignando(null)}>Cancelar</Button>
                            <Button size="sm" onClick={() => handleAsignar(cita?.id ?? '')} className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white">
                              Confirmar Asignación
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Psicologos Tab */}
        <TabsContent value="psicologos">
          {/* Pending */}
          {(psicologosPendientes?.length ?? 0) > 0 && (
            <Card className="border-0 shadow-md mb-6">
              <CardHeader>
                <CardTitle className="font-display text-xl text-[#1E3A5F] flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Postulaciones Pendientes ({psicologosPendientes?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(psicologosPendientes ?? []).map((p: any, i: number) => (
                    <div key={p?.id ?? i} className="p-4 rounded-xl bg-yellow-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-[#1E3A5F]">{p?.nombreCompleto ?? 'Sin nombre'}</h4>
                        <p className="text-sm text-muted-foreground">{p?.correo} · {(p?.especialidades ?? []).join(', ')} · {p?.anosExperiencia ?? 0} años exp.</p>
                        <p className="text-sm text-muted-foreground mt-1">Colegiado: {p?.numeroColegiado ?? 'N/A'} · País: {p?.paisResidencia ?? 'N/A'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEstadoPsicologo(p?.id ?? '', 'activo')} className="bg-[#2ECC9A] hover:bg-[#27b589] text-white h-9">
                          <CheckCircle className="h-4 w-4 mr-1" /> Aprobar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEstadoPsicologo(p?.id ?? '', 'inactivo')} className="h-9 text-red-600">
                          <XCircle className="h-4 w-4 mr-1" /> Suspender
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All */}
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="font-display text-xl text-[#1E3A5F]">Todos los Psicólogos</CardTitle>
              <Button onClick={openCrearPsic} className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white h-10 self-start sm:self-auto">
                <Plus className="h-4 w-4 mr-2" /> Agregar Psicólogo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-muted">
                      <th className="text-left p-3 font-medium text-muted-foreground">Nombre</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Correo</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Especialidades</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Estado</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(psicologos ?? []).map((p: any, i: number) => (
                      <tr key={p?.id ?? i} className="border-b border-muted/50 hover:bg-[#f8f9fa]">
                        <td className="p-3 font-medium text-[#1E3A5F]">{p?.nombreCompleto ?? ''}</td>
                        <td className="p-3 text-muted-foreground hidden md:table-cell">{p?.correo ?? ''}</td>
                        <td className="p-3 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {(p?.especialidades ?? []).slice(0, 3).map((e: string) => (
                              <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={`text-xs ${perfilColors[p?.estadoPerfil ?? ''] ?? ''}`}>
                            {p?.estadoPerfil === 'activo' ? 'Activo' : p?.estadoPerfil === 'pendiente' ? 'Pendiente' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {p?.estadoPerfil === 'pendiente' && (
                              <Button size="sm" variant="outline" onClick={() => handleEstadoPsicologo(p?.id ?? '', 'activo')} className="h-8 text-xs">
                                Aprobar
                              </Button>
                            )}
                            {p?.estadoPerfil === 'activo' && (
                              <Button size="sm" variant="outline" onClick={() => handleEstadoPsicologo(p?.id ?? '', 'inactivo')} className="h-8 text-xs text-red-600">
                                Suspender
                              </Button>
                            )}
                            {p?.estadoPerfil === 'inactivo' && (
                              <Button size="sm" variant="outline" onClick={() => handleEstadoPsicologo(p?.id ?? '', 'activo')} className="h-8 text-xs text-green-600">
                                Reactivar
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => openEditarPsic(p)} className="h-8 px-2 text-xs text-[#1E3A5F]" title="Editar">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setPsicToDelete(p)} className="h-8 px-2 text-xs text-red-600" title="Eliminar">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Administradores Tab */}
        <TabsContent value="administradores">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="font-display text-xl text-[#1E3A5F] flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#2ECC9A]" /> Administradores
              </CardTitle>
              <Button onClick={openCrearAdmin} className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white h-10 self-start sm:self-auto">
                <UserPlus className="h-4 w-4 mr-2" /> Agregar Administrador
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-muted">
                      <th className="text-left p-3 font-medium text-muted-foreground">Nombre</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Correo</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">WhatsApp</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Registro</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(admins ?? []).length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No hay administradores</td></tr>
                    ) : (
                      (admins ?? []).map((a: any, i: number) => (
                        <tr key={a?.id ?? i} className="border-b border-muted/50 hover:bg-[#f8f9fa]">
                          <td className="p-3 font-medium text-[#1E3A5F]">
                            {a?.nombreCompleto ?? ''}
                            {a?.esActual && <Badge variant="secondary" className="ml-2 text-xs">Tú</Badge>}
                            {a?.esProtegido && <Badge variant="secondary" className="ml-2 text-xs">Principal</Badge>}
                          </td>
                          <td className="p-3 text-muted-foreground">{a?.correo ?? ''}</td>
                          <td className="p-3 text-muted-foreground hidden md:table-cell">{a?.whatsapp || '—'}</td>
                          <td className="p-3 text-muted-foreground hidden lg:table-cell">
                            {a?.fechaRegistro ? new Date(a.fechaRegistro).toLocaleDateString('es-VE', { timeZone: 'America/Caracas' }) : ''}
                          </td>
                          <td className="p-3">
                            {a?.esProtegido ? (
                              <span className="text-xs text-muted-foreground">Cuenta protegida</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" onClick={() => openEditarAdmin(a)} className="h-8 px-2 text-xs text-[#1E3A5F]" title="Editar">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                {!a?.esActual && (
                                  <Button size="sm" variant="ghost" onClick={() => setAdminToDelete(a)} className="h-8 px-2 text-xs text-red-600" title="Eliminar">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Psicologo Create/Edit Modal */}
      <Dialog open={psicModalOpen} onOpenChange={setPsicModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-[#1E3A5F]">
              {psicModalMode === 'crear' ? 'Agregar Psicólogo' : 'Editar Psicólogo'}
            </DialogTitle>
            <DialogDescription>
              {psicModalMode === 'crear'
                ? 'El psicólogo se creará con perfil activo y podrá iniciar sesión de inmediato.'
                : 'Modifica los datos del psicólogo. Deja la contraseña vacía para mantener la actual.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Nombre completo *</Label>
              <Input value={psicForm?.nombreCompleto ?? ''} onChange={(e: any) => setPsicForm((f: any) => ({ ...f, nombreCompleto: e?.target?.value }))} className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-sm">Correo electrónico *</Label>
              <Input type="email" value={psicForm?.correo ?? ''} onChange={(e: any) => setPsicForm((f: any) => ({ ...f, correo: e?.target?.value }))} className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-sm">Contraseña {psicModalMode === 'crear' ? '*' : '(dejar vacía para no cambiar)'}</Label>
              <Input type="password" value={psicForm?.password ?? ''} onChange={(e: any) => setPsicForm((f: any) => ({ ...f, password: e?.target?.value }))} placeholder={psicModalMode === 'crear' ? 'Mínimo 6 caracteres' : '••••••'} className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-sm">WhatsApp</Label>
              <Input value={psicForm?.whatsapp ?? ''} onChange={(e: any) => setPsicForm((f: any) => ({ ...f, whatsapp: e?.target?.value }))} placeholder="+58..." className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-sm">Especialidades (separadas por coma)</Label>
              <Input value={psicForm?.especialidades ?? ''} onChange={(e: any) => setPsicForm((f: any) => ({ ...f, especialidades: e?.target?.value }))} placeholder="Ansiedad, Depresión, Terapia de pareja" className="mt-1 h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Años de experiencia</Label>
                <Input type="number" min="0" value={psicForm?.anosExperiencia ?? '0'} onChange={(e: any) => setPsicForm((f: any) => ({ ...f, anosExperiencia: e?.target?.value }))} className="mt-1 h-11" />
              </div>
              <div>
                <Label className="text-sm">N° Colegiado</Label>
                <Input value={psicForm?.numeroColegiado ?? ''} onChange={(e: any) => setPsicForm((f: any) => ({ ...f, numeroColegiado: e?.target?.value }))} className="mt-1 h-11" />
              </div>
            </div>
            <div>
              <Label className="text-sm">Biografía</Label>
              <Textarea value={psicForm?.bio ?? ''} onChange={(e: any) => setPsicForm((f: any) => ({ ...f, bio: e?.target?.value }))} rows={3} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPsicModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSavePsic} disabled={psicSaving} className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white">
              {psicSaving ? 'Guardando...' : psicModalMode === 'crear' ? 'Crear Psicólogo' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Create Modal */}
      <Dialog open={adminModalOpen} onOpenChange={setAdminModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-[#1E3A5F]">{adminModalMode === 'crear' ? 'Agregar Administrador' : 'Editar Administrador'}</DialogTitle>
            <DialogDescription>{adminModalMode === 'crear' ? 'El nuevo administrador tendrá acceso completo al panel de administración.' : 'Modifica los datos del administrador. Deja la contraseña vacía para mantener la actual.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Nombre completo *</Label>
              <Input value={adminForm?.nombreCompleto ?? ''} onChange={(e: any) => setAdminForm((f: any) => ({ ...f, nombreCompleto: e?.target?.value }))} className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-sm">Correo electrónico *</Label>
              <Input type="email" value={adminForm?.correo ?? ''} onChange={(e: any) => setAdminForm((f: any) => ({ ...f, correo: e?.target?.value }))} className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-sm">{adminModalMode === 'crear' ? 'Contraseña *' : 'Contraseña (dejar vacía para no cambiar)'}</Label>
              <Input type="password" value={adminForm?.password ?? ''} onChange={(e: any) => setAdminForm((f: any) => ({ ...f, password: e?.target?.value }))} placeholder="Mínimo 6 caracteres" className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-sm">WhatsApp (opcional)</Label>
              <Input value={adminForm?.whatsapp ?? ''} onChange={(e: any) => setAdminForm((f: any) => ({ ...f, whatsapp: e?.target?.value }))} placeholder="+58..." className="mt-1 h-11" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveAdmin} disabled={adminSaving} className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white">
              {adminSaving ? (adminModalMode === 'crear' ? 'Creando...' : 'Guardando...') : (adminModalMode === 'crear' ? 'Crear Administrador' : 'Guardar Cambios')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Psicologo Confirmation */}
      <AlertDialog open={!!psicToDelete} onOpenChange={(open: boolean) => { if (!open) setPsicToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar psicólogo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a <strong>{psicToDelete?.nombreCompleto}</strong>. Si el psicólogo tiene citas asociadas, no podrá eliminarse (deberás marcarlo como inactivo). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e: any) => { e?.preventDefault?.(); handleDeletePsic(); }} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Admin Confirmation */}
      <AlertDialog open={!!adminToDelete} onOpenChange={(open: boolean) => { if (!open) setAdminToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar administrador?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a <strong>{adminToDelete?.nombreCompleto}</strong>. Si tiene citas asociadas, no podrá eliminarse. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={adminDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e: any) => { e?.preventDefault?.(); handleDeleteAdmin(); }} disabled={adminDeleting} className="bg-red-600 hover:bg-red-700 text-white">
              {adminDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
