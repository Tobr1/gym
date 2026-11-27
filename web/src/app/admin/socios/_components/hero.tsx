import Link from "next/link";
import {
  Banknote,
  CalendarCheck2,
  ChevronRight,
  Flame,
  Lock,
  LogIn,
  MessageCircle,
  Pencil,
  Snowflake,
  Timer,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { AvatarStack, Button, buttonClass, Pill } from "@/components/ui/primitives";
import { STATUS_META } from "@/lib/mock";
import { face, PHOTO } from "@/lib/photos";
import { cn, fmt, money } from "@/lib/utils";
import type { Profile } from "../_lib/profile";

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

const RING_BY_TONE = {
  lime: "from-lime via-lime/40 to-cyan/40",
  amber: "from-amber via-amber/40 to-rose/30",
  rose: "from-rose via-rose/40 to-amber/30",
  cyan: "from-cyan via-cyan/40 to-violet/40",
} as const;

export function ProfileHero({ p }: { p: Profile }) {
  const m = p.member;
  const st = STATUS_META[m.status];
  const heroPhoto = p.female ? PHOTO.backWoman(1800, 700) : PHOTO.backMan(1800, 700);

  return (
    <section className="panel noise stagger relative overflow-hidden" style={s(0)}>
      {/* Fondo cinematográfico */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroPhoto}
        alt=""
        className="photo-grade absolute inset-0 h-full w-full object-cover object-[70%_30%] opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
      <div className="grid-lines absolute inset-0 opacity-60 [mask-image:linear-gradient(100deg,black_10%,transparent_55%)]" />
      <div className="absolute -left-24 -top-24 size-[340px] rounded-full bg-lime/[0.10] blur-[90px]" />

      <div className="relative px-5 pb-5 pt-6 sm:px-7 sm:pt-8 lg:px-8">
        <nav className="mb-6 flex items-center gap-1.5 text-[12px] font-semibold text-muted">
          <Link href="/admin/socios" className="transition hover:text-fg">
            Socios
          </Link>
          <ChevronRight className="size-3.5 text-faint" />
          <span className="text-fg-2">Ficha integral</span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            {/* Retrato */}
            <div className="relative w-fit shrink-0">
              <div className={cn("rounded-[30px] bg-gradient-to-br p-[2px] shadow-[0_20px_60px_-20px_rgb(181_245_74/0.45)]", RING_BY_TONE[st.tone])}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={face(m.face, 320)}
                  alt={m.name}
                  className="size-[112px] rounded-[28px] bg-surface-3 object-cover sm:size-[150px] lg:size-[168px]"
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-line-strong bg-ink/90 px-2.5 py-1 text-[10.5px] font-extrabold tracking-[0.08em] text-fg-2 backdrop-blur tabular">
                #{m.id}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={st.tone} dot>
                  {st.label}
                </Pill>
                <Pill tone="violet">{m.plan}</Pill>
                <Pill>{m.branch}</Pill>
              </div>
              <h1 className="mt-3 text-[32px] font-extrabold leading-[0.95] tracking-[-0.045em] text-fg sm:text-[46px]">
                {m.name}
              </h1>
              <p className="mt-2.5 flex flex-wrap items-baseline text-[13px] font-medium leading-relaxed text-fg-2">
                <span className="whitespace-nowrap">
                  {p.female ? "Socia" : "Socio"} desde <span className="font-bold text-fg">{m.since}</span>
                </span>
                <span className="mx-2 text-faint">·</span>
                <span className="whitespace-nowrap">{p.age} años</span>
                <span className="mx-2 text-faint">·</span>
                <span className="whitespace-nowrap">
                  Último ingreso <span className="font-bold text-fg tabular">{m.lastCheckIn}</span>
                </span>
              </p>
            {/* Acciones rápidas */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <Button size="lg" className="col-span-2 sm:col-span-1 xl:px-4">
                <Banknote className="size-[18px]" /> Cobrar cuota
              </Button>
              <Link href="/admin/acceso" className={buttonClass("secondary", "lg", "xl:px-4")}>
                <LogIn className="size-[18px]" /> Registrar ingreso
              </Link>
              <Button size="lg" className="xl:px-4 border border-emerald/30 bg-emerald/12 text-emerald shadow-none hover:bg-emerald/20 hover:shadow-none">
                <MessageCircle className="size-[18px]" /> WhatsApp
              </Button>
              <Button variant="secondary" size="lg" className="hidden sm:inline-flex sm:w-12 sm:px-0" aria-label="Editar">
                <Pencil className="size-[18px]" />
              </Button>
            </div>
            </div>
          </div>

          <HeroAside p={p} />
        </div>

        {/* Franja de indicadores */}
        <div className="mt-7 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-ink/55 backdrop-blur-md md:grid-cols-4">
          <HeroStat label="Asistencia mes" className="border-b border-r border-white/[0.06] md:border-b-0">
            <span className="text-fg">{m.attendance}</span>
            <span className="text-[15px] text-muted">%</span>
            <span className="ml-2 inline-block h-1.5 w-14 overflow-hidden rounded-full bg-white/10 align-middle">
              <span className="block h-full rounded-full bg-lime" style={{ width: `${m.attendance}%` }} />
            </span>
          </HeroStat>
          <HeroStat label="Racha actual" icon={<Flame className="size-3.5 text-amber" />} className="border-b border-white/[0.06] md:border-b-0 md:border-r">
            <span className="text-fg">{p.stats.streak}</span>
            <span className="ml-1 whitespace-nowrap text-[13px] text-muted">sem.<span className="hidden xl:inline"> · mejor {p.stats.bestStreak}</span></span>
          </HeroStat>
          <HeroStat label="Visitas totales" icon={<TrendingUp className="size-3.5 text-lime" />} className="border-r border-white/[0.06]">
            <span className="text-fg">{fmt(p.stats.visits)}</span>
          </HeroStat>
          <HeroStat label="Permanencia" icon={<Timer className="size-3.5 text-cyan" />}>
            <span className="text-fg">{p.stats.avgMinutes}</span>
            <span className="ml-1 text-[13px] text-muted">min</span>
          </HeroStat>
        </div>
      </div>
    </section>
  );
}

/** Tarjeta lateral del hero: próxima reserva, o el bloqueo si la cuota está vencida / congelada. */
function HeroAside({ p }: { p: Profile }) {
  const m = p.member;
  const box = "hidden w-[264px] shrink-0 rounded-2xl border p-4 backdrop-blur-xl xl:block";
  if (m.status === "vencido") {
    return (
      <div className={cn(box, "border-rose/30 bg-rose/[0.08] shadow-[0_20px_60px_-24px_rgb(255_95_126/0.55)]")}>
        <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-rose">
          <TriangleAlert className="size-3.5" /> Cuota vencida
        </p>
        <p className="mt-2 text-[28px] font-extrabold leading-none tracking-[-0.03em] text-fg tabular">{money(p.debt)}</p>
        <p className="mt-1.5 text-[12.5px] text-fg-2">
          Venció el <span className="font-bold text-fg">{p.dueLabel}</span> · 1 cuota impaga
        </p>
        <p className="mt-3 flex items-center gap-1.5 border-t border-white/[0.08] pt-3 text-[11.5px] font-semibold text-muted">
          <Lock className="size-3.5 text-rose" /> Acceso y reservas bloqueados
        </p>
      </div>
    );
  }
  if (m.status === "congelado") {
    return (
      <div className={cn(box, "border-cyan/25 bg-cyan/[0.07]")}>
        <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-cyan">
          <Snowflake className="size-3.5" /> Membresía en pausa
        </p>
        <p className="mt-2 text-[17px] font-extrabold tracking-tight text-fg">Se reactiva el 15 dic</p>
        <p className="text-[12.5px] text-fg-2">Licencia por viaje · sin cargo</p>
      </div>
    );
  }
  const b = p.bookings[0];
  return (
    <div className={cn(box, "border-white/10 bg-ink/50")}>
      <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">
        <CalendarCheck2 className="size-3.5 text-lime" /> Próxima reserva
      </p>
      <p className="mt-2 truncate text-[17px] font-extrabold tracking-tight text-fg">{b.name}</p>
      <p className="truncate text-[12.5px] text-fg-2">
        Hoy <span className="font-bold text-fg tabular">{b.time}</span> · {b.room} · Coach {b.coach.name.split(" ")[0]}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <AvatarStack ids={[2, 5, 8, 11]} size={24} extra={Number(b.spots.split("/")[0]) - 4} />
        <span className="text-[11.5px] font-bold text-lime tabular">{b.spots} lugares</span>
      </div>
    </div>
  );
}

function HeroStat({
  label,
  icon,
  className,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("px-4 py-3.5 sm:px-5", className)}>
      <p className="flex items-center gap-1.5 whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted sm:text-[11px] sm:tracking-[0.1em]">
        {icon}
        {label}
      </p>
      <p className="mt-1.5 text-[22px] font-extrabold leading-none tracking-[-0.03em] tabular sm:text-[26px]">{children}</p>
    </div>
  );
}
