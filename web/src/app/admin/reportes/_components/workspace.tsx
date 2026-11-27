"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  FileSpreadsheet,
  FileText,
  Loader2,
  Magnet,
  Repeat2,
  X,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { Button, Delta } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import {
  CLASS_OCCUPANCY,
  PERIODS,
  SCHEDULED,
  type CompareKey,
  type PeriodKey,
  type ReportKey,
} from "../_data";
import {
  AsistenciaReport,
  ClasesReport,
  IngresosReport,
  RetencionReport,
  SedesReport,
  VentasReport,
} from "./reports";
import { ScheduleDialog } from "./schedule-dialog";

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

const LIBRARY: {
  key: ReportKey;
  label: string;
  icon: LucideIcon;
  metric: string;
  caption: string;
  delta: number;
  color: string;
  file: string;
}[] = [
  {
    key: "ingresos",
    label: "Ingresos",
    icon: CircleDollarSign,
    metric: "$ 46,7 M",
    caption: "al día 25",
    delta: 12.3,
    color: "var(--color-lime)",
    file: "ingresos",
  },
  {
    key: "retencion",
    label: "Retención y bajas",
    icon: Repeat2,
    metric: "94,1%",
    caption: "retención",
    delta: 0.7,
    color: "var(--color-violet)",
    file: "retencion",
  },
  {
    key: "asistencia",
    label: "Asistencia",
    icon: Activity,
    metric: "2.678",
    caption: "check-ins / sem",
    delta: 7.4,
    color: "var(--color-cyan)",
    file: "asistencia",
  },
  {
    key: "clases",
    label: "Clases",
    icon: CalendarDays,
    metric: `${CLASS_OCCUPANCY}%`,
    caption: "ocupación",
    delta: 3.1,
    color: "var(--color-amber)",
    file: "clases",
  },
  {
    key: "ventas",
    label: "Ventas / CRM",
    icon: Magnet,
    metric: "25,3%",
    caption: "conversión",
    delta: 3.4,
    color: "var(--color-rose)",
    file: "ventas-crm",
  },
  {
    key: "sedes",
    label: "Por sede",
    icon: Building2,
    metric: "3 sedes",
    caption: "Parque +14,9%",
    delta: 14.9,
    color: "var(--color-emerald)",
    file: "sedes",
  },
];

type Toast = { id: number; title: string; sub?: string; busy?: boolean };

function IconTile({
  icon: Icon,
  color,
  size = 28,
}: {
  icon: LucideIcon;
  color: string;
  size?: number;
}) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-lg"
      style={{
        width: size,
        height: size,
        background: `color-mix(in oklab, ${color} 14%, transparent)`,
        color,
      }}
    >
      <Icon className="size-[15px]" />
    </span>
  );
}

/* ── Índice de informes: riel lateral en desktop ─────────────── */
function ReportRail({
  report,
  choose,
  onSchedule,
}: {
  report: ReportKey;
  choose: (k: ReportKey) => void;
  onSchedule: () => void;
}) {
  return (
    <aside className="stagger hidden xl:block" style={s(1)}>
      <div className="sticky top-[96px] space-y-4">
        <nav aria-label="Informes" className="panel-flat rounded-[18px] p-2">
          <p className="flex items-center justify-between px-2.5 pb-2 pt-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-faint">
            Informes <span className="tabular">{LIBRARY.length}</span>
          </p>
          <ul className="space-y-0.5">
            {LIBRARY.map((r) => {
              const on = r.key === report;
              return (
                <li key={r.key}>
                  <button
                    onClick={() => choose(r.key)}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-all duration-200",
                      on
                        ? "bg-lime/[0.08] ring-1 ring-inset ring-lime/25"
                        : "hover:bg-white/[0.04]",
                    )}
                  >
                    {on && (
                      <span className="absolute -left-2 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-lime shadow-[0_0_10px_rgb(181_245_74/0.7)]" />
                    )}
                    <IconTile icon={r.icon} color={r.color} />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-[13px] font-bold",
                          on ? "text-fg" : "text-fg-2 group-hover:text-fg",
                        )}
                      >
                        {r.label}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-muted">
                        <span className={cn("tabular", on && "text-fg-2")}>
                          {r.metric}
                        </span>
                        <Delta value={r.delta} className="text-[11px]" />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section className="panel-flat rounded-[18px] p-4">
          <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-faint">
            <CalendarClock className="size-3.5" /> Envíos programados
          </p>
          <ul className="mt-3 space-y-3">
            {SCHEDULED.map((x) => (
              <li key={x.name} className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-lime" />
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-bold text-fg-2">
                    {x.name}
                  </span>
                  <span className="block text-[11.5px] text-muted">
                    {x.when} · {x.format} · próximo {x.next}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={onSchedule}
            className="mt-3.5 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong text-[12.5px] font-bold text-fg-2 transition hover:border-lime/40 hover:text-lime"
          >
            <CalendarClock className="size-4" /> Programar este informe
          </button>
        </section>
      </div>
    </aside>
  );
}

/* ── Índice de informes: tira en tablet y mobile ─────────────── */
function ReportStrip({
  report,
  choose,
}: {
  report: ReportKey;
  choose: (k: ReportKey) => void;
}) {
  return (
    <nav
      aria-label="Informes"
      className="-mx-4 mb-4 sm:-mx-6 md:mx-0 xl:hidden"
    >
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 sm:px-6 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
        {LIBRARY.map((r, i) => {
          const on = r.key === report;
          return (
            <li
              key={r.key}
              className="stagger w-[184px] shrink-0 snap-start md:w-auto"
              style={s(1 + i)}
            >
              <button
                onClick={() => choose(r.key)}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "relative flex h-full w-full items-center gap-2.5 overflow-hidden rounded-[14px] border p-2.5 text-left transition-all duration-200",
                  on
                    ? "border-lime/45 bg-lime/[0.07]"
                    : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <IconTile icon={r.icon} color={r.color} size={32} />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-[12.5px] font-bold",
                      on ? "text-fg" : "text-fg-2",
                    )}
                  >
                    {r.label}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-[11.5px] font-semibold text-muted">
                    <span className="tabular">{r.metric}</span>
                    <Delta value={r.delta} className="text-[11px]" />
                  </span>
                </span>
                {on && (
                  <span className="absolute inset-x-5 bottom-0 h-[2px] rounded-full bg-lime shadow-[0_0_10px_2px_rgb(181_245_74/0.5)]" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ── Espacio de trabajo ───────────────────────────────────────── */
export function ReportsWorkspace() {
  const [report, setReport] = useState<ReportKey>("ingresos");
  const [period, setPeriod] = useState<PeriodKey>("mes");
  const [compare, setCompare] = useState<CompareKey>("anterior");
  const [dialog, setDialog] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const timers = useRef<number[]>([]);
  const current = LIBRARY.find((r) => r.key === report)!;

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const later = (fn: () => void, ms: number) =>
    timers.current.push(window.setTimeout(fn, ms));

  const exportFile = (kind: "PDF" | "Excel") => {
    const id = Date.now();
    const slug = report === "ingresos" ? PERIODS[period].slug : "nov";
    const name = `${current.file}-${slug}-2026.${kind === "PDF" ? "pdf" : "xlsx"}`;
    setToast({
      id,
      title: `Generando ${kind}…`,
      sub: `Informe de ${current.label}`,
      busy: true,
    });
    later(
      () => setToast({ id, title: "Informe listo para descargar", sub: name }),
      1300,
    );
    later(() => setToast((t) => (t?.id === id ? null : t)), 4800);
  };

  const choose = (k: ReportKey) => {
    setReport(k);
    const el = document.getElementById("informe");
    if (el && el.getBoundingClientRect().top < 0)
      el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <PageHeader
        eyebrow="Análisis del negocio · datos al 25/11, 08:52"
        title="Reportes"
      >
        <Button
          variant="secondary"
          size="icon"
          onClick={() => exportFile("Excel")}
          aria-label="Exportar a Excel"
          title="Exportar a Excel"
        >
          <FileSpreadsheet className="size-4" />
        </Button>
        <Button variant="secondary" onClick={() => setDialog(true)}>
          <CalendarClock className="size-4" />
          <span>
            Programar<span className="hidden sm:inline"> envío</span>
          </span>
        </Button>
        <Button onClick={() => exportFile("PDF")}>
          <FileText className="size-4" /> Exportar PDF
        </Button>
      </PageHeader>

      <div className="xl:grid xl:grid-cols-[236px_minmax(0,1fr)] xl:gap-6">
        <ReportRail
          report={report}
          choose={choose}
          onSchedule={() => setDialog(true)}
        />

        <div className="min-w-0">
          <ReportStrip report={report} choose={choose} />

          {/* ── Barra de filtros del informe ─────────────────── */}
          <div
            id="informe"
            className="stagger sticky top-[64px] z-10 -mx-4 scroll-mt-[76px] border-y border-line bg-ink/80 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 md:mx-0 md:rounded-2xl md:border md:px-3 lg:top-[72px] lg:scroll-mt-[84px]"
            style={s(2)}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 hidden items-center gap-2 pl-1 text-[13px] font-extrabold text-fg md:flex xl:hidden">
                <current.icon className="size-4 text-lime" /> {current.label}
              </span>
              <span className="hidden h-5 w-px bg-line md:block xl:hidden" />
              {report === "ingresos" ? (
                <>
                  <div
                    className="flex rounded-xl border border-line bg-white/[0.02] p-0.5 text-[12.5px] font-semibold"
                    role="tablist"
                    aria-label="Período"
                  >
                    {(Object.keys(PERIODS) as PeriodKey[]).map((k) => (
                      <button
                        key={k}
                        role="tab"
                        aria-selected={period === k}
                        onClick={() => setPeriod(k)}
                        className={cn(
                          "rounded-[9px] px-2.5 py-1 transition sm:px-3",
                          period === k
                            ? "bg-surface-3 text-fg shadow"
                            : "text-muted hover:text-fg",
                        )}
                      >
                        {PERIODS[k].tab}
                      </button>
                    ))}
                  </div>
                  <span className="hidden h-8 items-center gap-1.5 rounded-xl border border-line bg-white/[0.02] px-2.5 text-[12.5px] font-bold text-fg sm:flex">
                    <CalendarDays className="size-3.5 text-lime" />
                    <span className="tabular">{PERIODS[period].label}</span>
                  </span>
                  <label className="relative flex h-8 items-center gap-2 rounded-xl border border-line bg-white/[0.02] pl-2.5 pr-1 text-[12.5px] font-semibold text-muted">
                    <span className="hidden sm:inline">Comparar con</span>
                    <span className="sm:hidden">vs.</span>
                    <select
                      value={compare}
                      onChange={(e) => setCompare(e.target.value as CompareKey)}
                      className="h-6 cursor-pointer appearance-none rounded-lg bg-surface-3 pl-2 pr-6 text-[12.5px] font-bold text-fg focus:outline-none"
                    >
                      <option value="anterior">Período anterior</option>
                      <option value="interanual">Mismo período 2025</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-muted" />
                  </label>
                </>
              ) : (
                <span className="flex h-8 items-center gap-1.5 rounded-xl border border-line bg-white/[0.02] px-2.5 text-[12.5px] font-bold text-fg-2">
                  <CalendarDays className="size-3.5 text-lime" /> Noviembre 2026{" "}
                  <span className="font-semibold text-muted">
                    · vs. octubre
                  </span>
                </span>
              )}
              <span className="ml-auto hidden h-8 items-center gap-1.5 rounded-xl px-2 text-[12px] font-semibold text-muted lg:flex">
                <Building2 className="size-3.5" /> Todas las sedes
              </span>
            </div>
          </div>

          {/* ── Informe ──────────────────────────────────────── */}
          <div key={report} className="mt-4 lg:mt-5">
            {report === "ingresos" && (
              <IngresosReport period={period} compare={compare} />
            )}
            {report === "retencion" && <RetencionReport />}
            {report === "asistencia" && <AsistenciaReport />}
            {report === "clases" && <ClasesReport />}
            {report === "ventas" && <VentasReport />}
            {report === "sedes" && <SedesReport />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {dialog && (
          <ScheduleDialog
            report={current.label}
            onClose={() => setDialog(false)}
            onDone={(summary) => {
              setDialog(false);
              const id = Date.now();
              setToast({ id, title: "Envío programado", sub: summary });
              later(() => setToast((t) => (t?.id === id ? null : t)), 4200);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed inset-x-4 bottom-4 z-[70] flex items-center gap-3 rounded-2xl border border-line-strong bg-surface-2/95 p-3.5 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[340px]"
            role="status"
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl",
                toast.busy ? "bg-white/5 text-muted" : "bg-lime text-lime-ink",
              )}
            >
              {toast.busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" strokeWidth={3} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-fg">{toast.title}</p>
              {toast.sub && (
                <p className="truncate text-[11.5px] text-muted">{toast.sub}</p>
              )}
            </div>
            <button
              onClick={() => setToast(null)}
              className="grid size-7 place-items-center rounded-lg text-muted hover:bg-white/5"
              aria-label="Cerrar aviso"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
