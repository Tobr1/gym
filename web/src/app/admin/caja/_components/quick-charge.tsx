"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  Check,
  Delete,
  Loader2,
  MessageCircle,
  Printer,
  Search,
  ShoppingBag,
  Ticket,
  X,
  Zap,
} from "lucide-react";
import { Avatar, Kbd, Pill } from "@/components/ui/primitives";
import { MEMBERS, STATUS_META } from "@/lib/mock";
import { cn, money } from "@/lib/utils";
import { EV_MOVEMENT, EV_PREFILL, METHODS, type ConceptKey, type MethodKey, type Movement, type PrefillDetail } from "../_data";
import { METHOD_ICON } from "../_icons";

type Who = { id: string; name: string; face: number; plan: string; amount: number; status?: keyof typeof STATUS_META };

const CONCEPTS: { key: ConceptKey; label: string; icon: typeof Ticket }[] = [
  { key: "cuota", label: "Cuota", icon: CalendarCheck2 },
  { key: "matricula", label: "Matrícula", icon: BadgeCheck },
  { key: "producto", label: "Producto", icon: ShoppingBag },
  { key: "clase", label: "Clase suelta", icon: Ticket },
];

function presetsFor(concept: ConceptKey, who: Who | null) {
  const cuota = who?.amount || 48_900;
  switch (concept) {
    case "cuota":
      return [
        { label: "Cuota diciembre", amount: cuota },
        { label: "Trimestral −10%", amount: Math.round((cuota * 3 * 0.9) / 100) * 100 },
        { label: "Con recargo 10%", amount: Math.round((cuota * 1.1) / 100) * 100 },
      ];
    case "matricula":
      return [
        { label: "Matrícula", amount: 15_000 },
        { label: "Matrícula + cuota", amount: 15_000 + cuota },
        { label: "Promo 50% off", amount: 7_500 },
      ];
    case "producto":
      return [
        { label: "Proteína Whey 1 kg", amount: 38_900 },
        { label: "Shaker Pulso", amount: 9_500 },
        { label: "Toalla Pulso", amount: 12_000 },
        { label: "Agua 1,5 L", amount: 2_500 },
      ];
    case "clase":
      return [
        { label: "Clase suelta", amount: 8_500 },
        { label: "Pack 4 clases", amount: 30_000 },
        { label: "Pack 8 clases", amount: 54_000 },
      ];
  }
}

const METHOD_HINT: Record<MethodKey, React.ReactNode> = {
  efectivo: "Se suma al cajón · vuelto calculado al confirmar",
  debito: (
    <>
      <span className="size-1.5 rounded-full bg-emerald shadow-[0_0_8px_#3ddc97]" /> Posnet 01 conectado · sin recargo
    </>
  ),
  credito: "Hasta 3 cuotas sin interés · Visa / Master / Amex",
  transferencia: (
    <>
      Alias <b className="font-bold text-fg-2">IRON.FACTORY.CENTRO</b> · CBU verificado
    </>
  ),
  mp: "QR dinámico en la pantalla del mostrador",
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "del"] as const;

export function QuickCharge() {
  const initial = MEMBERS.find((m) => m.id === "1044")!;
  const [who, setWho] = useState<Who | null>({ ...initial, status: initial.status });
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState(false);
  const [concept, setConcept] = useState<ConceptKey>("cuota");
  const [amount, setAmount] = useState(initial.amount);
  const [fresh, setFresh] = useState(true); // el próximo dígito reemplaza el monto
  const [method, setMethod] = useState<MethodKey>("mp");
  const [installments, setInstallments] = useState(1);
  const [whatsapp, setWhatsapp] = useState(true);
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [receipt, setReceipt] = useState(4428);
  const [flash, setFlash] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MEMBERS.filter((m) => !q || m.name.toLowerCase().includes(q) || m.id.includes(q)).slice(0, 5);
  }, [query]);

  const presets = presetsFor(concept, who);

  // Prefill desde la lista de deudores
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const d = (e as CustomEvent<PrefillDetail>).detail;
      const m = MEMBERS.find((x) => x.id === d.memberId);
      setWho({ id: d.memberId ?? "—", name: d.name, face: d.face, plan: d.plan, amount: d.amount, status: m?.status ?? "vencido" });
      setConcept("cuota");
      setAmount(d.amount);
      setFresh(true);
      setPhase("idle");
      root.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlash(true);
      setTimeout(() => setFlash(false), 1200);
    };
    window.addEventListener(EV_PREFILL, onPrefill);
    return () => window.removeEventListener(EV_PREFILL, onPrefill);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  function pickConcept(c: ConceptKey) {
    setConcept(c);
    setAmount(presetsFor(c, who)[0].amount);
    setFresh(true);
  }

  function press(k: (typeof KEYS)[number]) {
    if (k === "del") {
      setAmount((a) => Math.floor(a / 10));
      setFresh(false);
      return;
    }
    setAmount((a) => {
      const base = fresh ? 0 : a;
      const next = Number(`${base}${k}`);
      return next > 9_999_999 ? a : next;
    });
    setFresh(false);
  }

  function selectMember(m: (typeof MEMBERS)[number]) {
    setWho({ ...m });
    setQuery("");
    setFocus(false);
    if (concept === "cuota") {
      setAmount(m.amount || 48_900);
      setFresh(true);
    }
  }

  function charge() {
    if (!amount || phase !== "idle") return;
    setPhase("loading");
    timer.current = setTimeout(() => {
      const now = new Date();
      const conceptLabel =
        concept === "cuota"
          ? `Cuota ${who?.plan ?? ""} · Dic`
          : concept === "matricula"
            ? "Matrícula"
            : concept === "producto"
              ? (presets.find((p) => p.amount === amount)?.label ?? "Producto")
              : "Clase suelta";
      const mv: Movement = {
        id: `n${now.getTime()}`,
        time: now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
        who: who?.name ?? "Visitante",
        face: who?.face,
        concept: conceptLabel,
        kind: concept,
        method,
        receipt: method === "mp" ? `MP 8812·${4471 + receipt - 4427}` : `Recibo X 0001-0000${receipt}`,
        amount,
        status: method === "transferencia" ? "pendiente" : "acreditado",
        fresh: true,
      };
      window.dispatchEvent(new CustomEvent(EV_MOVEMENT, { detail: mv }));
      setPhase("done");
      timer.current = setTimeout(reset, 4200);
    }, 850);
  }

  function reset() {
    clearTimeout(timer.current);
    setPhase("idle");
    setReceipt((r) => r + 1);
    setFresh(true);
  }

  const methodMeta = METHODS.find((m) => m.key === method)!;
  const perInstallment = Math.round(amount / installments);

  return (
    <article
      id="cobro"
      ref={root}
      className={cn(
        "panel stagger relative flex scroll-mt-24 flex-col overflow-hidden p-5 transition-shadow duration-500 sm:p-6",
        flash && "ring-2 ring-lime/60",
      )}
      style={{ "--i": 2 } as React.CSSProperties}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/50 to-transparent" />

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-lime text-lime-ink shadow-[0_0_20px_-4px_rgb(181_245_74/0.7)]">
            <Zap className="size-[18px]" strokeWidth={2.4} />
          </span>
          <div className="leading-tight">
            <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">Cobro rápido</h3>
            <p className="text-[12px] text-muted">Registrá un pago en segundos</p>
          </div>
        </div>
        <Kbd>F2</Kbd>
      </div>

      {/* Socio */}
      <div className="relative mt-5">
        {who && !focus ? (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.025] p-2.5 pr-2">
            <Avatar i={who.face} size={40} ring />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-bold text-fg">{who.name}</p>
              <p className="truncate text-[11.5px] text-muted">
                #{who.id} · {who.plan}
              </p>
            </div>
            {who.status && (
              <Pill tone={STATUS_META[who.status].tone} dot className="hidden sm:inline-flex">
                {STATUS_META[who.status].label}
              </Pill>
            )}
            <button
              onClick={() => setFocus(true)}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-fg"
              aria-label="Cambiar socio"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <label className="flex h-[62px] items-center gap-2.5 rounded-xl border border-lime/40 bg-white/[0.03] px-3.5 shadow-[0_0_0_4px_rgb(181_245_74/0.06)]">
            <Search className="size-4 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => setTimeout(() => setFocus(false), 150)}
              placeholder="Buscá socio por nombre o N.º"
              className="flex-1 bg-transparent text-[14px] text-fg placeholder:text-muted focus:outline-none"
            />
          </label>
        )}
        <AnimatePresence>
          {focus && (
            <motion.ul
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-line-strong bg-surface-2/95 p-1 shadow-2xl backdrop-blur-xl"
            >
              {results.map((m) => (
                <li key={m.id}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectMember(m)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/[0.06]"
                  >
                    <Avatar i={m.face} size={28} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-fg">{m.name}</span>
                      <span className="block truncate text-[11px] text-muted">
                        #{m.id} · {m.plan}
                      </span>
                    </span>
                    <span className="text-[12px] font-bold text-fg-2 tabular">{m.amount ? money(m.amount) : "—"}</span>
                  </button>
                </li>
              ))}
              {!results.length && <li className="px-3 py-3 text-[12.5px] text-muted">Sin resultados para “{query}”</li>}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Concepto */}
      <div className="mt-4 grid grid-cols-4 gap-1.5 rounded-xl border border-line bg-ink/40 p-1">
        {CONCEPTS.map((c) => {
          const on = concept === c.key;
          return (
            <button
              key={c.key}
              onClick={() => pickConcept(c.key)}
              className={cn(
                "relative flex h-[50px] flex-col items-center justify-center gap-1 rounded-[9px] text-[11px] font-bold transition-colors",
                on ? "text-lime" : "text-muted hover:text-fg",
              )}
            >
              {on && (
                <motion.span
                  layoutId="concept-pill"
                  className="absolute inset-0 rounded-[9px] bg-lime/[0.10] ring-1 ring-inset ring-lime/35"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <c.icon className="relative size-4" />
              <span className="relative whitespace-nowrap">{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Monto */}
      <div className="mt-4 rounded-2xl border border-line bg-ink/50 p-4">
        <div className="flex items-center justify-between text-[11.5px] font-semibold text-muted">
          <span>Monto a cobrar</span>
          {method === "credito" && installments > 1 && (
            <span className="tabular text-violet">
              {installments} × {money(perInstallment)}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <motion.p
            key={amount}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "truncate text-[40px] font-extrabold leading-none tracking-[-0.045em] tabular",
              amount ? "text-fg" : "text-faint",
            )}
          >
            {money(amount)}
          </motion.p>
          <span className="mb-1 h-8 w-[2px] animate-pulse self-end rounded bg-lime/70" />
        </div>

        <div className="mt-4 grid grid-cols-[1fr_minmax(0,0.95fr)] gap-3">
          {/* Teclado */}
          <div className="grid grid-cols-3 gap-1.5">
            {KEYS.map((k) => (
              <button
                key={k}
                onClick={() => press(k)}
                className={cn(
                  "grid h-10 place-items-center rounded-[10px] border border-line bg-white/[0.03] text-[16px] font-bold text-fg tabular transition-all hover:border-line-strong hover:bg-white/[0.07] active:scale-95 active:bg-lime/15",
                  k === "000" && "text-[13px] text-fg-2",
                  k === "del" && "text-muted",
                )}
                aria-label={k === "del" ? "Borrar" : k}
              >
                {k === "del" ? <Delete className="size-[18px]" /> : k}
              </button>
            ))}
          </div>
          {/* Atajos */}
          <div className="flex flex-col gap-1.5">
            {presets.map((p) => {
              const on = p.amount === amount;
              return (
                <button
                  key={p.label}
                  onClick={() => {
                    setAmount(p.amount);
                    setFresh(true);
                  }}
                  className={cn(
                    "flex min-h-10 flex-1 flex-col justify-center rounded-[10px] border px-2.5 text-left transition-all",
                    on
                      ? "border-lime/45 bg-lime/[0.08] shadow-[0_0_16px_-8px_rgb(181_245_74/0.8)]"
                      : "border-line bg-white/[0.02] hover:border-line-strong hover:bg-white/[0.05]",
                  )}
                >
                  <span className={cn("truncate text-[11px] font-semibold", on ? "text-lime" : "text-muted")}>{p.label}</span>
                  <span className="text-[13px] font-extrabold text-fg tabular">{money(p.amount)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Medio de pago */}
      <div className="mt-4">
        <p className="mb-2 text-[11.5px] font-semibold text-muted">Medio de pago</p>
        <div className="grid grid-cols-5 gap-1.5">
          {METHODS.map((m) => {
            const Icon = METHOD_ICON[m.key];
            const on = method === m.key;
            return (
              <button
                key={m.key}
                onClick={() => {
                  setMethod(m.key);
                  if (m.key !== "credito") setInstallments(1);
                }}
                className={cn(
                  "flex h-[58px] flex-col items-center justify-center gap-1 rounded-xl border text-[10.5px] font-bold transition-all hover:-translate-y-0.5",
                  on ? "text-fg" : "border-line bg-white/[0.02] text-muted hover:border-line-strong hover:text-fg",
                )}
                style={
                  on
                    ? {
                        borderColor: `color-mix(in oklab, ${m.color} 55%, transparent)`,
                        background: `color-mix(in oklab, ${m.color} 12%, transparent)`,
                        boxShadow: `0 0 20px -8px ${m.color}`,
                      }
                    : undefined
                }
              >
                <Icon className="size-[18px]" style={{ color: on ? m.color : undefined }} />
                <span className="whitespace-nowrap">{m.short}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2.5 flex min-h-7 flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-[11.5px] text-muted">{METHOD_HINT[method]}</p>
          {method === "credito" && (
            <div className="flex rounded-lg border border-line p-0.5 text-[11px] font-bold">
              {[1, 3, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setInstallments(n)}
                  className={cn("rounded-md px-2 py-0.5 transition", installments === n ? "bg-violet text-ink" : "text-muted hover:text-fg")}
                >
                  {n}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmación */}
      <div className="mt-auto pt-4">
        <button
          onClick={() => setWhatsapp((w) => !w)}
          className="mb-3 flex w-full items-center gap-2.5 text-left text-[12px] font-semibold text-fg-2"
        >
          <span
            className={cn(
              "relative h-[18px] w-8 shrink-0 rounded-full transition-colors",
              whatsapp ? "bg-emerald" : "bg-white/12",
            )}
          >
            <span
              className={cn(
                "absolute top-[2px] size-[14px] rounded-full bg-white shadow transition-all",
                whatsapp ? "left-[16px]" : "left-[2px]",
              )}
            />
          </span>
          <MessageCircle className="size-3.5 text-emerald" />
          Enviar comprobante por WhatsApp
        </button>
        <button
          onClick={charge}
          disabled={!amount}
          className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-[14px] bg-lime text-[17px] font-extrabold tracking-[-0.01em] text-lime-ink shadow-[0_10px_36px_-8px_rgb(181_245_74/0.65)] transition-all hover:bg-[#c4fa66] hover:shadow-[0_12px_44px_-6px_rgb(181_245_74/0.8)] active:scale-[0.985] disabled:opacity-40"
        >
          <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/35 blur-md transition-transform duration-700 group-hover:translate-x-[420%]" />
          {phase === "loading" ? (
            <>
              <Loader2 className="size-5 animate-spin" /> Procesando…
            </>
          ) : (
            <>
              Cobrar <span className="tabular">{money(amount)}</span>
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.6} />
            </>
          )}
        </button>
        <p className="mt-2 text-center text-[11px] text-faint">
          Factura B automática · {methodMeta.label}
        </p>
      </div>

      {/* Éxito */}
      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-surface/[0.96] p-6 text-center backdrop-blur-md"
          >
            <div className="dots pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
            <div className="relative grid size-24 place-items-center">
              <span className="absolute inset-0 rounded-full bg-lime/30 animate-pulse-ring" />
              <span className="absolute inset-0 rounded-full bg-lime/20 animate-pulse-ring [animation-delay:.5s]" />
              <motion.span
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
                className="relative grid size-20 place-items-center rounded-full bg-lime shadow-[0_0_50px_-6px_rgb(181_245_74/0.9)]"
              >
                <svg viewBox="0 0 24 24" className="size-10 text-lime-ink" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <motion.path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
                  />
                </svg>
              </motion.span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="relative"
            >
              <p className="mt-6 text-[13px] font-semibold text-lime">¡Cobro registrado!</p>
              <p className="mt-1 text-[40px] font-extrabold leading-none tracking-[-0.045em] text-fg tabular">{money(amount)}</p>
              <p className="mt-2 text-[12.5px] text-muted">
                {who?.name ?? "Visitante"} · {methodMeta.label}
              </p>
              <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[11.5px] font-semibold text-fg-2">
                <Check className="size-3.5 text-emerald" /> Recibo X 0001-0000{receipt}
                {whatsapp && <span className="text-muted">· enviado por WhatsApp</span>}
              </div>
              <div className="mt-6 flex justify-center gap-2">
                <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-line-strong bg-surface-2 px-4 text-[13px] font-semibold text-fg transition hover:bg-surface-3">
                  <Printer className="size-4" /> Imprimir
                </button>
                <button
                  onClick={reset}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-lime px-4 text-[13px] font-bold text-lime-ink transition hover:bg-[#c4fa66]"
                >
                  Nuevo cobro <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
