"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Building2, Check, Globe, LogOut, ShieldCheck, Smartphone, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewId = "admin" | "member" | "root";

export const DEMO_VIEWS: { id: ViewId | "site"; href: string; label: string; hint: string; icon: LucideIcon }[] = [
  { id: "admin", href: "/admin", label: "Panel del gimnasio", hint: "Dueños y recepción", icon: Building2 },
  { id: "member", href: "/app", label: "App del socio", hint: "Vista mobile", icon: Smartphone },
  { id: "root", href: "/superadmin", label: "Super Admin", hint: "Centro de control", icon: ShieldCheck },
  { id: "site", href: "/", label: "Sitio comercial", hint: "Landing pública", icon: Globe },
];

/**
 * Menú de cuenta: identidad del usuario, cambio de vista de la demo y cierre de sesión.
 * `children` es el disparador (avatar, nombre…).
 */
export function AccountMenu({
  current,
  name,
  role,
  email,
  children,
  className,
}: {
  current: ViewId;
  name: string;
  role: string;
  email: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  // se cierra solo al navegar: queda abierto únicamente para la ruta donde se abrió
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpenAt(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenAt(null);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpenAt(open ? null : pathname)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Cuenta y cambio de vista"
        className={cn(
          "flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition hover:bg-white/5",
          open && "bg-white/5",
        )}
      >
        {children}
      </button>

      <div
        role="menu"
        className={cn(
          "absolute right-0 top-[calc(100%+10px)] z-50 w-[290px] origin-top-right rounded-2xl border border-line-strong bg-surface-2/95 p-2 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl transition duration-200",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="px-3 pb-3 pt-2">
          <p className="truncate text-[14px] font-extrabold text-fg">{name}</p>
          <p className="truncate text-[12px] text-muted">
            {role} · {email}
          </p>
        </div>

        <div className="border-t border-line pt-2">
          <p className="px-3 pb-1.5 pt-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-faint">Ver la demo como</p>
          {DEMO_VIEWS.map((v) => {
            const here = v.id === current;
            return (
              <Link
                key={v.id}
                href={v.href}
                role="menuitem"
                tabIndex={open ? 0 : -1}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 transition",
                  here ? "bg-lime/[0.08]" : "hover:bg-white/[0.05]",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg",
                    here ? "bg-lime/15 text-lime" : "bg-white/[0.05] text-fg-2",
                  )}
                >
                  <v.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[13.5px] font-bold text-fg">{v.label}</span>
                  <span className="block text-[11.5px] text-muted">{v.hint}</span>
                </span>
                {here && <Check className="size-4 text-lime" strokeWidth={2.6} />}
              </Link>
            );
          })}
        </div>

        <div className="mt-2 border-t border-line pt-2">
          <Link
            href="/login"
            role="menuitem"
            tabIndex={open ? 0 : -1}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-bold text-rose transition hover:bg-rose/[0.08]"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-rose/10">
              <LogOut className="size-4" />
            </span>
            Cerrar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
