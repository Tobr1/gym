"use client";

import {
  BatteryFull,
  Bell,
  CalendarDays,
  Check,
  Dumbbell,
  House,
  ImageUp,
  QrCode,
  ShieldCheck,
  Signal,
  Smartphone,
  UserRound,
  Wifi,
} from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import { PHOTO } from "@/lib/photos";
import { cn, fmt } from "@/lib/utils";
import { ACCENTS, TOTAL_MEMBERS, type AccentKey } from "../_data";
import { Field, SectionHead, Segmented, SettingRow, TextInput, Toggle, s, useSetting } from "./controls";

type Accent = (typeof ACCENTS)[number];
/** Adopción de la app (coincide con Super Admin: 74 %). */
const APP_USERS = Math.round(TOTAL_MEMBERS * 0.74);

const MODULES = [
  { key: "challenge", label: "Desafío del día", text: "Tarjeta destacada con la racha del socio" },
  { key: "membership", label: "Membresía y QR", text: "Días restantes y acceso al molinete" },
  { key: "week", label: "Semana", text: "Días entrenados y clases reservadas" },
  { key: "classes", label: "Clases de hoy", text: "Reserva en un toque" },
] as const;
type ModuleKey = (typeof MODULES)[number]["key"];

export function BrandSection() {
  const [accentKey, setAccentKey] = useSetting<AccentKey>("marca.color", "lime");
  const [name, setName] = useSetting("marca.nombre", "Iron Factory");
  const [greeting, setGreeting] = useSetting("marca.nombre", "Hola");
  const [theme, setTheme] = useSetting<"dark" | "auto">("marca.tema", "dark");
  const [mods, setMods] = useSetting<Record<ModuleKey, boolean>>("marca.inicio", { challenge: true, membership: true, week: true, classes: true });
  const accent = ACCENTS.find((a) => a.key === accentKey)!;

  return (
    <section className="@container">
      <SectionHead
        icon={Smartphone}
        title="App del socio y marca"
        text={
          <>
            La usan <span className="font-semibold text-fg-2 tabular">{fmt(APP_USERS)}</span> socios (74 %) · los cambios se ven al instante
          </>
        }
      />

      {/* En mobile: color → vista previa → resto. En desktop la vista previa ocupa la columna derecha. */}
      <div className="grid gap-4 @3xl:grid-cols-[minmax(0,1fr)_316px] @3xl:items-start">
        {/* ── vista previa ─────────────────────────── */}
        <div className="stagger order-2 @3xl:sticky @3xl:top-[96px] @3xl:col-start-2 @3xl:row-span-2 @3xl:row-start-1" style={s(1)}>
          <PhonePreview accent={accent} name={name} greeting={greeting} mods={mods} />
          <p className="mt-3 text-center text-[11.5px] text-muted">Vista previa en vivo · Inicio del socio</p>
        </div>

          {/* color */}
          <div className="panel stagger order-1 min-w-0 p-5 @3xl:col-start-1 @3xl:row-start-1" style={s(2)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">Color de acento</h3>
                <p className="text-[12.5px] text-muted">Botones, día de hoy y destacados. Todos pasan contraste AA sobre fondo oscuro.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 @xl:grid-cols-6">
              {ACCENTS.map((a) => {
                const on = a.key === accentKey;
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setAccentKey(a.key)}
                    aria-pressed={on}
                    className={cn(
                      "group flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all duration-300",
                      on ? "border-line-strong bg-white/[0.04]" : "border-transparent hover:bg-white/[0.02]",
                    )}
                  >
                    <span
                      className={cn("grid size-11 place-items-center rounded-full transition-transform duration-300 group-hover:scale-105", on && "scale-105")}
                      style={{
                        background: a.hex,
                        color: a.ink,
                        boxShadow: on ? `0 0 0 3px var(--color-surface), 0 0 0 5px ${a.hex}, 0 10px 28px -6px ${a.hex}` : undefined,
                      }}
                    >
                      {on && <Check className="size-5" strokeWidth={3} />}
                    </span>
                    <span className={cn("text-[11.5px] font-bold", on ? "text-fg" : "text-muted")}>{a.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        <div className="order-3 min-w-0 space-y-4 @3xl:col-start-1 @3xl:row-start-2">
          {/* logo */}
          <div className="panel stagger p-5" style={s(3)}>
            <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">Logo e ícono</h3>
            <p className="text-[12.5px] text-muted">Se usa en la app, los comprobantes y los mensajes de WhatsApp</p>
            <div className="mt-4 grid gap-3 @xl:grid-cols-[auto_minmax(0,1fr)]">
              <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PHOTO.gymFloor(500, 300)} alt="" className="photo-grade absolute inset-0 size-full object-cover opacity-40 blur-[2px]" />
                <div className="absolute inset-0 bg-ink/50" />
                {[accent, null].map((a, k) => (
                  <div key={k} className="relative flex flex-col items-center gap-1.5">
                    <Mark accent={a} size={56} />
                    <span className="text-[10.5px] font-semibold text-fg-2">{k === 0 ? "Ícono" : "Monocromo"}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="group flex min-h-[112px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line-strong bg-ink/30 p-4 text-center transition hover:border-white/25 hover:bg-white/[0.02]"
              >
                <ImageUp className="size-5 text-muted transition group-hover:-translate-y-0.5 group-hover:text-fg" />
                <span className="text-[13px] font-bold text-fg">Reemplazar logo</span>
                <span className="text-[11.5px] text-muted">SVG o PNG con fondo transparente · mín. 512 px</span>
              </button>
            </div>
          </div>

          {/* textos y tema */}
          <div className="panel stagger p-5" style={s(4)}>
            <div className="grid gap-4 @xl:grid-cols-2">
              <Field label="Nombre en la app">
                <TextInput value={name} onChange={setName} maxLength={22} />
              </Field>
              <Field label="Saludo de inicio" hint="Se completa con el nombre del socio">
                <TextInput value={greeting} onChange={setGreeting} maxLength={14} suffix=", Martín" />
              </Field>
              <Field label="Tema" className="@xl:col-span-2">
                <Segmented
                  className="@xl:w-[320px]"
                  value={theme}
                  onChange={setTheme}
                  options={[
                    { value: "dark", label: "Siempre oscuro" },
                    { value: "auto", label: "Según el teléfono" },
                  ]}
                />
              </Field>
            </div>
          </div>

          {/* módulos */}
          <div className="panel stagger px-5 pb-2 pt-4" style={s(5)}>
            <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">Inicio de la app</h3>
            <p className="text-[12.5px] text-muted">Elegí qué ve cada socio al abrirla</p>
            <div className="mt-1 divide-y divide-line">
              {MODULES.map((m) => (
                <SettingRow key={m.key} title={m.label} text={m.text}>
                  <Toggle
                    checked={mods[m.key]}
                    onChange={(v) => setMods((x) => ({ ...x, [m.key]: v }))}
                    color={accent.hex}
                    label={m.label}
                  />
                </SettingRow>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Mark({ accent, size }: { accent: Accent | null; size: number }) {
  return (
    <span
      className="grid place-items-center rounded-[16px] font-extrabold tracking-[-0.06em] shadow-[0_12px_30px_-10px_rgb(0_0_0/0.8)]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: accent ? accent.hex : "#0B1018",
        color: accent ? accent.ink : "#EEF3F8",
        border: accent ? undefined : "1px solid rgb(255 255 255 / 0.14)",
      }}
    >
      IF
    </span>
  );
}

/* ── Teléfono con el inicio del socio ──────────────────────── */
const WEEK = [
  { d: "L", n: 23, done: true },
  { d: "M", n: 24, done: true },
  { d: "M", n: 25, today: true },
  { d: "J", n: 26, booked: true },
  { d: "V", n: 27 },
  { d: "S", n: 28, booked: true },
  { d: "D", n: 29 },
];

function PhonePreview({ accent, name, greeting, mods }: { accent: Accent; name: string; greeting: string; mods: Record<ModuleKey, boolean> }) {
  const a = accent.hex;
  return (
    <div className="relative mx-auto w-[300px]">
      <div className="pointer-events-none absolute inset-x-6 top-24 h-64 rounded-full blur-[70px] transition-colors duration-500" style={{ background: a, opacity: 0.16 }} />
      <div className="relative h-[620px] overflow-hidden rounded-[48px] border-[9px] border-[#05080d] bg-ink shadow-[0_40px_80px_-20px_rgb(0_0_0/0.9),0_0_0_1px_rgb(255_255_255/0.10)]">
        {/* status bar */}
        <div className="relative flex h-11 items-center justify-between px-6 pt-1 text-[11.5px] font-bold text-fg">
          <span className="tabular">08:52</span>
          <span className="absolute left-1/2 top-2.5 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <Signal className="size-3" strokeWidth={2.6} />
            <Wifi className="size-3" strokeWidth={2.6} />
            <BatteryFull className="size-3.5" strokeWidth={2.2} />
          </span>
        </div>

        <div className="no-scrollbar h-[calc(100%-44px-58px)] space-y-3 overflow-hidden px-4 pt-1">
          <header className="flex items-center justify-between">
            <Avatar i={0} size={34} className="ring-2 ring-white/10" />
            <div className="min-w-0 text-center leading-tight">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] transition-colors duration-500" style={{ color: a }}>
                {name || "Tu gimnasio"}
              </p>
              <p className="truncate text-[14px] font-extrabold tracking-[-0.02em] text-fg">{greeting || "Hola"}, Martín</p>
            </div>
            <span className="relative grid size-[34px] place-items-center rounded-full bg-white/[0.06] text-fg ring-1 ring-white/10">
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full" style={{ background: a }} />
            </span>
          </header>

          {mods.challenge && (
            <section className="relative overflow-hidden rounded-[22px] p-4 transition-colors duration-500" style={{ background: a, color: accent.ink }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PHOTO.pullup(400, 400)}
                alt=""
                className="photo-grade absolute -right-4 top-0 h-full w-[58%] object-cover mix-blend-multiply [mask-image:linear-gradient(to_left,black_55%,transparent)]"
              />
              <div className="relative max-w-[62%]">
                <p className="text-[8.5px] font-extrabold uppercase tracking-[0.16em] opacity-60">Racha · 12 días</p>
                <p className="mt-0.5 text-[21px] font-extrabold leading-[0.95] tracking-[-0.04em]">
                  Desafío
                  <br />
                  del día
                </p>
                <p className="mt-1.5 text-[10px] font-semibold opacity-75">Completá tu rutina antes de las 21:00</p>
              </div>
            </section>
          )}

          {mods.membership && (
            <section className="flex items-center gap-2.5 rounded-[18px] border border-line bg-surface p-2.5 pl-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-[9.5px] font-bold transition-colors duration-500" style={{ color: a }}>
                  <ShieldCheck className="size-3" /> Pase Libre · activo
                </p>
                <p className="text-[12.5px] font-extrabold text-fg">17 días restantes</p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full w-[56%] rounded-full transition-colors duration-500" style={{ background: a }} />
                </div>
              </div>
              <span className="flex h-9 items-center gap-1.5 rounded-xl bg-white/[0.06] px-2.5 text-[10.5px] font-bold text-fg ring-1 ring-white/10">
                <QrCode className="size-3.5" style={{ color: a }} /> Mi QR
              </span>
            </section>
          )}

          {mods.week && (
            <section className="flex justify-between gap-1">
              {WEEK.map((d) => (
                <span
                  key={d.n}
                  className={cn(
                    "relative flex h-[50px] flex-1 flex-col items-center justify-center rounded-full border text-[10px] font-semibold transition-colors duration-500",
                    d.today ? "border-transparent" : "border-white/12 text-muted",
                  )}
                  style={d.today ? { background: a, color: accent.ink, boxShadow: `0 6px 18px -6px ${a}` } : undefined}
                >
                  {(d.done || d.booked) && (
                    <span
                      className="absolute top-1.5 size-1 rounded-full"
                      style={d.done ? { background: d.today ? accent.ink : a } : { boxShadow: `0 0 0 1.2px ${a}` }}
                    />
                  )}
                  <span className="mt-0.5">{d.d}</span>
                  <span className={cn("text-[12px] font-extrabold", !d.today && "text-fg")}>{d.n}</span>
                </span>
              ))}
            </section>
          )}

          {mods.classes && (
            <section>
              <div className="flex items-center justify-between">
                <p className="text-[13.5px] font-extrabold tracking-[-0.02em] text-fg">Clases de hoy</p>
                <p className="text-[10px] font-semibold text-muted">Ver todas</p>
              </div>
              <div className="mt-2 flex gap-2">
                {[
                  { t: "CrossTraining", h: "18:00", p: PHOTO.ropes(300, 300), spots: "4 lugares" },
                  { t: "Pilates Reformer", h: "20:15", p: PHOTO.yoga(300, 300), spots: "2 lugares" },
                ].map((c) => (
                  <div key={c.t} className="relative h-[118px] w-[58%] shrink-0 overflow-hidden rounded-[18px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.p} alt="" className="photo-grade absolute inset-0 size-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <span
                      className="absolute left-2 top-2 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold transition-colors duration-500"
                      style={{ background: a, color: accent.ink }}
                    >
                      {c.h}
                    </span>
                    <div className="absolute inset-x-2.5 bottom-2">
                      <p className="text-[11.5px] font-extrabold text-white">{c.t}</p>
                      <p className="text-[9px] font-semibold text-white/70">{c.spots}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!Object.values(mods).some(Boolean) && (
            <p className="pt-16 text-center text-[12px] text-muted">Activá al menos un módulo de inicio</p>
          )}
        </div>

        {/* tab bar */}
        <nav className="absolute inset-x-0 bottom-0 flex h-[58px] items-start justify-around border-t border-line bg-ink-2/95 px-4 pt-2.5 backdrop-blur-xl">
          {[House, CalendarDays, Dumbbell, UserRound].map((Icon, k) => (
            <span key={k} className="grid size-9 place-items-center rounded-full transition-colors duration-500" style={k === 0 ? { background: a, color: accent.ink } : undefined}>
              <Icon className={cn("size-[17px]", k !== 0 && "text-muted")} />
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
