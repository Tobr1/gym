"use client";

import { ArrowRight, Check, MessageCircle, Sparkles, TrendingDown } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Sparkline } from "@/components/ui/primitives";
import { PHOTO } from "@/lib/photos";
import { cn } from "@/lib/utils";
import { AGING } from "../../caja/_data";
import { RISK, RISK_TOTAL, SEGMENTS, type Row, type SegmentKey } from "./data";
import { MemberAvatar } from "./parts";

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

/* Próximos 7 días (mié 25 → mar 1): 12 cuotas sin débito automático. */
const DUE_WEEK = [
  { d: "Mié", v: 1 },
  { d: "Jue", v: 3 },
  { d: "Vie", v: 2 },
  { d: "Sáb", v: 1 },
  { d: "Dom", v: 0 },
  { d: "Lun", v: 3 },
  { d: "Mar", v: 2 },
];
const FROZEN_BACK = [
  { m: "Dic", v: 4 },
  { m: "Ene", v: 9 },
  { m: "Feb+", v: 6 },
];

function SegmentViz({ k, color }: { k: SegmentKey; color: string }) {
  if (k === "activos" || k === "nuevos") {
    const sg = SEGMENTS.find((x) => x.key === k)!;
    return <Sparkline data={sg.spark} color={color} height={30} className="-mb-1 mt-3" />;
  }
  if (k === "por-vencer") {
    return (
      <div className="mt-3 flex h-[30px] items-end gap-1" aria-hidden>
        {DUE_WEEK.map((x, i) => (
          <span key={x.d} className="flex flex-1 flex-col items-center gap-1" title={`${x.d}: ${x.v}`}>
            <span
              className={cn("w-full rounded-[3px]", i === 0 ? "bg-amber" : "bg-amber/35")}
              style={{ height: Math.max(3, x.v * 6) }}
            />
            <span className={cn("text-[8.5px] font-bold leading-none", i === 0 ? "text-amber" : "text-faint")}>{x.d[0]}</span>
          </span>
        ))}
      </div>
    );
  }
  if (k === "vencidos") {
    const debt = AGING.slice(1);
    const total = debt.reduce((a, b) => a + b.members, 0);
    return (
      <div className="mt-3">
        <div className="flex h-[6px] gap-[3px] overflow-hidden rounded-full">
          {debt.map((b) => (
            <span key={b.key} className="h-full rounded-full" style={{ width: `${(b.members / total) * 100}%`, background: b.color }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-bold text-faint tabular">
          {debt.map((b) => (
            <span key={b.key}>
              <span style={{ color: b.color }}>{b.members}</span> {b.label.replace(" días", " d")}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mt-3 grid grid-cols-3 gap-1.5">
      {FROZEN_BACK.map((x, i) => (
        <span key={x.m} className={cn("rounded-lg border border-line py-1 text-center", i === 0 && "border-cyan/30 bg-cyan/[0.07]")}>
          <span className={cn("block text-[13px] font-extrabold leading-none tabular", i === 0 ? "text-cyan" : "text-fg-2")}>{x.v}</span>
          <span className="mt-0.5 block text-[9.5px] font-bold text-faint">{x.m}</span>
        </span>
      ))}
    </div>
  );
}

export function Segments({ active, onSelect }: { active: SegmentKey | null; onSelect: (k: SegmentKey | null) => void }) {
  return (
    <section
      aria-label="Segmentos del padrón"
      className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 no-scrollbar sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8 xl:mx-0 xl:grid xl:grid-cols-[1.35fr_repeat(4,minmax(0,1fr))] xl:gap-4 xl:overflow-visible xl:px-0 xl:pb-0"
    >
      {SEGMENTS.map((sg, i) => {
        const on = active === sg.key;
        return (
          <button
            key={sg.key}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(on ? null : sg.key)}
            className={cn(
              "panel stagger group flex w-[172px] shrink-0 snap-start flex-col justify-start overflow-hidden p-4 text-left transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-line-strong md:w-[196px] xl:w-auto xl:p-5",
            )}
            style={{
              ...s(i + 1),
              ...(on
                ? {
                    borderColor: `color-mix(in oklab, ${sg.color} 55%, transparent)`,
                    boxShadow: `0 0 0 1px color-mix(in oklab, ${sg.color} 14%, transparent) inset, 0 0 34px -10px color-mix(in oklab, ${sg.color} 55%, transparent), var(--shadow-card)`,
                  }
                : {}),
            }}
          >
            {on && (
              <span
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{ background: `radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, ${sg.color} 14%, transparent), transparent 60%)` }}
              />
            )}
            <span className="relative flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-[12.5px] font-semibold text-fg-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: sg.color, boxShadow: `0 0 10px ${sg.color}` }} />
                <span className="truncate">{sg.label}</span>
              </span>
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full transition",
                  on ? "text-ink" : "text-transparent ring-1 ring-inset ring-white/10 group-hover:text-muted",
                )}
                style={on ? { background: sg.color } : undefined}
              >
                <Check className="size-3" strokeWidth={3.2} />
              </span>
            </span>
            <span className="relative mt-2 block text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular xl:text-[34px]">
              <CountUp value={sg.count} />
            </span>
            <span className="relative mt-1.5 line-clamp-2 text-[11.5px] font-medium leading-snug text-muted">{sg.hint}</span>
            <span className="relative mt-auto block">
              <SegmentViz k={sg.key} color={sg.color} />
            </span>
          </button>
        );
      })}
    </section>
  );
}

/* ── En riesgo de abandono ────────────────────────────────── */
const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
const one = (n: number) => n.toLocaleString("es-AR", { maximumFractionDigits: 1 });

export function RiskStrip({
  riskOnly,
  onToggle,
  onMessage,
}: {
  riskOnly: boolean;
  onToggle: () => void;
  onMessage: (r: Row) => void;
}) {
  return (
    <section className="panel stagger mt-4 flex flex-col overflow-hidden lg:flex-row" style={s(6)}>
      <div className="relative shrink-0 overflow-hidden p-5 lg:w-[320px] lg:p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PHOTO.runners(720, 520)}
          alt=""
          loading="lazy"
          className="photo-grade absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-surface/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
        <div className="relative">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-rose">
            <TrendingDown className="size-3.5" strokeWidth={2.6} /> Señal temprana
          </p>
          <h2 className="mt-2 text-[19px] font-extrabold leading-tight tracking-[-0.02em] text-fg">En riesgo de abandono</h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-2">
            <b className="font-extrabold text-fg">{RISK_TOTAL} socios</b> bajaron su asistencia más de 25 pts en las últimas 4 semanas.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggle}
              aria-pressed={riskOnly}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-[11px] px-3.5 text-[12.5px] font-bold transition",
                riskOnly ? "bg-rose text-white" : "border border-rose/40 text-rose hover:bg-rose/10",
              )}
            >
              {riskOnly ? <Check className="size-3.5" strokeWidth={3} /> : <ArrowRight className="size-3.5" />}
              {riskOnly ? "Filtrando en la tabla" : "Ver en la tabla"}
            </button>
            <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-muted">
              <Sparkles className="size-3.5 text-violet" /> Reactivación sugerida
            </span>
          </div>
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 snap-x gap-3 overflow-x-auto border-t border-line p-4 no-scrollbar [mask-image:linear-gradient(to_right,#000_88%,transparent)] lg:border-l lg:border-t-0 lg:p-5">
        {RISK.map((r) => {
          const before = avg(r.weeks.slice(0, 4));
          const now = avg(r.weeks.slice(4));
          return (
            <li
              key={r.id}
              className="group flex w-[212px] shrink-0 snap-start flex-col rounded-2xl border border-line bg-white/[0.02] p-3.5 transition hover:-translate-y-0.5 hover:border-rose/30"
            >
              <div className="flex items-center gap-2.5">
                <MemberAvatar r={r} size={34} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-fg">{r.name}</p>
                  <p className="truncate text-[11px] text-muted">{r.plan}</p>
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-faint">Visitas / sem</p>
                  <p className="mt-0.5 text-[15px] font-extrabold text-fg tabular">
                    <span className="text-muted">{one(before)}</span>
                    <span className="mx-1 text-faint">→</span>
                    <span className="text-rose">{one(now)}</span>
                  </p>
                </div>
                <span className="rounded-full bg-rose/12 px-2 py-0.5 text-[11px] font-extrabold text-rose tabular">
                  −{r.prevAttendance - r.attendance} pts
                </span>
              </div>
              <Sparkline data={r.weeks.map((w) => w + 0.4)} color="var(--color-rose)" height={26} className="mt-2 opacity-90" />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-muted">Últ. visita · {r.last.label.replace("Hace", "hace")}</span>
                <button
                  type="button"
                  onClick={() => onMessage(r)}
                  aria-label={`Escribir a ${r.name} por WhatsApp`}
                  className="grid size-7 place-items-center rounded-lg bg-emerald/12 text-emerald transition hover:bg-emerald/25"
                >
                  <MessageCircle className="size-3.5" />
                </button>
              </div>
            </li>
          );
        })}
        <li className="flex w-[150px] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong p-3 text-center">
          <p className="text-[24px] font-extrabold text-fg tabular">+{RISK_TOTAL - RISK.length}</p>
          <p className="text-[11.5px] font-semibold text-muted">socios más con la misma señal</p>
          <button type="button" onClick={onToggle} className="mt-2 text-[12px] font-bold text-lime hover:underline">
            Ver todos
          </button>
        </li>
      </ul>
    </section>
  );
}
