"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleDollarSign,
  Download,
  IdCard,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCcw,
  Send,
  UserPlus,
  X,
} from "lucide-react";
import { Button, Pill } from "@/components/ui/primitives";
import { STATUS_META, type MemberStatus } from "@/lib/mock";
import { cn, money } from "@/lib/utils";
import { METHODS, type MethodKey } from "../../caja/_data";
import { METHOD_ICON } from "../../caja/_icons";
import { ATT_BUCKETS, BRANCHES, PLANS, PLAN_COLOR, PLAN_PRICE, type AttKey, type Row } from "./data";
import { AttendanceBars, DueMeter, MemberAvatar, STATUS_DOT } from "./parts";

/* ── Sheet: bottom sheet en mobile · panel lateral en desktop ── */
export function Sheet({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", esc);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-[26px] border border-line-strong bg-surface shadow-[0_-30px_80px_-20px_rgb(0_0_0/0.8)] md:inset-x-auto md:bottom-4 md:right-4 md:top-4 md:max-h-none md:w-[420px] md:rounded-[24px]"
          >
            <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-white/15 md:hidden" />
            <header className="flex shrink-0 items-start justify-between gap-3 px-5 pb-3 pt-4 md:px-6 md:pt-6">
              <div className="min-w-0">
                {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-faint">{eyebrow}</p>}
                <h2 className="mt-1 text-[19px] font-extrabold leading-tight tracking-[-0.02em] text-fg">{title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:bg-white/5 hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 md:px-6">{children}</div>
            {footer && (
              <footer className="shrink-0 border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:px-6 md:pb-5">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Chips de opción (filtros mobile y formularios) ───────── */
function Chip({
  on,
  onClick,
  children,
  color,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[13px] font-semibold transition active:scale-[0.97]",
        on ? "border-lime/45 bg-lime/[0.1] text-fg" : "border-line bg-white/[0.02] text-fg-2 hover:border-line-strong",
      )}
    >
      {color && <span className="size-2 rounded-full" style={{ background: color }} />}
      {children}
      {on && <Check className="size-3.5 text-lime" strokeWidth={3} />}
    </button>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-4 first:border-0 first:pt-0">
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-faint">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export type Filters = { plans: string[]; branches: string[]; statuses: MemberStatus[]; att: AttKey[]; riskOnly: boolean };
const flip = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export function FilterSheet({
  open,
  onClose,
  value,
  onChange,
  onClear,
  results,
}: {
  open: boolean;
  onClose: () => void;
  value: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
  results: number;
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow="Padrón de socios"
      title="Filtrar"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClear}>
            Limpiar
          </Button>
          <Button className="flex-[2]" onClick={onClose}>
            Ver {results} {results === 1 ? "socio" : "socios"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Group label="Estado">
          {(Object.keys(STATUS_META) as MemberStatus[]).map((s) => (
            <Chip key={s} on={value.statuses.includes(s)} onClick={() => onChange({ ...value, statuses: flip(value.statuses, s) })}>
              <span className={cn("size-2 rounded-full", STATUS_DOT[s])} />
              {STATUS_META[s].label}
            </Chip>
          ))}
        </Group>
        <Group label="Plan">
          {PLANS.map((p) => (
            <Chip key={p} color={PLAN_COLOR[p]} on={value.plans.includes(p)} onClick={() => onChange({ ...value, plans: flip(value.plans, p) })}>
              {p}
            </Chip>
          ))}
        </Group>
        <Group label="Sede">
          {BRANCHES.map((b) => (
            <Chip key={b} on={value.branches.includes(b)} onClick={() => onChange({ ...value, branches: flip(value.branches, b) })}>
              {b.replace("Sede ", "")}
            </Chip>
          ))}
        </Group>
        <Group label="Asistencia del mes">
          {ATT_BUCKETS.map((a) => (
            <Chip key={a.key} on={value.att.includes(a.key)} onClick={() => onChange({ ...value, att: flip(value.att, a.key) })}>
              {a.label} <span className="text-[11px] font-medium text-muted">{a.hint.replace(" del mes", "")}</span>
            </Chip>
          ))}
        </Group>
        <div className="border-t border-line pt-4">
          <button
            type="button"
            role="switch"
            aria-checked={value.riskOnly}
            onClick={() => onChange({ ...value, riskOnly: !value.riskOnly })}
            className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white/[0.02] p-3.5 text-left"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold text-fg">Solo en riesgo de abandono</span>
              <span className="block text-[12px] text-muted">Asistencia en caída de 25 pts o más</span>
            </span>
            <span className={cn("relative h-6 w-10 shrink-0 rounded-full transition", value.riskOnly ? "bg-rose" : "bg-white/12")}>
              <span className={cn("absolute top-1 size-4 rounded-full bg-white transition-all", value.riskOnly ? "left-5" : "left-1")} />
            </span>
          </button>
        </div>
      </div>
    </Sheet>
  );
}

/* ── Cobro rápido ─────────────────────────────────────────── */
export function ChargeSheet({ row, onClose, onConfirm }: { row: Row | null; onClose: () => void; onConfirm: (r: Row, amount: number, method: MethodKey) => void }) {
  const [method, setMethod] = useState<MethodKey>("mp");
  const [receipt, setReceipt] = useState(true);
  const last = useLast(row);
  const r = row ?? last;
  const amount = r ? (r.debt > 0 ? r.debt : PLAN_PRICE[r.plan] ?? r.amount) : 0;
  const periods = r && r.debt > 0 ? Math.max(1, Math.round(r.debt / (PLAN_PRICE[r.plan] ?? r.debt))) : 1;

  return (
    <Sheet
      open={!!row}
      onClose={onClose}
      eyebrow="Cobro rápido · Caja abierta"
      title="Registrar cobro"
      footer={
        r && (
          <Button size="lg" className="w-full" onClick={() => onConfirm(r, amount, method)}>
            <CircleDollarSign className="size-[18px]" /> Cobrar {money(amount)}
          </Button>
        )
      }
    >
      {r && (
        <>
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.02] p-3">
            <MemberAvatar r={r} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-fg">{r.name}</p>
              <p className="truncate text-[12px] text-muted">
                #{r.id} · {r.plan}
              </p>
            </div>
            <Pill tone={STATUS_META[r.status].tone} dot>
              {STATUS_META[r.status].label}
            </Pill>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[12px] font-semibold text-muted">
              {r.debt > 0 ? `Deuda · ${periods} ${periods === 1 ? "período" : "períodos"}` : `Cuota de diciembre · ${r.plan}`}
            </p>
            <p className="mt-1 text-[44px] font-extrabold leading-none tracking-[-0.045em] text-fg tabular">{money(amount)}</p>
            {r.debt > 0 && (
              <p className="mt-2 text-[12px] font-semibold text-rose">
                Venció hace {Math.abs(r.daysLeft ?? 0)} días
                {r.note && !r.note.startsWith("Venció") && <span className="text-muted"> · {r.note}</span>}
              </p>
            )}
          </div>

          <p className="mb-2.5 mt-6 text-[11px] font-bold uppercase tracking-[0.12em] text-faint">Medio de pago</p>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => {
              const Icon = METHOD_ICON[m.key];
              const on = method === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setMethod(m.key)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[12px] font-semibold transition active:scale-[0.97]",
                    on ? "border-lime/50 bg-lime/[0.08] text-fg" : "border-line bg-white/[0.02] text-fg-2 hover:border-line-strong",
                  )}
                >
                  <Icon className="size-[18px]" style={{ color: m.color }} />
                  {m.short}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={receipt}
            onClick={() => setReceipt((v) => !v)}
            className="mt-4 flex w-full items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-3.5 py-3 text-left"
          >
            <MessageCircle className="size-4 shrink-0 text-emerald" />
            <span className="min-w-0 flex-1 text-[13px] font-semibold text-fg-2">Enviar comprobante por WhatsApp</span>
            <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition", receipt ? "bg-lime" : "bg-white/12")}>
              <span className={cn("absolute top-0.5 size-4 rounded-full transition-all", receipt ? "left-[18px] bg-lime-ink" : "left-0.5 bg-white")} />
            </span>
          </button>
        </>
      )}
    </Sheet>
  );
}

/* Mantiene el último valor mientras el sheet se anima al cerrar. */
function useLast<T>(v: T | null) {
  const [last, setLast] = useState<T | null>(v);
  if (v !== null && v !== last) setLast(v);
  return last;
}

/* ── Vista rápida (socios sin ficha integral migrada) ──────── */
export function PeekSheet({
  row,
  onClose,
  onCharge,
  onMessage,
}: {
  row: Row | null;
  onClose: () => void;
  onCharge: (r: Row) => void;
  onMessage: (r: Row) => void;
}) {
  const last = useLast(row);
  const r = row ?? last;
  return (
    <Sheet
      open={!!row}
      onClose={onClose}
      eyebrow={r ? `Socio #${r.id}` : ""}
      title="Vista rápida"
      footer={
        r && (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => onMessage(r)}>
              <MessageCircle className="size-4 text-emerald" /> WhatsApp
            </Button>
            <Button className="flex-1" onClick={() => onCharge(r)}>
              <CircleDollarSign className="size-4" /> Cobrar
            </Button>
          </div>
        )
      }
    >
      {r && (
        <>
          <div className="flex items-center gap-4">
            <MemberAvatar r={r} size={64} />
            <div className="min-w-0">
              <p className="truncate text-[20px] font-extrabold tracking-[-0.02em] text-fg">{r.name}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Pill tone={STATUS_META[r.status].tone} dot>
                  {STATUS_META[r.status].label}
                </Pill>
                {r.isNew && <Pill tone="violet">Alta {r.since}</Pill>}
              </div>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-2">
            {[
              { icon: BadgeCheck, k: "Plan", v: r.plan },
              { icon: MapPin, k: "Sede", v: r.branch },
              { icon: Phone, k: "Celular", v: r.phone },
              { icon: IdCard, k: "DNI", v: r.dni },
            ].map((x) => (
              <div key={x.k} className="rounded-xl border border-line bg-white/[0.02] px-3 py-2.5">
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                  <x.icon className="size-3.5" /> {x.k}
                </dt>
                <dd className="mt-0.5 truncate text-[13px] font-bold text-fg tabular">{x.v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 space-y-4 rounded-2xl border border-line bg-white/[0.02] p-4">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-faint">Vencimiento</p>
              <DueMeter r={r} />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-faint">Asistencia · 8 semanas</p>
              <AttendanceBars r={r} />
            </div>
            <div className="flex items-center justify-between border-t border-line pt-3 text-[13px]">
              <span className="font-semibold text-muted">Saldo</span>
              <span className={cn("font-extrabold tabular", r.debt > 0 ? "text-rose" : "text-lime")}>{r.debt > 0 ? `− ${money(r.debt)}` : "Al día"}</span>
            </div>
          </div>

          {r.hasProfile ? (
            <Link
              href={`/admin/socios/${r.id}`}
              className="mt-4 flex items-center justify-between rounded-xl border border-lime/30 bg-lime/[0.06] px-4 py-3 text-[13px] font-bold text-lime"
            >
              Abrir ficha completa <ArrowRight className="size-4" />
            </Link>
          ) : (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-dashed border-line-strong px-3.5 py-3 text-[12px] leading-relaxed text-muted">
              <RefreshCcw className="mt-0.5 size-3.5 shrink-0 text-cyan" />
              Ficha integral en sincronización desde el sistema anterior. Historial completo disponible en las próximas horas.
            </p>
          )}
        </>
      )}
    </Sheet>
  );
}

/* ── Alta de socio ────────────────────────────────────────── */
export type NewMember = { name: string; dni: string; phone: string; plan: string; branch: string; auto: boolean };

export function NewMemberSheet({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (m: NewMember) => void }) {
  const [m, setM] = useState<NewMember>({ name: "", dni: "", phone: "", plan: "Pase Libre", branch: "Sede Centro", auto: true });
  const valid = m.name.trim().split(/\s+/).length >= 2;
  const field = "h-11 w-full rounded-xl border border-line bg-white/[0.03] px-3.5 text-[14px] text-fg placeholder:text-faint transition focus:border-lime/50 focus:outline-none";

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow="Alta en el padrón"
      title="Nuevo socio"
      footer={
        <Button
          size="lg"
          className="w-full"
          disabled={!valid}
          onClick={() => {
            onCreate(m);
            setM((x) => ({ ...x, name: "", dni: "", phone: "" }));
          }}
        >
          <UserPlus className="size-[18px]" /> Dar de alta · {money(PLAN_PRICE[m.plan])}
        </Button>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onCreate(m);
        }}
      >
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold text-fg-2">Nombre y apellido</span>
          <input autoFocus className={field} placeholder="Ej.: Lara Medina" value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-fg-2">DNI</span>
            <input className={field} inputMode="numeric" placeholder="40.123.456" value={m.dni} onChange={(e) => setM({ ...m, dni: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-fg-2">Celular</span>
            <input className={field} inputMode="tel" placeholder="11 5555-0000" value={m.phone} onChange={(e) => setM({ ...m, phone: e.target.value })} />
          </label>
        </div>

        <div>
          <span className="mb-2 block text-[12px] font-semibold text-fg-2">Plan</span>
          <div className="space-y-1.5">
            {PLANS.map((p) => {
              const on = m.plan === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setM({ ...m, plan: p })}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition",
                    on ? "border-lime/45 bg-lime/[0.07]" : "border-line bg-white/[0.02] hover:border-line-strong",
                  )}
                >
                  <span className={cn("grid size-4 place-items-center rounded-full border", on ? "border-lime" : "border-white/25")}>
                    {on && <span className="size-2 rounded-full bg-lime" />}
                  </span>
                  <span className="size-2 rounded-full" style={{ background: PLAN_COLOR[p] }} />
                  <span className="flex-1 text-[13.5px] font-semibold text-fg">{p}</span>
                  <span className="text-[13px] font-bold text-fg-2 tabular">{money(PLAN_PRICE[p])}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-[12px] font-semibold text-fg-2">Sede</span>
          <div className="flex rounded-xl border border-line bg-white/[0.02] p-1">
            {BRANCHES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setM({ ...m, branch: b })}
                className={cn(
                  "flex-1 rounded-lg py-2 text-[13px] font-semibold transition",
                  m.branch === b ? "bg-surface-3 text-fg shadow" : "text-muted hover:text-fg",
                )}
              >
                {b.replace("Sede ", "")}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={m.auto}
          onClick={() => setM({ ...m, auto: !m.auto })}
          className="flex w-full items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-3.5 py-3 text-left"
        >
          <RefreshCcw className="size-4 shrink-0 text-violet" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-fg">Débito automático</span>
            <span className="block text-[11.5px] text-muted">Mercado Pago · se cobra el día del vencimiento</span>
          </span>
          <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition", m.auto ? "bg-lime" : "bg-white/12")}>
            <span className={cn("absolute top-0.5 size-4 rounded-full transition-all", m.auto ? "left-[18px] bg-lime-ink" : "left-0.5 bg-white")} />
          </span>
        </button>
      </form>
    </Sheet>
  );
}

/* ── Barra flotante de acciones masivas ──────────────────── */
export function BulkBar({
  count,
  debt,
  onRemind,
  onExport,
  onPlan,
  onClear,
}: {
  count: number;
  debt: number;
  onRemind: () => void;
  onExport: () => void;
  onPlan: (plan: string) => void;
  onClear: () => void;
}) {
  const [planOpen, setPlanOpen] = useState(false);
  const act =
    "flex h-10 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-[13px] font-semibold text-fg-2 transition hover:bg-white/[0.06] hover:text-fg max-sm:flex-1 max-sm:flex-col max-sm:justify-center max-sm:gap-0.5 max-sm:h-12 max-sm:px-1 max-sm:text-[11px]";
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 460, damping: 34 }}
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 lg:left-[calc(50%+128px)]"
          role="toolbar"
          aria-label="Acciones sobre la selección"
        >
          <div className="flex flex-col gap-1 rounded-[20px] border sm:w-max border-line-strong bg-surface-2/95 p-1.5 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9),0_0_0_1px_rgb(181_245_74/0.08)] backdrop-blur-xl sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 sm:pr-3">
              <span className="grid h-7 min-w-7 place-items-center rounded-lg bg-lime px-1.5 text-[13px] font-extrabold text-lime-ink tabular">{count}</span>
              <span className="whitespace-nowrap text-[13px] font-semibold leading-tight text-fg">
                {count === 1 ? "seleccionado" : "seleccionados"}
                {debt > 0 && <span className="block text-[11px] font-semibold text-rose tabular">{money(debt)} adeudado</span>}
              </span>
              <button type="button" onClick={onClear} aria-label="Quitar selección" className="ml-auto grid size-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-fg sm:hidden">
                <X className="size-4" />
              </button>
            </div>
            <span className="hidden h-7 w-px bg-line-strong sm:block" />
            <div className="flex items-center gap-0.5">
              <button type="button" onClick={onRemind} className={cn(act, "text-fg")}>
                <Send className="size-4 text-lime" /> <span className="max-sm:hidden">Enviar recordatorio</span>
                <span className="sm:hidden">Recordar</span>
              </button>
              <button type="button" onClick={onExport} className={act}>
                <Download className="size-4" /> Exportar
              </button>
              <div className="relative max-sm:flex-1">
                <button type="button" onClick={() => setPlanOpen((o) => !o)} aria-expanded={planOpen} className={cn(act, "max-sm:w-full")}>
                  <RefreshCcw className="size-4" /> <span className="max-sm:hidden">Cambiar plan</span>
                  <span className="sm:hidden">Plan</span>
                </button>
                {planOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-60 animate-fade-in rounded-2xl border border-line-strong bg-surface-2 p-1.5 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.8)]">
                    <p className="px-2.5 pb-1.5 pt-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">Mover a</p>
                    {PLANS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setPlanOpen(false);
                          onPlan(p);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold text-fg-2 hover:bg-white/[0.05] hover:text-fg"
                      >
                        <span className="size-2 rounded-full" style={{ background: PLAN_COLOR[p] }} />
                        <span className="flex-1">{p}</span>
                        <span className="text-[11.5px] text-muted tabular">{money(PLAN_PRICE[p])}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={onClear} aria-label="Quitar selección" className="hidden size-10 place-items-center rounded-xl text-muted transition hover:bg-white/[0.06] hover:text-fg sm:grid">
                <X className="size-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Toast ────────────────────────────────────────────────── */
export type ToastMsg = { id: number; title: string; detail?: string; tone?: "lime" | "emerald" | "violet" };

export function Toast({ msg, lifted }: { msg: ToastMsg | null; lifted: boolean }) {
  const tone = msg?.tone ?? "lime";
  const Icon = tone === "emerald" ? MessageCircle : Check;
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-3 z-[70] flex justify-center transition-[bottom] duration-300 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 lg:left-[calc(50%+128px)]",
        lifted ? "bottom-[150px] sm:bottom-24" : "bottom-5",
      )}
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {msg && (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="flex items-center gap-3 rounded-2xl border border-line-strong bg-surface-2/95 py-2.5 pl-2.5 pr-4 shadow-[0_24px_60px_-16px_rgb(0_0_0/0.9)] backdrop-blur-xl"
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-xl",
                tone === "emerald" ? "bg-emerald/15 text-emerald" : tone === "violet" ? "bg-violet/15 text-violet" : "bg-lime text-lime-ink",
              )}
            >
              <Icon className="size-4" strokeWidth={2.6} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-bold text-fg">{msg.title}</span>
              {msg.detail && <span className="block text-[11.5px] text-muted">{msg.detail}</span>}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
