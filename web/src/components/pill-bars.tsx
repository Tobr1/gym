import { cn } from "@/lib/utils";

/** Barras “píldora” con pista de fondo, al estilo app deportiva. CSS puro. */
export function PillBars({
  data,
  height = 200,
  highlight,
  className,
  barClassName,
  showValue,
}: {
  data: { label: string; sub?: string; value: number }[];
  height?: number;
  highlight?: number;
  className?: string;
  barClassName?: string;
  showValue?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className={cn("flex items-end gap-2 sm:gap-3", className)}>
      {data.map((d, i) => {
        const on = highlight === undefined || highlight === i;
        return (
          <div key={i} className="group flex flex-1 flex-col items-center gap-2">
            <div
              className={cn("relative w-full max-w-[44px] overflow-hidden rounded-full bg-white/[0.06]", barClassName)}
              style={{ height }}
            >
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 rounded-full transition-all duration-500 group-hover:brightness-110",
                  on ? "bg-lime shadow-[0_0_24px_-4px_rgb(181_245_74/0.7)]" : "bg-white/[0.14]",
                )}
                style={{
                  height: `${(d.value / max) * 92}%`,
                  animation: `fade-up .8s cubic-bezier(.22,1,.36,1) ${i * 60}ms both`,
                }}
              >
                {showValue && (
                  <span className="absolute inset-x-0 top-2 text-center text-[10px] font-extrabold text-lime-ink">
                    {d.value}
                  </span>
                )}
              </div>
            </div>
            <div className="text-center leading-tight">
              <p className={cn("text-[12px] font-bold tabular", on && highlight !== undefined ? "text-lime" : "text-fg-2")}>
                {d.label}
              </p>
              {d.sub && <p className="text-[11px] text-muted">{d.sub}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
