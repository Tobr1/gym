"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, fmt } from "@/lib/utils";

const TABS = [
  { seg: "", label: "Resumen" },
  { seg: "/pagos", label: "Pagos", key: "pagos" },
  { seg: "/asistencia", label: "Asistencia", key: "asistencia" },
  { seg: "/rutina", label: "Rutina" },
  { seg: "/evolucion", label: "Evolución" },
  { seg: "/notas", label: "Notas", key: "notas" },
] as const;

export type TabCounts = { pagos: number; asistencia: number; notas: number; alert?: "pagos" };

/** Pestañas de la ficha: cada una es una ruta; la activa sale de la URL. */
export function ProfileTabs({ id, counts }: { id: string; counts: TabCounts }) {
  const pathname = usePathname();
  const base = `/admin/socios/${id}`;
  return (
    <div
      className="stagger sticky top-[64px] z-10 -mx-4 mt-4 border-b border-line bg-ink/80 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-[72px] lg:-mx-8 lg:px-8"
      style={{ "--i": 1 } as React.CSSProperties}
    >
      <nav className="no-scrollbar -mb-px flex gap-1 overflow-x-auto" aria-label="Secciones de la ficha">
        {TABS.map((t) => {
          const href = base + t.seg;
          const active = t.seg === "" ? pathname === base : pathname.startsWith(href);
          const count = "key" in t ? counts[t.key] : undefined;
          const alert = "key" in t && counts.alert === t.key;
          return (
            <Link
              key={t.label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-12 shrink-0 items-center gap-2 px-3.5 text-[13.5px] font-bold transition-colors",
                active ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {t.label}
              {count !== undefined && (
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10.5px] font-extrabold tabular",
                    alert ? "bg-rose/15 text-rose" : active ? "bg-lime/12 text-lime" : "bg-white/[0.06] text-muted",
                  )}
                >
                  {fmt(count)}
                </span>
              )}
              {active && (
                <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-lime shadow-[0_0_12px_1px_rgb(181_245_74/0.7)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
