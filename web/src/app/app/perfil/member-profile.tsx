"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  Bell,
  Camera,
  ChevronRight,
  CreditCard,
  FileHeart,
  LogOut,
  MapPin,
  QrCode,
  Receipt,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Avatar, Ring } from "@/components/ui/primitives";
import { BRAND } from "@/config/brand";
import { PHOTO } from "@/lib/photos";
import { cn, money } from "@/lib/utils";
import { AppHeader, si } from "./_kit/header";
import { Sheet } from "./_kit/overlay";
import { BADGES, ME, MEMBERSHIP, PAYMENTS, PAY_METHOD, STATS, TONE_CLS } from "./_data";

export function MemberProfile() {
  const [qr, setQr] = useState(false);
  const [logout, setLogout] = useState(false);
  const [notif, setNotif] = useState(true);
  const closeQr = useCallback(() => setQr(false), []);
  const closeLogout = useCallback(() => setLogout(false), []);

  const pct = Math.round((MEMBERSHIP.daysLeft / MEMBERSHIP.periodDays) * 100);
  const unlocked = BADGES.filter((b) => !b.progress);

  return (
    <div className="px-5 pb-4 pt-5 md:pt-1">
      <AppHeader title="Mi perfil" action={{ icon: Settings, label: "Ajustes" }} />

      {/* identidad */}
      <section className="stagger mt-6 flex flex-col items-center text-center" style={si(1)}>
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-lime/15 blur-2xl" />
          <div className="relative rounded-full p-[3px] [background:conic-gradient(from_200deg,#b5f54a,#b5f54a_40%,rgb(181_245_74/0.1)_70%,#b5f54a)]">
            <Avatar i={ME.face} size={112} eager className="ring-4 ring-ink" alt={ME.name} />
          </div>
          <button
            className="absolute bottom-1 right-1 grid size-9 place-items-center rounded-full bg-lime text-lime-ink ring-4 ring-ink transition active:scale-90"
            aria-label="Cambiar foto"
          >
            <Camera className="size-4" />
          </button>
        </div>
        <h2 className="mt-4 text-[26px] font-extrabold leading-none tracking-[-0.035em] text-fg">{ME.name}</h2>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-muted">
          Socio desde {ME.since}
          <span className="size-1 rounded-full bg-faint" />
          <MapPin className="size-3.5" /> {ME.branch}
        </p>
        <div className="mt-5 grid w-full grid-cols-3 divide-x divide-white/8 rounded-[22px] bg-surface py-3.5">
          {STATS.map((s) => (
            <div key={s.l}>
              <p className="text-[20px] font-extrabold leading-none tracking-[-0.02em] text-fg tabular">{s.v}</p>
              <p className="mt-1.5 text-[11.5px] font-semibold text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* membresía */}
      <section className="stagger relative mt-4 overflow-hidden rounded-[30px] border border-lime/25 bg-surface" style={si(2)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PHOTO.barbell(700, 420)}
          alt=""
          className="photo-grade absolute inset-y-0 right-0 h-full w-[70%] object-cover opacity-50 [mask-image:linear-gradient(to_left,black_30%,transparent)]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent" />
        <div className="relative p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-lime">
                <ShieldCheck className="size-3.5" /> Membresía activa
              </p>
              <p className="mt-2 text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg">{MEMBERSHIP.plan}</p>
              <p className="mt-1.5 text-[13px] font-medium text-fg-2">{MEMBERSHIP.detail}</p>
            </div>
            <Ring value={pct} size={84} stroke={8} track="rgb(255 255 255 / 0.12)" className="shrink-0 rounded-full bg-black/35 backdrop-blur-sm">
              <div>
                <p className="text-[22px] font-extrabold leading-none text-fg tabular">{MEMBERSHIP.daysLeft}</p>
                <p className="mt-0.5 text-[10px] font-bold text-muted">días</p>
              </div>
            </Ring>
          </div>
          <div className="mt-5 flex items-center gap-2.5">
            <div className="min-w-0 flex-1 rounded-2xl bg-black/30 px-3.5 py-2.5 backdrop-blur">
              <p className="text-[11px] font-semibold text-muted">Vence</p>
              <p className="text-[14px] font-extrabold text-fg">{MEMBERSHIP.until} · renueva sola</p>
            </div>
            <button
              onClick={() => setQr(true)}
              className="flex h-[52px] shrink-0 items-center gap-2 rounded-2xl bg-lime px-4 text-[13.5px] font-extrabold text-lime-ink shadow-[0_10px_30px_-10px_rgb(181_245_74/0.7)] transition active:scale-95"
            >
              <QrCode className="size-5" /> Mi QR
            </button>
          </div>
        </div>
      </section>

      {/* pagos */}
      <section className="stagger mt-7" style={si(3)}>
        <div className="flex items-center justify-between">
          <h3 className="text-[19px] font-extrabold tracking-[-0.02em] text-fg">Pagos</h3>
          <button className="text-[13px] font-semibold text-muted">Ver todo</button>
        </div>
        <div className="mt-3 rounded-[26px] bg-surface p-2">
          <div className="flex items-center gap-3 rounded-[20px] bg-ink-2 p-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet/15 text-[15px] font-extrabold text-violet">$</span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-muted">Próximo débito · {MEMBERSHIP.until}</p>
              <p className="text-[20px] font-extrabold leading-tight tracking-[-0.02em] text-fg tabular">{money(MEMBERSHIP.price)}</p>
            </div>
            <span className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11.5px] font-bold text-fg-2">
              {PAY_METHOD.brand} •••• {PAY_METHOD.last4}
            </span>
          </div>
          <ul className="mt-1">
            {PAYMENTS.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime/10 text-lime">
                  <Receipt className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold text-fg">{p.concept}</p>
                  <p className="truncate text-[11.5px] text-muted">
                    {p.date} · {p.method}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13.5px] font-extrabold text-fg tabular">{money(p.amount)}</p>
                  <p className="text-[11px] font-bold text-lime">Pagado</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* logros */}
      <section className="stagger mt-7" style={si(4)}>
        <div className="flex items-center justify-between">
          <h3 className="text-[19px] font-extrabold tracking-[-0.02em] text-fg">
            Logros
          </h3>
          <span className="text-[13px] font-semibold text-muted tabular">{unlocked.length} de {BADGES.length} desbloqueados</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {BADGES.map((b, k) => {
            const locked = !!b.progress;
            return (
              <div
                key={b.id}
                className="flex flex-col items-center rounded-[22px] bg-surface px-2 pb-3 pt-4 text-center transition hover:-translate-y-0.5"
                style={{ animation: `fade-up .5s cubic-bezier(.22,1,.36,1) ${k * 40}ms both` }}
                title={b.hint}
              >
                {locked ? (
                  <Ring value={b.progress!} size={52} stroke={4} color="rgb(255 255 255 / 0.35)">
                    <b.icon className="size-5 text-faint" />
                  </Ring>
                ) : (
                  <span className={cn("grid size-[52px] place-items-center rounded-full ring-1", TONE_CLS[b.tone])}>
                    <b.icon className="size-[22px]" />
                  </span>
                )}
                <p className={cn("mt-2.5 text-[12.5px] font-extrabold leading-tight", locked ? "text-muted" : "text-fg")}>{b.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-muted">{locked ? `${b.progress}% · ${b.hint}` : b.hint}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ajustes */}
      <section className="stagger mt-7" style={si(5)}>
        <h3 className="text-[19px] font-extrabold tracking-[-0.02em] text-fg">Cuenta</h3>
        <div className="mt-3 overflow-hidden rounded-[26px] bg-surface">
          <div className="flex w-full items-center gap-3 border-b border-white/[0.05] px-4 py-3.5">
            <RowIcon icon={Bell} />
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-bold text-fg">Notificaciones</span>
              <span className="block text-[12px] text-muted">Recordatorios de clase y vencimientos</span>
            </span>
            <button
              role="switch"
              aria-checked={notif}
              aria-label="Notificaciones"
              onClick={() => setNotif((v) => !v)}
              className={cn("relative h-[30px] w-[52px] shrink-0 rounded-full transition-colors duration-300", notif ? "bg-lime" : "bg-white/12")}
            >
              <span
                className={cn(
                  "absolute top-[3px] size-6 rounded-full shadow transition-all duration-300",
                  notif ? "left-[25px] bg-lime-ink" : "left-[3px] bg-fg",
                )}
              />
            </button>
          </div>
          <SettingRow icon={UserRound} title="Datos personales" sub="DNI, contacto y contacto de emergencia" />
          <SettingRow
            icon={FileHeart}
            title="Apto médico"
            sub="Vigente hasta 14 mar 2027"
            badge={<span className="rounded-full bg-lime/12 px-2 py-0.5 text-[11px] font-bold text-lime">Al día</span>}
          />
          <SettingRow icon={CreditCard} title="Métodos de pago" sub={`${PAY_METHOD.brand} •••• ${PAY_METHOD.last4} · vence ${PAY_METHOD.exp}`} last />
        </div>
        <button
          onClick={() => setLogout(true)}
          className="mt-3 flex w-full items-center gap-3 rounded-[22px] bg-rose/[0.07] px-4 py-3.5 text-left ring-1 ring-rose/15 transition hover:bg-rose/10"
        >
          <span className="grid size-10 place-items-center rounded-2xl bg-rose/15 text-rose">
            <LogOut className="size-[18px]" />
          </span>
          <span className="flex-1 text-[14.5px] font-bold text-rose">Cerrar sesión</span>
        </button>
        <p className="mt-4 text-center text-[11.5px] font-medium text-faint">
          {ME.gym} · v 3.8.1 · con tecnología {BRAND.name}
        </p>
      </section>

      {/* hoja QR (mismo estilo que Inicio) */}
      <Sheet open={qr} onClose={closeQr} label="Mi QR de acceso" className="text-center">
        <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-lime">Acceso válido</p>
        <p className="mt-1 text-[22px] font-extrabold text-fg">{ME.name}</p>
        <div className="relative mx-auto mt-5 w-fit rounded-[28px] bg-white p-5 shadow-[0_0_80px_-10px_rgb(181_245_74/0.6)]">
          <QRCodeSVG value={`pulso:member:${ME.id}:2026-11-25`} size={196} fgColor="#0B1018" />
        </div>
        <p className="mt-4 text-[13px] text-muted">Acercalo al lector del molinete · se renueva cada 30 s</p>
      </Sheet>

      <Sheet open={logout} onClose={closeLogout} label="Cerrar sesión" className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-rose/15 text-rose">
          <LogOut className="size-6" />
        </span>
        <p className="mt-3 text-[20px] font-extrabold text-fg">¿Cerrar sesión?</p>
        <p className="mt-1 text-[13px] text-muted">Vas a necesitar tu email para volver a entrar. Tus reservas se mantienen.</p>
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button onClick={closeLogout} className="h-[52px] rounded-full bg-white/[0.07] text-[14.5px] font-bold text-fg active:scale-95">
            Cancelar
          </button>
          <Link
            href="/login"
            className="grid h-[52px] place-items-center rounded-full bg-rose text-[14.5px] font-extrabold text-white active:scale-95"
          >
            Cerrar sesión
          </Link>
        </div>
      </Sheet>
    </div>
  );
}

function RowIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/[0.05] text-lime">
      <Icon className="size-[18px]" />
    </span>
  );
}

function SettingRow({
  icon,
  title,
  sub,
  badge,
  last,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
  badge?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <button className={cn("flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.02]", !last && "border-b border-white/[0.05]")}>
      <RowIcon icon={icon} />
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-bold text-fg">{title}</span>
        <span className="block truncate text-[12px] text-muted">{sub}</span>
      </span>
      {badge}
      <ChevronRight className="size-5 shrink-0 text-muted" />
    </button>
  );
}
