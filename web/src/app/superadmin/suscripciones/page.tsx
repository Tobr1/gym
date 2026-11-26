import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  Check,
  Clock3,
  Download,
  FlaskConical,
  Lightbulb,
  Pencil,
  PhoneCall,
  Sparkles,
  TimerReset,
  TriangleAlert,
} from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Avatar, Pill, Ring, Sparkline, type Tone } from "@/components/ui/primitives";
import { PHOTO } from "@/lib/photos";
import { cn, compactMoney, fmt, money } from "@/lib/utils";
import { DUNNING_TOTAL, PLATFORM } from "../_data";
import { PlanTag, TenantLogo } from "../gimnasios/_components/bits";
import { DunningQueue } from "./_components/dunning-queue";
import {
  CHURNED,
  COLLECTION,
  DUNNING_ROWS,
  MONTHLY_RUN,
  MRR_MOVEMENT,
  PLANS,
  RENEWALS,
  TRIALS,
  type MrrStep,
  type PlanCard,
  type Renewal,
  type TrialRow,
} from "./_data";

export const metadata: Metadata = { title: "Suscripciones · Super Admin" };

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default function SuscripcionesPage() {
  const net = PLATFORM.mrr - PLATFORM.mrrPrev;
  return (
    <div className="space-y-4">
      <div className="stagger flex flex-wrap items-end justify-between gap-3" style={s(0)}>
        <div className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-muted">Facturación SaaS · noviembre 2026</p>
          <p className="mt-1 text-[13.5px] text-fg-2">
            <span className="font-bold text-fg tabular">{fmt(PLATFORM.active)}</span> cuentas pagas ·{" "}
            <span className="font-bold text-fg tabular">{compactMoney(PLATFORM.mrr * 12)}</span> ARR · cobro mensual por sede
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-[12.5px] font-semibold text-fg-2 md:flex">
            <CalendarClock className="size-4 text-faint" /> Próximo débito <b className="text-fg">{MONTHLY_RUN.date}</b>
          </span>
          <button className="hidden h-9 items-center gap-2 rounded-xl border border-line px-3.5 text-[12.5px] font-semibold text-fg-2 transition hover:border-line-strong hover:text-fg sm:flex">
            <Download className="size-4" /> Exportar
          </button>
        </div>
      </div>

      {/* fila 1: cascada de MRR + cobranza */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <MrrWaterfall net={net} />
        <CollectionCard />
      </section>

      {/* fila 2: catálogo */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PLANS.map((p, i) => (
          <PlanTile key={p.name} p={p} i={4 + i} />
        ))}
      </section>

      {/* fila 3: cobranza fallida + pruebas */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <article className="panel-flat stagger overflow-hidden pb-1" style={s(7)}>
          <div className="flex items-start justify-between gap-3 p-5 pb-4">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-[15px] font-bold text-fg">
                <TriangleAlert className="size-4 text-rose" /> Pagos fallidos
              </h3>
              <p className="mt-0.5 text-[12.5px] text-muted">Reintentos automáticos a las 06:00 · suspensión tras el 4.º intento</p>
            </div>
            <Link href="/superadmin/gimnasios" className="shrink-0 text-[12.5px] font-semibold text-muted transition hover:text-fg">
              Ver morosos
            </Link>
          </div>
          <DunningQueue rows={DUNNING_ROWS} total={DUNNING_TOTAL} />
        </article>
        <TrialsCard />
      </section>

      {/* fila 4: renovaciones */}
      <RenewalsCard />
    </div>
  );
}

/* ══ Cascada de MRR ══════════════════════════════════════════ */

const STEP_STYLE: Record<string, { bar: string; text: string }> = {
  start: { bar: "bg-white/[0.16]", text: "text-fg-2" },
  new: { bar: "bg-emerald shadow-[0_0_20px_-6px_rgb(61_220_151/0.7)]", text: "text-emerald" },
  exp: { bar: "bg-emerald/55", text: "text-emerald" },
  con: { bar: "bg-amber/80", text: "text-amber" },
  churn: { bar: "bg-rose shadow-[0_0_20px_-6px_rgb(255_95_126/0.6)]", text: "text-rose" },
  end: { bar: "bg-lime shadow-[0_0_28px_-4px_rgb(181_245_74/0.7)]", text: "text-lime" },
};

function waterfall(steps: MrrStep[]) {
  let run = 0;
  return steps.map((st) => {
    if (st.kind === "total") {
      run = st.value;
      return { ...st, from: 0, to: st.value, level: st.value };
    }
    const from = run;
    run += st.value;
    return { ...st, from: Math.min(from, run), to: Math.max(from, run), level: run };
  });
}

const signed = (v: number) => `${v >= 0 ? "+" : "−"}${compactMoney(Math.abs(v))}`;

function MrrWaterfall({ net }: { net: number }) {
  const bars = waterfall(MRR_MOVEMENT);
  const LO = 23_000_000;
  const HI = 28_600_000;
  const y = (v: number) => ((Math.max(v, LO) - LO) / (HI - LO)) * 100;
  const ticks = [24_000_000, 26_000_000, 28_000_000];
  const churnShare = Math.round((CHURNED[0].mrr / CHURNED.reduce((a, c) => a + c.mrr, 0)) * 100);

  return (
    <article className="panel stagger relative flex flex-col overflow-hidden p-5" style={s(1)}>
      <div className="pointer-events-none absolute -right-20 -top-24 size-[320px] rounded-full bg-lime/[0.06] blur-[90px]" />
      <div className="relative flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <h3 className="text-[15px] font-bold text-fg">Movimiento de MRR</h3>
          <p className="mt-0.5 text-[12.5px] text-muted">31 oct → 30 nov · proyectado</p>
        </div>
        <div className="text-right">
          <p className="text-[28px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular sm:text-[32px]">
            <CountUp value={PLATFORM.mrr} prefix="$ " />
          </p>
          <p className="mt-1.5 text-[12px] font-bold text-lime tabular">
            +{money(net)} neto · +{((net / PLATFORM.mrrPrev) * 100).toLocaleString("es-AR", { maximumFractionDigits: 1 })}%
          </p>
        </div>
      </div>

      <div className="relative mt-6 grid flex-1 grid-cols-[auto_minmax(0,1fr)] gap-3">
        {/* eje Y */}
        <div className="relative w-9 text-[10px] font-bold text-faint tabular sm:w-10">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `calc(${y(t)}% - 0px)` }}>
              {t / 1_000_000} M
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="relative h-[230px] sm:h-[250px]">
            {ticks.map((t) => (
              <span key={t} className="absolute inset-x-0 border-t border-dashed border-white/[0.06]" style={{ bottom: `${y(t)}%` }} />
            ))}
            <div className="absolute inset-0 flex gap-2 sm:gap-4">
              {bars.map((b, k) => {
                const st = STEP_STYLE[b.key];
                return (
                  <div key={b.key} className="group relative flex-1">
                    {/* conector al siguiente escalón */}
                    {k < bars.length - 1 && (
                      <span
                        className="absolute left-full w-2 border-t border-dashed border-white/25 sm:w-4"
                        style={{ bottom: `${y(b.level)}%` }}
                      />
                    )}
                    <div
                      className={cn("absolute inset-x-0 rounded-[8px] transition group-hover:brightness-110", st.bar, b.kind === "total" && "rounded-b-[4px]")}
                      style={{
                        bottom: `${y(b.from)}%`,
                        height: `${y(b.to) - y(b.from)}%`,
                        animation: `fade-up .8s cubic-bezier(.22,1,.36,1) ${k * 90}ms both`,
                      }}
                    />
                    <span
                      className={cn("absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center text-[10px] font-extrabold tabular sm:text-[12px]", st.text)}
                      style={{ bottom: `calc(${y(b.to)}% + 6px)` }}
                    >
                      {b.kind === "total" ? compactMoney(b.value) : signed(b.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2 flex gap-2 sm:gap-4">
            {bars.map((b) => (
              <div key={b.key} className="min-w-0 flex-1 text-center">
                <p className={cn("truncate text-[10.5px] font-bold sm:text-[12px]", b.key === "end" ? "text-lime" : "text-fg-2")}>
                  <span className="sm:hidden">{b.short}</span>
                  <span className="hidden sm:inline">{b.label}</span>
                </p>
                <p className="hidden truncate text-[10.5px] font-semibold text-muted sm:block">{b.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-5 flex items-start gap-3 rounded-xl border border-line bg-ink/40 p-3">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-lime" />
        <p className="text-[12px] leading-relaxed text-muted">
          <b className="font-bold text-fg">El {churnShare}% del churn es {CHURNED[0].name}</b> (Cadena, {compactMoney(CHURNED[0].mrr)}): {CHURNED[0].reason.toLowerCase()}. Sin
          esa baja, el churn de MRR habría sido del {((CHURNED.slice(1).reduce((a, c) => a + c.mrr, 0) / PLATFORM.mrrPrev) * 100).toLocaleString("es-AR", { maximumFractionDigits: 1 })}%.
        </p>
      </div>
    </article>
  );
}

/* ══ Cobranza del mes ════════════════════════════════════════ */

function CollectionCard() {
  const pct = (COLLECTION.collected / COLLECTION.billed) * 100;
  return (
    <article className="panel-flat stagger flex flex-col p-5" style={s(2)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-fg">Cobranza de noviembre</h3>
          <p className="mt-0.5 text-[12.5px] text-muted">Facturado el dom 1 nov · {money(COLLECTION.billed)}</p>
        </div>
        <Pill tone="lime" dot>
          En curso
        </Pill>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <Ring value={pct} size={128} stroke={12}>
          <span>
            <span className="block text-[28px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">
              {pct.toLocaleString("es-AR", { maximumFractionDigits: 0 })}%
            </span>
            <span className="mt-1 block text-[11px] font-semibold text-muted">cobrado</span>
          </span>
        </Ring>
        <dl className="min-w-0 flex-1 space-y-3">
          <div>
            <dt className="text-[11.5px] font-semibold text-muted">Cobrado</dt>
            <dd className="text-[17px] font-extrabold text-fg tabular">{money(COLLECTION.collected)}</dd>
          </div>
          <div>
            <dt className="text-[11.5px] font-semibold text-muted">En recupero · {DUNNING_ROWS.length} cuentas</dt>
            <dd className="text-[17px] font-extrabold text-rose tabular">{money(COLLECTION.pending)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Cobrado acumulado</p>
          <p className="text-[11px] font-semibold text-muted">1 → 25 nov</p>
        </div>
        <Sparkline data={COLLECTION.curve} height={46} className="mt-2" />
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Medio de pago</p>
        <div className="mt-2.5 flex h-2.5 gap-[3px] overflow-hidden rounded-full">
          {COLLECTION.methods.map((m) => (
            <span key={m.label} className="h-full rounded-full" style={{ flex: m.pct, background: m.color }} />
          ))}
        </div>
        <ul className="mt-3 space-y-1.5">
          {COLLECTION.methods.map((m) => (
            <li key={m.label} className="flex items-center gap-2 text-[12.5px] font-semibold text-fg-2">
              <span className="size-2 rounded-full" style={{ background: m.color }} />
              <span className="flex-1">{m.label}</span>
              <span className="font-bold text-fg tabular">{m.pct}%</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-5">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald/12 text-emerald">
          <TimerReset className="size-4" />
        </span>
        <p className="min-w-0 text-[12px] leading-snug text-muted">
          Los reintentos recuperaron <b className="font-bold text-fg tabular">{money(COLLECTION.recovered)}</b> este mes ·{" "}
          <b className="font-bold text-emerald">{COLLECTION.recoveryRate}%</b> de los rechazos.
        </p>
        </div>
      </div>
    </article>
  );
}

/* ══ Catálogo de planes ══════════════════════════════════════ */

function PlanTile({ p, i }: { p: PlanCard; i: number }) {
  const hot = p.name === "Pro";
  const share = (p.mrr / PLATFORM.mrr) * 100;
  return (
    <article
      className={cn(
        "stagger group relative flex flex-col overflow-hidden rounded-[18px] border p-5 transition-all duration-300 hover:-translate-y-0.5",
        p.name === "Cadena" && "sm:col-span-2 xl:col-span-1",
        hot ? "glow-lime bg-surface" : "border-line bg-surface hover:border-line-strong",
      )}
      style={s(i)}
    >
      {hot && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTO.barbell(900, 600)} alt="" loading="lazy" className="photo-grade absolute inset-0 h-full w-full object-cover opacity-[0.16]" />
          <div className="absolute inset-0 bg-gradient-to-b from-lime/[0.07] via-surface/70 to-surface" />
        </>
      )}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[16px] font-extrabold text-fg">
            <PlanTag plan={p.name} />
          </p>
          <p className="mt-0.5 truncate text-[12.5px] text-muted">{p.desc}</p>
        </div>
        {hot ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-[11px] font-extrabold text-lime-ink">
            <Sparkles className="size-3" /> Mayor MRR
          </span>
        ) : (
          <button className="grid size-8 shrink-0 place-items-center rounded-lg text-faint transition hover:bg-white/[0.05] hover:text-fg" aria-label={`Editar ${p.name}`}>
            <Pencil className="size-3.5" />
          </button>
        )}
      </div>

      <p className="relative mt-5 flex items-baseline gap-1.5">
        {p.price ? (
          <>
            <span className="text-[16px] font-bold text-muted">$</span>
            <span className="text-[38px] font-extrabold leading-none tracking-[-0.045em] text-fg tabular">{fmt(p.price)}</span>
            <span className="text-[12.5px] font-semibold text-muted">/ sede · mes</span>
          </>
        ) : (
          <>
            <span className="text-[38px] font-extrabold leading-none tracking-[-0.045em] text-fg">A medida</span>
          </>
        )}
      </p>

      <dl className="relative mt-5 grid grid-cols-3 gap-2 rounded-xl border border-line bg-ink/40 p-3">
        <div className="min-w-0">
          <dt className="text-[10.5px] font-semibold text-muted">Cuentas</dt>
          <dd className="text-[16px] font-extrabold text-fg tabular">{p.accounts}</dd>
          <dd className={cn("text-[10.5px] font-bold tabular", p.net >= 0 ? "text-lime" : "text-rose")}>
            {p.net >= 0 ? "+" : "−"}
            {Math.abs(p.net)} en nov.
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10.5px] font-semibold text-muted">MRR</dt>
          <dd className="truncate text-[16px] font-extrabold text-fg tabular">{compactMoney(p.mrr)}</dd>
          <dd className="text-[10.5px] font-bold text-muted tabular">{share.toLocaleString("es-AR", { maximumFractionDigits: 1 })}% del total</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10.5px] font-semibold text-muted">ARPA</dt>
          <dd className="truncate text-[16px] font-extrabold text-fg tabular">{compactMoney(Math.round(p.mrr / p.accounts))}</dd>
          <dd className="text-[10.5px] font-bold text-muted">por cuenta</dd>
        </div>
      </dl>

      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div className={cn("h-full rounded-full", hot ? "bg-lime" : p.name === "Cadena" ? "bg-cyan" : "bg-white/40")} style={{ width: `${share}%` }} />
      </div>

      <ul className="relative mt-4 flex flex-1 flex-wrap content-start gap-1.5">
        {p.feats.map((f) => (
          <li key={f} className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[11px] font-semibold text-fg-2">
            <Check className={cn("size-3", hot ? "text-lime" : "text-faint")} strokeWidth={3} /> {f}
          </li>
        ))}
      </ul>

      <div className="relative mt-4 flex items-center justify-between border-t border-line pt-3 text-[12px] font-semibold text-muted">
        <span className="flex items-center gap-1.5">
          <FlaskConical className="size-3.5 text-faint" />
          {p.trials ? (
            <>
              <b className="text-fg tabular">{p.trials}</b> en prueba
            </>
          ) : (
            "Alta asistida por ventas"
          )}
        </span>
        <button className="flex items-center gap-1 text-fg-2 transition hover:text-fg">
          {p.price ? "Editar plan" : "Ver contratos"} <ArrowUpRight className="size-3.5" />
        </button>
      </div>
    </article>
  );
}

/* ══ Pruebas que terminan ════════════════════════════════════ */

const FIT_TONE: Record<TrialRow["fit"], Tone> = { Alta: "lime", Media: "amber", Baja: "rose" };

function TrialsCard() {
  return (
    <article className="panel-flat stagger flex flex-col p-5" style={s(8)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-fg">
            <Clock3 className="size-4 text-amber" /> Pruebas por vencer
          </h3>
          <p className="mt-0.5 text-[12.5px] text-muted">
            <b className="text-fg tabular">{PLATFORM.trialsThisWeek}</b> de {PLATFORM.trials} terminan en 7 días · conversión media 31%
          </p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {TRIALS.map((t) => {
          const urgent = t.daysLeft <= 2;
          const NameEl = (
            <span className="block truncate text-[13.5px] font-bold text-fg">{t.name}</span>
          );
          return (
            <li key={t.name} className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.015] p-3 transition hover:border-line-strong">
              <span
                className={cn(
                  "grid w-12 shrink-0 place-items-center rounded-xl py-1.5 text-center",
                  urgent ? "bg-amber/12 text-amber ring-1 ring-amber/25" : "bg-white/[0.05] text-fg-2",
                )}
              >
                <span className="text-[18px] font-extrabold leading-none tabular">{t.daysLeft}</span>
                <span className="text-[9.5px] font-bold uppercase tracking-[0.08em]">{t.daysLeft === 1 ? "día" : "días"}</span>
              </span>
              <span className="min-w-0 flex-1">
                {t.slug ? (
                  <Link href={`/superadmin/gimnasios/${t.slug}`} className="block truncate transition hover:[&>span]:text-lime">
                    {NameEl}
                  </Link>
                ) : (
                  NameEl
                )}
                <span className="mt-0.5 block truncate text-[11.5px] font-semibold text-muted">
                  {t.city} · {t.socios} socios · vence {t.ends}
                </span>
                <span className="mt-2 flex items-center gap-2">
                  <span className="flex flex-1 gap-[3px]" aria-label={`Onboarding ${t.steps} de 6`}>
                    {Array.from({ length: 6 }).map((_, k) => (
                      <span key={k} className={cn("h-1 flex-1 rounded-full", k < t.steps ? (t.steps === 6 ? "bg-lime" : "bg-white/40") : "bg-white/[0.07]")} />
                    ))}
                  </span>
                  <span className="text-[10.5px] font-bold text-muted tabular">{t.steps}/6</span>
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1.5">
                <Pill tone={FIT_TONE[t.fit]} className="px-2 py-0.5 text-[10.5px]">
                  {t.fit}
                </Pill>
                <button
                  className="flex h-7 items-center gap-1 rounded-lg border border-line px-2 text-[11.5px] font-semibold text-fg-2 transition hover:border-line-strong hover:text-fg"
                  aria-label={t.fit === "Baja" ? `Llamar a ${t.name}` : `Extender la prueba de ${t.name}`}
                >
                  {t.fit === "Baja" ? <PhoneCall className="size-3" /> : <TimerReset className="size-3" />}
                  {t.fit === "Baja" ? "Llamar" : "+7 días"}
                </button>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-auto pt-4 text-[11.5px] font-semibold text-muted">
        Probabilidad de conversión según onboarding, socios importados y uso del panel.
      </p>
    </article>
  );
}

/* ══ Renovaciones ════════════════════════════════════════════ */

const RENEWAL_TONE: Record<Renewal["status"], Tone> = {
  Firmada: "lime",
  Confirmada: "cyan",
  "Propuesta enviada": "violet",
  "En negociación": "amber",
};
const OWNER_FACE: Record<string, number> = { "Valentina Sosa": 2, "Ana Bustos": 12 };

function RenewalsCard() {
  const total = RENEWALS.reduce((a, r) => a + r.mrr, 0);
  return (
    <article className="panel-flat stagger p-5" style={s(9)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-fg">Próximas renovaciones</h3>
          <p className="mt-0.5 text-[12.5px] text-muted">
            Contratos anuales · próximos 21 días · <b className="text-fg tabular">{money(total)}</b> de MRR en juego
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-3 py-2">
          <CalendarClock className="size-4 shrink-0 text-lime" />
          <p className="text-[12px] font-semibold leading-tight text-muted">
            Débito mensual · <span className="text-fg">{MONTHLY_RUN.date}</span>
            <br />
            <b className="text-fg tabular">{MONTHLY_RUN.accounts}</b> cuentas · <b className="text-fg tabular">{money(MONTHLY_RUN.amount)}</b>
          </p>
        </div>
      </div>

      <ol className="relative mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5 xl:gap-4">
        {/* línea de tiempo (desktop) */}
        <span className="absolute inset-x-6 top-[26px] hidden h-px bg-gradient-to-r from-lime/60 via-line-strong to-transparent xl:block" />
        {RENEWALS.map((r, k) => {
          const first = k === 0;
          return (
            <li key={r.name} className="relative flex items-center gap-3 xl:flex-col xl:items-stretch xl:gap-3">
              <span
                className={cn(
                  "relative z-10 grid w-[54px] shrink-0 place-items-center rounded-xl border py-1.5 text-center",
                  first ? "border-lime/40 bg-ink text-lime shadow-[0_0_20px_-6px_rgb(181_245_74/0.6)]" : "border-line bg-ink text-fg-2",
                )}
              >
                <span className="text-[9.5px] font-bold uppercase tracking-[0.1em]">{r.dow}</span>
                <span className="text-[19px] font-extrabold leading-none tabular">{r.day}</span>
                <span className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted">{r.month}</span>
              </span>
              <div className="min-w-0 flex-1 rounded-xl border border-line bg-white/[0.015] p-3 transition hover:border-line-strong">
                <div className="flex items-center gap-2.5">
                  <TenantLogo name={r.name} plan={r.plan} className="size-8 rounded-lg text-[10.5px]" />
                  <span className="min-w-0 flex-1">
                    {r.slug ? (
                      <Link href={`/superadmin/gimnasios/${r.slug}`} className="block truncate text-[13px] font-bold text-fg transition hover:text-lime">
                        {r.name}
                      </Link>
                    ) : (
                      <span className="block truncate text-[13px] font-bold text-fg">{r.name}</span>
                    )}
                    <span className="block truncate text-[11.5px] font-semibold text-muted tabular">
                      {r.plan} · {money(r.mrr)}
                    </span>
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <Pill tone={RENEWAL_TONE[r.status]} dot className="px-2 py-0.5 text-[10.5px]">
                    {r.status}
                  </Pill>
                  <Avatar i={OWNER_FACE[r.owner] ?? 0} size={20} alt={r.owner} />
                </div>
                {r.change && <p className="mt-2 truncate text-[11px] font-semibold text-fg-2">{r.change}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
