import { Suspense } from 'react';
import { ResetPasswordClient } from './_components/reset-password-client';

export const metadata = {
  title: 'Restablecer Contraseña | PsicoAmparo',
};

export default function RestablecerContrasenaPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordClient />
    </Suspense>
  );
}
