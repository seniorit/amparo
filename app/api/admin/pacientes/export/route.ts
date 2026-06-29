export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

const URGENCIA_LABEL: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};

const HORARIO_LABEL: Record<string, string> = {
  Manana: 'Mañana',
  Tarde: 'Tarde',
  Noche: 'Noche',
};

const ESTADO_CITA_LABEL: Record<string, string> = {
  pendiente_asignar: 'Pendiente por asignar',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

function fmtFecha(d: Date | null | undefined): string {
  if (!d) return '';
  try {
    return new Date(d).toLocaleString('es-VE', { timeZone: 'America/Caracas' });
  } catch {
    return new Date(d).toISOString();
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const pacientes = await prisma.paciente.findMany({
      include: {
        citas: {
          include: { psicologo: { select: { nombreCompleto: true, correo: true } } },
          orderBy: { fechaSolicitud: 'desc' },
        },
      },
      orderBy: { fechaRegistro: 'desc' },
    });

    const rows = (pacientes ?? []).map((p: any) => {
      const ultimaCita = p?.citas?.[0];
      return {
        'Nombre Completo': p?.nombreCompleto ?? '',
        'Género': p?.genero === 'masculino' ? 'Masculino' : p?.genero === 'femenino' ? 'Femenino' : '',
        'Correo': p?.correo ?? '',
        'WhatsApp': p?.whatsapp ?? '',
        'Estado (Venezuela)': p?.estadoVenezuela ?? '',
        'Motivo de Consulta': p?.motivoConsulta ?? '',
        '¿Primera Vez?': p?.primeraVez ? 'Sí' : 'No',
        'Preferencia de Horario': HORARIO_LABEL[p?.preferenciaHorario] ?? p?.preferenciaHorario ?? '',
        'Forma de Contacto Preferida': p?.formaContactoPreferida ?? '',
        'Nivel de Urgencia': URGENCIA_LABEL[p?.nivelUrgencia] ?? p?.nivelUrgencia ?? '',
        'Comentarios Adicionales': p?.comentariosAdicionales ?? '',
        'Total de Citas': p?.citas?.length ?? 0,
        'Estado Última Cita': ESTADO_CITA_LABEL[ultimaCita?.estado] ?? ultimaCita?.estado ?? '',
        'Psicólogo Asignado': ultimaCita?.psicologo?.nombreCompleto ?? '',
        'Fecha/Hora Cita': fmtFecha(ultimaCita?.fechaHoraCita),
        'Fecha de Registro': fmtFecha(p?.fechaRegistro),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ 'Sin datos': 'No hay pacientes registrados' }]);

    // Set column widths
    const colWidths = [
      24, 12, 26, 16, 20, 40, 12, 18, 22, 14, 40, 12, 22, 24, 22, 22,
    ].map((w) => ({ wch: w }));
    (worksheet as any)['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pacientes');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const fecha = new Date().toISOString().slice(0, 10);
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="pacientes-psicoamparo-${fecha}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Export pacientes error:', error?.message);
    return NextResponse.json({ error: 'Error al generar el archivo' }, { status: 500 });
  }
}
