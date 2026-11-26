"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, ChevronsUpDown, Menu, Plus, Search, X, Zap } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Avatar, ButtonLink, Kbd } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "./nav";

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  const base = href.split("/").slice(0, 3).join("/");
  return pathname.startsWith(base);
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] items-center px-5">
        <Link href="/" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      {/* Selector de sede */}
      <button className="mx-3 mb-4 flex items-center gap-3 rounded-2xl border border-line bg-white/[0.02] p-2.5 text-left transition hover:bg-white/[0.04]">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet/40 to-violet/10 text-[13px] font-extrabold text-violet ring-1 ring-violet/30">
          IF
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold text-fg">Iron Factory</span>
          <span className="block truncate text-[11.5px] text-muted">Sede Centro · 3 sedes</span>
        </span>
        <ChevronsUpDown className="size-4 text-muted" />
      </button>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 no-scrollbar">
        {ADMIN_NAV.map((g) => (
          <div key={g.group}>
            <p className="px-3 pb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-faint">{g.group}</p>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(pathname, it.href);
                const Icon = it.icon;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={onNavigate}
                      className={cn(
                        "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-semibold transition-all",
                        active
                          ? "bg-gradient-to-r from-lime/[0.14] to-lime/[0.02] text-fg"
                          : "text-muted hover:bg-white/[0.04] hover:text-fg",
                      )}
                    >
                      {active && (
                        <span className="absolute -left-3 top-2 bottom-2 w-[3px] rounded-r-full bg-lime shadow-[0_0_12px_2px_rgb(181_245_74/0.6)]" />
                      )}
                      <Icon
                        className={cn("size-[18px] transition-colors", active ? "text-lime" : "text-faint group-hover:text-fg-2")}
                        strokeWidth={2}
                      />
                      <span className="flex-1">{it.label}</span>
                      {it.badge === "EN VIVO" ? (
                        <span className="flex items-center gap-1 text-[9.5px] font-extrabold tracking-wider text-lime">
                          <span className="relative flex size-1.5">
                            <span className="absolute inset-0 animate-ping rounded-full bg-lime" />
                            <span className="relative size-1.5 rounded-full bg-lime" />
                          </span>
                          LIVE
                        </span>
                      ) : it.badge ? (
                        <span className="rounded-md bg-rose/15 px-1.5 py-0.5 text-[10.5px] font-bold text-rose">{it.badge}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Ocupación en vivo */}
      <div className="m-3 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-lime/[0.10] via-transparent to-transparent p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-semibold text-fg-2">Ocupación ahora</span>
          <Zap className="size-3.5 text-lime" />
        </div>
        <p className="mt-1 text-2xl font-extrabold tracking-tight text-fg tabular">
          86<span className="text-sm font-bold text-muted"> / 140</span>
        </p>
        <div className="mt-3 flex h-6 items-end gap-[3px]">
          {[30, 45, 38, 60, 72, 55, 80, 92, 74, 61, 48, 66].map((h, i) => (
            <span
              key={i}
              className={cn("flex-1 rounded-sm", i === 7 ? "bg-lime" : "bg-white/10")}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // el drawer se cierra solo al cambiar de ruta: queda abierto solo para la ruta donde se abrió
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (v: boolean) => setOpenAt(v ? pathname : null);

  return (
    <div className="relative min-h-dvh bg-ink">
      {/* luz ambiente */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[420px] w-[620px] rounded-full bg-lime/[0.05] blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-[420px] w-[520px] rounded-full bg-violet/[0.06] blur-[120px]" />
      </div>

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[256px] border-r border-line bg-ink-2/80 backdrop-blur-xl lg:block">
        <Sidebar />
      </aside>

      {/* Drawer mobile */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] border-r border-line bg-ink-2 transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-5 grid size-9 place-items-center rounded-xl text-muted hover:bg-white/5"
          aria-label="Cerrar menú"
        >
          <X className="size-5" />
        </button>
        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>

      <div className="relative lg:pl-[256px]">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-line bg-ink/75 backdrop-blur-xl">
          <div className="flex h-[64px] items-center gap-3 px-4 sm:px-6 lg:h-[72px] lg:px-8">
            <button
              onClick={() => setOpen(true)}
              className="grid size-10 place-items-center rounded-xl border border-line text-fg-2 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </button>
            <label className="group hidden h-10 max-w-[420px] flex-1 items-center gap-2.5 rounded-xl border border-line bg-white/[0.03] px-3.5 text-muted transition focus-within:border-lime/40 md:flex">
              <Search className="size-4" />
              <input
                placeholder="Buscar socios, pagos, clases…"
                className="flex-1 bg-transparent text-[13.5px] text-fg placeholder:text-muted focus:outline-none"
              />
              <Kbd>Ctrl K</Kbd>
            </label>
            <Link href="/admin" className="md:hidden" aria-label="Inicio">
              <Logo compact />
            </Link>
            <div className="flex-1 md:hidden" />
            <div className="ml-auto flex items-center gap-2">
              <ButtonLink href="/admin/acceso" variant="secondary" size="md" className="hidden xl:inline-flex">
                Registrar ingreso
              </ButtonLink>
              <ButtonLink href="/admin/socios/1042" size="md" className="hidden sm:inline-flex">
                <Plus className="size-4" strokeWidth={2.6} /> Nuevo socio
              </ButtonLink>
              <button
                className="relative grid size-10 place-items-center rounded-xl border border-line text-fg-2 transition hover:bg-white/5"
                aria-label="Notificaciones"
              >
                <Bell className="size-[18px]" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-lime ring-2 ring-ink" />
              </button>
              <button className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition hover:bg-white/5">
                <Avatar i={12} size={34} />
                <span className="hidden text-left leading-tight xl:block">
                  <span className="block text-[13px] font-bold text-fg">Carolina Vidal</span>
                  <span className="block text-[11px] text-muted">Administradora</span>
                </span>
              </button>
            </div>
          </div>
        </header>
        <main className="px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
      <div className="stagger min-w-0">
        {eyebrow && <div className="mb-1.5 text-[12.5px] font-semibold text-muted">{eyebrow}</div>}
        <h1 className="text-[28px] font-extrabold leading-none tracking-[-0.035em] text-fg sm:text-[34px]">{title}</h1>
      </div>
      {children && <div className="stagger flex flex-wrap items-center gap-2" style={{ "--i": 1 } as React.CSSProperties}>{children}</div>}
    </div>
  );
}
