"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Check, CheckCircle2, MessageCircle, Send, Wallet } from "lucide-react";
import { Avatar, Delta, SectionTitle } from "@/components/ui/primitives";
import { cn, compactMoney, fmt, money } from "@/lib/utils";
import { AGING, DEBTORS, EV_PREFILL, bucketOf, type PrefillDetail } from "../_data";

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function Collections() {
  const [filter, setFilter] = useState<string | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [paid, setPaid] = useState<Record<string, boolean>>({});

  const list = DEBTORS.filter((d) => !filter || bucketOf(d.days).key === filter).sort((a, b) => b.days - a.days);
  const pending = AGING.slice(1).reduce((a, b) => a + b.amount, 0);
  const debtorsCount = AGING.slice(1).reduce((a, b) => a + b.members, 0);

  function remind(id: string) {
    setSent((x) => ({ ...x, [id]: true }));
  }
  function remindAll() {
    setSent(Object.fromEntries(list.map((d) => [d.id, true])));
  }
  function collect(d: (typeof DEBTORS)[number]) {
    const detail: PrefillDetail = { memberId: d.id, name: d.name, face: d.face, plan: d.plan, amount: d.amount };
    window.dispatchEvent(new CustomEvent(EV_PREFILL, { detail }));
    setPaid((x) => ({ ...x, [d.id]: true }));
  }

  return (
    <article className="panel stagger p-5 sm:p-6" style={s(6)}>
      <SectionTitle
        title="Cobranzas"
        hint={
          <>
            {fmt(debtorsCount)} socios con deuda · <b className="font-bold text-fg-2">{money(pending)}</b> pendientes
          </>
        }
        action={
          <button
            onClick={remindAll}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-emerald/12 px-3 text-[12.5px] font-bold text-emerald ring-1 ring-inset ring-emerald/25 transition hover:bg-emerald/20"
          >
            <Send className="size-3.5" /> <span className="hidden sm:inline">Recordar a todos</span>
            <span className="sm:hidden">Recordar</span>
          </button>
        }
      />

      {/* Antigüedad de deuda */}
      <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {AGING.map((a, i) => {
          const isOk = a.key === "ok";
          const on = filter === a.key;
          return (
            <button
              key={a.key}
              disabled={isOk}
              onClick={() => setFilter(on ? null : a.key)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-300",
                isOk ? "cursor-default border-lime/25 bg-lime/[0.05]" : "border-line bg-white/[0.02] hover:-translate-y-0.5 hover:border-line-strong",
              )}
              style={
                on
                  ? { borderColor: `color-mix(in oklab, ${a.color} 60%, transparent)`, background: `color-mix(in oklab, ${a.color} 9%, transparent)`, boxShadow: `0 0 26px -10px ${a.color}` }
                  : undefined
              }
            >
              <span
                className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-50"
                style={{ background: a.color }}
              />
              <div className="relative flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[12px] font-bold text-fg">
                  <span className="size-2 rounded-full" style={{ background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
                  {a.label}
                </span>
                {isOk ? <CheckCircle2 className="size-4 text-lime" /> : <Delta value={a.delta} className={a.delta > 0 ? "!text-rose" : "!text-lime"} />}
              </div>
              <p className="relative mt-3 text-[26px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">
                {fmt(a.members)}
                <span className="ml-1 text-[12px] font-semibold tracking-normal text-muted">socios</span>
              </p>
              <p className="relative mt-1.5 truncate text-[12.5px] font-bold text-fg-2 tabular">
                {isOk ? `${a.share.toLocaleString("es-AR")}% del padrón` : compactMoney(a.amount)}
              </p>
              <p className="relative truncate text-[11px] text-faint">{isOk ? "Cuotas al día" : a.range}</p>
              <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${isOk ? a.share : Math.min(100, a.share * 12)}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: a.color }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Deudores */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-faint">
          {filter ? `Deudores · ${AGING.find((a) => a.key === filter)?.label}` : "Deudores prioritarios"}
        </p>
        {filter && (
          <button onClick={() => setFilter(null)} className="text-[12px] font-bold text-lime hover:underline">
            Ver todos
          </button>
        )}
      </div>
      <ul className="mt-2 divide-y divide-line/70">
        <AnimatePresence initial={false} mode="popLayout">
          {list.map((d) => {
            const b = bucketOf(d.days);
            const wasSent = sent[d.id];
            const wasPaid = paid[d.id];
            return (
              <motion.li
                key={d.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2.5 py-3 md:grid-cols-[auto_minmax(0,1.4fr)_120px_minmax(0,1fr)_auto]"
              >
                <Avatar i={d.face} size={38} />
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-bold text-fg">{d.name}</p>
                  <p className="truncate text-[11.5px] text-muted">
                    {d.plan} · {d.periods} {d.periods > 1 ? "cuotas" : "cuota"}
                  </p>
                </div>
                <div className="text-right md:text-left">
                  <p className="text-[14px] font-extrabold text-fg tabular">{money(d.amount)}</p>
                  <span
                    className="mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[10.5px] font-bold"
                    style={{ color: b.color, background: `color-mix(in oklab, ${b.color} 13%, transparent)` }}
                  >
                    {d.days === 1 ? "1 día" : `${d.days} días`}
                  </span>
                </div>
                <p className="col-start-2 truncate text-[11.5px] text-muted md:col-start-auto">
                  {wasSent ? <span className="font-semibold text-emerald">Recordatorio enviado ahora</span> : d.reminded}
                </p>
                <div className="col-start-3 row-start-2 flex items-center justify-end gap-1.5 md:col-start-auto md:row-start-auto">
                  <button
                    onClick={() => remind(d.id)}
                    disabled={wasSent}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-bold transition",
                      wasSent ? "bg-emerald/10 text-emerald/80" : "bg-emerald/12 text-emerald hover:bg-emerald/22",
                    )}
                    title="Recordar por WhatsApp"
                  >
                    {wasSent ? <Check className="size-3.5" /> : <MessageCircle className="size-3.5" />}
                    <span className="hidden xl:inline">{wasSent ? "Enviado" : "Recordar"}</span>
                  </button>
                  <button
                    onClick={() => collect(d)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-bold transition",
                      wasPaid ? "border-lime/30 bg-lime/10 text-lime" : "border-lime/45 text-lime hover:bg-lime hover:text-lime-ink",
                    )}
                  >
                    <Wallet className="size-3.5" /> Cobrar
                  </button>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </article>
  );
}
