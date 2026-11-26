"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NOV_FORECAST, REVENUE_12M } from "../_data";

const fmtM = (v: number) =>
  `$ ${v.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`;

/** Ancho de viewport "angosto" (teléfono). En SSR devuelve null: el gráfico se dibuja ya montado. */
const NARROW = "(max-width: 639px)";
function useNarrow() {
  return useSyncExternalStore<boolean | null>(
    (cb) => {
      const mq = window.matchMedia(NARROW);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(NARROW).matches,
    () => null,
  );
}

const DATA = REVENUE_12M.map((m) => ({
  ...m,
  // proyección al cierre: solo la porción que falta de noviembre
  forecast: m.current
    ? Number((NOV_FORECAST / 1_000_000 - m.value).toFixed(1))
    : 0,
}));

type Row = (typeof DATA)[number];

function RevenueTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Row }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="min-w-[200px] rounded-xl border border-line-strong bg-ink/95 px-3.5 py-3 shadow-2xl backdrop-blur">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">
        {d.label} {d.year}{" "}
        {d.current && <span className="text-lime">· al día 25</span>}
      </p>
      <p className="flex items-center justify-between gap-4 text-[13px] font-bold text-fg tabular">
        <span className="flex items-center gap-2 font-medium text-fg-2">
          <span className="size-2 rounded-sm bg-lime" /> Facturado
        </span>
        {fmtM(d.value)}
      </p>
      <p className="mt-1 flex items-center justify-between gap-4 text-[13px] font-bold text-fg tabular">
        <span className="flex items-center gap-2 font-medium text-fg-2">
          <span className="size-2 rounded-full bg-violet" /> Recurrente
        </span>
        {fmtM(d.recurring)}
      </p>
      <p className="mt-2 border-t border-line pt-2 text-[11.5px] text-muted tabular">
        {Math.round((d.recurring / d.value) * 100)}% del ingreso es recurrente
        {d.current && (
          <>
            <br />
            Proyección al cierre:{" "}
            <b className="text-fg">{fmtM(NOV_FORECAST / 1_000_000)}</b>
          </>
        )}
      </p>
    </div>
  );
}

/** Barras: total facturado por mes (los meses del período elegido, resaltados). Línea: ingreso recurrente. */
export function RevenueChart({
  height = 300,
  range,
}: {
  height?: number;
  range: [number, number];
}) {
  const narrow = useNarrow();
  // anima solo la primera vez: los redimensionados posteriores no vuelven a dibujar desde cero
  const [animate, setAnimate] = useState(true);
  const axis = {
    fill: "#7d8a9c",
    fontSize: narrow ? 10 : 11.5,
    fontWeight: 600,
  };
  return (
    <div style={{ height }} className="-mx-1">
      {narrow !== null && (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={DATA}
            margin={{ top: 12, right: 4, left: narrow ? -18 : -8, bottom: 0 }}
            barCategoryGap={narrow ? "16%" : "22%"}
          >
            <defs>
              <linearGradient id="rep-bar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.13} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="rep-bar-in" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B5F54A" stopOpacity={0.42} />
                <stop offset="100%" stopColor="#B5F54A" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="rep-bar-now" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C8FF6A" />
                <stop offset="100%" stopColor="#8FD62A" />
              </linearGradient>
              <pattern
                id="rep-forecast"
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="6" height="6" fill="rgb(181 245 74 / 0.08)" />
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="6"
                  stroke="rgb(181 245 74 / 0.55)"
                  strokeWidth="2"
                />
              </pattern>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="rgb(255 255 255 / 0.05)"
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="label"
              tick={axis}
              axisLine={false}
              tickLine={false}
              interval={0}
              tickMargin={10}
              tickFormatter={(v: string) => (narrow ? v.slice(0, 1) : v)}
            />
            <YAxis
              tick={axis}
              axisLine={false}
              tickLine={false}
              width={narrow ? 46 : 52}
              ticks={[0, 10, 20, 30, 40, 50]}
              domain={[0, 50]}
              tickFormatter={(v: number) =>
                v === 0 ? "0" : narrow ? `${v} M` : `$ ${v} M`
              }
            />
            <Tooltip
              content={<RevenueTooltip />}
              cursor={{ fill: "rgb(255 255 255 / 0.035)", radius: 8 }}
            />
            <Bar
              dataKey="value"
              stackId="r"
              radius={[6, 6, 3, 3]}
              maxBarSize={44}
              isAnimationActive={animate}
              animationDuration={900}
              onAnimationEnd={() => setAnimate(false)}
            >
              {DATA.map((d, i) => (
                <Cell
                  key={d.label + d.year}
                  fill={
                    d.current
                      ? "url(#rep-bar-now)"
                      : i >= range[0] && i <= range[1]
                        ? "url(#rep-bar-in)"
                        : "url(#rep-bar)"
                  }
                  style={{ transition: "fill .3s" }}
                />
              ))}
            </Bar>
            <Bar
              dataKey="forecast"
              stackId="r"
              radius={[6, 6, 0, 0]}
              maxBarSize={44}
              fill="url(#rep-forecast)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="recurring"
              stroke="var(--color-violet)"
              strokeWidth={2.4}
              dot={{
                r: narrow ? 2 : 2.6,
                fill: "#0b1018",
                stroke: "var(--color-violet)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5,
                fill: "var(--color-violet)",
                stroke: "#0b1018",
                strokeWidth: 2,
              }}
              isAnimationActive={animate}
              animationDuration={1100}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
