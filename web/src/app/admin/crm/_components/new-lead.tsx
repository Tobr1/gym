"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Avatar, Button } from "@/components/ui/primitives";
import { cn, money } from "@/lib/utils";
import { EV_NEW_LEAD, PLANS, SELLERS, SOURCES, type Lead, type SourceKey, type Temp } from "../_data";
import { SOURCE_ICON, TEMP_META } from "./lead-card";

/** Botón del encabezado: abre el modal del tablero vía evento. */
export function NewLeadButton() {
  return (
    <Button onClick={() => window.dispatchEvent(new Event(EV_NEW_LEAD))}>
      <Plus className="size-4" strokeWidth={2.6} /> Nuevo lead
    </Button>
  );
}

export function NewLeadModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (lead: Omit<Lead, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [source, setSource] = useState<SourceKey>("instagram");
  const [plan, setPlan] = useState(PLANS[0].label);
  const [temp, setTemp] = useState<Temp>("tibio");
  const [seller, setSeller] = useState(1);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      source,
      plan,
      value: PLANS.find((p) => p.label === plan)!.value,
      next: "Primer contacto",
      due: "Hoy",
      seller,
      temp,
      stage: "nuevo",
      age: "ahora",
      fresh: true,
    });
    setName("");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-end bg-black/60 p-0 backdrop-blur-sm sm:place-items-center sm:p-6"
          onClick={onClose}
        >
          <motion.form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="panel w-full max-w-[480px] rounded-b-none p-5 sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-fg">Nuevo lead</h2>
                <p className="mt-0.5 text-[12.5px] text-muted">Se agrega a “Nuevo contacto” y se asigna al vendedor.</p>
              </div>
              <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-fg" aria-label="Cerrar">
                <X className="size-4" />
              </button>
            </div>

            <label className="mt-5 block">
              <span className="text-[11.5px] font-semibold text-muted">Nombre y apellido</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej.: Camila Herrera"
                className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white/[0.03] px-3.5 text-[14px] text-fg placeholder:text-faint focus:border-lime/50 focus:outline-none"
              />
            </label>

            <p className="mt-4 text-[11.5px] font-semibold text-muted">Fuente</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {SOURCES.map((s) => {
                const Icon = SOURCE_ICON[s.key];
                const on = source === s.key;
                return (
                  <button
                    type="button"
                    key={s.key}
                    onClick={() => setSource(s.key)}
                    className={cn("inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-bold transition", on ? "" : "border-line text-muted hover:text-fg")}
                    style={on ? { color: s.color, borderColor: `color-mix(in oklab, ${s.color} 50%, transparent)`, background: `color-mix(in oklab, ${s.color} 12%, transparent)` } : undefined}
                  >
                    <Icon className="size-3.5" /> {s.label}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-[11.5px] font-semibold text-muted">Interés</p>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {PLANS.slice(0, 6).map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => setPlan(p.label)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left transition",
                    plan === p.label ? "border-lime/45 bg-lime/[0.08]" : "border-line hover:border-line-strong",
                  )}
                >
                  <span className={cn("block truncate text-[11.5px] font-semibold", plan === p.label ? "text-lime" : "text-fg-2")}>{p.label}</span>
                  <span className="block text-[12.5px] font-extrabold text-fg tabular">{money(p.value)}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11.5px] font-semibold text-muted">Temperatura</p>
                <div className="mt-1.5 flex rounded-xl border border-line p-1">
                  {(Object.keys(TEMP_META) as Temp[]).map((t) => {
                    const m = TEMP_META[t];
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTemp(t)}
                        className={cn("inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[12px] font-bold transition", temp === t ? "bg-surface-3 text-fg" : "text-muted")}
                      >
                        <m.icon className="size-3.5" style={{ color: m.color }} /> {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[11.5px] font-semibold text-muted">Asignar a</p>
                <div className="mt-1.5 flex gap-1">
                  {SELLERS.map((s) => (
                    <button type="button" key={s.id} onClick={() => setSeller(s.id)} title={s.name} className="rounded-full">
                      <Avatar i={s.face} size={30} className={cn("transition", seller === s.id ? "ring-2 ring-lime" : "opacity-50 hover:opacity-100")} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                <Plus className="size-4" strokeWidth={2.6} /> Crear lead
              </Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
