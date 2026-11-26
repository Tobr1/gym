import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  Download,
  MessageCircle,
  RefreshCcw,
  UserPlus,
  UserRoundCheck,
} from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { DualAreaChart, Donut } from "@/components/charts";
import { CountUp } from "@/components/count-up";
import { Avatar, Button, Delta, Pill, Ring, SectionTitle, Sparkline } from "@/components/ui/primitives";
import { CHECKINS_WEEK, HOURLY, MEMBERS, PLAN_MIX, STATUS_META } from "@/lib/mock";
import { cn, money } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

// Hoy es miércoles 25/11: la serie móvil cierra ayer (martes 24) en vez de mostrar días futuros.
const LAST_7_DAYS = [...CHECKINS_WEEK.slice(2), ...CHECKINS_WEEK.slice(0, 2)];

// Cobranzas: primero lo vencido, después lo que vence antes.
const PENDING = MEMBERS.filter((m) => m.status === "por-vencer" || m.status === "vencido").sort(
  (a, b) => Number(b.status === "vencido") - Number(a.status === "vencido") || a.due.localeCompare(b.due),
);

export default function DashboardPage() {
  return (
    <>
      <PageHeader eyebrow="Miércoles 25 de noviembre · Sede Centro" title="Buen día, Carolina">
        <div className="flex rounded-xl border border-line bg-white/[0.02] p-1 text-[12.5px] font-semibold">
          {["Hoy", "7 días", "Mes", "Año"].map((t, i) => (
            <button
              key={t}
              className={cn(
                "rounded-lg px-3 py-1.5 transition",
                i === 2 ? "bg-surface-3 text-fg shadow" : "text-muted hover:text-fg",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <Button variant="secondary">
          <Download className="size-4" /> Exportar
        </Button>
      </PageHeader>

      {/* ── KPIs principales ─────────────────────────────── */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.25fr_1fr_0.9fr]">
        <article className="panel glow-lime stagger overflow-hidden p-5 sm:p-6" style={s(1)}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-fg-2">Ingresos del mes</p>
            <Delta value={12.3} solid className="px-2.5 py-1 text-[13px]" />
          </div>
          <p className="mt-2 whitespace-nowrap text-[38px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular sm:text-[44px] 2xl:text-[48px]">
            <CountUp value={46_712_300} prefix="$ " />
          </p>
          <p className="mt-2 text-[12.5px] text-muted">
            <span className="font-bold text-lime">+$ 5,1 M</span> vs. octubre · objetivo 92%
          </p>
          <Sparkline data={[18, 22, 21, 27, 25, 31, 29, 36, 34, 41, 39, 47]} height={64} className="mt-4 -mb-1" />
        </article>

        <article className="panel glow-violet stagger p-5 sm:p-6" style={s(2)}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-fg-2">Socios activos</p>
            <span className="rounded-full bg-violet px-2.5 py-1 text-[13px] font-bold text-ink tabular">+4,8%</span>
          </div>
          <p className="mt-2 whitespace-nowrap text-[38px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular sm:text-[44px] 2xl:text-[48px]">
            <CountUp value={1482} />
          </p>
          <p className="mt-2 text-[12.5px] text-muted">
            <span className="font-bold text-violet">+68 netos</span> este mes · retención 94,1%
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              ["Altas", "112", "text-lime"],
              ["Bajas", "44", "text-rose"],
              ["Congelados", "19", "text-cyan"],
            ].map(([l, v, c]) => (
              <div key={l} className="rounded-xl border border-line bg-white/[0.02] py-2.5">
                <p className={cn("text-lg font-extrabold tabular", c)}>{v}</p>
                <p className="text-[11px] font-semibold text-muted">{l}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel stagger flex items-center gap-5 p-5 sm:p-6 md:col-span-2 xl:col-span-1" style={s(3)}>
          <Ring value={61} size={112} stroke={11} className="shrink-0">
            <div>
              <p className="text-[28px] font-extrabold leading-none tracking-tight text-fg tabular">86</p>
              <p className="mt-1 text-[11px] font-semibold text-muted">de 140</p>
            </div>
          </Ring>
          <div className="min-w-0">
            <p className="flex items-center gap-2 whitespace-nowrap text-[13px] font-semibold text-fg-2">
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inset-0 animate-ping rounded-full bg-lime" />
                <span className="relative size-2 rounded-full bg-lime" />
              </span>
              En el gym ahora
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              Pico esperado a las <span className="font-bold text-fg">19:00</span> con ~128 personas.
            </p>
            <Link href="/admin/acceso" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-bold text-lime hover:underline">
              Accesos en vivo <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {/* en tablet la tarjeta ocupa todo el ancho: suma contexto operativo */}
          <dl className="ml-auto hidden shrink-0 grid-cols-3 gap-2 md:grid xl:hidden">
            {[
              ["Ingresos hoy", "214", "text-fg"],
              ["Clases ahora", "3", "text-violet"],
              ["Coaches en sala", "4", "text-cyan"],
            ].map(([l, v, c]) => (
              <div key={l} className="flex w-[104px] flex-col-reverse gap-1.5 whitespace-nowrap rounded-xl border border-line bg-white/[0.02] px-3 py-2.5">
                <dt className="text-[11px] font-semibold leading-tight text-muted">{l}</dt>
                <dd className={cn("text-xl font-extrabold leading-none tabular", c)}>{v}</dd>
              </div>
            ))}
          </dl>
        </article>
      </section>

      {/* ── Actividad + indicadores ─────────────────────── */}
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <article className="panel stagger p-5 sm:p-6" style={s(4)}>
          <SectionTitle
            title="Asistencia al gimnasio"
            hint="Check-ins por QR · 18 al 24 de noviembre"
            action={
              <div className="hidden items-center gap-4 text-[12px] font-semibold text-muted sm:flex">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-lime" /> Últimos 7 días
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-violet" /> 7 días previos
                </span>
              </div>
            }
          />
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-3xl font-extrabold tracking-tight text-fg tabular">2.678</p>
            <Delta value={7.4} />
            <span className="text-[12.5px] text-muted">vs. 7 días previos</span>
          </div>
          <div className="mt-2 flex items-center gap-4 text-[11.5px] font-semibold text-muted sm:hidden">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-lime" /> Últimos 7 días
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-violet" /> 7 días previos
            </span>
          </div>
          <DualAreaChart data={LAST_7_DAYS} xKey="day" a="hoy" b="prev" height={250} labels={["Últimos 7 días", "7 días previos"]} />
        </article>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Altas nuevas", value: 38, icon: UserPlus, spark: [3, 5, 4, 7, 6, 8, 5], d: 18.2, color: "var(--color-lime)" },
            { label: "Asistencia a clases", value: 89, suffix: "%", icon: CalendarCheck2, spark: [72, 78, 80, 77, 84, 86, 89], d: 3.1, color: "var(--color-violet)" },
            { label: "Renovaciones", value: 105, icon: RefreshCcw, spark: [12, 16, 14, 18, 15, 17, 13], d: 6.4, color: "var(--color-cyan)" },
            { label: "Turnos con coach", value: 56, icon: UserRoundCheck, spark: [9, 7, 8, 6, 9, 8, 9], d: -2.3, color: "var(--color-amber)" },
          ].map((k, i) => (
            <article
              key={k.label}
              className="panel stagger group flex flex-col justify-between p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong sm:p-5"
              style={s(5 + i)}
            >
              <div className="flex items-start justify-between">
                <span
                  className="grid size-9 place-items-center rounded-xl"
                  style={{ background: `color-mix(in oklab, ${k.color} 14%, transparent)`, color: k.color }}
                >
                  <k.icon className="size-[18px]" />
                </span>
                <Delta value={k.d} />
              </div>
              <div className="mt-4">
                <p className="text-[12.5px] font-semibold leading-tight text-muted">{k.label}</p>
                <p className="mt-1 text-[32px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">
                  <CountUp value={k.value} suffix={k.suffix} />
                </p>
              </div>
              <Sparkline data={k.spark} color={k.color} height={28} fill={false} className="mt-3 opacity-80" />
            </article>
          ))}
        </div>
      </section>

      {/* ── Tabla + columna lateral ─────────────────────── */}
      <section className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <article className="panel stagger flex flex-col overflow-hidden" style={s(9)}>
          <div className="p-5 pb-3 sm:p-6 sm:pb-3">
            <SectionTitle
              title="Actividad reciente de socios"
              hint="Ingresos y pagos de la última hora"
              action={
                <Link href="/admin/socios/1042" className="text-[12.5px] font-bold text-lime hover:underline">
                  Ver todos
                </Link>
              }
            />
          </div>
          <ul className="divide-y divide-line/60 border-t border-line md:hidden">
            {MEMBERS.slice(0, 6).map((m) => {
              const st = STATUS_META[m.status];
              return (
                <li key={m.id}>
                  <Link href={`/admin/socios/${m.id}`} className="flex items-center gap-3 px-5 py-3">
                    <Avatar i={m.face} size={40} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold text-fg">{m.name}</span>
                      <span className="block truncate text-[12px] text-muted">{m.plan} · {m.lastCheckIn}</span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <Pill tone={st.tone} dot>{st.label}</Pill>
                      <span className="text-[12.5px] font-bold text-fg tabular">{m.amount ? money(m.amount) : "—"}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] whitespace-nowrap text-left text-[13px]">
              <thead>
                <tr className="border-y border-line text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
                  <th className="px-6 py-3 font-bold">Socio</th>
                  <th className="px-3 py-3 font-bold">Estado</th>
                  <th className="px-3 py-3 font-bold">Plan</th>
                  <th className="px-3 py-3 font-bold">Último ingreso</th>
                  <th className="px-6 py-3 text-right font-bold">Cuota</th>
                </tr>
              </thead>
              <tbody>
                {MEMBERS.slice(0, 8).map((m) => {
                  const st = STATUS_META[m.status];
                  return (
                    <tr key={m.id} className="group border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.025]">
                      <td className="px-6 py-3">
                        <Link href={`/admin/socios/${m.id}`} className="flex items-center gap-3">
                          <Avatar i={m.face} size={36} />
                          <span>
                            <span className="block font-bold text-fg group-hover:text-lime">{m.name}</span>
                            <span className="block text-[11.5px] text-muted">#{m.id} · {m.branch}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <Pill tone={st.tone} dot>
                          {st.label}
                        </Pill>
                      </td>
                      <td className="px-3 py-3 font-semibold text-fg-2">{m.plan}</td>
                      <td className="px-3 py-3 font-semibold text-fg-2 tabular">{m.lastCheckIn}</td>
                      <td className="px-6 py-3 text-right font-bold text-fg tabular">{m.amount ? money(m.amount) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-auto hidden flex-wrap items-center gap-x-6 gap-y-2 border-t md:flex border-line bg-white/[0.015] px-5 py-3.5 text-[12px] font-semibold text-muted sm:px-6">
            <span>
              <span className="font-bold text-fg tabular">214</span> ingresos hoy
            </span>
            <span>
              <span className="font-bold text-fg tabular">9</span> pagos cobrados en la última hora
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-lime">
              <span className="size-1.5 rounded-full bg-lime" /> Sincronizado hace 1 min
            </span>
          </div>
        </article>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          {/* Cobranzas pendientes */}
          <article className="panel stagger p-5 sm:p-6" style={s(10)}>
            <SectionTitle
              title="Cobranzas pendientes"
              hint="12 vencen esta semana · $ 518.400"
              action={<Pill tone="rose">3 vencidas</Pill>}
            />
            <ul className="mt-4 space-y-2.5">
              {PENDING.map((m) => (
                <li key={m.id} className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-2.5">
                  <Avatar i={m.face} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-fg">{m.name}</p>
                    <p className={cn("text-[11.5px] font-semibold", m.status === "vencido" ? "text-rose" : "text-amber")}>
                      {m.status === "vencido" ? `Venció el ${m.due}` : `Vence el ${m.due}`}
                    </p>
                  </div>
                  <p className="text-[13px] font-bold text-fg tabular">{money(m.amount)}</p>
                  <button
                    className="grid size-8 place-items-center rounded-lg bg-emerald/12 text-emerald transition hover:bg-emerald/25"
                    aria-label="Recordar por WhatsApp"
                  >
                    <MessageCircle className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <Link
              href="/admin/caja"
              className="mt-3.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-lime hover:underline"
            >
              Ver las 12 cuotas en Caja <ArrowRight className="size-3.5" />
            </Link>
          </article>

          {/* Mix de planes + hora pico */}
          <article className="panel stagger p-5 sm:p-6" style={s(11)}>
            <SectionTitle title="Composición de planes" hint="Socios activos por tipo de plan" />
            <div className="mt-4 flex items-center gap-4 sm:gap-5">
              <Donut data={PLAN_MIX} size={120} thickness={15}>
                <div>
                  <p className="text-xl font-extrabold text-fg tabular">1.482</p>
                  <p className="text-[10.5px] font-semibold text-muted">socios</p>
                </div>
              </Donut>
              <ul className="min-w-0 flex-1 space-y-2">
                {PLAN_MIX.map((p) => (
                  <li key={p.name} className="flex items-center gap-2 text-[12.5px]">
                    <span className="size-2.5 rounded-[4px]" style={{ background: p.color }} />
                    <span className="min-w-0 flex-1 font-semibold leading-tight text-fg-2">{p.name}</span>
                    <span className="font-bold text-fg tabular">{p.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <div className="mb-2 flex items-center justify-between text-[12px] font-semibold">
                <span className="text-fg-2">Afluencia por hora</span>
                <span className="text-muted">06 – 23 h</span>
              </div>
              <div className="flex h-12 items-end gap-[3px]">
                {HOURLY.map((v, i) => (
                  <span
                    key={i}
                    title={`${6 + i}:00 · ${v}%`}
                    className={cn(
                      "flex-1 rounded-[3px] transition-all hover:opacity-100",
                      v > 80 ? "bg-lime" : v > 50 ? "bg-lime/55" : "bg-white/12",
                    )}
                    style={{ height: `${v}%` }}
                  />
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
