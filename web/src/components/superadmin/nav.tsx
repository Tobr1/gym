"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BadgeDollarSign,
  Building2,
  Flag,
  LayoutGrid,
  LifeBuoy,
  Moon,
  ScrollText,
  Server,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { label: string; icon: LucideIcon; href: string; badge?: string };

const NAV: Item[] = [
  { label: "Centro de control", icon: LayoutGrid, href: "/superadmin" },
  { label: "Gimnasios", icon: Building2, href: "/superadmin/gimnasios", badge: "326" },
  { label: "Suscripciones", icon: BadgeDollarSign, href: "/superadmin/suscripciones" },
  { label: "Uso y métricas", icon: Activity, href: "#" },
  { label: "Funciones habilitadas", icon: Flag, href: "#", badge: "4" },
  { label: "Soporte", icon: LifeBuoy, href: "#", badge: "9" },
  { label: "Auditoría", icon: ScrollText, href: "#" },
];

const SYSTEM: Item[] = [
  { label: "Infraestructura", icon: Server, href: "#" },
  { label: "Configuración", icon: Settings, href: "#" },
];

function isActive(pathname: string, href: string) {
  if (href === "#") return false;
  if (href === "/superadmin") return pathname === "/superadmin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Título de la sección actual (para el header del layout). */
export function SuperAdminTitle({ className }: { className?: string }) {
  const pathname = usePathname();
  const item = [...NAV].reverse().find((n) => isActive(pathname, n.href));
  return <h1 className={className}>{item?.label ?? "Centro de control"}</h1>;
}

/**
 * Listas NAV + SISTEMA del Super Admin (mismo lenguaje que el sidebar del admin del gimnasio).
 * Se usa tanto en el sidebar del layout como dentro del drawer mobile; el ítem activo sale de la ruta.
 * Pensado para un contenedor con padding horizontal de 16px (p-4): el riel activo cae sobre el borde.
 */
export function SuperAdminNavLists({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <nav className="space-y-1">
        {NAV.map((n) => {
          const active = isActive(pathname, n.href);
          const cls = cn(
            "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-semibold transition-all",
            active ? "bg-gradient-to-r from-lime/[0.14] to-lime/[0.02] text-fg" : "text-fg-2 hover:bg-white/[0.04] hover:text-fg",
          );
          const inner = (
            <>
              {active && (
                <span className="absolute -left-4 top-2 bottom-2 w-[3px] rounded-r-full bg-lime shadow-[0_0_12px_2px_rgb(181_245_74/0.6)]" />
              )}
              <n.icon className={cn("size-[18px] transition-colors", active ? "text-lime" : "text-faint group-hover:text-fg-2")} />
              <span className="flex-1">{n.label}</span>
              {n.badge && <span className="rounded-md bg-emerald/15 px-1.5 py-0.5 text-[10.5px] font-bold text-emerald">{n.badge}</span>}
            </>
          );
          return n.href === "#" ? (
            <a key={n.label} href="#" onClick={onNavigate} className={cls}>
              {inner}
            </a>
          ) : (
            <Link key={n.label} href={n.href} onClick={onNavigate} className={cls} aria-current={active ? "page" : undefined}>
              {inner}
            </Link>
          );
        })}
      </nav>
      <p className="px-3 pb-2 pt-7 text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Sistema</p>
      <nav className="space-y-1">
        {SYSTEM.map((n) => (
          <a
            key={n.label}
            href={n.href}
            onClick={onNavigate}
            className="group flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-semibold text-fg-2 transition-all hover:bg-white/[0.04] hover:text-fg"
          >
            <n.icon className="size-[18px] text-faint transition-colors group-hover:text-fg-2" /> {n.label}
          </a>
        ))}
        <div className="flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-semibold text-fg-2">
          <Moon className="size-[18px] text-faint" /> <span className="flex-1">Modo oscuro</span>
          <span className="relative h-5 w-9 rounded-full bg-lime">
            <span className="absolute right-0.5 top-0.5 size-4 rounded-full bg-lime-ink" />
          </span>
        </div>
      </nav>
    </>
  );
}
