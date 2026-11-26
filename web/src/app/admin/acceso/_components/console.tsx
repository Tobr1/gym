"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import {
  Ban,
  Banknote,
  Check,
  CircleX,
  CornerDownLeft,
  Delete,
  DoorOpen,
  Flame,
  IdCard,
  LogIn,
  MessageCircle,
  Nfc,
  Pause,
  Play,
  QrCode,
  RefreshCcw,
  ScanLine,
  Search,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { Pill } from "@/components/ui/primitives";
import { face, PHOTO } from "@/lib/photos";
import { cn, money } from "@/lib/utils";
import {
  type AccessState,
  CHECKIN_URL,
  clock,
  type FeedItem,
  INITIAL_FEED,
  PEOPLE,
  type Scan,
  SEQUENCE,
  stateOf,
} from "../_lib/data";

const ROTATE_MS = 3500;
const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

/* ── Estado ────────────────────────────────────────────────── */
type St = {
  scan: Scan;
  seq: number;
  pos: number;
  feed: FeedItem[];
  ins: number;
  inside: number;
  rejected: number;
};

type Action = { type: "next" } | { type: "show"; scan: Scan };

function apply(st: St, scan: Scan, pos: number): St {
  const seq = st.seq + 1;
  const ok = scan.state !== "vencida";
  return {
    scan,
    seq,
    pos,
    feed: [
      {
        key: `n${seq}`,
        name: scan.person.name,
        face: scan.person.face,
        plan: scan.person.plan,
        time: clock(seq),
        door: scan.door,
        method: scan.method,
        state: scan.state,
      },
      ...st.feed,
    ].slice(0, 7),
    ins: st.ins + (ok ? 1 : 0),
    inside: Math.min(140, st.inside + (ok ? 1 : 0)),
    rejected: st.rejected + (ok ? 0 : 1),
  };
}

function reducer(st: St, a: Action): St {
  if (a.type === "next") {
    const pos = (st.pos + 1) % SEQUENCE.length;
    return apply(st, SEQUENCE[pos], pos);
  }
  return apply(st, a.scan, st.pos);
}

const first = SEQUENCE[0];
const INITIAL: St = {
  scan: first,
  seq: 0,
  pos: 0,
  feed: [
    { key: "n0", name: first.person.name, face: first.person.face, plan: first.person.plan, time: clock(0), door: first.door, method: first.method, state: first.state },
    ...INITIAL_FEED.slice(0, 6),
  ],
  ins: 214,
  inside: 86,
  rejected: 7,
};

/* ── Tonos ─────────────────────────────────────────────────── */
const TONE = {
  ok: {
    text: "text-lime",
    solid: "bg-lime text-lime-ink",
    ring: "border-lime",
    card: "border-lime/50 shadow-[0_0_0_1px_rgb(181_245_74/0.15)_inset,0_0_80px_-20px_rgb(181_245_74/0.55)]",
    glow: "rgb(181 245 74 / 0.22)",
    head: "ACCESO PERMITIDO",
    icon: Check,
  },
  vencida: {
    text: "text-rose",
    solid: "bg-rose text-white",
    ring: "border-rose",
    card: "border-rose/50 shadow-[0_0_0_1px_rgb(255_95_126/0.15)_inset,0_0_80px_-20px_rgb(255_95_126/0.55)]",
    glow: "rgb(255 95 126 / 0.22)",
    head: "CUOTA VENCIDA",
    icon: X,
  },
  "por-vencer": {
    text: "text-amber",
    solid: "bg-amber text-ink",
    ring: "border-amber",
    card: "border-amber/50 shadow-[0_0_0_1px_rgb(255_190_85/0.15)_inset,0_0_80px_-20px_rgb(255_190_85/0.5)]",
    glow: "rgb(255 190 85 / 0.2)",
    head: "POR VENCER",
    icon: TriangleAlert,
  },
} as const;

/* ── Consola ───────────────────────────────────────────────── */
export function AccessConsole() {
  const [st, dispatch] = useReducer(reducer, INITIAL);
  const [paused, setPaused] = useState(false);
  const resume = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => dispatch({ type: "next" }), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => () => {
    if (resume.current) clearTimeout(resume.current);
  }, []);

  /** Muestra un escaneo manual y pausa la rotación unos segundos. */
  const show = (scan: Scan) => {
    dispatch({ type: "show", scan });
    setPaused(true);
    if (resume.current) clearTimeout(resume.current);
    resume.current = setTimeout(() => setPaused(false), 9000);
  };

  const simulate = (state: AccessState) => {
    const pool = PEOPLE.filter((p) => stateOf(p) === state);
    const person = pool[st.seq % pool.length];
    show({ person, state, door: "Molinete 1", method: "QR app" });
  };

  return (
    <>
      {/* ── Escenario principal ─────────────────────────── */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.3fr)]">
        <div className="order-2 min-w-0 xl:order-1">
          <Scanner />
        </div>
        <div className="order-1 min-w-0 xl:order-2">
          <ResultCard
            scan={st.scan}
            seq={st.seq}
            paused={paused}
            onSimulate={simulate}
            onTogglePause={() => {
              if (resume.current) clearTimeout(resume.current);
              setPaused((p) => !p);
            }}
          />
        </div>
      </section>

      {/* ── Contadores + manual + feed ──────────────────── */}
      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.3fr)]">
        <div className="grid min-w-0 grid-cols-1 content-start gap-4">
          <Counters ins={st.ins} inside={st.inside} rejected={st.rejected} />
          <ManualSearch onFound={(p) => show({ person: p, state: stateOf(p), door: "Molinete 1", method: "DNI manual" })} />
        </div>
        <LiveFeed feed={st.feed} />
      </section>
    </>
  );
}

/* ── Escáner ───────────────────────────────────────────────── */
function Scanner() {
  return (
    <article className="panel stagger relative flex h-full flex-col overflow-hidden p-5 sm:p-6" style={s(2)}>
      <style>{`
        @keyframes acc-scan { 0%,100% { top: 7%; } 50% { top: 91%; } }
        @keyframes acc-blink { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
      `}</style>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] text-fg">
            <ScanLine className="size-[18px] text-lime" /> Escáner de ingreso
          </h3>
          <p className="mt-0.5 text-[12.5px] text-muted">Cámara frontal · Molinete 1</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-rose/12 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-rose ring-1 ring-inset ring-rose/25">
          <span className="size-1.5 rounded-full bg-rose" style={{ animation: "acc-blink 1.2s ease-in-out infinite" }} />
          REC
        </span>
      </div>

      <div className="mt-5 flex flex-1 flex-col md:max-xl:flex-row md:max-xl:items-center md:max-xl:gap-8">
      {/* Visor */}
      <div className="relative mx-auto aspect-square w-full max-w-[380px] shrink-0 overflow-hidden rounded-[26px] border border-white/10 bg-ink md:max-xl:mx-0 md:max-xl:w-[300px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PHOTO.gymFloor(800, 800)}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-[3px] grayscale"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgb(11_16_24/0.9)_80%)]" />
        <div className="dots absolute inset-0 opacity-50" />

        {/* QR del gimnasio */}
        <div className="absolute inset-[19%] grid place-items-center rounded-[20px] bg-[#EEF3F8] p-[5%] shadow-[0_0_60px_-10px_rgb(181_245_74/0.45)]">
          <QRCodeSVG
            value={CHECKIN_URL}
            level="H"
            bgColor="#EEF3F8"
            fgColor="#0B1018"
            marginSize={0}
            style={{ width: "100%", height: "100%" }}
          />
          <span className="absolute grid size-[22%] place-items-center rounded-[22%] bg-[#EEF3F8] p-[3%]">
            <LogoMark className="size-full" />
          </span>
        </div>

        {/* Esquinas */}
        {[
          "left-4 top-4 border-l-[3px] border-t-[3px] rounded-tl-[18px]",
          "right-4 top-4 border-r-[3px] border-t-[3px] rounded-tr-[18px]",
          "left-4 bottom-4 border-b-[3px] border-l-[3px] rounded-bl-[18px]",
          "right-4 bottom-4 border-b-[3px] border-r-[3px] rounded-br-[18px]",
        ].map((c) => (
          <span key={c} className={cn("absolute size-12 border-lime drop-shadow-[0_0_8px_rgb(181_245_74/0.8)] sm:size-14", c)} />
        ))}

        {/* Línea de escaneo */}
        <div className="absolute inset-x-[8%] h-0" style={{ animation: "acc-scan 2.6s ease-in-out infinite" }}>
          <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-lime/20" />
          <div className="absolute inset-x-0 top-0 h-[3px] rounded-full bg-lime shadow-[0_0_18px_4px_rgb(181_245_74/0.75)]" />
        </div>

        <span className="absolute left-1/2 top-[7%] -translate-x-1/2 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-fg-2 backdrop-blur">
          ALINEÁ EL CÓDIGO
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
      <div className="mt-5 text-center md:max-xl:mt-0 md:max-xl:text-left">
        <p className="text-[19px] font-extrabold tracking-[-0.02em] text-fg md:max-xl:text-[24px]">Escaneá para ingresar</p>
        <p className="mx-auto mt-1 max-w-[320px] text-[12.5px] leading-relaxed text-muted md:max-xl:mx-0 md:max-xl:text-[13.5px]">
          Abrí la app <span className="font-bold text-fg-2">Pulso</span> y escaneá este código, o mostrá tu QR personal a la cámara.
        </p>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 pt-5 md:max-xl:mt-6 md:max-xl:grid-cols-1 lg:max-xl:grid-cols-3">
        {[
          { icon: QrCode, l: "Cámara QR", v: "30 fps" },
          { icon: Nfc, l: "Lector NFC", v: "Listo" },
          { icon: DoorOpen, l: "Molinetes", v: "3/3 online" },
        ].map((d) => (
          <div key={d.l} className="rounded-xl border border-line bg-white/[0.02] px-2.5 py-2">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-muted">
              <d.icon className="size-3.5 text-lime" /> {d.l}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-bold text-fg">
              <span className="size-1.5 rounded-full bg-lime shadow-[0_0_6px_rgb(181_245_74)]" /> {d.v}
            </p>
          </div>
        ))}
      </div>
      </div>
      </div>
    </article>
  );
}

/* ── Tarjeta de resultado ──────────────────────────────────── */
function ResultCard({
  scan,
  seq,
  paused,
  onSimulate,
  onTogglePause,
}: {
  scan: Scan;
  seq: number;
  paused: boolean;
  onSimulate: (s: AccessState) => void;
  onTogglePause: () => void;
}) {
  const t = TONE[scan.state];
  const p = scan.person;
  const first = p.name.split(" ")[0];
  const Icon = t.icon;
  const sub =
    scan.state === "ok"
      ? `¡Buen entrenamiento, ${first}!`
      : scan.state === "vencida"
        ? "Molinete bloqueado · regularizá la cuota en recepción"
        : `Acceso permitido · la cuota vence en ${p.daysLeft} ${p.daysLeft === 1 ? "día" : "días"}`;

  return (
    <article
      className={cn(
        "stagger relative flex h-full flex-col overflow-hidden rounded-[24px] border bg-surface transition-[border-color,box-shadow] duration-500",
        t.card,
      )}
      style={s(1)}
      aria-live="polite"
    >
      {/* Fondo */}
      <div
        key={`bg${seq}`}
        className="pointer-events-none absolute inset-0 animate-fade-in"
        style={{ background: `radial-gradient(120% 70% at 50% 0%, ${t.glow}, transparent 60%)` }}
      />
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />

      {/* Barra superior */}
      <div className="relative flex items-center justify-between gap-3 px-5 pt-5 sm:px-7 sm:pt-6">
        <p className="flex min-w-0 items-center gap-2 text-[12.5px] font-semibold text-fg-2">
          <DoorOpen className="size-4 shrink-0 text-muted" />
          <span className="truncate">
            {scan.door} · <span className="text-muted">{scan.method}</span>
          </span>
        </p>
        <p className="shrink-0 text-[12.5px] font-bold text-fg tabular">{clock(seq)}</p>
      </div>

      {/* Ícono gigante */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-5 pb-6 pt-6 text-center sm:px-8 sm:pt-8">
        <div key={`ic${seq}`} className="relative grid size-[128px] place-items-center sm:size-[156px] xl:size-[176px]">
          <span className={cn("absolute inset-0 rounded-full border-2 animate-pulse-ring", t.ring)} />
          <span className={cn("absolute inset-0 rounded-full border-2 animate-pulse-ring [animation-delay:1.1s]", t.ring)} />
          <span
            className={cn("relative grid size-full place-items-center rounded-full animate-pop", t.solid)}
            style={{ boxShadow: `0 0 0 10px ${t.glow}, 0 20px 60px -10px ${t.glow}` }}
          >
            <Icon className="size-[60%]" strokeWidth={scan.state === "por-vencer" ? 2.4 : 3.2} />
          </span>
        </div>

        <h2
          key={`h${seq}`}
          className={cn(
            "mt-6 animate-fade-up text-[38px] font-black leading-[0.9] tracking-[-0.045em] sm:text-[56px] 2xl:text-[64px]",
            t.text,
          )}
        >
          {t.head}
        </h2>
        <p key={`s${seq}`} className="mt-3 animate-fade-up text-[14px] font-semibold text-fg-2 [animation-delay:80ms] sm:text-[15px]">
          {sub}
        </p>

        {/* Socio */}
        <div
          key={`m${seq}`}
          className="mt-6 w-full animate-fade-up rounded-[20px] border border-white/[0.08] bg-ink/55 p-3.5 text-left backdrop-blur-md [animation-delay:140ms] sm:p-4"
        >
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={face(p.face, 200)}
              alt={p.name}
              className={cn("size-16 shrink-0 rounded-2xl object-cover ring-2 sm:size-[76px]", scan.state === "ok" ? "ring-lime/70" : scan.state === "vencida" ? "ring-rose/70" : "ring-amber/70")}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[19px] font-extrabold tracking-[-0.02em] text-fg sm:text-[22px]">{p.name}</p>
              <p className="truncate text-[12.5px] font-semibold text-muted">
                {p.plan}
                <span className="max-sm:hidden"> · </span>
                <span className="tabular max-sm:block">
                  #{p.id} · DNI {p.dni}
                </span>
              </p>
            </div>
            {scan.state === "ok" && (
              <div className="hidden text-right sm:block">
                <p className="text-[40px] font-black leading-none tracking-[-0.04em] text-lime tabular">{p.daysLeft}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">días restantes</p>
              </div>
            )}
          </div>

          {scan.state === "ok" && (
            <div className="mt-3.5 grid grid-cols-3 gap-2">
              <MiniStat l="Restan" v={`${p.daysLeft} días`} c="text-lime" className="sm:hidden" />
              <MiniStat l="Vence" v={p.due} className="hidden sm:block" />
              <MiniStat l="Este mes" v={`${p.monthVisits} visitas`} />
              <MiniStat l="Racha" v={`${p.streak} sem`} icon={<Flame className="size-3 text-amber" />} />
            </div>
          )}

          {scan.state === "vencida" && (
            <div className="mt-3.5 flex flex-col gap-3 rounded-2xl border border-rose/25 bg-rose/[0.07] p-3.5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-rose/80">Deuda pendiente</p>
                <p className="text-[30px] font-black leading-tight tracking-[-0.03em] text-rose tabular">{money(p.debt)}</p>
                <p className="text-[12px] font-semibold text-fg-2">
                  Venció el {p.due} · hace {Math.abs(p.daysLeft)} días
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col">
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose px-4 text-[14px] font-bold text-white shadow-[0_10px_30px_-10px_rgb(255_95_126/0.8)] transition hover:brightness-110 active:scale-[0.97]">
                  <Banknote className="size-[18px]" /> Cobrar ahora
                </button>
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface-2 px-4 text-[13px] font-semibold text-fg transition hover:bg-surface-3">
                  <MessageCircle className="size-4 text-emerald" /> Enviar link
                </button>
              </div>
            </div>
          )}

          {scan.state === "por-vencer" && (
            <div className="mt-3.5 flex flex-col gap-3 rounded-2xl border border-amber/25 bg-amber/[0.07] p-3.5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-amber/80">Vence el {p.due}</p>
                <p className="text-[30px] font-black leading-tight tracking-[-0.03em] text-amber tabular">
                  {p.daysLeft} {p.daysLeft === 1 ? "día" : "días"}
                </p>
                <p className="text-[12px] font-semibold text-fg-2">Ofrecé renovar ahora y evitá el bloqueo</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col">
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber px-4 text-[14px] font-bold text-ink shadow-[0_10px_30px_-10px_rgb(255_190_85/0.8)] transition hover:brightness-110 active:scale-[0.97]">
                  <RefreshCcw className="size-[17px]" /> Renovar
                </button>
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface-2 px-4 text-[13px] font-semibold text-fg transition hover:bg-surface-3">
                  <MessageCircle className="size-4 text-emerald" /> Recordar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controles de simulación */}
      <div className="relative border-t border-white/[0.07] bg-ink/40 px-5 py-3.5 sm:px-7">
        <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden">
          {!paused && (
            <motion.div
              key={`p${seq}`}
              className={cn("h-full origin-left", t.solid.split(" ")[0])}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
            />
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-faint">Simular lectura</p>
          <div className="grid w-full grid-cols-[1fr_1fr_1fr_auto] gap-1.5 sm:flex sm:w-auto sm:items-center">
            {(
              [
                ["ok", "Permitido", Check, "hover:bg-lime/15 hover:text-lime data-[on=true]:bg-lime/15 data-[on=true]:text-lime"],
                ["vencida", "Vencida", CircleX, "hover:bg-rose/15 hover:text-rose data-[on=true]:bg-rose/15 data-[on=true]:text-rose"],
                ["por-vencer", "Por vencer", TriangleAlert, "hover:bg-amber/15 hover:text-amber data-[on=true]:bg-amber/15 data-[on=true]:text-amber"],
              ] as const
            ).map(([k, l, I, cls]) => (
              <button
                key={k}
                data-on={scan.state === k}
                onClick={() => onSimulate(k)}
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-line px-2 text-[12px] font-bold text-fg-2 transition active:scale-95 sm:h-8 sm:px-2.5",
                  cls,
                )}
              >
                <I className="hidden size-3.5 sm:block" strokeWidth={2.6} /> {l}
              </button>
            ))}
            <button
              onClick={onTogglePause}
              className="grid size-9 place-items-center rounded-lg border border-line text-fg-2 transition hover:bg-white/5 sm:size-8"
              aria-label={paused ? "Reanudar demo" : "Pausar demo"}
            >
              {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function MiniStat({ l, v, c, icon, className }: { l: string; v: string; c?: string; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-line bg-white/[0.025] px-3 py-2", className)}>
      <p className="flex items-center gap-1 truncate text-[10.5px] font-bold uppercase tracking-wide text-faint">
        {icon}
        {l}
      </p>
      <p className={cn("mt-0.5 text-[17px] font-extrabold tracking-tight text-fg tabular", c)}>{v}</p>
    </div>
  );
}

/* ── Contadores ────────────────────────────────────────────── */
function Counters({ ins, inside, rejected }: { ins: number; inside: number; rejected: number }) {
  const cap = 140;
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <article className="panel glow-lime stagger p-3.5 sm:p-5" style={s(3)}>
        <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-fg-2 sm:text-[12.5px]">
          <LogIn className="size-3.5 text-lime" /> <span className="truncate">Ingresos<span className="hidden 2xl:inline"> hoy</span></span>
        </p>
        <p key={ins} className="mt-2 animate-pop text-[28px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular sm:text-[38px]">
          {ins}
        </p>
        <p className="mt-1.5 truncate text-[11px] font-bold text-lime sm:text-[12px]">+12%<span className="hidden 2xl:inline"> vs. ayer</span><span className="2xl:hidden"> vs. ayer</span></p>
      </article>
      <article className="panel stagger p-3.5 sm:p-5" style={s(4)}>
        <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-fg-2 sm:text-[12.5px]">
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inset-0 animate-ping rounded-full bg-cyan" />
            <span className="relative size-2 rounded-full bg-cyan" />
          </span>
          <span className="truncate">Dentro<span className="hidden 2xl:inline"> ahora</span></span>
        </p>
        <p className="mt-2 text-[28px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular sm:text-[38px]">
          <span key={inside} className="inline-block animate-pop">
            {inside}
          </span>
          <span className="text-[13px] font-bold text-muted sm:text-[15px]"> /{cap}</span>
        </p>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <div className="h-full rounded-full bg-cyan transition-all duration-700" style={{ width: `${(inside / cap) * 100}%` }} />
        </div>
      </article>
      <article className="panel stagger border-rose/25 p-3.5 sm:p-5" style={s(5)}>
        <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-fg-2 sm:text-[12.5px]">
          <Ban className="size-3.5 text-rose" /> <span className="truncate">Rechazos</span>
        </p>
        <p key={rejected} className="mt-2 animate-pop text-[28px] font-extrabold leading-none tracking-[-0.04em] text-rose tabular sm:text-[38px]">
          {rejected}
        </p>
        <p className="mt-1.5 truncate text-[11px] font-semibold text-muted sm:text-[12px]">por deuda<span className="hidden 2xl:inline"> de cuota</span></p>
      </article>
    </div>
  );
}

/* ── Búsqueda manual por DNI ───────────────────────────────── */
function ManualSearch({ onFound }: { onFound: (p: (typeof PEOPLE)[number]) => void }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const digits = v.replace(/\D/g, "").slice(0, 8);
  const pretty = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const submit = (raw = digits) => {
    const d = raw.replace(/\D/g, "");
    const p = PEOPLE.find((x) => x.dni.replace(/\D/g, "") === d);
    if (!p) {
      setErr(d.length < 7 ? "Ingresá un DNI de 7 u 8 dígitos" : "No encontramos un socio con ese DNI");
      return;
    }
    setErr(null);
    setV("");
    onFound(p);
  };

  const key = (k: string) => {
    setErr(null);
    if (k === "del") setV((x) => x.replace(/\D/g, "").slice(0, -1));
    else if (k === "ok") submit();
    else setV((x) => (x.replace(/\D/g, "") + k).slice(0, 8));
  };

  return (
    <article className="panel stagger p-5 sm:p-6" style={s(6)}>
      {/* En tablet: búsqueda | teclado, lado a lado */}
      <div className="md:max-xl:grid md:max-xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:max-xl:items-end md:max-xl:gap-6">
      <div className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">Ingreso manual</h3>
          <p className="mt-0.5 text-[12.5px] text-muted">Buscá al socio por DNI si no trae el celular</p>
        </div>
        <IdCard className="size-5 text-faint" />
      </div>

      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label
          className={cn(
            "flex h-14 items-center gap-3 rounded-2xl border bg-ink/60 px-4 transition focus-within:border-lime/50 focus-within:shadow-[0_0_0_4px_rgb(181_245_74/0.08)]",
            err ? "border-rose/50" : "border-line-strong",
          )}
        >
          <Search className="size-5 text-muted" />
          <input
            inputMode="numeric"
            value={pretty}
            onChange={(e) => {
              setErr(null);
              setV(e.target.value);
            }}
            placeholder={PEOPLE[0].dni}
            aria-label="DNI del socio"
            className="min-w-0 flex-1 bg-transparent text-[22px] font-extrabold tracking-[0.06em] text-fg tabular placeholder:font-bold placeholder:text-faint focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-lime px-4 text-[13.5px] font-bold text-lime-ink shadow-[0_8px_24px_-8px_rgb(181_245_74/0.6)] transition hover:bg-[#c4fa66] active:scale-95"
          >
            Validar <CornerDownLeft className="size-4" />
          </button>
        </label>
        <p className={cn("mt-2 h-4 text-[12px] font-semibold", err ? "text-rose" : "text-faint")}>
          {err ?? "Probá con un DNI reciente:"}
        </p>
      </form>

      <div className="mt-1 flex flex-wrap gap-1.5">
        {[PEOPLE[2], PEOPLE[1], PEOPLE[5]].map((p, k) => (
          <button
            key={p.dni}
            onClick={() => submit(p.dni)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] py-1 pl-1 pr-2.5 text-[12px] font-semibold text-fg-2 transition hover:border-lime/40 hover:text-fg",
              k === 2 && "max-sm:hidden md:max-xl:hidden",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={face(p.face, 48)} alt="" className="size-5 rounded-full object-cover" />
            <span className="tabular">{p.dni}</span>
          </button>
        ))}
      </div>

      </div>

      {/* Teclado tipo kiosco */}
      <div className="mt-4 hidden grid-cols-6 gap-1.5 sm:grid md:max-xl:mt-0 md:max-xl:grid-cols-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "del", "ok"].map((k) => (
          <button
            key={k}
            onClick={() => key(k)}
            className={cn(
              "grid h-10 place-items-center rounded-xl text-[15px] font-bold transition active:scale-95",
              k === "ok"
                ? "bg-lime/15 text-lime hover:bg-lime/25"
                : k === "del"
                  ? "bg-white/[0.04] text-muted hover:bg-white/[0.08] hover:text-fg"
                  : "bg-white/[0.04] text-fg hover:bg-white/[0.08]",
            )}
            aria-label={k === "del" ? "Borrar" : k === "ok" ? "Validar" : k}
          >
            {k === "del" ? <Delete className="size-4" /> : k === "ok" ? <Check className="size-4" strokeWidth={3} /> : k}
          </button>
        ))}
      </div>
      </div>
    </article>
  );
}

/* ── Feed en vivo ──────────────────────────────────────────── */
const FEED_TONE = {
  ok: { label: "Permitido", tone: "lime" as const, dot: "bg-lime" },
  vencida: { label: "Rechazado", tone: "rose" as const, dot: "bg-rose" },
  "por-vencer": { label: "Por vencer", tone: "amber" as const, dot: "bg-amber" },
};

const METHOD_ICON = { "QR app": QrCode, "Credencial NFC": Nfc, "DNI manual": IdCard } as Record<string, typeof QrCode>;

function LiveFeed({ feed }: { feed: FeedItem[] }) {
  return (
    <article className="panel stagger min-w-0 overflow-hidden" style={s(5)}>
      <div className="flex items-start justify-between gap-3 p-5 pb-3 sm:p-6 sm:pb-3">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] text-fg">
            Últimos ingresos
            <span className="flex items-center gap-1 text-[10px] font-extrabold tracking-wider text-lime">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-lime" />
                <span className="relative size-1.5 rounded-full bg-lime" />
              </span>
              EN VIVO
            </span>
          </h3>
          <p className="mt-0.5 text-[12.5px] text-muted">Todas las puertas · Sede Centro</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Pill tone="neutral">
            <Users className="size-3" /> Todas las puertas
          </Pill>
        </div>
      </div>
      <ul className="px-3 pb-3 sm:px-4 sm:pb-4">
        {feed.map((f, k) => {
          const ft = FEED_TONE[f.state];
          const MI = METHOD_ICON[f.method] ?? QrCode;
          return (
            <li
              key={f.key}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-2.5 py-2.5 transition-colors hover:bg-white/[0.03] sm:px-3",
                k === 0 && "animate-fade-up bg-white/[0.035] ring-1 ring-inset ring-white/[0.06]",
              )}
            >
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={face(f.face, 88)} alt="" className="size-10 rounded-full object-cover sm:size-11" />
                <span className={cn("absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full ring-[3px] ring-surface", ft.dot)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-fg">{f.name}</p>
                <p className="flex items-center gap-1.5 truncate text-[11.5px] text-muted">
                  <MI className="size-3 shrink-0" />
                  <span className="truncate">
                    {f.door}
                    <span className="hidden sm:inline"> · {f.plan}</span>
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
                <Pill tone={ft.tone} dot className="order-2 sm:order-1">
                  {ft.label}
                </Pill>
                <span className="order-1 text-[12px] font-bold text-fg-2 tabular sm:order-2 sm:w-[62px] sm:text-right">
                  {k === 0 ? <span className="text-lime">ahora</span> : f.time.slice(0, 5)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
