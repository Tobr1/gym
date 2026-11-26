"use client";

import { useRouter } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Download,
  Layers,
  MapPin,
  Plus,
  SearchX,
  SlidersHorizontal,
  Search,
  Upload,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { Button, Kbd } from "@/components/ui/primitives";
import { STATUS_META, type MemberStatus } from "@/lib/mock";
import { cn, fmt, money } from "@/lib/utils";
import type { MethodKey } from "../../caja/_data";
import {
  ATT_BUCKETS,
  BRANCHES,
  PADRON_TOTAL,
  PLANS,
  PLAN_COLOR,
  PLAN_PRICE,
  ROWS,
  SEGMENTS,
  attBucket,
  dayLabel,
  inSegment,
  isRisk,
  type Row,
  type SegmentKey,
} from "./data";
import { RiskStrip, Segments } from "./insights";
import { BulkBar, ChargeSheet, FilterSheet, NewMemberSheet, PeekSheet, Toast, type Filters, type NewMember, type ToastMsg } from "./overlays";
import { FilterMenu, STATUS_DOT, norm } from "./parts";
import { MemberCards, MembersTable, type Sort, type SortKey } from "./table";

const EMPTY: Filters = { plans: [], branches: [], statuses: [], att: [], riskOnly: false };
const PAGE_SIZE = 26;
const first = (name: string) => name.split(" ")[0];

const SORTERS: Record<SortKey, (a: Row, b: Row) => number> = {
  name: (a, b) => a.name.localeCompare(b.name, "es"),
  due: (a, b) => (a.daysLeft ?? 9e3) - (b.daysLeft ?? 9e3),
  last: (a, b) => a.last.sort - b.last.sort,
  att: (a, b) => a.attendance - b.attendance,
  debt: (a, b) => a.debt - b.debt,
};
const SORT_LABEL: Record<SortKey, string> = {
  last: "Última visita",
  due: "Vencimiento",
  name: "Nombre",
  att: "Asistencia",
  debt: "Saldo",
};

function toCsv(rows: Row[]) {
  const head = ["ID", "Nombre", "DNI", "Celular", "Plan", "Sede", "Estado", "Vencimiento", "Asistencia %", "Saldo"];
  const body = rows.map((r) =>
    [r.id, r.name, r.dni, r.phone, r.plan, r.branch, STATUS_META[r.status].label, r.due, r.attendance, r.debt].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"),
  );
  return "﻿" + [head.join(";"), ...body].join("\n");
}
function download(rows: Row[], name: string) {
  const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Directory() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(ROWS);
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query);
  const [seg, setSeg] = useState<SegmentKey | null>(null);
  const [f, setF] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState<Sort>({ key: "last", dir: 1 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sheet, setSheet] = useState<{ kind: "charge" | "peek"; id: string } | { kind: "new" | "filters" } | null>(null);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string[]>([]); // altas de esta sesión: siempre arriba
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* ── Atajos: "/" enfoca la búsqueda ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/input|textarea|select/i.test(t.tagName)) {
        e.preventDefault();
        (window.innerWidth >= 768 ? searchRef : mobileSearchRef).current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!fresh) return;
    const t = setTimeout(() => setFresh(null), 2400);
    return () => clearTimeout(t);
  }, [fresh]);

  const notify = useCallback((m: Omit<ToastMsg, "id">) => setToast({ ...m, id: Date.now() }), []);

  /* ── Filtrado ── */
  const filtered = useMemo(() => {
    const nq = norm(q.trim());
    const digits = q.replace(/\D/g, "");
    const out = rows.filter((r) => {
      if (seg && !inSegment(r, seg)) return false;
      if (f.plans.length && !f.plans.includes(r.plan)) return false;
      if (f.branches.length && !f.branches.includes(r.branch)) return false;
      if (f.statuses.length && !f.statuses.includes(r.status)) return false;
      if (f.att.length && (r.status === "congelado" || !f.att.includes(attBucket(r.attendance)))) return false;
      if (f.riskOnly && !isRisk(r)) return false;
      if (!nq) return true;
      return (
        norm(r.name).includes(nq) ||
        r.id.includes(nq.replace("#", "")) ||
        (digits.length >= 3 && (r.dni.replace(/\D/g, "").includes(digits) || r.phone.replace(/\D/g, "").includes(digits)))
      );
    });
    const cmp = SORTERS[sort.key];
    const pin = (r: Row) => (pinned.includes(r.id) ? pinned.indexOf(r.id) : Infinity);
    return out.sort((a, b) => pin(a) - pin(b) || cmp(a, b) * sort.dir || a.name.localeCompare(b.name, "es"));
  }, [rows, q, seg, f, sort, pinned]);

  const activeCount = f.plans.length + f.branches.length + f.statuses.length + f.att.length + (f.riskOnly ? 1 : 0);
  const anyFilter = activeCount > 0 || !!seg || !!q.trim();
  const segMeta = SEGMENTS.find((s) => s.key === seg);
  const total = segMeta ? segMeta.count : PADRON_TOTAL;

  const clearAll = () => {
    setF(EMPTY);
    setSeg(null);
    setQuery("");
  };

  /* ── Selección ── */
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected((s) => (filtered.every((r) => s.has(r.id)) ? new Set([...s].filter((id) => !filtered.some((r) => r.id === id))) : new Set([...s, ...filtered.map((r) => r.id)])));
  const selRows = rows.filter((r) => selected.has(r.id));
  const selDebt = selRows.reduce((a, r) => a + r.debt, 0);

  /* ── Acciones ── */
  const actions = {
    onCharge: (r: Row) => setSheet({ kind: "charge", id: r.id }),
    onMessage: (r: Row) =>
      notify({
        tone: "emerald",
        title: `WhatsApp a ${first(r.name)} listo para enviar`,
        detail: r.debt > 0 ? `Plantilla “Cuota vencida” · ${money(r.debt)}` : isRisk(r) ? "Plantilla “Te extrañamos” · 1 clase de regalo" : `Abrimos el chat con ${r.phone}`,
      }),
    onOpen: (r: Row) => (r.hasProfile ? router.push(`/admin/socios/${r.id}`) : setSheet({ kind: "peek", id: r.id })),
  };

  const confirmCharge = (r: Row, amount: number, method: MethodKey) => {
    setRows((rs) =>
      rs.map((x) => {
        if (x.id !== r.id) return x;
        const base = x.daysLeft === null ? 0 : Math.max(x.daysLeft, 0);
        const next = base + 30;
        return { ...x, debt: 0, status: "activo", daysLeft: next, due: dayLabel(next), period: 30, note: undefined };
      }),
    );
    setSheet(null);
    setFresh(r.id);
    notify({ title: `Cobro registrado · ${money(amount)}`, detail: `${r.name} · ${method === "mp" ? "Mercado Pago" : method === "efectivo" ? "Efectivo" : method === "debito" ? "Débito" : method === "credito" ? "Crédito" : "Transferencia"} · vence ${dayLabel(Math.max(r.daysLeft ?? 0, 0) + 30)}` });
  };

  const createMember = (m: NewMember) => {
    const id = String(1124 + rows.filter((r) => Number(r.id) >= 1124).length);
    const row: Row = {
      id,
      name: m.name.trim().replace(/\s+/g, " ").replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase()),
      face: null,
      plan: m.plan,
      branch: m.branch,
      status: "activo",
      since: "25 nov",
      isNew: true,
      due: dayLabel(30),
      daysLeft: 30,
      period: 30,
      last: { label: "—", daysAgo: -1, sort: 99 * 1440 },
      attendance: 0,
      prevAttendance: 0,
      weeks: [0, 0, 0, 0, 0, 0, 0, 0],
      debt: 0,
      amount: PLAN_PRICE[m.plan],
      phone: m.phone ? `+54 9 ${m.phone}` : "—",
      dni: m.dni || "—",
      auto: m.auto,
      hasProfile: false,
    };
    setRows((rs) => [row, ...rs]);
    setPinned((p) => [id, ...p]);
    setSheet(null);
    setSeg(null);
    setF(EMPTY);
    setQuery("");
    setFresh(id);
    notify({ title: `${first(row.name)} ya es socio · #${id}`, detail: `${m.plan} · ${m.branch} · QR de acceso enviado` });
  };

  const exportRows = (list: Row[], label: string) => {
    download(list, `socios-${label}-2026-11-25.csv`);
    notify({ title: `Exportaste ${list.length} ${list.length === 1 ? "socio" : "socios"}`, detail: "CSV listo · separador punto y coma" });
  };

  const sheetRow = sheet && "id" in sheet ? rows.find((r) => r.id === sheet.id) ?? null : null;

  const pickSeg = (k: SegmentKey | null) => {
    setSeg(k);
    if (k) listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const toggleRisk = () => {
    setF((x) => ({ ...x, riskOnly: !x.riskOnly }));
    if (!f.riskOnly) listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ── Chips de filtros activos ── */
  const chips: { key: string; label: string; color?: string; onRemove: () => void }[] = [
    ...(segMeta ? [{ key: "seg", label: segMeta.label, color: segMeta.color, onRemove: () => setSeg(null) }] : []),
    ...(f.riskOnly ? [{ key: "risk", label: "En riesgo de abandono", color: "var(--color-rose)", onRemove: () => setF({ ...f, riskOnly: false }) }] : []),
    ...f.statuses.map((s) => ({ key: s, label: STATUS_META[s].label, onRemove: () => setF({ ...f, statuses: f.statuses.filter((x) => x !== s) }) })),
    ...f.plans.map((p) => ({ key: p, label: p, color: PLAN_COLOR[p], onRemove: () => setF({ ...f, plans: f.plans.filter((x) => x !== p) }) })),
    ...f.branches.map((b) => ({ key: b, label: b, onRemove: () => setF({ ...f, branches: f.branches.filter((x) => x !== b) }) })),
    ...f.att.map((a) => ({
      key: a,
      label: `Asistencia ${ATT_BUCKETS.find((x) => x.key === a)!.label.toLowerCase()}`,
      onRemove: () => setF({ ...f, att: f.att.filter((x) => x !== a) }),
    })),
  ];

  const count = (pred: (r: Row) => boolean) => rows.filter(pred).length;

  return (
    <>
      <Header onNew={() => setSheet({ kind: "new" })} onExport={() => exportRows(filtered, anyFilter ? "filtrados" : "padron")} onImport={() => notify({ tone: "violet", title: "Importación lista para recibir archivos", detail: "CSV o Excel · detectamos columnas y duplicados por DNI" })} />

      {/* Búsqueda fija (mobile) */}
      <div className="sticky top-[64px] z-[15] -mx-4 mb-4 border-b border-line bg-ink/85 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 md:hidden">
        <div className="flex gap-2">
          <label className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-line bg-white/[0.04] px-3.5 text-muted transition focus-within:border-lime/45">
            <Search className="size-4 shrink-0" />
            <input
              ref={mobileSearchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              enterKeyHint="search"
              placeholder="Nombre, DNI, #socio o celular"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-fg placeholder:text-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Borrar búsqueda" className="grid size-6 place-items-center rounded-full bg-white/10 text-fg-2">
                <X className="size-3.5" />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={() => setSheet({ kind: "filters" })}
            className={cn(
              "relative grid size-11 shrink-0 place-items-center rounded-xl border transition",
              activeCount ? "border-lime/40 bg-lime/[0.1] text-lime" : "border-line bg-white/[0.04] text-fg-2",
            )}
            aria-label="Filtros"
          >
            <SlidersHorizontal className="size-[18px]" />
            {activeCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-lime text-[10.5px] font-extrabold text-lime-ink ring-2 ring-ink">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <Segments active={seg} onSelect={pickSeg} />
      <RiskStrip riskOnly={f.riskOnly} onToggle={toggleRisk} onMessage={actions.onMessage} />

      {/* ── Directorio ─────────────────────────────────── */}
      <section ref={listRef} className="mt-4 scroll-mt-[150px] md:scroll-mt-[96px]" aria-label="Listado de socios">
        {/* Mobile: resumen + orden */}
        <div className="mb-3 flex items-center justify-between gap-3 md:hidden">
          <p className="text-[13px] text-muted">
            <b className="font-extrabold text-fg tabular">{filtered.length}</b> {anyFilter ? "coincidencias" : `de ${fmt(total)} socios`}
          </p>
          <label className="relative flex items-center gap-1.5 text-[12.5px] font-semibold text-fg-2">
            <ArrowUpDown className="size-3.5 text-muted" />
            <select
              value={sort.key}
              onChange={(e) => {
                const k = e.target.value as SortKey;
                setSort({ key: k, dir: k === "att" || k === "debt" ? -1 : 1 });
              }}
              className="appearance-none bg-transparent pr-1 font-bold text-fg focus:outline-none"
              aria-label="Ordenar por"
            >
              {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                <option key={k} value={k} className="bg-surface-2">
                  {SORT_LABEL[k]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {chips.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5 md:hidden">
            {chips.map(({ key, ...c }) => (
              <ActiveChip key={key} {...c} />
            ))}
          </div>
        )}

        {/* Desktop/tablet: panel con toolbar + tabla */}
        <article className="panel hidden md:block">
          <div className="flex flex-wrap items-center gap-2 p-4 pb-3 xl:p-5 xl:pb-3.5">
            <label className="group flex h-10 min-w-[160px] flex-1 items-center gap-2.5 rounded-xl border border-line bg-white/[0.03] px-3.5 text-muted transition focus-within:border-lime/45 focus-within:bg-white/[0.05] xl:max-w-[380px]">
              <Search className="size-4 shrink-0 transition group-focus-within:text-lime" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setQuery("")}
                placeholder="Buscar por nombre, DNI, #socio o celular"
                className="min-w-0 flex-1 bg-transparent text-[13.5px] text-fg placeholder:text-muted focus:outline-none"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} aria-label="Borrar búsqueda" className="grid size-5 place-items-center rounded-full bg-white/10 text-fg-2 hover:bg-white/20">
                  <X className="size-3" />
                </button>
              ) : (
                <Kbd>/</Kbd>
              )}
            </label>
            <FilterMenu
              label="Plan"
              icon={Layers}
              value={f.plans}
              onChange={(v) => setF({ ...f, plans: v })}
              options={PLANS.map((p) => ({ value: p, label: p, color: PLAN_COLOR[p], hint: money(PLAN_PRICE[p]), count: count((r) => r.plan === p) }))}
            />
            <FilterMenu
              label="Sede"
              icon={MapPin}
              value={f.branches}
              onChange={(v) => setF({ ...f, branches: v })}
              options={BRANCHES.map((b) => ({ value: b, label: b, count: count((r) => r.branch === b) }))}
            />
            <FilterMenu
              label="Estado"
              icon={CircleDot}
              value={f.statuses}
              onChange={(v) => setF({ ...f, statuses: v as MemberStatus[] })}
              options={(Object.keys(STATUS_META) as MemberStatus[]).map((s) => ({
                value: s,
                label: STATUS_META[s].label,
                color: `var(--color-${STATUS_META[s].tone})`,
                count: count((r) => r.status === s),
              }))}
            />
            <FilterMenu
              label="Asistencia"
              icon={Activity}
              align="right"
              value={f.att}
              onChange={(v) => setF({ ...f, att: v as Filters["att"] })}
              options={ATT_BUCKETS.map((a) => ({ value: a.key, label: a.label, hint: a.hint, count: count((r) => r.status !== "congelado" && attBucket(r.attendance) === a.key) }))}
            />
            <span className="ml-auto hidden items-center gap-1.5 text-[12px] font-semibold text-muted 2xl:flex">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-lime" />
                <span className="relative size-1.5 rounded-full bg-lime" />
              </span>
              Sincronizado 08:52
            </span>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3 xl:px-5">
              <span className="mr-1 text-[12px] font-semibold text-muted">
                <b className="font-extrabold text-fg tabular">{filtered.length}</b> {filtered.length === 1 ? "coincidencia" : "coincidencias"}
              </span>
              {chips.map(({ key, ...c }) => (
                <ActiveChip key={key} {...c} />
              ))}
              <button type="button" onClick={clearAll} className="ml-1 text-[12px] font-bold text-lime hover:underline">
                Limpiar todo
              </button>
            </div>
          )}

          {filtered.length ? (
            <div className="overflow-x-auto">
              <MembersTable
                rows={filtered}
                q={q}
                sort={sort}
                onSort={(k) => setSort((s) => (s.key === k ? { key: k, dir: (s.dir * -1) as 1 | -1 } : { key: k, dir: k === "att" || k === "debt" ? -1 : 1 }))}
                selected={selected}
                onToggle={toggle}
                onToggleAll={toggleAll}
                fresh={fresh}
                actions={actions}
              />
            </div>
          ) : (
            <Empty q={q} onClear={clearAll} />
          )}

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-[12px] text-muted">
            <span>
              {anyFilter ? (
                <>
                  <b className="text-fg-2 tabular">{filtered.length}</b> en esta página · <b className="text-fg-2 tabular">{fmt(total)}</b> en {segMeta ? `“${segMeta.label}”` : "el padrón"}
                </>
              ) : (
                <>
                  Mostrando <b className="text-fg-2 tabular">1–{filtered.length}</b> de <b className="text-fg-2 tabular">{fmt(PADRON_TOTAL)}</b> socios
                </>
              )}
            </span>
            <Pager pages={Math.ceil(total / PAGE_SIZE)} />
          </footer>
        </article>

        {/* Mobile: tarjetas */}
        <div className="md:hidden">
          {filtered.length ? (
            <>
              <p className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-faint">
                <ChevronLeft className="size-3.5" /> Deslizá una tarjeta para cobrar o escribir
              </p>
              <MemberCards rows={filtered} q={q} selected={selected} onToggle={toggle} fresh={fresh} actions={actions} />
              <p className="mt-4 text-center text-[12px] text-muted">
                {fmt(filtered.length)} de {fmt(total)} ·{" "}
                <button type="button" className="font-bold text-lime">
                  Cargar más
                </button>
              </p>
            </>
          ) : (
            <div className="panel">
              <Empty q={q} onClear={clearAll} />
            </div>
          )}
        </div>
      </section>

      <BulkBar
        count={selected.size}
        debt={selDebt}
        onClear={() => setSelected(new Set())}
        onExport={() => exportRows(selRows, "seleccion")}
        onRemind={() => {
          notify({
            tone: "emerald",
            title: `Recordatorio enviado a ${selected.size} ${selected.size === 1 ? "socio" : "socios"}`,
            detail: selDebt > 0 ? `WhatsApp + email · ${money(selDebt)} a cobrar` : "WhatsApp + email · plantilla “Vencimiento”",
          });
          setSelected(new Set());
        }}
        onPlan={(p) => {
          setRows((rs) => rs.map((r) => (selected.has(r.id) ? { ...r, plan: p, amount: r.status === "congelado" ? 0 : PLAN_PRICE[p] } : r)));
          notify({ title: `${selected.size} ${selected.size === 1 ? "socio pasó" : "socios pasaron"} a ${p}`, detail: `Rige desde la próxima cuota · ${money(PLAN_PRICE[p])}` });
          setSelected(new Set());
        }}
      />

      <FilterSheet open={sheet?.kind === "filters"} onClose={() => setSheet(null)} value={f} onChange={setF} onClear={() => setF(EMPTY)} results={filtered.length} />
      <ChargeSheet row={sheet?.kind === "charge" ? sheetRow : null} onClose={() => setSheet(null)} onConfirm={confirmCharge} />
      <PeekSheet
        row={sheet?.kind === "peek" ? sheetRow : null}
        onClose={() => setSheet(null)}
        onCharge={(r) => setSheet({ kind: "charge", id: r.id })}
        onMessage={actions.onMessage}
      />
      <NewMemberSheet open={sheet?.kind === "new"} onClose={() => setSheet(null)} onCreate={createMember} />
      {/* Alta rápida (mobile) */}
      <button
        type="button"
        onClick={() => setSheet({ kind: "new" })}
        aria-label="Nuevo socio"
        className={cn(
          "fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-30 grid size-14 place-items-center rounded-2xl bg-lime text-lime-ink shadow-[0_14px_40px_-8px_rgb(181_245_74/0.6)] transition active:scale-95 sm:hidden",
          selected.size > 0 && "pointer-events-none translate-y-24 opacity-0",
        )}
      >
        <Plus className="size-6" strokeWidth={2.6} />
      </button>
      <Toast msg={toast} lifted={selected.size > 0} />
    </>
  );
}

function ActiveChip({ label, color, onRemove }: { label: string; color?: string; onRemove: () => void }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line-strong bg-white/[0.04] pl-2.5 pr-1 text-[12px] font-semibold text-fg-2 animate-fade-in">
      {color && <span className="size-1.5 rounded-full" style={{ background: color }} />}
      {label}
      <button type="button" onClick={onRemove} aria-label={`Quitar filtro ${label}`} className="grid size-5 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-fg">
        <X className="size-3" />
      </button>
    </span>
  );
}

function Empty({ q, onClear }: { q: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl border border-line bg-white/[0.03] text-muted">
        <SearchX className="size-6" />
      </span>
      <p className="mt-4 text-[16px] font-bold text-fg">{q.trim() ? `Sin coincidencias para “${q.trim()}”` : "Ningún socio con esos filtros"}</p>
      <p className="mt-1 max-w-[340px] text-[13px] text-muted">Probá con el DNI o el número de socio, o quitá algún filtro.</p>
      <div className="mt-5 flex gap-2">
        <Button variant="secondary" size="sm" onClick={onClear}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}

function Pager({ pages }: { pages: number }) {
  return (
    <nav className="flex items-center gap-1" aria-label="Paginación">
      <button type="button" disabled className="grid size-8 place-items-center rounded-lg text-faint" aria-label="Página anterior">
        <ChevronLeft className="size-4" />
      </button>
      {[1, 2, 3].filter((p) => p <= pages).map((p) => (
        <button
          key={p}
          type="button"
          className={cn("grid h-8 min-w-8 place-items-center rounded-lg px-2 text-[12.5px] font-bold tabular transition", p === 1 ? "bg-surface-3 text-fg" : "text-muted hover:bg-white/5 hover:text-fg")}
          aria-current={p === 1 ? "page" : undefined}
        >
          {p}
        </button>
      ))}
      {pages > 4 && <span className="px-1 text-faint">…</span>}
      {pages > 3 && (
        <button type="button" className="grid h-8 min-w-8 place-items-center rounded-lg px-2 text-[12.5px] font-bold text-muted tabular hover:bg-white/5 hover:text-fg">
          {pages}
        </button>
      )}
      <button type="button" className="grid size-8 place-items-center rounded-lg text-fg-2 hover:bg-white/5" aria-label="Página siguiente">
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

/* Encabezado: conteo del padrón + acciones principales. */
function Header({ onNew, onExport, onImport }: { onNew: () => void; onExport: () => void; onImport: () => void }) {
  return (
    <PageHeader
      eyebrow={
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-lime/25 bg-lime/[0.08] py-1 pl-2 pr-2.5 font-bold text-lime">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime" />
              <span className="relative size-2 rounded-full bg-lime" />
            </span>
            86 en el gym ahora
          </span>
          <span>3 sedes · actualizado 08:52</span>
        </span>
      }
      title={
        <span className="inline-flex items-baseline gap-3">
          Socios
          <span className="text-[18px] font-bold tracking-[-0.02em] text-muted tabular sm:text-[20px]">{fmt(PADRON_TOTAL)}</span>
        </span>
      }
    >
      <Button variant="ghost" onClick={onImport} className="max-xl:hidden">
        <Upload className="size-4" /> Importar
      </Button>
      <Button variant="secondary" onClick={onExport} aria-label="Exportar" className="max-sm:hidden">
        <Download className="size-4" /> Exportar
      </Button>
      <Button onClick={onNew} className="max-sm:hidden">
        <Plus className="size-4" strokeWidth={2.6} /> Nuevo socio
      </Button>
    </PageHeader>
  );
}
