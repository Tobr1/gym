"use client";

import { useState, useSyncExternalStore } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Droplet, Dumbbell, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

type Point = { date: string; weight: number; fat: number; muscle: number };
type Key = "weight" | "fat" | "muscle";

const METRICS: { key: Key; label: string; short: string; unit: string; color: string; good: "up" | "down"; icon: typeof Scale }[] = [
  { key: "weight", label: "Peso", short: "Peso", unit: "kg", color: "#57D5F2", good: "down", icon: Scale },
  { key: "fat", label: "Grasa corporal", short: "Grasa", unit: "%", color: "#FFBE55", good: "down", icon: Droplet },
  { key: "muscle", label: "Masa muscular", short: "Músculo", unit: "kg", color: "#B5F54A", good: "up", icon: Dumbbell },
];

const dec = (n: number) => n.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const axis = { fill: "#7d8a9c", fontSize: 11, fontWeight: 600 };

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Composición corporal: selector de métrica + curva de las 8 evaluaciones con la meta. */
export function CompositionChart({ data, targets }: { data: Point[]; targets: Partial<Record<Key, number>> }) {
  const [sel, setSel] = useState<Key>("fat");
  const mounted = useMounted();
  const m = METRICS.find((x) => x.key === sel)!;
  const vals = data.map((d) => d[sel]);
  const target = targets[sel];
  const lo = Math.min(...vals, target ?? Infinity);
  const hi = Math.max(...vals, target ?? -Infinity);
  const pad = (hi - lo) * 0.25 || 1;

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {METRICS.map((x) => {
          const first = data[0][x.key];
          const last = data.at(-1)![x.key];
          const diff = last - first;
          const good = x.good === "down" ? diff < 0 : diff > 0;
          const on = x.key === sel;
          return (
            <button
              key={x.key}
              onClick={() => setSel(x.key)}
              aria-pressed={on}
              className={cn(
                "min-w-0 rounded-xl border p-2.5 text-left transition-all duration-200 sm:p-3.5",
                on ? "border-white/15 bg-white/[0.05]" : "border-line bg-white/[0.015] hover:border-line-strong",
              )}
              style={on ? { boxShadow: `inset 0 -2px 0 ${x.color}` } : undefined}
            >
              <p className="flex items-center gap-1.5 truncate text-[11.5px] font-semibold text-fg-2 sm:text-[12.5px]">
                <x.icon className="size-3.5 shrink-0" style={{ color: x.color }} />
                <span className="sm:hidden">{x.short}</span>
                <span className="hidden truncate sm:inline">{x.label}</span>
              </p>
              <p className="mt-1.5 text-[20px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular sm:text-[28px]">
                {dec(last)}
                <span className="ml-0.5 text-[11px] font-bold tracking-normal text-muted sm:text-[13px]">{x.unit}</span>
              </p>
              <p className={cn("mt-1.5 text-[11px] font-extrabold tabular sm:text-[11.5px]", good ? "text-lime" : "text-rose")}>
                {diff > 0 ? "+" : "−"}
                {dec(Math.abs(diff))} {x.unit}
                <span className="hidden font-semibold text-muted sm:inline"> desde jun</span>
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 h-[230px] sm:h-[260px]">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 8, left: -14, bottom: 0 }}>
              <defs>
                <linearGradient id={`evo-${sel}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={m.color} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={m.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={axis} axisLine={false} tickLine={false} dy={8} interval="preserveStartEnd" minTickGap={18} />
              <YAxis
                tick={axis}
                axisLine={false}
                tickLine={false}
                width={44}
                domain={[Math.floor(lo - pad), Math.ceil(hi + pad)]}
                tickFormatter={(v: number) => v.toLocaleString("es-AR")}
              />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.25)", strokeDasharray: "4 4" }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-xl border border-line-strong bg-ink/95 px-3 py-2 shadow-2xl backdrop-blur">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Evaluación · {label}</p>
                      <p className="mt-0.5 text-[14px] font-extrabold text-fg tabular">
                        {dec(Number(payload[0].value))} {m.unit}
                      </p>
                    </div>
                  ) : null
                }
              />
              {target !== undefined && (
                <ReferenceLine
                  y={target}
                  stroke="#9D84FF"
                  strokeDasharray="5 5"
                  label={{ value: `Meta ${dec(target)} ${m.unit}`, position: "insideTopRight", fill: "#9D84FF", fontSize: 11, fontWeight: 700 }}
                />
              )}
              <Area
                key={sel}
                type="monotone"
                dataKey={sel}
                stroke={m.color}
                strokeWidth={2.6}
                fill={`url(#evo-${sel})`}
                dot={{ r: 3.5, fill: "#0B1018", stroke: m.color, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: m.color, stroke: "#0B1018", strokeWidth: 3 }}
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
