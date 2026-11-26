import {
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  Dumbbell,
  LayoutDashboard,
  ScanLine,
  Search,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { DualAreaChart } from "@/components/charts";
import { Avatar, Delta, Ring, Sparkline } from "@/components/ui/primitives";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

/** Últimos 7 días hasta hoy, miércoles 25/11. */
const LAST_7_DAYS = [
  { day: "Jue", act: 498, prev: 452 },
  { day: "Vie", act: 452, prev: 437 },
  { day: "Sáb", act: 286, prev: 305 },
  { day: "Dom", act: 171, prev: 148 },
  { day: "Lun", act: 524, prev: 471 },
  { day: "Mar", act: 487, prev: 446 },
  { day: "Hoy", act: 512, prev: 429 },
];

const LIVE_ACCESS = [
  { i: 4, name: "Sofía Martínez", plan: "Pase Libre", ago: "ahora", ok: true },
  { i: 6, name: "Tomás Herrera", plan: "Musculación", ago: "hace 2 min", ok: true },
  { i: 9, name: "Lucía Benítez", plan: "CrossTraining", ago: "hace 4 min", ok: false },
];

const NEXT_CLASSES = [
  { name: "Funcional", slot: "19:00", taken: 18, cap: 20, tone: "bg-lime" },
  { name: "Spinning", slot: "20:00", taken: 24, cap: 24, tone: "bg-violet" },
  { name: "CrossTraining", slot: "20:30", taken: 11, cap: 16, tone: "bg-cyan" },
];

/** Composición del producto real para el hero de la landing. */
export function ProductPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-lime/25 bg-ink-2/90 shadow-[0_0_0_1px_rgb(181_245_74/0.08),0_40px_120px_-30px_rgb(181_245_74/0.35)] backdrop-blur",
        className,
      )}
    >
      <div className="flex">
        {/* rail */}
        <div className="hidden w-[68px] shrink-0 flex-col items-center gap-2 border-r border-line py-5 sm:flex">
          <LogoMark className="mb-4 size-9" />
          {[LayoutDashboard, Users, ScanLine, CalendarDays, Dumbbell, Wallet, BarChart3].map((I, i) => (
            <span
              key={i}
              className={cn(
                "grid size-10 place-items-center rounded-xl",
                i === 0 ? "bg-lime/15 text-lime" : "text-faint",
              )}
            >
              <I className="size-[18px]" />
            </span>
          ))}
          <span className="mt-auto grid size-10 place-items-center rounded-xl text-faint">
            <Settings className="size-[18px]" />
          </span>
        </div>

        <div className="min-w-0 flex-1 p-4 sm:p-6">
          {/* top */}
          <div className="flex items-center gap-3">
            <LogoMark className="size-8 sm:hidden" />
            <div className="hidden gap-1 rounded-xl border border-line p-1 text-[12px] font-semibold md:flex">
              {["Dashboard", "Socios", "Clases", "Caja", "Reportes"].map((t, i) => (
                <span key={t} className={cn("rounded-lg px-3 py-1.5", i === 0 ? "bg-lime text-lime-ink" : "text-muted")}>
                  {t}
                </span>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden h-9 w-52 items-center gap-2 rounded-xl border border-line px-3 text-[12px] text-muted lg:flex">
                <Search className="size-3.5" /> Buscar socio…
              </span>
              <span className="relative grid size-9 place-items-center rounded-xl border border-line text-fg-2">
                <Bell className="size-4" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-lime" />
              </span>
              <Avatar i={12} size={34} />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-muted">
                <span className="sm:hidden">Mié 25 nov · Sede Centro</span>
                <span className="hidden sm:inline">Miércoles 25 de noviembre · Iron Factory, Sede Centro</span>
              </p>
              <p className="text-[22px] font-extrabold tracking-[-0.03em] text-fg sm:text-[26px]">Buen día, Carolina</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[11.5px] font-semibold text-muted">Ingresos de noviembre</p>
              <p className="flex items-center gap-2 text-xl font-extrabold text-fg tabular sm:justify-end">
                $ 46,7 M <Delta value={12.3} solid />
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="panel p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13.5px] font-bold text-fg">Asistencia al gimnasio</p>
                <span className="whitespace-nowrap rounded-lg border border-line px-2.5 py-1 text-[11px] font-semibold text-muted">
                  Últimos 7 días
                </span>
              </div>
              <DualAreaChart
                data={LAST_7_DAYS}
                xKey="day"
                a="act"
                b="prev"
                height={190}
                labels={["Últimos 7 días", "7 días previos"]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              <div className="panel flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                <Ring value={72} size={84} stroke={9}>
                  <p className="text-lg font-extrabold text-fg">72%</p>
                </Ring>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-muted">Objetivo mensual</p>
                  <p className="text-lg font-extrabold leading-tight text-fg tabular">1.482 socios</p>
                </div>
              </div>
              <div className="panel flex flex-col p-4">
                <p className="text-[12px] font-semibold text-muted">Renovaciones</p>
                <p className="flex flex-wrap items-baseline gap-x-2 text-2xl font-extrabold text-fg tabular">
                  105 <Delta value={6.4} />
                </p>
                <div className="mt-auto">
                  <Sparkline data={[12, 16, 14, 18, 15, 19, 22]} color="var(--color-violet)" height={30} />
                </div>
              </div>
            </div>
          </div>

          {/* fila inferior: operación en vivo */}
          <div className="mt-4 hidden gap-4 sm:grid md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_0.9fr]">
            <div className="panel p-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-fg">Accesos en vivo</p>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-lime">
                  <span className="size-1.5 animate-pulse rounded-full bg-lime" /> 86 adentro
                </span>
              </div>
              <ul className="mt-3 space-y-2.5">
                {LIVE_ACCESS.map((a) => (
                  <li key={a.name} className="flex items-center gap-3">
                    <Avatar i={a.i} size={28} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-bold text-fg">{a.name}</p>
                      <p className="truncate text-[11px] text-muted">
                        {a.plan} · {a.ago}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                        a.ok ? "bg-lime/12 text-lime" : "bg-amber/12 text-amber",
                      )}
                    >
                      {a.ok ? "Permitido" : "Vence hoy"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel p-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-fg">Próximas clases</p>
                <span className="text-[11px] font-semibold text-muted">Hoy</span>
              </div>
              <ul className="mt-3 space-y-3">
                {NEXT_CLASSES.map((c) => (
                  <li key={c.name}>
                    <div className="flex items-baseline justify-between gap-2 text-[12px]">
                      <p className="truncate font-bold text-fg">
                        <span className="tabular text-muted">{c.slot}</span> · {c.name}
                      </p>
                      <p className={cn("shrink-0 font-bold tabular", c.taken === c.cap ? "text-amber" : "text-fg-2")}>
                        {c.taken === c.cap ? "Completa" : `${c.taken}/${c.cap}`}
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className={cn("h-full rounded-full", c.tone)} style={{ width: `${(c.taken / c.cap) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel hidden p-4 lg:block">
              <p className="text-[13px] font-bold text-fg">Caja del día</p>
              <p className="mt-2 text-[22px] font-extrabold leading-none text-fg tabular">$ 1,28 M</p>
              <p className="mt-1 text-[11px] text-muted">38 cobros · 71% automáticos</p>
              <div className="mt-3 flex h-2 gap-1 overflow-hidden rounded-full">
                <span className="h-full w-[52%] bg-lime" />
                <span className="h-full w-[19%] bg-violet" />
                <span className="h-full w-[17%] bg-cyan" />
                <span className="h-full flex-1 bg-white/15" />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] font-semibold text-muted">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-lime" />
                  Débito
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-violet" />
                  Mercado Pago
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-cyan" />
                  Tarjeta
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Tarjeta flotante: confirmación de acceso QR. */
export function AccessToast({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-lime/30 bg-ink/90 p-3 pr-5 shadow-2xl backdrop-blur-xl",
        className,
      )}
    >
      <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-lime text-lime-ink">
        <span className="absolute inset-0 animate-pulse-ring rounded-xl bg-lime/50" />
        <Check className="relative size-6" strokeWidth={3} />
      </span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-lime">Acceso permitido</p>
        <p className="text-[14px] font-bold text-fg">Sofía Martínez</p>
        <p className="whitespace-nowrap text-[11.5px] text-muted">Pase Libre · 17 días restantes</p>
      </div>
    </div>
  );
}
