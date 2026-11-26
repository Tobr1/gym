"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarCheck2, Check, Clock, Hourglass, MapPin, Search, Sparkles, X } from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import {
  CLASSES,
  COACH,
  DAY_LONG,
  DAY_SHORT,
  DISCIPLINES,
  DISCIPLINE_LIST,
  MONTHS,
  NOW,
  dateOf,
  hhmm,
  type ClassItem,
  type Discipline,
} from "@/app/admin/clases/_components/data";
import { AppHeader, si } from "../perfil/_kit/header";
import { Toast } from "../perfil/_kit/overlay";
import { CLASS_BY_ID, INITIAL_BOOKINGS, phaseOf, startsIn, type BookingState } from "./_data";

const relDay = (day: number) => (day === NOW.day ? "Hoy" : day === NOW.day + 1 ? "Mañana" : `${DAY_SHORT[day]} ${dateOf(0, day).d}`);
const fullName = (c: ClassItem) => `${c.discipline} · ${c.title}`;

type ToastState = { title: string; detail: string; kind?: "ok" | "wait" | "cancel"; undo?: () => void } | null;

export function ClassBooking() {
  const [day, setDay] = useState(NOW.day);
  const [disc, setDisc] = useState<Discipline | null>(null);
  const [bookings, setBookings] = useState<Record<string, BookingState>>(INITIAL_BOOKINGS);
  const [fresh, setFresh] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const notify = (t: NonNullable<ToastState>) => {
    clearTimeout(timer.current);
    setToast(t);
    timer.current = setTimeout(() => setToast(null), 3400);
  };

  const list = useMemo(
    () => CLASSES.filter((c) => c.day === day && (!disc || c.discipline === disc)).sort((a, b) => a.start - b.start),
    [day, disc],
  );
  const nextOpen = list.find((c) => phaseOf(c) === "open")?.id;
  const openCount = CLASSES.filter((c) => c.day === day && phaseOf(c) === "open").length;

  const mine = Object.keys(bookings)
    .map((id) => CLASS_BY_ID[id])
    .sort((a, b) => a.day - b.day || a.start - b.start);
  const bookedDays = new Set(mine.map((c) => c.day));

  const book = (c: ClassItem) => {
    const full = c.enrolled >= c.cap;
    const state: BookingState = full ? { kind: "wait", pos: c.waitlist + 1 } : { kind: "booked" };
    setBookings((b) => ({ ...b, [c.id]: state }));
    setFresh(c.id);
    const undo = () => {
      setBookings((b) => {
        const n = { ...b };
        delete n[c.id];
        return n;
      });
      setToast(null);
    };
    notify(
      full
        ? { title: `Estás en lista de espera · #${c.waitlist + 1}`, detail: `Te avisamos si se libera un lugar en ${c.discipline}`, kind: "wait", undo }
        : { title: "¡Reserva confirmada!", detail: `${fullName(c)} · ${relDay(c.day)} ${hhmm(c.start)}`, undo },
    );
  };

  const cancel = (c: ClassItem) => {
    const prev = bookings[c.id];
    setBookings((b) => {
      const n = { ...b };
      delete n[c.id];
      return n;
    });
    setConfirm(null);
    notify({
      title: prev.kind === "wait" ? "Saliste de la lista de espera" : "Reserva cancelada",
      kind: "cancel",
      detail: `${fullName(c)} · ${relDay(c.day)} ${hhmm(c.start)}`,
      undo: () => {
        setBookings((b) => ({ ...b, [c.id]: prev }));
        setToast(null);
      },
    });
  };

  return (
    <div className="px-5 pb-4 pt-5 md:pt-1">
      <AppHeader title="Clases" sub="Iron Factory · Sede Centro" action={{ icon: Search, label: "Buscar clase" }} />

      {/* mis reservas */}
      <section className="stagger mt-5" style={si(1)}>
        <div className="flex items-baseline justify-between">
          <h2 className="text-[19px] font-extrabold tracking-[-0.02em] text-fg">
            Mis reservas <span className="ml-1 text-[15px] text-muted tabular">{mine.length}</span>
          </h2>
          <p className="text-[12px] font-semibold text-muted">Cancelá sin cargo hasta 2 h antes</p>
        </div>

        {mine.length === 0 ? (
          <div className="mt-3 flex items-center gap-3 rounded-[24px] border border-dashed border-white/12 p-4">
            <CalendarCheck2 className="size-6 text-muted" />
            <p className="text-[13px] font-medium text-muted">No tenés clases reservadas. Elegí una de la agenda.</p>
          </div>
        ) : (
          <div className="no-scrollbar -mx-5 -mb-3 mt-3 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-4">
            {mine.map((c, k) => {
              const st = bookings[c.id];
              const wait = st.kind === "wait";
              const first = k === 0 && !wait;
              const date = dateOf(0, c.day);
              const asking = confirm === c.id;
              return (
                <article
                  key={c.id}
                  className={cn(
                    "relative flex w-[290px] shrink-0 snap-start overflow-hidden rounded-[24px] border bg-surface",
                    first ? "border-lime/35 shadow-[0_18px_40px_-22px_rgb(181_245_74/0.55)]" : "border-line",
                    fresh === c.id && "animate-pop",
                  )}
                >
                  {/* talón con la fecha */}
                  <div
                    className={cn(
                      "flex w-[74px] shrink-0 flex-col items-center justify-center gap-0.5",
                      first ? "bg-lime text-lime-ink" : wait ? "bg-amber/10 text-amber" : "bg-white/[0.04] text-fg",
                    )}
                  >
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] opacity-70">{DAY_SHORT[c.day]}</span>
                    <span className="text-[30px] font-extrabold leading-none tracking-[-0.04em] tabular">{date.d}</span>
                    <span className="text-[11px] font-bold opacity-70">{MONTHS[date.m]}</span>
                  </div>
                  {/* troquel */}
                  <span className="absolute left-[74px] top-0 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
                  <span className="absolute bottom-0 left-[74px] size-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-ink" />

                  <div className="relative min-w-0 flex-1 border-l border-dashed border-white/12 p-3.5 pr-3">
                    {asking ? (
                      <div className="flex h-full flex-col justify-between">
                        <div>
                          <p className="text-[14px] font-extrabold text-fg">{wait ? "¿Salir de la espera?" : "¿Cancelar reserva?"}</p>
                          <p className="mt-0.5 text-[12px] text-muted">Se libera tu lugar para otro socio.</p>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => cancel(c)}
                            className="h-9 flex-1 rounded-full bg-rose/15 text-[12.5px] font-extrabold text-rose ring-1 ring-rose/30 active:scale-95"
                          >
                            Sí, cancelar
                          </button>
                          <button onClick={() => setConfirm(null)} className="h-9 flex-1 rounded-full bg-white/[0.06] text-[12.5px] font-bold text-fg active:scale-95">
                            Volver
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-[11.5px] font-extrabold uppercase tracking-[0.12em]",
                              wait ? "text-amber" : first ? "text-lime" : "text-muted",
                            )}
                          >
                            {wait ? `En espera #${st.pos} · ${hhmm(c.start)}` : `${relDay(c.day)} · ${hhmm(c.start)}`}
                          </p>
                          <button
                            onClick={() => setConfirm(c.id)}
                            className="-mr-1 -mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-white/[0.06] text-muted transition hover:text-fg"
                            aria-label={`Cancelar ${fullName(c)}`}
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                        <p className="mt-1 truncate text-[16px] font-extrabold tracking-[-0.01em] text-fg">{c.discipline}</p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] font-medium text-muted">
                          <MapPin className="size-3 shrink-0" /> {c.title} · {c.room}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <Avatar i={COACH[c.coach].face} size={24} />
                          <span className="truncate text-[12px] font-semibold text-fg-2">{COACH[c.coach].name}</span>
                        </div>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* semana */}
      <section className="stagger mt-6" style={si(2)}>
        <div className="flex items-baseline justify-between">
          <h2 className="text-[19px] font-extrabold tracking-[-0.02em] text-fg">Agenda</h2>
          <p className="text-[12.5px] font-semibold text-muted">23 – 29 nov</p>
        </div>
        <div className="mt-3 flex justify-between gap-1.5">
          {DAY_SHORT.map((d, i) => {
            const past = i < NOW.day;
            const on = day === i;
            return (
              <button
                key={d}
                disabled={past}
                onClick={() => setDay(i)}
                aria-pressed={on}
                className={cn(
                  "relative flex h-[70px] flex-1 flex-col items-center justify-center rounded-full border text-[13px] font-semibold transition-all duration-300",
                  on
                    ? "border-lime bg-lime text-lime-ink shadow-[0_8px_24px_-6px_rgb(181_245_74/0.6)]"
                    : past
                      ? "border-white/[0.05] text-faint"
                      : "border-white/12 text-muted hover:border-white/25",
                )}
              >
                {(bookedDays.has(i) || past) && (
                  <span
                    className={cn(
                      "absolute top-2 size-1.5 rounded-full",
                      past && "bg-lime/50",
                      bookedDays.has(i) && (on ? "ring-[1.5px] ring-lime-ink" : "ring-[1.5px] ring-lime"),
                    )}
                  />
                )}
                <span className="mt-1">{i === NOW.day ? "Hoy" : d}</span>
                <span className={cn("text-[15px] font-extrabold", on ? "" : past ? "" : "text-fg")}>{dateOf(0, i).d}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* disciplinas */}
      <div className="stagger no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5" style={si(3)}>
        {[null, ...DISCIPLINE_LIST].map((d) => {
          const on = disc === d;
          return (
            <button
              key={d ?? "all"}
              onClick={() => setDisc(d)}
              className={cn(
                "flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[14px] font-semibold transition-all",
                on ? "bg-lime text-lime-ink" : "bg-white/[0.06] text-fg hover:bg-white/10",
              )}
            >
              {d && <span className="size-2 rounded-full" style={{ background: on ? "currentColor" : DISCIPLINES[d].color }} />}
              {d ?? "Todas"}
            </button>
          );
        })}
      </div>

      {/* lista */}
      <section className="stagger mt-5" style={si(4)}>
        <p className="flex items-center justify-between text-[13px] font-semibold text-muted">
          <span>
            {DAY_LONG[day]} {dateOf(0, day).d} nov
          </span>
          <span>
            <span className="font-extrabold text-fg tabular">{openCount}</span> disponibles
          </span>
        </p>

        <div className="mt-3 space-y-2.5">
          {list.length === 0 && (
            <div className="grid place-items-center rounded-[24px] border border-dashed border-white/12 px-6 py-10 text-center">
              <Sparkles className="size-6 text-muted" />
              <p className="mt-2 text-[14px] font-bold text-fg">No hay {disc} este día</p>
              <button onClick={() => setDisc(null)} className="mt-3 h-9 rounded-full bg-white/[0.06] px-4 text-[12.5px] font-bold text-fg">
                Ver todas las clases
              </button>
            </div>
          )}

          {list.map((c, k) => {
            const ph = phaseOf(c);
            const st = bookings[c.id];
            const isNew = fresh === c.id;
            const enrolled = c.enrolled + (st?.kind === "booked" && !INITIAL_BOOKINGS[c.id] ? 1 : 0);
            const left = c.cap - enrolled;
            const full = left <= 0;
            const coach = COACH[c.coach];
            return (
              <article
                key={c.id}
                className={cn(
                  "group flex gap-3.5 rounded-[24px] bg-surface p-2.5 pr-3 transition-colors",
                  // la animación de entrada fija opacity: 1 en el artículo; atenuamos sus hijos
                  ph === "past" && "[&>*]:opacity-45",
                  st?.kind === "booked" && "ring-1 ring-lime/30",
                )}
                style={{ animation: `fade-up .5s cubic-bezier(.22,1,.36,1) ${k * 45}ms both` }}
              >
                <div className="relative w-[88px] shrink-0 overflow-hidden rounded-[18px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={DISCIPLINES[c.discipline].photo} alt="" className="photo-grade absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/5" />
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10.5px] font-bold text-white backdrop-blur">
                    <Clock className="size-2.5" />
                    {c.dur}′
                  </span>
                  <span className="absolute left-2 top-2 size-2 rounded-full ring-2 ring-black/30" style={{ background: DISCIPLINES[c.discipline].color }} />
                </div>

                <div className="min-w-0 flex-1 py-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[17px] font-extrabold tracking-[-0.02em] text-fg tabular">
                      {hhmm(c.start)}
                      <span className="ml-1 text-[12px] font-semibold text-muted">– {hhmm(c.start + c.dur)}</span>
                    </p>
                    {ph === "open" && c.id === nextOpen && day === NOW.day ? (
                      <span className="rounded-full bg-lime/12 px-2 py-0.5 text-[10.5px] font-extrabold text-lime">{startsIn(c)}</span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-[15px] font-extrabold text-fg">{fullName(c)}</p>
                  <p className="truncate text-[12px] font-medium text-muted">
                    {c.room} · {ph === "open" && full ? <span className="text-amber">{c.waitlist + (st?.kind === "wait" ? 1 : 0)} en lista de espera</span> : DISCIPLINES[c.discipline].level}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2">
                    <Avatar i={coach.face} size={26} className="ring-2 ring-surface" />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate text-[11.5px] font-bold text-fg-2">{coach.name.split(" ")[0]}</p>
                      {ph === "open" && (
                        <p className={cn("truncate text-[11px] font-semibold tabular", full ? "text-amber" : left <= 3 ? "text-amber" : "text-muted")}>
                          {full ? "Completa" : `${left} ${left === 1 ? "lugar" : "lugares"}`}
                        </p>
                      )}
                    </div>

                    {ph === "past" && <span className="text-[12px] font-bold text-muted">Finalizada</span>}
                    {ph === "live" && (
                      <span className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-[12px] font-bold text-fg">
                        <span className="relative flex size-2">
                          <span className="absolute inset-0 animate-ping rounded-full bg-lime opacity-60" />
                          <span className="relative size-2 rounded-full bg-lime" />
                        </span>
                        En curso
                      </span>
                    )}
                    {ph === "open" &&
                      (st?.kind === "booked" ? (
                        <span className={cn("flex h-9 items-center gap-1 rounded-full bg-lime/12 px-3.5 text-[12.5px] font-extrabold text-lime ring-1 ring-lime/30", isNew && "animate-pop")}>
                          <Check className="size-3.5" strokeWidth={3} /> Reservada
                        </span>
                      ) : st?.kind === "wait" ? (
                        <span className={cn("flex h-9 items-center gap-1 rounded-full bg-amber/12 px-3.5 text-[12.5px] font-extrabold text-amber ring-1 ring-amber/30", isNew && "animate-pop")}>
                          <Hourglass className="size-3.5" /> #{st.pos}
                        </span>
                      ) : full ? (
                        <button
                          onClick={() => book(c)}
                          className="h-9 shrink-0 rounded-full bg-white/[0.06] px-3.5 text-[12.5px] font-extrabold text-amber ring-1 ring-amber/30 transition active:scale-95"
                        >
                          Lista de espera
                        </button>
                      ) : (
                        <button
                          onClick={() => book(c)}
                          className="h-9 shrink-0 rounded-full bg-lime px-4 text-[12.5px] font-extrabold text-lime-ink shadow-[0_8px_20px_-8px_rgb(181_245_74/0.7)] transition hover:bg-[#c4fa66] active:scale-95"
                        >
                          Reservar
                        </button>
                      ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Toast
        show={!!toast}
        icon={
          toast?.kind === "wait" ? (
            <Hourglass className="size-5" />
          ) : toast?.kind === "cancel" ? (
            <X className="size-5" strokeWidth={3} />
          ) : (
            <Check className="size-5" strokeWidth={3} />
          )
        }
        title={toast?.title ?? ""}
        detail={toast?.detail}
        action={toast?.undo ? { label: "Deshacer", onClick: toast.undo } : undefined}
      />
    </div>
  );
}
