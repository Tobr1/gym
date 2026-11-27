import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Info, Lightbulb, MoreHorizontal, Rocket, ShieldAlert, Zap } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { RegionMap } from "@/components/superadmin/region-map";
import { Delta, Pill } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { TENANTS } from "./_data";

export const metadata: Metadata = { title: "Super Admin" };

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

const KPIS: { label: string; short?: string; value: number; d: number; hint: string; prefix?: string; suffix?: string; decimals?: number; good?: boolean }[] = [
  { label: "MRR", value: 25_640_000, prefix: "$ ", d: 4.7, hint: "vs. octubre" },
  { label: "Gimnasios activos", value: 326, d: 3.2, hint: "+11 este mes" },
  { label: "Socios gestionados", short: "Socios totales", value: 148_920, d: 6.1, hint: "en 512 sedes" },
  { label: "Churn mensual", value: 1.3, decimals: 1, suffix: "%", d: -0.4, hint: "objetivo < 2%", good: true },
];

const TENANTS_BY_MRR = [...TENANTS].sort((a, b) => b.mrr - a.mrr);
const TOP_MRR = TENANTS.reduce((acc, t) => acc + t.mrr, 0);

function TenantBadge({ name }: { name: string }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-[11px] font-extrabold text-fg-2">
      {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
    </span>
  );
}

// Altas de gimnasios por trimestre (T3·26 = último cerrado; ~11 por mes, coherente con el KPI).
const QUARTERS = [
  { q: "T1·25", n: 14 },
  { q: "T2·25", n: 17 },
  { q: "T3·25", n: 14 },
  { q: "T4·25", n: 21 },
  { q: "T1·26", n: 24 },
  { q: "T2·26", n: 29 },
  { q: "T3·26", n: 35 },
].map((q) => ({ ...q, v: Math.round((q.n / 35) * 96) }));

const EVENTS = [
  { icon: Rocket, tone: "text-lime bg-lime/12", text: "Atlas Club activó 3 sedes nuevas", time: "hace 4 min" },
  { icon: AlertTriangle, tone: "text-amber bg-amber/12", text: "Latencia elevada en lectores QR · región AR-NOA", time: "hace 18 min" },
  { icon: ShieldAlert, tone: "text-rose bg-rose/12", text: "Move Studio: 2.º intento de cobro fallido", time: "hace 1 h" },
  { icon: Info, tone: "text-cyan bg-cyan/12", text: "Deploy v4.12.0 completado sin errores", time: "hace 2 h" },
];

export default function SuperAdminPage() {
  return (
    <div className="space-y-4">
      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {KPIS.map((k, i) => (
          <article key={k.label} className="panel-flat stagger flex flex-col p-4 sm:p-5" style={s(i)}>
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[12.5px] font-bold text-fg sm:text-[13.5px]">
                {k.short ? (
                  <>
                    <span className="sm:hidden">{k.short}</span>
                    <span className="hidden sm:inline">{k.label}</span>
                  </>
                ) : (
                  k.label
                )}
              </p>
              <Info className="size-4 shrink-0 text-faint" />
            </div>
            <p className="mt-3 whitespace-nowrap text-[20px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular sm:mt-4 sm:text-[30px] xl:text-[27px] min-[1400px]:text-[32px] 2xl:text-[34px]">
              <CountUp value={k.value} prefix={k.prefix} suffix={k.suffix} decimals={k.decimals} />
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {/* en churn bajar es bueno: flecha hacia abajo, pero en lima */}
              <Delta value={k.good ? Math.abs(k.d) : k.d} className={k.good ? "[&>svg]:rotate-90" : ""} />
              <span className="text-[11px] font-medium text-muted">{k.hint}</span>
            </div>
          </article>
        ))}
      </section>

      {/* fila media */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-[0.9fr_1.3fr_1.1fr]">
        {/* salud */}
        <article className="stagger relative overflow-hidden rounded-[18px] border border-line bg-gradient-to-b from-[#2a3646] to-surface p-5" style={s(4)}>
          <p className="text-[15px] font-bold text-fg">Salud de la plataforma</p>
          <div className="relative mx-auto mt-3 w-full max-w-[240px]">
            <svg viewBox="0 0 200 112" className="w-full overflow-visible">
              <defs>
                <linearGradient id="gauge" x1="0" x2="1">
                  <stop offset="0" stopColor="#B5F54A" stopOpacity=".7" />
                  <stop offset="1" stopColor="#B5F54A" />
                </linearGradient>
              </defs>
              <path d="M16 100 A84 84 0 0 1 184 100" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="18" strokeLinecap="round" />
              <path
                d="M16 100 A84 84 0 0 1 184 100"
                fill="none"
                stroke="url(#gauge)"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray="264"
                strokeDashoffset={264 * (1 - 0.86)}
                style={{ filter: "drop-shadow(0 0 10px rgb(181 245 74 / .45))" }}
              />
            </svg>
            <div className="absolute inset-x-0 bottom-0 text-center">
              <p className="text-[34px] font-extrabold leading-none tracking-[-0.04em] text-fg">86</p>
              <p className="text-[12px] font-semibold text-muted">índice de salud</p>
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-4 text-[11.5px] font-semibold text-fg-2">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-lime" /> Adopción</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-white/30" /> Riesgo</span>
          </div>
          <div className="mt-4 rounded-xl border border-line bg-ink/40 p-3">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-fg">
              <Lightbulb className="size-3.5 text-lime" /> Sugerencia IA
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              14 gimnasios no usan la app del socio. Activarla reduce el churn un 22% en promedio.
            </p>
          </div>
          <Link href="/superadmin/gimnasios?segmento=riesgo" className="mt-3 grid h-10 w-full place-items-center rounded-xl bg-lime text-[13px] font-bold text-lime-ink">Ver cuentas en riesgo</Link>
        </article>

        {/* crecimiento MRR */}
        <article className="panel-flat stagger flex flex-col p-5" style={s(5)}>
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-bold text-fg">Crecimiento de ingresos</p>
            <button className="text-[12.5px] font-semibold text-muted hover:text-fg">Ver detalle</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] font-semibold text-fg-2">
            {/* ARR = MRR × 12 */}
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-lime" /> $ 307,7 M ARR</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald" /> $ 41 M expansión</span>
          </div>
          <div className="mt-4 grid min-h-[220px] flex-1 grid-cols-[auto_1fr] gap-5">
            <div className="flex flex-col justify-around gap-4">
              {[
                ["$ 1,9 M", "MRR nuevo en nov."],
                ["38", "upgrades de plan"],
                ["112%", "retención neta"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="whitespace-nowrap text-[24px] font-extrabold leading-none tracking-[-0.03em] text-fg tabular">{v}</p>
                  <p className="mt-1 text-[11.5px] font-semibold text-muted">{l}</p>
                </div>
              ))}
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="relative flex-1">
                <svg viewBox="0 0 200 150" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
                  <defs>
                    <linearGradient id="mrr-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#B5F54A" stopOpacity=".28" />
                      <stop offset="1" stopColor="#B5F54A" stopOpacity="0" />
                    </linearGradient>
                    <clipPath id="mrr-past"><rect x="0" y="0" width="134" height="150" /></clipPath>
                    <clipPath id="mrr-proj"><rect x="134" y="0" width="66" height="150" /></clipPath>
                  </defs>
                  {[30, 60, 90, 120].map((y) => (
                    <line key={y} x1="0" x2="200" y1={y} y2={y} stroke="rgb(255 255 255 / .05)" />
                  ))}
                  <rect x="134" y="0" width="66" height="150" fill="rgb(255 255 255 / .02)" />
                  <path d="M0 140 C60 138 100 130 130 104 S175 40 200 6 L200 150 L0 150Z" fill="url(#mrr-fill)" clipPath="url(#mrr-past)" />
                  <path d="M0 140 C60 138 100 130 130 104 S175 40 200 6 L200 150 L0 150Z" fill="url(#mrr-fill)" opacity=".35" clipPath="url(#mrr-proj)" />
                  <path d="M0 140 C60 138 100 130 130 104 S175 40 200 6" fill="none" stroke="#B5F54A" strokeWidth="2.4" vectorEffect="non-scaling-stroke" clipPath="url(#mrr-past)" />
                  <path d="M0 140 C60 138 100 130 130 104 S175 40 200 6" fill="none" stroke="#B5F54A" strokeOpacity=".7" strokeWidth="2" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" clipPath="url(#mrr-proj)" />
                  <path d="M0 146 C70 145 110 140 140 124 S180 84 200 58" fill="none" stroke="#3DDC97" strokeWidth="1.6" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  <line x1="134" x2="134" y1="0" y2="150" stroke="rgb(255 255 255 / .25)" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                </svg>
                {/* marcador en HTML: el SVG se estira (preserveAspectRatio none) y deformaría el círculo */}
                <span
                  className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-lime bg-ink shadow-[0_0_14px_2px_rgb(181_245_74/0.55)]"
                  style={{ left: "67%", top: `${(99 / 150) * 100}%` }}
                />
                <span className="absolute right-1 top-0 text-[10px] font-bold uppercase tracking-[0.12em] text-faint">Proyección</span>
              </div>
              {/* eje: Jul (0) → Ene (1); noviembre cae en 4/6 = 67%, igual que el marcador */}
              <div className="relative mt-2 h-3.5 text-[10px] font-semibold text-muted">
                {["Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene"].map((m, i) => (
                  <span
                    key={m}
                    className={cn(
                      "absolute top-0 leading-none",
                      i === 0 ? "" : i === 6 ? "-translate-x-full" : "-translate-x-1/2",
                      m === "Nov" && "font-extrabold text-lime",
                      // con el gráfico angosto (tablet / xl chico) sólo meses alternos
                      i % 2 === 1 && m !== "Nov" && "hidden min-[1400px]:inline",
                    )}
                    style={{ left: `${(i / 6) * 100}%` }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* altas por trimestre */}
        <article className="panel-flat stagger flex flex-col p-5 md:col-span-2 xl:col-span-1" style={s(6)}>
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-bold text-fg">Altas de gimnasios</p>
            <button className="text-[12.5px] font-semibold text-muted hover:text-fg">Ver todo</button>
          </div>
          <div className="mt-4 grid flex-1 grid-cols-[auto_1fr] items-end gap-4">
            <div className="pb-1">
              <span className="grid size-7 place-items-center rounded-lg bg-lime/15 text-lime">
                <ArrowUpRight className="size-4" />
              </span>
              <p className="mt-3 text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg">+150%</p>
              <p className="mt-1 text-[11.5px] font-semibold text-muted">T3 interanual</p>
            </div>
            <div className="flex h-full min-h-[200px] items-end gap-1.5">
              {QUARTERS.map((q, i) => (
                <div key={q.q} className="flex h-full flex-1 flex-col justify-end gap-1.5">
                  <div className="relative flex-1 overflow-hidden rounded-[8px] bg-white/[0.05]">
                    <div
                      className={cn(
                        "absolute inset-x-0 bottom-0 rounded-[8px]",
                        i === QUARTERS.length - 1
                          ? "bg-lime shadow-[0_0_24px_-4px_rgb(181_245_74/0.7)]"
                          : "bg-white/[0.14]",
                      )}
                      style={{ height: `${q.v}%`, animation: `fade-up .8s cubic-bezier(.22,1,.36,1) ${i * 70}ms both` }}
                    />
                    {i === QUARTERS.length - 1 && (
                      <span className="absolute inset-x-0 top-3 rotate-180 text-center text-[11px] font-extrabold text-lime-ink [writing-mode:vertical-rl]">
                        {q.n} altas
                      </span>
                    )}
                  </div>
                  <p className="text-center text-[9.5px] font-semibold text-muted">{q.q}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div><p className="text-[18px] font-extrabold text-fg">31%</p><p className="text-[11.5px] font-semibold text-muted">trial → pago</p></div>
            <div><p className="text-[18px] font-extrabold text-fg">4,2 días</p><p className="text-[11.5px] font-semibold text-muted">onboarding medio</p></div>
          </div>
        </article>
      </section>

      {/* fila inferior */}
      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <article className="panel-flat stagger flex flex-col overflow-hidden" style={s(7)}>
          <div className="flex items-center justify-between p-5 pb-3">
            <p className="text-[15px] font-bold text-fg">Gimnasios por facturación</p>
            <button className="text-[12.5px] font-semibold text-muted hover:text-fg">Ver todos</button>
          </div>

          {/* mobile: lista compacta, sin scroll horizontal que esconda MRR y estado */}
          <ul className="divide-y divide-line/70 border-t border-line/70 md:hidden">
            {TENANTS_BY_MRR.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                <TenantBadge name={t.name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold text-fg">{t.name}</span>
                  <span className="block truncate text-[11.5px] font-semibold text-muted">
                    {t.plan} · {t.socios.toLocaleString("es-AR")} socios
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[13px] font-bold text-fg tabular">{t.mrr ? `$ ${t.mrr.toLocaleString("es-AR")}` : "—"}</span>
                  <Pill tone={t.tone}>{t.status}</Pill>
                </span>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[560px] whitespace-nowrap text-left text-[13px]">
              <thead>
                <tr className="text-[11.5px] font-semibold text-muted">
                  <th className="px-5 py-2.5 font-semibold">Gimnasio</th>
                  <th className="px-3 py-2.5 font-semibold">Plan</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Socios</th>
                  <th className="px-3 py-2.5 text-right font-semibold">MRR</th>
                  <th className="px-5 py-2.5 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {TENANTS_BY_MRR.map((t) => (
                  <tr key={t.id} className="border-t border-line/70 transition hover:bg-white/[0.025]">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2.5">
                        <TenantBadge name={t.name} />
                        <span>
                          <span className="block font-bold text-fg">{t.name}</span>
                          <span className="block text-[11.5px] font-semibold text-muted tabular">
                            {t.id} · {t.sedes} {t.sedes === 1 ? "sede" : "sedes"}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3 font-semibold text-fg-2">{t.plan}</td>
                    <td className="px-3 py-3 text-right font-semibold text-fg-2 tabular">{t.socios.toLocaleString("es-AR")}</td>
                    <td className="px-3 py-3 text-right font-bold text-fg tabular">
                      {t.mrr ? `$ ${t.mrr.toLocaleString("es-AR")}` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={t.tone}>{t.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-line bg-white/[0.015] px-5 py-3.5 text-[12px] font-semibold text-muted">
            <span>
              Mostrando <span className="text-fg">8</span> de <span className="text-fg tabular">326</span> gimnasios
            </span>
            <span>
              Suman <span className="font-bold text-lime tabular">$ {TOP_MRR.toLocaleString("es-AR")}</span> de MRR ·{" "}
              <span className="text-fg tabular">{((TOP_MRR / 25_640_000) * 100).toLocaleString("es-AR", { maximumFractionDigits: 1 })}%</span> del total
            </span>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <article className="panel-flat stagger relative overflow-hidden p-5" style={s(8)}>
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-bold text-fg">Presencia regional</p>
              <button className="text-muted" aria-label="Opciones">
                <MoreHorizontal className="size-5" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-semibold text-fg-2">
              {[
                ["AR", "64%"],
                ["UY", "14%"],
                ["CL", "12%"],
                ["PY", "6%"],
                ["Otros", "4%"],
              ].map(([c, v]) => (
                <span key={c}>
                  <span className="text-muted">{c}</span> {v}
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-4">
              <RegionMap className="h-[200px] w-auto shrink-0 xl:h-[250px]" />
              <ul className="min-w-0 flex-1 space-y-2.5">
                {[
                  ["Buenos Aires", 118],
                  ["Montevideo", 41],
                  ["Santiago", 38],
                  ["Córdoba", 36],
                  ["Rosario", 22],
                ].map(([c, n]) => (
                  <li key={c as string}>
                    <div className="flex justify-between gap-3 whitespace-nowrap text-[12px] font-semibold">
                      <span className="truncate text-fg-2">{c}</span>
                      <span className="text-fg tabular">{n}</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-lime" style={{ width: `${((n as number) / 118) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="panel-flat stagger p-5" style={s(9)}>
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[15px] font-bold text-fg">
                <Zap className="size-4 text-lime" /> Eventos en vivo
              </p>
              <span className="text-[11.5px] font-semibold text-muted">Últimas 24 h</span>
            </div>
            <ul className="mt-3 space-y-1">
              {EVENTS.map((e) => (
                <li key={e.text} className="flex items-center gap-3 rounded-xl px-1 py-2 transition hover:bg-white/[0.03]">
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", e.tone)}>
                    <e.icon className="size-4" />
                  </span>
                  <p className="min-w-0 flex-1 text-[12.5px] font-semibold leading-snug text-fg-2">{e.text}</p>
                  <span className="shrink-0 text-[11px] text-muted">{e.time}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}
