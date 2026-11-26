"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, Reorder, motion, useDragControls } from "motion/react";
import { CheckCircle2, ChevronDown, GripVertical, Link2, Plus, Sparkles, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import {
  BLOCK_META,
  DAYS,
  EX_BY_ID,
  INITIAL,
  MUSCLES,
  REST_OPTIONS,
  avgReps,
  daySeconds,
  fmtRest,
  type Block,
  type BlockKind,
  type DayId,
  type Item,
  type Muscle,
} from "./data";
import { Library, MuscleTag } from "./library";
import { Summary, type Stats } from "./summary";

const LETTERS = "ABCDEFGH";
let uidSeq = 1000;

export function RoutineBuilder() {
  const [days, setDays] = useState(INITIAL);
  const [day, setDay] = useState<DayId>("A");
  const [target, setTarget] = useState<Record<DayId, string>>({ A: "A-m", B: "B-m", C: "C-m" });
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<Muscle | "Todos">("Todos");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  const blocks = days[day];
  const targetBlock = blocks.find((b) => b.id === target[day]) ?? blocks[0];

  const toastTimer = useRef<number | undefined>(undefined);
  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  const updateBlocks = (fn: (b: Block[]) => Block[]) => setDays((d) => ({ ...d, [day]: fn(d[day]) }));
  const updateItems = (blockId: string, fn: (items: Item[]) => Item[]) =>
    updateBlocks((bs) => bs.map((b) => (b.id === blockId ? { ...b, items: fn(b.items) } : b)));

  const addExercise = (exId: string) => {
    if (!targetBlock) return;
    const ex = EX_BY_ID[exId];
    const core = targetBlock.kind === "core" || targetBlock.kind === "warmup";
    updateItems(targetBlock.id, (items) => [
      ...items,
      { uid: `n${++uidSeq}`, exId, sets: 3, reps: core ? "12" : "8-10", kg: 0, rest: targetBlock.kind === "superset" ? 0 : 90, rpe: 7, tempo: "2-0-1-0" },
    ]);
    setCollapsed((c) => ({ ...c, [targetBlock.id]: false }));
    flash(`${ex.name} → ${BLOCK_META[targetBlock.kind].label}`);
  };

  const addBlock = (kind: BlockKind) => {
    const id = `${day}-${kind}-${++uidSeq}`;
    updateBlocks((bs) => [...bs, { id, kind, items: [] }]);
    setTarget((t) => ({ ...t, [day]: id }));
  };

  const inDay = useMemo(() => {
    const r: Record<string, number> = {};
    blocks.forEach((b) => b.items.forEach((i) => (r[i.exId] = (r[i.exId] ?? 0) + 1)));
    return r;
  }, [blocks]);

  const stats: Stats = useMemo(() => {
    const all = blocks.flatMap((b) => b.items);
    const weekly = Object.fromEntries(MUSCLES.map((m) => [m, 0])) as Record<Muscle, number>;
    let weeklySets = 0;
    let weeklySec = 0;
    (Object.keys(days) as DayId[]).forEach((d) => {
      weeklySec += daySeconds(days[d]);
      days[d].forEach((b) => {
        if (b.kind === "warmup") return;
        b.items.forEach((i) => {
          const ex = EX_BY_ID[i.exId];
          weekly[ex.muscle] += i.sets;
          if (ex.secondary) weekly[ex.secondary] += i.sets / 2;
          weeklySets += i.sets;
        });
      });
    });
    const rpeItems = all.filter((i) => i.rpe);
    return {
      minutes: Math.round(daySeconds(blocks) / 60),
      sets: all.reduce((a, i) => a + i.sets, 0),
      exercises: all.length,
      tonnage: all.reduce((a, i) => a + i.sets * avgReps(i.reps) * i.kg, 0),
      rpe: rpeItems.reduce((a, i) => a + i.rpe, 0) / (rpeItems.length || 1),
      weekly,
      weeklySets,
      weeklyMinutes: Math.round(weeklySec / 60),
    };
  }, [blocks, days]);

  const curDay = DAYS.find((d) => d.id === day)!;

  return (
    <>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_304px] min-[87.5rem]:grid-cols-[272px_minmax(0,1fr)_296px]">
        {/* ── Biblioteca ───────────────────────────── */}
        <aside className="panel stagger order-3 overflow-hidden xl:col-span-2 min-[87.5rem]:order-1 min-[87.5rem]:col-span-1 min-[87.5rem]:self-stretch" style={{ "--i": 3 } as React.CSSProperties}>
          <Library
            query={query}
            setQuery={setQuery}
            muscle={muscle}
            setMuscle={setMuscle}
            onAdd={addExercise}
            inDay={inDay}
            targetLabel={targetBlock ? `${BLOCK_META[targetBlock.kind].label} · ${curDay.name}` : curDay.name}
          />
        </aside>

        {/* ── Lienzo ───────────────────────────────── */}
        <section className="panel stagger order-1 min-w-0 overflow-hidden min-[87.5rem]:order-2" style={{ "--i": 1 } as React.CSSProperties}>
          {/* Cabecera de la rutina */}
          <div className="relative h-[148px] overflow-hidden sm:h-[136px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={curDay.photo}
                src={curDay.photo}
                alt=""
                className="photo-grade absolute inset-0 size-full object-cover"
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
            <div className="relative flex h-full flex-col justify-end gap-2 p-5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-lime px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-lime-ink">
                  Hipertrofia
                </span>
                {["Intermedio", "3 días / sem", "6 semanas"].map((t) => (
                  <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-[10.5px] font-bold text-fg backdrop-blur">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-[22px] font-extrabold leading-none tracking-[-0.03em] text-fg sm:text-[26px]">Full Power · PPL</h2>
                <div className="hidden items-center gap-2 sm:flex">
                  <Avatar i={3} size={28} ring />
                  <div className="leading-tight">
                    <p className="text-[12px] font-bold text-fg">Nico Paredes</p>
                    <p className="text-[10.5px] text-muted">Editado hace 2 min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs de días */}
          <div className="flex gap-2 overflow-x-auto border-b border-line px-4 pb-4 pt-1 no-scrollbar sm:px-5">
            {DAYS.map((d) => {
              const on = d.id === day;
              const mins = Math.round(daySeconds(days[d.id]) / 60);
              const n = days[d.id].reduce((a, b) => a + b.items.length, 0);
              return (
                <button
                  key={d.id}
                  onClick={() => setDay(d.id)}
                  className={cn(
                    "relative flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors sm:min-w-[136px]",
                    on ? "text-lime-ink" : "bg-white/[0.03] text-fg ring-1 ring-inset ring-line hover:bg-white/[0.06]",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="day-pill"
                      className="absolute inset-0 rounded-2xl bg-lime shadow-[0_10px_30px_-10px_rgb(181_245_74/0.8)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative hidden size-9 shrink-0 place-items-center rounded-xl text-[15px] font-extrabold sm:grid",
                      on ? "bg-lime-ink/90 text-lime" : "bg-white/[0.06] text-fg-2",
                    )}
                  >
                    {d.id}
                  </span>
                  <span className="relative min-w-0">
                    <span className="block truncate text-[13.5px] font-extrabold leading-tight">
                      <span className={cn("mr-1 sm:hidden", on ? "text-lime-ink/60" : "text-faint")}>{d.id}</span>
                      {d.focus}
                    </span>
                    <span className={cn("block text-[11px] font-semibold tabular", on ? "text-lime-ink/70" : "text-muted")}>
                      {n} ej · {mins} min
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bloques */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-3 p-3 sm:p-4"
            >
              {blocks.map((b, bi) => (
                <BlockCard
                  key={b.id}
                  block={b}
                  letter={LETTERS[bi]}
                  isTarget={targetBlock?.id === b.id}
                  collapsed={!!collapsed[b.id]}
                  onToggle={() => setCollapsed((c) => ({ ...c, [b.id]: !c[b.id] }))}
                  onTarget={() => setTarget((t) => ({ ...t, [day]: b.id }))}
                  onReorder={(uids) =>
                    updateItems(b.id, (items) => uids.map((u) => items.find((i) => i.uid === u)!).filter(Boolean))
                  }
                  onChange={(uid, patch) => updateItems(b.id, (items) => items.map((i) => (i.uid === uid ? { ...i, ...patch } : i)))}
                  onRemove={(uid) => updateItems(b.id, (items) => items.filter((i) => i.uid !== uid))}
                />
              ))}

              <div className="rounded-2xl border border-dashed border-line-strong p-3">
                <span className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-muted">
                  <Plus className="size-3.5" /> Nuevo bloque
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(BLOCK_META) as BlockKind[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => addBlock(k)}
                      className="flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 text-[11.5px] font-semibold text-fg-2 ring-1 ring-inset ring-line transition hover:bg-white/[0.08] hover:text-fg"
                    >
                      <span className="size-1.5 shrink-0 rounded-full" style={{ background: BLOCK_META[k].color }} />
                      <span className="truncate">{BLOCK_META[k].label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ── Resumen ──────────────────────────────── */}
        <aside className="stagger order-2 min-w-0 xl:sticky xl:top-[96px] min-[87.5rem]:order-3" style={{ "--i": 2 } as React.CSSProperties}>
          <Summary
            stats={stats}
            dayLabel={`${curDay.name} ${curDay.focus}`}
            onAssign={() => flash("Rutina asignada · elegí socios en el panel")}
            onSave={() => flash("Plantilla guardada en la biblioteca")}
          />
        </aside>
      </div>

      {/* Toast */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="flex max-w-full items-center gap-2 rounded-full border border-lime/30 bg-surface-2/95 py-2 pl-2.5 pr-4 text-[13px] font-semibold text-fg shadow-[0_20px_50px_-15px_rgb(0_0_0/0.8)] backdrop-blur-xl"
            >
              <CheckCircle2 className="size-4.5 shrink-0 text-lime" />
              <span className="truncate">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ── Bloque ─────────────────────────────────────────── */
function BlockCard({
  block,
  letter,
  isTarget,
  collapsed,
  onToggle,
  onTarget,
  onReorder,
  onChange,
  onRemove,
}: {
  block: Block;
  letter: string;
  isTarget: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onTarget: () => void;
  onReorder: (uids: string[]) => void;
  onChange: (uid: string, patch: Partial<Item>) => void;
  onRemove: (uid: string) => void;
}) {
  const meta = BLOCK_META[block.kind];
  const sets = block.items.reduce((a, i) => a + i.sets, 0);
  const mins = Math.max(1, Math.round(daySeconds([block]) / 60));
  const superset = block.kind === "superset";

  return (
    <motion.div
      layout="position"
      className={cn(
        "rounded-2xl border bg-ink/30 transition-[border-color,box-shadow] duration-300",
        isTarget ? "border-transparent" : "border-line",
      )}
      style={
        isTarget
          ? { boxShadow: `0 0 0 1px color-mix(in oklab, ${meta.color} 55%, transparent), 0 0 30px -12px ${meta.color}` }
          : undefined
      }
    >
      <div className="flex items-center gap-3 p-3 pb-2.5">
        <button
          onClick={onTarget}
          className="grid size-9 shrink-0 place-items-center rounded-xl text-[14px] font-extrabold transition-transform hover:scale-105"
          style={{ color: meta.color, background: `color-mix(in oklab, ${meta.color} 14%, transparent)` }}
          aria-label={`Usar ${meta.label} como destino`}
        >
          {letter}
        </button>
        <button onClick={onTarget} className="min-w-0 flex-1 text-left">
          <span className="flex items-center gap-2">
            <span className="truncate text-[14px] font-bold text-fg">{meta.label}</span>
            {superset && <Link2 className="size-3.5 shrink-0" style={{ color: meta.color }} />}
            {isTarget && (
              <span className="hidden shrink-0 rounded-full bg-lime/12 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-lime ring-1 ring-inset ring-lime/25 sm:inline">
                Destino
              </span>
            )}
          </span>
          <span className="block truncate text-[11.5px] text-muted">
            {meta.tag} · <span className="tabular">{block.items.length} ej · {sets} series · ~{mins} min</span>
          </span>
        </button>
        <button
          onClick={onToggle}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-fg"
          aria-label={collapsed ? "Expandir bloque" : "Contraer bloque"}
        >
          <ChevronDown className={cn("size-4 transition-transform duration-300", collapsed && "-rotate-90")} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className={cn("relative px-2 pb-2 sm:px-3 sm:pb-3", superset && block.items.length > 1 && "pl-5 sm:pl-6")}>
              {superset && block.items.length > 1 && (
                <span
                  className="absolute bottom-8 left-[9px] top-8 w-[2px] rounded-full sm:left-[11px]"
                  style={{ background: `linear-gradient(${meta.color}, color-mix(in oklab, ${meta.color} 20%, transparent))` }}
                />
              )}
              {block.items.length === 0 ? (
                <button
                  onClick={onTarget}
                  className="flex w-full flex-col items-center gap-1 rounded-xl border border-dashed border-line-strong bg-white/[0.015] px-4 py-6 text-center"
                >
                  <Sparkles className="size-5 text-lime" />
                  <span className="text-[13px] font-bold text-fg">Bloque vacío</span>
                  <span className="text-[12px] text-muted">Elegí ejercicios de la biblioteca con el botón +</span>
                </button>
              ) : (
                <Reorder.Group axis="y" values={block.items.map((i) => i.uid)} onReorder={onReorder} className="space-y-2">
                  <AnimatePresence initial={false}>
                    {block.items.map((item, idx) => (
                      <Row
                        key={item.uid}
                        item={item}
                        code={`${letter}${idx + 1}`}
                        color={meta.color}
                        linked={superset && block.items.length > 1}
                        onChange={(p) => onChange(item.uid, p)}
                        onRemove={() => onRemove(item.uid)}
                      />
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Fila de ejercicio ─────────────────────────────── */
function Row({
  item,
  code,
  color,
  linked,
  onChange,
  onRemove,
}: {
  item: Item;
  code: string;
  color: string;
  linked: boolean;
  onChange: (p: Partial<Item>) => void;
  onRemove: () => void;
}) {
  const controls = useDragControls();
  const ex = EX_BY_ID[item.exId];

  return (
    <Reorder.Item
      value={item.uid}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.18 } }}
      whileDrag={{ scale: 1.015, boxShadow: "0 24px 50px -18px rgb(0 0 0 / 0.9), 0 0 0 1px rgb(181 245 74 / 0.4)" }}
      className="group relative rounded-xl border border-line bg-surface-2/70 p-2 transition-colors hover:border-line-strong hover:bg-surface-2 sm:p-2.5"
    >
      {linked && (
        <span
          className="absolute -left-[15px] top-1/2 size-2.5 -translate-y-1/2 rounded-full ring-4 ring-surface sm:-left-[17px]"
          style={{ background: color }}
        />
      )}
      <div className="flex items-center gap-2.5">
        <button
          onPointerDown={(e) => controls.start(e)}
          className="grid h-10 w-5 shrink-0 cursor-grab touch-none place-items-center rounded-md text-faint transition hover:bg-white/5 hover:text-fg-2 active:cursor-grabbing"
          aria-label="Arrastrá para reordenar"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="relative size-11 shrink-0 overflow-hidden rounded-[10px] bg-surface-3 sm:size-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ex.photo} alt="" className="photo-grade size-full object-cover" draggable={false} />
          <span className="absolute bottom-0 left-0 rounded-tr-md bg-ink/80 px-1 text-[9.5px] font-extrabold text-fg backdrop-blur">{code}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-bold text-fg">{ex.name}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <MuscleTag muscle={ex.muscle} />
            <span className="truncate text-[11px] font-medium text-muted">{ex.equipment}</span>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-faint opacity-60 transition hover:bg-rose/15 hover:text-rose group-hover:opacity-100"
          aria-label={`Quitar ${ex.name}`}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-6 gap-1.5 sm:grid-cols-[1.25fr_1fr_1fr_1.25fr_1fr]">
        <Field label="Series" className="col-span-2 sm:col-span-1">
          <NumInput value={item.sets} onChange={(v) => onChange({ sets: Math.max(1, Math.min(10, v)) })} className="w-4" />
          <span className="text-faint">×</span>
          <input
            value={item.reps}
            onChange={(e) => onChange({ reps: e.target.value })}
            className="w-full min-w-0 bg-transparent text-fg focus:outline-none"
            aria-label="Repeticiones"
          />
        </Field>
        <Field label="Carga" className="col-span-2 sm:col-span-1">
          <NumInput value={item.kg} onChange={(v) => onChange({ kg: Math.max(0, Math.min(400, v)) })} className="w-full" placeholder="PC" />
          <span className="text-[10.5px] font-semibold text-muted">kg</span>
        </Field>
        <Field label="Pausa" className="col-span-2 sm:col-span-1">
          <select
            value={item.rest}
            onChange={(e) => onChange({ rest: Number(e.target.value) })}
            className="w-full min-w-0 cursor-pointer appearance-none bg-transparent text-fg focus:outline-none"
            aria-label="Descanso"
          >
            {REST_OPTIONS.map((r) => (
              <option key={r} value={r} className="bg-surface-2">
                {fmtRest(r)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`RPE ${item.rpe}`} className="col-span-3 sm:col-span-1">
          <div className="flex h-[18px] flex-1 items-end gap-[3px]" role="radiogroup" aria-label="RPE">
            {[6, 7, 8, 9, 10].map((v, k) => (
              <button
                key={v}
                onClick={() => onChange({ rpe: v })}
                role="radio"
                aria-checked={item.rpe === v}
                aria-label={`RPE ${v}`}
                className="flex-1 rounded-[3px] transition-all hover:brightness-125"
                style={{
                  height: `${45 + k * 14}%`,
                  background:
                    v <= item.rpe
                      ? v >= 9
                        ? "var(--color-rose)"
                        : v >= 8
                          ? "var(--color-amber)"
                          : "var(--color-lime)"
                      : "rgb(255 255 255 / 0.08)",
                }}
              />
            ))}
          </div>
        </Field>
        <Field label="Tempo" className="col-span-3 sm:col-span-1">
          <input
            value={item.tempo}
            onChange={(e) => onChange({ tempo: e.target.value })}
            className="w-full min-w-0 bg-transparent text-fg focus:outline-none"
            aria-label="Tempo"
          />
        </Field>
      </div>
    </Reorder.Item>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block min-w-0 rounded-lg border border-line bg-ink/40 px-2 py-1.5 transition focus-within:border-lime/40 focus-within:bg-ink/60 hover:border-line-strong", className)}>
      <span className="block truncate text-[9.5px] font-bold uppercase tracking-[0.08em] text-faint">{label}</span>
      <span className="mt-0.5 flex items-center gap-1 text-[13px] font-bold tabular">{children}</span>
    </label>
  );
}

function NumInput({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  placeholder?: string;
}) {
  return (
    <input
      inputMode="decimal"
      value={value === 0 && placeholder ? "" : String(value)}
      placeholder={placeholder}
      onChange={(e) => {
        const n = Number(e.target.value.replace(",", "."));
        if (!Number.isNaN(n)) onChange(n);
      }}
      className={cn("min-w-0 bg-transparent text-fg placeholder:text-muted focus:outline-none", className)}
    />
  );
}
