import { PHOTO } from "@/lib/photos";
import { cn } from "@/lib/utils";
import { HEALTH_META, healthBand, initials, type TenantPlan } from "../../_data";

/** Mini medidor semicircular del índice de salud (0–100), con el número al lado. */
export function HealthGauge({
  value,
  size = 34,
  showLabel,
  className,
}: {
  value: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const meta = HEALTH_META[healthBand(value)];
  // arco de 180° con radio 15 en un viewBox 36×20 → longitud π·15 ≈ 47,1
  const len = Math.PI * 15;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 36 20" style={{ width: size, height: (size * 20) / 36 }} className="shrink-0 overflow-visible" aria-hidden>
        <path d="M3 18 A15 15 0 0 1 33 18" fill="none" stroke="rgb(255 255 255 / 0.09)" strokeWidth="4" strokeLinecap="round" />
        <path
          d="M3 18 A15 15 0 0 1 33 18"
          fill="none"
          stroke={meta.color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - value / 100)}
          style={{ filter: `drop-shadow(0 0 4px color-mix(in oklab, ${meta.color} 55%, transparent))` }}
        />
      </svg>
      <span className="leading-none">
        <span className="block text-[13px] font-extrabold text-fg tabular">{value}</span>
        {showLabel && <span className="mt-0.5 block text-[10.5px] font-semibold" style={{ color: meta.color }}>{meta.label}</span>}
      </span>
    </span>
  );
}

const PLAN_LOGO: Record<TenantPlan, string> = {
  Starter: "from-white/[0.10] to-white/[0.03] text-fg-2 ring-white/10",
  Pro: "from-violet/40 to-violet/10 text-violet ring-violet/30",
  Cadena: "from-cyan/35 to-cyan/10 text-cyan ring-cyan/30",
};

/** Isologo provisorio de la cuenta: iniciales sobre el color del plan (mismo lenguaje que el selector de sede del admin). */
export function TenantLogo({ name, plan, className }: { name: string; plan: TenantPlan; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-[12px] font-extrabold ring-1",
        PLAN_LOGO[plan],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function PlanTag({ plan }: { plan: TenantPlan }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-fg-2">
      <span
        className={cn(
          "size-1.5 rounded-full",
          plan === "Cadena" ? "bg-cyan" : plan === "Pro" ? "bg-violet" : "bg-white/40",
        )}
      />
      {plan}
    </span>
  );
}

const COVERS = [PHOTO.gymFloor, PHOTO.deadlift, PHOTO.ropes, PHOTO.barbell, PHOTO.row, PHOTO.classRopes, PHOTO.pullup, PHOTO.bench, PHOTO.machine, PHOTO.dumbbells];

/** Foto de portada de la cuenta (determinista por ID). Usar siempre con .photo-grade. */
export function tenantCover(id: string, w: number, h: number) {
  return COVERS[Number(id.slice(-3)) % COVERS.length](w, h);
}
