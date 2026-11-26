"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Cambios sin guardar ───────────────────────────────────── */
type DirtyCtx = { touch: (key: string) => void };
export const DirtyContext = createContext<DirtyCtx>({ touch: () => {} });

/** Estado local de un ajuste: cada cambio se registra en la barra de guardado. */
export function useSetting<T>(key: string, initial: T) {
  const { touch } = useContext(DirtyContext);
  const [value, setValue] = useState<T>(initial);
  const set = (next: T | ((prev: T) => T)) => {
    setValue(next);
    touch(key);
  };
  return [value, set] as const;
}

export const useTouch = () => useContext(DirtyContext).touch;

export const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

/* ── Encabezado de sección ─────────────────────────────────── */
export function SectionHead({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  text: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="stagger mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-[14px] border border-line-strong bg-gradient-to-b from-white/[0.07] to-white/[0.01] text-lime">
          <Icon className="size-5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[22px] font-extrabold leading-tight tracking-[-0.03em] text-fg">{title}</h2>
          <p className="mt-0.5 text-[13px] leading-snug text-muted">{text}</p>
        </div>
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/* ── Toggle ────────────────────────────────────────────────── */
export function Toggle({
  checked,
  onChange,
  size = "md",
  disabled,
  label,
  color = "var(--color-lime)",
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  size?: "sm" | "md";
  disabled?: boolean;
  label?: string;
  color?: string;
}) {
  const sm = size === "sm";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative shrink-0 rounded-full transition-all duration-300 disabled:cursor-not-allowed",
        sm ? "h-[18px] w-[32px]" : "h-[22px] w-[40px]",
        !checked && "bg-white/[0.10] hover:bg-white/[0.14]",
        disabled && "opacity-60",
      )}
      style={checked ? { background: color, boxShadow: `0 0 14px -4px ${color}` } : undefined}
    >
      <span
        className={cn(
          "absolute rounded-full shadow-[0_1px_3px_rgb(0_0_0/0.4)] transition-all duration-300 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)]",
          sm ? "top-[2px] size-[14px]" : "top-[3px] size-[16px]",
          checked ? "bg-lime-ink" : "bg-fg-2",
          sm ? (checked ? "left-[16px]" : "left-[2px]") : checked ? "left-[21px]" : "left-[3px]",
        )}
      />
    </button>
  );
}

/* ── Campo + input ─────────────────────────────────────────── */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="mb-1.5 text-[12px] font-semibold text-fg-2">{label}</p>
      {children}
      {hint && <p className="mt-1.5 text-[11.5px] leading-snug text-faint">{hint}</p>}
    </div>
  );
}

export const inputShell =
  "flex h-10 w-full items-center gap-2 rounded-xl border border-line bg-ink/40 px-3 text-[13.5px] text-fg transition focus-within:border-lime/45 focus-within:bg-ink/60 focus-within:shadow-[0_0_0_4px_rgb(181_245_74/0.07)] hover:border-line-strong";

export function TextInput({
  value,
  onChange,
  prefix,
  suffix,
  icon: Icon,
  className,
  mono,
  ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "prefix"> & {
  value: string;
  onChange?: (v: string) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  mono?: boolean;
}) {
  return (
    <label className={cn(inputShell, className)}>
      {Icon && <Icon className="size-4 shrink-0 text-muted" />}
      {prefix && <span className="shrink-0 text-[13px] font-semibold text-muted">{prefix}</span>}
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "min-w-0 flex-1 bg-transparent placeholder:text-faint focus:outline-none",
          mono && "tabular font-semibold tracking-wide",
        )}
        {...rest}
      />
      {suffix && <span className="shrink-0 text-[12px] font-semibold text-muted">{suffix}</span>}
    </label>
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        rows={rows}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full resize-none rounded-xl border border-line bg-ink/40 px-3 py-2.5 text-[13.5px] leading-relaxed text-fg transition placeholder:text-faint hover:border-line-strong focus:border-lime/45 focus:bg-ink/60 focus:shadow-[0_0_0_4px_rgb(181_245_74/0.07)] focus:outline-none"
      />
      {maxLength && (
        <span className="pointer-events-none absolute bottom-2 right-3 text-[10.5px] font-semibold text-faint tabular">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

/* ── Monto en pesos ────────────────────────────────────────── */
export function MoneyInput({ value, onChange, className }: { value: number; onChange: (v: number) => void; className?: string }) {
  return (
    <TextInput
      className={className}
      prefix="$"
      mono
      inputMode="numeric"
      value={value ? value.toLocaleString("es-AR") : ""}
      onChange={(v) => {
        const n = Number(v.replace(/\D/g, ""));
        if (n <= 9_999_999) onChange(n);
      }}
    />
  );
}

/* ── Select propio ─────────────────────────────────────────── */
export function Select<T extends string>({
  value,
  options,
  onChange,
  className,
  icon: Icon,
  label,
  compact,
}: {
  value: T;
  options: readonly (T | { value: T; label: string; hint?: string })[];
  onChange: (v: T) => void;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o, hint: undefined } : o));
  const current = opts.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    // lleva la opción elegida a la vista en listas largas (horarios)
    list.current?.querySelector("[aria-selected=true]")?.scrollIntoView({ block: "center" });
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={root} className={cn("relative min-w-0", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          inputShell,
          "text-left",
          compact && "h-9 px-2.5 text-[13px]",
          open && "border-lime/45 bg-ink/60 shadow-[0_0_0_4px_rgb(181_245_74/0.07)]",
        )}
      >
        {Icon && <Icon className="size-4 shrink-0 text-muted" />}
        <span className="min-w-0 flex-1 truncate font-semibold tabular">{current?.label}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform duration-200", open && "rotate-180 text-lime")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            id={id}
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="no-scrollbar absolute left-0 top-[calc(100%+6px)] z-30 max-h-60 min-w-full overflow-y-auto rounded-xl border border-line-strong bg-surface-2/95 p-1 shadow-[0_24px_48px_-12px_rgb(0_0_0/0.8)] backdrop-blur-xl"
          >
            {opts.map((o) => {
              const on = o.value === value;
              return (
                <li key={o.value} role="option" aria-selected={on}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold transition tabular",
                      on ? "bg-lime/[0.10] text-lime" : "text-fg-2 hover:bg-white/[0.06] hover:text-fg",
                    )}
                  >
                    <span className="flex-1">
                      {o.label}
                      {o.hint && <span className="block text-[11px] font-medium text-muted">{o.hint}</span>}
                    </span>
                    {on && <Check className="size-3.5" strokeWidth={2.6} />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Control segmentado ────────────────────────────────────── */
export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  className,
  size = "md",
}: {
  value: T;
  options: readonly { value: T; label: React.ReactNode }[];
  onChange: (v: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const layout = useId();
  return (
    <div className={cn("flex rounded-xl border border-line bg-ink/40 p-1", className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex-1 whitespace-nowrap rounded-lg font-bold transition-colors tabular",
              size === "sm" ? "h-7 px-2.5 text-[11.5px]" : "h-8 px-3 text-[12.5px]",
              on ? "text-fg" : "text-muted hover:text-fg",
            )}
          >
            {on && (
              <motion.span
                layoutId={layout}
                className="absolute inset-0 rounded-lg bg-surface-3 shadow-[0_2px_8px_-2px_rgb(0_0_0/0.5)] ring-1 ring-inset ring-white/[0.08]"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Stepper numérico ──────────────────────────────────────── */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const btn =
    "grid size-8 place-items-center rounded-lg text-fg-2 transition hover:bg-white/[0.07] hover:text-fg active:scale-90 disabled:opacity-30";
  return (
    <div className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-line bg-ink/40 p-1">
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Restar">
        <Minus className="size-3.5" strokeWidth={2.6} />
      </button>
      <span className="min-w-[64px] text-center text-[13.5px] font-extrabold text-fg tabular">
        {value}
        {suffix && <span className="ml-1 text-[11.5px] font-semibold text-muted">{suffix}</span>}
      </span>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Sumar">
        <Plus className="size-3.5" strokeWidth={2.6} />
      </button>
    </div>
  );
}

/* ── Casilla ───────────────────────────────────────────────── */
export function Check2({
  checked,
  onChange,
  color = "var(--color-lime)",
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "grid size-[22px] shrink-0 place-items-center rounded-[7px] border transition-all duration-200 active:scale-90",
        checked ? "border-transparent text-lime-ink" : "border-line-strong bg-ink/40 text-transparent hover:border-white/25",
      )}
      style={checked ? { background: color, boxShadow: `0 0 12px -4px ${color}` } : undefined}
    >
      <Check className="size-3.5" strokeWidth={3} />
    </button>
  );
}

/** Fila de ajuste: texto a la izquierda, control a la derecha. */
export function SettingRow({
  title,
  text,
  children,
  icon: Icon,
  className,
}: {
  title: React.ReactNode;
  text?: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 py-3.5", className)}>
      {Icon && (
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-fg-2 ring-1 ring-inset ring-white/[0.06]">
          <Icon className="size-[17px]" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold text-fg">{title}</p>
        {text && <p className="mt-0.5 text-[12px] leading-snug text-muted">{text}</p>}
      </div>
      {children}
    </div>
  );
}

/* ── Panel lateral (drawer en desktop, hoja inferior en mobile) ── */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-end sm:items-stretch" role="dialog" aria-modal="true">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[26px] border border-line-strong bg-surface shadow-[0_-20px_60px_-10px_rgb(0_0_0/0.8)] sm:m-3 sm:max-h-none sm:w-[460px] sm:rounded-[22px]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/50 to-transparent" />
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 pb-4 pt-4 sm:pt-5">
              <div className="min-w-0">
                <h3 className="text-[17px] font-extrabold tracking-[-0.02em] text-fg">{title}</h3>
                {subtitle && <p className="mt-0.5 text-[12.5px] text-muted">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid size-9 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-white/5 hover:text-fg"
                aria-label="Cerrar"
              >
                <X className="size-[18px]" />
              </button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 border-t border-line bg-ink/30 px-5 py-3.5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
