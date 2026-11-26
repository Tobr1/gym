"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axis = { fill: "#7d8a9c", fontSize: 11.5, fontWeight: 600 };

function ChartTooltip({
  active,
  payload,
  label,
  unit = "",
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line-strong bg-ink/95 px-3 py-2 shadow-2xl backdrop-blur">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-[13px] font-bold text-fg tabular">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.value.toLocaleString("es-AR")}
          {unit}
          <span className="font-medium text-muted">{p.name}</span>
        </p>
      ))}
    </div>
  );
}

/** Evita el desajuste de medidas en SSR: renderiza el gráfico ya montado. */
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function DualAreaChart({
  data,
  xKey,
  a,
  b,
  height = 260,
  labels = ["Esta semana", "Semana anterior"],
}: {
  data: Record<string, string | number>[];
  xKey: string;
  a: string;
  b: string;
  height?: number;
  labels?: [string, string];
}) {
  const mounted = useMounted();
  return (
    <div style={{ height }}>
      {mounted && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B5F54A" stopOpacity={0.38} />
                <stop offset="100%" stopColor="#B5F54A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9D84FF" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#9D84FF" stopOpacity={0} />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey={xKey} tick={axis} axisLine={false} tickLine={false} dy={8} />
            <YAxis tick={axis} axisLine={false} tickLine={false} />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "rgba(181,245,74,0.4)", strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey={b}
              name={labels[1]}
              stroke="#9D84FF"
              strokeWidth={2.2}
              fill="url(#gb)"
              dot={false}
              activeDot={{ r: 5, fill: "#9D84FF", stroke: "#0B1018", strokeWidth: 3 }}
              animationDuration={1100}
            />
            <Area
              type="monotone"
              dataKey={a}
              name={labels[0]}
              stroke="#B5F54A"
              strokeWidth={2.6}
              fill="url(#ga)"
              filter="url(#glow)"
              dot={{ r: 3.5, fill: "#0B1018", stroke: "#B5F54A", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#B5F54A", stroke: "#0B1018", strokeWidth: 3 }}
              animationDuration={1300}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function Donut({
  data,
  size = 170,
  thickness = 18,
  children,
}: {
  data: { name: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  children?: React.ReactNode;
}) {
  const mounted = useMounted();
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {mounted && (
        <PieChart width={size} height={size}>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={size / 2 - thickness}
            outerRadius={size / 2}
            paddingAngle={3}
            cornerRadius={6}
            stroke="none"
            startAngle={90}
            endAngle={-270}
            animationDuration={1100}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      )}
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
