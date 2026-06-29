'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Heart, Shield, Clock, Users, Brain, Frown, HeartHandshake,
  Baby, Compass, UserCheck, Zap, ChevronDown, ArrowRight,
  MessageCircle, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState, useEffect, useRef } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);
  const { ref: inViewRef, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(interval); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(interval);
  }, [inView, target]);

  return <span ref={(el) => { (counterRef as any).current = el; inViewRef(el); }}>{count}{suffix}</span>;
}

const ESPECIALIDADES = [
  { name: 'Ansiedad', icon: Zap, color: 'bg-blue-50 text-blue-600' },
  { name: 'Depresión', icon: Frown, color: 'bg-purple-50 text-purple-600' },
  { name: 'Duelo', icon: Heart, color: 'bg-pink-50 text-pink-600' },
  { name: 'Pareja', icon: HeartHandshake, color: 'bg-rose-50 text-rose-600' },
  { name: 'Adolescentes', icon: Users, color: 'bg-orange-50 text-orange-600' },
  { name: 'Trauma', icon: Shield, color: 'bg-red-50 text-red-600' },
  { name: 'Crianza', icon: Baby, color: 'bg-green-50 text-green-600' },
  { name: 'Orientación', icon: Compass, color: 'bg-teal-50 text-teal-600' },
];

const FAQS = [
  { q: '¿PsicoAmparo es realmente gratuito?', a: 'Sí, 100% gratuito. Todos los psicólogos son voluntarios que donan su tiempo para atender a venezolanos que lo necesitan.' },
  { q: '¿Cómo funciona la teleconsulta?', a: 'Después de solicitar tu cita, nuestro equipo te asigna un profesional. La sesión se realiza por llamada de WhatsApp en el horario acordado.' },
  { q: '¿Necesito estar en Venezuela para usar el servicio?', a: 'El servicio está diseñado para venezolanos, tanto dentro como fuera del país. Solo necesitas una conexión a internet.' },
  { q: '¿Cuánto tarda la respuesta después de solicitar una cita?', a: 'Nuestro compromiso es responder en menos de 24 horas. En casos de alta urgencia, priorizamos la atención.' },
  { q: '¿Mis datos son confidenciales?', a: 'Absolutamente. Toda la información es tratada con estricta confidencialidad bajo estándares éticos profesionales.' },
  { q: '¿Cómo puedo unirme como psicólogo voluntario?', a: 'Haz clic en "Postularme como Psicólogo Voluntario". Completa el formulario y nuestro equipo revisará tu postulación.' },
];

interface LandingStats {
  psicologosActivos: number;
  totalPacientes: number;
  sesionesCompletadas: number;
  estadosCubiertos: number;
}

export function LandingClient({ stats }: { stats?: LandingStats }) {
  const s = stats ?? { psicologosActivos: 0, totalPacientes: 0, sesionesCompletadas: 0, estadosCubiertos: 0 };
  const badgeText = s.psicologosActivos > 0
    ? `${s.psicologosActivos} ${s.psicologosActivos === 1 ? 'psicólogo activo' : 'psicólogos activos'} · Respuesta en menos de 24h · 100% gratuito`
    : 'Respuesta en menos de 24h · 100% gratuito · Atención por profesionales voluntarios';
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#1E3A5F] to-[#15304f] text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#2ECC9A] rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#2ECC9A] rounded-full blur-[150px]" />
        </div>
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm mb-6">
              <Star className="h-4 w-4 text-[#2ECC9A]" />
              <span>{badgeText}</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Teleconsulta psicológica <span className="underline decoration-[#2ECC9A] decoration-4 underline-offset-4">gratuita</span> en Venezuela
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl">
              Conecta con profesionales, gestiona tu atención y accede a una experiencia simple y segura. Gratis para todos los venezolanos.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/agendar-cita">
                <Button size="lg" className="bg-[#2ECC9A] hover:bg-[#27b589] text-white text-base px-8 h-14 w-full sm:w-auto">
                  Solicitar Cita de Apoyo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/unirme-como-psicologo">
                <Button size="lg" className="bg-white/20 backdrop-blur border border-white/30 text-white hover:bg-white/30 text-base px-8 h-14 w-full sm:w-auto">
                  Postularme como Psicólogo Voluntario
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-[#1E3A5F] tracking-tight">
              ¿Cómo funciona?
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-muted-foreground text-lg">Tres pasos simples para recibir apoyo profesional</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MessageCircle, step: '1', title: 'Solicita tu cita', desc: 'Completa un breve formulario con tu motivo de consulta y datos de contacto.' },
              { icon: UserCheck, step: '2', title: 'Te asignamos un profesional', desc: 'Nuestro equipo revisa tu caso y te conecta con el psicólogo más adecuado.' },
              { icon: Heart, step: '3', title: 'Recibe tu atención', desc: 'Realiza tu sesión gratuita por llamada de WhatsApp desde donde estés.' },
            ].map((item: any, i: number) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="text-center p-8 hover:shadow-lg transition-shadow h-full border-0 bg-[#f8f9fa]">
                  <CardContent className="pt-2">
                    <div className="mx-auto w-16 h-16 rounded-full bg-[#2ECC9A]/10 flex items-center justify-center mb-5">
                      <item.icon className="h-8 w-8 text-[#2ECC9A]" />
                    </div>
                    <div className="text-sm font-mono text-[#2ECC9A] font-bold mb-2">Paso {item.step}</div>
                    <h3 className="font-display text-xl font-semibold text-[#1E3A5F] mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Especialidades */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-[#1E3A5F] tracking-tight">Especialidades</motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-muted-foreground text-lg">Nuestros profesionales cubren una amplia gama de necesidades</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ESPECIALIDADES.map((esp: any, i: number) => (
              <motion.div key={i} variants={fadeUp}>
                <Link href={`/psicologos?especialidad=${esp.name}`}>
                  <Card className="text-center p-6 hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer border-0 bg-white">
                    <CardContent className="pt-2">
                      <div className={`mx-auto w-12 h-12 rounded-xl ${esp.color} flex items-center justify-center mb-3`}>
                        <esp.icon className="h-6 w-6" />
                      </div>
                      <p className="font-medium text-[#1E3A5F]">{esp.name}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#1E3A5F] text-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Psicólogos Activos', value: s.psicologosActivos },
              { label: 'Pacientes Registrados', value: s.totalPacientes },
              { label: 'Sesiones Completadas', value: s.sesionesCompletadas },
              { label: 'Estados Cubiertos', value: s.estadosCubiertos },
            ].map((stat: any, i: number) => (
              <div key={i}>
                <div className="font-display text-3xl md:text-4xl font-bold text-[#2ECC9A]">
                  <AnimatedCounter target={stat.value} />
                </div>
                <div className="mt-2 text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-[800px] mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-[#1E3A5F] tracking-tight">Preguntas Frecuentes</motion.h2>
          </motion.div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq: any, i: number) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-lg px-4 bg-[#f8f9fa]">
                <AccordionTrigger className="text-left font-medium text-[#1E3A5F] hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#2ECC9A] to-[#27b589]">
        <div className="max-w-[800px] mx-auto px-4 text-center text-white">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">¿Necesitas apoyo? Estás en el lugar correcto</h2>
          <p className="mt-4 text-lg text-white/90">No tienes que enfrentar esto solo. Nuestros profesionales están aquí para ti.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/agendar-cita">
              <Button size="lg" className="bg-[#1E3A5F] hover:bg-[#162d4a] text-white text-base px-8 h-14">
                Solicitar Cita de Apoyo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
