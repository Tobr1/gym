"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Home, QrCode, UserRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/app", icon: Home, label: "Inicio" },
  { href: "/app/stats", icon: BarChart3, label: "Progreso" },
  { href: "/app/clases", icon: CalendarDays, label: "Clases" },
  { href: "/app/perfil", icon: UserRound, label: "Perfil" },
];

export function MemberTabBar() {
  const pathname = usePathname();
  return (
    <nav className="pointer-events-none sticky bottom-0 z-40 flex justify-center bg-gradient-to-t from-ink via-ink/75 to-transparent px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-8">
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/8 bg-[#1a2230]/90 p-1.5 shadow-[0_20px_50px_-10px_rgb(0_0_0/0.8)] backdrop-blur-xl">
        {TABS.map((t) => {
          const active = t.href === pathname;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-label={t.label}
              className={cn(
                "grid size-[54px] place-items-center rounded-full transition-all duration-300",
                active
                  ? "bg-lime text-lime-ink shadow-[0_0_24px_-2px_rgb(181_245_74/0.7)]"
                  : "bg-white/[0.04] text-fg-2 hover:bg-white/10",
              )}
            >
              <t.icon className="size-[22px]" strokeWidth={active ? 2.4 : 1.9} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const SIDE_STATS = [
  ["4,9 ★", "valoración de socios en tiendas", "en tiendas"],
  ["73%", "de las reservas se hacen desde la app", "vía app"],
  ["-41%", "consultas en recepción", "consultas"],
] as const;

/**
 * En mobile, la app ocupa toda la pantalla.
 * En desktop, se presenta dentro de un dispositivo con contexto comercial alrededor.
 */
export function MemberShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-ink md:grid md:place-items-center md:overflow-hidden md:py-10">
      {/* ambiente desktop */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[0.07] blur-[140px]" />
        <div className="dots absolute inset-0 opacity-50 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
      </div>

      <div className="relative md:flex md:items-center md:gap-14 xl:gap-24">
        {/* texto lateral (tablet horizontal y desktop) */}
        <aside className="hidden max-w-[300px] lg:block xl:max-w-[320px]">
          <Logo />
          <h1 className="mt-8 text-[44px] font-extrabold leading-[1] tracking-[-0.045em] text-fg">
            Tu gimnasio,
            <br />
            <span className="text-lime">en el bolsillo.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-fg-2">
            Reservá clases, seguí tu rutina, pagá tu cuota y entrá con tu QR. Todo desde una app con tu marca.
          </p>
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-line bg-surface/70 p-3 backdrop-blur">
            <div className="rounded-xl bg-white p-2">
              <QRCodeSVG value="https://pulso.app/descargar" size={72} fgColor="#0B1018" />
            </div>
            <div>
              <p className="text-[13.5px] font-bold text-fg">Escaneá para instalar</p>
              <p className="text-[12px] text-muted">iOS · Android · Web</p>
            </div>
          </div>
          {/* en tablet las tarjetas laterales no entran: versión compacta */}
          <dl className="mt-6 grid grid-cols-3 gap-2 xl:hidden">
            {SIDE_STATS.map(([v, , short]) => (
              <div key={short} className="rounded-xl border border-line bg-surface/70 px-3 py-2.5">
                <dt className="text-[19px] font-extrabold leading-none tracking-[-0.03em] text-fg">{v}</dt>
                <dd className="mt-1 text-[11px] font-medium leading-tight text-muted">{short}</dd>
              </div>
            ))}
          </dl>
        </aside>

        {/* dispositivo */}
        <div className="relative md:h-[880px] md:w-[420px] md:rounded-[54px] md:border md:border-white/10 md:bg-[#05080d] md:p-[10px] md:shadow-[0_0_0_2px_#1d2633,0_60px_120px_-30px_rgb(0_0_0/0.9),0_0_80px_-20px_rgb(181_245_74/0.25)]">
          <div className="relative min-h-dvh bg-ink md:h-full md:min-h-0 md:overflow-hidden md:rounded-[44px]">
            {/* isla dinámica */}
            <div className="pointer-events-none absolute left-1/2 top-3 z-50 hidden h-[30px] w-[110px] -translate-x-1/2 rounded-full bg-black md:block" />
            <div className="no-scrollbar relative flex min-h-dvh flex-col md:h-full md:min-h-0 md:overflow-y-auto">
              <StatusBar />
              <div className="flex-1">{children}</div>
              <MemberTabBar />
            </div>
          </div>
        </div>

        {/* tarjetas laterales desktop */}
        <aside className="hidden w-[260px] space-y-4 xl:block">
          {/* sin animación de entrada: el aside alterna display por breakpoint y la animación
              se reinicia en cada cambio de tamaño (incluidas las capturas a página completa) */}
          {SIDE_STATS.map(([v, l]) => (
            <div key={l} className="rounded-2xl border border-line bg-surface/70 p-5 backdrop-blur">
              <p className="text-[34px] font-extrabold leading-none tracking-[-0.04em] text-fg">{v}</p>
              <p className="mt-2 text-[13px] font-medium text-muted">{l}</p>
            </div>
          ))}
          <Link href="/" className="inline-flex items-center gap-1.5 pt-2 text-[13px] font-bold text-lime hover:underline">
            <QrCode className="size-4" /> Conocer la plataforma
          </Link>
        </aside>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="hidden h-[52px] shrink-0 items-center justify-between px-8 pt-1 text-[15px] font-bold text-fg md:flex">
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor" aria-hidden>
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="6" rx="1" />
          <rect x="10" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="15" y="0" width="3" height="11" rx="1" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" aria-hidden>
          <path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.2A10 10 0 0 0 8 .5 10 10 0 0 0 .8 3.4L2 4.6a8.4 8.4 0 0 1 6-2.4Zm0 3.3c1.4 0 2.7.5 3.7 1.4l1.2-1.2A7 7 0 0 0 8 3.8a7 7 0 0 0-4.9 1.9l1.2 1.2c1-.9 2.3-1.4 3.7-1.4Zm0 3.3c-.6 0-1.1.2-1.5.6L8 11l1.5-1.6c-.4-.4-.9-.6-1.5-.6Z" />
        </svg>
        <span className="relative ml-0.5 h-[12px] w-[25px] rounded-[4px] border border-fg/50 p-[1.5px]">
          <span className="block h-full w-[80%] rounded-[2px] bg-fg" />
        </span>
      </span>
    </div>
  );
}
