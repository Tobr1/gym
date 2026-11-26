"use client";

import { motion } from "motion/react";
import { BookmarkCheck, Flame, Layers, Timer, UserPlus, Weight } from "lucide-react";
import { Avatar, AvatarStack, Button, Ring } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { ASSIGNED, MUSCLES, MUSCLE_COLOR, MUSCLE_TARGET, type Muscle } from "./data";

export type Stats = {
  minutes: number;
  sets: number;
  exercises: number;
  tonnage: number;
  rpe: number;
  weekly: Record<Muscle, number>;
  weeklySets: number;
  weeklyMinutes: number;
};

const SCALE = 24; // series máximas representadas en la barra

export function Summary({
  stats,
  dayLabel,
  onAssign,
  onSave,
}: {
  stats: Stats;
  dayLabel: string;
  onAssign: () => void;
  onSave: () => void;
}) {
  return (
    <div className="grid gap-4 md:max-xl:grid-cols-2">
      {/* Resumen del día */}
      <article className="panel glow-lime overflow-hidden p-5 md:max-xl:col-span-2">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-fg-2">Resumen · {dayLabel}</p>
          <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-muted">
            Estimado
          </span>
        </div>
        <div className="md:max-xl:mt-1 md:max-xl:flex md:max-xl:items-center md:max-xl:gap-8">
        <div className="mt-4 flex items-center gap-4 md:max-xl:mt-0 md:max-xl:flex-1 md:max-xl:gap-6">
          <Ring value={Math.min(100, (stats.minutes / 75) * 100)} size={96} stroke={10} className="shrink-0">
            <div>
              <p className="text-[28px] font-extrabold leading-none tracking-tight text-fg tabular">{stats.minutes}</p>
              <p className="mt-1 text-[10.5px] font-semibold text-muted">min</p>
            </div>
          </Ring>
          <dl className="grid flex-1 grid-cols-2 gap-x-3 gap-y-3 md:max-xl:grid-cols-4 md:max-xl:gap-x-5">
            {[
              { k: "Series", v: stats.sets, icon: Layers },
              { k: "Ejercicios", v: stats.exercises, icon: Timer },
              { k: "Tonelaje", v: `${(stats.tonnage / 1000).toLocaleString("es-AR", { maximumFractionDigits: 1 })} t`, icon: Weight },
              { k: "RPE", v: stats.rpe.toLocaleString("es-AR", { maximumFractionDigits: 1 }), icon: Flame },
            ].map((s) => (
              <div key={s.k}>
                <dt className="flex items-center gap-1 text-[11px] font-semibold text-muted">
                  <s.icon className="size-3" />
                  {s.k}
                </dt>
                <dd className="mt-0.5 text-[19px] font-extrabold leading-none tracking-tight text-fg tabular">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        {/* Mobile: apilados · sm: dos columnas · tablet: columna a la derecha · desktop (columna angosta): apilados */}
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:max-xl:mt-0 md:max-xl:w-[210px] md:max-xl:shrink-0 md:max-xl:grid-cols-1 xl:grid-cols-1">
          <Button onClick={onAssign} className="w-full">
            <UserPlus className="size-4" strokeWidth={2.4} /> Asignar a socio
          </Button>
          <Button onClick={onSave} variant="secondary" className="w-full">
            <BookmarkCheck className="size-4" /> Guardar plantilla
          </Button>
        </div>
        </div>
      </article>

      {/* Volumen semanal por músculo */}
      <article className="panel p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">Volumen semanal</h3>
            <p className="mt-0.5 text-[12.5px] text-muted">Series efectivas por grupo muscular</p>
          </div>
          <div className="text-right">
            <p className="text-[22px] font-extrabold leading-none tracking-tight text-fg tabular">{stats.weeklySets}</p>
            <p className="mt-1 whitespace-nowrap text-[10.5px] font-semibold text-muted">series / sem</p>
          </div>
        </div>
        <ul className="mt-4 space-y-3">
          {MUSCLES.map((m) => {
            const v = stats.weekly[m];
            const [lo, hi] = MUSCLE_TARGET[m];
            const ok = v >= lo && v <= hi;
            const c = MUSCLE_COLOR[m];
            return (
              <li key={m}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-fg-2">{m}</span>
                  <span className={cn("font-bold tabular", ok ? "text-fg" : v < lo ? "text-amber" : "text-rose")}>
                    {v.toLocaleString("es-AR", { maximumFractionDigits: 1 })}
                    <span className="font-semibold text-faint"> / {lo}–{hi}</span>
                  </span>
                </div>
                <div className="relative h-2 rounded-full bg-white/[0.05]">
                  {/* rango óptimo */}
                  <span
                    className="absolute inset-y-[-3px] rounded-[4px] border border-dashed border-white/15 bg-white/[0.03]"
                    style={{ left: `${(lo / SCALE) * 100}%`, width: `${((hi - lo) / SCALE) * 100}%` }}
                  />
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: c, boxShadow: `0 0 14px -2px ${c}` }}
                    initial={false}
                    animate={{ width: `${Math.min(100, (v / SCALE) * 100)}%` }}
                    transition={{ type: "spring", stiffness: 140, damping: 22 }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex items-center gap-3 border-t border-line pt-3 text-[11px] font-semibold text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-[3px] border border-dashed border-white/25 bg-white/[0.04]" /> Rango óptimo
          </span>
          <span className="ml-auto tabular">~{stats.weeklyMinutes} min / semana</span>
        </div>
      </article>

      {/* Socios asignados */}
      <article className="panel p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">Socios asignados</h3>
            <p className="mt-0.5 text-[12.5px] text-muted">Adherencia de las últimas 4 semanas</p>
          </div>
          <AvatarStack ids={ASSIGNED.map((a) => a.face).slice(0, 3)} size={26} extra={9} />
        </div>
        <ul className="mt-4 space-y-3">
          {ASSIGNED.map((a) => (
            <li key={a.name} className="flex items-center gap-3">
              <Avatar i={a.face} size={32} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="truncate font-bold text-fg">{a.name}</span>
                  <span className="font-bold text-fg-2 tabular">{a.adherence}%</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={cn("h-full rounded-full", a.adherence > 85 ? "bg-lime" : a.adherence > 75 ? "bg-cyan" : "bg-amber")}
                      style={{ width: `${a.adherence}%` }}
                    />
                  </div>
                  <span className="text-[10.5px] font-semibold text-muted">Sem {a.week}/6</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
