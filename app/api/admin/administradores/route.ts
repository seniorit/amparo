export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { formatWhatsapp } from '@/lib/whatsapp';

// Cuentas protegidas: no se pueden modificar ni eliminar desde el panel.
const PROTECTED_EMAILS = ['john@doe.com', 'admin@psicoamparo.com'];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const currentId = (session?.user as any)?.id ?? '';
    const admins = await prisma.psicologo.findMany({
      where: { rol: 'admin' },
      orderBy: { fechaRegistro: 'desc' },
      select: { id: true, nombreCompleto: true, correo: true, whatsapp: true, fechaRegistro: true },
    });
    // Ocultar la cuenta interna de pruebas
    const visibles = (admins ?? [])
      .filter((a: any) => a?.correo !== 'john@doe.com')
      .map((a: any) => ({
        ...a,
        esProtegido: a?.correo === 'admin@psicoamparo.com',
        esActual: a?.id === currentId,
      }));
    return NextResponse.json(visibles);
  } catch (error: any) {
    console.error('Admin list error:', error?.message);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const nombre = (body?.nombreCompleto ?? '').trim();
    const correo = (body?.correo ?? '').trim().toLowerCase();
    const password = body?.password ?? '';
    const whatsapp = body?.whatsapp ?? '';

    if (!nombre || !correo || !password) {
      return NextResponse.json({ error: 'Nombre, correo y contraseña son obligatorios' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const existing = await prisma.psicologo.findUnique({ where: { correo } });
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con este correo' }, { status: 409 });
    }

    const contrasenaHash = await bcrypt.hash(password, 10);
    const admin = await prisma.psicologo.create({
      data: {
        nombreCompleto: nombre,
        correo,
        contrasenaHash,
        whatsapp: whatsapp ? formatWhatsapp(whatsapp) : '',
        especialidades: [],
        anosExperiencia: 0,
        numeroColegiado: '',
        paisResidencia: 'Venezuela',
        bio: '',
        estadoPerfil: 'activo',
        rol: 'admin',
      },
    });

    return NextResponse.json({ success: true, id: admin.id });
  } catch (error: any) {
    console.error('Create admin error:', error?.message);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const id = body?.id;
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const target = await prisma.psicologo.findUnique({ where: { id } });
    if (!target || target.rol !== 'admin') {
      return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 404 });
    }
    if (PROTECTED_EMAILS.includes(target.correo)) {
      return NextResponse.json({ error: 'Esta cuenta de administrador principal no se puede modificar desde aquí.' }, { status: 400 });
    }

    const data: any = {};
    if (typeof body?.nombreCompleto === 'string' && body.nombreCompleto.trim()) data.nombreCompleto = body.nombreCompleto.trim();
    if (typeof body?.whatsapp === 'string') data.whatsapp = body.whatsapp ? formatWhatsapp(body.whatsapp) : '';

    if (typeof body?.correo === 'string' && body.correo.trim()) {
      const nuevoCorreo = body.correo.trim().toLowerCase();
      if (nuevoCorreo !== target.correo) {
        const dup = await prisma.psicologo.findUnique({ where: { correo: nuevoCorreo } });
        if (dup) {
          return NextResponse.json({ error: 'Ya existe una cuenta con este correo' }, { status: 409 });
        }
        data.correo = nuevoCorreo;
      }
    }

    if (body?.password && String(body.password).length >= 6) {
      data.contrasenaHash = await bcrypt.hash(String(body.password), 10);
    } else if (body?.password && String(body.password).length > 0) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    await prisma.psicologo.update({ where: { id }, data });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update admin error:', error?.message);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const currentId = (session?.user as any)?.id ?? '';

    const body = await request.json();
    const id = body?.id;
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const target = await prisma.psicologo.findUnique({ where: { id } });
    if (!target || target.rol !== 'admin') {
      return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 404 });
    }
    if (PROTECTED_EMAILS.includes(target.correo)) {
      return NextResponse.json({ error: 'Esta cuenta de administrador principal no se puede eliminar.' }, { status: 400 });
    }
    if (id === currentId) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta de administrador.' }, { status: 400 });
    }

    const citasCount = await prisma.cita.count({ where: { psicologoId: id } });
    if (citasCount > 0) {
      return NextResponse.json({
        error: `No se puede eliminar: este administrador tiene ${citasCount} cita(s) asociada(s).`,
      }, { status: 409 });
    }

    await prisma.psicologo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete admin error:', error?.message);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
