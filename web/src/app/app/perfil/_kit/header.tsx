import Link from "next/link";
import { ChevronLeft, MoreHorizontal } from "lucide-react";

const round = "grid size-[52px] place-items-center rounded-full bg-white/[0.05] ring-1 ring-white/8 transition hover:bg-white/10 active:scale-95";

/** Encabezado de pantalla interna del portal: volver · título · acción (mismo patrón que /app/stats). */
export function AppHeader({
  title,
  sub,
  back = "/app",
  action,
}: {
  title: string;
  sub?: string;
  back?: string;
  action?: { icon: React.ComponentType<{ className?: string }>; label: string; onClick?: () => void; dot?: boolean };
}) {
  const Icon = action?.icon ?? MoreHorizontal;
  return (
    <header className="stagger flex items-center justify-between">
      <Link href={back} className={round} aria-label="Volver">
        <ChevronLeft className="size-5 text-fg" />
      </Link>
      <div className="text-center">
        <h1 className="text-[19px] font-extrabold tracking-[-0.02em] text-fg">{title}</h1>
        {sub && <p className="text-[13px] font-medium text-muted">{sub}</p>}
      </div>
      <button onClick={action?.onClick} className={`relative ${round}`} aria-label={action?.label ?? "Más opciones"}>
        <Icon className="size-5 text-fg" />
        {action?.dot && <span className="absolute right-3.5 top-3.5 size-2 rounded-full bg-lime" />}
      </button>
    </header>
  );
}

export const si = (i: number) => ({ "--i": i }) as React.CSSProperties;
