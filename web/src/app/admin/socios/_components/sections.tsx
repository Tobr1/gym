import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Cake,
  CalendarClock,
  Check,
  CreditCard,
  Download,
  Droplet,
  Dumbbell,
  Flame,
  HeartPulse,
  IdCard,
  LogIn,
  Mail,
  MapPin,
  Phone,
  Plus,
  Receipt,
  Repeat2,
  Scale,
  ShieldCheck,
  Siren,
  Smartphone,
  Snowflake,
  StickyNote,
  Target,
  TriangleAlert,
  Trophy,
} from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { Pill, Ring, SectionTitle, Sparkline } from "@/components/ui/primitives";
import { face, PHOTO } from "@/lib/photos";
import { cn, money } from "@/lib/utils";
import type { Payment, Profile, TimelineEvent } from "../_lib/profile";

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;
const dec = (n: number, d = 1) => n.toLocaleString("es-AR", { minimumFractionDigits: d, maximumFractionDigits: d });

/* ── Membresía ─────────────────────────────────────────────── */
export function MembershipCard({ p, i }: { p: Profile; i: number }) {
  const m = p.member;
  const expired = m.status === "vencido";
  const frozen = m.status === "congelado";
  const soon = m.status === "por-vencer";
  const pct = frozen || expired ? 100 : Math.max(0, Math.min(100, (p.daysLeft / p.periodDays) * 100));
  const color = expired ? "var(--color-rose)" : soon ? "var(--color-amber)" : frozen ? "var(--color-cyan)" : "var(--color-lime)";
  const hist = [...p.payments].reverse();
  const months = hist.map((x) => x.concept.split(" ")[1].slice(0, 3));
  const onTime = hist.filter((x) => x.status === "pagado").length;

  return (
    <article
      className={cn("panel stagger flex flex-col p-5 sm:p-6", expired ? "border-rose/40" : frozen ? "" : "glow-lime")}
      style={s(i)}
    >
      <SectionTitle title="Membresía" hint="Plan vigente y próximo cobro" action={<Pill tone={expired ? "rose" : soon ? "amber" : frozen ? "cyan" : "lime"} dot>{expired ? "Vencida" : soon ? "Por vencer" : frozen ? "Congelada" : "Al día"}</Pill>} />

      {/* Credencial */}
      <div className="group relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#1d2b12_0%,#121a24_48%,#0d131c_100%)] p-4 transition-transform duration-500 hover:-translate-y-0.5">
        <div className="absolute -right-10 -top-12 size-40 rounded-full bg-lime/25 blur-3xl transition-opacity group-hover:opacity-80" />
        <div className="dots absolute inset-0 opacity-40 [mask-image:linear-gradient(120deg,transparent_30%,black)]" />
        <svg className="absolute -bottom-3 right-0 h-20 w-48 text-lime/20" viewBox="0 0 200 80" fill="none" aria-hidden>
          <path d="M0 50h50l12-28 20 46 14-34 8 14h96" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="relative flex items-start justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <LogoMark className="size-7 shrink-0" />
            <div className="min-w-0 overflow-hidden whitespace-nowrap leading-tight">
              <p className="text-[11px] font-extrabold tracking-[0.14em] text-fg">IRON FACTORY</p>
              <p className="text-[10px] font-semibold tracking-[0.12em] text-muted">MEMBER · PULSO</p>
            </div>
          </div>
          <span className="shrink-0 whitespace-nowrap rounded-md bg-lime px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-lime-ink">
            {cardTag(m.plan)}
          </span>
        </div>
        <p className="relative mt-6 font-mono text-[17px] font-bold tracking-[0.22em] text-fg tabular">
          {m.id.slice(0, 2)} {m.id.slice(2)} · {p.dni.replaceAll(".", "").slice(-4)}
        </p>
        <div className="relative mt-2 flex items-end justify-between">
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-faint">Titular</p>
            <p className="text-[13px] font-bold uppercase tracking-wider text-fg-2">{m.name}</p>
          </div>
          <div className="text-right">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-faint">Vence</p>
            <p className="text-[13px] font-bold text-fg-2 tabular">{p.dueLabel}</p>
          </div>
        </div>
      </div>

      {/* Días restantes */}
      <div className="mt-5 flex items-center gap-4">
        <Ring value={pct} size={96} stroke={9} color={color} className="shrink-0 [&_svg]:overflow-visible">
          <div>
            {frozen ? (
              <Snowflake className="mx-auto size-7 text-cyan" />
            ) : (
              <p className={cn("text-[28px] font-extrabold leading-none tracking-tight tabular", expired ? "text-rose" : "text-fg")}>
                {Math.abs(p.daysLeft)}
              </p>
            )}
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted">
              {frozen ? "en pausa" : expired ? "días venc." : "días"}
            </p>
          </div>
        </Ring>
        <div className="min-w-0">
          <p className={cn("text-[15px] font-extrabold leading-snug tracking-tight", expired ? "text-rose" : soon ? "text-amber" : frozen ? "text-cyan" : "text-fg")}>
            {frozen
              ? "Membresía en pausa"
              : expired
                ? `Venció hace ${Math.abs(p.daysLeft)} días`
                : `Quedan ${p.daysLeft} de ${p.periodDays} días`}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-muted">
            {frozen
              ? "Se reactiva el 15 dic"
              : expired
                ? "Acceso bloqueado en molinetes"
                : p.payMethod.auto
                  ? `Renovación automática el ${p.dueLabel}`
                  : `Renovación manual el ${p.dueLabel}`}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        {[
          { icon: CalendarClock, l: expired ? "Venció" : "Vence", v: p.dueLabel, c: expired ? "text-rose" : soon ? "text-amber" : "text-fg" },
          { icon: Banknote, l: expired ? "Adeuda" : "Cuota", v: money(expired ? p.debt : m.amount || 42000), c: expired ? "text-rose" : "text-fg" },
          { icon: Repeat2, l: "Renueva", v: p.payMethod.auto ? "Auto" : "Manual", c: "text-fg" },
        ].map((x) => (
          <div key={x.l} className="rounded-xl border border-line bg-white/[0.02] px-2.5 py-2">
            <dt className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-faint">
              <x.icon className="size-3" /> {x.l}
            </dt>
            <dd className={cn("mt-0.5 whitespace-nowrap text-[13.5px] font-extrabold tabular", x.c)}>{x.v}</dd>
          </div>
        ))}
      </dl>

      {/* Historial de cuotas (mayo → noviembre) */}
      <div className="mt-4 lg:max-xl:hidden">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-muted">
            Cuotas {months[0]} – {months.at(-1)}
          </span>
          <span className={cn("tabular", onTime === hist.length ? "text-lime" : "text-fg-2")}>
            {onTime}/{hist.length} pagadas
          </span>
        </div>
        <div className="mt-1.5 flex gap-1">
          {hist.map((x) => (
            <span
              key={x.id}
              title={`${x.concept} · ${PAY_STATUS[x.status].label}`}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                x.status === "pagado" ? "bg-lime/70" : x.status === "vencido" ? "bg-rose shadow-[0_0_8px_rgb(255_95_126/0.7)]" : "bg-amber",
              )}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto pt-5">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.025] p-3">
          <span className="grid size-9 place-items-center rounded-lg bg-cyan/12 text-cyan">
            {p.payMethod.name === "Mercado Pago" ? <Smartphone className="size-[18px]" /> : <CreditCard className="size-[18px]" />}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[13px] font-bold text-fg">{p.payMethod.name}</p>
            <p className="text-[11.5px] text-muted">{p.payMethod.detail}</p>
          </div>
          <button className="text-[12px] font-bold text-lime hover:underline">Cambiar</button>
        </div>
      </div>
    </article>
  );
}

/* ── Asistencia (heatmap) ──────────────────────────────────── */
const LEVEL = [
  "bg-white/[0.045]",
  "bg-lime/20",
  "bg-lime/45",
  "bg-lime/75",
  "bg-lime shadow-[0_0_10px_-1px_rgb(181_245_74/0.8)]",
];

export function AttendanceHeatmap({ p, i }: { p: Profile; i: number }) {
  const days = ["Lun", "", "Mié", "", "Vie", "", "Dom"];
  const last = p.heat.weeks.length - 1;
  return (
    <article className="panel stagger flex flex-col p-5 sm:p-6" style={s(i)}>
      <SectionTitle
        title="Asistencia"
        hint={`${p.heat.total} ingresos · últimas 16 semanas`}
        action={
          <div className="hidden items-center gap-1.5 text-[11px] font-semibold text-muted sm:flex">
            Menos
            {LEVEL.map((c, k) => (
              <span key={k} className={cn("size-3 rounded-[3px]", c, "shadow-none")} />
            ))}
            Más
          </div>
        }
      />

      <div className="mt-5 flex gap-2.5">
        <div className="grid grid-rows-7 gap-[3px] pt-5 text-[10px] font-semibold text-faint sm:gap-1">
          {days.map((d, k) => (
            <span key={k} className="flex items-center leading-none">
              {d}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative mb-1.5 h-3.5 text-[10.5px] font-bold capitalize text-muted">
            {p.heat.months.map((mo) => (
              <span key={mo.label + mo.col} className="absolute top-0" style={{ left: `${(mo.col / 16) * 100}%` }}>
                {mo.label}
              </span>
            ))}
          </div>
          <div className="grid grid-flow-col grid-cols-[repeat(16,minmax(0,1fr))] grid-rows-7 gap-[3px] sm:gap-1">
            {p.heat.weeks.map((week, w) =>
              week.map((c, d) => {
                const today = w === last && !c.future && (week[d + 1]?.future ?? true);
                return (
                  <span
                    key={c.date}
                    title={c.label}
                    className={cn(
                      "aspect-square rounded-[4px] transition-transform duration-200 hover:scale-125",
                      c.future ? "border border-dashed border-white/[0.06]" : LEVEL[c.level],
                      today && "ring-2 ring-lime ring-offset-2 ring-offset-surface",
                    )}
                    style={{ animation: `pop .45s cubic-bezier(.34,1.56,.64,1) ${200 + w * 28}ms both` }}
                  />
                );
              }),
            )}
          </div>
        </div>
      </div>

      {/* Franja horaria */}
      <div className="mt-5 rounded-xl border border-line bg-white/[0.02] px-3.5 pb-2.5 pt-3">
        <div className="flex items-center justify-between text-[11.5px] font-semibold">
          <span className="text-fg-2">Franja horaria preferida</span>
          <span className="text-muted">06 – 23 h</span>
        </div>
        <div className="mt-2.5 flex h-10 items-end gap-1.5">
          {p.hourPref.map((v, k) => {
            const max = Math.max(...p.hourPref);
            return (
              <div key={k} className="flex h-full flex-1 flex-col justify-end">
                <span
                  className={cn("block rounded-[4px]", v === max ? "bg-lime shadow-[0_0_12px_-2px_rgb(181_245_74/0.8)]" : "bg-white/[0.12]")}
                  style={{ height: `${Math.max(10, (v / max) * 100)}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex gap-1.5 text-center text-[10px] font-bold text-faint tabular">
          {["06", "09", "12", "15", "18", "21"].map((h) => (
            <span key={h} className="flex-1">
              {h} h
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-5 md:grid-cols-4 lg:grid-cols-2">
        {[
          { l: "Este mes", v: String(p.stats.monthVisits), u: "visitas", icon: LogIn, c: "text-lime" },
          { l: "Racha actual", v: String(p.stats.streak), u: "semanas", icon: Flame, c: "text-amber" },
          { l: "Mejor racha", v: String(p.stats.bestStreak), u: "semanas", icon: Trophy, c: "text-violet" },
          { l: "Horario habitual", v: p.stats.usualHour.split(" – ")[0], u: `a ${p.stats.usualHour.split(" – ")[1]}`, icon: CalendarClock, c: "text-cyan" },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-line bg-white/[0.02] px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted">
              <k.icon className={cn("size-3.5", k.c)} /> {k.l}
            </p>
            <p className="mt-1 text-[19px] font-extrabold leading-none tracking-tight text-fg tabular">
              {k.v} <span className="text-[11.5px] font-semibold text-muted">{k.u}</span>
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

/* ── Evolución física ──────────────────────────────────────── */
export function BodyProgress({ p, i }: { p: Profile; i: number }) {
  const metrics = [
    { label: "Peso", icon: Scale, data: p.body.weight, unit: "kg", color: "var(--color-cyan)", good: "down" as const },
    { label: "Grasa corporal", icon: Droplet, data: p.body.fat, unit: "%", color: "var(--color-amber)", good: "down" as const },
    { label: "Masa muscular", icon: Dumbbell, data: p.body.muscle, unit: "kg", color: "var(--color-lime)", good: "up" as const },
  ];
  const goalPct = Math.min(92, Math.round(38 + p.member.attendance * 0.4));
  return (
    <article className="panel stagger p-5 sm:p-6" style={s(i)}>
      <SectionTitle
        title="Evolución física"
        hint={`Última evaluación ${p.body.lastEval} · próxima ${p.body.nextEval}`}
        action={
          <div className="flex rounded-lg border border-line bg-white/[0.02] p-0.5 text-[11.5px] font-bold">
            {["3M", "6M", "1A"].map((t, k) => (
              <span key={t} className={cn("rounded-md px-2.5 py-1", k === 1 ? "bg-surface-3 text-fg" : "text-muted")}>
                {t}
              </span>
            ))}
          </div>
        }
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {metrics.map((mt) => {
          const first = mt.data[0];
          const last = mt.data.at(-1)!;
          const diff = last - first;
          const good = mt.good === "down" ? diff < 0 : diff > 0;
          return (
            <div
              key={mt.label}
              className="group relative overflow-hidden rounded-2xl border border-line bg-white/[0.02] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong"
            >
              <div className="flex items-center justify-between">
                <p className="flex min-w-0 items-center gap-2 whitespace-nowrap text-[12.5px] font-semibold text-fg-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg sm:max-xl:hidden" style={{ background: `color-mix(in oklab, ${mt.color} 14%, transparent)`, color: mt.color }}>
                    <mt.icon className="size-3.5" />
                  </span>
                  <span className="hidden size-2 shrink-0 rounded-full sm:max-xl:block" style={{ background: mt.color, boxShadow: `0 0 8px ${mt.color}` }} />
                  {mt.label}
                </p>
                <span className={cn("shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-extrabold tabular", good ? "bg-lime/12 text-lime" : "bg-rose/12 text-rose")}>
                  {diff > 0 ? "+" : "−"}
                  {dec(Math.abs(diff))} {mt.unit}
                </span>
              </div>
              <div className="flex items-end gap-4 sm:block">
                <div className="shrink-0">
                  <p className="mt-3 text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">
                    {dec(last)}
                    <span className="ml-1 text-[14px] font-bold text-muted">{mt.unit}</span>
                  </p>
                  <p className="mt-1 text-[11.5px] text-muted">
                    desde {dec(first)} {mt.unit} en jun
                  </p>
                </div>
                <div className="min-w-0 flex-1 sm:-mx-1 sm:mt-3">
                  <Sparkline data={mt.data} color={mt.color} height={52} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-gradient-to-r from-violet/[0.08] to-transparent p-3.5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet/15 text-violet">
          <Target className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Objetivo</p>
          <p className="text-[13.5px] font-bold text-fg">{p.body.goal}</p>
        </div>
        </div>
        <div className="flex items-center gap-3 sm:w-56">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
            <div className="h-full rounded-full bg-gradient-to-r from-violet to-lime" style={{ width: `${goalPct}%` }} />
          </div>
          <span className="text-[13px] font-extrabold text-fg tabular">{goalPct}%</span>
        </div>
      </div>
    </article>
  );
}

/* ── Rutina asignada ───────────────────────────────────────── */
export function RoutineCard({ p, i }: { p: Profile; i: number }) {
  const r = p.routine;
  const photo = p.member.plan.includes("Pilates")
    ? PHOTO.yoga(900, 900)
    : p.member.plan.includes("Cross")
      ? PHOTO.ropes(900, 900)
      : p.female
        ? PHOTO.focusWoman(900, 900)
        : PHOTO.deadlift(900, 900);
  return (
    <article className="panel stagger grid overflow-hidden md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]" style={s(i)}>
      <div className="relative min-h-[220px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-surface" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <Pill tone="lime" className="bg-lime text-lime-ink ring-0">
            <Dumbbell className="size-3" /> Rutina asignada
          </Pill>
          <h3 className="mt-2.5 text-[22px] font-extrabold leading-tight tracking-[-0.03em] text-fg">{r.name}</h3>
          <p className="text-[12.5px] font-semibold text-fg-2">{r.phase}</p>
          <div className="mt-3 flex items-center gap-2">
            <Avatar i={r.coach.face} size={26} />
            <p className="text-[12px] text-fg-2">
              Coach <span className="font-bold text-fg">{r.coach.name}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-semibold text-muted">
              Semana <span className="font-extrabold text-fg">{r.week}</span> de {r.weeks}
            </p>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: r.weeks }, (_, k) => (
                <span
                  key={k}
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    k < r.week - 1 ? "bg-lime" : k === r.week - 1 ? "bg-lime/50" : "bg-white/[0.08]",
                  )}
                />
              ))}
            </div>
          </div>
          <MiniRing value={r.adherence} />
        </div>
        <p className="mt-1 text-right text-[10.5px] font-semibold uppercase tracking-wider text-faint">Adherencia</p>

        <ul className="mt-2 space-y-2">
          {r.days.map((d) => (
            <li
              key={d.key}
              className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-2.5 transition hover:border-line-strong hover:bg-white/[0.035]"
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-lg text-[13px] font-extrabold",
                  d.done ? "bg-lime text-lime-ink" : "bg-white/[0.06] text-fg-2",
                )}
              >
                {d.done ? <Check className="size-4" strokeWidth={3} /> : d.key}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-fg">
                  Día {d.key} · {d.name}
                </p>
                <p className="truncate text-[11.5px] text-muted">{d.focus}</p>
              </div>
              <span className="hidden text-right text-[11.5px] font-semibold text-muted sm:block">
                {d.exercises} ejercicios
                <br />
                {d.minutes} min
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {r.highlights.map((h) => (
            <div key={h.exercise} className="rounded-xl bg-white/[0.03] px-2.5 py-2">
              <p className="truncate text-[10.5px] font-bold uppercase tracking-wide text-faint">{h.exercise}</p>
              <p className="text-[15px] font-extrabold text-fg tabular">{h.value}</p>
              <p className="text-[11px] font-bold text-lime tabular">{h.delta}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

/* ── Pagos ─────────────────────────────────────────────────── */
const PAY_TEXT = { pagado: "text-lime", pendiente: "text-amber", vencido: "text-rose" } as const;
const PAY_STATUS: Record<Payment["status"], { label: string; tone: "lime" | "amber" | "rose" }> = {
  pagado: { label: "Pagado", tone: "lime" },
  pendiente: { label: "Pendiente", tone: "amber" },
  vencido: { label: "Vencido", tone: "rose" },
};

export function PaymentsTable({ p, i }: { p: Profile; i: number }) {
  const paid = p.payments.filter((x) => x.status === "pagado").reduce((a, b) => a + b.amount, 0);
  return (
    <article className="panel stagger overflow-hidden" style={s(i)}>
      <div className="flex flex-col gap-3 p-5 pb-4 sm:flex-row sm:items-end sm:justify-between sm:p-6 sm:pb-4">
        <SectionTitle title="Historial de pagos" hint="Cuotas y cargos de los últimos 7 meses" />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Abonado · 7 meses</p>
            <p className="text-[20px] font-extrabold leading-tight tracking-tight text-fg tabular">{money(paid)}</p>
          </div>
          <button className="grid size-9 place-items-center rounded-lg border border-line text-fg-2 transition hover:bg-white/5" aria-label="Descargar">
            <Download className="size-4" />
          </button>
        </div>
      </div>

      {/* Mobile: lista */}
      <ul className="divide-y divide-line/70 border-t border-line sm:hidden">
        {p.payments.map((x) => (
          <li key={x.id} className="flex items-center gap-3 px-5 py-3">
            <PayIcon status={x.status} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-fg">{x.concept.split(" · ")[0]}</p>
              <p className="text-[11.5px] text-muted tabular">
                {x.date} · {x.method}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold text-fg tabular">{money(x.amount)}</p>
              <p className={cn("text-[11px] font-bold", PAY_TEXT[x.status])}>{PAY_STATUS[x.status].label}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: tabla */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[620px] text-left text-[13px]">
          <thead>
            <tr className="border-y border-line text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
              <th className="px-6 py-3 font-bold">Fecha</th>
              <th className="px-3 py-3 font-bold">Concepto</th>
              <th className="px-3 py-3 font-bold">Medio</th>
              <th className="px-3 py-3 font-bold">Estado</th>
              <th className="px-6 py-3 text-right font-bold">Monto</th>
            </tr>
          </thead>
          <tbody>
            {p.payments.map((x) => (
              <tr key={x.id} className="group border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.025]">
                <td className="px-6 py-3">
                  <span className="block font-semibold text-fg-2 tabular">{x.date}</span>
                  <span className="block text-[11px] text-faint tabular">{x.id}</span>
                </td>
                <td className="px-3 py-3 font-semibold text-fg">{x.concept}</td>
                <td className="px-3 py-3 text-fg-2">{x.method}</td>
                <td className="px-3 py-3">
                  <Pill tone={PAY_STATUS[x.status].tone} dot>
                    {PAY_STATUS[x.status].label}
                  </Pill>
                </td>
                <td className="px-6 py-3 text-right">
                  <span className="font-bold text-fg tabular">{money(x.amount)}</span>
                  {x.status === "pagado" ? (
                    <Receipt className="ml-2 inline size-3.5 text-faint transition group-hover:text-lime" />
                  ) : (
                    <ArrowUpRight className="ml-2 inline size-3.5 text-lime" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function PayIcon({ status }: { status: Payment["status"] }) {
  const map = {
    pagado: "bg-lime/12 text-lime",
    pendiente: "bg-amber/12 text-amber",
    vencido: "bg-rose/12 text-rose",
  };
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", map[status])}>
      {status === "pagado" ? <Check className="size-4" strokeWidth={3} /> : <Banknote className="size-4" />}
    </span>
  );
}

/* ── Línea de tiempo ───────────────────────────────────────── */
const EVENT_META: Record<TimelineEvent["kind"], { icon: typeof LogIn; cls: string }> = {
  ingreso: { icon: LogIn, cls: "bg-lime text-lime-ink shadow-[0_0_16px_-2px_rgb(181_245_74/0.7)]" },
  pago: { icon: Banknote, cls: "bg-emerald/15 text-emerald ring-1 ring-emerald/30" },
  plan: { icon: Repeat2, cls: "bg-violet/15 text-violet ring-1 ring-violet/30" },
  nota: { icon: StickyNote, cls: "bg-amber/15 text-amber ring-1 ring-amber/30" },
  logro: { icon: Trophy, cls: "bg-cyan/15 text-cyan ring-1 ring-cyan/30" },
  alerta: { icon: TriangleAlert, cls: "bg-rose text-white shadow-[0_0_16px_-2px_rgb(255_95_126/0.7)]" },
};

export function Timeline({ p, i }: { p: Profile; i: number }) {
  return (
    <article className="panel stagger p-5 sm:p-6" style={s(i)}>
      <SectionTitle title="Actividad" hint="Ingresos, pagos, planes y notas" action={<Link href={`/admin/socios/${p.member.id}/notas`} className="text-[12px] font-bold text-lime hover:underline">Ver todo</Link>} />
      <ol className="relative mt-5">
        <span className="absolute bottom-3 left-[17px] top-3 w-px bg-gradient-to-b from-lime/50 via-line-strong to-transparent" />
        {p.timeline.map((e, k) => {
          const meta = EVENT_META[e.kind];
          return (
            <li key={k} className="relative flex gap-3.5 pb-5 last:pb-0">
              <span className={cn("relative z-[1] grid size-[35px] shrink-0 place-items-center rounded-full", meta.cls)}>
                <meta.icon className="size-4" strokeWidth={2.4} />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-[13.5px] font-bold text-fg">{e.title}</p>
                  <span className="shrink-0 text-[11px] font-semibold text-faint tabular">{e.when}</span>
                </div>
                {e.author ? (
                  <div className="mt-1.5 rounded-xl rounded-tl-sm border border-line bg-white/[0.025] p-2.5">
                    <p className="text-[12.5px] leading-relaxed text-fg-2">“{e.detail}”</p>
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                      <Avatar i={e.author.face} size={18} /> {e.author.name} · Coach
                    </p>
                  </div>
                ) : (
                  e.detail && <p className="mt-0.5 text-[12px] leading-snug text-muted">{e.detail}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

/* ── Salud + emergencia ────────────────────────────────────── */
export function HealthCard({ p, i }: { p: Profile; i: number }) {
  const ok = p.health.aptoStatus === "vigente";
  return (
    <article className="panel stagger overflow-hidden" style={s(i)}>
      <div className="p-5 sm:p-6">
        <SectionTitle title="Salud" hint="Apto médico y observaciones" action={<Pill tone="neutral"><Droplet className="size-3 text-rose" /> {p.health.blood}</Pill>} />
        <div
          className={cn(
            "mt-4 flex items-center gap-3 rounded-2xl border p-3.5",
            ok ? "border-lime/25 bg-lime/[0.06]" : "border-amber/30 bg-amber/[0.07]",
          )}
        >
          <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", ok ? "bg-lime text-lime-ink" : "bg-amber text-ink")}>
            {ok ? <ShieldCheck className="size-5" strokeWidth={2.4} /> : <TriangleAlert className="size-5" strokeWidth={2.4} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-extrabold text-fg">Apto médico {ok ? "vigente" : "por vencer"}</p>
            <p className="text-[12px] text-fg-2">
              Hasta el <span className="font-bold tabular">{p.health.aptoUntil}</span> · Dr. Pablo Medina
            </p>
          </div>
          <BadgeCheck className={cn("size-5 shrink-0", ok ? "text-lime" : "text-amber")} />
        </div>
        <ul className="mt-4 space-y-2 text-[12.5px]">
          {p.health.notes.map((n) => (
            <li key={n} className="flex items-start gap-2 text-fg-2">
              <HeartPulse className="mt-0.5 size-3.5 shrink-0 text-rose" /> {n}
            </li>
          ))}
          {p.health.restrictions.map((n) => (
            <li key={n} className="flex items-start gap-2 text-fg-2">
              <Activity className="mt-0.5 size-3.5 shrink-0 text-amber" /> {n}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-3 border-t border-line bg-rose/[0.04] px-5 py-4 sm:px-6">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-rose/12 text-rose">
          <Siren className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">Contacto de emergencia</p>
          <p className="truncate text-[13px] font-bold text-fg">
            {p.emergency.name} <span className="font-semibold text-muted">· {p.emergency.relation}</span>
          </p>
          <p className="text-[12px] text-fg-2 tabular">{p.emergency.phone}</p>
        </div>
        <button className="grid size-9 place-items-center rounded-lg bg-rose text-white transition hover:brightness-110" aria-label="Llamar">
          <Phone className="size-4" />
        </button>
      </div>
    </article>
  );
}

/* ── Datos personales + etiquetas ──────────────────────────── */
export function PersonalCard({ p, i }: { p: Profile; i: number }) {
  const rows = [
    { icon: IdCard, l: "DNI", v: p.dni },
    { icon: Cake, l: "Nacimiento", v: `${p.birthday} · ${p.age} años` },
    { icon: Mail, l: "Email", v: p.email },
    { icon: Phone, l: "Teléfono", v: p.phone },
    { icon: MapPin, l: "Barrio", v: p.address },
  ];
  return (
    <article className="panel stagger p-5 sm:p-6" style={s(i)}>
      <SectionTitle title="Datos y etiquetas" action={<button className="text-[12px] font-bold text-lime hover:underline">Editar</button>} />
      <dl className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.l} className="flex items-center gap-3 text-[12.5px]">
            <r.icon className="size-4 shrink-0 text-faint" />
            <dt className="w-[84px] shrink-0 font-semibold text-muted">{r.l}</dt>
            <dd className="min-w-0 flex-1 truncate text-right font-bold text-fg-2 tabular">{r.v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 border-t border-line pt-4">
        <div className="flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <Pill key={t.label} tone={t.tone}>
              {t.label}
            </Pill>
          ))}
          <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-line-strong px-2.5 py-1 text-[11.5px] font-semibold text-muted transition hover:border-lime/50 hover:text-lime">
            <Plus className="size-3" /> Etiqueta
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── Reservas ──────────────────────────────────────────────── */
const DAY_TONE = ["bg-lime text-lime-ink", "bg-violet/15 text-violet", "bg-cyan/15 text-cyan"];

export function BookingsCard({ p, i }: { p: Profile; i: number }) {
  const hold = p.bookingsOnHold;
  const frozen = p.member.status === "congelado";
  return (
    <article className="panel stagger p-5 sm:p-6" style={s(i)}>
      <SectionTitle
        title="Clases reservadas"
        hint="Próximos 7 días"
        action={
          hold ? (
            <Pill tone={frozen ? "cyan" : "rose"} dot>
              {frozen ? "En pausa" : "Suspendidas"}
            </Pill>
          ) : (
            <Pill tone="lime">{p.bookings.length} turnos</Pill>
          )
        }
      />
      {hold && (
        <p
          className={cn(
            "mt-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-semibold leading-snug",
            frozen ? "border-cyan/25 bg-cyan/[0.06] text-cyan" : "border-rose/25 bg-rose/[0.06] text-rose",
          )}
        >
          {frozen ? <Snowflake className="mt-px size-3.5 shrink-0" /> : <TriangleAlert className="mt-px size-3.5 shrink-0" />}
          <span>{frozen ? "Los cupos se liberaron durante la licencia." : "Cupos retenidos hasta las 17:00 · se liberan si no regulariza la cuota."}</span>
        </p>
      )}
      <ul className={cn("mt-4 grid gap-2 md:grid-cols-3 xl:grid-cols-1", hold && "opacity-60 grayscale-[0.6]")}>
        {p.bookings.map((b, k) => (
          <li
            key={b.name + b.day}
            className="group flex min-w-0 items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-2.5 transition hover:-translate-y-0.5 hover:border-line-strong"
          >
            <span className={cn("grid w-11 shrink-0 place-items-center rounded-lg py-1.5 leading-none", hold ? "bg-white/[0.06] text-fg-2" : DAY_TONE[k % 3])}>
              <span className="text-[9.5px] font-extrabold tracking-wider">{b.day}</span>
              <span className="mt-0.5 text-[17px] font-extrabold tabular">{b.date}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-[13px] font-bold text-fg", hold && "line-through decoration-white/30")}>{b.name}</p>
              <p className="truncate text-[11.5px] text-muted">
                <span className="font-bold text-fg-2 tabular">{b.time}</span> · {b.room} · {b.spots}
              </p>
            </div>
            <span className="shrink-0 md:max-xl:hidden">
              <Avatar i={b.coach.face} size={28} />
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** Etiqueta corta del plan para la credencial. */
function cardTag(plan: string) {
  if (plan.startsWith("Cross")) return "Cross";
  if (plan.startsWith("Musculación")) return plan.replace("Musculación", "Musc.");
  if (plan.startsWith("Pase")) return "Pase";
  return plan.split(" ")[0];
}

/** Retrato con carga inmediata (las capturas de página completa no disparan lazy-load). */
function Avatar({ i, size }: { i: number; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={face(i, size * 2)}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full bg-surface-3 object-cover"
      style={{ width: size, height: size }}
    />
  );
}

function MiniRing({ value, size = 58 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth={6} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <span className="absolute text-[13px] font-extrabold text-fg tabular">{value}%</span>
    </div>
  );
}
