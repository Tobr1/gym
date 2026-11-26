import Link from "next/link";
import { Bell, ChevronDown, Plus, Search, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Kbd } from "@/components/ui/primitives";
import { SuperAdminMobileNav } from "@/components/superadmin/mobile-nav";
import { SuperAdminNavLists } from "@/components/superadmin/nav";
import { cn } from "@/lib/utils";

export default function SuperAdminLayout({ children }: LayoutProps<"/superadmin">) {
  return (
    <div className="min-h-dvh bg-[#080c12] p-0 lg:p-3">
      <div className="relative flex min-h-dvh overflow-hidden bg-ink lg:min-h-[calc(100dvh-24px)] lg:rounded-[26px] lg:border lg:border-line">
        {/* sidebar */}
        <aside className="hidden w-[250px] shrink-0 flex-col border-r border-line p-4 lg:flex">
          <div className="flex items-center justify-between px-2 pb-6 pt-2">
            <Link href="/">
              <Logo />
            </Link>
            <span className="rounded-md bg-lime/12 px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-[0.14em] text-lime">ROOT</span>
          </div>
          <SuperAdminNavLists />

          <div className="mt-auto rounded-2xl border border-line bg-gradient-to-b from-emerald/[0.07] to-transparent p-4">
            <p className="flex items-center gap-2 text-[12.5px] font-bold text-fg">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald" />
                <span className="relative size-2 rounded-full bg-emerald" />
              </span>
              Todos los sistemas operativos
            </p>
            <div className="mt-3 flex h-6 gap-[2px]">
              {Array.from({ length: 30 }).map((_, i) => (
                <span key={i} className={cn("flex-1 rounded-[2px]", i === 17 ? "bg-amber" : "bg-emerald/70")} />
              ))}
            </div>
            <p className="mt-2 flex justify-between text-[10.5px] font-semibold text-muted">
              <span>30 días</span>
              <span className="text-emerald">99,98% uptime</span>
            </p>
          </div>
        </aside>

        {/* contenido */}
        <div className="min-w-0 flex-1">
          <header className="flex items-center gap-2 px-4 pb-2 sm:gap-3 pt-5 sm:px-7 lg:pt-6">
            <SuperAdminMobileNav />
            <div className="mr-auto flex min-w-0 items-center gap-3">
              <h1 className="truncate whitespace-nowrap text-[21px] font-extrabold tracking-[-0.035em] text-fg sm:text-[26px]">Centro de control</h1>
            </div>
            {/* el buscador sólo entra junto al resto de acciones desde xl; en tablet comprimía el título */}
            <label className="hidden h-10 w-[230px] shrink-0 items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-3 text-muted xl:flex 2xl:w-[300px]">
              <Search className="size-4 shrink-0" />
              <input placeholder="Buscar gimnasio o ID…" className="min-w-0 flex-1 bg-transparent text-[13px] text-fg placeholder:text-muted focus:outline-none" />
              <Kbd>Ctrl K</Kbd>
            </label>
            <button className="hidden h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-line px-3.5 text-[13px] font-semibold text-fg-2 md:flex">
              Noviembre 2026 <ChevronDown className="size-4" />
            </button>
            <button className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-fg-2" aria-label="Alertas">
              <Bell className="size-[18px]" />
            </button>
            <button className="flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-lime px-3 text-[13px] font-bold text-lime-ink shadow-[0_8px_24px_-8px_rgb(181_245_74/0.6)] sm:px-4" aria-label="Alta de gimnasio">
              <Plus className="size-4" strokeWidth={2.6} /> <span className="hidden sm:inline">Alta de gimnasio</span>
            </button>
            <span className="hidden size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-lime to-emerald text-lime-ink sm:grid">
              <Sparkles className="size-[18px]" />
            </span>
          </header>
          <main className="px-4 pb-10 pt-4 sm:px-7">{children}</main>
        </div>
      </div>
    </div>
  );
}
