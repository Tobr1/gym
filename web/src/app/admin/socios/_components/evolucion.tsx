import { ArrowDown, ArrowUp, CalendarPlus, Camera, Lock, Ruler, ShieldCheck, Snowflake, Trophy } from "lucide-react";
import { Button, Pill, SectionTitle, Sparkline } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { getEvolution, type Evolution } from "../_lib/evolution";
import type { Profile } from "../_lib/profile";
import { CompositionChart } from "./evolucion-chart";
import { dec, Eyebrow, Face, s, StatusNote } from "./kit";

export function EvolucionTab({ p }: { p: Profile }) {
  const e = getEvolution(p);
  const st = p.member.status;
  return (
    <div className="mt-6 grid gap-4">
      {st === "vencido" && (
        <StatusNote tone="rose" icon={<Lock />}>
          <b>Evaluación del {p.body.nextEval} en suspenso.</b> Se confirma cuando regularice la cuota; la última medición es del {p.body.lastEval}.
        </StatusNote>
      )}
      {st === "congelado" && (
        <StatusNote tone="cyan" icon={<Snowflake />}>
          <b>Mediciones en pausa durante la licencia.</b> La próxima evaluación quedó agendada para el {p.body.nextEval}, después de reactivar.
        </StatusNote>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <article className="panel stagger p-5 sm:p-6" style={s(2)}>
          <SectionTitle
            title="Composición corporal"
            hint={`${e.series.length} evaluaciones · ${e.series[0].date} → ${e.series.at(-1)!.date} · bioimpedancia`}
            action={
              <div className="hidden rounded-lg border border-line bg-white/[0.02] p-0.5 text-[11.5px] font-bold sm:flex">
                {["3M", "6M", "1A"].map((t, k) => (
                  <span key={t} className={cn("rounded-md px-2.5 py-1", k === 1 ? "bg-surface-3 text-fg" : "text-muted")}>
                    {t}
                  </span>
                ))}
              </div>
            }
          />
          <div className="mt-5">
            <CompositionChart data={e.series} targets={e.targets} />
          </div>
        </article>
        <BeforeAfter p={p} e={e} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px]">
        <Perimeters e={e} />
        <Goals e={e} />
        <div className="grid content-start gap-4 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
          <BodyIndex p={p} e={e} />
          <NextEval p={p} />
        </div>
      </div>

      <PRTable p={p} e={e} />
    </div>
  );
}

/* ── Antes / después ──────────────────────────────────────── */
function BeforeAfter({ p, e }: { p: Profile; e: Evolution }) {
  const shots = [
    { tag: "Antes", ...e.photos.before },
    { tag: "Ahora", ...e.photos.after },
  ];
  const dw = e.photos.after.weight - e.photos.before.weight;
  const df = e.photos.after.fat - e.photos.before.fat;
  return (
    <article className="panel stagger flex flex-col p-5 sm:p-6" style={s(3)}>
      <SectionTitle
        title="Fotos de progreso"
        hint="Frente · misma luz y distancia"
        action={
          <Button variant="secondary" size="sm">
            <Camera className="size-3.5" /> Subir
          </Button>
        }
      />
      <div className="relative mt-4 grid flex-1 grid-cols-2 gap-2">
        {shots.map((x, k) => (
          <figure key={x.tag} className="group relative min-h-[260px] overflow-hidden rounded-2xl border border-white/[0.08] bg-ink sm:min-h-[300px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={x.src}
              alt={`${x.tag} · ${x.date}`}
              className={cn("photo-grade absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105", k === 0 && "opacity-75")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/30" />
            <span
              className={cn(
                "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider",
                k === 1 ? "bg-lime text-lime-ink" : "bg-ink/70 text-fg-2 ring-1 ring-white/15 backdrop-blur",
              )}
            >
              {x.tag}
            </span>
            <figcaption className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-[11px] font-semibold text-fg-2">{x.date}</p>
              <p className="mt-0.5 text-[15px] font-extrabold tracking-tight text-fg tabular">
                {dec(x.weight)} kg <span className="text-[12px] font-bold text-muted">· {dec(x.fat)} %</span>
              </p>
            </figcaption>
          </figure>
        ))}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-ink/85 px-3 py-2 text-center shadow-2xl backdrop-blur-md">
          <p className={cn("text-[14px] font-extrabold tabular", dw <= 0 ? "text-lime" : "text-rose")}>
            {dw > 0 ? "+" : "−"}
            {dec(Math.abs(dw))} kg
          </p>
          <p className={cn("text-[11.5px] font-bold tabular", df <= 0 ? "text-lime" : "text-rose")}>
            {df > 0 ? "+" : "−"}
            {dec(Math.abs(df))} % grasa
          </p>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11.5px] font-semibold text-muted">
        <ShieldCheck className="size-3.5 text-lime" /> Privadas: solo las ven {p.member.name.split(" ")[0]} y su coach
      </p>
    </article>
  );
}

/* ── Perímetros ───────────────────────────────────────────── */
function Perimeters({ e }: { e: Evolution }) {
  const best = [...e.perimeters].sort((a, b) => Math.abs(b.last - b.first) / b.first - Math.abs(a.last - a.first) / a.first)[0];
  return (
    <article className="panel stagger p-5 sm:p-6" style={s(4)}>
      <SectionTitle title="Perímetros" hint={`En cm · ${e.series[0].date} → ${e.series.at(-1)!.date}`} action={<Ruler className="size-4 text-muted" />} />
      <ul className="mt-5 space-y-[18px]">
        {e.perimeters.map((x) => {
          const lo = Math.min(x.first, x.last) * 0.93;
          const hi = Math.max(x.first, x.last) * 1.07;
          const pos = (v: number) => ((v - lo) / (hi - lo)) * 100;
          const d = x.last - x.first;
          const good = x.better === "down" ? d < 0 : d > 0;
          const a = pos(Math.min(x.first, x.last));
          const b = pos(Math.max(x.first, x.last));
          return (
            <li key={x.label}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12.5px] font-semibold text-fg-2">{x.label}</span>
                <span className="text-[12px] tabular">
                  <span className="font-extrabold text-fg">{dec(x.last)}</span>
                  <span className={cn("ml-2 font-extrabold", good ? "text-lime" : "text-rose")}>
                    {d > 0 ? "+" : "−"}
                    {dec(Math.abs(d))}
                  </span>
                </span>
              </div>
              <div className="relative mt-2 h-3">
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/[0.08]" />
                <span className={cn("absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full", good ? "bg-lime/50" : "bg-rose/50")} style={{ left: `${a}%`, width: `${b - a}%` }} />
                <span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-muted bg-surface" style={{ left: `${pos(x.first)}%` }} />
                <span
                  className={cn("absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full", good ? "bg-lime shadow-[0_0_10px_rgb(181_245_74/0.8)]" : "bg-rose")}
                  style={{ left: `${pos(x.last)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 rounded-xl border border-line bg-gradient-to-r from-lime/[0.07] to-transparent px-3.5 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Mayor cambio</p>
        <p className="mt-0.5 text-[14px] font-extrabold tracking-tight text-fg">
          {best.label} {best.last < best.first ? "−" : "+"}
          {dec(Math.abs(best.last - best.first))} cm <span className="text-[12px] font-semibold text-muted">desde junio</span>
        </p>
      </div>
      <div className="mt-4 flex items-center gap-4 text-[11px] font-semibold text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border-2 border-muted" /> Junio
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-lime" /> Última medición
        </span>
      </div>
    </article>
  );
}

/* ── Objetivos ────────────────────────────────────────────── */
const GOAL_TONE = {
  violet: "from-violet/70 to-violet",
  lime: "from-lime/60 to-lime",
  amber: "from-amber/60 to-amber",
  cyan: "from-cyan/60 to-cyan",
} as const;

function Goals({ e }: { e: Evolution }) {
  return (
    <article className="panel stagger p-5 sm:p-6" style={s(5)}>
      <SectionTitle title="Objetivos" hint="Acordados con el coach" action={<button className="text-[12px] font-bold text-lime hover:underline">Nuevo</button>} />
      <ul className="mt-4 space-y-3">
        {e.goals.map((g, k) => (
          <li key={g.title} className={cn("rounded-xl border p-3.5", k === 0 ? "border-violet/30 bg-violet/[0.06]" : "border-line bg-white/[0.02]")}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-bold leading-snug text-fg">{g.title}</p>
                <p className="mt-0.5 text-[11.5px] text-muted">{g.detail}</p>
              </div>
              <span className="shrink-0 text-[15px] font-extrabold text-fg tabular">{g.pct}%</span>
            </div>
            <div className="mt-2.5 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                <div className={cn("h-full rounded-full bg-gradient-to-r", GOAL_TONE[g.tone])} style={{ width: `${g.pct}%` }} />
              </div>
              <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-wider text-faint">{g.due}</span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ── IMC ──────────────────────────────────────────────────── */
function BodyIndex({ p, e }: { p: Profile; e: Evolution }) {
  const bmi = e.bmi.at(-1)!;
  const zones = [
    { l: "Bajo", to: 18.5, c: "bg-cyan/50" },
    { l: "Normal", to: 25, c: "bg-lime/60" },
    { l: "Sobrepeso", to: 30, c: "bg-amber/60" },
    { l: "Obesidad", to: 35, c: "bg-rose/60" },
  ];
  const pos = ((Math.min(34, Math.max(16, bmi)) - 16) / (35 - 16)) * 100;
  const fatMass = (e.series.at(-1)!.weight * e.series.at(-1)!.fat) / 100;
  return (
    <article className="panel stagger p-5" style={s(6)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <Eyebrow>Índice de masa corporal</Eyebrow>
          <p className="mt-1.5 text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">{dec(bmi)}</p>
        </div>
        <Sparkline data={e.bmi} color="var(--color-cyan)" height={36} className="max-w-[110px]" fill={false} />
      </div>
      <div className="relative mt-4">
        <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
          {zones.map((z, k) => (
            <span key={z.l} className={z.c} style={{ flex: z.to - (k === 0 ? 16 : zones[k - 1].to) }} />
          ))}
        </div>
        <span className="absolute -top-1 h-3.5 w-1 -translate-x-1/2 rounded-full bg-fg shadow-[0_0_8px_rgb(255_255_255/0.6)]" style={{ left: `${pos}%` }} />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-[11px]">
        {[
          { l: "Altura", v: `${dec(e.height, 2)} m` },
          { l: "Masa grasa", v: `${dec(fatMass)} kg` },
          { l: "Edad", v: `${p.age} años` },
        ].map((x) => (
          <div key={x.l}>
            <dt className="font-bold uppercase tracking-wide text-faint">{x.l}</dt>
            <dd className="mt-0.5 text-[13px] font-extrabold text-fg tabular">{x.v}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/* ── Próxima evaluación ───────────────────────────────────── */
function NextEval({ p }: { p: Profile }) {
  const coach = p.routine.coach;
  const hold = p.bookingsOnHold;
  return (
    <article className={cn("panel stagger relative overflow-hidden p-5", !hold && "glow-violet")} style={s(7)}>
      <div className="absolute -right-12 -top-12 size-36 rounded-full bg-violet/20 blur-3xl" />
      <div className="relative flex items-center gap-3.5">
        <div className="w-14 shrink-0 overflow-hidden rounded-xl border border-violet/30 text-center">
          <p className="bg-violet py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink">{p.body.nextEval.split(" ")[1]}</p>
          <p className="py-1 text-[22px] font-extrabold leading-tight text-fg tabular">{p.body.nextEval.split(" ")[0]}</p>
        </div>
        <div className="min-w-0 flex-1">
          <Eyebrow>Próxima evaluación</Eyebrow>
          <p className="mt-0.5 truncate text-[14px] font-bold text-fg">{hold ? "Fecha a confirmar" : `${p.body.nextEval === "17 dic" ? "Jueves" : "Miércoles"} · 08:30`}</p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-[11.5px] text-muted">
            <Face i={coach.face} size={18} /> {coach.name} · Box de evaluación
          </p>
        </div>
      </div>
      <Button variant="secondary" size="sm" className="relative mt-4 w-full">
        <CalendarPlus className="size-3.5" /> {hold ? "Reprogramar" : "Enviar recordatorio"}
      </Button>
    </article>
  );
}

/* ── Récords personales ───────────────────────────────────── */
function PRTable({ p, e }: { p: Profile; e: Evolution }) {
  const fmtV = (v: number, unit: string) => (unit === "min" ? `${Math.floor(v)}:${String(Math.round((v % 1) * 60)).padStart(2, "0")}` : dec(v, v % 1 ? 1 : 0));
  return (
    <article className="panel stagger overflow-hidden" style={s(8)}>
      <div className="flex flex-col gap-3 p-5 pb-4 sm:flex-row sm:items-end sm:justify-between sm:p-6 sm:pb-4">
        <SectionTitle title="Récords personales" hint={`Mejores marcas del programa · ${p.routine.name}`} />
        <Pill tone="amber" className="self-start sm:self-auto">
          <Trophy className="size-3" /> {e.prs.length} récords en 6 meses
        </Pill>
      </div>

      {/* Mobile */}
      <ul className="grid gap-2 border-t border-line p-4 sm:hidden">
        {e.prs.map((x) => {
          const better = x.better === "up" ? x.value > x.prev : x.value < x.prev;
          return (
            <li key={x.exercise} className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-fg">{x.exercise}</p>
                <p className="text-[11px] text-muted">
                  {x.reps} · {x.date}
                </p>
              </div>
              <div className="w-16 shrink-0">
                <Sparkline data={x.better === "up" ? x.history : x.history.map((v) => -v)} height={28} fill={false} />
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[15px] font-extrabold text-fg tabular">
                  {fmtV(x.value, x.unit)} <span className="text-[11px] font-bold text-muted">{x.unit}</span>
                </p>
                <p className={cn("text-[11px] font-bold tabular", better ? "text-lime" : "text-rose")}>desde {fmtV(x.prev, x.unit)}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr className="border-y border-line text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
              <th className="px-6 py-3 font-bold">Ejercicio</th>
              <th className="px-3 py-3 font-bold">Registro</th>
              <th className="px-3 py-3 text-right font-bold">Anterior</th>
              <th className="px-3 py-3 text-right font-bold">Actual</th>
              <th className="px-3 py-3 text-right font-bold">Mejora</th>
              <th className="w-[160px] px-3 py-3 font-bold">Tendencia</th>
              <th className="px-6 py-3 text-right font-bold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {e.prs.map((x, k) => {
              const pct = Math.abs(((x.value - x.prev) / x.prev) * 100);
              const better = x.better === "up" ? x.value > x.prev : x.value < x.prev;
              const Arrow = x.value > x.prev ? ArrowUp : ArrowDown;
              return (
                <tr key={x.exercise} className="border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.025]">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <span className={cn("grid size-8 place-items-center rounded-lg text-[12px] font-extrabold", k === 0 ? "bg-amber/15 text-amber" : "bg-white/[0.05] text-fg-2")}>
                        {k === 0 ? <Trophy className="size-4" /> : k + 1}
                      </span>
                      <span className="font-bold text-fg">{x.exercise}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-semibold text-muted">{x.reps}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-muted tabular">
                    {fmtV(x.prev, x.unit)} {x.unit}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right text-[15px] font-extrabold text-fg tabular">
                    {fmtV(x.value, x.unit)} <span className="text-[11.5px] font-bold text-muted">{x.unit}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11.5px] font-extrabold tabular", better ? "bg-lime/12 text-lime" : "bg-rose/12 text-rose")}>
                      <Arrow className="size-3" strokeWidth={2.8} />
                      {Math.round(pct)}%
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <Sparkline data={x.better === "up" ? x.history : x.history.map((v) => -v)} height={30} color={k === 0 ? "var(--color-amber)" : "var(--color-lime)"} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-right font-semibold text-fg-2 tabular">{x.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
