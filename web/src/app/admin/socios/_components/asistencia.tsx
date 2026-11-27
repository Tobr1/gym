import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Dumbbell,
  Flame,
  IdCard,
  Lock,
  QrCode,
  Snowflake,
  Trophy,
  Users,
} from "lucide-react";
import { Donut } from "@/components/charts";
import { Pill, SectionTitle } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { BANDS, DOW, DOW_LONG, GYM_AVG, getAttendance, type Attendance, type Visit } from "../_lib/attendance";
import { dayMs, TODAY, type Profile } from "../_lib/profile";
import { dec, Eyebrow, Face, s, StatusNote } from "./kit";

/** Inicio de la licencia (congelado) y del bloqueo por cuota vencida. */
const FREEZE_FROM = "2026-11-05";
const BLOCK_FROM = "2026-11-17";

export function AsistenciaTab({ p }: { p: Profile }) {
  const a = getAttendance(p);
  const st = p.member.status;
  return (
    <div className="mt-6 grid gap-4">
      {st === "vencido" && (
        <StatusNote tone="rose" icon={<Lock />} className="stagger">
          <b>Sin ingresos desde el {p.dueLabel}.</b> Los molinetes rechazan su acceso desde el 17 nov por cuota vencida · último intento hoy 08:21.
        </StatusNote>
      )}
      {st === "congelado" && (
        <StatusNote tone="cyan" icon={<Snowflake />} className="stagger">
          <b>Membresía congelada desde el 4 nov.</b> Los días de licencia no cuentan para la racha ni para la asistencia del mes.
        </StatusNote>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <CalendarCard p={p} a={a} />
        <div className="grid min-w-0 content-start gap-4 lg:grid-cols-2 xl:grid-cols-1">
          <StreakCard p={p} a={a} />
          <CompareCard p={p} a={a} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(0,1.1fr)]">
        <PatternCard a={a} />
        <MixCard a={a} />
        <div className="lg:col-span-2 xl:col-span-1">
          <VisitLog a={a} />
        </div>
      </div>
    </div>
  );
}

/* ── Calendario del mes ───────────────────────────────────── */
const CELL = [
  "bg-white/[0.035] text-fg-2",
  "bg-lime/[0.10] text-fg ring-1 ring-inset ring-lime/15",
  "bg-lime/[0.20] text-fg ring-1 ring-inset ring-lime/20",
  "bg-lime/[0.36] text-fg ring-1 ring-inset ring-lime/30",
  "bg-lime text-lime-ink shadow-[0_0_18px_-4px_rgb(181_245_74/0.8)]",
];

type Cell = { iso: string; day: number; visit?: Visit; out: boolean; future: boolean; today: boolean };

function CalendarCard({ p, a }: { p: Profile; a: Attendance }) {
  const st = p.member.status;
  const byDate = new Map(a.visits.map((v) => [v.date, v]));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const first = new Date(Date.UTC(2026, 10, 1));
  const lead = a.firstDow;
  const total = Math.ceil((lead + a.calendar.length) / 7) * 7;
  const cells: Cell[] = Array.from({ length: total }, (_, k) => {
    const d = new Date(first.getTime() + (k - lead) * dayMs);
    const key = iso(d);
    return {
      iso: key,
      day: d.getUTCDate(),
      visit: byDate.get(key),
      out: d.getUTCMonth() !== 10,
      future: d > TODAY,
      today: key === iso(TODAY),
    };
  });
  const diff = a.monthCount - a.prevToDate;
  const hours = Math.round(a.monthMinutes / 60);
  const avg = a.monthCount ? Math.round(a.monthMinutes / a.monthCount) : 0;

  return (
    <article className="panel stagger p-5 sm:p-6" style={s(2)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Eyebrow>Calendario de ingresos</Eyebrow>
          <div className="mt-1.5 flex items-center gap-2">
            <h3 className="text-[22px] font-extrabold tracking-[-0.03em] text-fg">{a.monthLabel}</h3>
            <span className="flex gap-1">
              <button className="grid size-7 place-items-center rounded-lg border border-line text-muted transition hover:text-fg" aria-label="Mes anterior">
                <ChevronLeft className="size-4" />
              </button>
              <button className="grid size-7 place-items-center rounded-lg border border-line text-faint" aria-label="Mes siguiente" disabled>
                <ChevronRight className="size-4" />
              </button>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[34px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">{a.monthCount}</p>
            <p className="text-[11px] font-semibold text-muted">ingresos en el mes</p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[11.5px] font-extrabold tabular",
              diff >= 0 ? "bg-lime/12 text-lime" : "bg-rose/12 text-rose",
            )}
          >
            {diff >= 0 ? <ArrowUpRight className="size-3.5" strokeWidth={2.6} /> : <ArrowDownRight className="size-3.5" strokeWidth={2.6} />}
            {Math.abs(diff)} vs. oct
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-1.5">
        {DOW.map((d, k) => (
          <span key={d} className={cn("pb-1 text-center text-[10.5px] font-bold uppercase tracking-wider", k >= 5 ? "text-faint" : "text-muted")}>
            <span className="sm:hidden">{d[0]}</span>
            <span className="hidden sm:inline">{d}</span>
          </span>
        ))}
        {cells.map((c, k) => {
          const v = c.visit;
          const frozen = st === "congelado" && !c.out && c.iso >= FREEZE_FROM && !c.future;
          const blocked = st === "vencido" && !c.out && c.iso >= BLOCK_FROM && !c.future;
          const live = c.today && v && !v.out;
          return (
            <div
              key={c.iso}
              title={v ? `${c.day} · ${v.time}${v.out ? `–${v.out}` : " · en sala"} · ${v.kind === "clase" ? v.className : "Musculación libre"}` : undefined}
              className={cn(
                "group relative flex aspect-square flex-col justify-between overflow-hidden rounded-[10px] p-1.5 transition-transform duration-200 hover:-translate-y-0.5 sm:aspect-[1.25] sm:rounded-xl sm:p-2 xl:aspect-[1.4]",
                c.out
                  ? "bg-white/[0.015] text-faint"
                  : c.future
                  ? "border border-dashed border-white/[0.07] text-faint"
                  : frozen
                    ? "bg-cyan/[0.06] text-cyan/70 [background-image:repeating-linear-gradient(135deg,rgb(87_213_242/0.10)_0_2px,transparent_2px_7px)]"
                    : blocked
                      ? "bg-rose/[0.06] text-rose/80 [background-image:repeating-linear-gradient(135deg,rgb(255_95_126/0.10)_0_2px,transparent_2px_7px)]"
                      : CELL[v ? v.level : 0],
                c.today && "ring-2 ring-lime ring-offset-2 ring-offset-surface",
              )}
              style={{ animation: `pop .45s cubic-bezier(.34,1.56,.64,1) ${120 + k * 14}ms both` }}
            >
              <div className="flex items-start justify-between">
                <span className="text-[11.5px] font-extrabold leading-none tabular sm:text-[13px]">{c.day}</span>
                {v?.kind === "clase" && !c.out && <span className={cn("size-1.5 rounded-full sm:size-2", v.level >= 3 ? "bg-ink/70" : "bg-violet")} />}
                {frozen && <Snowflake className="hidden size-3 sm:block" />}
                {live && (
                  <span className="relative flex size-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-lime-ink/60" />
                    <span className="relative size-2 rounded-full bg-lime-ink" />
                  </span>
                )}
              </div>
              {v && !c.out && v.level > 0 && (
                <div className="hidden leading-none sm:block">
                  <p className="text-[11px] font-bold tabular opacity-90">{v.time}</p>
                  <p className="mt-0.5 text-[10px] font-semibold opacity-70 tabular">{live ? "en sala" : `${v.minutes} min`}</p>
                </div>
              )}
              {c.today && !v && <span className="hidden text-[9.5px] font-extrabold uppercase tracking-wider text-lime sm:block">Hoy</span>}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold text-muted">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-violet" /> Clase
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-lime" /> Musculación
          </span>
          {st === "congelado" && (
            <span className="flex items-center gap-1.5 text-cyan">
              <Snowflake className="size-3" /> Licencia
            </span>
          )}
          {st === "vencido" && (
            <span className="flex items-center gap-1.5 text-rose">
              <Lock className="size-3" /> Acceso bloqueado
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          Menos
          {CELL.map((c, k) => (
            <span key={k} className={cn("size-3 rounded-[3px] shadow-none", c.split(" ").slice(0, 1), k > 0 && k < 4 && "ring-1 ring-inset ring-lime/25")} />
          ))}
          Más
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4">
        {[
          { l: "Horas en sala", v: String(hours), u: "h" },
          { l: "Por visita", v: String(avg), u: "min" },
          { l: "Mismo día de oct", v: String(a.prevToDate), u: "ingresos" },
        ].map((k) => (
          <div key={k.l} className="min-w-0">
            <dt className="truncate text-[10.5px] font-bold uppercase tracking-wide text-faint">{k.l}</dt>
            <dd className="mt-1 text-[20px] font-extrabold leading-none tracking-tight text-fg tabular">
              {k.v} <span className="text-[11.5px] font-semibold text-muted">{k.u}</span>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/* ── Rachas ───────────────────────────────────────────────── */
function StreakCard({ p, a }: { p: Profile; a: Attendance }) {
  const max = Math.max(5, ...a.weeks.map((w) => w.count));
  const live = p.stats.streak > 0;
  return (
    <article className="panel stagger relative flex flex-col overflow-hidden p-5 sm:p-6" style={s(3)}>
      {live && <div className="absolute -right-16 -top-16 size-48 rounded-full bg-amber/[0.12] blur-[70px]" />}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className={cn("grid size-12 place-items-center rounded-2xl", live ? "bg-amber/15 text-amber" : "bg-white/[0.05] text-faint")}>
            <Flame className="size-6" />
          </span>
          <div>
            <p className="text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">
              {p.stats.streak} <span className="text-[14px] font-bold tracking-normal text-muted">semanas</span>
            </p>
            <p className="mt-1 text-[12px] font-semibold text-muted">Racha actual · 3+ ingresos por semana</p>
          </div>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-1 text-[10.5px] font-bold uppercase tracking-wider text-faint">
            <Trophy className="size-3 text-violet" /> Mejor
          </p>
          <p className="text-[20px] font-extrabold text-fg tabular">{p.stats.bestStreak}</p>
        </div>
      </div>

      <div className="relative mt-auto pt-5">
        <div className="relative flex h-[84px] items-end gap-[3px] sm:gap-1 lg:h-[132px] xl:h-[84px]">
          <span className="pointer-events-none absolute inset-x-0 z-[1] border-t border-dashed border-amber/60" style={{ bottom: `${(3 / max) * 100}%` }} />
          {a.weeks.map((w, k) => (
            <span
              key={w.label}
              title={`Semana del ${w.label} · ${w.count} ingresos`}
              className={cn(
                "flex-1 rounded-[5px] transition hover:brightness-125",
                w.current ? "border border-dashed border-lime/60 bg-lime/15" : w.count >= 3 ? "bg-lime/80" : w.count > 0 ? "bg-white/[0.14]" : "bg-white/[0.05]",
              )}
              style={{ height: `${Math.max(6, (w.count / max) * 100)}%`, animation: `fade-up .7s cubic-bezier(.22,1,.36,1) ${k * 30}ms both` }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-bold text-faint">
          <span>Semana del {a.weeks[0].label}</span>
          <span className="flex items-center gap-1.5 text-amber/80">
            <span className="w-3 border-t border-dashed border-amber/70" /> Meta 3
          </span>
          <span className="text-lime">Esta semana</span>
        </div>
      </div>
    </article>
  );
}

/* ── Comparación con la sede ──────────────────────────────── */
function CompareCard({ p, a }: { p: Profile; a: Attendance }) {
  const rows = [
    { l: "Ingresos por semana", me: a.perWeek, gym: GYM_AVG.perWeek, fmt: (n: number) => dec(n) },
    { l: "Permanencia", me: a.avgMinutes, gym: GYM_AVG.minutes, fmt: (n: number) => `${Math.round(n)} min` },
    { l: "Asistencia del mes", me: p.member.attendance, gym: GYM_AVG.attendance, fmt: (n: number) => `${n}%` },
    { l: "Visitas a clases", me: a.classPct, gym: GYM_AVG.classShare, fmt: (n: number) => `${n}%` },
  ];
  const good = p.member.attendance >= GYM_AVG.attendance;
  return (
    <article className="panel stagger p-5 sm:p-6" style={s(4)}>
      <SectionTitle
        title="Frente a la sede"
        hint={`Promedio de ${p.member.branch} · 16 semanas`}
        action={
          <Pill tone={good ? "lime" : "rose"} className={good ? "bg-lime text-lime-ink ring-0" : ""}>
            {good ? `Top ${a.top}%` : `Debajo del promedio`}
          </Pill>
        }
      />
      <ul className="mt-4 space-y-3.5">
        {rows.map((r) => {
          const max = Math.max(r.me, r.gym) * 1.15 || 1;
          const up = r.me >= r.gym;
          return (
            <li key={r.l}>
              <div className="flex items-baseline justify-between gap-2 text-[12px]">
                <span className="font-semibold text-fg-2">{r.l}</span>
                <span className="tabular">
                  <span className={cn("font-extrabold", up ? "text-fg" : "text-rose")}>{r.fmt(r.me)}</span>
                  <span className="ml-1.5 font-semibold text-faint">sede {r.fmt(r.gym)}</span>
                </span>
              </div>
              <div className="relative mt-1.5 h-2 rounded-full bg-white/[0.05]">
                <span
                  className={cn("absolute inset-y-0 left-0 rounded-full", up ? "bg-gradient-to-r from-lime/40 to-lime" : "bg-gradient-to-r from-rose/30 to-rose")}
                  style={{ width: `${(r.me / max) * 100}%` }}
                />
                <span className="absolute -top-1 bottom-[-4px] w-[2px] rounded-full bg-fg-2" style={{ left: `${(r.gym / max) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-muted">
        <span className="h-3 w-[2px] rounded-full bg-fg-2" /> Promedio de la sede
      </p>
    </article>
  );
}

/* ── Patrón día × franja ──────────────────────────────────── */
function PatternCard({ a }: { a: Attendance }) {
  const max = Math.max(1, ...a.punch.flat());
  return (
    <article className="panel stagger p-5 sm:p-6" style={s(5)}>
      <SectionTitle title="Patrón horario" hint="Cuándo entrena, por día y franja" />
      <div className="mt-4 rounded-xl border border-line bg-gradient-to-r from-lime/[0.07] to-transparent px-3.5 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Su momento</p>
        <p className="mt-0.5 text-[15px] font-extrabold tracking-tight text-fg">
          Los {DOW_LONG[a.topDow]}, de {BANDS[a.topBand].replace("–", " a ")} h
        </p>
      </div>
      <div className="mt-4 grid grid-cols-[28px_repeat(6,minmax(0,1fr))] items-center gap-y-1.5">
        <span />
        {BANDS.map((b, k) => (
          <span key={b} className={cn("text-center text-[10px] font-bold tabular", k === a.topBand ? "text-lime" : "text-faint")}>
            {b.split("–")[0]}
          </span>
        ))}
        {a.punch.map((row, d) => (
          <Row key={d} label={DOW[d]} row={row} max={max} hot={d === a.topDow} />
        ))}
      </div>
    </article>
  );
}

function Row({ label, row, max, hot }: { label: string; row: number[]; max: number; hot: boolean }) {
  return (
    <>
      <span className={cn("text-[10.5px] font-bold", hot ? "text-fg" : "text-faint")}>{label}</span>
      {row.map((n, b) => {
        const t = n / max;
        return (
          <span key={b} className="grid h-6 place-items-center">
            <span
              title={`${label} ${BANDS[b]} h · ${n} ingresos`}
              className={cn("rounded-full transition-transform hover:scale-125", n === 0 ? "size-1.5 bg-white/[0.08]" : t > 0.75 ? "bg-lime shadow-[0_0_12px_-2px_rgb(181_245_74/0.8)]" : "bg-lime/50")}
              style={n ? { width: 8 + t * 16, height: 8 + t * 16 } : undefined}
            />
          </span>
        );
      })}
    </>
  );
}

/* ── Clases vs. musculación libre ─────────────────────────── */
function MixCard({ a }: { a: Attendance }) {
  const total = a.classCount + a.freeCount;
  const data =
    total === 0
      ? [{ name: "Sin datos", value: 1, color: "rgb(255 255 255 / 0.08)" }]
      : [
          { name: "Clases", value: a.classCount, color: "#9D84FF" },
          { name: "Libre", value: a.freeCount, color: "#B5F54A" },
        ];
  const maxClass = Math.max(1, ...a.byClass.map((c) => c.count));
  const show = a.classCount + a.noShows === 0 ? 100 : Math.round((a.classCount / (a.classCount + a.noShows)) * 100);
  return (
    <article className="panel stagger flex flex-col p-5 sm:p-6" style={s(6)}>
      <SectionTitle title="Clases y sala libre" hint={`${total} ingresos · últimas 16 semanas`} />
      <div className="mt-4 flex items-center gap-5">
        <Donut data={data} size={120} thickness={13}>
          <div>
            <p className="text-[24px] font-extrabold leading-none tracking-tight text-fg tabular">{a.classPct}%</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">clases</p>
          </div>
        </Donut>
        <dl className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet/15 text-violet">
              <Users className="size-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-[11.5px] font-semibold text-muted">Clases grupales</dt>
              <dd className="text-[16px] font-extrabold text-fg tabular">{a.classCount}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-lime/12 text-lime">
              <Dumbbell className="size-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-[11.5px] font-semibold text-muted">Musculación libre</dt>
              <dd className="text-[16px] font-extrabold text-fg tabular">{a.freeCount}</dd>
            </div>
          </div>
        </dl>
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Presentismo en reservas</p>
          <p className="mt-0.5 text-[12px] text-fg-2">
            {a.noShows === 0 ? "Nunca faltó a una clase reservada" : `Faltó a ${a.noShows} de ${a.classCount + a.noShows} clases reservadas`}
          </p>
        </div>
        <p className={cn("text-[22px] font-extrabold tracking-tight tabular", show >= 90 ? "text-lime" : show >= 75 ? "text-amber" : "text-rose")}>{show}%</p>
      </div>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.1em] text-faint">Clases que más toma</p>
      <ul className="mt-2.5 space-y-2.5">
        {a.byClass.length === 0 && <li className="text-[12px] text-muted">Todavía no reservó clases.</li>}
        {a.byClass.map((c) => (
          <li key={c.name} className="flex items-center gap-2.5">
            <Face i={c.coach.face} size={26} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[12.5px] font-bold text-fg">{c.name}</p>
                <span className="shrink-0 text-[11.5px] font-bold text-fg-2 tabular">{c.count}</span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-white/[0.06]">
                <span className="block h-full rounded-full bg-violet" style={{ width: `${(c.count / maxClass) * 100}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ── Registro de ingresos ─────────────────────────────────── */
const ACCESS_ICON = { "QR app": QrCode, "Credencial NFC": CreditCard, "DNI manual": IdCard } as const;

function VisitLog({ a }: { a: Attendance }) {
  const rows = a.visits.slice(0, 7);
  return (
    <article className="panel stagger h-full p-5 sm:p-6" style={s(7)}>
      <SectionTitle title="Últimos ingresos" hint="Molinetes · entrada y salida" action={<button className="text-[12px] font-bold text-lime hover:underline">Exportar</button>} />
      <ol className="mt-4 divide-y divide-line">
        {rows.map((v) => {
          const Icon = ACCESS_ICON[v.access];
          const live = v.out === null;
          return (
            <li key={v.date} className="flex items-center gap-3 py-2.5">
              <div className={cn("w-11 shrink-0 rounded-lg py-1 text-center leading-none", live ? "bg-lime text-lime-ink" : "bg-white/[0.04]")}>
                <p className={cn("text-[9.5px] font-extrabold uppercase tracking-wider", live ? "" : "text-muted")}>{v.daysAgo === 0 ? "Hoy" : DOW[v.dow]}</p>
                <p className={cn("mt-0.5 text-[15px] font-extrabold tabular", live ? "" : "text-fg")}>{v.day}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-fg">{v.kind === "clase" ? v.className : "Musculación libre"}</p>
                <p className="flex items-center gap-1.5 truncate text-[11.5px] text-muted">
                  <Icon className="size-3 shrink-0" /> {v.access} · {v.door}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[12.5px] font-bold text-fg-2 tabular">
                  {v.time}
                  <span className="text-faint"> → </span>
                  {live ? <span className="text-lime">en sala</span> : v.out}
                </p>
                <p className={cn("text-[11px] font-semibold tabular", live ? "text-lime" : "text-muted")}>{v.minutes} min</p>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
