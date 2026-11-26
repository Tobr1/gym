"use client";

import { Check, Plus, Search, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EXERCISES, MUSCLES, MUSCLE_COLOR, type Exercise, type Muscle } from "./data";

export function MuscleTag({ muscle, className }: { muscle: Muscle; className?: string }) {
  const c = MUSCLE_COLOR[muscle];
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold leading-none", className)}
      style={{ color: c, background: `color-mix(in oklab, ${c} 13%, transparent)` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: c }} />
      {muscle}
    </span>
  );
}

export function Library({
  query,
  setQuery,
  muscle,
  setMuscle,
  onAdd,
  inDay,
  targetLabel,
}: {
  query: string;
  setQuery: (q: string) => void;
  muscle: Muscle | "Todos";
  setMuscle: (m: Muscle | "Todos") => void;
  onAdd: (id: string) => void;
  inDay: Record<string, number>;
  targetLabel: string;
}) {
  const q = query.trim().toLowerCase();
  const list = EXERCISES.filter(
    (e) =>
      (muscle === "Todos" || e.muscle === muscle || e.secondary === muscle) &&
      (!q || e.name.toLowerCase().includes(q) || e.equipment.toLowerCase().includes(q)),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 pb-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">Biblioteca</h3>
          <span className="text-[11.5px] font-semibold text-muted tabular">{EXERCISES.length} ejercicios</span>
        </div>
        <label className="mt-3 flex h-10 items-center gap-2 rounded-xl border border-line bg-ink/50 px-3 text-muted transition focus-within:border-lime/40">
          <Search className="size-4 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ejercicio o equipo"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-fg placeholder:text-muted focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Limpiar búsqueda" className="text-muted hover:text-fg">
              <X className="size-3.5" />
            </button>
          )}
        </label>
        <div className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 no-scrollbar min-[87.5rem]:mx-0 min-[87.5rem]:flex-wrap min-[87.5rem]:px-0">
          {(["Todos", ...MUSCLES] as const).map((m) => {
            const on = muscle === m;
            return (
              <button
                key={m}
                onClick={() => setMuscle(m)}
                className={cn(
                  "h-7 shrink-0 rounded-full px-3 text-[12px] font-semibold transition-all",
                  on ? "bg-lime text-lime-ink shadow-[0_6px_20px_-8px_rgb(181_245_74/0.8)]" : "bg-white/[0.04] text-fg-2 ring-1 ring-inset ring-line hover:bg-white/[0.08]",
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-dashed border-lime/25 bg-lime/[0.04] px-2.5 py-1.5 text-[11.5px] leading-snug text-fg-2">
          <Target className="mt-px size-3.5 shrink-0 text-lime" />
          <span className="line-clamp-2 min-w-0">
            Tocá <b className="text-lime">+</b> para sumar a <b className="text-fg">{targetLabel}</b>
          </span>
        </div>
      </div>

      {/* Mobile / tablet: carrusel de tarjetas con foto */}
      <div className="-mt-1 flex snap-x gap-3 overflow-x-auto px-4 pb-4 no-scrollbar min-[87.5rem]:hidden">
        {list.map((e) => (
          <PhotoCard key={e.id} e={e} count={inDay[e.id] ?? 0} onAdd={() => onAdd(e.id)} />
        ))}
      </div>

      {/* Desktop: lista densa */}
      <div className="relative hidden min-h-[420px] flex-1 min-[87.5rem]:block">
      <ul className="absolute inset-0 space-y-2 overflow-y-auto px-3 pb-12 [mask-image:linear-gradient(to_bottom,#000_calc(100%-64px),transparent)]">
        {list.map((e) => (
          <li key={e.id}>
            <ExerciseRow e={e} count={inDay[e.id] ?? 0} onAdd={() => onAdd(e.id)} />
          </li>
        ))}
        {list.length === 0 && (
          <li className="rounded-xl border border-dashed border-line p-6 text-center text-[12.5px] text-muted">
            Sin resultados. Probá con otro grupo muscular.
          </li>
        )}
      </ul>
      </div>
    </div>
  );
}

function ExerciseRow({ e, count, onAdd }: { e: Exercise; count: number; onAdd: () => void }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:bg-white/[0.04]">
      <div className="relative size-[58px] shrink-0 overflow-hidden rounded-[10px] bg-surface-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={e.photo} alt="" loading="lazy" className="photo-grade size-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
        {count > 0 && (
          <span className="absolute left-1 top-1 grid size-4 place-items-center rounded-full bg-lime text-lime-ink">
            <Check className="size-2.5" strokeWidth={3.5} />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[13px] font-bold leading-[1.2] text-fg">{e.name}</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <MuscleTag muscle={e.muscle} />
          <span className="truncate text-[11px] font-medium text-muted">{e.equipment}</span>
        </div>
      </div>
      <button
        onClick={onAdd}
        aria-label={`Agregar ${e.name}`}
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-fg-2 ring-1 ring-inset ring-line transition-all hover:scale-105 group-hover:bg-lime group-hover:text-lime-ink group-hover:ring-lime active:scale-95"
      >
        <Plus className="size-4" strokeWidth={2.6} />
      </button>
    </div>
  );
}

function PhotoCard({ e, count, onAdd }: { e: Exercise; count: number; onAdd: () => void }) {
  return (
    <div className="relative h-52 w-40 shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-surface-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={e.photo} alt="" loading="lazy" className="photo-grade absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/10" />
      <div className="absolute left-2 right-2 top-2 flex items-center gap-1">
        <span className="rounded-full bg-ink/60 px-2 py-1 text-[10px] font-bold text-fg backdrop-blur">{e.equipment}</span>
        {count > 0 && (
          <span className="ml-auto grid size-5 place-items-center rounded-full bg-lime text-lime-ink">
            <Check className="size-3" strokeWidth={3.5} />
          </span>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3">
        <MuscleTag muscle={e.muscle} className="bg-ink/60 backdrop-blur" />
        <p className="mt-1.5 line-clamp-2 text-[13px] font-bold leading-tight text-fg">{e.name}</p>
        <button
          onClick={onAdd}
          className="mt-2 flex h-8 w-full items-center justify-center gap-1 rounded-full bg-lime text-[12px] font-bold text-lime-ink active:scale-95"
        >
          <Plus className="size-3.5" strokeWidth={2.8} /> Agregar
        </button>
      </div>
    </div>
  );
}
