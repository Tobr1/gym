"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Minus } from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import type { MemberStatus } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { PLAN_COLOR, initials, isRisk, type Row } from "./data";

/* ── Avatar con foto o iniciales (altas sin foto) ─────────── */
export function MemberAvatar({ r, size = 36, className }: { r: Pick<Row, "face" | "name" | "plan">; size?: number; className?: string }) {
  if (r.face !== null) return <Avatar i={r.face} size={size} className={className} />;
  const c = PLAN_COLOR[r.plan] ?? "var(--color-violet)";
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full font-extrabold tracking-tight", className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        color: c,
        background: `color-mix(in oklab, ${c} 15%, var(--color-surface-2))`,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${c} 28%, transparent)`,
      }}
      aria-hidden
    >
      {initials(r.name)}
    </span>
  );
}

export const STATUS_DOT: Record<MemberStatus, string> = {
  activo: "bg-lime",
  "por-vencer": "bg-amber",
  vencido: "bg-rose",
  congelado: "bg-cyan",
};

/* ── Checkbox ─────────────────────────────────────────────── */
export function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
  className?: string;
}) {
  const on = checked || indeterminate;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        "grid size-[18px] shrink-0 place-items-center rounded-[6px] border transition-all duration-150",
        on ? "border-lime bg-lime text-lime-ink" : "border-white/20 bg-white/[0.02] hover:border-white/40",
        className,
      )}
    >
      {indeterminate ? <Minus className="size-3" strokeWidth={3.4} /> : checked ? <Check className="size-3" strokeWidth={3.4} /> : null}
    </button>
  );
}

/* ── Resaltado de búsqueda (insensible a tildes) ─────────── */
export const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function Highlight({ text, q }: { text: string; q: string }) {
  const nq = norm(q.trim());
  if (!nq) return <>{text}</>;
  const i = norm(text).indexOf(nq);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[4px] bg-lime/25 px-0.5 text-fg">{text.slice(i, i + nq.length)}</mark>
      {text.slice(i + nq.length)}
    </>
  );
}

/* ── Vencimiento con barra de días restantes ─────────────── */
export type DueTone = "lime" | "amber" | "rose" | "cyan";
export function dueTone(r: Row): DueTone {
  if (r.daysLeft === null) return "cyan";
  if (r.daysLeft < 0) return "rose";
  if (r.daysLeft <= 7) return "amber";
  return "lime";
}

export function daysLabel(r: Row) {
  const d = r.daysLeft;
  if (d === null) return r.note ? "vuelve" : "en pausa";
  if (d < 0) return `hace ${-d} d`;
  if (d === 0) return "hoy";
  if (d === 1) return "mañana";
  return `en ${d} d`;
}

const BAR: Record<DueTone, string> = {
  lime: "bg-lime/75",
  amber: "bg-amber shadow-[0_0_10px_-1px_rgb(255_190_85/0.7)]",
  rose: "bg-rose shadow-[0_0_10px_-1px_rgb(255_95_126/0.7)]",
  cyan: "bg-[repeating-linear-gradient(135deg,rgb(87_213_242/0.5)_0_3px,transparent_3px_6px)]",
};
const TXT: Record<DueTone, string> = { lime: "text-muted", amber: "text-amber", rose: "text-rose", cyan: "text-cyan" };

export function DueMeter({ r, className }: { r: Row; className?: string }) {
  const tone = dueTone(r);
  const frac = r.daysLeft === null || r.daysLeft < 0 ? 1 : Math.max(0.05, Math.min(1, r.daysLeft / r.period));
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-baseline justify-between gap-2 whitespace-nowrap">
        <span className={cn("text-[13px] font-bold tabular", r.daysLeft === null ? "text-fg-2" : "text-fg")}>
          {r.daysLeft === null ? (r.note?.match(/\d{2} \p{L}{3}/u)?.[0] ?? "En pausa") : r.due}
        </span>
        <span className={cn("min-w-0 truncate text-[11px] font-bold tabular", TXT[tone])}>{daysLabel(r)}</span>
      </div>
      <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-white/[0.07]">
        <div className={cn("h-full rounded-full", BAR[tone])} style={{ width: `${frac * 100}%` }} />
      </div>
    </div>
  );
}

/* ── Asistencia: visitas por semana (8) + % ───────────────── */
export function AttendanceBars({ r, className }: { r: Row; className?: string }) {
  const risk = isRisk(r);
  const frozen = r.status === "congelado";
  const max = Math.max(5, ...r.weeks);
  return (
    <div className={cn("flex items-center gap-2.5", className)} title={`Visitas por semana (8 sem.): ${r.weeks.join(" · ")}`}>
      <div className="flex h-6 items-end gap-[2px]" aria-hidden>
        {r.weeks.map((w, i) => (
          <span
            key={i}
            className={cn(
              "w-[4px] rounded-[2px]",
              frozen
                ? "bg-cyan/25"
                : i < 4
                  ? "bg-white/[0.16]"
                  : risk
                    ? i === 7
                      ? "bg-rose"
                      : "bg-rose/55"
                    : i === 7
                      ? "bg-lime"
                      : "bg-lime/50",
            )}
            style={{ height: `${Math.max(12, (w / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="w-[46px] leading-none">
        <span className={cn("text-[13px] font-extrabold tabular", risk ? "text-rose" : frozen ? "text-muted" : "text-fg")}>
          {frozen || (r.isNew && r.attendance === 0) ? "—" : `${r.attendance}%`}
        </span>
        {risk && <span className="mt-1 block text-[10.5px] font-bold text-rose/80 tabular">−{r.prevAttendance - r.attendance} pts</span>}
      </div>
    </div>
  );
}

/* ── Menú de filtro (multi-selección) ─────────────────────── */
export type Opt = { value: string; label: string; hint?: string; count?: number; color?: string };

export function FilterMenu({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  align = "left",
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  options: Opt[];
  value: string[];
  onChange: (v: string[]) => void;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const active = value.length > 0;
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-10 items-center gap-2 rounded-xl border px-3 text-[13px] font-semibold transition",
          active ? "border-lime/35 bg-lime/[0.08] text-fg" : "border-line bg-white/[0.02] text-fg-2 hover:border-line-strong hover:text-fg",
        )}
      >
        <Icon className={cn("size-4", active ? "text-lime" : "text-muted")} />
        {label}
        {active ? (
          <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-lime px-1 text-[10.5px] font-extrabold text-lime-ink tabular">
            {value.length}
          </span>
        ) : (
          <ChevronDown className={cn("size-3.5 text-muted transition-transform", open && "rotate-180")} />
        )}
      </button>
      {open && (
        <div
          className={cn(
            "absolute top-full z-30 mt-2 w-64 animate-fade-in rounded-2xl border border-line-strong bg-surface-2 p-1.5 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.8)]",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <p className="px-2.5 pb-1.5 pt-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">{label}</p>
          <ul>
            {options.map((o) => {
              const on = value.includes(o.value);
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => toggle(o.value)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition",
                      on ? "bg-white/[0.05] text-fg" : "text-fg-2 hover:bg-white/[0.04] hover:text-fg",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-[5px] border",
                        on ? "border-lime bg-lime text-lime-ink" : "border-white/20",
                      )}
                    >
                      {on && <Check className="size-2.5" strokeWidth={3.6} />}
                    </span>
                    {o.color && <span className="size-2 shrink-0 rounded-full" style={{ background: o.color }} />}
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{o.label}</span>
                      {o.hint && <span className="block text-[11px] text-muted">{o.hint}</span>}
                    </span>
                    {o.count !== undefined && <span className="text-[11.5px] font-bold text-muted tabular">{o.count}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          {active && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 w-full border-t border-line px-2.5 pb-1 pt-2 text-left text-[12px] font-bold text-muted hover:text-fg"
            >
              Limpiar selección
            </button>
          )}
        </div>
      )}
    </div>
  );
}
