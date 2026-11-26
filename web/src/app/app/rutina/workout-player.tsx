"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check, ChevronDown, Dumbbell, Flame, Medal, Minus, Plus, Repeat, SkipForward, Timer, Trophy } from "lucide-react";
import { Avatar, Ring } from "@/components/ui/primitives";
import { cn, fmt } from "@/lib/utils";
import { fmtRest, type Item } from "@/app/admin/rutinas/_components/data";
import { AppHeader, si } from "../perfil/_kit/header";
import { Sheet } from "../perfil/_kit/overlay";
import {
  BLOCKS,
  BLOCK_META,
  EX_BY_ID,
  ITEMS,
  PROGRAM,
  TODAY_DAY,
  initialLogs,
  kgFmt,
  mmss,
  prevKg,
  unitOf,
  type SetLog,
} from "./_data";

type Rest = { left: number; total: number; name: string };

const FEEL = ["Liviano", "Moderado", "Exigente", "Muy duro", "Al límite"];

export function WorkoutPlayer() {
  const [logs, setLogs] = useState<Record<string, SetLog[]>>(initialLogs);
  const [open, setOpen] = useState<string | null>(ITEMS.find((i) => i.exId === "banca")!.uid);
  // la sesión arrancó 08:28 (ingreso por molinete); el descanso del press está corriendo
  const [elapsed, setElapsed] = useState(24 * 60 + 13);
  const [rest, setRest] = useState<Rest | null>({ left: 108, total: 150, name: "Press de banca plano" });
  const [summary, setSummary] = useState(false);
  const [finished, setFinished] = useState(false);
  const [feel, setFeel] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  // bloques completos se pliegan en una fila resumen; el socio puede volver a abrirlos
  const [peek, setPeek] = useState<string[]>([]);

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      setRest((r) => (r && r.left > 1 ? { ...r, left: r.left - 1 } : null));
    }, 1000);
    return () => clearInterval(t);
  }, [finished]);

  const all = Object.values(logs).flat();
  const done = all.filter((s) => s.done).length;
  const pct = Math.round((done / all.length) * 100);
  const volume = all.reduce((a, s) => a + (s.done ? s.kg * s.reps : 0), 0);
  const benchBest = Math.max(...logs[ITEMS.find((i) => i.exId === "banca")!.uid].filter((s) => s.done).map((s) => s.kg), 0);

  const update = (uid: string, k: number, patch: Partial<SetLog>) =>
    setLogs((l) => ({ ...l, [uid]: l[uid].map((s, j) => (j === k ? { ...s, ...patch } : s)) }));

  const toggle = (it: Item, k: number) => {
    const was = logs[it.uid][k].done;
    update(it.uid, k, { done: !was });
    if (!was) {
      const left = logs[it.uid].filter((s, j) => !s.done && j !== k).length;
      if (it.rest > 0) setRest({ left: it.rest, total: it.rest, name: EX_BY_ID[it.exId].name });
      if (left === 0) {
        // ejercicio completo: abrir el siguiente pendiente
        const next = ITEMS.find((x) => x.uid !== it.uid && logs[x.uid].some((s) => !s.done));
        setTimeout(() => setOpen(next?.uid ?? null), 450);
      }
    }
  };

  const closeSummary = useCallback(() => setSummary(false), []);
  const finish = () => {
    setFinished(true);
    setRest(null);
    setSummary(true);
  };

  const minutes = Math.round(elapsed / 60);

  return (
    <div className="px-5 pb-4 pt-5 md:pt-1">
      <AppHeader title="Rutina de hoy" sub={`${PROGRAM.name} · semana ${PROGRAM.week}`} />

      {/* portada */}
      <section className="stagger relative mt-5 h-[236px] overflow-hidden rounded-[30px]" style={si(1)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={TODAY_DAY.photo.replace("h=300", "h=520")} alt="" className="photo-grade absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/15" />
        <div className="relative flex h-full flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="rounded-full bg-lime px-2.5 py-1 text-[11.5px] font-extrabold text-lime-ink">{TODAY_DAY.name}</span>
              <span className="rounded-full bg-black/45 px-2.5 py-1 text-[11.5px] font-bold text-white backdrop-blur">
                Semana {PROGRAM.week}/{PROGRAM.weeks}
              </span>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11.5px] font-bold text-white backdrop-blur tabular">
              <span className={cn("size-1.5 rounded-full", finished ? "bg-white/50" : "bg-lime animate-pulse")} />
              {mmss(elapsed)}
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime">
                {TODAY_DAY.focus} · {ITEMS.length} ejercicios
              </p>
              <h2 className="mt-1 text-[30px] font-extrabold leading-[0.95] tracking-[-0.04em] text-white">
                Pecho y
                <br />
                hombros
              </h2>
              <div className="mt-3 flex items-center gap-2">
                <Avatar i={PROGRAM.coach.face} size={26} className="ring-2 ring-black/40" />
                <p className="text-[12px] font-semibold text-white/75">Plan de {PROGRAM.coach.name}</p>
              </div>
            </div>
            <Ring value={pct} size={86} stroke={9} track="rgb(255 255 255 / 0.14)">
              <p className="text-[20px] font-extrabold leading-none text-white tabular">
                {pct}
                <span className="text-[11px]">%</span>
              </p>
            </Ring>
          </div>
        </div>
      </section>

      {/* métricas en vivo */}
      <section className="stagger mt-3 grid grid-cols-3 gap-2.5" style={si(2)}>
        {[
          { icon: Repeat, v: `${done}/${all.length}`, l: "series" },
          { icon: Dumbbell, v: fmt(volume), l: "kg de volumen" },
          { icon: Flame, v: fmt(Math.round(minutes * 7.4)), l: "kcal aprox." },
        ].map((k) => (
          <div key={k.l} className="rounded-[20px] bg-surface p-3.5">
            <k.icon className="size-[18px] text-lime" />
            <p className="mt-2 text-[19px] font-extrabold leading-none text-fg tabular">{k.v}</p>
            <p className="mt-1 text-[11px] font-semibold text-muted">{k.l}</p>
          </div>
        ))}
      </section>

      {/* bloques */}
      <div className="stagger mt-6 space-y-5" style={si(3)}>
        {BLOCKS.map((b) => {
          const meta = BLOCK_META[b.kind];
          const blockDone = b.items.every((it) => logs[it.uid].every((s) => s.done));
          const collapsed = blockDone && !peek.includes(b.id);
          const togglePeek = () => setPeek((p) => (p.includes(b.id) ? p.filter((x) => x !== b.id) : [...p, b.id]));
          return (
            <section key={b.id}>
              <div className="flex items-center gap-2 px-1">
                <span className="h-3.5 w-1 rounded-full" style={{ background: meta.color }} />
                <h3 className="text-[15px] font-extrabold tracking-[-0.01em] text-fg">{meta.label}</h3>
                <span className="truncate text-[12px] font-medium text-muted">· {meta.tag}</span>
                {blockDone && !collapsed && (
                  <button onClick={togglePeek} className="ml-auto shrink-0 text-[12px] font-bold text-muted hover:text-fg">
                    Contraer
                  </button>
                )}
              </div>
              {collapsed ? (
                <button
                  onClick={togglePeek}
                  className="mt-2.5 flex w-full items-center gap-3 rounded-[24px] bg-surface p-2.5 pr-3.5 text-left transition hover:bg-surface-2"
                >
                  <span className="flex shrink-0">
                    {b.items.map((it, k) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={it.uid}
                        src={EX_BY_ID[it.exId].photo}
                        alt=""
                        className={cn("photo-grade size-11 rounded-[14px] object-cover ring-[3px] ring-surface", k > 0 && "-ml-3")}
                      />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-extrabold text-fg">
                      {b.items.length} {b.items.length === 1 ? "ejercicio completo" : "ejercicios completos"}
                    </span>
                    <span className="block truncate text-[12px] font-medium text-muted">
                      {b.items.map((it) => EX_BY_ID[it.exId].name).join(" · ")}
                    </span>
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime text-lime-ink shadow-[0_0_18px_-4px_rgb(181_245_74/0.7)]">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                </button>
              ) : (
              <div className={cn("mt-2.5 space-y-2", b.kind === "superset" && "relative pl-3.5")}>
                {b.kind === "superset" && <span className="absolute bottom-6 left-0 top-6 w-0.5 rounded-full bg-violet/50" />}
                {b.items.map((it) => (
                  <ExerciseCard
                    key={it.uid}
                    it={it}
                    sets={logs[it.uid]}
                    open={open === it.uid}
                    onOpen={() => setOpen(open === it.uid ? null : it.uid)}
                    onToggle={(k) => toggle(it, k)}
                    onChange={(k, p) => update(it.uid, k, p)}
                  />
                ))}
              </div>
              )}
            </section>
          );
        })}
      </div>

      {/* descanso (flota sobre la barra de pestañas) */}
      {rest && (
        <div className="sticky bottom-[100px] z-30 mt-4 animate-[fade-up_.4s_cubic-bezier(.22,1,.36,1)_both]">
          <div className="flex items-center gap-3 rounded-[24px] border border-lime/30 bg-[#1a2433] p-2.5 pr-3 shadow-[0_24px_50px_-14px_rgb(0_0_0/0.9)]">
            <Ring value={(rest.left / rest.total) * 100} size={50} stroke={5}>
              <Timer className="size-4 text-lime" />
            </Ring>
            <div className="min-w-0 flex-1">
              <p className="flex items-baseline gap-1.5 text-[22px] font-extrabold leading-none tracking-[-0.02em] text-fg tabular">
                {mmss(rest.left)}
                <span className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-lime">Descanso</span>
              </p>
              <p className="mt-1 truncate text-[11.5px] font-semibold text-muted">{rest.name}</p>
            </div>
            <button
              onClick={() => setRest((r) => r && { ...r, left: r.left + 15, total: Math.max(r.total, r.left + 15) })}
              className="h-10 rounded-full bg-white/[0.07] px-3 text-[12.5px] font-extrabold text-fg active:scale-95"
            >
              +15 s
            </button>
            <button onClick={() => setRest(null)} className="grid size-10 place-items-center rounded-full bg-lime text-lime-ink active:scale-95" aria-label="Saltar descanso">
              <SkipForward className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* cierre */}
      <section className="stagger mt-6" style={si(4)}>
        <button
          onClick={finish}
          disabled={finished}
          className="flex h-[58px] w-full items-center justify-center gap-2 rounded-full bg-lime text-[16px] font-extrabold text-lime-ink shadow-[0_14px_40px_-12px_rgb(181_245_74/0.7)] transition hover:bg-[#c4fa66] active:scale-[0.98] disabled:bg-white/[0.08] disabled:text-muted disabled:shadow-none"
        >
          {finished ? (
            <>
              <Check className="size-5" strokeWidth={3} /> Entrenamiento registrado
            </>
          ) : (
            <>
              <Trophy className="size-5" /> Finalizar entrenamiento
            </>
          )}
        </button>
        {!finished && (
          <p className="mt-2.5 text-center text-[12px] font-medium text-muted">
            {all.length - done > 0 ? `Te quedan ${all.length - done} series · podés cerrar la sesión igual` : "¡Completaste todas las series!"}
          </p>
        )}
      </section>

      {/* resumen */}
      <Sheet open={summary} onClose={closeSummary} label="Resumen del entrenamiento">
        <div className="text-center">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-lime">{pct === 100 ? "Entrenamiento completado" : "Sesión finalizada"}</p>
          <p className="mt-1 text-[24px] font-extrabold tracking-[-0.03em] text-fg">¡Bien ahí, Martín!</p>
        </div>
        <div className="mt-5 flex items-center gap-4 rounded-[24px] bg-ink-2 p-4">
          <Ring value={pct} size={96} stroke={10}>
            <p className="text-[22px] font-extrabold leading-none text-fg tabular">
              {pct}
              <span className="text-[12px]">%</span>
            </p>
          </Ring>
          <dl className="grid flex-1 grid-cols-2 gap-x-3 gap-y-3">
            {[
              ["Duración", `${minutes} min`],
              ["Series", `${done}/${all.length}`],
              ["Volumen", `${fmt(volume)} kg`],
              ["Calorías", `${fmt(Math.round(minutes * 7.4))} kcal`],
            ].map(([l, v]) => (
              <div key={l}>
                <dt className="text-[11px] font-semibold text-muted">{l}</dt>
                <dd className="text-[16px] font-extrabold text-fg tabular">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="flex flex-col items-start gap-2.5 rounded-[20px] border border-lime/25 bg-lime/[0.07] p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-lime text-lime-ink">
              <Flame className="size-5" />
            </span>
            <div className="w-full min-w-0 text-left">
              <p className="text-[13px] font-extrabold text-fg">Racha de 13 días</p>
              <p className="truncate text-[11px] text-muted">Tu mejor marca</p>
            </div>
          </div>
          <div className={cn("flex flex-col items-start gap-2.5 rounded-[20px] border p-3", benchBest > 80 ? "border-amber/30 bg-amber/[0.07]" : "border-line bg-white/[0.03]")}>
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", benchBest > 80 ? "bg-amber text-lime-ink" : "bg-white/[0.06] text-muted")}>
              <Medal className="size-5" />
            </span>
            <div className="w-full min-w-0 text-left">
              <p className="text-[13px] font-extrabold text-fg">{benchBest > 80 ? "Nuevo récord" : "Press de banca"}</p>
              <p className="truncate text-[11px] text-muted">{benchBest > 0 ? `${kgFmt(benchBest)} kg · máx. de hoy` : "Sin series hoy"}</p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-[14px] font-extrabold text-fg">¿Cómo te sentiste?</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {FEEL.map((f, i) => (
            <button
              key={f}
              onClick={() => setFeel(i)}
              className={cn(
                "h-10 rounded-full px-4 text-[13px] font-bold transition-all",
                feel === i ? "bg-lime text-lime-ink" : "bg-white/[0.06] text-fg hover:bg-white/10",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-muted">{PROGRAM.coach.name} usa tu respuesta para ajustar las cargas de la semana que viene.</p>

        {saved ? (
          <Link
            href="/app"
            className="mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-white/[0.08] text-[15px] font-extrabold text-fg ring-1 ring-lime/30"
          >
            <Check className="size-5 text-lime" strokeWidth={3} /> Guardado · volver al inicio
          </Link>
        ) : (
          <button
            onClick={() => setSaved(true)}
            className="mt-5 h-[54px] w-full rounded-full bg-lime text-[15px] font-extrabold text-lime-ink shadow-[0_14px_40px_-12px_rgb(181_245_74/0.7)] active:scale-[0.98]"
          >
            Guardar entrenamiento
          </button>
        )}
      </Sheet>
    </div>
  );
}

function ExerciseCard({
  it,
  sets,
  open,
  onOpen,
  onToggle,
  onChange,
}: {
  it: Item;
  sets: SetLog[];
  open: boolean;
  onOpen: () => void;
  onToggle: (k: number) => void;
  onChange: (k: number, p: Partial<SetLog>) => void;
}) {
  const ex = EX_BY_ID[it.exId];
  const unit = unitOf(it);
  const done = sets.filter((s) => s.done).length;
  const complete = done === sets.length;
  const active = sets.findIndex((s) => !s.done);
  const weighted = it.kg > 0;
  const uLabel = unit === "reps" ? "reps" : unit;
  const step = unit === "reps" ? 1 : unit === "s" ? 5 : 1;

  return (
    <article className={cn("overflow-hidden rounded-[24px] bg-surface transition-all duration-300", open && "ring-1 ring-white/10")}>
      <button onClick={onOpen} aria-expanded={open} className="flex w-full items-center gap-3 p-2.5 pr-3.5 text-left">
        <span className="relative size-[60px] shrink-0 overflow-hidden rounded-[18px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ex.photo} alt="" className="photo-grade h-full w-full object-cover" />
          {complete && (
            <span className="absolute inset-0 grid place-items-center bg-lime/80 text-lime-ink">
              <Check className="size-6" strokeWidth={3} />
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("line-clamp-2 block text-[15px] font-extrabold leading-tight", complete ? "text-fg-2" : "text-fg")}>{ex.name}</span>
          <span className="mt-0.5 block truncate text-[12px] font-medium text-muted">
            {it.sets} × {it.reps}
            {weighted && ` · ${kgFmt(it.kg)} kg`}
            {it.rest > 0 && ` · pausa ${fmtRest(it.rest)}`}
          </span>
          {/* progreso por serie */}
          <span className="mt-2 flex gap-1">
            {sets.map((s, k) => (
              <span key={k} className={cn("h-1 flex-1 rounded-full transition-colors duration-300", s.done ? "bg-lime" : "bg-white/10")} />
            ))}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-center gap-1">
          <span className={cn("text-[12px] font-extrabold tabular", complete ? "text-lime" : "text-fg-2")}>
            {done}/{sets.length}
          </span>
          <ChevronDown className={cn("size-4 text-muted transition-transform duration-300", open && "rotate-180")} />
        </span>
      </button>

      <div className={cn("grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.22,1,.36,1)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden" inert={!open}>
          <div className="px-3 pb-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                it.tempo !== "—" && `Tempo ${it.tempo}`,
                `RPE ${it.rpe}`,
                ex.equipment,
                weighted && `Anterior ${kgFmt(prevKg(it))} kg`,
              ]
                .filter(Boolean)
                .map((t) => (
                  <span key={String(t)} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-fg-2">
                    {t}
                  </span>
                ))}
            </div>

            <div className="mt-3 space-y-1.5">
              {sets.map((s, k) => {
                const isActive = k === active;
                return (
                  <div
                    key={k}
                    className={cn(
                      "flex items-center gap-2 rounded-[18px] p-1.5 pl-2 transition-colors duration-300",
                      s.done ? "bg-lime/[0.08]" : isActive ? "bg-white/[0.05] ring-1 ring-white/10" : "bg-white/[0.02]",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-extrabold tabular",
                        s.done ? "text-lime" : isActive ? "bg-white/10 text-fg" : "text-muted",
                      )}
                    >
                      {k + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      {weighted && (
                        <>
                          <Stepper
                            value={kgFmt(s.kg)}
                            unit="kg"
                            editable={isActive}
                            onMinus={() => onChange(k, { kg: Math.max(0, s.kg - 2.5) })}
                            onPlus={() => onChange(k, { kg: s.kg + 2.5 })}
                          />
                          <span className="text-[12px] font-bold text-muted">×</span>
                        </>
                      )}
                      <Stepper
                        value={String(s.reps)}
                        unit={uLabel}
                        editable={isActive}
                        onMinus={() => onChange(k, { reps: Math.max(1, s.reps - step) })}
                        onPlus={() => onChange(k, { reps: s.reps + step })}
                      />
                    </div>
                    <button
                      onClick={() => onToggle(k)}
                      aria-pressed={s.done}
                      aria-label={s.done ? `Desmarcar serie ${k + 1}` : `Completar serie ${k + 1}`}
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full transition-all duration-300 active:scale-90",
                        s.done
                          ? "bg-lime text-lime-ink shadow-[0_0_20px_-4px_rgb(181_245_74/0.7)]"
                          : isActive
                            ? "bg-white/[0.08] text-fg ring-1 ring-lime/50"
                            : "bg-white/[0.05] text-muted",
                      )}
                    >
                      <Check className="size-[18px]" strokeWidth={3} />
                    </button>
                  </div>
                );
              })}
            </div>
            {it.reps === "AMRAP" && (
              <p className="mt-2 px-1 text-[11.5px] text-muted">AMRAP: registrá las repeticiones que lograste en cada serie.</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Stepper({
  value,
  unit,
  editable,
  onMinus,
  onPlus,
}: {
  value: string;
  unit: string;
  editable: boolean;
  onMinus: () => void;
  onPlus: () => void;
}) {
  if (!editable)
    return (
      <span className="flex h-9 min-w-0 flex-1 items-baseline justify-center gap-1 rounded-full px-2 pt-[9px] text-[14px] font-extrabold text-fg tabular">
        {value}
        <span className="text-[11px] font-semibold text-muted">{unit}</span>
      </span>
    );
  return (
    <span className="flex h-9 min-w-0 flex-1 items-center justify-between rounded-full bg-ink-2 ring-1 ring-white/10">
      <button onClick={onMinus} className="grid size-8 shrink-0 place-items-center rounded-full text-fg-2 hover:text-fg active:scale-90" aria-label={`Restar ${unit}`}>
        <Minus className="size-3.5" />
      </button>
      <span className="flex min-w-0 items-baseline gap-0.5 text-[14px] font-extrabold text-fg tabular">
        {value}
        <span className="text-[10.5px] font-semibold text-muted">{unit}</span>
      </span>
      <button onClick={onPlus} className="grid size-8 shrink-0 place-items-center rounded-full text-fg-2 hover:text-fg active:scale-90" aria-label={`Sumar ${unit}`}>
        <Plus className="size-3.5" />
      </button>
    </span>
  );
}
