"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ChevronsLeft, ChevronsRight, Flame, Plus, Search, Trophy, X } from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import { cn, compactMoney, money } from "@/lib/utils";
import { EV_NEW_LEAD, LEADS, SELLERS, SOURCES, STAGES, type Lead, type SourceKey, type StageKey } from "../_data";
import { LeadCard, SOURCE_ICON } from "./lead-card";
import { NewLeadModal } from "./new-lead";

type Over = { stage: StageKey; index: number } | null;
type ToastMsg = { title: string; body: string; tone: "lime" | "rose" | "neutral" };
type Toast = (ToastMsg & { id: number }) | null;

const ORDER: StageKey[] = ["nuevo", "contactado", "prueba", "negociacion", "ganado"];

export function Board() {
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [q, setQ] = useState("");
  const [source, setSource] = useState<SourceKey | "all">("all");
  const [sellers, setSellers] = useState<number[]>([]);
  const [hotOnly, setHotOnly] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<Over>(null);
  const [lostOpen, setLostOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    const open = () => setModal(true);
    window.addEventListener(EV_NEW_LEAD, open);
    return () => window.removeEventListener(EV_NEW_LEAD, open);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter(
      (l) =>
        (source === "all" || l.source === source) &&
        (!sellers.length || sellers.includes(l.seller)) &&
        (!hotOnly || l.temp === "caliente") &&
        (!term || l.name.toLowerCase().includes(term) || l.plan.toLowerCase().includes(term)),
    );
  }, [leads, q, source, sellers, hotOnly]);

  const byStage = (k: StageKey) => visible.filter((l) => l.stage === k);
  const openValue = visible.filter((l) => l.stage !== "ganado" && l.stage !== "perdido").reduce((a, l) => a + l.value, 0);
  const filtersOn = source !== "all" || sellers.length > 0 || hotOnly || q !== "";

  function notify(t: ToastMsg) {
    setToast((prev) => ({ ...t, id: (prev?.id ?? 0) + 1 }));
  }

  function move(id: string, stage: StageKey, index?: number) {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    const rest = leads.filter((l) => l.id !== id);
    const updated: Lead = {
      ...lead,
      stage,
      fresh: false,
      ...(stage === "ganado" && lead.stage !== "ganado" ? { next: "Alta completada", due: "hoy", overdue: false } : {}),
      ...(stage === "perdido" && lead.stage !== "perdido" ? { next: "Descartado", due: "hoy", overdue: false } : {}),
    };
    const targets = visible.filter((l) => l.stage === stage && l.id !== id);
    const anchor = index !== undefined ? targets[index] : undefined;
    let at: number;
    if (anchor) at = rest.indexOf(anchor);
    else {
      const lastIdx = rest.map((l) => l.stage).lastIndexOf(stage);
      at = lastIdx === -1 ? rest.length : lastIdx + 1;
    }
    rest.splice(at, 0, updated);
    setLeads(rest);

    if (lead.stage !== stage) {
      if (stage === "ganado")
        notify({ tone: "lime", title: "¡Lead ganado!", body: `${lead.name} se suma con ${lead.plan} · ${money(lead.value)}` });
      else if (stage === "perdido") notify({ tone: "rose", title: "Lead perdido", body: `${lead.name} pasó a Perdido.` });
      else notify({ tone: "neutral", title: STAGES.find((s) => s.key === stage)!.label, body: `${lead.name} avanzó de etapa.` });
    }
  }

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    requestAnimationFrame(() => setDragId(id));
  }
  function onDragEnd() {
    setDragId(null);
    setOver(null);
  }
  function onDragOver(e: React.DragEvent<HTMLElement>, stage: StageKey) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const cards = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-card]:not([data-dragging])"));
    let index = cards.length;
    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) {
        index = i;
        break;
      }
    }
    if (!over || over.stage !== stage || over.index !== index) setOver({ stage, index });
  }
  function onDrop(e: React.DragEvent, stage: StageKey) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    if (id) move(id, stage, over?.stage === stage ? over.index : undefined);
    onDragEnd();
  }
  function onDragLeave(e: React.DragEvent<HTMLElement>, stage: StageKey) {
    if (!e.currentTarget.contains(e.relatedTarget as Node) && over?.stage === stage) setOver(null);
  }

  function create(l: Omit<Lead, "id">) {
    const id = `n${leads.length}-${l.name}`;
    setLeads((prev) => [{ ...l, id }, ...prev]);
    setModal(false);
    notify({ tone: "lime", title: "Lead creado", body: `${l.name} está en Nuevo contacto.` });
    setTimeout(() => setLeads((prev) => prev.map((x) => (x.id === id ? { ...x, fresh: false } : x))), 2400);
  }

  const dragLead = dragId ? leads.find((l) => l.id === dragId) : undefined;

  const renderColumn = (stageKey: StageKey) => {
    const st = STAGES.find((s) => s.key === stageKey)!;
    const items = byStage(stageKey);
    const total = items.reduce((a, l) => a + l.value, 0);
    const isOver = over?.stage === stageKey && !!dragId;
    const others = items.filter((l) => l.id !== dragId);
    const placeholderAt = isOver ? over!.index : -1;
    const share = openValue ? Math.min(100, (total / openValue) * 100) : 0;
    const won = stageKey === "ganado";
    const lost = stageKey === "perdido";

    return (
      <section
        key={stageKey}
        onDragOver={(e) => onDragOver(e, stageKey)}
        onDrop={(e) => onDrop(e, stageKey)}
        onDragLeave={(e) => onDragLeave(e, stageKey)}
        className={cn(
          "flex w-[min(292px,80vw)] shrink-0 snap-start flex-col rounded-2xl border p-1 transition-all duration-200 lg:w-auto lg:min-w-[204px] lg:flex-1",
          isOver ? "" : "border-line bg-white/[0.018]",
          won && !isOver && "border-lime/15 bg-[linear-gradient(180deg,rgb(181_245_74/0.05),transparent_40%)]",
        )}
        style={
          isOver
            ? { borderColor: `color-mix(in oklab, ${st.color} 55%, transparent)`, background: `color-mix(in oklab, ${st.color} 7%, transparent)`, boxShadow: `0 0 30px -14px ${st.color}` }
            : undefined
        }
      >
        {/* Encabezado de columna */}
        <header className="px-2 pb-2.5 pt-2">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ background: st.color, boxShadow: `0 0 10px ${st.color}` }} />
            <h3 className="min-w-0 flex-1 truncate text-[13px] font-bold text-fg">{st.label}</h3>
            <motion.span
              key={items.length}
              initial={{ scale: 1.35 }}
              animate={{ scale: 1 }}
              className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[11px] font-bold text-fg-2 tabular"
            >
              {items.length}
            </motion.span>
            {lost ? (
              <button onClick={() => setLostOpen(false)} className="grid size-6 place-items-center rounded-md text-muted hover:bg-white/5 hover:text-fg" aria-label="Contraer">
                <ChevronsLeft className="size-3.5" />
              </button>
            ) : stageKey === "nuevo" ? (
              <button onClick={() => setModal(true)} className="grid size-6 place-items-center rounded-md text-muted hover:bg-white/5 hover:text-lime" aria-label="Agregar lead">
                <Plus className="size-3.5" />
              </button>
            ) : null}
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <motion.p
              key={total}
              initial={{ opacity: 0.3, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("text-[15px] font-extrabold tracking-[-0.02em] tabular", won ? "text-lime" : "text-fg")}
            >
              {money(total)}
            </motion.p>
            {!won && !lost && <span className="text-[10.5px] font-semibold text-faint tabular">{Math.round(share)}%</span>}
            {won && <Trophy className="size-3.5 text-lime" />}
          </div>
          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: st.color }}
              initial={false}
              animate={{ width: won || lost ? "100%" : `${share}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </header>

        {/* Tarjetas */}
        <div className="flex min-h-[120px] flex-1 flex-col gap-2">
          {items.map((l) => {
            const idx = others.indexOf(l);
            return (
              <div key={l.id}>
                {idx === placeholderAt && idx !== -1 && <Placeholder color={st.color} />}
                <motion.div layout="position" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                  <LeadCard
                    lead={l}
                    dragging={l.id === dragId}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onAdvance={
                      ORDER.indexOf(stageKey) >= 0 && ORDER.indexOf(stageKey) < ORDER.length - 1
                        ? () => move(l.id, ORDER[ORDER.indexOf(stageKey) + 1])
                        : undefined
                    }
                  />
                </motion.div>
              </div>
            );
          })}
          {placeholderAt >= others.length && <Placeholder color={st.color} />}
          {!items.length && !isOver && (
            <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-line px-4 py-8 text-center text-[11.5px] text-faint">
              {filtersOn ? "Sin leads con estos filtros" : "Arrastrá un lead acá"}
            </div>
          )}
        </div>
      </section>
    );
  };

  const lost = byStage("perdido");
  const lostOver = over?.stage === "perdido" && !!dragId;

  return (
    <div className="stagger" style={{ "--i": 6 } as React.CSSProperties}>
      {/* Barra de filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center xl:flex-nowrap">
        <label className="flex h-10 items-center gap-2.5 rounded-xl border border-line bg-white/[0.03] px-3.5 text-muted transition focus-within:border-lime/40 md:w-[280px] md:shrink-0 xl:w-[210px]">
          <Search className="size-4 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar lead o plan…"
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-fg placeholder:text-muted focus:outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Limpiar búsqueda">
              <X className="size-3.5" />
            </button>
          )}
        </label>

        <div className="-mx-4 flex min-w-0 items-center gap-1.5 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0 md:order-last md:basis-full xl:order-none xl:basis-auto">
          <span className="mr-1 shrink-0 text-[11px] font-bold uppercase tracking-[0.1em] text-faint xl:hidden 2xl:inline">Fuente</span>
          {[{ key: "all" as const, label: "Todas", color: "#EEF3F8" }, ...SOURCES].map((s) => {
            const on = source === s.key;
            const Icon = s.key === "all" ? null : SOURCE_ICON[s.key];
            const n = s.key === "all" ? leads.length : leads.filter((l) => l.source === s.key).length;
            return (
              <button
                key={s.key}
                onClick={() => setSource(s.key)}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-bold transition",
                  on ? "" : "border-line text-muted hover:border-line-strong hover:text-fg",
                )}
                style={on ? { color: s.color, borderColor: `color-mix(in oklab, ${s.color} 45%, transparent)`, background: `color-mix(in oklab, ${s.color} 11%, transparent)` } : undefined}
              >
                {Icon && <Icon className="size-3.5" />}
                {s.label}
                <span className="text-[10.5px] opacity-60 tabular xl:hidden 2xl:inline">{n}</span>
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3 md:ml-auto">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-faint xl:hidden 2xl:inline">Vendedor</span>
            <div className="flex shrink-0 items-center">
              {SELLERS.map((s) => {
                const on = sellers.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => setSellers((x) => (on ? x.filter((i) => i !== s.id) : [...x, s.id]))}
                    title={s.name}
                    className={cn("-ml-1.5 shrink-0 rounded-full transition first:ml-0 hover:z-10 hover:-translate-y-0.5", on && "z-10")}
                  >
                    <Avatar
                      i={s.face}
                      size={30}
                      className={cn("ring-2 transition", on ? "ring-lime" : "ring-ink", sellers.length && !on && "opacity-40")}
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => setHotOnly((h) => !h)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-bold transition",
              hotOnly ? "border-rose/45 bg-rose/12 text-rose" : "border-line text-muted hover:text-fg",
            )}
          >
            <Flame className="size-3.5" /> Calientes
          </button>
          {filtersOn && (
            <button
              onClick={() => {
                setQ("");
                setSource("all");
                setSellers([]);
                setHotOnly(false);
              }}
              className="text-[12px] font-bold text-lime hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tablero */}
      <div className="relative mt-4">
        <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 lg:snap-none">
          {ORDER.map(renderColumn)}

          {lostOpen ? (
            renderColumn("perdido")
          ) : (
            <button
              onClick={() => setLostOpen(true)}
              onDragOver={(e) => {
                e.preventDefault();
                if (over?.stage !== "perdido") setOver({ stage: "perdido", index: 0 });
              }}
              onDragLeave={() => over?.stage === "perdido" && setOver(null)}
              onDrop={(e) => onDrop(e, "perdido")}
              className={cn(
                "group flex w-[48px] shrink-0 snap-start flex-col items-center gap-3 rounded-2xl border py-3 transition-all",
                lostOver ? "border-rose/60 bg-rose/10 shadow-[0_0_30px_-12px_#ff5f7e]" : "border-line bg-white/[0.018] hover:border-line-strong hover:bg-white/[0.035]",
              )}
              aria-label="Ver leads perdidos"
            >
              <ChevronsRight className="size-4 text-muted transition group-hover:text-fg" />
              <span className="size-2 rounded-full bg-rose shadow-[0_0_10px_#ff5f7e]" />
              <span className="rounded-md bg-rose/12 px-1.5 py-0.5 text-[11px] font-bold text-rose tabular">{lost.length}</span>
              <span className="text-[12.5px] font-bold text-fg-2 [writing-mode:vertical-rl]">
                Perdido · {compactMoney(lost.reduce((a, l) => a + l.value, 0))}
              </span>
            </button>
          )}
        </div>

        {/* Pista de arrastre */}
        <AnimatePresence>
          {dragLead && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-line-strong bg-ink/90 px-4 py-2 text-[12.5px] font-semibold text-fg-2 shadow-2xl backdrop-blur"
            >
              Moviendo <b className="text-fg">{dragLead.name}</b> · soltá en una etapa
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NewLeadModal open={modal} onClose={() => setModal(false)} onCreate={create} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="fixed inset-x-4 bottom-5 z-[70] flex items-center gap-3 rounded-2xl border border-line-strong bg-surface-2/95 p-3 pr-4 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-6 sm:w-[360px]"
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl",
                toast.tone === "lime" ? "bg-lime text-lime-ink" : toast.tone === "rose" ? "bg-rose/15 text-rose" : "bg-white/[0.07] text-fg",
              )}
            >
              {toast.tone === "lime" ? <Trophy className="size-4" /> : toast.tone === "rose" ? <X className="size-4" /> : <ChevronsRight className="size-4" />}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-fg">{toast.title}</p>
              <p className="truncate text-[12px] text-muted">{toast.body}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Placeholder({ color }: { color: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 64 }}
      className="mb-2 rounded-xl border-2 border-dashed"
      style={{ borderColor: `color-mix(in oklab, ${color} 55%, transparent)`, background: `color-mix(in oklab, ${color} 8%, transparent)` }}
    />
  );
}
