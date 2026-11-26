import type { Metadata } from "next";
import { Download, Hourglass, Magnet, Percent, Target } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { CountUp } from "@/components/count-up";
import { Avatar, Button, Delta, Ring, SectionTitle, Sparkline } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { FUNNEL, LEADS, SELLERS } from "./_data";
import { Board } from "./_components/board";
import { Funnel } from "./_components/funnel";
import { NewLeadButton } from "./_components/new-lead";

export const metadata: Metadata = { title: "CRM · Prospectos" };

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default function CrmPage() {
  const pipeline = LEADS.filter((l) => l.stage !== "ganado" && l.stage !== "perdido").reduce((a, l) => a + l.value, 0);
  const conversion = (FUNNEL[4].value / FUNNEL[0].value) * 100;

  return (
    <>
      <PageHeader
        eyebrow={
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            Pipeline comercial · Noviembre
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] py-0.5 pl-0.5 pr-2 text-[11.5px]">
              <span className="flex items-center">
                {SELLERS.map((x) => (
                  <Avatar key={x.id} i={x.face} size={18} className="-ml-1.5 ring-2 ring-ink first:ml-0" />
                ))}
              </span>
              4 vendedores
            </span>
          </span>
        }
        title="CRM de prospectos"
      >
        <Button variant="secondary" className="hidden sm:inline-flex">
          <Download className="size-4" /> Exportar
        </Button>
        <NewLeadButton />
      </PageHeader>

      {/* ── KPIs + embudo ─────────────────────────────────── */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <article className="panel stagger flex flex-col justify-between p-4 sm:p-5" style={s(1)}>
            <div className="flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-xl bg-cyan/12 text-cyan">
                <Magnet className="size-[18px]" />
              </span>
              <Delta value={14.2} />
            </div>
            <div className="mt-3">
              <p className="text-[12.5px] font-semibold text-muted">Leads del mes</p>
              <p className="mt-1 text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular sm:text-[34px]">
                <CountUp value={FUNNEL[0].value} />
              </p>
            </div>
            <Sparkline data={[22, 31, 27, 38, 34, 41, 36, 48]} color="var(--color-cyan)" height={26} fill={false} className="mt-2 opacity-80" />
          </article>

          <article className="panel stagger flex flex-col justify-between p-4 sm:p-5" style={s(2)}>
            <div className="flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-xl bg-violet/12 text-violet">
                <Percent className="size-[18px]" />
              </span>
              <Delta value={3.4} />
            </div>
            <div className="mt-3 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-muted">Tasa de conversión</p>
                <p className="mt-1 text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular sm:text-[34px]">
                  <CountUp value={conversion} decimals={1} suffix="%" />
                </p>
              </div>
              <Ring value={conversion} size={44} stroke={5} color="var(--color-violet)" className="hidden shrink-0 sm:grid" />
            </div>
            <p className="mt-2 text-[11.5px] text-muted">
              <span className="hidden sm:inline">Clase de prueba</span><span className="sm:hidden">Prueba</span> → alta: <b className="font-bold text-fg-2">48%</b>
            </p>
          </article>

          <article className="panel glow-lime stagger relative flex flex-col justify-between overflow-hidden p-4 sm:p-5" style={s(3)}>
            <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-lime/[0.12] blur-3xl" />
            <div className="relative flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-xl bg-lime text-lime-ink shadow-[0_0_18px_-4px_rgb(181_245_74/0.7)]">
                <Target className="size-[18px]" strokeWidth={2.4} />
              </span>
              <Delta value={21.7} solid />
            </div>
            <div className="relative mt-3">
              <p className="text-[12.5px] font-semibold text-fg-2">Valor del pipeline</p>
              <p className="mt-1 text-[26px] font-extrabold leading-none tracking-[-0.045em] text-fg tabular sm:text-[34px]">
                <CountUp value={pipeline} prefix="$ " />
              </p>
            </div>
            <p className="relative mt-2 text-[11.5px] text-muted">
              Ponderado: <b className="font-bold text-lime">$ 1,1 M</b><span className="hidden sm:inline"> por probabilidad</span>
            </p>
          </article>

          <article className="panel stagger flex flex-col justify-between p-4 sm:p-5" style={s(4)}>
            <div className="flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-xl bg-amber/12 text-amber">
                <Hourglass className="size-[18px]" />
              </span>
              <span className="tabular text-[12px] font-bold text-lime">−1,4 d</span>
            </div>
            <div className="mt-3">
              <p className="text-[12.5px] font-semibold text-muted">Tiempo medio de cierre</p>
              <p className="mt-1 text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular sm:text-[34px]">
                6,4<span className="ml-1 text-[15px] font-bold tracking-normal text-muted">días</span>
              </p>
            </div>
            <div className="mt-2 flex h-[26px] items-end gap-[3px]">
              {[9.1, 8.6, 8.8, 7.9, 7.8, 7.2, 6.9, 6.4].map((v, i, a) => (
                <span
                  key={i}
                  className={cn("flex-1 rounded-[3px]", i === a.length - 1 ? "bg-amber" : "bg-white/12")}
                  style={{ height: `${(v / 9.1) * 100}%` }}
                />
              ))}
            </div>
          </article>
        </div>

        <article className="panel stagger flex flex-col p-5 sm:p-6" style={s(5)}>
          <SectionTitle
            title="Embudo de conversión"
            hint="Leads ingresados en noviembre por etapa alcanzada"
            action={
              <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-lime/12 px-2.5 py-1 text-[11.5px] font-bold text-lime ring-1 ring-inset ring-lime/25 sm:inline-flex">
                {conversion.toLocaleString("es-AR", { maximumFractionDigits: 1 })}% cierre
              </span>
            }
          />
          <div className="mt-5 flex-1">
            <Funnel />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-[11.5px]">
            {[
              ["Mejor fuente", "Referidos · 41%", "text-lime"],
              ["Mayor fuga", "Contacto → prueba", "text-rose", "−36% a prueba"],
              ["Top vendedor", "Paula R. · 16", "text-violet"],
            ].map(([l, v, c, short]) => (
              <div key={l} className="min-w-0">
                <p className="truncate text-muted">{l}</p>
                <p className={cn("truncate font-bold", c)}>{short ? <><span className="sm:hidden">{short}</span><span className="hidden sm:inline">{v}</span></> : v}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* ── Tablero ───────────────────────────────────────── */}
      <section className="mt-6">
        <Board />
      </section>
    </>
  );
}
