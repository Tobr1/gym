import type { Metadata } from "next";
import { BellRing, Lock, Plus, Printer, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { PillBars } from "@/components/pill-bars";
import { Avatar, Button, Delta, Ring, SectionTitle, buttonClass } from "@/components/ui/primitives";
import { money } from "@/lib/utils";
import { MONTHLY, RECOVERY } from "./_data";
import { Collections } from "./_components/collections";
import { MovementsTable } from "./_components/movements-table";
import { QuickCharge } from "./_components/quick-charge";
import { RegisterSummary } from "./_components/register-summary";

export const metadata: Metadata = { title: "Caja y cobranzas" };

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default function CajaPage() {
  const last = MONTHLY.at(-1)!;
  const prev = MONTHLY.at(-2)!;
  const growth = ((last.value - prev.value) / prev.value) * 100;

  return (
    <>
      <PageHeader
        eyebrow={
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-lime/25 bg-lime/[0.08] py-1 pl-2 pr-2.5 font-bold text-lime">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-lime" />
                <span className="relative size-2 rounded-full bg-lime" />
              </span>
              Caja abierta
            </span>
            <span>Turno mañana · desde 07:00</span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              · <Avatar i={12} size={18} /> Carolina V.
            </span>
          </span>
        }
        title="Caja y cobranzas"
      >
        <Button variant="ghost" className="hidden xl:inline-flex">
          <Printer className="size-4" /> Reporte Z
        </Button>
        <Button variant="secondary">
          <Lock className="size-4" /> Cerrar caja
        </Button>
        <a href="#cobro" className={buttonClass("primary", "md")}>
          <Plus className="size-4" strokeWidth={2.6} /> Nuevo cobro
        </a>
      </PageHeader>

      {/* ── Caja + POS ───────────────────────────────────── */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,1fr)] xl:grid-rows-[auto_1fr]">
        <div className="min-w-0 xl:col-start-1 xl:row-start-1">
          <RegisterSummary />
        </div>
        <div className="min-w-0 xl:col-start-2 xl:row-span-2 xl:row-start-1 [&>article]:h-full">
          <QuickCharge />
        </div>

        {/* Facturación mensual */}
        <article className="panel stagger flex flex-col gap-5 p-5 sm:flex-row sm:items-stretch sm:p-6 xl:col-start-1 xl:row-start-2" style={s(3)}>
          <div className="flex shrink-0 flex-col justify-between sm:w-[200px]">
            <div>
              <SectionTitle title="Facturación mensual" hint="Últimos 7 meses · todas las sedes" />
              <p className="mt-4 text-[34px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">
                $ {last.value.toLocaleString("es-AR")}
                <span className="ml-1 text-[16px] font-bold text-muted">M</span>
              </p>
              <div className="mt-2 flex items-center gap-2 text-[12px] text-muted">
                <Delta value={Number(growth.toFixed(1))} solid /> vs. octubre
              </div>
              <p className="mt-3 hidden text-[11.5px] leading-snug text-muted sm:block">
                <b className="font-bold text-fg-2">Récord del año</b> · 6 meses en alza
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-white/[0.02] px-3 py-2 text-[11.5px] text-muted">
              <TrendingUp className="size-3.5 shrink-0 text-lime" />
              <span>
                Proyección dic: <b className="text-fg-2">$ 49,8 M</b>
              </span>
            </div>
          </div>
          <PillBars
            className="min-w-0 flex-1 sm:pl-2"
            height={128}
            highlight={MONTHLY.length - 1}
            data={MONTHLY.map((m) => ({ label: m.label, sub: `${m.value.toLocaleString("es-AR")}`, value: m.value }))}
          />
        </article>
      </section>

      {/* ── Movimientos ─────────────────────────────────── */}
      <section className="mt-4">
        <MovementsTable />
      </section>

      {/* ── Cobranzas ───────────────────────────────────── */}
      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Collections />

        <article className="panel glow-violet stagger relative flex flex-col overflow-hidden p-5 sm:p-6" style={s(7)}>
          <div className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-violet/[0.12] blur-[60px]" />
          <SectionTitle title="Tasa de recupero" hint="Deuda vencida recuperada en noviembre" className="relative" />
          <div className="relative mt-5 flex flex-1 flex-col md:grid md:grid-cols-2 md:gap-8 xl:flex xl:gap-0">
          <div className="flex items-center gap-5 md:flex-col md:justify-center md:gap-4">
            <Ring value={RECOVERY.rate} size={148} stroke={13} color="var(--color-violet)" className="shrink-0">
              <div>
                <p className="text-[38px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">
                  {RECOVERY.rate}
                  <span className="text-[18px] text-muted">%</span>
                </p>
                <p className="mt-1 text-[11px] font-semibold text-muted">recuperado</p>
              </div>
            </Ring>
            <div className="min-w-0 md:text-center">
              <p className="text-[20px] font-extrabold tracking-[-0.02em] text-fg tabular">{money(RECOVERY.recovered)}</p>
              <p className="text-[12px] text-muted">de {money(RECOVERY.target)} gestionados</p>
              <p className="mt-1.5 inline-flex items-center gap-1 text-[12px] text-muted">
                <Delta value={6.2} /> vs. octubre
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
          <div className="mt-5 space-y-2.5 border-t border-line pt-4 md:mt-0 md:border-t-0 md:pt-0 xl:mt-5 xl:border-t xl:pt-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-faint">Recuperado por canal</p>
            {RECOVERY.channels.map((c) => (
              <div key={c.label}>
                <div className="mb-1 flex items-center justify-between text-[12px] font-semibold">
                  <span className="text-fg-2">{c.label}</span>
                  <span className="text-fg tabular">{c.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full" style={{ width: `${c.value}%`, background: c.color, boxShadow: `0 0 10px -2px ${c.color}` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-2.5">
            {[
              { label: "Promesas de pago", value: "12", sub: "$ 584 K esta semana", cls: "text-amber" },
              { label: "Días a cobro", value: "4,2", sub: "−1,3 d vs. oct.", cls: "text-cyan" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-line bg-white/[0.02] p-3">
                <p className="truncate text-[11px] font-semibold text-muted">{k.label}</p>
                <p className={`mt-1 text-[22px] font-extrabold leading-none tracking-[-0.03em] tabular ${k.cls}`}>{k.value}</p>
                <p className="mt-1 truncate text-[10.5px] text-faint">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="min-h-4 flex-1" />
          <div className="relative flex items-start gap-2.5 rounded-xl border border-line bg-white/[0.02] p-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald/12 text-emerald">
              <BellRing className="size-3.5" />
            </span>
            <p className="text-[11.5px] leading-snug text-muted">
              <b className="font-bold text-fg-2">Recordatorios automáticos</b> activos por WhatsApp los días 1, 5 y 10.
            </p>
          </div>
          </div>
          </div>
        </article>
      </section>
    </>
  );
}
