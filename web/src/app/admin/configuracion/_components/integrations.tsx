"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowUpRight, Blocks, Check, Copy, KeyRound, Loader2, Plug, ScanLine, Settings2, Webhook } from "lucide-react";
import { Button, Pill } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { INTEGRATIONS, type Integration, type IntegrationKey } from "../_data";
import { SectionHead, s } from "./controls";

export function IntegrationsSection() {
  const [connected, setConnected] = useState<Record<IntegrationKey, boolean>>(
    () => Object.fromEntries(INTEGRATIONS.map((x) => [x.key, x.connected])) as Record<IntegrationKey, boolean>,
  );
  const [busy, setBusy] = useState<IntegrationKey | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const total = Object.values(connected).filter(Boolean).length;
  const connect = (k: IntegrationKey) => {
    setBusy(k);
    timer.current = setTimeout(() => {
      setConnected((c) => ({ ...c, [k]: true }));
      setBusy(null);
    }, 1300);
  };

  return (
    <section className="@container">
      <SectionHead
        icon={Blocks}
        title="Integraciones"
        text={
          <>
            <span className="font-semibold text-fg-2 tabular">
              {total} de {INTEGRATIONS.length}
            </span>{" "}
            conectadas · todo sincronizado hace 1 min
          </>
        }
      >
        <Button variant="ghost">
          Pedir una integración <ArrowUpRight className="size-4" />
        </Button>
      </SectionHead>

      <div className="grid gap-3 @2xl:grid-cols-2">
        {INTEGRATIONS.map((x, i) => (
          <IntegrationCard key={x.key} x={x} i={i} on={connected[x.key]} busy={busy === x.key} onConnect={() => connect(x.key)} />
        ))}
      </div>

      <Developers />
    </section>
  );
}

const FRESH_NOTE: Partial<Record<IntegrationKey, string>> = {
  gcal: "Sincronizando las clases de las 3 sedes…",
  zapier: "Listo: creá tu primer Zap desde el panel de Zapier",
};

function Logo({ x, size = 44 }: { x: Integration; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[14px] text-[14px] font-extrabold tracking-[-0.02em] shadow-[0_8px_20px_-8px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.25)]"
      style={{ background: x.tile, color: x.ink, width: size, height: size }}
    >
      {x.mono || <ScanLine className="size-5" strokeWidth={2.4} />}
    </span>
  );
}

function IntegrationCard({ x, i, on, busy, onConnect }: { x: Integration; i: number; on: boolean; busy: boolean; onConnect: () => void }) {
  const fresh = on && !x.connected;
  return (
    <article
      className={cn(
        "stagger group relative flex flex-col rounded-[var(--radius-2xl)] p-5 transition-all duration-300 hover:-translate-y-0.5",
        on ? "panel hover:border-line-strong" : "border border-dashed border-line-strong bg-white/[0.012] hover:border-white/20",
      )}
      style={s(i + 1)}
    >
      {on && (
        <span
          className="pointer-events-none absolute -left-10 -top-10 size-32 rounded-full opacity-[0.08] blur-2xl"
          style={{ background: x.tile }}
        />
      )}
      <div className="relative flex items-start gap-3.5">
        <span className={cn(!on && "opacity-70 grayscale-[0.4]")}>
          <Logo x={x} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-extrabold tracking-[-0.01em] text-fg">{x.name}</h3>
              <p className="text-[11.5px] font-semibold text-muted">{x.category}</p>
            </div>
            {on ? (
              <Pill tone="lime" dot className="shrink-0 py-0.5 text-[10.5px]">
                {fresh ? "Recién conectado" : "Conectado"}
              </Pill>
            ) : (
              <Pill tone="neutral" className="shrink-0 py-0.5 text-[10.5px]">
                No conectado
              </Pill>
            )}
          </div>
        </div>
      </div>

      <p className="relative mt-3 text-[12.5px] leading-snug text-fg-2">{x.desc}</p>

      {on ? (
        <>
          {x.metric && (
            <div className="relative mt-4 flex items-end justify-between gap-3 rounded-xl border border-line bg-ink/30 px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted">{x.metric.label}</p>
                <p className="text-[20px] font-extrabold leading-tight tracking-[-0.03em] text-fg tabular">{x.metric.value}</p>
              </div>
              <MiniActivity seed={x.key.length + i} color={x.tile === "#E8EEF6" ? "var(--color-fg-2)" : x.tile} />
            </div>
          )}
          {(fresh || x.detail) && (
            <p className={cn("relative mt-3 truncate text-[11.5px]", fresh ? "font-semibold text-lime" : "text-muted")}>
              {fresh ? FRESH_NOTE[x.key] : x.detail}
            </p>
          )}
          {x.warn && (
            <p className="relative mt-2 flex items-center gap-1.5 rounded-lg bg-amber/[0.08] px-2.5 py-1.5 text-[11.5px] font-semibold text-amber">
              <AlertTriangle className="size-3.5 shrink-0" /> {x.warn}
            </p>
          )}
          <div className="relative mt-auto flex items-center gap-2 pt-4">
            <Button variant="secondary" size="sm">
              <Settings2 className="size-3.5" /> Configurar
            </Button>
            <Button variant="ghost" size="sm" className="text-muted">
              Ver registros
            </Button>
          </div>
        </>
      ) : (
        <div className="relative mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="text-[11.5px] text-muted">
            {x.key === "gcal" ? <span className="font-bold text-lime">Recomendado · </span> : null}Se configura en 2 minutos
          </p>
          <Button size="sm" variant={x.key === "gcal" ? "primary" : "secondary"} onClick={onConnect} disabled={busy}>
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Plug className="size-3.5" />}
            {busy ? "Conectando…" : "Conectar"}
          </Button>
        </div>
      )}
    </article>
  );
}

/** Barras de actividad de los últimos 14 días (decorativas, deterministas). */
function MiniActivity({ seed, color }: { seed: number; color: string }) {
  const bars = Array.from({ length: 14 }, (_, k) => 0.35 + (((k * 7 + seed * 13) % 11) / 11) * 0.65);
  return (
    <div className="flex h-8 items-end gap-[3px]" aria-hidden>
      {bars.map((h, k) => (
        <span
          key={k}
          className="w-[4px] rounded-full"
          style={{ height: `${h * 100}%`, background: color, opacity: k === bars.length - 1 ? 1 : 0.28 + (k / bars.length) * 0.4 }}
        />
      ))}
    </div>
  );
}

function Developers() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (k: string, v: string) => {
    navigator.clipboard?.writeText(v).catch(() => {});
    setCopied(k);
    setTimeout(() => setCopied(null), 1600);
  };
  const rows = [
    { k: "key", icon: KeyRound, label: "Clave de API", value: "pk_iron_••••••••••••7f3a", raw: "pk_iron_demo_7f3a" },
    { k: "hook", icon: Webhook, label: "Webhook de pagos", value: "https://api.ironfactory.com.ar/pulso/pagos", raw: "https://api.ironfactory.com.ar/pulso/pagos" },
  ];
  return (
    <div className="panel stagger mt-4 p-5" style={s(8)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">Para desarrolladores</h3>
          <p className="text-[12.5px] text-muted">API REST y webhooks para conectar tu propio sistema</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted">
          <span className="size-1.5 rounded-full bg-lime" /> 0 errores en las últimas 24 h
        </span>
      </div>
      <div className="mt-3 grid gap-2 @2xl:grid-cols-2">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center gap-3 rounded-xl border border-line bg-ink/40 py-2 pl-3 pr-2">
            <r.icon className="size-4 shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-muted">{r.label}</p>
              <p className="truncate font-mono text-[12px] text-fg-2">{r.value}</p>
            </div>
            <button
              type="button"
              onClick={() => copy(r.k, r.raw)}
              aria-label={`Copiar ${r.label}`}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-fg"
            >
              {copied === r.k ? <Check className="size-4 text-lime" /> : <Copy className="size-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
