import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { face } from "@/lib/photos";

/* ── Button ─────────────────────────────────────────────────── */
type ButtonVariant = "primary" | "secondary" | "ghost" | "outline-lime" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantCls: Record<ButtonVariant, string> = {
  primary:
    "bg-lime text-lime-ink font-bold shadow-[0_8px_30px_-8px_rgb(181_245_74/0.55)] hover:bg-[#c4fa66] hover:shadow-[0_10px_36px_-6px_rgb(181_245_74/0.7)]",
  secondary: "bg-surface-2 text-fg border border-line-strong hover:bg-surface-3",
  ghost: "text-fg-2 hover:text-fg hover:bg-white/5",
  "outline-lime": "border border-lime/50 text-lime hover:bg-lime/10",
  danger: "bg-rose/15 text-rose border border-rose/30 hover:bg-rose/25",
};
const sizeCls: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] rounded-[10px] gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-[15px] rounded-[14px] gap-2",
  icon: "size-10 rounded-xl",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
    variantCls[variant],
    sizeCls[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

/* ── Pill / Badge ───────────────────────────────────────────── */
export type Tone = "lime" | "violet" | "cyan" | "amber" | "rose" | "neutral";
const toneCls: Record<Tone, string> = {
  lime: "bg-lime/12 text-lime ring-lime/25",
  violet: "bg-violet/12 text-violet ring-violet/25",
  cyan: "bg-cyan/12 text-cyan ring-cyan/25",
  amber: "bg-amber/12 text-amber ring-amber/25",
  rose: "bg-rose/12 text-rose ring-rose/25",
  neutral: "bg-white/6 text-fg-2 ring-white/10",
};

export function Pill({
  tone = "neutral",
  dot,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset whitespace-nowrap",
        toneCls[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ── Delta (tendencia) ──────────────────────────────────────── */
export function Delta({ value, className, solid }: { value: number; className?: string; solid?: boolean }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-0.5 rounded-full text-[12px] font-bold",
        solid ? "px-2 py-0.5" : "",
        up ? (solid ? "bg-lime text-lime-ink" : "text-lime") : solid ? "bg-rose text-white" : "text-rose",
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.6} />
      {Math.abs(value).toLocaleString("es-AR", { maximumFractionDigits: 1 })}%
    </span>
  );
}

/* ── Avatar ─────────────────────────────────────────────────── */
export function Avatar({
  i,
  size = 36,
  ring,
  className,
  alt = "",
  eager,
}: {
  i: number;
  eager?: boolean;
  size?: number;
  ring?: boolean;
  className?: string;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={face(i, size * 2)}
      alt={alt}
      width={size}
      height={size}
      loading={eager ? "eager" : "lazy"}
      className={cn(
        "shrink-0 rounded-full object-cover bg-surface-3",
        ring && "ring-2 ring-ink outline outline-1 outline-lime/60",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}

export function AvatarStack({ ids, size = 28, extra }: { ids: number[]; size?: number; extra?: number }) {
  return (
    <div className="flex items-center">
      {ids.map((id, k) => (
        <Avatar key={k} i={id} size={size} className="-ml-2 first:ml-0 ring-2 ring-surface" />
      ))}
      {extra ? (
        <span
          className="-ml-2 grid place-items-center rounded-full bg-lime text-[10px] font-extrabold text-lime-ink ring-2 ring-surface"
          style={{ width: size, height: size }}
        >
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

/* ── Sparkline (SVG puro) ───────────────────────────────────── */
export function Sparkline({
  data,
  color = "var(--color-lime)",
  className,
  fill = true,
  height = 40,
}: {
  data: number[];
  color?: string;
  className?: string;
  fill?: boolean;
  height?: number;
}) {
  const w = 120;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - 4 - ((d - min) / (max - min || 1)) * (h - 8)]);
  const line = pts
    .map((p, i) => {
      if (i === 0) return `M${p[0]},${p[1]}`;
      const prev = pts[i - 1];
      const cx = (prev[0] + p[0]) / 2;
      return `C${cx},${prev[1]} ${cx},${p[1]} ${p[0]},${p[1]}`;
    })
    .join(" ");
  const id = `sg-${color.replace(/[^a-z]/gi, "")}-${data.length}-${data[0]}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("w-full", className)} style={{ height }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={pts.at(-1)![0]} cy={pts.at(-1)![1]} r="3" fill={color} />
    </svg>
  );
}

/* ── Anillo de progreso ─────────────────────────────────────── */
export function Ring({
  value,
  size = 120,
  stroke = 12,
  color = "var(--color-lime)",
  track = "rgb(255 255 255 / 0.07)",
  children,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)", filter: size >= 80 ? `drop-shadow(0 0 8px ${color})` : undefined }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/* ── Encabezado de sección ─────────────────────────────────── */
export function SectionTitle({
  title,
  hint,
  action,
  className,
}: {
  title: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">{title}</h3>
        {hint && <p className="mt-0.5 text-[12.5px] text-muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-line-strong bg-white/5 px-1.5 py-0.5 font-sans text-[10.5px] font-semibold text-muted">
      {children}
    </kbd>
  );
}
