"use client";

/*
 * Capas flotantes del portal del socio (hojas inferiores y avisos).
 * En mobile se fijan al viewport. En desktop la app vive dentro del marco del teléfono,
 * que tiene su propio scroll: la capa se ubica sobre la zona visible de ese contenedor.
 * Importante: no anidarlas dentro de elementos con `transform` (p. ej. `.stagger`).
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function useVisibleBox(ref: React.RefObject<HTMLDivElement | null>, active: boolean, lock: boolean) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    if (getComputedStyle(el).position !== "absolute") {
      if (!lock) return;
      const root = document.documentElement;
      const prev = root.style.overflow;
      root.style.overflow = "hidden";
      return () => {
        root.style.overflow = prev;
      };
    }
    const sc = el.offsetParent as HTMLElement | null;
    if (!sc) return;
    const place = () => {
      el.style.top = `${sc.scrollTop}px`;
      el.style.height = `${sc.clientHeight}px`;
    };
    place();
    if (lock) {
      const prev = sc.style.overflowY;
      sc.style.overflowY = "hidden";
      return () => {
        sc.style.overflowY = prev;
      };
    }
    sc.addEventListener("scroll", place, { passive: true });
    return () => sc.removeEventListener("scroll", place);
  }, [ref, active, lock]);
}

/** Hoja inferior con el mismo lenguaje que la hoja del QR de inicio. */
export function Sheet({
  open,
  onClose,
  label,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useVisibleBox(ref, open, true);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-hidden={!open}
      inert={!open}
      onClick={onClose}
      className={cn(
        "fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:absolute md:inset-x-0 md:bottom-auto",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative max-h-[92%] w-full overflow-y-auto rounded-t-[32px] border-t border-lime/30 bg-surface p-6 pb-10 no-scrollbar transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          open ? "translate-y-0" : "translate-y-full",
          className,
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />
        <button
          onClick={onClose}
          className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-white/8 text-fg"
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

/** Aviso breve sobre la barra de pestañas. */
export function Toast({
  show,
  icon,
  title,
  detail,
  action,
}: {
  show: boolean;
  icon: React.ReactNode;
  title: string;
  detail?: string;
  action?: { label: string; onClick: () => void };
}) {
  const ref = useRef<HTMLDivElement>(null);
  useVisibleBox(ref, show, false);
  return (
    <div
      ref={ref}
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 pb-[112px] md:absolute md:inset-x-0 md:bottom-auto"
    >
      <div
        className={cn(
          "flex w-full items-center gap-3 rounded-[22px] border border-white/10 bg-[#1d2735]/95 p-2.5 pr-3 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.9)] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          show ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        )}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-lime text-lime-ink">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-extrabold text-fg">{title}</span>
          {detail && <span className="block truncate text-[12px] font-medium text-muted">{detail}</span>}
        </span>
        {action && (
          <button onClick={action.onClick} className="shrink-0 rounded-full px-2 py-1.5 text-[12.5px] font-extrabold text-lime">
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
