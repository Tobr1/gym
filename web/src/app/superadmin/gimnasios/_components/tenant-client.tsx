"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Ban, Check, Eye, Lock, Repeat2, ShieldCheck, X } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/primitives";
import { cn, money } from "@/lib/utils";
import type { TenantPlan } from "../../_data";
import type { Flag } from "../_lib/detail";

type Dialog = "impersonate" | "plan" | "suspend" | null;

const PLANS: { name: TenantPlan; price: number | null; desc: string }[] = [
  { name: "Starter", price: 39_900, desc: "Hasta 200 socios" },
  { name: "Pro", price: 79_900, desc: "Socios ilimitados" },
  { name: "Cadena", price: null, desc: "Multisede · a medida" },
];

export function TenantActions({
  name,
  owner,
  plan,
  sedes,
  suspended,
}: {
  name: string;
  owner: string;
  plan: TenantPlan;
  sedes: number;
  suspended: boolean;
}) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [nextPlan, setNextPlan] = useState<TenantPlan>(plan === "Starter" ? "Pro" : plan === "Pro" ? "Cadena" : "Cadena");

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDialog(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialog]);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <Button size="lg" className="col-span-2 sm:col-span-1" onClick={() => setDialog("impersonate")}>
          <Eye className="size-[18px] shrink-0" /> Ver como dueño
        </Button>
        <Button variant="secondary" size="lg" onClick={() => setDialog("plan")}>
          <Repeat2 className="size-[18px] shrink-0" /> Cambiar plan
        </Button>
        <Button variant="danger" size="lg" onClick={() => setDialog("suspend")}>
          <Ban className="size-[18px] shrink-0" /> {suspended ? "Reactivar" : "Suspender"}
        </Button>
      </div>

      {dialog && (
        <div className="fixed inset-0 z-[60] grid place-items-end bg-black/60 p-0 backdrop-blur-sm animate-fade-in sm:place-items-center sm:p-6" onClick={() => setDialog(null)}>
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="panel w-full max-w-[460px] animate-fade-up rounded-b-none p-5 sm:rounded-b-[18px] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[17px] font-extrabold tracking-[-0.02em] text-fg">
                  {dialog === "impersonate" ? "Ver el panel como dueño" : dialog === "plan" ? "Cambiar plan" : suspended ? "Reactivar cuenta" : "Suspender cuenta"}
                </p>
                <p className="mt-1 text-[13px] text-muted">{name}</p>
              </div>
              <button onClick={() => setDialog(null)} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-fg" aria-label="Cerrar">
                <X className="size-4" />
              </button>
            </div>

            {dialog === "impersonate" && (
              <>
                <div className="mt-5 rounded-xl border border-line bg-ink/50 p-3.5 text-[13px] leading-relaxed text-fg-2">
                  Vas a ver el panel con los permisos de <b className="text-fg">{owner}</b> (dueño). La sesión dura 30 min, es de solo lectura
                  para pagos y queda registrada en Auditoría.
                </div>
                <p className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-muted">
                  <ShieldCheck className="size-4 text-lime" /> El dueño recibe un aviso por email.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setDialog(null)}>
                    Cancelar
                  </Button>
                  <Link href="/admin" className={buttonClass("primary", "md")}>
                    Iniciar sesión como dueño <ArrowRight className="size-4" />
                  </Link>
                </div>
              </>
            )}

            {dialog === "plan" && (
              <>
                <div className="mt-5 grid gap-2">
                  {PLANS.map((p) => {
                    const sel = nextPlan === p.name;
                    const current = plan === p.name;
                    return (
                      <button
                        key={p.name}
                        disabled={current}
                        onClick={() => setNextPlan(p.name)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3.5 text-left transition",
                          sel ? "border-lime/50 bg-lime/[0.06]" : "border-line hover:border-line-strong",
                          current && "opacity-55",
                        )}
                      >
                        <span className={cn("grid size-5 place-items-center rounded-full border", sel ? "border-lime bg-lime text-lime-ink" : "border-line-strong")}>
                          {sel && <Check className="size-3" strokeWidth={3.2} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-bold text-fg">
                            {p.name} {current && <span className="text-[11px] font-semibold text-muted">· actual</span>}
                          </span>
                          <span className="block text-[12px] text-muted">{p.desc}</span>
                        </span>
                        <span className="text-right text-[13px] font-bold text-fg tabular">
                          {p.price ? (
                            <>
                              {money(p.price * sedes)}
                              <span className="block text-[11px] font-semibold text-muted">
                                {sedes} × {money(p.price)}
                              </span>
                            </>
                          ) : (
                            "A medida"
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[12px] text-muted">El cambio se prorratea desde hoy y se ve en la factura del mar 1 dic.</p>
                <div className="mt-5 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setDialog(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setDialog(null)}>Confirmar cambio</Button>
                </div>
              </>
            )}

            {dialog === "suspend" && (
              <>
                <div className={cn("mt-5 rounded-xl border p-3.5 text-[13px] leading-relaxed", suspended ? "border-line bg-ink/50 text-fg-2" : "border-rose/30 bg-rose/[0.07] text-fg-2")}>
                  {suspended
                    ? "La cuenta vuelve a operar: se reactivan el panel, la app del socio y los lectores de acceso."
                    : "Se bloquea el panel del staff y la app del socio. Los lectores QR siguen dejando pasar a los socios al día durante 72 h."}
                </div>
                {!suspended && (
                  <label className="mt-4 block">
                    <span className="text-[12px] font-semibold text-muted">Motivo (queda en Auditoría)</span>
                    <select className="mt-1.5 h-10 w-full rounded-xl border border-line bg-ink-2 px-3 text-[13px] font-semibold text-fg focus:border-lime/40 focus:outline-none">
                      <option>Falta de pago</option>
                      <option>Pedido del cliente</option>
                      <option>Uso indebido</option>
                    </select>
                  </label>
                )}
                <div className="mt-5 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setDialog(null)}>
                    Cancelar
                  </Button>
                  <Button variant={suspended ? "primary" : "danger"} onClick={() => setDialog(null)}>
                    {suspended ? "Reactivar" : "Suspender cuenta"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function FlagList({ flags }: { flags: Flag[] }) {
  const [state, setState] = useState(() => Object.fromEntries(flags.map((f) => [f.key, f.on])));
  const onCount = Object.values(state).filter(Boolean).length;
  return (
    <>
      <p className="mt-0.5 text-[12.5px] text-muted">
        <span className="font-bold text-fg tabular">{onCount}</span> de {flags.length} activas para esta cuenta
      </p>
      <ul className="mt-3 divide-y divide-line/70">
        {flags.map((f) => {
          const on = state[f.key];
          return (
            <li key={f.key} className="flex items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[13px] font-bold text-fg">
                  <span className="truncate">{f.label}</span>
                  {f.stage && (
                    <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.1em]", f.stage === "Beta" ? "bg-violet/12 text-violet" : "bg-amber/12 text-amber")}>
                      {f.stage}
                    </span>
                  )}
                </span>
                <span className="block truncate text-[11.5px] text-muted">
                  {f.locked ? (
                    <span className="inline-flex items-center gap-1">
                      <Lock className="size-3" /> {f.locked}
                    </span>
                  ) : (
                    f.hint
                  )}
                </span>
              </span>
              <button
                role="switch"
                aria-checked={on}
                aria-label={f.label}
                disabled={!!f.locked}
                onClick={() => setState((s) => ({ ...s, [f.key]: !s[f.key] }))}
                className={cn(
                  "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40",
                  on ? "bg-lime shadow-[0_0_14px_-2px_rgb(181_245_74/0.6)]" : "bg-white/[0.1]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-4 rounded-full transition-all duration-300",
                    on ? "left-[18px] bg-lime-ink" : "left-0.5 bg-fg-2",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
