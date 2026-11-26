import { ArrowDownLeft, ArrowUpRight, Banknote, Receipt, ShieldCheck, Vault } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Delta } from "@/components/ui/primitives";
import { cn, money } from "@/lib/utils";
import { BALANCE, CASH_DRAWER, HOURLY_INCOME, METHODS, REGISTER } from "../_data";
import { METHOD_ICON } from "../_icons";
import { SegmentBar } from "./segment-bar";

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function RegisterSummary() {
  const total = REGISTER.income;
  const maxH = Math.max(...HOURLY_INCOME);
  const avgTicket = Math.round(REGISTER.income / REGISTER.ops);

  return (
    <article className="panel glow-lime stagger relative overflow-hidden p-5 sm:p-6" style={s(1)}>
      {/* Fondo: grilla técnica + brillo */}
      <div
        className="grid-lines pointer-events-none absolute inset-0 opacity-60"
        style={{ maskImage: "radial-gradient(120% 80% at 100% 0%, black, transparent 65%)" }}
      />
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-lime/[0.10] blur-[70px]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-lime/12 text-lime ring-1 ring-inset ring-lime/25">
              <Vault className="size-[18px]" />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-fg-2">Saldo del turno</p>
              <p className="text-[11.5px] text-muted">Caja 01 · Mostrador principal</p>
            </div>
          </div>
          <p className="mt-4 text-[42px] font-extrabold leading-none tracking-[-0.045em] text-fg tabular sm:text-[54px]">
            <CountUp value={BALANCE} prefix="$ " />
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-muted">
            <Delta value={8.6} solid />
            <span>vs. turno mañana de ayer</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald" />
              Arqueo OK a las <b className="font-bold text-fg-2">{REGISTER.lastCount}</b>
            </span>
          </div>
        </div>

        {/* Ingresos por franja */}
        <div className="w-full shrink-0 rounded-2xl border border-line bg-ink/40 p-3.5 lg:w-[218px]">
          <div className="flex items-center justify-between text-[11.5px] font-semibold">
            <span className="text-fg-2">Ingresos cada 15 min</span>
            <span className="text-muted tabular">07:00–08:52</span>
          </div>
          <div className="mt-3 flex h-[62px] items-end gap-1.5">
            {HOURLY_INCOME.map((v, i) => (
              <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
                <span
                  className={cn(
                    "block w-full rounded-[5px] transition-all duration-300 group-hover:brightness-125",
                    v === maxH ? "bg-lime shadow-[0_0_14px_-2px_rgb(181_245_74/0.7)]" : i === HOURLY_INCOME.length - 1 ? "bg-lime/25 [background-image:repeating-linear-gradient(135deg,transparent_0_3px,rgb(181_245_74/0.25)_3px_5px)]" : "bg-white/[0.12]",
                  )}
                  style={{ height: `${(v / maxH) * 100}%`, animation: `fade-up .7s cubic-bezier(.22,1,.36,1) ${300 + i * 50}ms both` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-faint tabular">
            <span>07:00</span>
            <span>08:00</span>
            <span>Ahora</span>
          </div>
        </div>
      </div>

      {/* Ingresos / egresos / efectivo */}
      <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { label: "Ingresos", value: money(REGISTER.income), sub: `${REGISTER.ops} operaciones`, icon: ArrowDownLeft, cls: "text-lime bg-lime/12" },
          { label: "Egresos", value: `− ${money(REGISTER.expenses)}`, sub: "2 movimientos", icon: ArrowUpRight, cls: "text-rose bg-rose/12" },
          { label: "En cajón", value: money(CASH_DRAWER), sub: `Fondo ${money(REGISTER.opening)}`, icon: Banknote, cls: "text-amber bg-amber/12" },
          { label: "Ticket promedio", value: money(avgTicket), sub: "+$ 1.840 vs. ayer", icon: Receipt, cls: "text-violet bg-violet/12" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-line bg-white/[0.02] p-3 transition hover:border-line-strong hover:bg-white/[0.035]">
            <div className="flex items-center gap-2">
              <span className={cn("grid size-6 place-items-center rounded-md", k.cls)}>
                <k.icon className="size-3.5" strokeWidth={2.4} />
              </span>
              <span className="truncate text-[11.5px] font-semibold text-muted">{k.label}</span>
            </div>
            <p className="mt-2 truncate text-[17px] font-extrabold tracking-[-0.02em] text-fg tabular sm:text-[18px]">{k.value}</p>
            <p className="mt-0.5 truncate text-[11px] text-faint">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Por medio de pago */}
      <div className="relative mt-6 border-t border-line pt-5">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="text-[13px] font-bold text-fg">Por medio de pago</p>
          <p className="text-[12px] font-semibold text-muted tabular">
            Total <span className="text-fg">{money(total)}</span>
          </p>
        </div>
        <SegmentBar items={METHODS} />
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
          {METHODS.map((m) => {
            const Icon = METHOD_ICON[m.key];
            const pct = (m.amount / total) * 100;
            return (
              <li key={m.key} className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 shrink-0 rounded-[3px]" style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }} />
                  <span className="truncate text-[11.5px] font-semibold text-fg-2">{m.label}</span>
                </div>
                <p className="mt-1 text-[14.5px] font-extrabold tracking-[-0.02em] text-fg tabular">{money(m.amount)}</p>
                <p className="flex items-center gap-1 text-[11px] text-muted tabular">
                  <Icon className="size-3" style={{ color: m.color }} />
                  {pct.toLocaleString("es-AR", { maximumFractionDigits: 1 })}% · {m.ops} op.
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
