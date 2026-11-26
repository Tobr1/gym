"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowUpRight, BadgeCheck, Download, FileText, ShoppingBag, Ticket } from "lucide-react";
import { Avatar, Pill, SectionTitle } from "@/components/ui/primitives";
import { cn, money } from "@/lib/utils";
import { EV_MOVEMENT, METHOD_META, MOVEMENTS, STATUS_PILL, type Movement } from "../_data";
import { METHOD_ICON } from "../_icons";

const TABS = [
  { key: "all", label: "Todos" },
  { key: "in", label: "Ingresos" },
  { key: "out", label: "Egresos" },
] as const;

const KIND_ICON = {
  producto: { icon: ShoppingBag, cls: "bg-violet/12 text-violet" },
  clase: { icon: Ticket, cls: "bg-cyan/12 text-cyan" },
  matricula: { icon: BadgeCheck, cls: "bg-amber/12 text-amber" },
  cuota: { icon: FileText, cls: "bg-lime/12 text-lime" },
  egreso: { icon: ArrowUpRight, cls: "bg-rose/12 text-rose" },
};

export function MovementsTable() {
  const [rows, setRows] = useState<Movement[]>(MOVEMENTS);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");

  useEffect(() => {
    const on = (e: Event) => setRows((r) => [(e as CustomEvent<Movement>).detail, ...r]);
    window.addEventListener(EV_MOVEMENT, on);
    return () => window.removeEventListener(EV_MOVEMENT, on);
  }, []);

  const shown = rows.filter((r) => (tab === "all" ? true : tab === "in" ? r.amount > 0 : r.amount < 0)).slice(0, PAGE);
  const count = (k: (typeof TABS)[number]["key"]) =>
    rows.filter((r) => (k === "all" ? true : k === "in" ? r.amount > 0 : r.amount < 0)).length;

  return (
    <article className="panel stagger overflow-hidden" style={{ "--i": 4 } as React.CSSProperties}>
      <div className="flex flex-col gap-3 p-5 pb-4 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pb-4">
        <SectionTitle title="Movimientos de hoy" hint="Turno mañana · actualizado en tiempo real" />
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-line bg-white/[0.02] p-1 text-[12.5px] font-semibold">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 transition-colors",
                  tab === t.key ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {tab === t.key && (
                  <motion.span layoutId="mv-tab" className="absolute inset-0 rounded-lg bg-surface-3 shadow" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                )}
                <span className="relative">
                  {t.label} <span className="text-faint tabular">{count(t.key)}</span>
                </span>
              </button>
            ))}
          </div>
          <button className="grid size-9 place-items-center rounded-xl border border-line text-muted transition hover:bg-white/5 hover:text-fg" aria-label="Exportar">
            <Download className="size-4" />
          </button>
        </div>
      </div>

      {/* Mobile: lista compacta */}
      <ul className="border-t border-line sm:hidden">
        <AnimatePresence initial={false}>
          {shown.map((r) => {
            const m = METHOD_META[r.method];
            const MIcon = METHOD_ICON[r.method];
            const k = KIND_ICON[r.kind];
            const st = STATUS_PILL[r.status];
            const out = r.amount < 0 && r.status === "acreditado";
            return (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, backgroundColor: "rgba(181,245,74,0.14)" }}
                animate={{ opacity: 1, backgroundColor: "rgba(181,245,74,0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                className={cn("flex items-center gap-3 border-b border-line/60 px-5 py-3 last:border-0", r.status === "anulado" && "opacity-55")}
              >
                {r.face !== undefined ? (
                  <Avatar i={r.face} size={36} />
                ) : (
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", k.cls)}>
                    <k.icon className="size-4" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-fg">
                    {r.who}
                    {r.fresh && (
                      <span className="ml-1.5 rounded bg-lime px-1 py-px align-middle text-[9px] font-extrabold uppercase text-lime-ink">Nuevo</span>
                    )}
                  </p>
                  <p className="truncate text-[11.5px] text-muted">{r.concept}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-faint">
                    <span className="tabular text-fg-2">{r.time}</span>·
                    <MIcon className="size-3 shrink-0" style={{ color: m.color }} />
                    <span className="truncate">{m.label}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={cn(
                      "whitespace-nowrap text-[13.5px] font-extrabold tabular",
                      r.amount < 0 ? "text-rose" : "text-fg",
                      r.status === "anulado" && "line-through",
                    )}
                  >
                    {r.amount < 0 ? `− ${money(-r.amount)}` : `+ ${money(r.amount)}`}
                  </span>
                  <Pill tone={out ? "violet" : st.tone} dot>
                    {out ? "Egreso" : st.label}
                  </Pill>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[600px] text-left text-[13px]">
          <thead>
            <tr className="border-y border-line text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
              <th className="py-3 pl-6 pr-3 font-bold">Hora</th>
              <th className="px-3 py-3 font-bold">Socio / concepto</th>
              <th className="px-3 py-3 font-bold">Medio</th>
              <th className="hidden px-3 py-3 font-bold xl:table-cell">Comprobante</th>
              <th className="px-3 py-3 text-right font-bold">Monto</th>
              <th className="py-3 pl-3 pr-6 text-right font-bold">Estado</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {shown.map((r) => {
                const m = METHOD_META[r.method];
                const MIcon = METHOD_ICON[r.method];
                const k = KIND_ICON[r.kind];
                const st = STATUS_PILL[r.status];
                return (
                  <motion.tr
                    key={r.id}
                    layout
                    initial={{ opacity: 0, backgroundColor: "rgba(181,245,74,0.14)" }}
                    animate={{ opacity: 1, backgroundColor: "rgba(181,245,74,0)" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                    className={cn(
                      "group border-b border-line/60 last:border-0 hover:!bg-white/[0.025]",
                      r.status === "anulado" && "opacity-55",
                    )}
                  >
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <span className="font-semibold text-fg-2 tabular">{r.time}</span>
                      {r.fresh && (
                        <span className="ml-1.5 rounded bg-lime px-1 py-px text-[9px] font-extrabold uppercase text-lime-ink">Nuevo</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {r.face !== undefined ? (
                          <Avatar i={r.face} size={34} />
                        ) : (
                          <span className={cn("grid size-[34px] shrink-0 place-items-center rounded-full", k.cls)}>
                            <k.icon className="size-4" />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-fg">{r.who}</span>
                          <span className="block truncate text-[11.5px] text-muted">{r.concept}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-2 whitespace-nowrap font-semibold text-fg-2">
                        <span
                          className="grid size-6 shrink-0 place-items-center rounded-md"
                          style={{ background: `color-mix(in oklab, ${m.color} 14%, transparent)`, color: m.color }}
                        >
                          <MIcon className="size-3.5" />
                        </span>
                        {m.label}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-3 font-mono text-[11.5px] text-muted xl:table-cell">{r.receipt}</td>
                    <td
                      className={cn(
                        "whitespace-nowrap px-3 py-3 text-right font-extrabold tabular",
                        r.amount < 0 ? "text-rose" : "text-fg",
                        r.status === "anulado" && "line-through",
                      )}
                    >
                      {r.amount < 0 ? `− ${money(-r.amount)}` : `+ ${money(r.amount)}`}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-3 pr-6 text-right">
                      <Pill tone={r.amount < 0 && r.status === "acreditado" ? "violet" : st.tone} dot>
                        {r.amount < 0 && r.status === "acreditado" ? "Egreso" : st.label}
                      </Pill>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-line px-6 py-3 text-[12px] text-muted">
        <span>
          Mostrando <b className="text-fg-2">{shown.length}</b> de {REGISTER_OPS + rows.length - MOVEMENTS.length} movimientos
        </span>
        <button className="font-bold text-lime hover:underline">Ver libro de caja</button>
      </div>
    </article>
  );
}

const REGISTER_OPS = 66;
const PAGE = MOVEMENTS.length;
