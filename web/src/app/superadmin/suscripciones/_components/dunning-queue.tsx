"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, CircleAlert, Loader2, RotateCw, Send } from "lucide-react";
import { Pill } from "@/components/ui/primitives";
import { cn, money } from "@/lib/utils";
import { initials } from "../../_data";
import type { DunningRow } from "../_data";

type RowState = "idle" | "retrying" | "paid" | "failed" | "linked";

/** Resultado simulado del reintento: los rechazos "blandos" en el 1.º–2.º intento se recuperan. */
const recovers = (d: DunningRow) => d.attempt <= 2 && /fondos|banco|límite/i.test(d.reason);
const hardFail = (d: DunningRow) => /vencida|cerrada/i.test(d.reason);

export function DunningQueue({ rows, total }: { rows: DunningRow[]; total: number }) {
  const [state, setState] = useState<Record<string, RowState>>({});
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const retry = (d: DunningRow) => {
    setState((s) => ({ ...s, [d.tenant]: "retrying" }));
    timers.current.push(
      window.setTimeout(() => setState((s) => ({ ...s, [d.tenant]: recovers(d) ? "paid" : "failed" })), 1100 + rows.indexOf(d) * 180),
    );
  };
  const sendLink = (d: DunningRow) => setState((s) => ({ ...s, [d.tenant]: "linked" }));
  const retryable = rows.filter((d) => !hardFail(d) && !["retrying", "paid"].includes(state[d.tenant] ?? "idle"));
  const recovered = rows.filter((d) => state[d.tenant] === "paid").reduce((a, d) => a + d.amount, 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 px-5">
        <div>
          <p className="text-[28px] font-extrabold leading-none tracking-[-0.04em] text-rose tabular">{money(total - recovered)}</p>
          <p className="mt-1 text-[12px] font-semibold text-muted">
            en recupero · <span className="text-fg-2">{rows.length - rows.filter((d) => state[d.tenant] === "paid").length} cuentas</span>
            {recovered > 0 && (
              <span className="text-lime">
                {" "}
                · {money(recovered)} recuperado ahora
              </span>
            )}
          </p>
        </div>
        <button
          disabled={retryable.length === 0}
          onClick={() => retryable.forEach(retry)}
          className="flex h-9 items-center gap-2 rounded-xl bg-lime px-3.5 text-[12.5px] font-bold text-lime-ink shadow-[0_8px_24px_-10px_rgb(181_245_74/0.7)] transition hover:bg-[#c4fa66] active:scale-[0.97] disabled:opacity-40"
        >
          <RotateCw className="size-3.5" /> Reintentar {retryable.length > 0 ? `(${retryable.length})` : "todos"}
        </button>
      </div>

      <ul className="mt-4 divide-y divide-line/70 border-t border-line/70">
        {rows.map((d) => {
          const st = state[d.tenant] ?? "idle";
          const critical = d.attempt >= 3;
          const href = d.inDirectory ? `/superadmin/gimnasios/${d.tenant}` : undefined;
          return (
            <li
              key={d.tenant}
              className={cn(
                "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-5 py-3.5 transition md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1.2fr)_auto_auto]",
                st === "paid" && "bg-lime/[0.04]",
              )}
            >
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-xl text-[11.5px] font-extrabold",
                  critical ? "bg-rose/12 text-rose ring-1 ring-rose/25" : "bg-white/[0.06] text-fg-2",
                )}
              >
                {initials(d.name)}
              </span>

              <span className="min-w-0">
                {href ? (
                  <Link href={href} className="block truncate text-[13.5px] font-bold text-fg transition hover:text-lime">
                    {d.name}
                  </Link>
                ) : (
                  <span className="block truncate text-[13.5px] font-bold text-fg">{d.name}</span>
                )}
                <span className="mt-0.5 block truncate text-[11.5px] font-semibold text-muted">
                  #{d.tenant} · {d.plan}
                </span>
              </span>

              {/* intentos + motivo (desde md) */}
              <span className="hidden min-w-0 md:block">
                <span className="flex items-center gap-1" aria-label={`Intento ${d.attempt} de 4`}>
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className={cn(
                        "h-1.5 w-5 rounded-full",
                        n <= d.attempt ? (d.attempt >= 3 ? "bg-rose" : "bg-amber") : "bg-white/[0.08]",
                      )}
                    />
                  ))}
                  <span className="ml-1.5 text-[11px] font-bold text-fg-2 tabular">{d.attempt}/4</span>
                </span>
                <span className="mt-1 block truncate text-[11.5px] font-semibold text-muted" title={`${d.method} · falló ${d.failedAt}`}>
                  {d.reason}
                </span>
              </span>

              <span className="text-right">
                <span className="block text-[13.5px] font-bold text-fg tabular">{money(d.amount)}</span>
                <span className={cn("block whitespace-nowrap text-[11px] font-semibold", critical ? "text-rose" : "text-muted")}>
                  {st === "paid" ? "Cobrado" : d.nextRetry}
                </span>
              </span>

              {/* acciones: fila propia en mobile */}
              <span className="col-span-3 flex items-center gap-2 md:col-span-1 md:w-[150px] md:justify-end 2xl:w-auto">
                <span className="mr-auto flex min-w-0 items-center gap-1 text-[11px] font-semibold text-muted md:hidden">
                  <span className={cn("tabular font-bold", d.attempt >= 3 ? "text-rose" : "text-amber")}>{d.attempt}/4</span>
                  <span className="truncate">· {d.reason}</span>
                </span>
                {st === "paid" ? (
                  <Pill tone="lime" dot>
                    Pago recuperado
                  </Pill>
                ) : st === "linked" ? (
                  <Pill tone="cyan">
                    <Check className="size-3" /> Link enviado
                  </Pill>
                ) : (
                  <>
                    {st === "failed" && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose">
                        <CircleAlert className="size-3.5" /> Rechazado
                      </span>
                    )}
                    <button
                      onClick={() => sendLink(d)}
                      title="Enviar link de pago"
                      className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-line px-2.5 text-[12px] font-semibold text-fg-2 transition hover:border-line-strong hover:text-fg"
                    >
                      <Send className="size-3.5" /> <span className="max-2xl:sr-only">Link de pago</span>
                    </button>
                    {!hardFail(d) && (
                      <button
                        onClick={() => retry(d)}
                        disabled={st === "retrying"}
                        className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-white/[0.07] px-2.5 text-[12px] font-bold text-fg transition hover:bg-white/[0.12] disabled:opacity-70"
                      >
                        {st === "retrying" ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCw className="size-3.5" />}
                        {st === "retrying" ? "Cobrando…" : "Reintentar"}
                      </button>
                    )}
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
