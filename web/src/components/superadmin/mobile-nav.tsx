"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { SuperAdminNavLists } from "./nav";

/** Botón de menú + drawer lateral del Super Admin para < lg (espejo del drawer del admin). */
export function SuperAdminMobileNav() {
  const pathname = usePathname();
  // el drawer se cierra solo al cambiar de ruta: queda abierto solo para la ruta donde se abrió
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (v: boolean) => setOpenAt(v ? pathname : null);
  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-fg-2 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={close}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-y-auto border-r border-line bg-ink-2 p-4 transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        inert={!open}
      >
        <button
          onClick={close}
          className="absolute right-3 top-5 grid size-9 place-items-center rounded-xl text-muted hover:bg-white/5"
          aria-label="Cerrar menú"
        >
          <X className="size-5" />
        </button>
        <div className="flex items-center gap-2 px-2 pb-6 pt-2">
          <Link href="/" onClick={close}>
            <Logo />
          </Link>
          <span className="rounded-md bg-lime/12 px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-[0.14em] text-lime">ROOT</span>
        </div>
        <SuperAdminNavLists onNavigate={close} />
      </aside>
    </>
  );
}
