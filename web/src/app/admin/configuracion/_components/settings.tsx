"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  BellRing,
  Blocks,
  Building2,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Receipt,
  ScanLine,
  Smartphone,
  Tags,
  Undo2,
  UsersRound,
} from "lucide-react";
import { Kbd, Ring } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { DEFAULT_SECTION, type SectionId } from "../_data";
import { DirtyContext } from "./controls";
import { PlansSection } from "./plans";
import { BranchesSection } from "./branches";
import { TeamSection } from "./team";
import { IntegrationsSection } from "./integrations";
import { BrandSection } from "./brand";
import { AccessSection, BillingSection, NotificationsSection, PaymentsSection, ProfileSection } from "./forms";

type NavItem = { id: SectionId; label: string; hint: string; icon: typeof Tags };

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Negocio",
    items: [
      { id: "perfil", label: "Perfil del gimnasio", hint: "", icon: Building2 },
      { id: "sedes", label: "Sedes", hint: "3", icon: MapPin },
      { id: "planes", label: "Planes y precios", hint: "6", icon: Tags },
      { id: "pagos", label: "Medios de pago", hint: "", icon: CreditCard },
    ],
  },
  {
    group: "Equipo",
    items: [
      { id: "usuarios", label: "Usuarios y permisos", hint: "13", icon: UsersRound },
      { id: "acceso", label: "Control de acceso", hint: "", icon: ScanLine },
      { id: "notificaciones", label: "Notificaciones", hint: "", icon: BellRing },
    ],
  },
  {
    group: "Producto",
    items: [
      { id: "marca", label: "App del socio / Marca", hint: "", icon: Smartphone },
      { id: "integraciones", label: "Integraciones", hint: "4/6", icon: Blocks },
      { id: "facturacion", label: "Facturación", hint: "Pro", icon: Receipt },
    ],
  },
];
const ITEMS = NAV.flatMap((g) => g.items);
const LABEL = Object.fromEntries(ITEMS.map((i) => [i.id, i.label])) as Record<SectionId, string>;

/* La sección activa vive en el hash (#sedes): se puede compartir, y atrás/adelante navegan entre secciones. */
const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readHash = () => window.location.hash.slice(1);

export function Settings() {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const active: SectionId = ITEMS.some((i) => i.id === hash) ? (hash as SectionId) : DEFAULT_SECTION;

  const [dirty, setDirty] = useState<Set<string>>(() => new Set());
  const [version, setVersion] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const content = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const touch = useCallback((key: string) => {
    setSaved(false);
    setDirty((d) => (d.has(key) ? d : new Set(d).add(key)));
  }, []);
  const ctx = useMemo(() => ({ touch }), [touch]);

  const go = (id: SectionId) => {
    if (id !== active) {
      window.history.pushState(null, "", `#${id}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    const top = content.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 140, behavior: "smooth" });
  };

  // en mobile/tablet, la pastilla activa queda visible dentro del carrusel
  useEffect(() => {
    const el = chips.current?.querySelector<HTMLElement>("[data-active=true]");
    const box = chips.current;
    if (!el || !box) return;
    box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  function save() {
    if (!dirty.size || saving) return;
    setSaving(true);
    timers.current.push(
      setTimeout(() => {
        setSaving(false);
        setDirty(new Set());
        setSaved(true);
        timers.current.push(setTimeout(() => setSaved(false), 2800));
      }, 750),
    );
  }

  function discard() {
    setDirty(new Set());
    setVersion((v) => v + 1);
  }

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      save();
    }
  });
  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const touchedSections = Array.from(new Set(Array.from(dirty).map((k) => k.split(".")[0] as SectionId)));

  return (
    <DirtyContext.Provider value={ctx}>
      <div className="xl:grid xl:grid-cols-[232px_minmax(0,1fr)] xl:items-start xl:gap-7">
        {/* ── Navegación vertical (desktop) ─────────────── */}
        <aside className="sticky top-[96px] hidden xl:block">
          <nav className="space-y-5">
            {NAV.map((g) => (
              <div key={g.group}>
                <p className="px-3 pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-faint">{g.group}</p>
                <ul className="space-y-0.5">
                  {g.items.map((it) => {
                    const on = it.id === active;
                    const changed = touchedSections.includes(it.id);
                    return (
                      <li key={it.id}>
                        <button
                          onClick={() => go(it.id)}
                          aria-current={on ? "page" : undefined}
                          className={cn(
                            "group relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[13.5px] font-semibold transition-all",
                            on ? "bg-surface text-fg shadow-[0_1px_0_0_rgb(255_255_255/0.04)_inset] ring-1 ring-inset ring-line-strong" : "text-muted hover:bg-white/[0.03] hover:text-fg",
                          )}
                        >
                          <it.icon className={cn("size-[17px] shrink-0 transition-colors", on ? "text-lime" : "text-faint group-hover:text-fg-2")} />
                          <span className="min-w-0 flex-1 truncate">{it.label}</span>
                          {changed ? (
                            <span className="size-1.5 rounded-full bg-amber shadow-[0_0_8px_#ffbe55]" aria-label="Cambios sin guardar" />
                          ) : it.hint ? (
                            <span className={cn("text-[11px] font-bold tabular", on ? "text-fg-2" : "text-faint")}>{it.hint}</span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-6 rounded-2xl border border-line bg-gradient-to-br from-lime/[0.08] via-transparent to-transparent p-4">
            <div className="flex items-center gap-3">
              <Ring value={90} size={46} stroke={5}>
                <span className="text-[11px] font-extrabold text-fg tabular">90%</span>
              </Ring>
              <div className="min-w-0 leading-tight">
                <p className="text-[13px] font-bold text-fg">Puesta a punto</p>
                <p className="text-[11.5px] text-muted">9 de 10 pasos listos</p>
              </div>
            </div>
            <button
              onClick={() => go("integraciones")}
              className="group mt-3 flex w-full items-center gap-1.5 text-left text-[12px] font-bold text-lime"
            >
              Conectá Google Calendar
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </aside>

        {/* ── Carrusel de secciones (mobile / tablet) ──── */}
        <div className="sticky top-16 z-10 -mx-4 mb-5 border-b border-line bg-ink/85 backdrop-blur-xl sm:-mx-6 lg:top-[72px] lg:-mx-8 xl:hidden">
          <div ref={chips} className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
            {ITEMS.map((it) => {
              const on = it.id === active;
              const changed = touchedSections.includes(it.id);
              return (
                <button
                  key={it.id}
                  data-active={on}
                  onClick={() => go(it.id)}
                  className={cn(
                    "flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[12.5px] font-bold transition-all",
                    on
                      ? "border-lime/40 bg-lime/[0.10] text-fg"
                      : "border-line bg-white/[0.02] text-muted hover:text-fg",
                  )}
                >
                  <it.icon className={cn("size-4", on ? "text-lime" : "text-faint")} />
                  {it.label}
                  {changed && <span className="size-1.5 rounded-full bg-amber" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Contenido ─────────────────────────────────── */}
        <div ref={content} key={version} className="min-w-0 scroll-mt-40">
          <div hidden={active !== "perfil"}>
            <ProfileSection />
          </div>
          <div hidden={active !== "sedes"}>
            <BranchesSection />
          </div>
          <div hidden={active !== "planes"}>
            <PlansSection />
          </div>
          <div hidden={active !== "pagos"}>
            <PaymentsSection />
          </div>
          <div hidden={active !== "usuarios"}>
            <TeamSection />
          </div>
          <div hidden={active !== "acceso"}>
            <AccessSection />
          </div>
          <div hidden={active !== "notificaciones"}>
            <NotificationsSection />
          </div>
          <div hidden={active !== "marca"}>
            <BrandSection />
          </div>
          <div hidden={active !== "integraciones"}>
            <IntegrationsSection />
          </div>
          <div hidden={active !== "facturacion"}>
            <BillingSection />
          </div>
          {/* espacio para que la barra de guardado no tape el final */}
          <div className={cn("transition-all", dirty.size ? "h-24" : "h-0")} />
        </div>
      </div>

      {/* ── Barra de guardado ───────────────────────────── */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-5 lg:left-[256px] lg:px-8">
        <AnimatePresence>
          {(dirty.size > 0 || saved) && (
            <motion.div
              key={saved && !dirty.size ? "ok" : "dirty"}
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="pointer-events-auto mx-auto max-w-[760px]"
            >
              {saved && !dirty.size ? (
                <div className="mx-auto flex w-fit items-center gap-2.5 rounded-full border border-lime/30 bg-surface-2/95 py-2 pl-2 pr-4 shadow-[0_20px_50px_-12px_rgb(0_0_0/0.8)] backdrop-blur-xl">
                  <span className="grid size-7 place-items-center rounded-full bg-lime text-lime-ink">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  <span className="text-[13px] font-bold text-fg">Cambios guardados</span>
                  <span className="hidden text-[12px] text-muted sm:inline">· ya se ven en la app de los socios</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-line-strong bg-surface-2/95 p-2 pl-4 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.85),0_0_0_1px_rgb(181_245_74/0.06)] backdrop-blur-xl">
                  <span className="relative flex size-2.5 shrink-0">
                    <span className="absolute inset-0 animate-ping rounded-full bg-amber/70" />
                    <span className="relative size-2.5 rounded-full bg-amber" />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="text-[13.5px] font-bold text-fg">
                      <span className="tabular">{dirty.size}</span> {dirty.size === 1 ? "cambio sin guardar" : "cambios sin guardar"}
                    </p>
                    <p className="hidden truncate text-[11.5px] text-muted sm:block">
                      En {touchedSections.map((id) => LABEL[id]).join(" · ")}
                    </p>
                  </div>
                  <button
                    onClick={discard}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold text-fg-2 transition hover:bg-white/5 hover:text-fg"
                  >
                    <Undo2 className="size-4" />
                    <span className="hidden sm:inline">Descartar</span>
                  </button>
                  <button
                    onClick={save}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-lime px-4 text-[13.5px] font-bold text-lime-ink shadow-[0_8px_30px_-8px_rgb(181_245_74/0.6)] transition hover:bg-[#c4fa66] active:scale-[0.97]"
                  >
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" strokeWidth={2.8} />}
                    {saving ? "Guardando…" : "Guardar"}
                    <span className="hidden opacity-60 md:inline-flex [&_kbd]:border-lime-ink/20 [&_kbd]:bg-lime-ink/10 [&_kbd]:text-lime-ink">
                      <Kbd>Ctrl S</Kbd>
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DirtyContext.Provider>
  );
}
