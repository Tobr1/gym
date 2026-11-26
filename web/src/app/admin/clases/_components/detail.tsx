"use client";

import { CalendarClock, ClipboardCheck, Clock3, DoorOpen, Flame, MoreHorizontal, Pencil, Signal, Star, X } from "lucide-react";
import { Avatar, AvatarStack, Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { COACH, DAY_LONG, DISCIPLINES, MEMBER_NAMES, MONTHS, dateOf, hhmm, type ClassItem } from "./data";

export type ClassStatus = "past" | "live" | "next";

export function DetailPanel({
  c,
  weekOffset,
  status,
  onClose,
}: {
  c: ClassItem;
  weekOffset: number;
  status: ClassStatus;
  onClose?: () => void;
}) {
  const meta = DISCIPLINES[c.discipline];
  const coach = COACH[c.coach];
  const date = dateOf(weekOffset, c.day);
  const seed = Number(c.id.slice(1));
  const members = Array.from({ length: c.enrolled }, (_, k) => {
    const idx = (seed * 7 + k * 5) % MEMBER_NAMES.length;
    return { name: MEMBER_NAMES[idx], face: idx % 15, checked: status !== "next" && (k * 13 + seed) % 7 !== 0 };
  });
  const wait = Array.from({ length: c.waitlist }, (_, k) => {
    const idx = (seed * 3 + k * 11 + 4) % MEMBER_NAMES.length;
    return { name: MEMBER_NAMES[idx], face: (idx + 2) % 15 };
  });
  const full = c.enrolled >= c.cap;
  const pct = Math.round((c.enrolled / c.cap) * 100);
  const checked = members.filter((m) => m.checked).length;

  return (
    <div className="flex h-full flex-col">
      {/* Cabecera con foto */}
      <div className="relative h-44 shrink-0 overflow-hidden">
        {/* brightness-110 en el contenedor: se suma a la gradación .photo-grade sin pisar su filter */}
        <div className="absolute inset-0 brightness-110">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={meta.photo} src={meta.photo} alt="" className="photo-grade size-full animate-fade-in object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
        <div
          className="absolute inset-0 opacity-60 mix-blend-soft-light"
          style={{ background: `linear-gradient(135deg, ${meta.color}, transparent 60%)` }}
        />
        <div className="absolute left-4 right-4 top-4 flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-ink"
            style={{ background: meta.color }}
          >
            {c.discipline}
          </span>
          {status === "live" && (
            <span className="flex items-center gap-1.5 rounded-full bg-ink/70 px-2.5 py-1 text-[10.5px] font-bold text-fg backdrop-blur">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-rose" />
                <span className="relative size-1.5 rounded-full bg-rose" />
              </span>
              En curso
            </span>
          )}
          <span className="ml-auto flex gap-1.5">
            <button className="grid size-8 place-items-center rounded-full bg-ink/60 text-fg backdrop-blur transition hover:bg-ink/80" aria-label="Más opciones">
              <MoreHorizontal className="size-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="grid size-8 place-items-center rounded-full bg-ink/60 text-fg backdrop-blur transition hover:bg-ink/80"
                aria-label="Cerrar detalle"
              >
                <X className="size-4" />
              </button>
            )}
          </span>
        </div>
        <div className="absolute inset-x-4 bottom-3">
          <h3 className="text-[22px] font-extrabold leading-none tracking-[-0.03em] text-fg">
            {c.discipline} <span className="text-fg-2">· {c.title}</span>
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-fg-2">
            <CalendarClock className="size-3.5" />
            {DAY_LONG[c.day]} {date.d} {MONTHS[date.m]} · {hhmm(c.start)} – {hhmm(c.start + c.dur)}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-5 p-4 sm:p-5">
        {/* Ocupación con mapa de lugares */}
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11.5px] font-semibold text-muted">Ocupación</p>
              <p className="mt-0.5 text-[28px] font-extrabold leading-none tracking-tight text-fg tabular">
                {c.enrolled}
                <span className="text-[15px] font-bold text-muted"> / {c.cap}</span>
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11.5px] font-bold ring-1 ring-inset",
                full ? "bg-rose/12 text-rose ring-rose/25" : pct > 80 ? "bg-amber/12 text-amber ring-amber/25" : "bg-lime/12 text-lime ring-lime/25",
              )}
            >
              {full ? "Completa" : `Quedan ${c.cap - c.enrolled} lugares`}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-[repeat(12,minmax(0,1fr))] gap-1">
            {Array.from({ length: c.cap }, (_, k) => (
              <span
                key={k}
                className="aspect-square rounded-[4px] transition-all"
                style={{
                  background: k < c.enrolled ? meta.color : "rgb(255 255 255 / 0.06)",
                  opacity: k < c.enrolled ? 1 - (k / c.cap) * 0.35 : 1,
                  animation: `pop .4s cubic-bezier(.34,1.56,.64,1) ${k * 18}ms both`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-2.5">
            <Avatar i={coach.face} size={38} ring />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-fg">{coach.name}</p>
              <p className="text-[11.5px] text-muted">Coach · {c.discipline}</p>
            </div>
            <span className="flex items-center gap-1 text-[12px] font-bold text-amber">
              <Star className="size-3.5 fill-amber" /> 4,9
            </span>
          </div>
          {[
            { icon: DoorOpen, k: "Sala", v: c.room },
            { icon: Clock3, k: "Duración", v: `${c.dur} min` },
            { icon: Signal, k: "Nivel", v: meta.level },
            { icon: Flame, k: "Gasto aprox.", v: meta.kcal },
          ].map((x) => (
            <div key={x.k} className="rounded-xl border border-line bg-white/[0.02] px-3 py-2">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                <x.icon className="size-3" /> {x.k}
              </p>
              <p className="mt-0.5 text-[13px] font-bold leading-tight text-balance text-fg">{x.v}</p>
            </div>
          ))}
        </div>

        {/* Inscriptos */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[13px] font-bold text-fg">
              Inscriptos <span className="text-muted tabular">· {c.enrolled}</span>
            </p>
            {status !== "next" ? (
              <span className="text-[11.5px] font-semibold text-lime tabular">{checked} presentes</span>
            ) : (
              <button className="text-[11.5px] font-bold text-lime hover:underline">Ver todos</button>
            )}
          </div>
          <ul className="space-y-1.5">
            {members.slice(0, 4).map((m, k) => (
              <li key={k} className="flex items-center gap-2.5">
                <Avatar i={m.face} size={28} />
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-fg-2">{m.name}</span>
                {status === "next" ? (
                  <span className="text-[11px] font-semibold text-muted">Confirmado</span>
                ) : m.checked ? (
                  <span className="rounded-md bg-lime/12 px-1.5 py-0.5 text-[10.5px] font-bold text-lime">Presente</span>
                ) : (
                  <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10.5px] font-bold text-muted">Ausente</span>
                )}
              </li>
            ))}
          </ul>
          {c.enrolled > 4 && (
            <div className="mt-2.5 flex items-center gap-2">
              <AvatarStack ids={members.slice(4, 9).map((m) => m.face)} size={24} extra={Math.max(0, c.enrolled - 9) || undefined} />
              <span className="text-[11.5px] text-muted">y {c.enrolled - 4} más</span>
            </div>
          )}
        </div>

        {/* Lista de espera */}
        <div className="rounded-xl border border-line bg-white/[0.02] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-bold text-fg">Lista de espera</p>
            <span className={cn("text-[11.5px] font-bold tabular", wait.length ? "text-amber" : "text-muted")}>
              {wait.length ? `${wait.length} en espera` : "Vacía"}
            </span>
          </div>
          {wait.length ? (
            <ul className="mt-2.5 space-y-2">
              {wait.slice(0, 3).map((w, k) => (
                <li key={k} className="flex items-center gap-2.5">
                  <span className="grid size-5 place-items-center rounded-md bg-amber/15 text-[10.5px] font-extrabold text-amber">{k + 1}</span>
                  <Avatar i={w.face} size={24} />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-fg-2">{w.name}</span>
                  <button className="rounded-md px-1.5 py-0.5 text-[11px] font-bold text-lime transition hover:bg-lime/10">Promover</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[12px] text-muted">Se activa automáticamente cuando la clase se completa.</p>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 grid shrink-0 grid-cols-[auto_1fr] gap-2 border-t border-line bg-surface/95 p-4 backdrop-blur-xl sm:px-5">
        {/* En el panel lateral (304 px) el botón queda solo con ícono para que "Tomar asistencia" respire */}
        <Button variant="secondary" title="Editar clase" className={onClose ? undefined : "w-10 px-0"}>
          <Pencil className="size-4" /> <span className={onClose ? undefined : "sr-only"}>Editar</span>
        </Button>
        <Button>
          <ClipboardCheck className="size-4" strokeWidth={2.4} /> Tomar asistencia
        </Button>
      </div>
    </div>
  );
}
