'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

// getDay() index (0=domingo ... 6=sabado) -> clave usada en disponibilidad_semanal
const DAY_KEYS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

const FRANJA_DEFAULT_TIME: Record<string, string> = {
  'Mañana': '09:00',
  'Tarde': '15:00',
  'Noche': '19:00',
};

interface AvailabilityPickerProps {
  disponibilidad: Record<string, string[]> | null | undefined;
  // Devuelve un string "YYYY-MM-DDTHH:mm" o '' cuando no hay selección completa
  onChange: (value: string) => void;
  // Cuando cambia, reinicia la selección interna (ej: al cambiar de psicólogo)
  resetKey?: string;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function AvailabilityPicker({ disponibilidad, onChange, resetKey }: AvailabilityPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedFranja, setSelectedFranja] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Reinicia la selección cuando cambia el psicólogo seleccionado
  useEffect(() => {
    setSelectedDate(undefined);
    setSelectedFranja('');
    setSelectedTime('');
    onChange('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const disp = disponibilidad ?? {};

  // Días de la semana (claves) en los que el psicólogo tiene al menos una franja
  const availableDayKeys = useMemo(() => {
    return new Set(
      Object.keys(disp).filter((k) => Array.isArray(disp[k]) && (disp[k]?.length ?? 0) > 0)
    );
  }, [disponibilidad]);

  const hasAvailability = availableDayKeys.size > 0;

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Deshabilita fechas pasadas y días de la semana sin disponibilidad
  const isDisabled = (date: Date): boolean => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (d < today) return true;
    const key = DAY_KEYS[date.getDay()];
    return !availableDayKeys.has(key);
  };

  // Franjas disponibles para el día seleccionado
  const franjasDelDia: string[] = selectedDate
    ? (disp[DAY_KEYS[selectedDate.getDay()]] ?? [])
    : [];

  const emit = (date: Date | undefined, time: string) => {
    if (date && time) {
      onChange(`${toDateString(date)}T${time}`);
    } else {
      onChange('');
    }
  };

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedFranja('');
    setSelectedTime('');
    onChange('');
  };

  const handleSelectFranja = (franja: string) => {
    setSelectedFranja(franja);
    const defaultTime = FRANJA_DEFAULT_TIME[franja] ?? '09:00';
    setSelectedTime(defaultTime);
    emit(selectedDate, defaultTime);
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    emit(selectedDate, time);
  };

  if (!hasAvailability) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>Este psicólogo no ha definido su disponibilidad semanal. Solicítale que la configure en su perfil antes de asignar una fecha.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm">Selecciona el día (solo se habilitan los días que el psicólogo atiende)</Label>
        <div className="mt-1 rounded-lg border border-input bg-white inline-block">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDate}
            disabled={isDisabled}
            weekStartsOn={1}
            fromDate={today}
          />
        </div>
      </div>

      {selectedDate && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Franja horaria disponible</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {franjasDelDia.map((franja) => (
                <button
                  key={franja}
                  type="button"
                  onClick={() => handleSelectFranja(franja)}
                  className={`px-4 h-10 rounded-lg text-sm font-medium transition-colors border ${
                    selectedFranja === franja
                      ? 'bg-[#2ECC9A] text-white border-[#2ECC9A]'
                      : 'bg-muted border-input hover:bg-muted/80'
                  }`}
                >
                  {franja}
                </button>
              ))}
            </div>
          </div>
          {selectedFranja && (
            <div>
              <Label className="text-sm">Hora exacta</Label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e: any) => handleTimeChange(e?.target?.value ?? '')}
                className="mt-1 h-10"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
