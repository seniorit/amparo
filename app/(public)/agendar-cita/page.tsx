import { AgendarCitaClient } from './_components/agendar-cita-client';

export const metadata = {
  title: 'Agendar Cita | PsicoAmparo',
  description: 'Solicita una cita de teleconsulta psicológica gratuita en Venezuela.',
};

export default function AgendarCitaPage() {
  return <AgendarCitaClient />;
}
