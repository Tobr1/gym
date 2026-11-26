"use client";

import { Camera, CheckCircle2, ChevronRight, Clock3, Flame, Footprints, Globe, MessageCircle, Snowflake, Thermometer, UsersRound, XCircle } from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import { cn, money } from "@/lib/utils";
import { SELLERS, SOURCE_META, type Lead, type SourceKey, type Temp } from "../_data";

export const SOURCE_ICON: Record<SourceKey, typeof Globe> = {
  instagram: Camera,
  web: Globe,
  referido: UsersRound,
  walkin: Footprints,
  whatsapp: MessageCircle,
};

export const TEMP_META: Record<Temp, { label: string; icon: typeof Flame; color: string; level: number }> = {
  frio: { label: "Frío", icon: Snowflake, color: "#57D5F2", level: 1 },
  tibio: { label: "Tibio", icon: Thermometer, color: "#FFBE55", level: 2 },
  caliente: { label: "Caliente", icon: Flame, color: "#FF5F7E", level: 3 },
};

const GRADS = [
  ["#9D84FF", "#57D5F2"],
  ["#B5F54A", "#3DDC97"],
  ["#FFBE55", "#FF5F7E"],
  ["#57D5F2", "#3DDC97"],
  ["#FF8A4C", "#9D84FF"],
];

export function Initials({ name, size = 30 }: { name: string; size?: number }) {
  const parts = name.replace(/S\.A\.|SRL/g, "").trim().split(/\s+/);
  const ini = (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  const g = GRADS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % GRADS.length];
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full text-[11px] font-extrabold text-ink"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }}
    >
      {ini}
    </span>
  );
}

export function SourceChip({ source, className }: { source: SourceKey; className?: string }) {
  const s = SOURCE_META[source];
  const Icon = SOURCE_ICON[source];
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold whitespace-nowrap", className)}
      style={{ color: s.color, background: `color-mix(in oklab, ${s.color} 13%, transparent)` }}
    >
      <Icon className="size-3" strokeWidth={2.4} />
      {s.label}
    </span>
  );
}

export function TempMeter({ temp }: { temp: Temp }) {
  const t = TEMP_META[temp];
  return (
    <span className="inline-flex items-center gap-1" title={`Temperatura: ${t.label}`}>
      <t.icon className="size-3.5" style={{ color: t.color }} strokeWidth={2.4} />
      <span className="flex items-end gap-[2px]">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className="w-[3px] rounded-full"
            style={{ height: 4 + n * 2, background: n <= t.level ? t.color : "rgb(255 255 255 / 0.12)" }}
          />
        ))}
      </span>
    </span>
  );
}

export function LeadCard({
  lead,
  dragging,
  onDragStart,
  onDragEnd,
  onAdvance,
}: {
  lead: Lead;
  dragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onAdvance?: () => void;
}) {
  const seller = SELLERS[lead.seller];
  const won = lead.stage === "ganado";
  const lost = lead.stage === "perdido";
  const temp = TEMP_META[lead.temp];
  return (
    <div
      data-card
      data-dragging={dragging || undefined}
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative cursor-grab select-none rounded-xl border bg-surface-2 p-2.5 shadow-[0_1px_0_0_rgb(255_255_255/0.04)_inset,0_8px_20px_-14px_rgb(0_0_0/0.8)] transition-all duration-200 active:cursor-grabbing",
        "hover:-translate-y-0.5 hover:border-line-strong hover:bg-[#1d2938] hover:shadow-[0_1px_0_0_rgb(255_255_255/0.05)_inset,0_16px_30px_-16px_rgb(0_0_0/0.9)]",
        dragging ? "scale-[0.97] border-dashed border-white/20 opacity-35" : "border-line",
        won && "border-lime/20 bg-[linear-gradient(180deg,rgb(181_245_74/0.06),transparent_60%)] bg-surface-2",
        lost && "opacity-70",
        lead.fresh && "ring-2 ring-lime/50",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="relative shrink-0" title={`Temperatura: ${temp.label}`}>
          {lead.face !== undefined ? <Avatar i={lead.face} size={32} /> : <Initials name={lead.name} size={32} />}
          <span
            className="absolute -bottom-1 -right-1 grid size-[17px] place-items-center rounded-full ring-2 ring-surface-2"
            style={{ background: temp.color, boxShadow: `0 0 10px -1px ${temp.color}` }}
          >
            <temp.icon className="size-2.5 text-ink" strokeWidth={2.8} />
          </span>
        </span>
        <div className={cn("min-w-0 flex-1", onAdvance && "pr-6 md:pr-0")}>
          <p className="truncate text-[13px] font-bold leading-tight text-fg">{lead.name}</p>
          <p className="mt-0.5 truncate text-[11px] text-muted">{lead.plan}</p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <SourceChip source={lead.source} />
        <span className={cn("truncate text-[13.5px] font-extrabold tracking-[-0.02em] tabular", won ? "text-lime" : "text-fg")}>
          {money(lead.value)}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-2 border-t border-dashed border-white/[0.08] pt-2.5 leading-tight">
        {won ? (
          <CheckCircle2 className="size-3.5 shrink-0 text-lime" />
        ) : lost ? (
          <XCircle className="size-3.5 shrink-0 text-rose" />
        ) : (
          <Clock3 className={cn("size-3.5 shrink-0", lead.overdue ? "text-rose" : "text-faint")} />
        )}
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-[11.5px] font-semibold", lead.overdue ? "text-rose" : won ? "text-lime" : "text-fg-2")}>{lead.next}</p>
          <p className={cn("mt-0.5 truncate text-[10.5px] font-semibold tabular", lead.overdue ? "text-rose/80" : "text-muted")}>
            {lead.overdue && "Vencida · "}
            {lead.due.charAt(0).toUpperCase() + lead.due.slice(1)}
          </p>
        </div>
        <Avatar i={seller.face} size={22} className="ring-2 ring-surface-2" alt={seller.name} />
      </div>

      {onAdvance && (
        <button
          onClick={onAdvance}
          className="absolute right-2 top-2 grid size-6 place-items-center rounded-lg border border-line-strong bg-surface-3 text-fg-2 shadow-lg transition-all hover:border-lime/50 hover:bg-lime hover:text-lime-ink md:opacity-0 md:group-hover:opacity-100"
          aria-label="Avanzar etapa"
          title="Avanzar a la siguiente etapa"
        >
          <ChevronRight className="size-3.5" strokeWidth={2.8} />
        </button>
      )}
    </div>
  );
}
