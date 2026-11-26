"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, ChevronRight, Clock, Flame, MapPin, QrCode, Repeat, ShieldCheck, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Avatar, AvatarStack } from "@/components/ui/primitives";
import { PHOTO } from "@/lib/photos";
import { cn } from "@/lib/utils";

const DAYS = [
  { d: "Lun", n: 23, done: true },
  { d: "Mar", n: 24, done: true },
  { d: "Mié", n: 25, today: true },
  { d: "Jue", n: 26, booked: true },
  { d: "Vie", n: 27 },
  { d: "Sáb", n: 28, booked: true },
  { d: "Dom", n: 29 },
];

const CATS = ["Todo", "Pecho", "Brazos", "Espalda", "Movilidad"];

const WORKOUTS = [
  { title: "Empuje · Pecho", cat: "Pecho", desc: "Técnica antes que carga", img: PHOTO.bench, min: 12, reps: "4 × 10" },
  { title: "Brazos", cat: "Brazos", desc: "Subí el peso de a poco", img: PHOTO.shoulder, min: 15, reps: "3 × 12" },
  { title: "Tirón · Espalda", cat: "Espalda", desc: "Dominadas asistidas", img: PHOTO.pullup, min: 20, reps: "3 × 8" },
  { title: "Core & movilidad", cat: "Movilidad", desc: "Cierre de sesión", img: PHOTO.yoga, min: 10, reps: "3 × 30 s" },
];

const CLASSES = [
  { name: "CrossTraining", time: "18:00", coach: 3, spots: "4 lugares", img: PHOTO.ropes, tone: "lime" },
  { name: "Spinning Power", time: "19:30", coach: 4, spots: "Completa · lista de espera", img: PHOTO.runners, tone: "amber" },
  { name: "Pilates Reformer", time: "20:15", coach: 9, spots: "2 lugares", img: PHOTO.yoga, tone: "cyan" },
];

const s = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function MemberHome() {
  const [cat, setCat] = useState(0);
  const [day, setDay] = useState(2);
  const [qr, setQr] = useState(false);
  const [booked, setBooked] = useState<number[]>([]);

  return (
    <div className="px-5 pb-4 pt-5 md:pt-1">
      {/* header */}
      <header className="stagger flex items-center justify-between" id="perfil">
        <Avatar i={0} size={52} className="ring-2 ring-white/10" />
        <div className="text-center">
          <p className="text-[19px] font-extrabold tracking-[-0.02em] text-fg">Hola, Martín</p>
          <p className="text-[13px] font-medium text-muted">Miércoles 25 nov</p>
        </div>
        <button className="relative grid size-[52px] place-items-center rounded-full bg-white/[0.05] text-fg ring-1 ring-white/8" aria-label="Notificaciones">
          <Bell className="size-[22px]" />
          <span className="absolute right-3.5 top-3.5 size-2 rounded-full bg-lime" />
        </button>
      </header>

      {/* desafío del día */}
      <section className="stagger relative mt-5 overflow-hidden rounded-[28px] bg-lime p-6 text-lime-ink" style={s(1)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PHOTO.pullup(700, 700)}
          alt=""
          className="absolute -right-6 top-0 h-full w-[62%] object-cover mix-blend-multiply grayscale contrast-125 [mask-image:linear-gradient(to_left,black_55%,transparent)]"
        />
        <div className="relative max-w-[62%]">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] opacity-60">Racha · 12 días</p>
          <h2 className="mt-1 text-[30px] font-extrabold leading-[1] tracking-[-0.04em]">
            Desafío
            <br />
            del día
          </h2>
          <p className="mt-2 text-[13px] font-semibold opacity-75">Completá tu rutina antes de las 21:00</p>
          <div className="mt-4 flex items-center">
            <AvatarStack ids={[1, 3, 4]} size={30} />
            <span className="-ml-2 grid size-[30px] place-items-center rounded-full bg-lime-ink text-[10px] font-extrabold text-lime ring-2 ring-lime">
              +18
            </span>
          </div>
        </div>
      </section>

      {/* membresía + QR */}
      <section className="stagger mt-4 flex items-center gap-3 rounded-[22px] border border-line bg-surface p-3 pl-4" style={s(2)}>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-lime">
            <ShieldCheck className="size-3.5" /> Pase Libre · activo
          </p>
          <p className="mt-0.5 text-[15px] font-extrabold text-fg">17 días restantes</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div className="h-full w-[56%] rounded-full bg-lime" />
          </div>
        </div>
        <button
          onClick={() => setQr(true)}
          className="flex h-[52px] items-center gap-2 rounded-2xl bg-white/[0.06] px-4 text-[13px] font-bold text-fg ring-1 ring-white/10 transition active:scale-95"
        >
          <QrCode className="size-5 text-lime" /> Mi QR
        </button>
      </section>

      {/* días */}
      <section className="stagger mt-5 flex justify-between gap-1.5" style={s(3)}>
        {DAYS.map((d, i) => (
          <button
            key={d.n}
            onClick={() => setDay(i)}
            className={cn(
              "relative flex h-[70px] flex-1 flex-col items-center justify-center rounded-full border text-[13px] font-semibold transition-all duration-300",
              day === i
                ? "border-lime bg-lime text-lime-ink shadow-[0_8px_24px_-6px_rgb(181_245_74/0.6)]"
                : "border-white/12 text-muted hover:border-white/25",
            )}
          >
            {/* punto lleno = entrenó · anillo = clase reservada */}
            {(d.booked || d.done) && (
              <span
                className={cn(
                  "absolute top-2 size-1.5 rounded-full",
                  d.done && (day === i ? "bg-lime-ink" : "bg-lime"),
                  d.booked && (day === i ? "ring-[1.5px] ring-lime-ink" : "ring-[1.5px] ring-lime"),
                )}
              />
            )}
            <span className="mt-1">{d.d}</span>
            <span className={cn("text-[15px] font-extrabold", day === i ? "" : "text-fg")}>{d.n}</span>
          </button>
        ))}
      </section>

      {/* clases */}
      <section id="clases" className="stagger mt-6" style={s(4)}>
        <div className="flex items-center justify-between">
          <h3 className="text-[19px] font-extrabold tracking-[-0.02em] text-fg">Clases de hoy</h3>
          <Link href="/app/clases" className="text-[13px] font-semibold text-muted hover:text-fg">Ver todas</Link>
        </div>
        <div className="no-scrollbar -mx-5 mt-3 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
          {CLASSES.map((c, i) => {
            const full = c.spots.startsWith("Completa");
            const on = booked.includes(i);
            return (
              <article key={c.name} className="relative h-[164px] w-[236px] shrink-0 snap-start overflow-hidden rounded-[24px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img(500, 400)} alt="" className="photo-grade absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                <div className="relative flex h-full flex-col justify-between p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11.5px] font-bold text-white backdrop-blur">
                      <Clock className="size-3" /> {c.time}
                    </span>
                    <Avatar i={c.coach} size={28} className="ring-2 ring-black/40" />
                  </div>
                  <div>
                    <Link href="/app/clases" className="block text-[16px] font-extrabold text-white hover:underline">{c.name}</Link>
                    <p className={cn("text-[11.5px] font-semibold", full ? "text-amber" : "text-white/70")}>{c.spots}</p>
                    <button
                      onClick={() => setBooked((b) => (on ? b.filter((x) => x !== i) : [...b, i]))}
                      className={cn(
                        "mt-2.5 h-9 w-full rounded-full text-[12.5px] font-extrabold transition-all active:scale-95",
                        on ? "bg-white/15 text-white ring-1 ring-white/30" : "bg-lime text-lime-ink",
                      )}
                    >
                      {on ? "✓ Reservada" : full ? "Unirme a la espera" : "Reservar lugar"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* programa */}
      <section className="stagger mt-7" style={s(5)}>
        <div className="flex items-center justify-between">
          <h3 className="text-[19px] font-extrabold tracking-[-0.02em] text-fg">Tu rutina de hoy</h3>
          <Link href="/app/rutina" className="text-[13px] font-semibold text-muted hover:text-fg">Ver todo</Link>
        </div>
        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
          {CATS.map((c, i) => (
            <button
              key={c}
              onClick={() => setCat(i)}
              className={cn(
                "h-11 shrink-0 rounded-full px-5 text-[14px] font-semibold transition-all",
                cat === i ? "bg-lime text-lime-ink" : "bg-white/[0.06] text-fg hover:bg-white/10",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {WORKOUTS.filter((w) => cat === 0 || w.cat === CATS[cat]).map((w) => (
            <Link href="/app/rutina" key={w.title} className="group relative block aspect-[0.86] overflow-hidden rounded-[22px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={w.img(400, 470)} alt="" className="photo-grade absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
              <div className="relative flex h-full flex-col justify-between p-2.5">
                <div className="flex gap-1">
                  <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10.5px] font-bold text-white backdrop-blur">
                    <Clock className="size-3" />
                    {w.min} min
                  </span>
                  <span className="rounded-full bg-black/40 px-2 py-1 text-[10.5px] font-bold text-white backdrop-blur">{w.reps}</span>
                </div>
                <div className="px-1">
                  <p className="text-[14.5px] font-extrabold leading-tight text-white">{w.title}</p>
                  <p className="truncate text-[11.5px] text-white/70">{w.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* resumen */}
      <section className="stagger mt-4 grid grid-cols-3 gap-2.5" style={s(6)}>
        {[
          { icon: Flame, v: "824", l: "kcal hoy", c: "text-amber" },
          { icon: Repeat, v: "12", l: "días racha", c: "text-lime" },
          { icon: MapPin, v: "3", l: "sedes", c: "text-cyan" },
        ].map((k) => (
          <div key={k.l} className="rounded-[20px] bg-surface p-3.5">
            <k.icon className={cn("size-5", k.c)} />
            <p className="mt-2 text-[20px] font-extrabold text-fg tabular">{k.v}</p>
            <p className="text-[11px] font-semibold text-muted">{k.l}</p>
          </div>
        ))}
      </section>

      <button className="mt-4 flex w-full items-center gap-3 rounded-[20px] bg-surface p-4 text-left">
        <span className="grid size-11 place-items-center rounded-2xl bg-violet/15 text-[15px] font-extrabold text-violet">$</span>
        <span className="flex-1">
          <span className="block text-[14px] font-bold text-fg">Próxima cuota · $ 48.900</span>
          <span className="block text-[12px] text-muted">Débito automático el 12 dic</span>
        </span>
        <ChevronRight className="size-5 text-muted" />
      </button>

      {/* hoja QR */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:absolute",
          qr ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setQr(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "w-full rounded-t-[32px] border-t border-lime/30 bg-surface p-6 pb-10 text-center transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
            qr ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />
          <button onClick={() => setQr(false)} className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-white/8 text-fg" aria-label="Cerrar">
            <X className="size-4" />
          </button>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-lime">Acceso válido</p>
          <p className="mt-1 text-[22px] font-extrabold text-fg">Martín Ibáñez</p>
          <div className="relative mx-auto mt-5 w-fit rounded-[28px] bg-white p-5 shadow-[0_0_80px_-10px_rgb(181_245_74/0.6)]">
            <QRCodeSVG value="pulso:member:1043:2026-11-25" size={196} fgColor="#0B1018" />
          </div>
          <p className="mt-4 text-[13px] text-muted">Acercalo al lector del molinete · se renueva cada 30 s</p>
        </div>
      </div>
    </div>
  );
}
