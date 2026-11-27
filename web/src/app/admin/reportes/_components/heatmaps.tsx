"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ATTENDANCE, CAPACITY, COHORTS, DAYS, HOURS } from "../_data";

/** Intensidad lima: t entre 0 y 1. */
const lime = (t: number) => `rgb(181 245 74 / ${(0.05 + t * 0.88).toFixed(3)})`;
const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const TODAY = 2; // miércoles 25/11
const hh = (h: number) => String(h).padStart(2, "0");

/* ── Retención por cohortes ─────────────────────────────────────── */
export function CohortHeatmap() {
  const months = Math.max(...COHORTS.map((c) => c.values.length)) - 1; // M1…M8 (M0 siempre es 100%)
  const cols = Array.from({ length: months }, (_, i) => i + 1);
  const avg = cols.map((m) => {
    const vs = COHORTS.map((c) => c.values[m]).filter(
      (v): v is number => v !== undefined,
    );
    return vs.length
      ? Math.round(vs.reduce((a, b) => a + b, 0) / vs.length)
      : undefined;
  });
  // escala 70–96%: lo que importa es la diferencia entre 75 y 90
  const tOf = (v: number) =>
    Math.pow(Math.max(0, Math.min(1, (v - 70) / 26)), 1.25);
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);

  return (
    <div className="min-w-0">
      <div
        className="grid gap-[3px] text-[11px] sm:gap-1"
        style={{
          gridTemplateColumns: `minmax(34px,auto) minmax(28px,auto) repeat(${months}, minmax(0,1fr))`,
        }}
        role="table"
        aria-label="Porcentaje de socios activos por cohorte de alta"
        onMouseLeave={() => setHover(null)}
      >
        <div role="row" className="contents">
          <span
            role="columnheader"
            className="pb-1 text-[10px] font-bold uppercase tracking-wider text-faint sm:px-1"
          >
            Alta
          </span>
          <span
            role="columnheader"
            className="pb-1 pr-1 text-right text-[10px] font-bold uppercase tracking-wider text-faint"
          >
            <span className="hidden sm:inline">Socios</span>
            <span className="sm:hidden">N</span>
          </span>
          {cols.map((m) => (
            <span
              key={m}
              role="columnheader"
              className={cn(
                "pb-1 text-center font-bold tabular transition-colors",
                hover?.c === m ? "text-fg" : "text-muted",
              )}
            >
              M{m}
            </span>
          ))}
        </div>

        {COHORTS.map((c, ri) => (
          <div role="row" key={c.label} className="contents">
            <span
              role="rowheader"
              className={cn(
                "flex items-center font-bold transition-colors sm:px-1",
                hover?.r === ri
                  ? "text-fg"
                  : ri === COHORTS.length - 1
                    ? "text-lime"
                    : "text-fg-2",
              )}
            >
              {c.label}
            </span>
            <span className="flex items-center justify-end pr-1 font-semibold text-faint tabular">
              {c.size}
            </span>
            {cols.map((m) => {
              const v = c.values[m];
              if (v === undefined)
                return (
                  <span
                    key={m}
                    role="cell"
                    className="h-7 rounded-md border border-dashed border-white/[0.05] sm:h-9"
                  />
                );
              const t = tOf(v);
              const on = hover?.r === ri && hover?.c === m;
              const dim = hover && hover.r !== ri && hover.c !== m;
              return (
                <span
                  key={m}
                  role="cell"
                  onMouseEnter={() => setHover({ r: ri, c: m })}
                  title={`Cohorte ${c.label}: ${v}% activos al mes ${m} (${Math.round((c.size * v) / 100)} de ${c.size})`}
                  className={cn(
                    "grid h-7 cursor-default place-items-center rounded-md font-bold tabular transition-all duration-200 sm:h-9 sm:text-[12px]",
                    t > 0.5 ? "text-lime-ink" : "text-fg-2",
                    on && "relative z-10 scale-110 ring-2 ring-fg/85",
                    dim && "opacity-40",
                  )}
                  style={{ background: lime(t) }}
                >
                  {v}
                </span>
              );
            })}
          </div>
        ))}

        <div role="row" className="contents">
          <span
            role="rowheader"
            className="mt-1 flex items-center border-t border-line pt-2 font-bold text-muted sm:px-1"
          >
            Prom.
          </span>
          <span className="mt-1 border-t border-line pt-2" />
          {avg.map((v, i) => (
            <span
              key={i}
              role="cell"
              className="mt-1 border-t border-line pt-2 text-center font-extrabold text-fg tabular"
            >
              {v ?? "—"}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[11.5px] text-muted">
        <span className="flex items-center gap-2 tabular">
          70%
          <span
            className="h-2 w-24 rounded-full sm:w-28"
            style={{
              background: `linear-gradient(90deg, ${lime(0.05)}, ${lime(0.5)}, ${lime(1)})`,
            }}
          />
          96%
        </span>
        <span>% de socios activos N meses después del alta</span>
      </div>
    </div>
  );
}

/* ── Asistencia: día × hora ─────────────────────────────────────── */
export function AttendanceHeatmap() {
  const max = Math.max(...ATTENDANCE.flat().map((v) => v ?? 0));
  const peak = (() => {
    let best = { d: 0, h: 0, v: -1 };
    ATTENDANCE.forEach((row, d) =>
      row.forEach((v, h) => v !== null && v > best.v && (best = { d, h, v })),
    );
    return best;
  })();
  const [hover, setHover] = useState<{ d: number; h: number } | null>(null);
  const cur = hover ?? peak;
  const value = ATTENDANCE[cur.d][cur.h] ?? 0;

  const cell = (d: number, h: number, className: string) => {
    const v = ATTENDANCE[d][h];
    if (v === null)
      return (
        <span
          key={`${d}-${h}`}
          title={`${DAY_NAMES[d]} ${hh(HOURS[h])} h: cerrado`}
          className={cn(
            "block rounded-[4px] bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.05)_0_2px,transparent_2px_6px)] sm:rounded-[5px]",
            className,
          )}
        />
      );
    const on = cur.d === d && cur.h === h;
    return (
      <button
        key={`${d}-${h}`}
        type="button"
        aria-label={`${DAY_NAMES[d]} ${hh(HOURS[h])} h: ${v} personas`}
        onMouseEnter={() => setHover({ d, h })}
        onFocus={() => setHover({ d, h })}
        className={cn(
          "block rounded-[4px] transition-transform duration-150 sm:rounded-[5px]",
          on && "relative z-10 scale-125 ring-2 ring-fg",
          className,
        )}
        style={{ background: lime(Math.pow(v / max, 1.2)) }}
      />
    );
  };

  return (
    <div className="min-w-0" onMouseLeave={() => setHover(null)}>
      {/* lectura del punto */}
      <div className="mb-3 flex min-h-[26px] flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px]">
        <span className="rounded-lg border border-line bg-white/[0.03] px-2.5 py-1 font-bold text-fg tabular">
          {DAY_NAMES[cur.d]} · {hh(HOURS[cur.h])}:00
        </span>
        <span className="text-muted">
          <b className="font-extrabold text-lime tabular">{value}</b> en sala ·{" "}
          {Math.round((value / CAPACITY) * 100)}% del aforo
          {!hover && <span className="text-fg-2"> · pico semanal</span>}
        </span>
      </div>

      {/* sm+: días en filas, horas en columnas */}
      <div className="hidden sm:block">
        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateColumns: `34px repeat(${HOURS.length}, minmax(0,1fr))`,
          }}
        >
          {DAYS.map((day, d) => (
            <div key={day} className="contents">
              <span
                className={cn(
                  "flex items-center text-[11.5px] font-bold",
                  cur.d === d
                    ? "text-fg"
                    : d === TODAY
                      ? "text-lime"
                      : "text-muted",
                )}
              >
                {day}
              </span>
              {HOURS.map((_, h) => cell(d, h, "h-7"))}
            </div>
          ))}
          <span />
          {HOURS.map((hr, h) => (
            <span
              key={hr}
              className={cn(
                "pt-1.5 text-center text-[10.5px] font-semibold tabular",
                cur.h === h ? "text-fg" : "text-faint",
                h % 2 === 1 && cur.h !== h && "max-xl:invisible",
              )}
            >
              {hh(hr)}
            </span>
          ))}
        </div>
      </div>

      {/* mobile: horas en filas, días en columnas (sin scroll lateral) */}
      <div className="sm:hidden">
        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateColumns: `26px repeat(${DAYS.length}, minmax(0,1fr))`,
          }}
        >
          <span />
          {DAYS.map((day, d) => (
            <span
              key={day}
              className={cn(
                "pb-1 text-center text-[11px] font-bold",
                cur.d === d
                  ? "text-fg"
                  : d === TODAY
                    ? "text-lime"
                    : "text-muted",
              )}
            >
              {day}
            </span>
          ))}
          {HOURS.map((hr, h) => (
            <div key={hr} className="contents">
              <span
                className={cn(
                  "flex items-center text-[10.5px] font-semibold tabular",
                  cur.h === h ? "text-fg" : "text-faint",
                )}
              >
                {hh(hr)}
              </span>
              {DAYS.map((_, d) => cell(d, h, "h-[17px]"))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[11.5px] text-muted">
        <span className="flex flex-wrap items-center gap-2">
          Tranquilo
          <span
            className="h-2 w-24 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${lime(0.05)}, ${lime(0.5)}, ${lime(1)})`,
            }}
          />
          Lleno
          <span className="ml-2 inline-block size-2.5 rounded-[3px] bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.12)_0_2px,transparent_2px_5px)] ring-1 ring-inset ring-white/10" />
          Cerrado
        </span>
        <span>Sede Centro · promedio de 4 semanas</span>
      </div>
    </div>
  );
}
