"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronLeft, Footprints, HeartPulse, MoreHorizontal, Flame, Timer, Trophy } from "lucide-react";
import { PillBars } from "@/components/pill-bars";
import { Ring } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const METRICS = [
  {
    id: "kcal",
    label: "Calorías",
    icon: Flame,
    total: "1.360",
    unit: "kcal",
    data: [62, 74, 50, 86, 64, 50, 88, 70],
  },
  {
    id: "hr",
    label: "Frecuencia",
    icon: HeartPulse,
    total: "128",
    unit: "bpm prom.",
    data: [118, 126, 121, 140, 132, 119, 138, 128],
  },
  {
    id: "steps",
    label: "Pasos",
    icon: Footprints,
    total: "9.842",
    unit: "pasos",
    data: [7.2, 9.1, 6.4, 11.8, 8.5, 5.9, 12.4, 9.8],
  },
];

// últimos 8 días hasta hoy (miércoles 25 nov 2026)
const DAYS = [
  [18, "Mié"], [19, "Jue"], [20, "Vie"], [21, "Sáb"], [22, "Dom"], [23, "Lun"], [24, "Mar"], [25, "Hoy"],
] as const;

export function MemberStats() {
  const [m, setM] = useState(0);
  const metric = METRICS[m];

  return (
    <div className="px-5 pb-4 pt-5 md:pt-1">
      <header className="stagger flex items-center justify-between">
        <Link href="/app" className="grid size-[52px] place-items-center rounded-full bg-white/[0.05] ring-1 ring-white/8" aria-label="Volver">
          <ChevronLeft className="size-5 text-fg" />
        </Link>
        <h1 className="text-[19px] font-extrabold tracking-[-0.02em] text-fg">Mi progreso</h1>
        <button className="grid size-[52px] place-items-center rounded-full bg-white/[0.05] ring-1 ring-white/8" aria-label="Más opciones">
          <MoreHorizontal className="size-5 text-fg" />
        </button>
      </header>

      {/* gráfico principal */}
      <section className="stagger mt-4 rounded-[30px] bg-surface p-3" style={{ "--i": 1 } as React.CSSProperties}>
        <div className="flex gap-1">
          {METRICS.map((x, i) => (
            <button
              key={x.id}
              onClick={() => setM(i)}
              className={cn(
                "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full text-[13.5px] font-bold transition-all duration-300",
                m === i ? "bg-lime text-lime-ink" : "text-fg-2 hover:text-fg",
              )}
            >
              <x.icon className={cn("size-[18px]", m !== i && "text-lime")} />
              {x.label}
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-[24px] bg-ink-2 p-4 pb-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[26px] font-extrabold tracking-[-0.03em] text-lime tabular">
              {metric.total} <span className="text-[14px] font-semibold text-fg-2">{metric.unit}</span>
            </p>
            <button className="flex items-center gap-0.5 text-[13px] font-semibold text-lime">
              Días <ChevronDown className="size-4" />
            </button>
          </div>
          <PillBars
            key={metric.id}
            className="mt-4"
            height={136}
            highlight={metric.data.length - 1}
            data={metric.data.map((v, i) => ({ label: String(DAYS[i][0]), sub: DAYS[i][1], value: v }))}
          />
        </div>
      </section>

      {/* entrenamientos recientes */}
      <section className="stagger mt-5" style={{ "--i": 2 } as React.CSSProperties}>
        <div className="flex items-center justify-between">
          <h3 className="text-[19px] font-extrabold tracking-[-0.02em] text-fg">Entrenamientos recientes</h3>
          <button className="text-[13px] font-semibold text-muted">Ver todo</button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <article className="row-span-2 flex flex-col justify-between overflow-hidden rounded-[24px] bg-surface p-4">
            <div>
              <HeartPulse className="size-7 text-lime" />
              <p className="mt-3 text-[15px] font-semibold text-fg-2">Frecuencia</p>
            </div>
            <svg viewBox="0 0 160 70" className="-mx-4 my-2 w-[calc(100%+32px)]" aria-hidden>
              <defs>
                <filter id="hr-glow">
                  <feGaussianBlur stdDeviation="2.5" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M0 52 C10 52 12 60 20 58 S30 44 38 50 S48 60 56 54 L66 50 L76 12 L86 54 S96 62 104 52 S116 44 124 54 S136 62 146 50 S154 48 160 52"
                fill="none"
                stroke="#B5F54A"
                strokeWidth="2.2"
                strokeLinecap="round"
                filter="url(#hr-glow)"
                strokeDasharray="400"
                style={{ animation: "dash 1.6s ease-out both" }}
              />
              <line x1="76" y1="14" x2="76" y2="70" stroke="#B5F54A" strokeOpacity=".4" />
              <circle cx="76" cy="12" r="5" fill="#0B1018" stroke="#B5F54A" strokeWidth="2.5" />
              <style>{`@keyframes dash{from{stroke-dashoffset:400}to{stroke-dashoffset:0}}`}</style>
            </svg>
            <div>
              <p className="text-[34px] font-extrabold leading-none tracking-[-0.03em] text-fg tabular">123</p>
              <p className="mt-1 text-[13px] font-semibold text-muted">bpm</p>
            </div>
          </article>
          <article className="rounded-[24px] bg-surface p-4 pb-3.5">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-fg-2">
              <Flame className="size-6 text-lime" /> Calorías
            </p>
            <p className="mt-2.5 text-[28px] font-extrabold leading-none tracking-[-0.03em] text-fg tabular">824</p>
            <p className="mt-1 text-[13px] font-semibold text-muted">kcal</p>
          </article>
          <article className="rounded-[24px] bg-surface p-4 pb-3.5">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-fg-2">
              <Timer className="size-6 text-lime" /> Sesión
            </p>
            <p className="mt-2.5 text-[28px] font-extrabold leading-none tracking-[-0.03em] text-fg tabular">52′</p>
            <p className="mt-1 text-[13px] font-semibold text-muted">duración</p>
          </article>
        </div>
      </section>

      {/* objetivos */}
      <section className="stagger mt-3 flex items-center gap-4 rounded-[24px] bg-surface p-4" style={{ "--i": 3 } as React.CSSProperties}>
        <Ring value={75} size={92} stroke={10}>
          <p className="text-[19px] font-extrabold text-fg">3/4</p>
        </Ring>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[12px] font-bold text-lime">
            <Trophy className="size-3.5" /> Objetivo semanal
          </p>
          <p className="mt-1 text-[16px] font-extrabold leading-snug text-fg">Te falta 1 entrenamiento para cerrar la semana</p>
        </div>
      </section>

      <section className="stagger mt-3 rounded-[24px] bg-surface p-4" style={{ "--i": 4 } as React.CSSProperties}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-fg-2">Peso corporal</p>
            <p className="mt-1.5 text-[26px] font-extrabold leading-none tracking-[-0.03em] text-fg tabular">
              80,8 <span className="text-[14px] font-semibold text-fg-2">kg</span>
            </p>
          </div>
          <span className="rounded-full bg-lime/15 px-2.5 py-1 text-[12px] font-bold text-lime tabular">-3,4 kg · 8 sem</span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-2">
          {[84.2, 83.6, 83.1, 82.8, 82.2, 81.9, 81.4, 80.8].map((v, i, a) => {
            const last = i === a.length - 1;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <span
                  className={cn("w-3 rounded-full", last ? "bg-lime shadow-[0_0_16px_-2px_rgb(181_245_74/0.7)]" : "bg-white/12")}
                  style={{ height: 20 + (v - 80) * 13 }}
                />
                <span className={cn("text-[10px] font-semibold", last ? "text-lime" : "text-muted")}>S{i + 1}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
