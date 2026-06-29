import { Navbar } from '@/components/shared/navbar';

export default function PsicologoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f8f9fa]">{children}</main>
    </>
  );
}
