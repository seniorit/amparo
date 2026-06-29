import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  // --- Cuenta de prueba del sistema (requerida, oculta) ---
  await prisma.psicologo.upsert({
    where: { correo: 'john@doe.com' },
    update: {},
    create: {
      nombreCompleto: 'Admin Test',
      correo: 'john@doe.com',
      contrasenaHash: hash('johndoe123'),
      whatsapp: '+58 412 0000000',
      especialidades: ['Ansiedad', 'Depresión'],
      anosExperiencia: 10,
      numeroColegiado: 'TEST-000',
      paisResidencia: 'Venezuela',
      bio: 'Cuenta de prueba del sistema.',
      estadoPerfil: 'activo',
      rol: 'admin',
    },
  });

  // --- Administrador principal de PsicoAmparo ---
  await prisma.psicologo.upsert({
    where: { correo: 'admin@psicoamparo.com' },
    update: {},
    create: {
      nombreCompleto: 'Administrador PsicoAmparo',
      correo: 'admin@psicoamparo.com',
      contrasenaHash: hash('Admin123!'),
      whatsapp: '+58 412 1111111',
      especialidades: ['Orientación'],
      anosExperiencia: 15,
      numeroColegiado: 'ADM-001',
      paisResidencia: 'Venezuela',
      bio: 'Administrador principal de la plataforma PsicoAmparo.',
      estadoPerfil: 'activo',
      rol: 'admin',
    },
  });

  // NOTA: No se insertan psicólogos, pacientes ni citas de ejemplo.
  // La plataforma opera con datos reales para mantener estadísticas verídicas.

  console.log('✅ Seed completado: cuentas administrativas verificadas.');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
