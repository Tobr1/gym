import { CalendarRange, Dumbbell, Lock, PencilRuler, Send, Snowflake, Trophy } from "lucide-react";
import { MUSCLE_COLOR, MUSCLE_TARGET } from "../../rutinas/_components/data";
import { Button, ButtonLink, Pill, Ring, SectionTitle } from "@/components/ui/primitives";
import { PHOTO } from "@/lib/photos";
import { cn, fmt } from "@/lib/utils";
import { getAttendance } from "../_lib/attendance";
import type { Profile } from "../_lib/profile";
import { getRoutine, type Routine } from "../_lib/routine";
import { Eyebrow, Face, s, StatusNote } from "./kit";
import { RoutineDays } from "./rutina-days";

export function RutinaTab({ p }: { p: Profile }) {
  const rt = getRoutine(p, getAttendance(p));
  const st = p.member.status;
  const live = rt.sessions[0]?.live ? rt.sessions[0].day.key : null;
  const states = p.routine.days.map((d) => ({ key: d.key, done: d.done && !p.bookingsOnHold, live: d.key === live }));

  return (
    <div className="mt-6 grid gap-4">
      <ProgramBanner p={p} rt={rt} />

      {st === "vencido" && (
        <StatusNote tone="rose" icon={<Lock />}>
          <b>Rutina en pausa.</b> Sin sesiones desde el {p.dueLabel}: no puede ingresar hasta regularizar la cuota. Al volver, conviene repetir la semana {p.routine.week - 1}.
        </StatusNote>
      )}
      {st === "congelado" && (
        <StatusNote tone="cyan" icon={<Snowflake />}>
          <b>Programa congelado con la membresía.</b> Al reactivar el 15 dic, retoma desde la semana {p.routine.week - 2} con cargas al 90 %.
        </StatusNote>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="panel stagger min-w-0 overflow-hidden" style={s(3)}>
          <RoutineDays days={rt.days} states={states} initial={rt.nextKey} />
        </article>

        <aside className="grid min-w-0 content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
          <AdherenceCard p={p} rt={rt} />
          <VolumeCard rt={rt} />
          <div className="md:col-span-2 xl:col-span-1">
            <SessionsCard rt={rt} />
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ── Programa ─────────────────────────────────────────────── */
function ProgramBanner({ p, rt }: { p: Profile; rt: Routine }) {
  const r = p.routine;
  const photo =
    rt.key === "pilates" ? PHOTO.yoga(1600, 600) : rt.key === "cross" ? PHOTO.ropes(1600, 600) : p.female ? PHOTO.focusWoman(1600, 600) : PHOTO.deadlift(1600, 600);
  return (
    <section className="panel stagger relative overflow-hidden" style={s(2)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt="" className="photo-grade absolute inset-y-0 right-0 h-full w-full object-cover object-[50%_30%] opacity-70 md:w-[62%]" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/95 to-surface/30 md:via-surface/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-transparent to-transparent" />

      <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-7">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="lime" className="bg-lime text-lime-ink ring-0">
              <Dumbbell className="size-3" /> Rutina asignada
            </Pill>
            <Pill>{r.phase}</Pill>
            <Pill>3 días / semana</Pill>
          </div>
          <h2 className="mt-3 text-[28px] font-extrabold leading-[1.02] tracking-[-0.04em] text-fg sm:text-[36px]">{r.name}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-fg-2">
            <span className="flex items-center gap-2">
              <Face i={r.coach.face} size={26} />
              Coach <b className="font-bold text-fg">{r.coach.name}</b>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarRange className="size-3.5 text-muted" /> Asignada el 26 oct · revisión {p.body.nextEval}
            </span>
          </div>

          {/* Mesociclo */}
          <div className="mt-6 max-w-[520px]">
            <div className="flex items-baseline justify-between text-[12px] font-semibold">
              <span className="text-muted">
                Semana <b className="text-[15px] font-extrabold text-fg">{r.week}</b> de {r.weeks}
              </span>
              <span className="hidden text-faint sm:inline">Deload en semana {r.weeks}</span>
            </div>
            <div className="mt-2 flex gap-1.5">
              {rt.weeks.map((w) => (
                <div key={w.w} className="flex-1">
                  <div
                    className={cn(
                      "flex h-7 items-center justify-center gap-[3px] rounded-md",
                      w.state === "current" ? "bg-lime/[0.12] ring-1 ring-inset ring-lime/50" : w.state === "past" ? "bg-white/[0.05]" : "border border-dashed border-white/[0.08]",
                    )}
                  >
                    {w.state !== "future" &&
                      Array.from({ length: w.planned }, (_, k) => (
                        <span key={k} className={cn("size-1.5 rounded-full", k < w.done ? (w.state === "current" ? "bg-lime" : "bg-lime/70") : "bg-white/[0.14]")} />
                      ))}
                  </div>
                  <p className={cn("mt-1 text-center text-[10px] font-bold tabular", w.state === "current" ? "text-lime" : "text-faint")}>S{w.w}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end lg:flex-col lg:items-end">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink/60 p-3.5 pr-5 backdrop-blur-md">
            <Ring value={r.adherence} size={74} stroke={7} color={r.adherence >= 70 ? "var(--color-lime)" : r.adherence >= 45 ? "var(--color-amber)" : "var(--color-rose)"}>
              <span className="text-[17px] font-extrabold text-fg tabular">{r.adherence}%</span>
            </Ring>
            <div>
              <Eyebrow>Adherencia</Eyebrow>
              <p className="mt-1 text-[13px] font-bold text-fg">{fmt(rt.totalSets)} series / semana</p>
              <p className="text-[12px] text-muted">{rt.days.reduce((a, d) => a + d.minutes, 0)} min planificados</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ButtonLink href="/admin/rutinas" size="md">
              <PencilRuler className="size-4" /> Editar en constructor
            </ButtonLink>
            <Button variant="secondary" size="icon" aria-label="Enviar a la app del socio">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Adherencia semanal ───────────────────────────────────── */
function AdherenceCard({ p, rt }: { p: Profile; rt: Routine }) {
  const past = rt.weeks.filter((w) => w.state !== "future");
  const done = past.reduce((a, w) => a + w.done, 0);
  const planned = past.reduce((a, w) => a + w.planned, 0);
  return (
    <article className="panel stagger p-5 sm:p-6" style={s(4)}>
      <SectionTitle title="Cumplimiento" hint={`${done} de ${planned} sesiones del mesociclo`} action={<span className="text-[20px] font-extrabold text-fg tabular">{Math.round((done / planned) * 100)}%</span>} />
      <div className="mt-5 flex h-[92px] items-end gap-2">
        {rt.weeks.map((w) => (
          <div key={w.w} className="flex h-full flex-1 flex-col justify-end gap-[3px]">
            {Array.from({ length: w.planned }, (_, k) => {
              const n = w.planned - 1 - k;
              const hit = n < w.done;
              return (
                <span
                  key={k}
                  className={cn(
                    "flex-1 rounded-[4px]",
                    w.state === "future"
                      ? "border border-dashed border-white/[0.07]"
                      : hit
                        ? w.state === "current"
                          ? "bg-lime shadow-[0_0_12px_-3px_rgb(181_245_74/0.8)]"
                          : "bg-lime/60"
                        : "bg-white/[0.07]",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2 text-center text-[10px] font-bold text-faint">
        {rt.weeks.map((w) => (
          <span key={w.w} className={cn("flex-1", w.state === "current" && "text-lime")}>
            S{w.w}
          </span>
        ))}
      </div>
      <p className="mt-4 border-t border-line pt-3 text-[12px] leading-snug text-muted">
        {p.bookingsOnHold
          ? "Sin sesiones registradas en las últimas semanas."
          : `Esta semana: ${p.routine.days.filter((d) => d.done).length} de 3 hechas · le falta el Día ${rt.nextKey}.`}
      </p>
    </article>
  );
}

/* ── Volumen por grupo muscular ───────────────────────────── */
function VolumeCard({ rt }: { rt: Routine }) {
  const max = Math.max(...rt.volume.map((v) => Math.max(v.sets, MUSCLE_TARGET[v.muscle][1])));
  return (
    <article className="panel stagger p-5 sm:p-6" style={s(5)}>
      <SectionTitle title="Volumen semanal" hint="Series por grupo muscular" action={<span className="text-[12px] font-bold text-muted tabular">{rt.totalSets} series</span>} />
      <ul className="mt-4 space-y-2.5">
        {rt.volume.map((v) => {
          const [lo, hi] = MUSCLE_TARGET[v.muscle];
          return (
            <li key={v.muscle} className="grid grid-cols-[68px_minmax(0,1fr)_24px] items-center gap-2.5">
              <span className="truncate text-[12px] font-semibold text-fg-2">{v.muscle}</span>
              <span className="relative h-2 rounded-full bg-white/[0.05]">
                <span className="absolute inset-y-[-2px] rounded-sm border border-dashed border-white/[0.14]" style={{ left: `${(lo / max) * 100}%`, width: `${((hi - lo) / max) * 100}%` }} />
                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(v.sets / max) * 100}%`, background: MUSCLE_COLOR[v.muscle] }} />
              </span>
              <span className="text-right text-[12px] font-extrabold text-fg tabular">{v.sets}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-faint">
        <span className="h-2 w-4 rounded-sm border border-dashed border-white/[0.2]" /> Rango recomendado
      </p>
    </article>
  );
}

/* ── Últimas sesiones ─────────────────────────────────────── */
function SessionsCard({ rt }: { rt: Routine }) {
  return (
    <article className="panel stagger p-5 sm:p-6" style={s(6)}>
      <SectionTitle title="Últimas sesiones" hint="Registradas desde la app del socio" />
      <ol className="relative mt-4">
        <span className="absolute bottom-4 left-[15px] top-4 w-px bg-gradient-to-b from-lime/50 via-line-strong to-transparent" />
        {rt.sessions.map((x, k) => (
          <li key={x.date} className="relative flex gap-3 pb-4 last:pb-0">
            <span
              className={cn(
                "relative z-[1] grid size-[31px] shrink-0 place-items-center rounded-full text-[12px] font-extrabold",
                x.live ? "bg-lime text-lime-ink shadow-[0_0_16px_-2px_rgb(181_245_74/0.7)]" : "bg-surface-3 text-fg-2 ring-1 ring-line-strong",
              )}
            >
              {x.day.key}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[13px] font-bold text-fg">
                  {x.day.name}
                  {x.live && <span className="ml-2 text-[11px] font-extrabold uppercase tracking-wider text-lime">En curso</span>}
                </p>
                <span className="shrink-0 text-[11px] font-semibold text-faint tabular">
                  {x.when} · {x.time}
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-muted tabular">
                {x.minutes} min · {x.sets} series{x.volume ? ` · ${fmt(x.volume)} kg` : ""} · RPE {x.rpe}
              </p>
              {x.pr && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-amber/10 px-2 py-0.5 text-[11px] font-bold text-amber">
                  <Trophy className="size-3" /> Nuevo récord · {x.pr}
                </p>
              )}
              {x.note && k > 0 && <p className="mt-1.5 rounded-lg rounded-tl-sm border border-line bg-white/[0.025] px-2.5 py-1.5 text-[11.5px] leading-snug text-fg-2">“{x.note}”</p>}
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
