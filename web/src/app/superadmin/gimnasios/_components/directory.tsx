"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FlaskConical,
  LayoutGrid,
  List,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Avatar, Pill, Sparkline } from "@/components/ui/primitives";
import { cn, fmt, money } from "@/lib/utils";
import {
  COUNTRY_NAME,
  DUNNING,
  DUNNING_TOTAL,
  HEALTH_META,
  PLATFORM,
  healthBand,
  lastSeenLabel,
  tenantSlug,
  type Country,
  type HealthBand,
  type TenantPlan,
  type TenantRow,
  type TenantStatus,
} from "../../_data";
import { HealthGauge, PlanTag, TenantLogo, tenantCover } from "./bits";

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

type Segment = "all" | "active" | "trial" | "risk" | "delinquent";
type SortKey = "mrr" | "health" | "socios" | "lastSeen" | "name";

const inSegment: Record<Segment, (t: TenantRow) => boolean> = {
  all: () => true,
  active: (t) => t.mrr > 0 && t.status !== "Suspendido",
  trial: (t) => t.status === "En prueba",
  risk: (t) => healthBand(t.health) === "risk" && t.status !== "Suspendido",
  delinquent: (t) => t.status === "Pago vencido",
};


export function TenantDirectory({ rows }: { rows: TenantRow[] }) {
  const [segment, setSegment] = useState<Segment>("all");
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState<TenantPlan | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [status, setStatus] = useState<TenantStatus | null>(null);
  const [health, setHealth] = useState<HealthBand | null>(null);
  const [view, setView] = useState<"table" | "cards">("table");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "mrr", dir: -1 });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = rows.filter(
      (t) =>
        inSegment[segment](t) &&
        (!plan || t.plan === plan) &&
        (!country || t.country === country) &&
        (!status || t.status === status) &&
        (!health || healthBand(t.health) === health) &&
        (!term || `${t.name} ${t.id} ${t.owner} ${t.city}`.toLowerCase().includes(term)),
    );
    return list.sort((a, b) => {
      const k = sort.key;
      const d = k === "name" ? a.name.localeCompare(b.name) : (a[k] as number) - (b[k] as number);
      return d * sort.dir || b.mrr - a.mrr;
    });
  }, [rows, segment, q, plan, country, status, health, sort]);

  const activeFilters = [plan, country, status, health, q.trim() || null].filter(Boolean).length + (segment !== "all" ? 1 : 0);
  const clear = () => {
    setSegment("all");
    setQ("");
    setPlan(null);
    setCountry(null);
    setStatus(null);
    setHealth(null);
  };
  const toggleSort = (key: SortKey) =>
    setSort((p) => (p.key === key ? { key, dir: p.dir === 1 ? -1 : 1 } : { key, dir: key === "name" || key === "lastSeen" ? 1 : -1 }));

  const sumMrr = filtered.reduce((a, t) => a + t.mrr, 0);

  return (
    <>
      {/* ── KPIs = filtros rápidos ─────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <SegmentCard
          i={0}
          on={segment === "active"}
          onClick={() => setSegment(segment === "active" ? "all" : "active")}
          icon={Building2}
          tone="lime"
          label="Activos"
          value={PLATFORM.active}
          foot={<><b className="text-lime">+11</b> este mes · 512 sedes</>}
          viz={<Sparkline data={[281, 288, 292, 297, 301, 306, 309, 315, 318, 322, 326]} height={30} fill={false} className="opacity-80" />}
        />
        <SegmentCard
          i={1}
          on={segment === "trial"}
          onClick={() => setSegment(segment === "trial" ? "all" : "trial")}
          icon={FlaskConical}
          tone="amber"
          label="En prueba"
          value={PLATFORM.trials}
          foot={<><b className="text-amber">{PLATFORM.trialsThisWeek}</b> terminan esta semana</>}
          viz={<TrialDots />}
        />
        <SegmentCard
          i={2}
          on={segment === "risk"}
          onClick={() => setSegment(segment === "risk" ? "all" : "risk")}
          icon={AlertTriangle}
          tone="rose"
          label="En riesgo"
          value={PLATFORM.atRisk}
          foot={<>salud &lt; 55 · <b className="text-fg-2">$ 1,6 M</b> MRR</>}
          viz={<HealthMix />}
        />
        <SegmentCard
          i={3}
          on={segment === "delinquent"}
          onClick={() => setSegment(segment === "delinquent" ? "all" : "delinquent")}
          icon={CircleDollarSign}
          tone="rose"
          label="Morosos"
          value={PLATFORM.delinquent}
          foot={<><b className="text-rose tabular">{money(DUNNING_TOTAL)}</b> adeudado</>}
          viz={<AttemptBars />}
        />
      </section>

      {/* ── Directorio ─────────────────────────────────────── */}
      <section className="panel-flat stagger mt-4" style={s(4)}>
        {/* barra de herramientas */}
        <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
          <label className="order-1 flex h-10 w-full min-w-0 items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-3 text-muted transition focus-within:border-lime/40 md:w-auto md:flex-1 xl:w-[260px] xl:flex-none">
            <Search className="size-4 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nombre, ID, dueño o ciudad…"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-fg placeholder:text-muted focus:outline-none"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Borrar búsqueda" className="text-muted hover:text-fg">
                <X className="size-3.5" />
              </button>
            )}
          </label>

          <div className="order-3 flex w-full flex-wrap items-center gap-2 xl:order-2 xl:w-auto">
            <FilterMenu label="Plan" value={plan} onChange={setPlan} options={(["Starter", "Pro", "Cadena"] as const).map((p) => ({ value: p, label: p }))} />
            <FilterMenu
              label="País"
              value={country}
              onChange={setCountry}
              options={(Object.keys(COUNTRY_NAME) as Country[]).map((c) => ({ value: c, label: COUNTRY_NAME[c], hint: c }))}
            />
            <FilterMenu
              label="Estado"
              value={status}
              onChange={setStatus}
              options={(["Al día", "Onboarding", "Upgrade pendiente", "En prueba", "Pago vencido", "Suspendido"] as const).map((x) => ({ value: x, label: x }))}
            />
            <FilterMenu
              label="Salud"
              value={health}
              onChange={setHealth}
              options={(["ok", "watch", "risk"] as const).map((h) => ({
                value: h,
                label: HEALTH_META[h].label,
                hint: h === "ok" ? "75+" : h === "watch" ? "55–74" : "< 55",
                dot: HEALTH_META[h].color,
              }))}
            />
            {activeFilters > 0 && (
              <button onClick={clear} className="h-9 rounded-xl px-2.5 text-[12.5px] font-semibold text-muted transition hover:text-fg">
                Limpiar ({activeFilters})
              </button>
            )}
          </div>

          <div className="order-2 flex w-full items-center justify-between gap-3 md:w-auto xl:order-3 xl:ml-auto">
            <p className="text-[12px] font-semibold text-muted md:hidden">
              <span className="text-fg tabular">{filtered.length}</span> resultados
            </p>
            <div className="flex rounded-xl border border-line bg-white/[0.02] p-1 text-[12.5px] font-semibold" role="tablist" aria-label="Vista">
              {(
                [
                  ["table", "Tabla", List],
                  ["cards", "Tarjetas", LayoutGrid],
                ] as const
              ).map(([v, l, Icon]) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition",
                    view === v ? "bg-surface-3 text-fg shadow" : "text-muted hover:text-fg",
                  )}
                >
                  <Icon className="size-3.5" /> {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="grid place-items-center border-t border-line px-6 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.04] text-muted">
              <SearchX className="size-5" />
            </span>
            <p className="mt-4 text-[15px] font-bold text-fg">Ningún gimnasio coincide</p>
            <p className="mt-1 text-[13px] text-muted">Probá con otro término o quitá algún filtro.</p>
            <button onClick={clear} className="mt-4 h-9 rounded-xl border border-line px-4 text-[13px] font-semibold text-fg-2 hover:bg-white/[0.04]">
              Limpiar filtros
            </button>
          </div>
        ) : view === "table" ? (
          <TableView rows={filtered} sort={sort} onSort={toggleSort} />
        ) : (
          <CardsView rows={filtered} />
        )}

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line bg-white/[0.015] px-4 py-3.5 text-[12px] font-semibold text-muted sm:px-5">
          <span>
            Mostrando <span className="text-fg tabular">{filtered.length}</span> de <span className="text-fg tabular">{PLATFORM.total}</span> cuentas
            {sumMrr > 0 && (
              <>
                {" "}
                · <span className="font-bold text-lime tabular">{money(sumMrr)}</span> MRR
              </>
            )}
          </span>
          <nav className="flex items-center gap-1" aria-label="Paginación">
            <button className="grid size-8 place-items-center rounded-lg text-faint" aria-label="Anterior" disabled>
              <ChevronLeft className="size-4" />
            </button>
            {["1", "2", "3", "…", "15"].map((p) => (
              <button
                key={p}
                className={cn(
                  "grid h-8 min-w-8 place-items-center rounded-lg px-2 tabular transition",
                  p === "1" ? "bg-lime/12 font-bold text-lime" : "text-fg-2 hover:bg-white/[0.05]",
                )}
              >
                {p}
              </button>
            ))}
            <button className="grid size-8 place-items-center rounded-lg text-fg-2 hover:bg-white/[0.05]" aria-label="Siguiente">
              <ChevronRight className="size-4" />
            </button>
          </nav>
        </div>
      </section>
    </>
  );
}

/* ── KPI / segmento ─────────────────────────────────────────── */

const TONE = {
  lime: { chip: "bg-lime/12 text-lime", ring: "border-lime/45 shadow-[0_0_0_1px_rgb(181_245_74/0.12)_inset,0_0_32px_-10px_rgb(181_245_74/0.4)]" },
  amber: { chip: "bg-amber/12 text-amber", ring: "border-amber/45 shadow-[0_0_0_1px_rgb(255_190_85/0.12)_inset,0_0_32px_-10px_rgb(255_190_85/0.35)]" },
  rose: { chip: "bg-rose/12 text-rose", ring: "border-rose/45 shadow-[0_0_0_1px_rgb(255_95_126/0.12)_inset,0_0_32px_-10px_rgb(255_95_126/0.35)]" },
};

function SegmentCard({
  i,
  on,
  onClick,
  icon: Icon,
  tone,
  label,
  value,
  foot,
  viz,
}: {
  i: number;
  on: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONE;
  label: string;
  value: number;
  foot: React.ReactNode;
  viz: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "panel-flat stagger group flex flex-col p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong sm:p-5",
        on && TONE[tone].ring,
      )}
      style={s(i)}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", TONE[tone].chip)}>
            <Icon className="size-4" />
          </span>
          <span className="truncate text-[13px] font-bold text-fg sm:text-[13.5px]">{label}</span>
        </span>
        <span
          className={cn(
            "hidden shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] transition sm:inline",
            on ? "bg-white/[0.08] text-fg" : "text-faint opacity-0 group-hover:opacity-100",
          )}
        >
          {on ? "Filtrando" : "Filtrar"}
        </span>
      </span>
      <span className="mt-4 flex w-full items-end justify-between gap-3">
        <span className="text-[28px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular sm:text-[34px]">
          <CountUp value={value} />
        </span>
        <span className="hidden w-[96px] shrink-0 sm:block">{viz}</span>
      </span>
      <span className="mt-2.5 text-[11.5px] font-medium text-muted">{foot}</span>
    </button>
  );
}

/** 18 pruebas: cada punto es una; las que vencen en ≤ 7 días, en ámbar. */
function TrialDots() {
  return (
    <span className="grid grid-cols-9 gap-[5px] pb-1">
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className={cn("aspect-square rounded-full", i < 5 ? "bg-amber shadow-[0_0_6px_rgb(255_190_85/0.6)]" : "bg-white/[0.14]")} />
      ))}
    </span>
  );
}

/** Distribución de salud de las 326 cuentas activas. */
function HealthMix() {
  const parts = [
    { v: 251, c: "bg-lime" },
    { v: 52, c: "bg-amber" },
    { v: 23, c: "bg-rose" },
  ];
  return (
    <span className="block pb-1.5">
      <span className="flex h-2 gap-[3px]">
        {parts.map((p) => (
          <span key={p.c} className={cn("rounded-full", p.c)} style={{ flex: p.v }} />
        ))}
      </span>
      <span className="mt-1.5 flex justify-between text-[9.5px] font-bold text-faint tabular">
        <span>251</span>
        <span>52</span>
        <span className="text-rose">23</span>
      </span>
    </span>
  );
}

/** Morosos por intento de cobro (1.º a 4.º). */
function AttemptBars() {
  const n = [1, 2, 3, 4].map((a) => DUNNING.filter((d) => d.attempt === a).length);
  return (
    <span className="flex h-[30px] items-end gap-1.5">
      {n.map((v, i) => (
        <span key={i} className="flex flex-1 flex-col items-center gap-1">
          <span className={cn("w-full rounded-[4px]", i >= 2 ? "bg-rose" : "bg-rose/40")} style={{ height: `${(v / Math.max(...n)) * 18 + 4}px` }} />
        </span>
      ))}
    </span>
  );
}

/* ── Filtro desplegable ─────────────────────────────────────── */

function FilterMenu<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | null;
  onChange: (v: T | null) => void;
  options: { value: T; label: string; hint?: string; dot?: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-[12.5px] font-semibold transition",
          current ? "border-lime/35 bg-lime/[0.07] text-fg" : "border-line text-fg-2 hover:border-line-strong hover:text-fg",
        )}
      >
        <span className={current ? "text-muted" : ""}>{label}</span>
        {current && <span className="text-lime">{current.label}</span>}
        <ChevronDown className={cn("size-3.5 text-muted transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-[200px] animate-fade-in rounded-2xl border border-line-strong bg-ink-2/95 p-1.5 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.8)] backdrop-blur-xl">
          {[{ value: null, label: "Todos" } as { value: T | null; label: string; hint?: string; dot?: string }, ...options].map((o) => {
            const sel = o.value === value;
            return (
              <button
                key={o.label}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] font-semibold transition",
                  sel ? "bg-white/[0.06] text-fg" : "text-fg-2 hover:bg-white/[0.04] hover:text-fg",
                )}
              >
                {o.dot && <span className="size-2 shrink-0 rounded-full" style={{ background: o.dot }} />}
                <span className="flex-1">{o.label}</span>
                {o.hint && <span className="text-[11px] font-bold text-faint tabular">{o.hint}</span>}
                <Check className={cn("size-3.5 text-lime", !sel && "invisible")} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Vista tabla ───────────────────────────────────────────── */

function SortTh({
  k,
  sort,
  onSort,
  align = "left",
  className,
  children,
}: {
  k: SortKey;
  sort: { key: SortKey; dir: 1 | -1 };
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  const on = sort.key === k;
  const Arrow = sort.dir === 1 ? ArrowUp : ArrowDown;
  return (
    <th className={cn("px-3 py-2.5 font-semibold", align === "right" && "text-right", className)} aria-sort={on ? (sort.dir === 1 ? "ascending" : "descending") : undefined}>
      <button
        onClick={() => onSort(k)}
        className={cn("inline-flex items-center gap-1 transition hover:text-fg", on && "text-fg", align === "right" && "flex-row-reverse")}
      >
        {children}
        <Arrow className={cn("size-3", on ? "text-lime" : "opacity-0")} />
      </button>
    </th>
  );
}

function TableView({ rows, sort, onSort }: { rows: TenantRow[]; sort: { key: SortKey; dir: 1 | -1 }; onSort: (k: SortKey) => void }) {
  return (
    <>
      {/* mobile: lista compacta */}
      <ul className="divide-y divide-line/70 border-t border-line md:hidden">
        {rows.map((t) => (
          <li key={t.id}>
            <Link href={`/superadmin/gimnasios/${tenantSlug(t)}`} className="flex items-center gap-3 px-4 py-3 transition active:bg-white/[0.03]">
              <TenantLogo name={t.name} plan={t.plan} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-bold text-fg">{t.name}</span>
                <span className="mt-0.5 flex items-center gap-1.5 truncate text-[11.5px] font-semibold text-muted">
                  {t.plan} · {fmt(t.socios)} socios
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-fg tabular">{t.mrr ? money(t.mrr) : "—"}</span>
                </span>
                <span className="flex items-center gap-2">
                  <HealthGauge value={t.health} size={22} className="gap-1 [&_span.block]:text-[11px]" />
                  <Pill tone={t.tone} className="px-2 py-0.5 text-[10.5px]">{t.status}</Pill>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full whitespace-nowrap text-left text-[13px]">
          <thead>
            <tr className="border-t border-line text-[11.5px] font-semibold text-muted">
              <SortTh k="name" sort={sort} onSort={onSort} className="pl-5">Gimnasio</SortTh>
              <th className="hidden px-3 py-2.5 font-semibold xl:table-cell">Dueño</th>
              <th className="hidden px-3 py-2.5 font-semibold xl:table-cell">Plan</th>
              <th className="hidden px-3 py-2.5 text-right font-semibold xl:table-cell">Sedes</th>
              <SortTh k="socios" sort={sort} onSort={onSort} align="right">Socios</SortTh>
              <SortTh k="mrr" sort={sort} onSort={onSort} align="right">MRR</SortTh>
              <SortTh k="health" sort={sort} onSort={onSort}>Salud</SortTh>
              <SortTh k="lastSeen" sort={sort} onSort={onSort} className="hidden xl:table-cell">Actividad</SortTh>
              <th className="px-3 py-2.5 font-semibold">Estado</th>
              <th className="w-10 pr-4" aria-label="Abrir" />
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const href = `/superadmin/gimnasios/${tenantSlug(t)}`;
              const stale = t.lastSeen >= 3 * 1440;
              return (
                <tr key={t.id} className="group relative border-t border-line/70 transition hover:bg-white/[0.025]">
                  <td className="py-3 pl-5 pr-3">
                    <span className="flex items-center gap-3">
                      <TenantLogo name={t.name} plan={t.plan} />
                      <span className="min-w-0">
                        {/* el enlace cubre toda la fila */}
                        <Link href={href} className="block font-bold text-fg after:absolute after:inset-0 after:content-['']">
                          {t.name}
                        </Link>
                        <span className="block text-[11.5px] font-semibold text-muted tabular">
                          <span className="xl:hidden">
                            {t.plan} · {t.sedes} {t.sedes === 1 ? "sede" : "sedes"} · {t.city}
                          </span>
                          <span className="hidden xl:inline">
                            {t.id} · {t.city}, {t.country}
                          </span>
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="hidden px-3 py-3 xl:table-cell">
                    <span className="flex items-center gap-2">
                      <Avatar i={t.ownerFace} size={24} />
                      <span className="max-w-[130px] truncate font-semibold text-fg-2">{t.owner}</span>
                    </span>
                  </td>
                  <td className="hidden px-3 py-3 xl:table-cell">
                    <PlanTag plan={t.plan} />
                  </td>
                  <td className="hidden px-3 py-3 text-right font-semibold text-fg-2 tabular xl:table-cell">{t.sedes}</td>
                  <td className="px-3 py-3 text-right font-semibold text-fg-2 tabular">{fmt(t.socios)}</td>
                  <td className="px-3 py-3 text-right font-bold text-fg tabular">{t.mrr ? money(t.mrr) : <span className="text-faint">—</span>}</td>
                  <td className="px-3 py-3">
                    <HealthGauge value={t.health} />
                  </td>
                  <td className={cn("hidden px-3 py-3 text-[12.5px] font-semibold xl:table-cell", stale ? "text-amber" : "text-muted")}>
                    {t.lastSeen < 15 && <span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald align-middle shadow-[0_0_6px_rgb(61_220_151/0.8)]" />}
                    {lastSeenLabel(t.lastSeen)}
                  </td>
                  <td className="px-3 py-3">
                    <Pill tone={t.tone}>{t.status}</Pill>
                  </td>
                  <td className="pr-4">
                    <ChevronRight className="size-4 text-faint transition group-hover:translate-x-0.5 group-hover:text-fg" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Vista tarjetas ────────────────────────────────────────── */

function CardsView({ rows }: { rows: TenantRow[] }) {
  return (
    <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 xl:grid-cols-3 2xl:grid-cols-4">
      {rows.map((t, i) => {

        return (
          <Link
            key={t.id}
            href={`/superadmin/gimnasios/${tenantSlug(t)}`}
            className="stagger group relative overflow-hidden rounded-2xl border border-line bg-ink-2 transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_24px_48px_-24px_rgb(0_0_0/0.9)]"
            style={s(Math.min(i, 8))}
          >
            <div className="relative h-[104px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tenantCover(t.id, 640, 260)}
                alt=""
                loading="lazy"
                className="photo-grade absolute inset-0 h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/40 to-transparent" />
              <Pill tone={t.tone} className="absolute right-3 top-3 bg-ink/70 backdrop-blur">
                {t.status}
              </Pill>
            </div>
            <div className="relative -mt-7 px-4 pb-4">
              <div className="flex items-end justify-between gap-3">
                <TenantLogo name={t.name} plan={t.plan} className="size-12 rounded-2xl bg-ink-2 text-[14px] shadow-[0_8px_20px_-6px_rgb(0_0_0/0.8)]" />
                <HealthGauge value={t.health} size={40} showLabel />
              </div>
              <p className="mt-3 truncate text-[15px] font-bold text-fg">{t.name}</p>
              <p className="truncate text-[11.5px] font-semibold text-muted tabular">
                {t.id} · {t.city}, {t.country}
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-line bg-white/[0.02] p-2.5">
                {[
                  ["MRR", t.mrr ? `$ ${(t.mrr / 1000).toLocaleString("es-AR", { maximumFractionDigits: 1 })} K` : "—"],
                  ["Socios", fmt(t.socios)],
                  [t.sedes === 1 ? "Sede" : "Sedes", String(t.sedes)],
                ].map(([l, v]) => (
                  <div key={l} className="min-w-0">
                    <dt className="text-[10.5px] font-semibold text-muted">{l}</dt>
                    <dd className="truncate text-[13.5px] font-extrabold text-fg tabular">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex items-center justify-between gap-2 text-[11.5px] font-semibold">
                <span className="flex min-w-0 items-center gap-2 text-fg-2">
                  <Avatar i={t.ownerFace} size={20} />
                  <span className="truncate">{t.owner}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <PlanTag plan={t.plan} />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
