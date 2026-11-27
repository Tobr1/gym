"use client";

import { useState } from "react";
import {
  CalendarOff,
  Check,
  Clock,
  DoorOpen,
  MapPin,
  Navigation,
  Pencil,
  Plus,
  RefreshCw,
  ScanFace,
  ScanLine,
  Users,
} from "lucide-react";
import { Avatar, Button, Pill } from "@/components/ui/primitives";
import { cn, fmt } from "@/lib/utils";
import { BRANCHES, CLOSURES, DEVICES_OFFLINE, DEVICES_TOTAL, type Branch, type Device } from "../_data";
import { Field, SectionHead, Select, SettingRow, Sheet, Stepper, TextInput, Toggle, s, useSetting, useTouch } from "./controls";

const DEVICE_ICON: Record<Device["kind"], typeof ScanLine> = { Molinete: ScanLine, Puerta: DoorOpen, "Lector facial": ScanFace };
const TIMES = Array.from({ length: 39 }, (_, i) => {
  const m = 5 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${m % 60 ? "30" : "00"}`;
});

/** Hoy es miércoles 08:52: todas abren de lunes a viernes. */
const closesAt = (b: Branch) => b.hours[0].time.split("–")[1].trim();

export function BranchesSection() {
  const [branches, setBranches] = useState(BRANCHES);
  const [editing, setEditing] = useState<Branch | null>(null);
  const touch = useTouch();
  const capacity = branches.reduce((a, b) => a + b.capacity, 0);

  return (
    <section className="@container">
      <SectionHead
        icon={MapPin}
        title="Sedes"
        text={
          <>
            {branches.length} sedes · capacidad total <span className="font-semibold text-fg-2 tabular">{capacity}</span> personas ·{" "}
            {DEVICES_TOTAL} accesos{" "}
            {DEVICES_OFFLINE > 0 && <span className="font-semibold text-rose">· {DEVICES_OFFLINE} sin conexión</span>}
          </>
        }
      >
        <Button variant="secondary">
          <Plus className="size-4" strokeWidth={2.6} /> Nueva sede
        </Button>
      </SectionHead>

      <div className="grid gap-3 @3xl:grid-cols-3">
        {branches.map((b, i) => (
          <BranchCard key={b.key} b={b} i={i} onEdit={() => setEditing(b)} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 @2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Closures />
        <SharedRules />
      </div>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.name} subtitle="Datos, aforo y horarios de atención">
        {editing && (
          <BranchEditor
            key={editing.key}
            branch={editing}
            onCancel={() => setEditing(null)}
            onSave={(nb) => {
              setBranches((bs) => bs.map((x) => (x.key === nb.key ? nb : x)));
              touch(`sedes.${nb.key}`);
              setEditing(null);
            }}
          />
        )}
      </Sheet>
    </section>
  );
}

/* ── Tarjeta de sede ───────────────────────────────────────── */
function BranchCard({ b, i, onEdit }: { b: Branch; i: number; onEdit: () => void }) {
  const pct = Math.round((b.now / b.capacity) * 100);
  const offline = b.devices.filter((d) => !d.online).length;
  return (
    <article className="@container/card stagger group overflow-hidden rounded-[var(--radius-2xl)]" style={s(i + 1)}>
      <div className="panel flex h-full flex-col overflow-hidden @xl/card:flex-row">
        {/* foto */}
        <div className="relative h-40 shrink-0 overflow-hidden @xl/card:h-auto @xl/card:w-[42%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.photo}
            alt=""
            loading="lazy"
            className="photo-grade absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent @xl/card:bg-gradient-to-r @xl/card:from-transparent @xl/card:via-transparent @xl/card:to-surface" />
          <div className="absolute left-3 top-3 flex gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-bold text-fg backdrop-blur-md">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-lime" />
                <span className="relative size-1.5 rounded-full bg-lime" />
              </span>
              Abierta · cierra {closesAt(b)}
            </span>
          </div>
          {b.main && (
            <span className="absolute right-3 top-3 rounded-full bg-lime px-2 py-0.5 text-[10.5px] font-extrabold text-lime-ink">Principal</span>
          )}
          <div className="absolute inset-x-4 bottom-3 @xl/card:hidden">
            <h3 className="text-[19px] font-extrabold tracking-[-0.03em] text-fg">{b.name}</h3>
            <p className="flex items-center gap-1 text-[12px] font-medium text-fg-2">
              <MapPin className="size-3.5" /> {b.address} · {b.area}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4 pt-3 @xl/card:p-5">
          <div className="mb-3 hidden @xl/card:block">
            <h3 className="text-[19px] font-extrabold tracking-[-0.03em] text-fg">{b.name}</h3>
            <p className="flex items-center gap-1 text-[12px] font-medium text-muted">
              <MapPin className="size-3.5" /> {b.address} · {b.area}
            </p>
          </div>

          {/* aforo */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold text-muted">Ahora adentro</p>
              <p className="text-[22px] font-extrabold leading-tight tracking-[-0.03em] text-fg tabular">
                {b.now}
                <span className="text-[13px] font-semibold text-muted"> / {b.capacity}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold text-muted">Socios</p>
              <p className="text-[15px] font-extrabold text-fg-2 tabular">{fmt(b.members)}</p>
            </div>
          </div>
          <div className="mt-2 flex h-1.5 gap-[2px]">
            {Array.from({ length: 20 }, (_, k) => (
              <span
                key={k}
                className={cn("flex-1 rounded-full", k < Math.round(pct / 5) ? (pct > 80 ? "bg-amber" : "bg-lime") : "bg-white/[0.07]")}
              />
            ))}
          </div>

          {/* horarios */}
          <ul className="mt-4 space-y-1.5 text-[12.5px]">
            {b.hours.map((h, k) => (
              <li key={h.days} className="flex items-center gap-2">
                <Clock className={cn("size-3.5 shrink-0", k === 0 ? "text-lime" : "text-faint")} />
                <span className={cn("flex-1", k === 0 ? "font-bold text-fg" : "text-muted")}>
                  {h.days}
                  {k === 0 && <span className="ml-1.5 text-[10.5px] font-bold uppercase tracking-wider text-lime">hoy</span>}
                </span>
                <span className={cn("font-semibold tabular", h.time === "Cerrado" ? "text-faint" : k === 0 ? "text-fg" : "text-fg-2")}>{h.time}</span>
              </li>
            ))}
          </ul>

          {/* accesos */}
          <div className="mt-4 rounded-xl border border-line bg-ink/30 p-2.5">
            <p className="mb-1.5 flex items-center justify-between px-0.5 text-[11px] font-semibold text-muted">
              Molinetes y lectores
              {offline ? <span className="font-bold text-rose">{offline} sin conexión</span> : <span className="font-bold text-lime">Todo en línea</span>}
            </p>
            <ul className="space-y-1">
              {b.devices.map((d) => (
                <DeviceRow key={d.name} d={d} />
              ))}
            </ul>
          </div>

          <div className="mt-auto flex items-center gap-2 pt-4">
            <Avatar i={b.manager.face} size={26} />
            <p className="min-w-0 flex-1 truncate text-[12px] leading-tight text-muted">
              <span className="block font-bold text-fg-2">{b.manager.name}</span>
              Responsable
            </p>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-[10px] border border-line text-muted transition hover:border-line-strong hover:text-fg"
              aria-label="Ver en el mapa"
              title="Ver en el mapa"
            >
              <Navigation className="size-[15px]" />
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-line-strong bg-surface-2 px-2.5 text-[12px] font-bold text-fg transition hover:border-lime/40 hover:text-lime"
            >
              <Pencil className="size-3.5" /> Editar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function DeviceRow({ d }: { d: Device }) {
  const [state, setState] = useState<"idle" | "retry" | "ok">("idle");
  const online = d.online || state === "ok";
  const Icon = DEVICE_ICON[d.kind];
  return (
    <li className={cn("flex items-center gap-2 rounded-lg px-1.5 py-1", !online && "bg-rose/[0.07]")}>
      <Icon className={cn("size-4 shrink-0", online ? "text-fg-2" : "text-rose")} />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[12.5px] font-semibold text-fg">{d.name}</span>
        {!online && d.note && <span className="block truncate text-[10.5px] text-rose/80">{d.note}</span>}
      </span>
      {online ? (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-muted">
          <span className="size-1.5 rounded-full bg-lime shadow-[0_0_6px_#b5f54a]" /> En línea
        </span>
      ) : (
        <button
          type="button"
          onClick={() => {
            setState("retry");
            setTimeout(() => setState("ok"), 1400);
          }}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-rose transition hover:bg-rose/10"
        >
          <RefreshCw className={cn("size-3", state === "retry" && "animate-spin")} />
          {state === "retry" ? "Conectando" : "Reintentar"}
        </button>
      )}
    </li>
  );
}

/* ── Editor de sede ────────────────────────────────────────── */
function BranchEditor({ branch, onSave, onCancel }: { branch: Branch; onSave: (b: Branch) => void; onCancel: () => void }) {
  const [b, setB] = useState(branch);
  const setHour = (k: number, time: string) => setB((x) => ({ ...x, hours: x.hours.map((h, j) => (j === k ? { ...h, time } : h)) }));
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" className="sm:col-span-2">
          <TextInput value={b.name} onChange={(v) => setB({ ...b, name: v })} />
        </Field>
        <Field label="Dirección">
          <TextInput icon={MapPin} value={b.address} onChange={(v) => setB({ ...b, address: v })} />
        </Field>
        <Field label="Barrio">
          <TextInput value={b.area} onChange={(v) => setB({ ...b, area: v })} />
        </Field>
      </div>

      <Field label="Aforo máximo" hint="Al llegar al aforo, el molinete pide confirmación a recepción">
        <div className="flex items-center gap-3">
          <Stepper value={b.capacity} min={10} max={400} onChange={(v) => setB({ ...b, capacity: v })} suffix="personas" />
          <div className="flex gap-1">
            {[-10, 10].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setB({ ...b, capacity: Math.max(10, b.capacity + d) })}
                className="h-10 rounded-xl border border-line px-3 text-[12px] font-bold text-fg-2 transition hover:border-line-strong hover:text-fg tabular"
              >
                {d > 0 ? "+" : "−"}10
              </button>
            ))}
          </div>
        </div>
      </Field>

      <Field label="Horarios">
        <div className="divide-y divide-line rounded-2xl border border-line">
          {b.hours.map((h, k) => {
            const open = h.time !== "Cerrado";
            const [from, to] = open ? h.time.split("–").map((t) => t.trim()) : ["09:00", "14:00"];
            return (
              <div key={h.days} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3.5 py-3">
                <Toggle size="sm" checked={open} onChange={(v) => setHour(k, v ? "09:00 – 14:00" : "Cerrado")} label={`${h.days} abierto`} />
                <span className="w-[76px] text-[13px] font-bold text-fg">{h.days}</span>
                {open ? (
                  <div className="ml-auto flex items-center gap-1.5">
                    <Select compact className="w-[92px]" value={from} options={TIMES} onChange={(v) => setHour(k, `${v} – ${to}`)} label="Desde" />
                    <span className="text-faint">–</span>
                    <Select compact className="w-[92px]" value={to} options={TIMES} onChange={(v) => setHour(k, `${from} – ${v}`)} label="Hasta" />
                  </div>
                ) : (
                  <span className="ml-auto text-[12.5px] font-semibold text-faint">Cerrado</span>
                )}
              </div>
            );
          })}
        </div>
      </Field>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(b)}>
          <Check className="size-4" strokeWidth={2.8} /> Aplicar cambios
        </Button>
      </div>
    </div>
  );
}

/* ── Feriados y cierres ────────────────────────────────────── */
function Closures() {
  return (
    <div className="panel stagger p-5" style={s(5)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] text-fg">
            <CalendarOff className="size-4 text-muted" /> Feriados y cierres
          </h3>
          <p className="mt-0.5 text-[12.5px] text-muted">Se avisan solos en la app 48 h antes</p>
        </div>
        <Button variant="ghost" size="sm">
          <Plus className="size-3.5" /> Agregar
        </Button>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {CLOSURES.map((c) => (
          <li key={c.label} className="flex items-center gap-3 py-2.5">
            <span
              className={cn(
                "grid w-11 shrink-0 place-items-center rounded-xl py-1 leading-none ring-1 ring-inset",
                c.tone === "rose" ? "bg-rose/10 text-rose ring-rose/20" : "bg-amber/10 text-amber ring-amber/20",
              )}
            >
              <span className="text-[16px] font-extrabold tabular">{c.day}</span>
              <span className="text-[10px] font-bold uppercase">{c.month}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold text-fg">{c.label}</span>
              <span className="block truncate text-[11.5px] text-muted">{c.detail}</span>
            </span>
            <Pill tone={c.tone} className="hidden py-0.5 text-[10.5px] sm:inline-flex">
              {c.detail === "Cerrado" ? "Cerrado" : "Horario especial"}
            </Pill>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SharedRules() {
  const [multi, setMulti] = useSetting("sedes.reglas", true);
  const [full, setFull] = useSetting("sedes.reglas", true);
  const [guest, setGuest] = useSetting("sedes.reglas", false);
  const [nearest, setNearest] = useSetting("sedes.reglas", true);
  return (
    <div className="panel stagger p-5" style={s(6)}>
      <h3 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] text-fg">
        <Users className="size-4 text-muted" /> Reglas entre sedes
      </h3>
      <p className="mt-0.5 text-[12.5px] text-muted">Valen para las 3 sedes</p>
      <div className="mt-2 divide-y divide-line">
        <SettingRow title="Planes multisede" text="Pase Libre y Corporativo entran a cualquier sede">
          <Toggle checked={multi} onChange={setMulti} label="Planes multisede" />
        </SettingRow>
        <SettingRow title="Frenar ingresos con aforo completo" text="Recepción confirma cada entrada extra">
          <Toggle checked={full} onChange={setFull} label="Frenar con aforo completo" />
        </SettingRow>
        <SettingRow title="Visitas de otras sedes" text="Planes de 1 sede: 2 visitas por mes">
          <Toggle checked={guest} onChange={setGuest} label="Visitas de otras sedes" />
        </SettingRow>
        <SettingRow title="Sugerir la sede con menos gente" text="En la app, si la suya supera el 80%">
          <Toggle checked={nearest} onChange={setNearest} label="Sugerir sede" />
        </SettingRow>
      </div>
    </div>
  );
}
