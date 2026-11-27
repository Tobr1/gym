"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarClock,
  Info,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Delta, Pill, Ring, SectionTitle } from "@/components/ui/primitives";
import { CountUp } from "@/components/count-up";
import { PHOTO } from "@/lib/photos";
import { cn, compactMoney, fmt, money } from "@/lib/utils";
import { CHECKINS_WEEK } from "@/lib/mock";
import { DISCIPLINES } from "../../clases/_components/data";
import {
  ATTENDANCE,
  BRANCH_ROWS,
  CAPACITY,
  CHURN,
  CLASS_OCCUPANCY,
  CLASS_SESSIONS,
  CLASS_STATS,
  CLASS_WAITLIST,
  COHORTS,
  DAYS,
  FREQUENCY,
  FUNNEL,
  HOURS,
  LEAD_SOURCES,
  MEMBERS_ACTIVE,
  PERIODS,
  REVENUE_12M,
  REVENUE_NOV,
  type CompareKey,
  type PeriodKey,
} from "../_data";
import { AttendanceHeatmap, CohortHeatmap } from "./heatmaps";
import { RevenueChart } from "./revenue-chart";
import {
  BlockLabel,
  BranchTable,
  ChurnReasons,
  ConceptStack,
  InsightCallout,
  MethodBreakdown,
  PlanBreakdown,
} from "./sections";

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;
const p1 = (v: number) =>
  v.toLocaleString("es-AR", { maximumFractionDigits: 1 });
const ease = [0.22, 1, 0.36, 1] as const;
const growth = (a: number, b: number) =>
  Number((((a - b) / b) * 100).toFixed(1));

/* ── Encabezado narrativo de cada informe ─────────────────────── */
function ReportHero({
  kicker,
  headline,
  sub,
  photo,
  kpis,
  insight,
}: {
  kicker: React.ReactNode;
  headline: React.ReactNode;
  sub: React.ReactNode;
  photo: string;
  kpis: { label: string; value: React.ReactNode; foot: React.ReactNode }[];
  /** Lectura breve de la IA (los informes en resumen); Ingresos usa el panel completo. */
  insight?: { text: React.ReactNode; action: string; href: string };
}) {
  return (
    <article
      className="panel stagger relative flex flex-col overflow-hidden"
      style={s(2)}
    >
      {/* foto cinematográfica, fundida al panel */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] sm:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          className="photo-grade size-full object-cover opacity-[0.38]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface/40" />
      </div>
      <div className="noise pointer-events-none absolute inset-0" />
      <div className="relative p-5 sm:p-7">
        <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-muted">
          {kicker}
        </div>
        <h2 className="mt-3 max-w-[640px] text-[24px] font-extrabold leading-[1.15] tracking-[-0.03em] text-fg sm:text-[30px] [&_b]:font-extrabold [&_b]:text-lime">
          {headline}
        </h2>
        <p className="mt-3 max-w-[560px] text-[13.5px] leading-relaxed text-fg-2 [&_b]:font-bold [&_b]:text-fg">
          {sub}
        </p>
        {insight && (
          <div className="mt-4 flex max-w-[600px] items-start gap-2.5 rounded-xl border border-violet/25 bg-violet/[0.07] p-3 backdrop-blur-sm">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-violet" />
            <p className="text-[12.5px] leading-relaxed text-fg-2 [&_b]:font-bold [&_b]:text-fg">
              {insight.text}{" "}
              <Link
                href={insight.href}
                className="inline-flex items-center gap-1 whitespace-nowrap font-bold text-violet hover:text-fg"
              >
                {insight.action} <ArrowRight className="size-3.5" />
              </Link>
            </p>
          </div>
        )}
      </div>
      <dl className="relative mt-auto grid grid-cols-2 border-t border-line bg-ink/30 backdrop-blur-sm lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className={cn(
              "min-w-0 p-4 sm:px-5 sm:py-5 xl:px-6",
              i % 2 === 1 && "border-l border-line",
              i >= 2 && "border-t border-line lg:border-t-0",
              i === 2 && "lg:border-l",
            )}
          >
            <dt className="truncate text-[11.5px] font-semibold text-muted">
              {k.label}
            </dt>
            <dd className="mt-1 whitespace-nowrap text-[17px] font-extrabold min-[400px]:text-[19px] leading-none tracking-[-0.03em] text-fg tabular sm:text-[clamp(18px,1.55vw,22px)]">
              {k.value}
            </dd>
            <dd className="mt-1.5 truncate text-[11.5px] text-muted">
              {k.foot}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function Legend({
  items,
}: {
  items: { label: string; cls: string; round?: boolean }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-semibold text-muted">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span
            className={cn(
              "size-2.5",
              it.round ? "rounded-full" : "rounded-[3px]",
              it.cls,
            )}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function Footnote() {
  return (
    <p className="mt-6 flex items-start gap-2 text-[11.5px] text-faint">
      <CalendarClock className="mt-px size-3.5 shrink-0" /> Datos al miércoles
      25 de noviembre, 08:52 · Montos en pesos, con IVA incluido.
    </p>
  );
}

const withDelta = (v: number, rest: React.ReactNode) => (
  <span className="flex items-center gap-1.5">
    <Delta value={v} /> {rest}
  </span>
);

/* ═════════════ INGRESOS (completo) ═════════════ */
export function IngresosReport({
  period,
  compare,
}: {
  period: PeriodKey;
  compare: CompareKey;
}) {
  const P = PERIODS[period];
  const c = P.cmp[compare];
  const d = growth(P.total, c.value);
  const recShare = Math.round((P.recurring / P.total) * 100);
  const toTarget = Math.round((P.forecast / P.target) * 100);
  const total12 = REVENUE_12M.reduce((a, m) => a + m.value, 0);

  return (
    <>
      <ReportHero
        kicker={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-lime">Ingresos</span> · {P.label}
            {period !== "anio" && (
              <Pill tone="lime" dot className="normal-case tracking-normal">
                En curso
              </Pill>
            )}
          </span>
        }
        headline={
          <>
            {P.lead} <b>{compactMoney(P.total)}</b> {P.tail}:{" "}
            <span className={d >= 0 ? "text-lime" : "text-rose"}>
              {d >= 0 ? "+" : ""}
              {p1(d)}%
            </span>{" "}
            vs. {c.label}.
          </>
        }
        sub={
          <>
            El ingreso recurrente ya es el <b>{recShare}%</b> del total y la
            proyección de cierre es <b>{compactMoney(P.forecast)}</b>, el{" "}
            {toTarget}% del objetivo.
            {c.real !== undefined && (
              <>
                {" "}
                Descontada la inflación, el crecimiento real es de{" "}
                <b>+{p1(c.real)}%</b>.
              </>
            )}
          </>
        }
        photo={PHOTO.deadlift(1100, 700)}
        kpis={[
          {
            label: "Ingreso total",
            value: <CountUp key={period} value={P.total} prefix="$ " />,
            foot: withDelta(d, <>vs. {compactMoney(c.value)}</>),
          },
          {
            label: "Recurrente",
            value: compactMoney(P.recurring),
            foot: (
              <span className="flex items-center gap-2">
                <span className="h-1 w-10 shrink-0 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full bg-violet"
                    style={{ width: `${recShare}%` }}
                  />
                </span>
                {recShare}% del total
              </span>
            ),
          },
          {
            label: "Ticket por socio",
            value: money(P.ticket),
            foot: withDelta(P.ticketDelta, "por mes"),
          },
          {
            label: "Proyección de cierre",
            value: compactMoney(P.forecast),
            foot: (
              <span className="flex items-center gap-1.5">
                <Target className="size-3.5 shrink-0 text-lime" /> {toTarget}%
                de {compactMoney(P.target)}
              </span>
            ),
          },
        ]}
      />

      <div className="stagger mt-4" style={s(3)}>
        <InsightCallout
          items={[
            {
              tone: "lime",
              text: (
                <>
                  El <b className="text-fg">61%</b> de la suba vs. octubre viene
                  de un ticket más alto (+7,1%); el resto, de{" "}
                  <b className="text-fg">68 socios netos</b> nuevos.
                </>
              ),
              action: "Ver altas del mes",
              href: "/admin/socios",
            },
            {
              tone: "amber",
              text: (
                <>
                  <b className="text-fg">CrossTraining</b> crece +16,8% y tiene{" "}
                  <b className="text-fg">
                    {CLASS_STATS[0].waitlist} en lista de espera
                  </b>
                  : dos turnos más a las 19 h sumarían ~$&nbsp;1&nbsp;M por mes.
                </>
              ),
              action: "Abrir agenda de clases",
              href: "/admin/clases",
            },
            {
              tone: "rose",
              text: (
                <>
                  <b className="text-fg">Precio</b> explica 13 de 44 bajas.
                  Ofrecé el trimestral con −10% a los{" "}
                  <b className="text-fg">74 socios</b> con 1–7 días de deuda.
                </>
              ),
              action: "Ir a cobranzas",
              href: "/admin/caja",
            },
          ]}
        />
      </div>

      {/* 01 · Evolución */}
      <BlockLabel
        n="01"
        title="Evolución del ingreso"
        hint="Dic 2025 – Nov 2026 · millones de pesos"
      />
      <article className="panel stagger p-5 sm:p-6" style={s(4)}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-fg-2">
              Facturación de 12 meses
            </p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="text-[28px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">
                $ {p1(total12)} M
              </span>
              <Delta value={60.5} />
              <span className="text-[12px] text-muted">
                vs. 12 meses previos
              </span>
            </p>
          </div>
          <Legend
            items={[
              {
                label:
                  period === "mes" ? "Total facturado" : `Período: ${P.label}`,
                cls: period === "mes" ? "bg-white/25" : "bg-lime/40",
              },
              { label: "Nov (al día 25)", cls: "bg-lime" },
              {
                label: "Proyección",
                cls: "border border-dashed border-lime/70 bg-lime/10",
              },
              { label: "Recurrente", cls: "bg-violet", round: true },
            ]}
          />
        </div>
        <div className="mt-4">
          <RevenueChart height={290} range={P.months} />
        </div>
        <div className="mt-5 border-t border-line pt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-faint">
              Noviembre por concepto
            </p>
            <p className="text-[12px] font-semibold text-muted">
              Total <b className="text-fg tabular">{money(REVENUE_NOV)}</b>
            </p>
          </div>
          <ConceptStack />
        </div>
      </article>

      {/* 02 · Composición */}
      <BlockLabel n="02" title="De dónde viene" hint="Noviembre al día 25" />
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <article
          className="panel stagger flex flex-col p-5 sm:p-6"
          style={s(5)}
        >
          <SectionTitle
            title="Cuotas por plan"
            hint="$ 39,2 M en cuotas y membresías · variación vs. octubre"
          />
          <div className="mt-5 flex-1">
            <PlanBreakdown />
          </div>
        </article>
        <article
          className="panel stagger flex flex-col p-5 sm:p-6"
          style={s(6)}
        >
          <SectionTitle
            title="Por medio de pago"
            hint="Participación sobre el total · pp vs. octubre"
            action={<Pill tone="cyan">Digital 83,8%</Pill>}
          />
          <div className="mt-5 flex-1">
            <MethodBreakdown />
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-white/[0.02] p-3 text-[11.5px] leading-snug text-muted">
            <Info className="mt-px size-3.5 shrink-0 text-cyan" />
            <span>
              Mercado Pago y débito automático ganan terreno:{" "}
              <b className="text-fg-2">−4,2 días</b> promedio de cobro vs.
              efectivo.
            </span>
          </p>
        </article>
      </section>

      {/* 03 · Retención */}
      <BlockLabel
        n="03"
        title="Qué sostiene el recurrente"
        hint="Retención 94,1% · churn 5,9%"
      />
      <section className="grid gap-4 2xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <article className="panel stagger p-5 sm:p-6" style={s(7)}>
          <SectionTitle
            title="Retención por cohorte de alta"
            hint="% de socios que siguen activos cada mes desde su alta"
            action={<Pill tone="lime">M3 · 85% ↑</Pill>}
          />
          <div className="mt-5">
            <CohortHeatmap />
          </div>
        </article>
        <article className="panel stagger p-5 sm:p-6" style={s(8)}>
          <SectionTitle
            title="Motivos de baja"
            hint={`${CHURN.bajas} bajas sobre ${CHURN.due} cuotas vencidas en noviembre`}
          />
          <div className="mt-5">
            <ChurnReasons limit={6} />
          </div>
        </article>
      </section>

      {/* 04 · Asistencia */}
      <BlockLabel
        n="04"
        title="Uso del gimnasio"
        hint="Quien entrena, renueva"
      />
      <AttendancePanel />

      {/* 05 · Sedes */}
      <BlockLabel
        n="05"
        title="Comparativa por sede"
        hint="Noviembre al día 25"
      />
      <BranchPanel />

      <Footnote />
    </>
  );
}

function BranchPanel() {
  return (
    <article className="panel stagger overflow-hidden" style={s(10)}>
      <div className="p-5 pb-4 sm:p-6 sm:pb-4">
        <SectionTitle
          title="Sede Centro, Norte y Parque"
          hint="En lima, el mejor valor de cada columna"
          action={
            <span className="hidden items-center gap-1.5 text-[12px] font-semibold text-muted sm:flex">
              <TrendingUp className="size-3.5 text-lime" /> Parque crece más
              rápido
            </span>
          }
        />
      </div>
      <BranchTable />
    </article>
  );
}

function AttendancePanel() {
  let peak = { d: 0, h: 0, v: 0 };
  ATTENDANCE.forEach((row, d) =>
    row.forEach((v, h) => v !== null && v > peak.v && (peak = { d, h, v })),
  );
  return (
    <article
      className="panel stagger grid gap-6 p-5 sm:p-6 2xl:grid-cols-[minmax(0,1fr)_240px]"
      style={s(9)}
    >
      <div className="min-w-0">
        <SectionTitle
          title="Asistencia por día y hora"
          hint="Sede Centro · personas en sala por franja horaria"
        />
        <div className="mt-4">
          <AttendanceHeatmap />
        </div>
      </div>
      <aside className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1 2xl:content-start 2xl:border-l 2xl:border-line 2xl:pl-6">
        {[
          {
            k: "Pico",
            v: `${DAYS[peak.d]} ${HOURS[peak.h]} h`,
            d: `~${peak.v} personas · ${Math.round((peak.v / CAPACITY) * 100)}% del aforo`,
            cls: "text-lime",
          },
          {
            k: "Valle con potencial",
            v: "Mar a Jue · 12 a 16 h",
            d: "Hasta 30% del aforo: ideal para un plan Mediodía",
            cls: "text-amber",
          },
          {
            k: "Frecuencia media",
            v: "1,8 visitas / sem",
            d: "Con 3 o más visitas renueva el 98%",
            cls: "text-violet",
          },
        ].map((x) => (
          <div
            key={x.k}
            className="rounded-xl border border-line bg-white/[0.02] p-3.5"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
              {x.k}
            </p>
            <p
              className={cn(
                "mt-1 text-[15px] font-extrabold tracking-[-0.01em]",
                x.cls,
              )}
            >
              {x.v}
            </p>
            <p className="mt-0.5 text-[11.5px] leading-snug text-muted">
              {x.d}
            </p>
          </div>
        ))}
      </aside>
    </article>
  );
}

/* ═════════════ RETENCIÓN Y BAJAS ═════════════ */
export function RetencionReport() {
  return (
    <>
      <ReportHero
        kicker={
          <span>
            <span className="text-lime">Retención y bajas</span> · Noviembre
            2026
          </span>
        }
        headline={
          <>
            La retención llegó a <b>94,1%</b>: {CHURN.bajas} bajas,{" "}
            <span className="text-lime">
              {CHURN.prevBajas - CHURN.bajas} menos
            </span>{" "}
            que en octubre.
          </>
        }
        sub={
          <>
            De las <b>{CHURN.due} cuotas</b> que vencieron en noviembre
            renovaron {CHURN.renewed}. Las altas de septiembre y octubre retienen
            mejor en sus primeros meses; <b>precio</b> y <b>falta de tiempo</b>{" "}
            explican la mitad de las bajas.
          </>
        }
        insight={{
          text: (
            <>
              Los <b>126 socios</b> que no vienen hace 14+ días tienen 4 veces
              más chance de darse de baja. Una campaña de reactivación hoy
              protege <b className="whitespace-nowrap">~$ 4 M</b> por mes.
            </>
          ),
          action: "Ver socios en riesgo",
          href: "/admin/socios",
        }}
        photo={PHOTO.backWoman(1100, 700)}
        kpis={[
          {
            label: "Retención mensual",
            value: "94,1%",
            foot: withDelta(0.7, "vs. octubre"),
          },
          {
            label: "Churn",
            value: `${p1(CHURN.rate)}%`,
            foot: `${CHURN.bajas} bajas · ${CHURN.due} vencimientos`,
          },
          {
            label: "Congelados",
            value: "19",
            foot: "3 por lesión, evitaron la baja",
          },
          {
            label: "Permanencia media",
            value: "14,2 meses",
            foot: withDelta(4.4, "interanual"),
          },
        ]}
      />
      <BlockLabel
        n="01"
        title="Cohortes y motivos"
        hint="Altas de marzo a noviembre"
      />
      <section className="grid gap-4 2xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <article className="panel stagger p-5 sm:p-6" style={s(4)}>
          <SectionTitle
            title="Retención por cohorte de alta"
            hint={`${fmt(COHORTS.reduce((a, c) => a + c.size, 0))} altas desde marzo`}
          />
          <div className="mt-5">
            <CohortHeatmap />
          </div>
        </article>
        <article className="panel stagger p-5 sm:p-6" style={s(5)}>
          <SectionTitle
            title="Motivos de baja"
            hint="Encuesta de salida + registro de recepción"
          />
          <div className="mt-5">
            <ChurnReasons />
          </div>
        </article>
      </section>
      <Footnote />
    </>
  );
}

/* ═════════════ ASISTENCIA ═════════════ */
export function AsistenciaReport() {
  const week = CHECKINS_WEEK.reduce((a, d) => a + d.hoy, 0);
  return (
    <>
      <ReportHero
        kicker={
          <span>
            <span className="text-lime">Asistencia</span> · Noviembre 2026
          </span>
        }
        headline={
          <>
            <b>{fmt(week)}</b> check-ins en 7 días. En Sede Centro, el jueves a
            las 19 h es el momento más lleno.
          </>
        }
        sub={
          <>
            De martes a jueves, entre las 12 y las 16 h la sala no pasa del 30%
            del aforo. Hay lugar para un plan <b>Mediodía</b>.
          </>
        }
        insight={{
          text: (
            <>
              Quien viene <b>3 veces por semana o más</b> renueva en el 98% de
              los casos; con 1 visita o menos, el 90%.
            </>
          ),
          action: "Ver accesos",
          href: "/admin/acceso",
        }}
        photo={PHOTO.gymFloor(1100, 700)}
        kpis={[
          {
            label: "Check-ins · 7 días",
            value: fmt(week),
            foot: withDelta(7.4, "vs. semana previa"),
          },
          {
            label: "Check-ins por día",
            value: fmt(Math.round(week / 7)),
            foot: "Promedio lunes a domingo",
          },
          {
            label: "Visitas por socio",
            value: `${p1(Math.round((week / MEMBERS_ACTIVE) * 10) / 10)} / sem`,
            foot: withDelta(3.8, "vs. octubre"),
          },
          {
            label: "Sin venir 14+ días",
            value: "126",
            foot: `${p1((126 / MEMBERS_ACTIVE) * 100)}% del padrón, en riesgo`,
          },
        ]}
      />
      <BlockLabel
        n="01"
        title="Mapa de calor semanal"
        hint="Promedio de 4 semanas"
      />
      <AttendancePanel />
      <BlockLabel n="02" title="Frecuencia y ocupación" />
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <article className="panel stagger p-5 sm:p-6" style={s(10)}>
          <SectionTitle
            title="Visitas por semana"
            hint="Socios activos según frecuencia · % que renueva"
          />
          <div className="mt-5 flex h-3 gap-1">
            {FREQUENCY.map((f, i) => (
              <motion.span
                key={f.label}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.08, ease }}
                className="h-full origin-left rounded-full"
                style={{ width: `${f.share}%`, background: f.color }}
              />
            ))}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {FREQUENCY.map((f) => (
              <div
                key={f.label}
                className="rounded-xl border border-line bg-white/[0.02] p-3"
              >
                <dt className="flex items-center gap-1.5 text-[11.5px] font-semibold text-muted">
                  <span
                    className="size-2 rounded-[3px]"
                    style={{ background: f.color }}
                  />{" "}
                  {f.label}
                </dt>
                <dd className="mt-1 text-[18px] font-extrabold leading-none text-fg tabular">
                  {f.share}%
                </dd>
                <dd className="mt-1 text-[11px] text-muted tabular">
                  renueva{" "}
                  <b
                    className={cn(
                      "font-bold",
                      f.renew >= 95 ? "text-lime" : "text-fg-2",
                    )}
                  >
                    {f.renew}%
                  </b>
                </dd>
              </div>
            ))}
          </dl>
        </article>
        <article className="panel stagger p-5 sm:p-6" style={s(11)}>
          <SectionTitle
            title="Ocupación en hora pico"
            hint="Por sede · personas en sala sobre capacidad"
          />
          <ul className="mt-5 grid grid-cols-3 gap-2">
            {BRANCH_ROWS.map((b) => (
              <li
                key={b.name}
                className="flex flex-col items-center text-center"
              >
                <Ring
                  value={b.occupancy}
                  size={76}
                  stroke={8}
                  color="var(--color-violet)"
                >
                  <span className="text-[16px] font-extrabold text-fg tabular">
                    {b.occupancy}%
                  </span>
                </Ring>
                <p className="mt-2 text-[13px] font-bold text-fg">{b.short}</p>
                <p className="text-[11px] text-muted tabular">
                  {fmt(b.members)} socios
                </p>
              </li>
            ))}
          </ul>
        </article>
      </section>
      <Footnote />
    </>
  );
}

/* ═════════════ CLASES ═════════════ */
export function ClasesReport() {
  return (
    <>
      <ReportHero
        kicker={
          <span>
            <span className="text-lime">Clases</span> · Noviembre 2026
          </span>
        }
        headline={
          <>
            Las clases se llenan al <b>{CLASS_OCCUPANCY}%</b>: CrossTraining y
            Spinning ya no alcanzan para la demanda.
          </>
        }
        sub={
          <>
            {CLASS_WAITLIST} personas en lista de espera este mes. Yoga queda al
            66%: conviene pasar el turno del jueves 13 h a la franja de 19 h.
          </>
        }
        insight={{
          text: (
            <>
              Dos turnos de <b>CrossTraining</b> y uno de <b>Spinning</b> entre
              las 18 y las 20 h absorben 3 de cada 4 personas en espera.
            </>
          ),
          action: "Abrir agenda",
          href: "/admin/clases",
        }}
        photo={PHOTO.classRopes(1100, 700)}
        kpis={[
          {
            label: "Ocupación media",
            value: `${CLASS_OCCUPANCY}%`,
            foot: withDelta(3.1, "vs. octubre"),
          },
          {
            label: "Clases dictadas",
            value: fmt(CLASS_SESSIONS),
            foot: "6 coaches · 5 disciplinas",
          },
          {
            label: "Lista de espera",
            value: fmt(CLASS_WAITLIST),
            foot: `Cross ${CLASS_STATS[0].waitlist} · Spinning ${CLASS_STATS[1].waitlist}`,
          },
          {
            label: "Asistencia a reservas",
            value: "89%",
            foot: withDelta(3.1, "vs. octubre"),
          },
        ]}
      />
      <BlockLabel
        n="01"
        title="Ocupación por disciplina"
        hint="Noviembre al día 25"
      />
      <article className="panel stagger p-5 sm:p-6" style={s(4)}>
        <ul className="space-y-4">
          {CLASS_STATS.map((c, i) => {
            const color = DISCIPLINES[c.name].color;
            return (
              <li
                key={c.name}
                className="grid grid-cols-[104px_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[150px_minmax(0,1fr)_190px] sm:gap-5"
              >
                <span className="flex items-center gap-2 truncate text-[13px] font-bold text-fg">
                  <span
                    className="size-2.5 shrink-0 rounded-[4px]"
                    style={{ background: color }}
                  />
                  {c.name}
                </span>
                <span className="relative h-3 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: `${c.occupancy}%` }}
                    transition={{ duration: 0.9, delay: 0.1 + i * 0.07, ease }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: color,
                      boxShadow: `0 0 14px -4px ${color}`,
                    }}
                  />
                </span>
                <span className="flex items-center justify-end gap-3 text-[12px] font-semibold text-muted tabular">
                  <b className="text-[14px] font-extrabold text-fg">
                    {c.occupancy}%
                  </b>
                  <span className="hidden whitespace-nowrap sm:inline">{c.sessions} clases</span>
                  {c.waitlist > 0 ? (
                    <Pill tone="amber" className="hidden sm:inline-flex">
                      {c.waitlist} en espera
                    </Pill>
                  ) : (
                    <span className="hidden w-[92px] text-right text-faint sm:inline">
                      sin espera
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </article>
      <Footnote />
    </>
  );
}

/* ═════════════ VENTAS / CRM ═════════════ */
export function VentasReport() {
  const conv = (FUNNEL[4].value / FUNNEL[0].value) * 100;
  const maxSource = Math.max(...LEAD_SOURCES.map((l) => l.won / l.value));
  return (
    <>
      <ReportHero
        kicker={
          <span>
            <span className="text-lime">Ventas / CRM</span> · Noviembre 2026
          </span>
        }
        headline={
          <>
            <b>47 altas</b> desde 186 prospectos: el {p1(conv)}% de conversión
            es el mejor del año.
          </>
        }
        sub={
          <>
            Quien hace la clase de prueba se queda en el <b>48%</b> de los
            casos. Los referidos convierten más del doble que Instagram.
          </>
        }
        insight={{
          text: (
            <>
              Hay <b>23 prospectos</b> en negociación sin contacto hace más de 3
              días: son ~$&nbsp;720&nbsp;mil por mes si cerrás la mitad.
            </>
          ),
          action: "Abrir CRM",
          href: "/admin/crm",
        }}
        photo={PHOTO.coach(1100, 700)}
        kpis={[
          {
            label: "Prospectos",
            value: "186",
            foot: withDelta(14.2, "vs. octubre"),
          },
          {
            label: "Conversión",
            value: `${p1(conv)}%`,
            foot: withDelta(3.4, "pp vs. octubre"),
          },
          {
            label: "Altas totales",
            value: "112",
            foot: "47 por CRM · 65 mostrador",
          },
          {
            label: "Días a cierre",
            value: "6,4",
            foot: "Desde el primer contacto",
          },
        ]}
      />
      <BlockLabel n="01" title="Embudo y fuentes" hint="Noviembre al día 25" />
      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <article className="panel stagger p-5 sm:p-6" style={s(4)}>
          <SectionTitle
            title="Embudo del mes"
            hint="Prospectos por etapa · % que pasa a la siguiente"
          />
          <ol className="mt-5 space-y-2">
            {FUNNEL.map((f, i) => {
              const next = FUNNEL[i + 1];
              const last = i === FUNNEL.length - 1;
              return (
                <li key={f.key}>
                  <div className="flex items-center gap-3">
                    <span className="w-[108px] shrink-0 truncate text-[12.5px] font-bold text-fg-2 sm:w-[120px]">
                      {f.label}
                    </span>
                    <span className="relative h-8 flex-1">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(f.value / FUNNEL[0].value) * 100}%`,
                        }}
                        transition={{
                          duration: 0.8,
                          delay: 0.1 + i * 0.07,
                          ease,
                        }}
                        className={cn(
                          "absolute inset-y-0 left-0 flex items-center rounded-lg px-2.5 text-[13px] font-extrabold tabular",
                          last
                            ? "bg-lime text-lime-ink shadow-[0_0_24px_-6px_rgb(181_245_74/0.7)]"
                            : "bg-white/[0.08] text-fg",
                        )}
                      >
                        {f.value}
                      </motion.span>
                    </span>
                  </div>
                  {next && (
                    <p className="ml-[120px] mt-1 text-[11px] font-semibold text-faint tabular sm:ml-[132px]">
                      ↓ {Math.round((next.value / f.value) * 100)}% pasa a{" "}
                      {next.label.toLowerCase()}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </article>
        <article className="panel stagger p-5 sm:p-6" style={s(5)}>
          <SectionTitle
            title="Por fuente"
            hint="Prospectos y altas · tasa de cierre"
          />
          <ul className="mt-5 divide-y divide-line/70">
            {LEAD_SOURCES.map((l) => {
              const rate = l.won / l.value;
              return (
                <li
                  key={l.label}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-fg">{l.label}</p>
                    <p className="truncate text-[11.5px] text-muted tabular">
                      {l.value} prospectos · {l.won} altas
                    </p>
                  </div>
                  <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-white/[0.06] sm:w-20">
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        rate === maxSource ? "bg-lime" : "bg-white/30",
                      )}
                      style={{ width: `${(rate / maxSource) * 100}%` }}
                    />
                  </span>
                  <span
                    className={cn(
                      "w-12 text-right text-[14px] font-extrabold tabular",
                      rate === maxSource ? "text-lime" : "text-fg",
                    )}
                  >
                    {Math.round(rate * 100)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </article>
      </section>
      <Footnote />
    </>
  );
}

/* ═════════════ POR SEDE ═════════════ */
export function SedesReport() {
  return (
    <>
      <ReportHero
        kicker={
          <span>
            <span className="text-lime">Por sede</span> · Noviembre 2026
          </span>
        }
        headline={
          <>
            Centro aporta el <b>47%</b> del ingreso, pero <b>Parque</b> es la
            sede que más crece: +14,9%.
          </>
        }
        sub={
          <>
            Norte tiene la mayor proporción de socios con deuda de las sedes
            grandes (12,2%) y la retención más baja después de Parque.
          </>
        }
        insight={{
          text: (
            <>
              Parque llega al <b>64%</b> de ocupación en hora pico: tiene margen
              para sumar ~<b>90 socios</b> sin abrir turnos nuevos.
            </>
          ),
          action: "Ver socios de Parque",
          href: "/admin/socios",
        }}
        photo={PHOTO.machine(1100, 700)}
        kpis={[
          ...BRANCH_ROWS.map((b) => ({
            label: b.name,
            value: compactMoney(b.revenue),
            foot: withDelta(b.delta, <>· {fmt(b.members)} socios</>),
          })),
          {
            label: "Total 3 sedes",
            value: compactMoney(REVENUE_NOV),
            foot: withDelta(12.3, <>· {fmt(MEMBERS_ACTIVE)} socios</>),
          },
        ]}
      />
      <BlockLabel n="01" title="Comparativa" hint="Noviembre al día 25" />
      <BranchPanel />
      <Footnote />
    </>
  );
}
