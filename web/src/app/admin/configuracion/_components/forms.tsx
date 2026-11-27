"use client";

import { useState } from "react";
import {
  AtSign,
  BellRing,
  Building2,
  Camera,
  CreditCard,
  Download,
  Fingerprint,
  Globe,
  IdCard,
  Landmark,
  Mail,
  MessageCircle,
  Nfc,
  Phone,
  QrCode,
  Receipt,
  ScanFace,
  ScanLine,
  Smartphone,
  Wallet,
} from "lucide-react";
import { METHODS, type MethodKey } from "@/app/admin/caja/_data";
import { Button, Pill } from "@/components/ui/primitives";
import { PHOTO } from "@/lib/photos";
import { cn, fmt, money } from "@/lib/utils";
import { BRANCHES, DEVICES_OFFLINE, DEVICES_TOTAL, NOTIFS, SUBSCRIPTION, VARIABLES, type Channel } from "../_data";
import { Field, SectionHead, Segmented, Select, SettingRow, Stepper, TextArea, TextInput, Toggle, s, useSetting, useTouch } from "./controls";

const card = "panel stagger p-5";
const h3 = "text-[15px] font-bold tracking-[-0.01em] text-fg";

/* ══ Perfil del gimnasio ═══════════════════════════════════════ */
export function ProfileSection() {
  const [name, setName] = useSetting("perfil.datos", "Iron Factory");
  const [legal, setLegal] = useSetting("perfil.datos", "Iron Factory S.R.L.");
  const [cuit, setCuit] = useSetting("perfil.datos", "30-71584239-6");
  const [iva, setIva] = useSetting("perfil.datos", "Responsable inscripto");
  const [mail, setMail] = useSetting("perfil.contacto", "hola@ironfactory.com.ar");
  const [phone, setPhone] = useSetting("perfil.contacto", "+54 11 5263-0418");
  const [web, setWeb] = useSetting("perfil.contacto", "ironfactory.com.ar");
  const [ig, setIg] = useSetting("perfil.contacto", "ironfactory.ba");
  const [tz, setTz] = useSetting("perfil.regional", "Buenos Aires (GMT−3)");
  const [week, setWeek] = useSetting("perfil.regional", "lunes");

  return (
    <section className="@container">
      <SectionHead icon={Building2} title="Perfil del gimnasio" text="Datos que ven tus socios en la app, los comprobantes y los mensajes" />

      <div className="panel stagger overflow-hidden" style={s(1)}>
        <div className="relative h-32 sm:h-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTO.gymFloor(1400, 400)} alt="" className="photo-grade absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
          <button
            type="button"
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-[11.5px] font-bold text-fg backdrop-blur-md transition hover:bg-ink/90"
          >
            <Camera className="size-3.5" /> Cambiar portada
          </button>
        </div>
        <div className="relative -mt-10 flex flex-wrap items-end gap-4 px-5 pb-5">
          <span className="grid size-[72px] place-items-center rounded-[20px] bg-lime text-[26px] font-extrabold tracking-[-0.06em] text-lime-ink shadow-[0_0_0_4px_var(--color-surface),0_16px_40px_-10px_rgb(181_245_74/0.5)]">
            IF
          </span>
          <div className="min-w-0 flex-1 pb-0.5">
            <p className="text-[22px] font-extrabold leading-tight tracking-[-0.03em] text-fg">{name || "Tu gimnasio"}</p>
            <p className="text-[12.5px] text-muted">3 sedes en CABA · con Pulso desde mar 2023</p>
          </div>
          <Pill tone="lime" dot>
            Perfil completo
          </Pill>
        </div>
      </div>

      <div className="mt-4 grid gap-4 @3xl:grid-cols-2">
        <div className={card} style={s(2)}>
          <h3 className={h3}>Datos fiscales</h3>
          <p className="text-[12.5px] text-muted">Se usan para facturar con AFIP</p>
          <div className="mt-4 grid gap-3.5">
            <Field label="Nombre comercial">
              <TextInput value={name} onChange={setName} />
            </Field>
            <Field label="Razón social">
              <TextInput value={legal} onChange={setLegal} />
            </Field>
            <div className="grid gap-3.5 @xl:grid-cols-2 @3xl:grid-cols-1 @5xl:grid-cols-2">
              <Field label="CUIT">
                <TextInput icon={IdCard} value={cuit} onChange={setCuit} mono />
              </Field>
              <Field label="Condición frente al IVA">
                <Select value={iva} onChange={setIva} options={["Responsable inscripto", "Monotributo", "Exento"]} label="Condición frente al IVA" />
              </Field>
            </div>
          </div>
        </div>

        <div className={card} style={s(3)}>
          <h3 className={h3}>Contacto</h3>
          <p className="text-[12.5px] text-muted">Visible en la app y en el pie de los mails</p>
          <div className="mt-4 grid gap-3.5">
            <Field label="Email">
              <TextInput icon={Mail} value={mail} onChange={setMail} />
            </Field>
            <Field label="WhatsApp">
              <TextInput icon={Phone} value={phone} onChange={setPhone} mono />
            </Field>
            <div className="grid gap-3.5 @xl:grid-cols-2 @3xl:grid-cols-1 @5xl:grid-cols-2">
              <Field label="Sitio web">
                <TextInput icon={Globe} value={web} onChange={setWeb} />
              </Field>
              <Field label="Instagram">
                <TextInput icon={AtSign} value={ig} onChange={setIg} />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <div className={cn(card, "mt-4 grid gap-4 @2xl:grid-cols-3")} style={s(4)}>
        <Field label="Zona horaria">
          <Select value={tz} onChange={setTz} options={["Buenos Aires (GMT−3)", "Montevideo (GMT−3)", "Santiago (GMT−3)"]} label="Zona horaria" />
        </Field>
        <Field label="Moneda">
          <div className="flex h-10 items-center gap-2 rounded-xl border border-line bg-ink/20 px-3 text-[13.5px] font-semibold text-fg-2">
            ARS · {money(48_900)}
          </div>
        </Field>
        <Field label="La semana empieza el">
          <Segmented
            value={week}
            onChange={setWeek}
            options={[
              { value: "lunes", label: "Lunes" },
              { value: "domingo", label: "Domingo" },
            ]}
          />
        </Field>
      </div>
    </section>
  );
}

/* ══ Medios de pago ═══════════════════════════════════════════ */
const METHOD_ICON: Record<MethodKey, typeof Wallet> = {
  efectivo: Wallet,
  debito: CreditCard,
  credito: CreditCard,
  transferencia: Landmark,
  mp: QrCode,
};
const METHOD_NOTE: Record<MethodKey, string> = {
  efectivo: "Solo en mostrador · arqueo por turno",
  debito: "Posnet Payway · acreditación en 48 h",
  credito: "Hasta 3 cuotas sin interés",
  transferencia: "Alias IRONFACTORY.CUOTAS",
  mp: "QR, link de pago y débito automático",
};

export function PaymentsSection() {
  const touch = useTouch();
  const [enabled, setEnabled] = useState<Record<MethodKey, boolean>>({ efectivo: true, debito: true, credito: true, transferencia: true, mp: true });
  const [inApp, setInApp] = useState<Record<MethodKey, boolean>>({ efectivo: false, debito: false, credito: true, transferencia: true, mp: true });
  const [due, setDue] = useSetting("pagos.vencimiento", "alta");
  const [dueDay, setDueDay] = useSetting("pagos.vencimiento", 5);
  const [late, setLate] = useSetting("pagos.recargo", 10);
  const [lateFrom, setLateFrom] = useSetting("pagos.recargo", 6);
  const [auto, setAuto] = useSetting("pagos.debito", true);
  const [inv, setInv] = useSetting("pagos.factura", true);
  const [receipt, setReceipt] = useSetting("pagos.factura", true);
  const total = METHODS.reduce((a, m) => a + m.amount, 0);

  return (
    <section className="@container">
      <SectionHead icon={CreditCard} title="Medios de pago" text="Cómo te pagan en mostrador y en la app" />

      <div className="panel stagger overflow-hidden" style={s(1)}>
        <div className="hidden grid-cols-[minmax(0,1fr)_110px_88px_88px] gap-3 border-b border-line bg-ink/30 px-5 py-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint @2xl:grid">
          <span>Medio</span>
          <span className="text-right">Hoy</span>
          <span className="text-center">Mostrador</span>
          <span className="text-center">App</span>
        </div>
        <ul className="divide-y divide-line">
          {METHODS.map((m) => {
            const Icon = METHOD_ICON[m.key];
            return (
              <li key={m.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 @2xl:grid-cols-[minmax(0,1fr)_110px_88px_88px]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset" style={{ background: `${m.color}14`, color: m.color, boxShadow: `inset 0 0 0 1px ${m.color}30` }}>
                    <Icon className="size-[17px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold text-fg">{m.label}</p>
                    <p className="truncate text-[11.5px] text-muted">{METHOD_NOTE[m.key]}</p>
                  </div>
                </div>
                <p className="hidden text-right text-[12.5px] @2xl:block">
                  <span className="font-bold text-fg tabular">{money(m.amount)}</span>
                  <span className="block text-[10.5px] text-muted tabular">{Math.round((m.amount / total) * 1000) / 10}% · {m.ops} op.</span>
                </p>
                <span className="flex items-center justify-center gap-2">
                  <span className="text-[11px] font-semibold text-muted @2xl:hidden">Mostrador</span>
                  <Toggle
                    size="sm"
                    checked={enabled[m.key]}
                    onChange={(v) => {
                      setEnabled((e) => ({ ...e, [m.key]: v }));
                      touch("pagos.medios");
                    }}
                    label={`${m.label} en mostrador`}
                  />
                </span>
                <span className="col-span-2 flex items-center justify-end gap-2 @2xl:col-span-1 @2xl:justify-center">
                  <span className="text-[11px] font-semibold text-muted @2xl:hidden">En la app</span>
                  {m.key === "efectivo" || m.key === "debito" ? (
                    <span className="text-[11px] font-semibold text-faint">—</span>
                  ) : (
                    <Toggle
                      size="sm"
                      checked={inApp[m.key]}
                      onChange={(v) => {
                        setInApp((e) => ({ ...e, [m.key]: v }));
                        touch("pagos.medios");
                      }}
                      label={`${m.label} en la app`}
                    />
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 grid gap-4 @3xl:grid-cols-2">
        <div className={card} style={s(2)}>
          <h3 className={h3}>Vencimiento de cuotas</h3>
          <div className="mt-3 space-y-4">
            <Segmented
              value={due}
              onChange={setDue}
              options={[
                { value: "fijo", label: "Día fijo del mes" },
                { value: "alta", label: "Según fecha de alta" },
              ]}
            />
            <div className="divide-y divide-line">
              {due === "fijo" && (
                <SettingRow title="Vence el día" text="Todas las cuotas, sin importar el alta">
                  <Stepper value={dueDay} onChange={setDueDay} min={1} max={28} />
                </SettingRow>
              )}
              <SettingRow title="Recargo por mora" text={`Desde el ${lateFrom}.º día de atraso`}>
                <Stepper value={late} onChange={setLate} min={0} max={30} suffix="%" />
              </SettingRow>
              <SettingRow title="Días de gracia" text="Antes de sumar el recargo">
                <Stepper value={lateFrom - 1} onChange={(v) => setLateFrom(v + 1)} min={0} max={27} suffix="días" />
              </SettingRow>
            </div>
          </div>
        </div>
        <div className={card} style={s(3)}>
          <h3 className={h3}>Automatizaciones</h3>
          <div className="mt-1 divide-y divide-line">
            <SettingRow icon={Smartphone} title="Débito automático" text="Mercado Pago cobra la cuota el día de vencimiento">
              <Toggle checked={auto} onChange={setAuto} label="Débito automático" />
            </SettingRow>
            <SettingRow icon={Receipt} title="Factura B automática" text="AFIP · punto de venta 0003, con CAE en cada cobro">
              <Toggle checked={inv} onChange={setInv} label="Factura automática" />
            </SettingRow>
            <SettingRow icon={MessageCircle} title="Comprobante por WhatsApp" text="Se envía al acreditarse el pago">
              <Toggle checked={receipt} onChange={setReceipt} label="Comprobante por WhatsApp" />
            </SettingRow>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══ Control de acceso ════════════════════════════════════════ */
const ACCESS_METHODS = [
  { key: "qr", label: "QR de la app", icon: QrCode },
  { key: "dni", label: "DNI", icon: IdCard },
  { key: "nfc", label: "Llavero NFC", icon: Nfc },
  { key: "face", label: "Reconocimiento facial", icon: ScanFace },
  { key: "huella", label: "Huella", icon: Fingerprint },
] as const;

export function AccessSection() {
  const [methods, setMethods] = useSetting<string[]>("acceso.metodos", ["qr", "dni", "nfc", "face"]);
  const [block, setBlock] = useSetting("acceso.reglas", true);
  const [grace, setGrace] = useSetting("acceso.reglas", 30);
  const [passback, setPassback] = useSetting("acceso.reglas", true);
  const [perDay, setPerDay] = useSetting("acceso.reglas", 2);
  const [alert, setAlert] = useSetting("acceso.reglas", true);
  const [kiosk, setKiosk] = useSetting("acceso.kiosco", "15 s");

  return (
    <section className="@container">
      <SectionHead
        icon={ScanLine}
        title="Control de acceso"
        text={
          <>
            {DEVICES_TOTAL} molinetes y lectores en {BRANCHES.length} sedes ·{" "}
            <span className="font-semibold text-rose">{DEVICES_OFFLINE} sin conexión</span>
          </>
        }
      />

      <div className={card} style={s(1)}>
        <h3 className={h3}>Formas de ingresar</h3>
        <p className="text-[12.5px] text-muted">El socio puede usar cualquiera de las activas</p>
        <div className="mt-4 grid grid-cols-2 gap-2 @xl:grid-cols-3 @3xl:grid-cols-5">
          {ACCESS_METHODS.map((m) => {
            const on = methods.includes(m.key);
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setMethods(on ? methods.filter((x) => x !== m.key) : [...methods, m.key])}
                aria-pressed={on}
                className={cn(
                  "flex flex-col items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
                  on ? "border-lime/40 bg-lime/[0.06]" : "border-line text-muted hover:border-line-strong",
                )}
              >
                <span className="flex w-full items-center justify-between">
                  <m.icon className={cn("size-5", on ? "text-lime" : "text-faint")} />
                  <span className={cn("size-2 rounded-full", on ? "bg-lime shadow-[0_0_8px_#b5f54a]" : "bg-white/10")} />
                </span>
                <span className={cn("text-[12.5px] font-bold", on ? "text-fg" : "text-muted")}>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-4 @3xl:grid-cols-2">
        <div className={card} style={s(2)}>
          <h3 className={h3}>Reglas de ingreso</h3>
          <div className="mt-1 divide-y divide-line">
            <SettingRow title="Bloquear con deuda" text={`Más de ${grace} días de atraso`}>
              <Toggle checked={block} onChange={setBlock} label="Bloquear con deuda" />
            </SettingRow>
            {block && (
              <SettingRow title="Tolerancia" text="Días antes de bloquear">
                <Stepper value={grace} onChange={setGrace} min={1} max={60} suffix="días" />
              </SettingRow>
            )}
            <SettingRow title="Ingresos por día" text="Por socio, en todas las sedes">
              <Stepper value={perDay} onChange={setPerDay} min={1} max={5} />
            </SettingRow>
            <SettingRow title="Anti-passback" text="El QR no se puede reutilizar para entrar dos veces seguidas">
              <Toggle checked={passback} onChange={setPassback} label="Anti-passback" />
            </SettingRow>
          </div>
        </div>
        <div className={card} style={s(3)}>
          <h3 className={h3}>Recepción</h3>
          <div className="mt-1 divide-y divide-line">
            <SettingRow icon={BellRing} title="Avisar si entra con deuda" text="Alerta en la pantalla de acceso, sin frenar el molinete">
              <Toggle checked={alert} onChange={setAlert} label="Avisar deuda" />
            </SettingRow>
            <SettingRow title="Modo kiosco" text="Tiempo que queda la ficha en pantalla">
              <Select compact className="w-[86px]" value={kiosk} onChange={setKiosk} options={["8 s", "15 s", "30 s"]} label="Modo kiosco" />
            </SettingRow>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-rose/25 bg-rose/[0.06] p-3">
            <ScanLine className="size-4 shrink-0 text-rose" />
            <p className="min-w-0 flex-1 text-[12px] leading-snug text-fg-2">
              <b className="text-fg">Molinete 2 · Sede Parque</b> sin conexión desde 08:40
            </p>
            <a href="#sedes" className="text-[12px] font-bold text-rose hover:underline">
              Ver
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══ Notificaciones ═══════════════════════════════════════════ */
const CHANNELS: { key: Channel; label: string; icon: typeof Mail; color: string }[] = [
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "#25D366" },
  { key: "email", label: "Email", icon: Mail, color: "var(--color-cyan)" },
  { key: "push", label: "Push", icon: Smartphone, color: "var(--color-lime)" },
];

export function NotificationsSection() {
  const touch = useTouch();
  const [rows, setRows] = useState(NOTIFS);
  const [sel, setSel] = useState(NOTIFS[0].key);
  const current = rows.find((r) => r.key === sel)!;

  const setOn = (key: string, ch: Channel, v: boolean) => {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, on: { ...r.on, [ch]: v } } : r)));
    touch("notificaciones.canales");
  };
  const setMsg = (v: string) => {
    setRows((rs) => rs.map((r) => (r.key === sel ? { ...r, message: v } : r)));
    touch(`notificaciones.${sel}`);
  };
  const preview = current.message
    .replace("{nombre}", "Martín")
    .replace("{plan}", "Pase Libre")
    .replace("{vencimiento}", "28/11")
    .replace("{monto}", money(48_900))
    .replace("{link_pago}", "pulso.app/p/8F2K")
    .replace("{comprobante}", "FC B 0003-00012846")
    .replace("{clase}", "CrossTraining")
    .replace("{dia}", "jueves 26")
    .replace("{hora}", "17:15")
    .replace("{coach}", "Nico")
    .replace("{dias}", "14");

  return (
    <section className="@container">
      <SectionHead icon={BellRing} title="Notificaciones" text="Mensajes automáticos a tus socios · 3.912 WhatsApp enviados en noviembre" />

      <div className="grid gap-4 @3xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @3xl:items-start">
        <div className="panel stagger overflow-hidden" style={s(1)}>
          <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,48px)] items-center gap-1 border-b border-line bg-ink/30 px-4 py-2.5">
            <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">Aviso</span>
            {CHANNELS.map((c) => (
              <span key={c.key} className="flex justify-center" title={c.label}>
                <c.icon className="size-4" style={{ color: c.color }} />
              </span>
            ))}
          </div>
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li
                key={r.key}
                className={cn(
                  "relative grid cursor-pointer grid-cols-[minmax(0,1fr)_repeat(3,48px)] items-center gap-1 px-4 py-3 transition-colors",
                  r.key === sel ? "bg-white/[0.035]" : "hover:bg-white/[0.015]",
                )}
                onClick={() => setSel(r.key)}
              >
                {r.key === sel && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-lime" />}
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-bold text-fg">{r.label}</span>
                  <span className="block truncate text-[11.5px] text-muted">{r.when}</span>
                </span>
                {CHANNELS.map((c) => (
                  <span key={c.key} className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <Toggle size="sm" checked={r.on[c.key]} onChange={(v) => setOn(r.key, c.key, v)} color={c.color} label={`${r.label} por ${c.label}`} />
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>

        <div className={card} style={s(2)}>
          <div className="flex items-center justify-between gap-2">
            <h3 className={h3}>{current.label}</h3>
            <Pill tone="neutral" className="py-0.5 text-[10.5px]">
              {current.when}
            </Pill>
          </div>
          <div className="mt-3">
            <TextArea value={current.message} onChange={setMsg} rows={4} maxLength={300} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {VARIABLES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setMsg(`${current.message} ${v}`)}
                className="rounded-md border border-line bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10.5px] text-fg-2 transition hover:border-lime/40 hover:text-lime"
              >
                {v}
              </button>
            ))}
          </div>
          {/* vista previa de WhatsApp */}
          <div className="dots mt-4 rounded-2xl border border-line bg-[#0b141a] p-3.5">
            <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-[#005c4b] px-3 py-2 text-[12.5px] leading-snug text-white shadow-[0_4px_14px_-6px_rgb(0_0_0/0.6)]">
              <p className="mb-0.5 text-[11px] font-bold text-[#7ce8c4]">Iron Factory</p>
              {preview}
              <p className="mt-1 text-right text-[10px] text-white/60">08:52 ✓✓</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══ Facturación (suscripción a Pulso) ═══════════════════════ */
export function BillingSection() {
  const S = SUBSCRIPTION;
  return (
    <section className="@container">
      <SectionHead icon={Receipt} title="Facturación" text={`Tu suscripción a Pulso · cliente desde ${S.since}`}>
        <Button variant="secondary">Cambiar plan</Button>
      </SectionHead>

      <div className="grid gap-4 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="panel glow-lime stagger relative overflow-hidden p-5" style={s(1)}>
          <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-lime/10 blur-3xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-muted">Plan actual</p>
              <p className="text-[26px] font-extrabold leading-tight tracking-[-0.04em] text-fg">Pulso {S.plan}</p>
            </div>
            <Pill tone="lime" dot>
              Al día
            </Pill>
          </div>
          <p className="relative mt-4 flex items-baseline gap-1.5">
            <span className="text-[32px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">{money(S.price)}</span>
            <span className="text-[13px] font-semibold text-muted">/mes + IVA</span>
          </p>
          <div className="relative mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-[12px]">
            <div>
              <p className="text-muted">Próximo cobro</p>
              <p className="font-bold text-fg">{S.next}</p>
            </div>
            <div>
              <p className="text-muted">Medio de pago</p>
              <p className="flex items-center gap-1.5 font-bold text-fg">
                <CreditCard className="size-3.5 text-muted" /> {S.card}
              </p>
            </div>
          </div>
        </div>

        <div className={card} style={s(2)}>
          <h3 className={h3}>Uso del plan</h3>
          <ul className="mt-3 space-y-3.5">
            {S.usage.map((u) => {
              const pct = (u.used / u.limit) * 100;
              return (
                <li key={u.label}>
                  <p className="flex items-baseline justify-between text-[12.5px]">
                    <span className="font-semibold text-fg-2">{u.label}</span>
                    <span className="text-muted tabular">
                      <b className="text-fg">{fmt(u.used)}</b> / {fmt(u.limit)}
                    </span>
                  </p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className={cn("h-full rounded-full", pct > 70 ? "bg-amber" : "bg-lime")} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="panel stagger mt-4 overflow-hidden" style={s(3)}>
        <div className="px-5 pb-2 pt-4">
          <h3 className={h3}>Comprobantes</h3>
          <p className="text-[12.5px] text-muted">Factura A a nombre de Iron Factory S.R.L.</p>
        </div>
        <ul className="divide-y divide-line border-t border-line">
          {S.invoices.map((f) => (
            <li key={f.id} className="flex items-center gap-3 px-5 py-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.04] ring-1 ring-inset ring-white/[0.06]">
                <Receipt className="size-4 text-muted" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-fg">{f.period}</p>
                <p className="truncate font-mono text-[11px] text-muted">{f.id} · {f.date}</p>
              </div>
              <span className="text-[13px] font-bold text-fg tabular">{money(f.amount)}</span>
              <Pill tone="lime" className="hidden py-0.5 text-[10.5px] sm:inline-flex">
                Pagada
              </Pill>
              <button type="button" aria-label={`Descargar ${f.period}`} className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-fg">
                <Download className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
