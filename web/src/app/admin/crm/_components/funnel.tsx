import { cn } from "@/lib/utils";
import { FUNNEL } from "../_data";

const LIME = "#B5F54A";
/** Rampa de un solo tono: neutro creciente en etapas previas, lime solo en "Ganados". */
const tone = (i: number) => {
  const last = i === FUNNEL.length - 1;
  const a = 0.08 + (0.1 * i) / Math.max(1, FUNNEL.length - 2);
  return last ? { c: LIME, from: 0.85, to: 0.45 } : { c: "#FFFFFF", from: a + 0.03, to: a - 0.02 };
};

/** Embudo horizontal con transiciones suaves entre etapas (SVG puro). */
export function Funnel() {
  const W = 1000;
  const H = 150;
  const mid = H / 2;
  const max = FUNNEL[0].value;
  const seg = W / FUNNEL.length;
  const h = (v: number) => Math.max(18, (v / max) * (H - 6));

  return (
    <div>
      <div className="grid grid-cols-5">
        {FUNNEL.map((f, i) => {
          const prev = FUNNEL[i - 1];
          const conv = prev ? Math.round((f.value / prev.value) * 100) : 100;
          return (
            <div key={f.key} className="min-w-0 border-l border-line pl-2 first:border-l-0 first:pl-0 sm:pl-3">
              <p className="truncate text-[10.5px] font-semibold text-muted sm:text-[11.5px]"><span className="sm:hidden">{f.short}</span><span className="hidden sm:inline">{f.label}</span></p>
              <p className="mt-0.5 text-[18px] font-extrabold leading-tight tracking-[-0.03em] text-fg tabular sm:text-[22px]">{f.value}</p>
              <p className={cn("text-[10.5px] font-bold tabular sm:text-[11px]", i === FUNNEL.length - 1 ? "text-lime" : "text-muted")}>
                {i === 0 ? "100%" : `${conv}%`}<span className="hidden sm:inline">{i === 0 ? " base" : " avanza"}</span>
              </p>
            </div>
          );
        })}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-4 h-[92px] w-full sm:h-[124px]">
        <defs>
          {FUNNEL.map((f, i) => {
            const t = tone(i);
            return (
              <linearGradient key={f.key} id={`fn-${f.key}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={t.c} stopOpacity={t.from} />
                <stop offset="1" stopColor={t.c} stopOpacity={t.to} />
              </linearGradient>
            );
          })}
        </defs>
        {FUNNEL.map((f, i) => {
          const x0 = i * seg + (i ? 3 : 0);
          const x1 = (i + 1) * seg - 3;
          const h0 = h(f.value);
          const next = FUNNEL[i + 1];
          const h1 = next ? h(next.value) : h0;
          const flat = x0 + (x1 - x0) * 0.42;
          const c1 = flat + (x1 - flat) * 0.55;
          const d = [
            `M${x0},${mid - h0 / 2}`,
            `L${flat},${mid - h0 / 2}`,
            `C${c1},${mid - h0 / 2} ${c1},${mid - h1 / 2} ${x1},${mid - h1 / 2}`,
            `L${x1},${mid + h1 / 2}`,
            `C${c1},${mid + h1 / 2} ${c1},${mid + h0 / 2} ${flat},${mid + h0 / 2}`,
            `L${x0},${mid + h0 / 2}`,
            "Z",
          ].join(" ");
          return (
            <path
              key={f.key}
              d={d}
              fill={`url(#fn-${f.key})`}
              className="origin-left transition-opacity hover:opacity-80"
              style={{ animation: `fade-in .7s ease ${150 + i * 90}ms both` }}
            />
          );
        })}
        <line x1="0" x2={W} y1={mid} y2={mid} stroke="rgba(255,255,255,0.18)" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
