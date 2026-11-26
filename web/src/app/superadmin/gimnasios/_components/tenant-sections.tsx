import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  Flag,
  KeyRound,
  LifeBuoy,
  MapPin,
  MessageCircle,
  QrCode,
  ScrollText,
  Settings2,
  ShieldCheck,
  Smartphone,
  Users,
  Wallet,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import {
  Avatar,
  Pill,
  Ring,
  SectionTitle,
  Sparkline,
  type Tone,
} from "@/components/ui/primitives";
import { PHOTO } from "@/lib/photos";
import { cn, compactMoney, fmt, money } from "@/lib/utils";
import {
  COUNTRY_NAME,
  HEALTH_META,
  healthBand,
  lastSeenLabel,
  PLAN_PRICE,
} from "../../_data";
import type {
  InvoiceStatus,
  LogKind,
  TenantDetail,
  Ticket,
} from "../_lib/detail";
import { HealthGauge, PlanTag, TenantLogo, tenantCover } from "./bits";
import { FlagList, TenantActions } from "./tenant-client";

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

/* ══ Hero ════════════════════════════════════════════════════ */

export function TenantHero({ d }: { d: TenantDetail }) {
  const { t } = d;
  const offline = d.branches.filter((b) => !b.online).length;
  const readers = d.branches.reduce((a, b) => a + b.readers, 0);
  const todaySoFar = d.checkins14[13].v;
  const sociosGrowth = ((t.socios - d.sociosTrend[0]) / d.sociosTrend[0]) * 100;
  const appGain = t.app - d.appTrend[0];
  const unit = t.plan === "Cadena" ? null : PLAN_PRICE[t.plan];

  const stats: {
    icon: LucideIcon;
    label: string;
    value: React.ReactNode;
    hint: React.ReactNode;
  }[] = [
    {
      icon: Wallet,
      label: "MRR",
      value: t.mrr ? money(t.mrr) : "—",
      hint:
        t.status === "En prueba"
          ? `prueba hasta el ${t.trialEnds}`
          : unit
            ? `${t.sedes} × ${money(unit)}`
            : "contrato a medida",
    },
    {
      icon: Users,
      label: "Socios",
      value: fmt(t.socios),
      hint: (
        <>
          <span className={sociosGrowth >= 0 ? "text-lime" : "text-rose"}>
            {sociosGrowth >= 0 ? "+" : "−"}
            {Math.abs(sociosGrowth).toLocaleString("es-AR", {
              maximumFractionDigits: 0,
            })}
            %
          </span>{" "}
          en 12 meses
        </>
      ),
    },
    {
      icon: QrCode,
      label: "Accesos/día",
      value: fmt(d.checkinsDay),
      hint: (
        <>
          <span className="text-fg-2 tabular">{fmt(todaySoFar)}</span> hoy a las
          08:52
        </>
      ),
    },
    {
      icon: Smartphone,
      label: "App del socio",
      value: `${t.app}%`,
      hint: (
        <>
          <span className="text-lime">+{appGain} pts</span> en 12 meses
        </>
      ),
    },
    {
      icon: Building2,
      label: t.sedes === 1 ? "Sede" : "Sedes",
      value: t.sedes,
      hint: offline ? (
        <>
          <span className="text-amber">{offline} sin conexión</span> · {readers}{" "}
          lectores
        </>
      ) : (
        `${readers} ${readers === 1 ? "lector online" : "lectores online"}`
      ),
    },
  ];

  return (
    <section
      className="panel noise stagger relative overflow-hidden"
      style={s(0)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tenantCover(t.id, 1800, 700)}
        alt=""
        className="photo-grade absolute inset-0 h-full w-full object-cover object-[70%_40%] opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
      <div className="grid-lines absolute inset-0 opacity-50 [mask-image:linear-gradient(100deg,black_10%,transparent_55%)]" />
      <div className="absolute -left-24 -top-24 size-[340px] rounded-full bg-lime/[0.08] blur-[90px]" />

      <div className="relative px-4 pb-4 pt-5 sm:px-7 sm:pb-6 sm:pt-7">
        <nav
          className="mb-5 flex items-center gap-1.5 text-[12px] font-semibold text-muted sm:mb-6"
          aria-label="Migas"
        >
          <Link
            href="/superadmin/gimnasios"
            className="transition hover:text-fg"
          >
            Gimnasios
          </Link>
          <ChevronRight className="size-3.5 text-faint" />
          <span className="truncate text-fg-2">{t.name}</span>
        </nav>

        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <TenantLogo
              name={t.name}
              plan={t.plan}
              className="size-[72px] rounded-[22px] text-[24px] shadow-[0_20px_40px_-16px_rgb(0_0_0/0.9)] sm:size-[92px] sm:rounded-[26px] sm:text-[30px]"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <Pill tone={t.tone} dot>
                  {t.status}
                </Pill>
                <span className="inline-flex items-center rounded-full bg-white/[0.06] px-2.5 py-1 ring-1 ring-inset ring-white/10">
                  <PlanTag plan={t.plan} />
                </span>
                <Pill>
                  <MapPin className="size-3" /> {t.city},{" "}
                  {COUNTRY_NAME[t.country]}
                </Pill>
              </div>
              <h2 className="mt-3 text-[32px] font-extrabold leading-[1.02] tracking-[-0.045em] text-fg sm:text-[44px]">
                {t.name}
              </h2>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-muted">
                <span className="font-bold text-fg-2 tabular">{t.id}</span>
                <span>
                  Cliente desde <b className="font-bold text-fg-2">{t.since}</b>
                </span>
                <span className="flex items-center gap-1.5">
                  {t.lastSeen < 15 && (
                    <span className="size-1.5 rounded-full bg-emerald shadow-[0_0_6px_rgb(61_220_151/0.8)]" />
                  )}
                  Actividad{" "}
                  <b className="font-bold text-fg-2">
                    {lastSeenLabel(t.lastSeen)}
                  </b>
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-ink/55 p-2.5 pr-4 backdrop-blur-md xl:w-[320px]">
              <Avatar i={t.ownerFace} size={40} ring />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-bold text-fg">
                  {t.owner}
                </span>
                <span className="block truncate text-[11.5px] font-semibold text-muted">
                  Dueño · {d.staff} de staff
                </span>
              </span>
              <HealthGauge value={t.health} size={34} showLabel />
            </div>
            <TenantActions
              name={t.name}
              owner={t.owner}
              plan={t.plan}
              sedes={t.sedes}
              suspended={t.status === "Suspendido"}
            />
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-6 xl:grid-cols-5">
          {stats.map((k, i) => (
            <div
              key={k.label}
              className={cn(
                "min-w-0 bg-[#0d131c]/90 px-4 py-3.5 backdrop-blur-md sm:px-5 sm:py-4",
                i < 3 ? "sm:col-span-2" : "sm:col-span-3",
                i === 4 && "col-span-2",
                "xl:col-span-1",
              )}
            >
              <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                <k.icon className="size-3.5 text-faint" /> {k.label}
              </dt>
              <dd className="mt-2 truncate text-[22px] font-extrabold leading-none tracking-[-0.035em] text-fg tabular sm:text-[26px]">
                {k.value}
              </dd>
              <dd className="mt-1.5 truncate text-[11.5px] font-semibold text-muted">
                {k.hint}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ══ Salud ═══════════════════════════════════════════════════ */

export function HealthCard({ d, i }: { d: TenantDetail; i: number }) {
  const { t } = d;
  const meta = HEALTH_META[healthBand(t.health)];
  const len = Math.PI * 84;
  const weakest = [...d.factors].sort((a, b) => a.value - b.value)[0];
  return (
    <article
      className="stagger relative grid gap-x-7 gap-y-5 overflow-hidden rounded-[18px] border border-line bg-gradient-to-br from-[#222d3b] via-surface to-surface p-5 sm:grid-cols-[230px_minmax(0,1fr)]"
      style={s(i)}
    >
      <div className="flex flex-col">
        <SectionTitle
          title="Índice de salud"
          hint="5 factores · se recalcula cada noche"
        />
        <div className="relative mx-auto mt-5 w-full max-w-[210px]">
          <svg
            viewBox="0 0 200 112"
            className="w-full overflow-visible"
            aria-hidden
          >
            <path
              d="M16 100 A84 84 0 0 1 184 100"
              fill="none"
              stroke="rgb(255 255 255 / 0.08)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M16 100 A84 84 0 0 1 184 100"
              fill="none"
              stroke={meta.color}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={len}
              strokeDashoffset={len * (1 - t.health / 100)}
              style={{
                filter: `drop-shadow(0 0 10px color-mix(in oklab, ${meta.color} 45%, transparent))`,
              }}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <p className="text-[40px] font-extrabold leading-none tracking-[-0.05em] text-fg tabular">
              {t.health}
            </p>
            <p
              className="mt-1 text-[12px] font-bold"
              style={{ color: meta.color }}
            >
              {meta.label}
            </p>
          </div>
        </div>
        <p className="mt-5 rounded-xl border border-line bg-ink/40 p-3 text-[12px] leading-relaxed text-muted">
          <b className="font-bold text-fg">
            Punto débil: {weakest.label.charAt(0).toLowerCase() + weakest.label.slice(1)}.
          </b>{" "}
          {weakest.key === "pag"
            ? "Regularizar el pago suma hasta 20 puntos."
            : weakest.key === "app"
              ? "Una campaña de activación de la app suele sumar 8 a 12 puntos."
              : "Una capacitación al staff es lo que más mueve la renovación."}
        </p>
      </div>

      <ul className="grid content-center gap-3.5 sm:border-l sm:border-line sm:pl-7">
        {d.factors.map((f) => {
          const fm = HEALTH_META[healthBand(f.value)];
          return (
            <li key={f.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-[12.5px] font-bold text-fg">
                  {f.label}{" "}
                  <span className="font-semibold text-faint">
                    · peso {f.weight}%
                  </span>
                </span>
                <span className="text-[13px] font-extrabold text-fg tabular">
                  {f.value}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${f.value}%`,
                    background: fm.color,
                    animation: "fade-in .8s ease both",
                  }}
                />
              </div>
              <p className="mt-1 truncate text-[11px] font-medium text-muted">
                {f.hint}
              </p>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

/* ══ Uso ═════════════════════════════════════════════════════ */

export function UsageCard({ d, i }: { d: TenantDetail; i: number }) {
  const { t } = d;
  const days = d.checkins14;
  const max = Math.max(...days.map((x) => x.v), 1);
  const thisWeek = days.slice(7, 13).reduce((a, x) => a + x.v, 0);
  const lastWeek = days.slice(0, 6).reduce((a, x) => a + x.v, 0);
  const wow = lastWeek ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;
  const appGain = t.app - d.appTrend[0];
  return (
    <article
      className="panel-flat stagger grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_190px]"
      style={s(i)}
    >
      <div className="flex min-w-0 flex-col">
        <SectionTitle
          title="Uso de la plataforma"
          hint="Accesos por día · últimos 14 días"
          action={
            <span
              className={cn(
                "shrink-0 text-[12px] font-bold tabular",
                wow >= 0 ? "text-lime" : "text-rose",
              )}
            >
              {wow >= 0 ? "+" : "−"}
              {Math.abs(wow).toLocaleString("es-AR", {
                maximumFractionDigits: 1,
              })}
              % sem.
            </span>
          }
        />
        <div className="mt-4 flex items-end gap-2">
          <p className="text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">
            {fmt(d.checkinsDay)}
          </p>
          <p className="pb-0.5 text-[12px] font-semibold text-muted">
            accesos / día en promedio
          </p>
        </div>
        {/* barras: la última es hoy (parcial) */}
        <div className="mt-4 flex h-[128px] items-end gap-[5px]">
          {days.map((x, k) => (
            <div
              key={k}
              className="group flex h-full flex-1 flex-col justify-end gap-1.5"
            >
              <div className="relative flex-1">
                <div
                  title={`${x.d}: ${fmt(x.v)} accesos`}
                  className={cn(
                    "absolute inset-x-0 bottom-0 rounded-[5px] transition group-hover:brightness-125",
                    x.today
                      ? "border border-dashed border-lime/70 bg-lime/25 shadow-[0_0_18px_-4px_rgb(181_245_74/0.6)]"
                      : k >= 7
                        ? "bg-white/[0.2]"
                        : "bg-white/[0.09]",
                  )}
                  style={{
                    height: `${Math.max(4, (x.v / max) * 100)}%`,
                    animation: `fade-up .7s cubic-bezier(.22,1,.36,1) ${k * 35}ms both`,
                  }}
                />
              </div>
              <p
                className={cn(
                  "text-center text-[9.5px] font-bold",
                  x.today ? "text-lime" : "text-faint",
                  !x.today && k % 2 === 1 && "max-sm:invisible",
                )}
              >
                {x.today ? "Hoy" : x.d.slice(0, 1)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
        <div className="rounded-xl border border-line bg-white/[0.02] p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
            Socios
          </p>
          <p className="mt-1.5 text-[19px] font-extrabold leading-none text-fg tabular">
            {fmt(t.socios)}
          </p>
          <Sparkline
            data={d.sociosTrend}
            height={34}
            className="mt-2"
            color="var(--color-violet)"
          />
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-3">
          <Ring value={t.app} size={58} stroke={7}>
            <span className="text-[13px] font-extrabold text-fg tabular">
              {t.app}%
            </span>
          </Ring>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
              App activa
            </p>
            <p className="mt-1 text-[11.5px] font-semibold leading-snug text-fg-2">
              <span className="text-lime">+{appGain} pts</span> en el año
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ══ Facturación: MRR histórico + comprobantes ═══════════════ */

const INVOICE_TONE: Record<InvoiceStatus, Tone> = {
  Pagada: "lime",
  Próxima: "neutral",
  Reintentando: "amber",
  Vencida: "rose",
};

export function BillingCard({ d, i }: { d: TenantDetail; i: number }) {
  const { t } = d;
  const hist = d.mrrHistory;
  const max = Math.max(...hist.map((h) => h.v), 1);
  const billed12 = hist.reduce((a, h) => a + h.v, 0);
  const notes = hist.map((h, k) => ({ ...h, k })).filter((h) => h.note);
  return (
    <article className="panel-flat stagger overflow-hidden" style={s(i)}>
      <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* MRR histórico */}
        <div className="flex flex-col p-5">
          <SectionTitle title="MRR histórico" hint="Dic 2025 → Nov 2026" />
          <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
            <div>
              <p className="text-[28px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">
                {t.mrr ? money(t.mrr) : "—"}
              </p>
              <p className="mt-1 text-[11.5px] font-semibold text-muted">
                MRR actual
              </p>
            </div>
            <div>
              <p className="text-[17px] font-extrabold leading-none text-fg-2 tabular">
                {billed12 ? compactMoney(billed12) : "—"}
              </p>
              <p className="mt-1 text-[11.5px] font-semibold text-muted">
                facturado en 12 meses
              </p>
            </div>
          </div>
          {t.status === "En prueba" ? (
            <TrialProgress
              ends={t.trialEnds ?? ""}
              price={PLAN_PRICE[t.plan as "Starter" | "Pro"] * t.sedes}
              plan={t.plan}
            />
          ) : (
            <>
              <div className="mt-5 flex h-[150px] items-end gap-1.5">
                {hist.map((h, k) => {
                  const last = k === hist.length - 1;
                  return (
                    <div
                      key={h.m}
                      className="group flex h-full flex-1 flex-col justify-end gap-1.5"
                    >
                      <div className="relative flex-1 rounded-[7px] bg-white/[0.035]">
                        {h.note && (
                          <span className="absolute inset-x-0 -top-1 z-10 flex justify-center">
                            <span className="grid size-4 place-items-center rounded-full bg-violet text-[9px] font-extrabold text-ink">
                              {notes.findIndex((n) => n.k === k) + 1}
                            </span>
                          </span>
                        )}
                        <div
                          title={`${h.m}: ${money(h.v)}`}
                          className={cn(
                            "absolute inset-x-0 bottom-0 rounded-[7px] transition group-hover:brightness-125",
                            last
                              ? "bg-lime shadow-[0_0_22px_-4px_rgb(181_245_74/0.7)]"
                              : "bg-white/[0.16]",
                          )}
                          style={{
                            height: h.v
                              ? `${Math.max(6, (h.v / max) * 88)}%`
                              : 0,
                            animation: `fade-up .8s cubic-bezier(.22,1,.36,1) ${k * 45}ms both`,
                          }}
                        />
                      </div>
                      <p
                        className={cn(
                          "text-center text-[9.5px] font-bold",
                          last ? "text-lime" : "text-faint",
                          !last && k % 2 === 0 && "max-sm:invisible",
                        )}
                      >
                        {h.m}
                      </p>
                    </div>
                  );
                })}
              </div>
              {notes.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11.5px] font-semibold text-muted">
                  {notes.map((n, k) => (
                    <li key={n.k} className="flex items-center gap-1.5">
                      <span className="grid size-4 place-items-center rounded-full bg-violet/20 text-[9px] font-extrabold text-violet">
                        {k + 1}
                      </span>
                      <span className="text-fg-2">{n.m}</span> · {n.note}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* comprobantes */}
        <div className="flex flex-col border-t border-line lg:border-l lg:border-t-0">
          <div className="flex items-start justify-between gap-3 p-5 pb-3">
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">
                Facturas
              </h3>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12.5px] text-muted">
                <CreditCard className="size-3.5 shrink-0" />{" "}
                <span className="truncate">{d.method}</span>
              </p>
            </div>
            <button className="shrink-0 text-[12.5px] font-semibold text-muted transition hover:text-fg">
              Ver todas
            </button>
          </div>
          {d.invoices.length === 0 ? (
            <div className="m-5 mt-2 grid flex-1 place-items-center rounded-xl border border-dashed border-line-strong p-6 text-center">
              <div>
                <FileText className="mx-auto size-5 text-faint" />
                <p className="mt-2 text-[13px] font-bold text-fg">
                  Sin facturas todavía
                </p>
                <p className="mt-0.5 text-[12px] text-muted">
                  La primera se emite al terminar la prueba ({t.trialEnds}).
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-line/70 border-t border-line/70">
              {d.invoices.map((inv) => (
                <li
                  key={inv.number}
                  title={inv.number}
                  className="group flex items-center gap-3 px-5 py-3 transition hover:bg-white/[0.02]"
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-xl",
                      inv.status === "Próxima"
                        ? "border border-dashed border-line-strong text-faint"
                        : "bg-white/[0.05] text-fg-2",
                    )}
                  >
                    <FileText className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-fg">
                      {inv.period}
                    </span>
                    <span className="block truncate text-[11px] font-semibold text-muted tabular">
                      {inv.issued} · N.º {inv.number.slice(-8)}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[13px] font-bold text-fg tabular">
                      {money(inv.amount)}
                    </span>
                    <Pill
                      tone={INVOICE_TONE[inv.status]}
                      className="px-2 py-0.5 text-[10.5px]"
                    >
                      {inv.status}
                    </Pill>
                  </span>
                  <button
                    className="hidden size-8 shrink-0 place-items-center rounded-lg text-faint transition hover:bg-white/[0.05] hover:text-fg sm:grid"
                    aria-label={`Descargar ${inv.number}`}
                  >
                    <Download className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

/** Prueba gratis de 14 días: progreso y precio al convertir. */
function TrialProgress({
  ends,
  price,
  plan,
}: {
  ends: string;
  price: number;
  plan: string;
}) {
  // "vie 27 nov" | "mar 1 dic" → días que faltan desde el mié 25 nov
  const [, day, mon] = ends.split(" ");
  const left = (mon === "dic" ? 30 : 0) + Number(day) - 25;
  const elapsed = 14 - left;
  return (
    <div className="mt-5 flex flex-1 flex-col rounded-xl border border-amber/25 bg-amber/[0.05] p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-bold text-fg">
          Prueba gratis · día {elapsed} de 14
        </p>
        <p className="text-[12px] font-bold text-amber tabular">
          {left === 1 ? "queda 1 día" : `quedan ${left} días`}
        </p>
      </div>
      <div className="mt-3 flex gap-[3px]">
        {Array.from({ length: 14 }).map((_, k) => (
          <span
            key={k}
            className={cn(
              "h-2 flex-1 rounded-full",
              k < elapsed ? "bg-amber" : "bg-white/[0.08]",
            )}
          />
        ))}
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-muted">
        Al convertir pasa a <b className="font-bold text-fg">{plan}</b> por{" "}
        <b className="font-bold text-fg tabular">{money(price)}</b> / mes.
        Todavía no cargó un método de pago: el aviso automático sale 48 h antes
        del vencimiento ({ends}).
      </p>
    </div>
  );
}

/* ══ Sedes ═══════════════════════════════════════════════════ */

const BRANCH_PHOTOS = [
  PHOTO.gymFloor,
  PHOTO.machine,
  PHOTO.barbell,
  PHOTO.row,
  PHOTO.dumbbells,
  PHOTO.bench,
  PHOTO.ropes,
  PHOTO.pullup,
  PHOTO.deadlift,
];

export function BranchesCard({ d, i }: { d: TenantDetail; i: number }) {
  const maxToday = Math.max(...d.branches.map((b) => b.today), 1);
  return (
    <article className="panel-flat stagger overflow-hidden" style={s(i)}>
      <div className="p-5 pb-3">
        <SectionTitle
          title={d.t.sedes === 1 ? "Sede" : `Sedes · ${d.t.sedes}`}
          hint="Socios, ingresos de hoy y estado de los lectores"
          action={
            <button className="shrink-0 text-[12.5px] font-semibold text-muted transition hover:text-fg">
              Gestionar
            </button>
          }
        />
      </div>
      <ul className="divide-y divide-line/70 border-t border-line/70">
        {d.branches.map((b, k) => (
          <li
            key={b.name}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 sm:grid-cols-[auto_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:gap-4"
          >
            <span className="relative size-12 shrink-0 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={BRANCH_PHOTOS[
                  (k + Number(d.t.id.slice(-2))) % BRANCH_PHOTOS.length
                ](160, 160)}
                alt=""
                loading="lazy"
                className="photo-grade size-full object-cover"
              />
              <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-bold text-fg">
                {b.name}
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 truncate text-[11.5px] font-semibold text-muted">
                <Avatar i={b.managerFace} size={16} />{" "}
                <span className="truncate">{b.manager}</span>
                <span className="hidden truncate 2xl:inline">· {b.city}</span>
              </span>
            </span>
            <span className="hidden sm:block">
              <span className="block text-[11px] font-semibold text-muted">
                Socios
              </span>
              <span className="block text-[14px] font-extrabold text-fg tabular">
                {fmt(b.socios)}
              </span>
            </span>
            <span className="hidden sm:block">
              <span className="flex items-baseline justify-between gap-2 text-[11px] font-semibold text-muted">
                Hoy{" "}
                <span className="text-[12.5px] font-extrabold text-fg tabular">
                  {fmt(b.today)}
                </span>
              </span>
              <span className="mt-1.5 block h-1 rounded-full bg-white/[0.06]">
                <span
                  className="block h-full rounded-full bg-lime"
                  style={{ width: `${(b.today / maxToday) * 100}%` }}
                />
              </span>
            </span>
            <span className="flex flex-col items-end gap-1 sm:w-[118px]">
              {b.online ? (
                <Pill tone="lime" className="px-2 py-0.5 text-[10.5px]">
                  <Wifi className="size-3" /> {b.readers}{" "}
                  {b.readers === 1 ? "lector" : "lectores"}
                </Pill>
              ) : (
                <Pill tone="amber" className="px-2 py-0.5 text-[10.5px]">
                  <WifiOff className="size-3" /> Sin conexión
                </Pill>
              )}
              <span className="text-[11px] font-semibold text-muted tabular sm:hidden">
                {fmt(b.socios)} socios · {fmt(b.today)} hoy
              </span>
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ══ Feature flags ═══════════════════════════════════════════ */

export function FlagsCard({ d, i }: { d: TenantDetail; i: number }) {
  return (
    <article className="panel-flat stagger p-5" style={s(i)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-fg">
          <Flag className="size-4 text-lime" /> Feature flags
        </h3>
        <span className="text-[11.5px] font-semibold text-muted">
          solo esta cuenta
        </span>
      </div>
      <FlagList flags={d.flags} />
    </article>
  );
}

/* ══ Tickets ═════════════════════════════════════════════════ */

const PRIORITY_TONE: Record<Ticket["priority"], Tone> = {
  Alta: "rose",
  Media: "amber",
  Baja: "neutral",
};
const TICKET_TONE: Record<Ticket["status"], Tone> = {
  Abierto: "rose",
  "En curso": "cyan",
  "Esperando cliente": "violet",
  Resuelto: "neutral",
};

export function TicketsCard({ d, i }: { d: TenantDetail; i: number }) {
  const open = d.tickets.filter((x) => x.status !== "Resuelto").length;
  return (
    <article className="panel-flat stagger p-5" style={s(i)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-fg">
          <LifeBuoy className="size-4 text-lime" /> Soporte
        </h3>
        <span className="text-[11.5px] font-semibold text-muted">
          <b className={cn("tabular", open ? "text-fg" : "text-muted")}>
            {open}
          </b>{" "}
          {open === 1 ? "abierto" : "abiertos"}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {d.tickets.map((tk) => (
          <li
            key={tk.id}
            className={cn(
              "rounded-xl border border-line p-3 transition hover:border-line-strong",
              tk.status === "Resuelto"
                ? "bg-transparent opacity-70"
                : "bg-white/[0.02]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 text-[13px] font-bold leading-snug text-fg">
                {tk.subject}
              </p>
              <Pill
                tone={PRIORITY_TONE[tk.priority]}
                className="shrink-0 px-2 py-0.5 text-[10px]"
              >
                {tk.priority}
              </Pill>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] font-semibold text-muted">
              <span className="tabular">{tk.id}</span>·<span>{tk.agent}</span>·
              <span>{tk.age}</span>
              <Pill
                tone={TICKET_TONE[tk.status]}
                dot
                className="ml-auto px-2 py-0.5 text-[10px]"
              >
                {tk.status}
              </Pill>
            </div>
          </li>
        ))}
      </ul>
      <button className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-line text-[12.5px] font-semibold text-fg-2 transition hover:bg-white/[0.04] hover:text-fg">
        <MessageCircle className="size-4" /> Abrir ticket para{" "}
        {d.t.owner.split(" ")[0]}
      </button>
    </article>
  );
}

/* ══ Auditoría ═══════════════════════════════════════════════ */

const LOG_META: Record<LogKind, { icon: LucideIcon; cls: string }> = {
  billing: { icon: Wallet, cls: "bg-lime/12 text-lime" },
  config: { icon: Settings2, cls: "bg-violet/12 text-violet" },
  access: { icon: QrCode, cls: "bg-amber/12 text-amber" },
  support: { icon: LifeBuoy, cls: "bg-cyan/12 text-cyan" },
  security: { icon: KeyRound, cls: "bg-rose/12 text-rose" },
};

export function AuditCard({ d, i }: { d: TenantDetail; i: number }) {
  return (
    <article className="panel-flat stagger p-5" style={s(i)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-fg">
          <ScrollText className="size-4 text-lime" /> Actividad y auditoría
        </h3>
        <button className="flex items-center gap-1 text-[12.5px] font-semibold text-muted transition hover:text-fg">
          Ver todo <ArrowUpRight className="size-3.5" />
        </button>
      </div>
      <ol className="relative mt-4 space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-line-strong">
        {d.log.map((l, k) => {
          const m = LOG_META[l.kind];
          return (
            <li key={k} className="relative flex gap-3">
              <span
                className={cn(
                  "relative grid size-8 shrink-0 place-items-center rounded-lg ring-4 ring-surface",
                  m.cls,
                )}
              >
                <m.icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[12.5px] leading-snug text-fg-2">
                  <b className="font-bold text-fg">{l.who}</b> {l.action}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-muted">
                  {l.role} · {l.time}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-[11.5px] font-semibold text-muted">
        <ShieldCheck className="size-3.5 text-lime" /> Las sesiones de
        impersonación quedan registradas acá.
      </p>
    </article>
  );
}
