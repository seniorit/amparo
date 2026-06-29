'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Star, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ESPECIALIDADES } from '@/lib/constants';

interface Psicologo {
  id: string;
  nombreCompleto: string;
  especialidades: string[];
  anosExperiencia: number;
  bio: string | null;
  resolvedFotoUrl: string | null;
  paisResidencia: string;
  disponibilidadSemanal: any;
}

export function DirectorioClient() {
  const searchParams = useSearchParams();
  const initialEsp = searchParams?.get('especialidad') ?? '';

  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEsp, setFiltroEsp] = useState(initialEsp);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filtroEsp) params.set('especialidad', filtroEsp);
    if (search) params.set('search', search);
    params.set('activos', 'true');

    fetch(`/api/psicologos?${params.toString()}`)
      .then((r: any) => r?.json?.())
      .then((data: any) => setPsicologos(data ?? []))
      .catch(() => setPsicologos([]))
      .finally(() => setLoading(false));
  }, [filtroEsp, search]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1E3A5F] tracking-tight">Directorio de Psicólogos</h1>
        <p className="text-muted-foreground mt-2 text-lg">Encuentra al profesional ideal para ti</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e: any) => setSearch(e?.target?.value ?? '')}
            placeholder="Buscar por nombre..."
            className="pl-10 h-12"
          />
        </div>
        <select
          value={filtroEsp}
          onChange={(e: any) => setFiltroEsp(e?.target?.value ?? '')}
          className="h-12 px-3 rounded-lg border border-input bg-background text-sm min-w-[200px]"
        >
          <option value="">Todas las especialidades</option>
          {ESPECIALIDADES.map((e: string) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i: number) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-muted mb-4" />
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (psicologos?.length ?? 0) === 0 ? (
        <div className="text-center py-16">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No se encontraron psicólogos con los filtros actuales</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(psicologos ?? []).map((p: Psicologo, i: number) => (
            <motion.div
              key={p?.id ?? i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full border-0 bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {p?.resolvedFotoUrl ? (
                        <img src={p.resolvedFotoUrl} alt={p?.nombreCompleto ?? ''} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <User className="h-8 w-8 text-[#1E3A5F]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-[#1E3A5F] text-lg truncate">{p?.nombreCompleto ?? 'Psicólogo'}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{p?.paisResidencia ?? 'Venezuela'}</span>
                        <span className="mx-1">·</span>
                        <Clock className="h-3.5 w-3.5" />
                        <span>{p?.anosExperiencia ?? 0} años</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-3">{p?.bio ?? 'Sin descripción disponible.'}</p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {(p?.especialidades ?? []).map((esp: string) => (
                      <Badge key={esp} variant="secondary" className="text-xs bg-[#2ECC9A]/10 text-[#1E3A5F]">{esp}</Badge>
                    ))}
                  </div>
                  <div className="mt-5">
                    <Link href={`/agendar-cita?psicologo_id=${p?.id ?? ''}`}>
                      <Button className="w-full bg-[#2ECC9A] hover:bg-[#27b589] text-white h-11">
                        Agendar con este especialista <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
