"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock4, Hourglass, Percent, Ticket, X } from "lucide-react";
import { Avatar, AvatarStack, Delta, Ring, Sparkline } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { Agenda, DayPills } from "./agenda";
import {
  CLASSES,
  COACH,
  COACHES,
  DAY_SHORT,
  DISCIPLINES,
  DISCIPLINE_LIST,
  MONTHS,
  NOW,
  ROOMS,
  dateOf,
  hhmm,
  type ClassItem,
  type CoachId,
  type Discipline,
} from "./data";
import { DetailPanel, type ClassStatus } from "./detail";

const START = 7 * 60;
const END = 22 * 60;
const HOUR = 64; // px por hora
const HOURS = Array.from({ length: (END - START) / 60 + 1 }, (_, i) => START / 60 + i);

type View = "Día" | "Semana" | "Mes";

/** Clases de una semana: las futuras tienen menos reservas, las pasadas quedan como están. */
function weekClasses(offset: number): ClassItem[] {
  if (offset <= 0) return CLASSES;
  const f = Math.max(0.25, 1 - offset * 0.3);
  return CLASSES.map((c) => {
    const enrolled = Math.max(2, Math.round(c.enrolled * f));
    return { ...c, enrolled, waitlist: enrolled >= c.cap ? c.waitlist : 0 };
  });
}

export function ClassCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<View>("Semana");
  const [discs, setDiscs] = useState<Discipline[]>([]);
  const [coach, setCoach] = useState<CoachId | "">("");
  const [room, setRoom] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    // Por defecto: la clase en curso o, si no hay, la próxima de hoy.
    const next = CLASSES.filter((c) => c.day === NOW.day && c.start + c.dur > NOW.min).sort((a, b) => a.start - b.start)[0];
    return next?.id ?? null;
  });
  const [sheet, setSheet] = useState(false);
  const [agendaDay, setAgendaDay] = useState(NOW.day);

  const all = useMemo(() => weekClasses(weekOffset), [weekOffset]);
  const items = all.filter(
    (c) => (!discs.length || discs.includes(c.discipline)) && (!coach || c.coach === coach) && (!room || c.room === room),
  );
  const selected = all.find((c) => c.id === selectedId) ?? null;

  const statusOf = (c: ClassItem): ClassStatus => {
    if (weekOffset < 0) return "past";
    if (weekOffset > 0) return "next";
    const t = c.day * 1440;
    const now = NOW.day * 1440 + NOW.min;
    if (t + c.start + c.dur <= now) return "past";
    if (t + c.start <= now) return "live";
    return "next";
  };

  const select = (c: ClassItem) => {
    setSelectedId(c.id);
    setSheet(true);
  };

  const first = dateOf(weekOffset, 0);
  const last = dateOf(weekOffset, 6);
  const range =
    first.m === last.m
      ? `${first.d} – ${last.d} ${MONTHS[last.m]} ${last.y}`
      : `${first.d} ${MONTHS[first.m]} – ${last.d} ${MONTHS[last.m]} ${last.y}`;

  /* KPIs */
  const occ = items.length ? Math.round((items.reduce((a, c) => a + c.enrolled / c.cap, 0) / items.length) * 100) : 0;
  const today = items.filter((c) => c.day === (weekOffset === 0 ? NOW.day : agendaDay));
  const nextToday = today.filter((c) => statusOf(c) === "next").sort((a, b) => a.start - b.start)[0];
  const liveToday = today.filter((c) => statusOf(c) === "live").length;
  const waitTotal = items.reduce((a, c) => a + c.waitlist, 0);
  const fullCount = items.filter((c) => c.enrolled >= c.cap).length;
  const perDay = DAY_SHORT.map((_, d) => items.filter((c) => c.day === d).reduce((a, c) => a + c.enrolled, 0));
  const reservations = perDay.reduce((a, b) => a + b, 0);
  const counts = DAY_SHORT.map((_, d) => items.filter((c) => c.day === d).length);

  const filtersActive = discs.length > 0 || !!coach || !!room;

  return (
    <>
      {/* ── KPIs ─────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <article className="panel glow-lime stagger flex items-center gap-4 p-4 sm:p-5" style={{ "--i": 1 } as React.CSSProperties}>
          <Ring value={occ} size={64} stroke={7} className="hidden shrink-0 sm:grid">
            <Percent className="size-4 text-lime" />
          </Ring>
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-fg-2">Ocupación promedio</p>
            <p className="mt-1 text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">{occ}%</p>
            <p className="mt-1.5 flex flex-wrap items-center gap-1 text-[11.5px] text-muted">
              <Delta value={4.2} /> vs. sem. anterior
            </p>
          </div>
        </article>

        <article className="panel stagger p-4 sm:p-5" style={{ "--i": 2 } as React.CSSProperties}>
          <div className="flex items-start justify-between">
            <p className="text-[12.5px] font-semibold text-fg-2">{weekOffset === 0 ? "Clases hoy" : "Clases del día"}</p>
            <span className="grid size-8 place-items-center rounded-lg bg-violet/14 text-violet">
              <CalendarDays className="size-4" />
            </span>
          </div>
          <p className="mt-1 text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">
            {today.length}
            {liveToday > 0 && <span className="ml-2 align-middle text-[11.5px] font-bold tracking-normal text-rose">● {liveToday} en curso</span>}
          </p>
          <p className="mt-1.5 truncate text-[11.5px] text-muted">
            {nextToday ? (
              <>
                Próxima: <b className="text-fg-2">{nextToday.discipline}</b> {hhmm(nextToday.start)}
              </>
            ) : (
              "Sin clases pendientes"
            )}
          </p>
        </article>

        <article className="panel stagger p-4 sm:p-5" style={{ "--i": 3 } as React.CSSProperties}>
          <div className="flex items-start justify-between">
            <p className="text-[12.5px] font-semibold text-fg-2">Lista de espera</p>
            <span className="grid size-8 place-items-center rounded-lg bg-amber/14 text-amber">
              <Hourglass className="size-4" />
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <p className="text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">{waitTotal}</p>
            {waitTotal > 0 && (
              <span className="hidden sm:block">
                <AvatarStack ids={[5, 8, 11]} size={24} />
              </span>
            )}
          </div>
          <p className="mt-1.5 truncate text-[11.5px] text-muted">
            en <b className="text-amber">{fullCount} clases completas</b>
          </p>
        </article>

        <article className="panel stagger p-4 sm:p-5" style={{ "--i": 4 } as React.CSSProperties}>
          <div className="flex items-start justify-between">
            <p className="text-[12.5px] font-semibold text-fg-2">Reservas semana</p>
            <span className="grid size-8 place-items-center rounded-lg bg-cyan/14 text-cyan">
              <Ticket className="size-4" />
            </span>
          </div>
          <p className="mt-1 text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">{reservations.toLocaleString("es-AR")}</p>
          <Sparkline data={perDay.some(Boolean) ? perDay : [0, 1]} color="var(--color-cyan)" height={22} fill={false} className="mt-2 opacity-90" />
        </article>
      </section>

      {/* ── Toolbar ─────────────────────────────── */}
      <section className="stagger mt-4 space-y-3" style={{ "--i": 5 } as React.CSSProperties}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center justify-between rounded-xl border border-line bg-white/[0.02] p-1 sm:flex-none">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="grid size-8 place-items-center rounded-lg text-fg-2 transition hover:bg-white/5 hover:text-fg"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-2 text-center text-[13px] font-bold text-fg tabular sm:min-w-[150px]">{range}</span>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="grid size-8 place-items-center rounded-lg text-fg-2 transition hover:bg-white/5 hover:text-fg"
              aria-label="Semana siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <button
            onClick={() => {
              setWeekOffset(0);
              setAgendaDay(NOW.day);
            }}
            className={cn(
              "h-10 rounded-xl border px-3 text-[12.5px] font-bold transition",
              weekOffset === 0 ? "border-lime/30 bg-lime/10 text-lime" : "border-line text-fg-2 hover:bg-white/5",
            )}
          >
            Hoy
          </button>
          <div className="flex w-full rounded-xl border border-line bg-white/[0.02] p-1 text-[12.5px] font-semibold sm:w-auto">
            {(["Día", "Semana", "Mes"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn("relative flex-1 rounded-lg px-3 py-1.5 transition", view === v ? "text-fg" : "text-muted hover:text-fg")}
              >
                {view === v && (
                  <motion.span layoutId="view-pill" className="absolute inset-0 rounded-lg bg-surface-3 shadow" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className="relative">{v}</span>
              </button>
            ))}
          </div>
          {/* Tablet: selects compactos que se ajustan al contenido para no partir la barra en dos filas */}
          <div className="ml-auto hidden items-center gap-1.5 sm:flex xl:hidden">
            <Select value={coach} onChange={(v) => setCoach(v as CoachId | "")} label="Coach" compact>
              <option value="">Coach</option>
              {COACHES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select value={room} onChange={setRoom} label="Sala" compact>
              <option value="">Sala</option>
              {ROOMS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <div className="ml-auto hidden items-center gap-1.5 xl:flex">
            <Select value={coach} onChange={(v) => setCoach(v as CoachId | "")} label="Coach">
              <option value="">Todos los coaches</option>
              {COACHES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select value={room} onChange={setRoom} label="Sala">
              <option value="">Todas las salas</option>
              {ROOMS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
          <span className="mr-1 hidden text-[11px] font-bold uppercase tracking-[0.12em] text-faint sm:inline">Disciplinas</span>
          {DISCIPLINE_LIST.map((d) => {
            const on = discs.includes(d);
            const c = DISCIPLINES[d].color;
            const n = all.filter((x) => x.discipline === d).length;
            return (
              <button
                key={d}
                onClick={() => setDiscs((s) => (on ? s.filter((x) => x !== d) : [...s, d]))}
                className={cn(
                  "flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold ring-1 ring-inset transition-all",
                  on ? "text-ink ring-transparent" : "bg-white/[0.03] text-fg-2 ring-line hover:bg-white/[0.07]",
                )}
                style={on ? { background: c, boxShadow: `0 8px 22px -10px ${c}` } : undefined}
              >
                <span className="size-2 rounded-full" style={{ background: on ? "var(--color-ink)" : c }} />
                {d}
                <span className={cn("text-[10.5px] font-bold tabular", on ? "text-ink/60" : "text-faint")}>{n}</span>
              </button>
            );
          })}
          <span className="flex items-center gap-1.5 sm:hidden">
            <Select value={coach} onChange={(v) => setCoach(v as CoachId | "")} label="Coach" compact>
              <option value="">Coach</option>
              {COACHES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select value={room} onChange={setRoom} label="Sala" compact>
              <option value="">Sala</option>
              {ROOMS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </span>
          {filtersActive && (
            <button
              onClick={() => {
                setDiscs([]);
                setCoach("");
                setRoom("");
              }}
              className="flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-[12px] font-semibold text-muted hover:text-fg"
            >
              <X className="size-3.5" /> Limpiar filtros
            </button>
          )}
          <span className="ml-auto hidden items-center gap-3 text-[11.5px] font-semibold text-muted xl:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded-full bg-lime" /> Ahora
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-rose">●</span> En curso
            </span>
          </span>
        </div>
      </section>

      {/* ── Cuerpo ───────────────────────────────── */}
      <section className="stagger mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_304px]" style={{ "--i": 6 } as React.CSSProperties}>
        <div className="min-w-0">
          {/* Mobile: agenda por día (también vista Día) */}
          <div className={cn(view === "Semana" || view === "Mes" ? "md:hidden" : "")} style={{ "--i": 6 } as React.CSSProperties}>
            <div className="sm:rounded-2xl sm:border sm:border-line sm:bg-surface sm:p-4">
              <DayPills day={agendaDay} setDay={setAgendaDay} weekOffset={weekOffset} counts={counts} />
            </div>
            <div className="mt-4">
              <Agenda
                day={agendaDay}
                weekOffset={weekOffset}
                items={items}
                statusOf={statusOf}
                selectedId={selectedId}
                onSelect={select}
              />
            </div>
          </div>

          {view === "Semana" && (
            <div className="hidden md:block">
              <WeekGrid weekOffset={weekOffset} items={items} statusOf={statusOf} selectedId={selectedId} onSelect={select} />
            </div>
          )}
          {view === "Mes" && (
            <div className="hidden md:block">
              <MonthGrid
                onPick={(d) => {
                  setAgendaDay(d);
                  setView("Día");
                }}
                items={items}
              />
            </div>
          )}
        </div>

        {/* Detalle lateral (desktop ancho) */}
        <aside className="panel hidden overflow-hidden xl:sticky xl:top-[96px] xl:block xl:max-h-[calc(100dvh-112px)] xl:overflow-y-auto" style={{ "--i": 7 } as React.CSSProperties}>
          <AnimatePresence mode="wait" initial={false}>
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <DetailPanel c={selected} weekOffset={weekOffset} status={statusOf(selected)} />
              </motion.div>
            ) : (
              <div className="grid h-80 place-items-center p-6 text-center text-[13px] text-muted">Elegí una clase para ver el detalle.</div>
            )}
          </AnimatePresence>
        </aside>
      </section>

      {/* Hoja de detalle (mobile / tablet) */}
      <AnimatePresence>
        {sheet && selected && (
          <motion.div className="fixed inset-0 z-50 xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSheet(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl border border-line bg-surface md:inset-y-3 md:left-auto md:right-3 md:max-h-none md:w-[380px] md:rounded-3xl"
            >
              <DetailPanel c={selected} weekOffset={weekOffset} status={statusOf(selected)} onClose={() => setSheet(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Select({
  value,
  onChange,
  label,
  compact,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "relative flex h-8 shrink-0 items-center rounded-full ring-1 ring-inset transition",
        value ? "bg-lime/10 text-lime ring-lime/30" : "bg-white/[0.03] text-fg-2 ring-line hover:bg-white/[0.07]",
      )}
    >
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-full cursor-pointer appearance-none bg-transparent pl-3 pr-7 text-[12px] font-semibold focus:outline-none [&>option]:bg-surface-2 [&>option]:text-fg",
          compact && "[field-sizing:content]",
        )}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 opacity-70" />
    </label>
  );
}

/* ── Grilla semanal ─────────────────────────────── */
function WeekGrid({
  weekOffset,
  items,
  statusOf,
  selectedId,
  onSelect,
}: {
  weekOffset: number;
  items: ClassItem[];
  statusOf: (c: ClassItem) => ClassStatus;
  selectedId: string | null;
  onSelect: (c: ClassItem) => void;
}) {
  const nowTop = ((NOW.min - START) / 60) * HOUR;
  const showNow = weekOffset === 0 && NOW.min >= START && NOW.min <= END;

  return (
    <div className="panel overflow-hidden" style={{ "--i": 6 } as React.CSSProperties}>
      {/* Encabezado de días */}
      <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] border-b border-line">
        <div className="grid place-items-center text-faint">
          <Clock4 className="size-4" />
        </div>
        {DAY_SHORT.map((d, i) => {
          const date = dateOf(weekOffset, i);
          const isToday = weekOffset === 0 && i === NOW.day;
          const dayItems = items.filter((c) => c.day === i);
          return (
            <div key={d} className={cn("relative min-w-0 border-l border-line px-1.5 py-3 min-[90rem]:px-2", isToday && "bg-lime/[0.04]")}>
              {isToday && <span className="absolute inset-x-0 top-0 h-[2px] bg-lime shadow-[0_0_12px_rgb(181_245_74/0.8)]" />}
              <div className="flex items-center gap-1.5 min-[90rem]:gap-2">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-[14px] font-extrabold tabular min-[90rem]:size-8 min-[90rem]:text-[15px]",
                    isToday ? "bg-lime text-lime-ink" : "text-fg",
                  )}
                >
                  {date.d}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className={cn("text-[12px] font-bold", isToday ? "text-lime" : "text-fg-2")}>{isToday ? "Hoy" : d}</p>
                  <p className="truncate text-[10.5px] font-semibold text-muted tabular">
                    {dayItems.length}
                    <span className="hidden xl:max-[90rem]:inline"> cl.</span>
                    <span className="xl:max-[90rem]:hidden"> {dayItems.length === 1 ? "clase" : "clases"}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cuerpo */}
      <div className="relative grid grid-cols-[44px_repeat(7,minmax(0,1fr))]" style={{ height: (END - START) / 60 * HOUR + 12 }}>
        {/* Horas */}
        <div className="relative">
          {HOURS.map((h, i) => (weekOffset === 0 && Math.abs(h * 60 - NOW.min) < 14 ? null :
            <span
              key={h}
              className="absolute right-2 -translate-y-1/2 text-[10.5px] font-semibold text-faint tabular"
              style={{ top: i * HOUR + 6 }}
            >
              {String(h).padStart(2, "0")}:00
            </span>
          ))}
        </div>

        {DAY_SHORT.map((d, day) => {
          const isToday = weekOffset === 0 && day === NOW.day;
          return (
            <div
              key={d}
              className={cn("relative border-l border-line", isToday ? "bg-lime/[0.025]" : day >= 5 && "bg-white/[0.012]")}
              style={{
                backgroundImage: `repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.045) 0 1px, transparent 1px ${HOUR / 2}px, rgb(255 255 255 / 0.02) ${HOUR / 2}px ${HOUR / 2 + 1}px, transparent ${HOUR / 2 + 1}px ${HOUR}px)`,
                backgroundPosition: "0 6px",
              }}
            >
              <AnimatePresence>
                {items
                  .filter((c) => c.day === day)
                  .map((c) => (
                    <ClassBlock key={c.id} c={c} status={statusOf(c)} selected={selectedId === c.id} onSelect={() => onSelect(c)} />
                  ))}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Línea de hora actual */}
        {showNow && (
          <div className="pointer-events-none absolute inset-x-0 z-10" style={{ top: nowTop + 6 }}>
            <div className="absolute left-[44px] right-0 h-px bg-lime/25" />
            <span className="absolute left-1 -translate-y-1/2 rounded-md bg-lime px-1 py-0.5 text-[10px] font-extrabold text-lime-ink tabular">
              {hhmm(NOW.min)}
            </span>
            <div
              className="absolute h-[2px] -translate-y-1/2 bg-lime shadow-[0_0_10px_rgb(181_245_74/0.9)]"
              style={{ left: `calc(44px + (100% - 44px) / 7 * ${NOW.day})`, width: `calc((100% - 44px) / 7)` }}
            >
              <span className="absolute -left-1 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-lime">
                <span className="absolute inset-0 animate-ping rounded-full bg-lime" />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClassBlock({
  c,
  status,
  selected,
  onSelect,
}: {
  c: ClassItem;
  status: ClassStatus;
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = DISCIPLINES[c.discipline];
  const coach = COACH[c.coach];
  const top = ((c.start - START) / 60) * HOUR + 6;
  const h = (c.dur / 60) * HOUR - 3;
  const full = c.enrolled >= c.cap;
  const tall = h >= 58;

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: status === "past" ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      onClick={onSelect}
      title={`${c.discipline} · ${c.title} · ${hhmm(c.start)} · ${coach.name} · ${c.enrolled}/${c.cap}`}
      className="group absolute inset-x-1 z-[1] overflow-hidden rounded-[10px] text-left transition-[box-shadow,filter] duration-200 hover:z-[2] hover:brightness-125"
      style={{
        top,
        height: h,
        background: `linear-gradient(180deg, color-mix(in oklab, ${meta.color} 22%, var(--color-surface-2)), color-mix(in oklab, ${meta.color} 10%, var(--color-surface)))`,
        boxShadow: selected
          ? `0 0 0 1.5px ${meta.color}, 0 10px 28px -10px ${meta.color}`
          : `inset 0 0 0 1px color-mix(in oklab, ${meta.color} 22%, transparent)`,
      }}
    >
      <span className="absolute inset-y-1 left-0 w-[3px] rounded-r-full" style={{ background: meta.color }} />
      <div className="flex h-full flex-col px-1.5 pb-2 pl-2.5 pt-1">
        <div className="flex items-center gap-1">
          <p className="min-w-0 flex-1 truncate text-[11px] font-extrabold leading-4 tracking-[-0.01em] text-fg">
            {/* Columnas angostas (tablet): "CrossTraining" se recorta, se abrevia a "Cross" */}
            <span className={c.discipline === "CrossTraining" ? "min-[90rem]:hidden" : "hidden"}>Cross</span>
            <span className={c.discipline === "CrossTraining" ? "hidden min-[90rem]:inline" : undefined}>{c.discipline}</span>
          </p>
          {status === "live" && <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-rose" />}
        </div>
        {tall && (
          <div className="flex items-center gap-1">
            <p className="min-w-0 flex-1 truncate text-[10.5px] font-medium leading-4 text-fg-2/75">{c.title}</p>
            <Avatar i={coach.face} size={16} className="ring-1 ring-ink/60" />
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-1 leading-4">
          <span className="text-[10.5px] font-bold text-fg-2 tabular">{hhmm(c.start)}</span>
          <span className={cn("truncate text-[10px] font-extrabold tabular", full ? "text-rose" : "text-fg-2/80")}>
            {c.enrolled}/{c.cap}
          </span>
        </div>
        <div className="absolute inset-x-2.5 bottom-1 h-[2px] overflow-hidden rounded-full bg-ink/40">
          <div className="h-full rounded-full" style={{ width: `${(c.enrolled / c.cap) * 100}%`, background: full ? "var(--color-rose)" : meta.color }} />
        </div>
      </div>
    </motion.button>
  );
}

/* ── Vista mensual (resumen) ───────────────────── */
function MonthGrid({ items, onPick }: { items: ClassItem[]; onPick: (weekday: number) => void }) {
  // Noviembre 2026: arranca domingo; grilla desde el lunes 26/10.
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = i - 5; // 6 => 1 nov
    return { n: d < 1 ? 31 + d : d, inMonth: d >= 1 && d <= 30, weekday: i % 7, today: d === 25 };
  });
  return (
    <div className="panel overflow-hidden" style={{ "--i": 6 } as React.CSSProperties}>
      <div className="grid grid-cols-7 border-b border-line">
        {DAY_SHORT.map((d) => (
          <p key={d} className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
            {d}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((c, i) => {
          const day = items.filter((x) => x.day === c.weekday);
          const occ = day.length ? Math.round((day.reduce((a, x) => a + x.enrolled / x.cap, 0) / day.length) * 100) : 0;
          return (
            <button
              key={i}
              onClick={() => onPick(c.weekday)}
              className={cn(
                "group flex min-h-[112px] flex-col gap-2 border-b border-l border-line p-2.5 text-left transition hover:bg-white/[0.03] [&:nth-child(7n+1)]:border-l-0",
                !c.inMonth && "opacity-35",
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("grid size-7 place-items-center rounded-full text-[13px] font-extrabold tabular", c.today ? "bg-lime text-lime-ink" : "text-fg")}>
                  {c.n}
                </span>
                {day.length > 0 && <span className="text-[10.5px] font-bold text-muted tabular">{occ}%</span>}
              </div>
              <div className="flex flex-wrap gap-1">
                {day.map((x) => (
                  <span key={x.id} className="h-1.5 w-3 rounded-full" style={{ background: DISCIPLINES[x.discipline].color }} />
                ))}
              </div>
              <span className="mt-auto text-[11px] font-semibold text-fg-2">{day.length} clases</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
