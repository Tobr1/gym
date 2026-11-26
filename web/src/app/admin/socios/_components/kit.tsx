/* Piezas compartidas por las pestañas de la ficha del socio. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MEMBERS } from "@/lib/mock";
import { face } from "@/lib/photos";
import { cn } from "@/lib/utils";
import { getProfile, type Profile } from "../_lib/profile";

export const s = (i: number) => ({ "--i": i }) as React.CSSProperties;
export const dec = (n: number, d = 1) => n.toLocaleString("es-AR", { minimumFractionDigits: d, maximumFractionDigits: d });

export function tabMetadata(id: string, label: string): Metadata {
  const m = MEMBERS.find((x) => x.id === id);
  return { title: m ? `${m.name} · ${label}` : label };
}

/** Resuelve el socio desde params (dentro de Suspense) y renderiza la pestaña. */
export async function WithProfile({
  params,
  render,
}: {
  params: Promise<{ id: string }>;
  render: (p: Profile) => React.ReactNode;
}) {
  const { id } = await params;
  const p = getProfile(id);
  if (!p) notFound();
  return <>{render(p)}</>;
}

/** Retrato con carga inmediata (las capturas de página completa no disparan lazy-load). */
export function Face({ i, size, className }: { i: number; size: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={face(i, size * 2)}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full bg-surface-3 object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}

/** Foto deportiva con la gradación compartida. */
export function Photo({ src, className, alt = "" }: { src: string; className?: string; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={cn("photo-grade object-cover", className)} />;
}

/** Etiqueta pequeña en mayúsculas. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted", className)}>{children}</p>;
}

/** Aviso contextual según el estado del socio (vencido / congelado). */
export function StatusNote({
  tone,
  icon,
  children,
  className,
}: {
  tone: "rose" | "cyan" | "amber";
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const cls = {
    rose: "border-rose/25 bg-rose/[0.06] text-rose",
    cyan: "border-cyan/25 bg-cyan/[0.06] text-cyan",
    amber: "border-amber/25 bg-amber/[0.06] text-amber",
  }[tone];
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[12.5px] font-semibold leading-snug", cls, className)}>
      <span className="mt-px shrink-0 [&_svg]:size-4">{icon}</span>
      <div className="min-w-0 text-fg-2 [&_b]:font-bold [&_b]:text-fg">{children}</div>
    </div>
  );
}

export function TabSkeleton({ cols = "xl:grid-cols-[minmax(0,1fr)_360px]" }: { cols?: string }) {
  return (
    <div className={cn("mt-6 grid animate-pulse gap-4", cols)}>
      <div className="grid gap-4">
        <div className="panel h-[300px]" />
        <div className="panel h-[420px]" />
      </div>
      <div className="panel h-[640px]" />
    </div>
  );
}
