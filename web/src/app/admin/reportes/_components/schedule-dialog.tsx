"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CalendarClock, CalendarDays, Check, X } from "lucide-react";
import { Avatar, Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { SCHEDULED } from "../_data";

function Chips({
  value,
  set,
  opts,
}: {
  value: string;
  set: (v: string) => void;
  opts: string[];
}) {
  return (
    <div className="flex rounded-xl border border-line bg-white/[0.02] p-1 text-[12.5px] font-semibold">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => set(o)}
          className={cn(
            "flex-1 rounded-lg px-3 py-1.5 transition",
            value === o
              ? "bg-surface-3 text-fg shadow"
              : "text-muted hover:text-fg",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ── Diálogo: programar envío ─────────────────────────────────── */
export function ScheduleDialog({
  report,
  onClose,
  onDone,
}: {
  report: string;
  onClose: () => void;
  onDone: (summary: string) => void;
}) {
  const [freq, setFreq] = useState("Mensual");
  const [format, setFormat] = useState("PDF");
  const [to, setTo] = useState([
    {
      name: "Carolina Vidal",
      mail: "carolina@ironfactory.com.ar",
      face: 12,
      on: true,
    },
    {
      name: "Martín Iriarte",
      mail: "socio · martin@ironfactory.com.ar",
      face: 3,
      on: true,
    },
    {
      name: "Estudio contable",
      mail: "contaduria@estudiorios.com.ar",
      on: false,
    },
  ]);
  const when = {
    Semanal: "Todos los lunes · 08:00",
    Mensual: "Día 1 de cada mes · 08:00",
    Trimestral: "1° de ene, abr, jul y oct · 08:00",
  }[freq];
  const first = {
    Semanal: "lunes 30 de noviembre",
    Mensual: "martes 1 de diciembre",
    Trimestral: "viernes 1 de enero",
  }[freq];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Programar envío"
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="panel relative max-h-[92dvh] w-full max-w-[520px] overflow-y-auto rounded-b-none p-5 sm:rounded-b-[18px] sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-lime/12 text-lime ring-1 ring-lime/25">
            <CalendarClock className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-extrabold tracking-[-0.02em] text-fg">
              Programar envío
            </h2>
            <p className="text-[12.5px] text-muted">
              Informe de <b className="font-bold text-fg-2">{report}</b>, por
              mail, con los filtros actuales
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-fg"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
              Frecuencia
            </p>
            <Chips
              value={freq}
              set={setFreq}
              opts={["Semanal", "Mensual", "Trimestral"]}
            />
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
              <CalendarDays className="size-3.5 text-lime" /> {when} · primer
              envío el {first}
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
              Formato
            </p>
            <Chips
              value={format}
              set={setFormat}
              opts={["PDF", "Excel", "PDF + Excel"]}
            />
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
              Destinatarios
            </p>
            <ul className="space-y-1.5">
              {to.map((r, i) => (
                <li key={r.name}>
                  <button
                    onClick={() =>
                      setTo((t) =>
                        t.map((x, k) => (k === i ? { ...x, on: !x.on } : x)),
                      )
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition",
                      r.on
                        ? "border-lime/30 bg-lime/[0.05]"
                        : "border-line bg-white/[0.02] hover:bg-white/[0.04]",
                    )}
                  >
                    {r.face !== undefined ? (
                      <Avatar i={r.face} size={32} />
                    ) : (
                      <span className="grid size-8 place-items-center rounded-full bg-surface-3 text-[11px] font-extrabold text-muted">
                        ER
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold text-fg">
                        {r.name}
                      </span>
                      <span className="block truncate text-[11.5px] text-muted">
                        {r.mail}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "grid size-5 place-items-center rounded-md border transition",
                        r.on
                          ? "border-lime bg-lime text-lime-ink"
                          : "border-line-strong",
                      )}
                    >
                      {r.on && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-white/[0.02] p-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
              Ya programados
            </p>
            <ul className="space-y-1.5">
              {SCHEDULED.map((x) => (
                <li
                  key={x.name}
                  className="flex items-center gap-2 text-[12px]"
                >
                  <span className="size-1.5 rounded-full bg-lime" />
                  <span className="min-w-0 flex-1 truncate font-semibold text-fg-2">
                    {x.name}
                  </span>
                  <span className="shrink-0 text-muted">
                    {x.when} · {x.format}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!to.some((r) => r.on)}
            onClick={() =>
              onDone(
                `${freq} · ${format} · ${to.filter((r) => r.on).length} destinatarios`,
              )
            }
          >
            <CalendarClock className="size-4" /> Programar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
