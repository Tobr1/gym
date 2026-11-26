import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CalendarDays,
  Check,
  Dumbbell,
  KanbanSquare,
  Play,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { AccessToast, ProductPreview } from "@/components/marketing/product-preview";
import { PillBars } from "@/components/pill-bars";
import { Logo } from "@/components/ui/logo";
import { Avatar, AvatarStack, ButtonLink, Pill } from "@/components/ui/primitives";
import { BRAND } from "@/config/brand";
import { PHOTO } from "@/lib/photos";
import { cn } from "@/lib/utils";

const NAV = ["Producto", "Módulos", "Precios", "Clientes", "Recursos"];

const GYMS = ["IRON FACTORY", "BOX 54", "NÚCLEO", "ATLAS CLUB", "KINETIC", "ORIGEN CROSS", "MOVE STUDIO", "FUERZA LIBRE"];

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white/[0.03] px-3.5 py-1.5 text-[12.5px] font-semibold text-fg-2 backdrop-blur">
      <span className="size-1.5 rounded-full bg-lime shadow-[0_0_10px_2px_rgb(181_245_74/0.7)]" />
      {children}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="relative overflow-x-clip">
      {/* ── NAV ───────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto mt-3 flex h-14 max-w-[1200px] items-center gap-6 rounded-2xl border border-line bg-ink/60 px-4 backdrop-blur-xl sm:mt-4 sm:px-5">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="mx-auto hidden items-center gap-1 lg:flex">
            {NAV.map((n, i) => (
              <a
                key={n}
                href={`#${n.toLowerCase()}`}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-[13.5px] font-semibold transition",
                  i === 0 ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {n}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link href="/login" className="hidden px-3 text-[13.5px] font-semibold text-fg-2 hover:text-fg sm:block">
              Ingresar
            </Link>
            <ButtonLink href="/login" variant="outline-lime" size="sm" className="h-9 px-4">
              Probar gratis
            </ButtonLink>
          </div>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section id="producto" className="relative pt-32 sm:pt-40">
        {/* haces de luz de estadio */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[900px] overflow-hidden">
          <div className="absolute left-1/2 top-[-200px] h-[900px] w-[1400px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgb(181_245_74/0.16),transparent_60%)]" />
          <div className="absolute left-[8%] top-[-120px] h-[820px] w-[180px] origin-top rotate-[-24deg] bg-gradient-to-b from-lime/20 via-lime/[0.04] to-transparent blur-2xl" />
          <div className="absolute right-[8%] top-[-120px] h-[820px] w-[180px] origin-top rotate-[24deg] bg-gradient-to-b from-lime/20 via-lime/[0.04] to-transparent blur-2xl" />
          <div className="absolute left-[30%] top-[-160px] h-[700px] w-[90px] origin-top rotate-[-10deg] bg-gradient-to-b from-white/10 to-transparent blur-2xl" />
          <div className="absolute right-[30%] top-[-160px] h-[700px] w-[90px] origin-top rotate-[10deg] bg-gradient-to-b from-white/10 to-transparent blur-2xl" />
          <div className="grid-lines absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-4 text-center sm:px-6">
          <div className="stagger">
            <Eyebrow>Nuevo · Accesos QR + App del socio</Eyebrow>
          </div>
          <h1
            className="stagger mx-auto mt-6 max-w-[900px] text-[44px] font-extrabold leading-[0.98] tracking-[-0.045em] text-fg sm:text-[68px] lg:text-[84px]"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            Tu gimnasio,
            <br />
            <span className="text-gradient-lime">entrenado para crecer.</span>
          </h1>
          <p
            className="stagger mx-auto mt-6 max-w-[620px] text-[16px] leading-relaxed text-fg-2 sm:text-[18px]"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            Socios, accesos, rutinas, clases, caja y ventas en una sola plataforma. Diseñada para dueños que
            quieren menos planillas y más rendimiento.
          </p>
          <div
            className="stagger mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <ButtonLink href="/login" size="lg" className="w-full sm:w-auto">
              Empezar prueba gratis <ArrowRight className="size-4" strokeWidth={2.6} />
            </ButtonLink>
            <ButtonLink href="/admin" variant="secondary" size="lg" className="w-full sm:w-auto">
              <Play className="size-4 fill-current" /> Ver demo en vivo
            </ButtonLink>
          </div>
          <div
            className="stagger mt-7 flex items-center justify-center gap-3 text-[13px] text-muted"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <AvatarStack ids={[0, 1, 3, 4]} size={28} />
            <span>
              <span className="font-bold text-fg">+320 gimnasios</span> ya entrenan con {BRAND.name}
            </span>
          </div>
        </div>

        {/* producto */}
        <div className="relative mx-auto mt-16 max-w-[1240px] px-4 sm:mt-20 sm:px-6">
          <div className="absolute inset-x-[10%] -top-10 h-40 rounded-full bg-lime/20 blur-[90px]" />
          <div className="stagger relative" style={{ "--i": 5 } as React.CSSProperties}>
            <ProductPreview />
            <div className="absolute -right-8 top-[205px] hidden w-[220px] animate-[float_7s_ease-in-out_infinite] rounded-2xl border border-line-strong bg-ink/90 p-4 shadow-2xl backdrop-blur-xl xl:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Cobranza automática</p>
              <p className="mt-1 text-[22px] font-extrabold text-fg tabular">$ 518.400</p>
              <p className="text-[12px] text-muted">recuperados esta semana</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[78%] rounded-full bg-lime" />
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t sm:h-28 from-ink via-ink/70 to-transparent" />
          {/* Fuera del frame y sobre el degradé: flota en el borde inferior sin tapar los nombres de "Accesos en vivo". */}
          <AccessToast className="absolute -bottom-10 -left-4 z-10 hidden animate-float xl:flex" />
        </div>
      </section>

      {/* ── LOGOS ─────────────────────────────────────────── */}
      <section className="relative border-y border-line py-8">
        <p className="mb-6 text-balance px-6 text-center text-[11.5px] font-bold uppercase tracking-[0.16em] text-faint sm:text-[12px] sm:tracking-[0.2em]">
          Gimnasios, boxes y estudios que confían en nosotros
        </p>
        <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
          <div className="flex shrink-0 animate-marquee gap-14 pr-14">
            {[...GYMS, ...GYMS].map((g, i) => (
              <span key={i} className="whitespace-nowrap text-[22px] font-extrabold tracking-[-0.02em] text-white/25 italic">
                {g}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── MÓDULOS (bento) ───────────────────────────────── */}
      <section id="módulos" className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-[720px] text-center">
          <Eyebrow>Todo tu gimnasio, un solo sistema</Eyebrow>
          <h2 className="mt-5 text-[36px] font-extrabold leading-[1.02] tracking-[-0.04em] text-fg sm:text-[52px]">
            Cada módulo pensado
            <br className="hidden sm:block" /> para el <span className="text-lime">piso del gimnasio</span>.
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-6">
          {/* Acceso QR */}
          <article className="group panel relative overflow-hidden md:col-span-4 md:row-span-2 min-h-[440px]">
            <Img src={PHOTO.backWoman(1400)} alt="Socia entrenando" className="absolute inset-0 opacity-60 transition duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/80 to-transparent" />
            <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <span className="grid size-10 place-items-center rounded-xl bg-lime text-lime-ink">
                  <QrCode className="size-5" />
                </span>
                <Pill tone="lime" dot>
                  En vivo
                </Pill>
              </div>
              <div className="grid items-end gap-6 sm:grid-cols-[1fr_auto]">
                <div>
                  <h3 className="text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-fg sm:text-[34px]">
                    Control de acceso QR
                  </h3>
                  <p className="mt-2 max-w-[420px] text-[15px] leading-relaxed text-fg-2">
                    El socio escanea, el molinete abre. Cuotas vencidas, aptos médicos y horarios se validan en
                    menos de un segundo.
                  </p>
                  <AccessToast className="mt-5 w-fit" />
                </div>
                <div className="hidden rounded-2xl bg-white p-3 shadow-[0_0_60px_-10px_rgb(181_245_74/0.6)] sm:block">
                  <QRCodeSVG value="https://pulso.app/acceso/iron-factory" size={120} fgColor="#0B1018" />
                </div>
              </div>
            </div>
          </article>

          {/* App del socio */}
          <article className="group panel relative overflow-hidden p-6 md:col-span-2">
            <span className="grid size-10 place-items-center rounded-xl bg-violet/15 text-violet">
              <Smartphone className="size-5" />
            </span>
            <h3 className="mt-4 text-[20px] font-extrabold tracking-[-0.02em] text-fg">App del socio</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
              Reservas, rutinas, pagos y progreso en una app que tus socios van a querer abrir.
            </p>
            <div className="mt-5 rounded-2xl border border-line bg-ink-2 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold text-fg">Calorías · 7 días</p>
                <p className="text-[12px] font-extrabold text-lime tabular">Hoy 612 kcal</p>
              </div>
              <PillBars
                className="mt-3"
                height={74}
                highlight={6}
                data={[48, 62, 40, 30, 55, 52, 70].map((v, i) => ({ label: ["J", "V", "S", "D", "L", "M", "Hoy"][i], value: v }))}
              />
            </div>
          </article>

          {/* Rutinas */}
          <article className="group panel relative flex flex-col overflow-hidden md:col-span-2">
            <div className="relative min-h-36 flex-1 overflow-hidden">
              <Img src={PHOTO.deadlift(800, 500)} alt="Peso muerto" className="absolute inset-0 transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
              <div className="absolute left-4 top-4 flex gap-1.5">
                <span className="rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-bold text-fg backdrop-blur">4 × 6 reps</span>
                <span className="rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-bold text-fg backdrop-blur">RPE 8</span>
              </div>
            </div>
            <div className="p-6 pt-3">
              <h3 className="flex items-center gap-2 text-[20px] font-extrabold tracking-[-0.02em] text-fg">
                <Dumbbell className="size-5 text-lime" /> Constructor de rutinas
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                Arrastrá ejercicios, ajustá series y cargas, asigná en un click.
              </p>
            </div>
          </article>

          {/* Fila inferior */}
          {[
            {
              icon: CalendarDays,
              title: "Clases y reservas",
              text: "Calendario con cupos, listas de espera y asistencia.",
              tone: "text-cyan bg-cyan/12",
              demo: (
                <div className="rounded-xl border border-line bg-ink-2 p-3">
                  <div className="flex items-center justify-between gap-2 text-[12px]">
                    <p className="truncate font-bold text-fg">
                      <span className="text-muted tabular">19:00</span> · Funcional
                    </p>
                    <p className="shrink-0 font-bold text-fg-2 tabular">18/20</p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-[90%] rounded-full bg-cyan" />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <AvatarStack ids={[2, 5, 7, 8]} size={22} />
                    <span className="text-[11px] font-semibold text-muted">3 en espera</span>
                  </div>
                </div>
              ),
            },
            {
              icon: Wallet,
              title: "Caja y cobranzas",
              text: "Débito automático, Mercado Pago y recordatorios por WhatsApp.",
              tone: "text-amber bg-amber/12",
              demo: (
                <div className="flex items-center gap-3 rounded-xl border border-line bg-ink-2 p-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald/15 text-emerald">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-bold text-fg">Cuota de diciembre</p>
                    <p className="truncate text-[11px] text-muted">Mercado Pago · hoy</p>
                  </div>
                  <p className="shrink-0 text-[13px] font-extrabold text-fg tabular">$ 32.000</p>
                </div>
              ),
            },
            {
              icon: KanbanSquare,
              title: "CRM de ventas",
              text: "Del primer mensaje de Instagram a socio activo, sin perder un lead.",
              tone: "text-rose bg-rose/12",
              demo: (
                <ul className="space-y-2 rounded-xl border border-line bg-ink-2 p-3">
                  {(
                    [
                      ["Leads nuevos", 24, "bg-rose"],
                      ["Contactados", 13, "bg-amber"],
                      ["Clase de prueba", 8, "bg-violet"],
                      ["Nuevos socios", 5, "bg-lime"],
                    ] as const
                  ).map(([l, n, c]) => (
                    <li key={l} className="grid grid-cols-[96px_1fr_20px] items-center gap-2.5">
                      <span className="truncate text-[11px] font-semibold text-muted">{l}</span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <span className={cn("block h-full rounded-full", c)} style={{ width: `${(n / 24) * 100}%` }} />
                      </span>
                      <span className="text-right text-[12px] font-extrabold text-fg tabular">{n}</span>
                    </li>
                  ))}
                </ul>
              ),
            },
          ].map((f) => (
            <article
              key={f.title}
              className="panel group relative flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong md:col-span-2"
            >
              <div className="flex items-start justify-between">
                <span className={cn("grid size-10 place-items-center rounded-xl", f.tone)}>
                  <f.icon className="size-5" />
                </span>
                <ArrowUpRight className="size-5 text-faint transition group-hover:text-lime" />
              </div>
              <h3 className="mt-4 text-[18px] font-extrabold tracking-[-0.02em] text-fg">{f.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{f.text}</p>
              <div className="mt-auto pt-5">{f.demo}</div>
            </article>
          ))}
        </div>
      </section>

      {/* ── IMPACTO (foto cinematográfica) ────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:py-12">
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-line">
              <Img src={PHOTO.heroCurl(1000, 1250)} alt="Atleta entrenando" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-line-strong bg-ink/70 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-muted">Retención · 12 meses</p>
                  <span className="text-[12px] font-extrabold text-lime">+18 pts</span>
                </div>
                <div className="mt-3 flex h-20 items-end gap-1.5">
                  {[76, 77, 76, 79, 80, 80, 83, 85, 84, 88, 91, 94].map((v, i) => (
                    <span
                      key={i}
                      className={cn(
                        "flex-1 rounded-t-md",
                        i === 11 ? "bg-lime shadow-[0_0_18px_-2px_rgb(181_245_74/0.7)]" : "bg-lime",
                      )}
                      style={{ height: `${((v - 70) / 24) * 100}%`, opacity: i === 11 ? 1 : 0.18 + (i / 11) * 0.37 }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10.5px] font-semibold text-muted tabular">
                  <span>Dic 2025</span>
                  <span>Nov 2026 · 94%</span>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-10 hidden rounded-2xl border border-line-strong bg-ink/85 p-4 shadow-2xl backdrop-blur-xl sm:block">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-emerald/15 text-emerald">
                  <BellRing className="size-5" />
                </span>
                <div>
                  <p className="text-[13px] font-bold text-fg">Recordatorio enviado</p>
                  <p className="text-[11.5px] text-muted">WhatsApp · Valentina R.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <Eyebrow>Resultados medibles</Eyebrow>
            <h2 className="mt-5 text-[36px] font-extrabold leading-[1.02] tracking-[-0.04em] text-fg sm:text-[48px]">
              Menos morosidad.
              <br />
              <span className="text-muted">Más socios que vuelven.</span>
            </h2>
            <p className="mt-5 max-w-[480px] text-[16px] leading-relaxed text-fg-2">
              Automatizá los recordatorios, detectá socios en riesgo de abandono y tomá decisiones con
              datos en tiempo real, desde la recepción o desde el celular.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                ["-38%", "morosidad en 90 días"],
                ["2,1×", "más renovaciones"],
                ["6 h", "ahorradas por semana"],
                ["94%", "retención promedio"],
              ].map(([v, l]) => (
                <div key={l} className="border-l-2 border-lime/60 pl-4">
                  <p className="text-[36px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular sm:text-[44px]">{v}</p>
                  <p className="mt-1.5 text-[13.5px] font-semibold text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRECIOS ───────────────────────────────────────── */}
      <section id="precios" className="relative mx-auto max-w-[1200px] px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-[640px] text-center">
          <Eyebrow>Precios simples</Eyebrow>
          <h2 className="mt-5 text-[36px] font-extrabold leading-[1.02] tracking-[-0.04em] text-fg sm:text-[52px]">
            Un plan para cada etapa.
          </h2>
          <p className="mt-4 text-[16px] text-fg-2">14 días gratis. Sin tarjeta. Migramos tus socios sin costo.</p>
        </div>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "39.900",
              desc: "Para estudios y boxes que arrancan.",
              feats: ["Hasta 200 socios", "Acceso QR", "Clases y reservas", "App del socio"],
            },
            {
              name: "Pro",
              price: "79.900",
              desc: "Para gimnasios en crecimiento.",
              feats: ["Socios ilimitados", "Caja y cobranzas automáticas", "Constructor de rutinas", "CRM con Kanban", "Reportes avanzados"],
              hot: true,
            },
            {
              name: "Cadena",
              price: "A medida",
              desc: "Para redes con varias sedes.",
              feats: ["Multisede consolidado", "Roles y permisos avanzados", "API e integraciones", "Gerente de cuenta"],
            },
          ].map((p) => (
            <article
              key={p.name}
              className={cn(
                "panel relative flex flex-col p-7 transition-all duration-300 hover:-translate-y-1",
                p.hot && "max-lg:order-first glow-lime bg-[linear-gradient(180deg,rgb(181_245_74/0.08),transparent_40%),var(--color-surface)]",
              )}
            >
              {p.hot && (
                <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-[11px] font-extrabold text-lime-ink">
                  <Sparkles className="size-3" /> Más elegido
                </span>
              )}
              <p className="text-[15px] font-bold text-fg">{p.name}</p>
              <p className="mt-1 text-[13.5px] text-muted">{p.desc}</p>
              <p className="mt-6 flex items-baseline gap-1.5">
                {p.price !== "A medida" && <span className="text-[18px] font-bold text-muted">$</span>}
                <span className="text-[44px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">{p.price}</span>
                {p.price !== "A medida" && <span className="text-[13px] font-semibold text-muted">/ mes</span>}
              </p>
              <ul className="mt-7 flex-1 space-y-3">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[14px] font-medium text-fg-2">
                    <span className={cn("grid size-5 place-items-center rounded-full", p.hot ? "bg-lime text-lime-ink" : "bg-white/8 text-lime")}>
                      <Check className="size-3" strokeWidth={3.2} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/login" variant={p.hot ? "primary" : "secondary"} size="lg" className="mt-8 w-full">
                {p.price === "A medida" ? "Hablar con ventas" : "Empezar gratis"}
              </ButtonLink>
            </article>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIO ───────────────────────────────────── */}
      <section id="clientes" className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="panel grid overflow-hidden md:grid-cols-[1fr_1.3fr]">
          <div className="relative min-h-[280px]">
            <Img src={PHOTO.focusWoman(900, 900)} alt="Atleta concentrada" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface max-md:bg-gradient-to-t" />
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-12">
            <div className="flex gap-1 text-lime">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-5 text-[22px] font-bold leading-snug tracking-[-0.02em] text-fg sm:text-[28px]">
              “Pasamos de perseguir cuotas por WhatsApp a tener el 96% cobrado el día 5. Y los socios aman la app.”
            </blockquote>
            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-4">
              <Avatar i={6} size={44} className="ring-2 ring-lime/40" />
              <div>
                <p className="text-[15px] font-bold text-fg">Martín Echeverría</p>
                <p className="text-[13px] text-muted">Fundador · Iron Factory (3 sedes)</p>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-[12.5px] font-semibold text-muted sm:ml-auto">
                <ShieldCheck className="size-4 text-lime" /> Cliente verificado
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────── */}
      <section className="relative mx-auto mt-24 max-w-[1200px] px-4 sm:mt-32 sm:px-6">
        <div className="noise relative overflow-hidden rounded-[32px] border border-lime/25">
          <Img src={PHOTO.runners(1600, 700)} alt="Corredores al amanecer" className="photo-grade absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
          <div className="relative max-w-[620px] p-8 sm:p-14">
            <h2 className="text-[34px] font-extrabold leading-[1.02] tracking-[-0.04em] text-fg sm:text-[52px]">
              Tu próximo récord empieza <span className="text-lime">hoy</span>.
            </h2>
            <p className="mt-4 text-[16px] text-fg-2">Configurá tu gimnasio en 15 minutos. Te acompañamos en cada paso.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/login" size="lg">
                Crear cuenta gratis <ArrowRight className="size-4" strokeWidth={2.6} />
              </ButtonLink>
              <ButtonLink href="/app" variant="secondary" size="lg">
                Ver app del socio
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer id="recursos" className="mx-auto mt-24 max-w-[1200px] border-t border-line px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-[320px]">
            <Logo />
            <p className="mt-4 text-[13.5px] leading-relaxed text-muted">{BRAND.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {[
              ["Producto", ["Acceso QR", "App del socio", "Rutinas", "Clases"]],
              ["Empresa", ["Clientes", "Precios", "Contacto", "Trabajá con nosotros"]],
              ["Accesos", ["Panel del gimnasio", "Portal del socio", "Super Admin"]],
            ].map(([t, items]) => (
              <div key={t as string}>
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-faint">{t as string}</p>
                <ul className="mt-4 space-y-2.5">
                  {(items as string[]).map((it) => (
                    <li key={it}>
                      <Link
                        href={it === "Portal del socio" ? "/app" : it === "Super Admin" ? "/superadmin" : it === "Panel del gimnasio" ? "/admin" : "#"}
                        className="text-[13.5px] font-medium text-fg-2 transition hover:text-lime"
                      >
                        {it}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-12 text-[12.5px] text-faint">© 2026 {BRAND.name}. Hecho para el deporte.</p>
      </footer>
    </div>
  );
}
