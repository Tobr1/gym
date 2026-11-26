"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { DoorOpen } from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { COACH, DAY_LONG, DAY_SHORT, DISCIPLINES, MONTHS, NOW, dateOf, hhmm, type ClassItem } from "./data";
import type { ClassStatus } from "./detail";

export function DayPills({
  day,
  setDay,
  weekOffset,
  counts,
}: {
  day: number;
  setDay: (d: number) => void;
  weekOffset: number;
  counts: number[];
}) {
  return (
    <div className="flex justify-between gap-1.5 overflow-x-auto no-scrollbar sm:justify-start sm:gap-2">
      {DAY_SHORT.map((label, i) => {
        const on = i === day;
        const today = weekOffset === 0 && i === NOW.day;
        return (
          <button
            key={label}
            onClick={() => setDay(i)}
            className={cn(
              "relative flex h-[68px] min-w-0 max-w-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11.5px] font-semibold transition-colors sm:w-[52px] sm:flex-none",
              on ? "text-lime-ink" : "text-fg-2 ring-1 ring-inset ring-line-strong hover:bg-white/[0.04]",
            )}
          >
            {on && (
              <motion.span
                layoutId="agenda-day"
                className="absolute inset-0 rounded-full bg-lime shadow-[0_10px_30px_-10px_rgb(181_245_74/0.9)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className={cn("relative size-1 rounded-full", counts[i] ? (on ? "bg-lime-ink" : today ? "bg-lime" : "bg-fg-2/60") : "bg-transparent")} />
            <span className={cn("relative", on ? "text-lime-ink/75" : "text-muted")}>{label}</span>
            <span className="relative text-[15px] font-extrabold tabular">{dateOf(weekOffset, i).d}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Agenda({
  day,
  weekOffset,
  items,
  statusOf,
  selectedId,
  onSelect,
}: {
  day: number;
  weekOffset: number;
  items: ClassItem[];
  statusOf: (c: ClassItem) => ClassStatus;
  selectedId: string | null;
  onSelect: (c: ClassItem) => void;
}) {
  const list = items.filter((c) => c.day === day).sort((a, b) => a.start - b.start);
  const date = dateOf(weekOffset, day);
  const isToday = weekOffset === 0 && day === NOW.day;
  const nowIdx = isToday ? list.findIndex((c) => c.start > NOW.min) : -1;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-[17px] font-extrabold tracking-[-0.02em] text-fg">
          {isToday ? "Hoy" : DAY_LONG[day]} <span className="text-muted">· {date.d} {MONTHS[date.m]}</span>
        </h3>
        <span className="text-[12px] font-semibold text-muted tabular">{list.length} clases</span>
      </div>
      {list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-[13px] text-muted">
          No hay clases con estos filtros.
        </div>
      )}
      <ul className="space-y-2.5">
        {list.map((c, k) => {
          const meta = DISCIPLINES[c.discipline];
          const coach = COACH[c.coach];
          const st = statusOf(c);
          const full = c.enrolled >= c.cap;
          return (
            <Fragment key={c.id}>
              {k === nowIdx && <NowDivider />}
              <li className="stagger flex gap-3" style={{ "--i": k } as React.CSSProperties}>
                <div className="w-11 shrink-0 pt-2 text-right">
                  <p className={cn("text-[14px] font-extrabold tabular", st === "past" ? "text-muted" : "text-fg")}>{hhmm(c.start)}</p>
                  <p className="text-[11px] font-semibold text-faint tabular">{c.dur}′</p>
                </div>
                <button
                  onClick={() => onSelect(c)}
                  className={cn(
                    "group relative flex min-w-0 flex-1 overflow-hidden rounded-2xl border bg-surface text-left transition-all duration-200 hover:-translate-y-0.5",
                    selectedId === c.id ? "border-transparent" : "border-line hover:border-line-strong",
                    st === "past" && "opacity-55",
                  )}
                  style={selectedId === c.id ? { boxShadow: `0 0 0 1.5px ${meta.color}, 0 12px 30px -14px ${meta.color}` } : undefined}
                >
                  <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: meta.color }} />
                  <div className="min-w-0 flex-1 p-3 pl-4">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[14px] font-extrabold text-fg">{c.discipline}</p>
                      {st === "live" && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-rose/15 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase text-rose">
                          <span className="size-1 animate-pulse rounded-full bg-rose" /> En curso
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] text-muted">
                      {c.title} · <DoorOpen className="size-3" /> {c.room}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Avatar i={coach.face} size={22} />
                      <span className="truncate text-[11.5px] font-semibold text-fg-2">{coach.name.split(" ")[0]}</span>
                      <span className="ml-auto shrink-0">
                        {full ? (
                          <span className="rounded-full bg-rose/12 px-2 py-0.5 text-[10.5px] font-bold text-rose ring-1 ring-inset ring-rose/25">Completa</span>
                        ) : (
                          <span className="text-[11.5px] font-bold text-fg tabular">
                            {c.enrolled}
                            <span className="text-muted">/{c.cap}</span>
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full" style={{ width: `${(c.enrolled / c.cap) * 100}%`, background: meta.color }} />
                    </div>
                  </div>
                  <div className="relative w-20 shrink-0 overflow-hidden sm:w-28">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={meta.photo} alt="" loading="lazy" className="photo-grade absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-surface to-transparent" />
                  </div>
                </button>
              </li>
            </Fragment>
          );
        })}
        {isToday && nowIdx === -1 && list.length > 0 && <NowDivider />}
      </ul>
    </div>
  );
}

function NowDivider() {
  return (
    <li className="flex items-center gap-2 py-1">
      <span className="w-11 shrink-0 text-right text-[11px] font-extrabold text-lime tabular">{hhmm(NOW.min)}</span>
      <span className="relative flex size-2.5 shrink-0 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-lime/60" />
        <span className="relative size-2 rounded-full bg-lime" />
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-lime to-lime/0" />
      <span className="text-[10.5px] font-bold uppercase tracking-wider text-lime">Ahora</span>
    </li>
  );
}
