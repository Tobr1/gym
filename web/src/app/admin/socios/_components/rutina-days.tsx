"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Link2, MessageSquareQuote, Timer } from "lucide-react";
import { BLOCK_META, fmtRest, MUSCLE_COLOR } from "../../rutinas/_components/data";
import { cn } from "@/lib/utils";
import type { RxDay, RxItem } from "../_lib/routine";

type DayState = { key: string; done: boolean; live: boolean };

/** Plan del socio: selector de día + bloques con la prescripción de cada ejercicio. */
export function RoutineDays({ days, states, initial }: { days: RxDay[]; states: DayState[]; initial: string }) {
  const [sel, setSel] = useState(initial);
  const day = days.find((d) => d.key === sel) ?? days[0];
  const sets = day.blocks.reduce((a, b) => a + b.items.reduce((x, i) => x + i.sets, 0), 0);
  const exercises = day.blocks.reduce((a, b) => a + b.items.length, 0);
  const st = states.find((x) => x.key === day.key);

  return (
    <div>
      {/* Selector de día */}
      <div className="grid grid-cols-3 gap-2 p-2 sm:gap-3 sm:p-3">
        {days.map((d) => {
          const on = d.key === sel;
          const s = states.find((x) => x.key === d.key);
          return (
            <button
              key={d.key}
              onClick={() => setSel(d.key)}
              aria-pressed={on}
              className={cn(
                "group flex min-w-0 flex-col items-start gap-2 rounded-xl border p-2.5 text-left transition-all duration-200 sm:flex-row sm:items-center sm:gap-2.5",
                on ? "border-lime/40 bg-lime/[0.07] shadow-[0_0_0_1px_rgb(181_245_74/0.12)_inset]" : "border-line bg-white/[0.02] hover:border-line-strong hover:bg-white/[0.04]",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg text-[14px] font-extrabold sm:size-9",
                  on ? "bg-lime text-lime-ink" : s?.done ? "bg-lime/15 text-lime" : "bg-white/[0.06] text-fg-2",
                )}
              >
                {s?.done && !on ? <Check className="size-4" strokeWidth={3} /> : d.key}
              </span>
              <span className="w-full min-w-0">
                <span className={cn("block text-[12.5px] font-bold leading-tight sm:truncate sm:text-[13px]", on ? "text-fg" : "text-fg-2")}>{d.name}</span>
                <span className={cn("mt-0.5 block truncate text-[11px] font-semibold", s?.live ? "text-lime" : "text-muted")}>
                  {s?.live ? "Hoy · en curso" : s?.done ? <><span className="sm:hidden">Hecho</span><span className="hidden sm:inline">Hecho esta semana</span></> : `${d.minutes} min`}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Portada del día */}
      <div className="relative mx-2 overflow-hidden rounded-2xl sm:mx-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={day.photo} src={day.photo} alt="" className="photo-grade h-[150px] w-full object-cover object-center animate-fade-in sm:h-[150px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/70 to-ink/10" />
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-lime">Día {day.key}</p>
          <p className="text-[22px] font-extrabold leading-tight tracking-[-0.03em] text-fg sm:text-[26px]">{day.name}</p>
          <p className="mt-0.5 text-[12.5px] font-semibold text-fg-2">{day.focus}</p>
          <p className="mt-1 text-[11.5px] font-semibold text-muted tabular sm:hidden">
            {exercises} ejercicios · {sets} series · {day.minutes} min
          </p>
        </div>
        <dl className="absolute right-4 top-4 hidden gap-1.5 sm:flex">
          {[
            { l: "ejercicios", v: exercises },
            { l: "series", v: sets },
            { l: "min", v: day.minutes },
          ].map((k) => (
            <div key={k.l} className="rounded-lg border border-white/10 bg-ink/70 px-2 py-1 text-center backdrop-blur">
              <dd className="text-[14px] font-extrabold leading-none text-fg tabular">{k.v}</dd>
              <dt className="mt-0.5 text-[9.5px] font-bold uppercase tracking-wider text-muted">{k.l}</dt>
            </div>
          ))}
        </dl>
        {st?.live && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-lime px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-lime-ink sm:left-5">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime-ink/60" />
              <span className="relative size-1.5 rounded-full bg-lime-ink" />
            </span>
            Entrenando ahora
          </span>
        )}
      </div>

      {/* Bloques */}
      <div key={day.key} className="space-y-5 p-4 sm:p-5">
        {day.blocks.map((b, bi) => {
          const meta = BLOCK_META[b.kind];
          const linked = b.kind === "superset" && b.items.length > 1;
          return (
            <section key={bi} className="stagger" style={{ "--i": bi } as React.CSSProperties}>
              <header className="mb-2 flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: meta.color, boxShadow: `0 0 10px ${meta.color}` }} />
                <h4 className="text-[12.5px] font-extrabold uppercase tracking-[0.1em] text-fg">{meta.label}</h4>
                <span className="truncate text-[11.5px] font-semibold text-muted">· {meta.tag}</span>
                {linked && <Link2 className="ml-auto size-3.5 shrink-0" style={{ color: meta.color }} />}
              </header>
              <ol className={cn("relative space-y-1.5", linked && "pl-3.5")}>
                {linked && <span className="absolute bottom-6 left-0 top-6 w-[2px] rounded-full" style={{ background: meta.color, opacity: 0.55 }} />}
                {b.items.map((it, k) => (
                  <ExerciseRow key={k} it={it} code={`${String.fromCharCode(65 + bi)}${k + 1}`} />
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}

const TREND = {
  up: { icon: ArrowUpRight, cls: "text-lime" },
  same: { icon: ArrowRight, cls: "text-muted" },
  down: { icon: ArrowDownRight, cls: "text-rose" },
} as const;

function ExerciseRow({ it, code }: { it: RxItem; code: string }) {
  const t = it.trend ? TREND[it.trend] : null;
  return (
    <li className="group flex gap-3 rounded-xl border border-line bg-white/[0.02] p-2.5 transition hover:-translate-y-px hover:border-line-strong hover:bg-white/[0.035] sm:items-center sm:p-3">
      <div className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={it.photo} alt="" className="photo-grade size-14 rounded-lg object-cover sm:size-[60px]" />
        <span className="absolute -bottom-1 -left-1 rounded-md bg-ink px-1 text-[9.5px] font-extrabold text-fg-2 ring-1 ring-line-strong">{code}</span>
      </div>
      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-bold text-fg">{it.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11.5px] font-semibold text-muted">
            <span className="size-1.5 shrink-0 rounded-full" style={{ background: MUSCLE_COLOR[it.muscle] }} />
            {it.muscle} · {it.equipment}
          </p>
          {it.cue && (
            <p className="mt-1 flex items-start gap-1.5 text-[11.5px] font-semibold leading-snug text-amber/90">
              <MessageSquareQuote className="mt-px size-3 shrink-0" /> {it.cue}
            </p>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-3 gap-y-0.5 sm:mt-0 sm:block sm:shrink-0 sm:text-right">
          <p className="whitespace-nowrap text-[16px] font-extrabold tracking-tight text-fg tabular">
            {it.sets}
            <span className="mx-1 text-[13px] font-bold text-muted">×</span>
            {it.reps}
            <span className="ml-1.5 text-[13px] font-bold text-lime">{it.load}</span>
          </p>
          <p className="flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-muted sm:justify-end">
            <Timer className="size-3" /> {it.rest ? fmtRest(it.rest) : "sin pausa"} · RPE {it.rpe}
          </p>
        </div>
      </div>
      {it.last && t && (
        <div className="hidden w-[150px] shrink-0 border-l border-line pl-3 lg:block">
          <p className="text-[9.5px] font-bold uppercase tracking-wider text-faint">Última sesión</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] font-bold text-fg-2 tabular">
            <t.icon className={cn("size-3.5 shrink-0", t.cls)} strokeWidth={2.6} />
            {it.last}
          </p>
        </div>
      )}
    </li>
  );
}
