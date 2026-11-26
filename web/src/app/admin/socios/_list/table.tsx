"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, ChevronRight, CircleDollarSign, MessageCircle, RefreshCcw } from "lucide-react";
import { Pill } from "@/components/ui/primitives";
import { STATUS_META } from "@/lib/mock";
import { cn, money } from "@/lib/utils";
import { PLAN_COLOR, inGym, isRisk, type Row } from "./data";
import { AttendanceBars, Checkbox, DueMeter, Highlight, MemberAvatar } from "./parts";

export type SortKey = "name" | "due" | "last" | "att" | "debt";
export type Sort = { key: SortKey; dir: 1 | -1 };

export type RowActions = {
  onCharge: (r: Row) => void;
  onMessage: (r: Row) => void;
  onOpen: (r: Row) => void;
};

const href = (r: Row) => (r.hasProfile ? `/admin/socios/${r.id}` : undefined);

const lastSub = (r: Row) =>
  r.last.daysAgo < 0 ? "Alta hoy" : inGym(r) ? "En el gym" : r.last.daysAgo === 0 ? "Hoy" : r.last.daysAgo > 14 ? "Sin ingresos" : r.last.daysAgo > 7 ? "Ausente" : r.branch;

const cuotas = (r: Row) => {
  const n = Math.max(1, Math.round(r.debt / (r.amount || r.debt)));
  return n === 1 ? "1 cuota" : `${n} cuotas`;
};

/* ── Celda de saldo ───────────────────────────────────────── */
function Balance({ r }: { r: Row }) {
  if (r.debt > 0)
    return (
      <span className="block text-right">
        <span className="block whitespace-nowrap text-[13px] font-extrabold text-rose tabular">− {money(r.debt)}</span>
        <span className="mt-0.5 block text-[11px] font-semibold text-muted">
          {cuotas(r)}
        </span>
      </span>
    );
  return (
    <span className="block text-right">
      <span className={cn("flex items-center justify-end gap-1.5 text-[13px] font-bold tabular", r.status === "congelado" ? "text-muted" : "text-fg-2")}>
        {r.auto && r.status !== "congelado" && <RefreshCcw className="size-3 text-violet xl:hidden" aria-label="Débito automático" />}
        {r.status === "congelado" ? "—" : "Al día"}
      </span>
      {r.auto && r.status !== "congelado" && (
        <span className="mt-0.5 hidden items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-violet xl:inline-flex">
          <RefreshCcw className="size-3" /> Débito aut.
        </span>
      )}
    </span>
  );
}

function ActionBtn({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn("grid size-8 shrink-0 place-items-center rounded-lg transition active:scale-95", className)}
    >
      {children}
    </button>
  );
}

function Th({ k, children, className, sort, onSort }: { k?: SortKey; children: React.ReactNode; className?: string; sort: Sort; onSort: (k: SortKey) => void }) {
  const on = k && sort.key === k;
  const Arrow = sort.dir === 1 ? ArrowUp : ArrowDown;
  return (
    <th className={cn("px-3 py-3 font-bold", className)} aria-sort={on ? (sort.dir === 1 ? "ascending" : "descending") : undefined}>
      {k ? (
        <button
          type="button"
          onClick={() => onSort(k)}
          className={cn("group/th inline-flex items-center gap-1 whitespace-nowrap uppercase tracking-[0.1em] transition hover:text-fg-2", on && "text-fg-2")}
        >
          {children}
          <Arrow className={cn("size-3 transition", on ? "opacity-100 text-lime" : "opacity-0 group-hover/th:opacity-60")} strokeWidth={2.6} />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

/* ── Tabla (≥ md) ─────────────────────────────────────────── */
export function MembersTable({
  rows,
  q,
  sort,
  onSort,
  selected,
  onToggle,
  onToggleAll,
  fresh,
  actions,
}: {
  rows: Row[];
  q: string;
  sort: Sort;
  onSort: (k: SortKey) => void;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  fresh: string | null;
  actions: RowActions;
}) {
  const router = useRouter();
  const all = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const some = !all && rows.some((r) => selected.has(r.id));

  return (
    <table className="w-full table-fixed text-left text-[13px]">
      <colgroup>
        <col className="w-[44px] xl:w-[46px]" />
        <col />
        <col className="hidden w-[150px] xl:table-column" />
        <col className="w-[100px] xl:w-[108px]" />
        <col className="w-[140px] xl:w-[158px]" />
        <col className="hidden w-[108px] xl:table-column" />
        <col className="hidden xl:table-column xl:w-[118px]" />
        <col className="w-[104px]" />
        <col className="w-[76px] xl:w-[120px]" />
      </colgroup>
      <thead>
        <tr className="border-y border-line text-[11px] uppercase tracking-[0.1em] text-faint">
          <th className="py-3 pl-4 pr-1 xl:pl-5">
            <Checkbox checked={all} indeterminate={some} onChange={onToggleAll} label="Seleccionar todos" />
          </th>
          <Th sort={sort} onSort={onSort} k="name">Socio</Th>
          <Th sort={sort} onSort={onSort} className="hidden xl:table-cell">Plan</Th>
          <Th sort={sort} onSort={onSort}>Estado</Th>
          <Th sort={sort} onSort={onSort} k="due">Vencimiento</Th>
          <Th sort={sort} onSort={onSort} k="last" className="hidden xl:table-cell">
            Últ. visita
          </Th>
          <Th sort={sort} onSort={onSort} k="att" className="hidden xl:table-cell">
            Asistencia
          </Th>
          <Th sort={sort} onSort={onSort} k="debt" className="text-right [&>button]:flex-row-reverse">
            Saldo
          </Th>
          <th className="py-3 pl-2 pr-5" aria-label="Acciones" />
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const st = STATUS_META[r.status];
          const sel = selected.has(r.id);
          const link = href(r);
          const risk = isRisk(r);
          return (
            <tr
              key={r.id}
              onClick={() => (link ? router.push(link) : actions.onOpen(r))}
              className={cn(
                "group relative cursor-pointer border-b border-line/60 transition-colors last:border-0",
                sel ? "bg-lime/[0.045] hover:bg-lime/[0.07]" : "hover:bg-white/[0.025]",
                fresh === r.id && "bg-lime/[0.09]",
              )}
            >
              <td className="py-3 pl-4 pr-1 xl:pl-5">
                <span className={cn("absolute inset-y-0 left-0 w-[2px] bg-lime transition-opacity", sel ? "opacity-100" : "opacity-0")} />
                <Checkbox checked={sel} onChange={() => onToggle(r.id)} label={`Seleccionar a ${r.name}`} />
              </td>
              <td className="px-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="relative shrink-0">
                    <MemberAvatar r={r} size={36} />
                    {inGym(r) && (
                      <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-lime" title="En el gym ahora" />
                    )}
                  </span>
                  <span className="min-w-0">
                    {link ? (
                      <Link
                        href={link}
                        onClick={(e) => e.stopPropagation()}
                        className="block truncate font-bold text-fg transition-colors group-hover:text-lime"
                      >
                        <Highlight text={r.name} q={q} />
                      </Link>
                    ) : (
                      <span className="block truncate font-bold text-fg transition-colors group-hover:text-lime">
                        <Highlight text={r.name} q={q} />
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 truncate text-[11.5px] text-muted">
                      <span className="tabular">
                        #<Highlight text={r.id} q={q} />
                      </span>
                      <span className="text-faint">·</span>
                      <span className="truncate xl:hidden">{r.plan}</span>
                      <span className="hidden truncate xl:inline">{r.isNew ? `Alta ${r.since}` : `desde ${r.since.slice(-4)}`}</span>
                      {r.isNew && (
                        <span className="rounded bg-violet/15 px-1 py-px text-[9.5px] font-extrabold uppercase tracking-wide text-violet xl:hidden">
                          Nuevo
                        </span>
                      )}
                    </span>
                  </span>
                </div>
              </td>
              <td className="hidden px-3 py-3 xl:table-cell">
                <span className="flex items-center gap-2 truncate font-semibold text-fg-2">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: PLAN_COLOR[r.plan] }} />
                  <span className="truncate">{r.plan}</span>
                </span>
                <span className="mt-0.5 block truncate pl-4 text-[11.5px] text-muted">{r.branch}</span>
              </td>
              <td className="px-3 py-3">
                <Pill tone={st.tone} dot>
                  {st.label}
                </Pill>
                {(r.isNew || risk) && (
                  <span className={cn("mt-1 block pl-1 text-[10.5px] font-bold", r.isNew ? "text-violet" : "text-rose/90")}>
                    {r.isNew ? "Alta nueva" : "En riesgo"}
                  </span>
                )}
              </td>
              <td className="px-3 py-3">
                <DueMeter r={r} />
              </td>
              <td className="hidden px-3 py-3 xl:table-cell">
                <span className={cn("block font-semibold tabular", r.last.daysAgo === 0 ? "text-fg" : r.last.daysAgo > 7 ? "text-rose/90" : "text-fg-2")}>
                  {r.last.label.replace("Hoy · ", "")}
                </span>
                <span className="mt-0.5 block text-[11.5px] text-muted">{lastSub(r)}</span>
              </td>
              <td className="hidden px-3 py-3 xl:table-cell">
                <AttendanceBars r={r} />
              </td>
              <td className="px-3 py-3">
                <Balance r={r} />
              </td>
              <td className="py-3 pl-1 pr-4 xl:pl-2 xl:pr-5">
                <div className="flex items-center justify-end gap-1">
                  <ActionBtn
                    label={`Cobrar a ${r.name}`}
                    onClick={() => actions.onCharge(r)}
                    className={cn(
                      "hidden xl:grid",
                      r.debt > 0
                        ? "bg-lime text-lime-ink shadow-[0_6px_20px_-6px_rgb(181_245_74/0.6)] hover:bg-[#c4fa66]"
                        : "text-muted opacity-0 hover:bg-white/[0.07] hover:text-fg group-hover:opacity-100 focus-visible:opacity-100",
                    )}
                  >
                    <CircleDollarSign className="size-4" />
                  </ActionBtn>
                  <ActionBtn
                    label={`Escribir a ${r.name} por WhatsApp`}
                    onClick={() => actions.onMessage(r)}
                    className="bg-emerald/10 text-emerald opacity-0 hover:bg-emerald/20 group-hover:opacity-100 focus-visible:opacity-100 max-xl:opacity-100"
                  >
                    <MessageCircle className="size-4" />
                  </ActionBtn>
                  <ActionBtn
                    label={r.hasProfile ? "Ver ficha" : "Vista rápida"}
                    onClick={() => actions.onOpen(r)}
                    className="text-muted hover:bg-white/[0.07] hover:text-fg group-hover:text-fg"
                  >
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </ActionBtn>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ── Lista de tarjetas (mobile) · deslizar para acciones ─── */
export function MemberCards({
  rows,
  q,
  selected,
  onToggle,
  fresh,
  actions,
}: {
  rows: Row[];
  q: string;
  selected: Set<string>;
  onToggle: (id: string) => void;
  fresh: string | null;
  actions: RowActions;
}) {
  const router = useRouter();
  const selecting = selected.size > 0;

  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => {
        const st = STATUS_META[r.status];
        const sel = selected.has(r.id);
        const link = href(r);
        const open = () => (selecting ? onToggle(r.id) : link ? router.push(link) : actions.onOpen(r));
        return (
          <li
            key={r.id}
            className={cn(
              "stagger overflow-hidden rounded-2xl border bg-surface transition-colors",
              sel ? "border-lime/40 bg-lime/[0.04]" : "border-line",
              fresh === r.id && "bg-lime/[0.09]",
            )}
            style={{ "--i": Math.min(i, 8) } as React.CSSProperties}
          >
            <div className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain no-scrollbar">
              {/* Contenido */}
              <div className="relative w-full shrink-0 snap-start p-3.5" onClick={open} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && open()}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-pressed={sel}
                    aria-label={`Seleccionar a ${r.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(r.id);
                    }}
                    className="relative shrink-0 rounded-full"
                  >
                    <MemberAvatar r={r} size={44} className={cn("transition", sel && "scale-90 opacity-40")} />
                    {sel && (
                      <span className="absolute inset-0 grid animate-pop place-items-center">
                        <span className="grid size-6 place-items-center rounded-full bg-lime text-lime-ink">
                          <Check className="size-3.5" strokeWidth={3.4} />
                        </span>
                      </span>
                    )}
                    {!sel && inGym(r) && (
                      <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-surface bg-lime" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold leading-tight text-fg">
                      <Highlight text={r.name} q={q} />
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-muted">
                      <span className="size-1.5 shrink-0 rounded-full" style={{ background: PLAN_COLOR[r.plan] }} />
                      <span className="truncate">
                        #{r.id} · {r.plan}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Pill tone={st.tone} dot>
                      {st.label}
                    </Pill>
                    {r.debt > 0 ? (
                      <span className="text-[12.5px] font-extrabold text-rose tabular">− {money(r.debt)}</span>
                    ) : r.isNew ? (
                      <span className="text-[11px] font-bold text-violet">Alta {r.since}</span>
                    ) : (
                      <span className="text-[11.5px] font-semibold text-muted">{r.last.label}</span>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-4 border-t border-line/70 pt-3">
                  <DueMeter r={r} />
                  <AttendanceBars r={r} />
                </div>
                {/* indicador de deslizamiento */}
                <span className="absolute right-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-l-full bg-white/10" aria-hidden />
              </div>

              {/* Acciones (se revelan al deslizar) */}
              <div className="flex shrink-0 snap-end">
                <button
                  type="button"
                  onClick={() => actions.onCharge(r)}
                  className="flex w-[78px] flex-col items-center justify-center gap-1.5 bg-lime text-[11.5px] font-bold text-lime-ink"
                >
                  <CircleDollarSign className="size-5" /> Cobrar
                </button>
                <button
                  type="button"
                  onClick={() => actions.onMessage(r)}
                  className="flex w-[78px] flex-col items-center justify-center gap-1.5 bg-emerald/90 text-[11.5px] font-bold text-ink"
                >
                  <MessageCircle className="size-5" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => actions.onOpen(r)}
                  className="flex w-[78px] flex-col items-center justify-center gap-1.5 bg-surface-3 text-[11.5px] font-bold text-fg"
                >
                  <ChevronRight className="size-5" /> Ficha
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
