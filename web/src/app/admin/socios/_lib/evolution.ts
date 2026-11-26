/* Evolución física del socio. Las 8 evaluaciones son las mismas series de la ficha (getProfile.body);
   los PRs coinciden con los destacados de la rutina del Resumen. */
import { PHOTO } from "@/lib/photos";
import { rng, routineKey, type Profile } from "./profile";

export const EVAL_DATES = ["10 jun", "1 jul", "15 jul", "2 ago", "26 ago", "23 sep", "21 oct", "18 nov"];

export type PR = { exercise: string; value: number; prev: number; unit: string; reps: string; date: string; history: number[]; better: "up" | "down" };

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function getEvolution(p: Profile) {
  const r = rng(Number(p.member.id) * 7_211);
  const f = p.female;
  const key = routineKey(p.member.plan);
  // Fechas reales del socio: la última evaluación es la de la ficha (antes de la licencia o del último ingreso).
  const dates = [...EVAL_DATES.slice(0, -1), p.body.lastEval];
  const st = p.member.status;
  const shift: Record<string, string> =
    st === "congelado" ? { "18 nov": "3 nov", "11 nov": "28 oct", "4 nov": "21 oct" } : st === "vencido" ? { "18 nov": "14 nov" } : {};
  const on = (d: string) => shift[d] ?? d;
  const series = dates.map((date, k) => ({ date, weight: p.body.weight[k], fat: p.body.fat[k], muscle: p.body.muscle[k] }));
  const height = f ? 1.66 : 1.79;
  const j = () => +((r() - 0.5) * 1.2).toFixed(1);
  const perimeters = (
    f
      ? [
          { label: "Cintura", first: 76 + j(), last: 71.5 + j(), better: "down" },
          { label: "Cadera", first: 102 + j(), last: 99 + j(), better: "down" },
          { label: "Glúteo", first: 98 + j(), last: 99.5 + j(), better: "up" },
          { label: "Muslo", first: 58 + j(), last: 56.5 + j(), better: "down" },
          { label: "Brazo", first: 28 + j(), last: 29 + j(), better: "up" },
        ]
      : [
          { label: "Cintura", first: 91 + j(), last: 86.5 + j(), better: "down" },
          { label: "Pecho", first: 102 + j(), last: 104.5 + j(), better: "up" },
          { label: "Brazo", first: 35 + j(), last: 37 + j(), better: "up" },
          { label: "Muslo", first: 59 + j(), last: 60.5 + j(), better: "up" },
          { label: "Cadera", first: 100 + j(), last: 98 + j(), better: "down" },
        ]
  ) as { label: string; first: number; last: number; better: "up" | "down" }[];

  const hist = (to: number, from: number, n = 6) => Array.from({ length: n }, (_, k) => +(from + ((to - from) * k) / (n - 1) + (k > 0 && k < n - 1 ? (r() - 0.5) * (to - from) * 0.25 : 0)).toFixed(1));
  const mk = (exercise: string, value: number, prev: number, unit: string, repsTxt: string, date: string, better: "up" | "down" = "up"): PR => ({ exercise, value, prev, unit, reps: repsTxt, date: on(date), better, history: hist(value, prev) });

  const prs: PR[] =
    key === "cross"
      ? [
          mk("Back squat", f ? 65 : 105, f ? 55 : 92.5, "kg", "1 RM", "18 nov"),
          mk("Clean", f ? 45 : 75, f ? 37.5 : 65, "kg", "1 RM", "4 nov"),
          mk("Pull-ups", f ? 6 : 14, f ? 2 : 9, "reps", "estrictas", "11 nov"),
          mk("Fran", f ? 7.4 : 5.2, f ? 9.1 : 6.3, "min", "RX escalado", "28 oct", "down"),
        ]
      : key === "pilates"
        ? [
            mk("Plancha", 75, 45, "s", "isométrica", "18 nov"),
            mk("Puente de hombros", 15, 10, "reps", "3 series", "11 nov"),
            mk("Roll up", 12, 6, "reps", "sin impulso", "4 nov"),
            mk("Movilidad (test)", 8, 6, "/10", "evaluación", "18 nov"),
          ]
        : f
          ? [
              mk("Hip thrust", 70, 55, "kg", "3 × 10", "18 nov"),
              mk("Sentadilla goblet", 24, 18, "kg", "4 × 10", "11 nov"),
              mk("Remo a un brazo", 16, 12, "kg", "4 × 10", "4 nov"),
              mk("Sentadilla trasera", 45, 35, "kg", "4 × 6", "21 oct"),
              mk("Plancha", 75, 40, "s", "isométrica", "18 nov"),
            ]
          : [
              mk("Sentadilla", 110, 97.5, "kg", "1 RM", "18 nov"),
              mk("Press banca", 85, 77.5, "kg", "1 RM", "11 nov"),
              mk("Peso muerto", 140, 125, "kg", "1 RM", "4 nov"),
              mk("Press militar", 52.5, 45, "kg", "3 RM", "21 oct"),
              mk("Dominadas lastradas", 15, 5, "kg", "+ 5 reps", "28 oct"),
            ];

  const goalPct = Math.min(92, Math.round(38 + p.member.attendance * 0.4));
  const top = prs[0];
  const fatNow = p.body.fat.at(-1)!;
  const fatTarget = +(Math.floor(fatNow) - (f ? 1.5 : 2)).toFixed(1);
  const goals = [
    { title: p.body.goal, detail: `Objetivo principal · revisión ${p.body.nextEval}`, pct: goalPct, tone: "violet" as const, due: "mar 2027" },
    {
      title: `${top.exercise} ${(top.better === "up" ? Math.ceil((top.value * 1.12) / 2.5) * 2.5 : +(top.value * 0.9).toFixed(1)).toLocaleString("es-AR")} ${top.unit}`,
      detail: `Hoy ${top.value.toLocaleString("es-AR")} ${top.unit} · ${top.reps}`,
      pct: top.better === "up" ? Math.round((top.value / (Math.ceil((top.value * 1.12) / 2.5) * 2.5)) * 100) : 82,
      tone: "lime" as const,
      due: "feb 2027",
    },
    f
      ? (() => {
          const w = perimeters[0];
          const target = Math.floor(w.last) - 1;
          return { title: `Cintura de ${target} cm`, detail: `Hoy ${w.last.toLocaleString("es-AR")} cm · desde ${w.first.toLocaleString("es-AR")} cm`, pct: clamp(Math.round(((w.first - w.last) / (w.first - target)) * 100)), tone: "amber" as const, due: "abr 2027" };
        })()
      : { title: `Grasa corporal bajo ${fatTarget.toLocaleString("es-AR")} %`, detail: `Hoy ${fatNow.toLocaleString("es-AR")} % · desde ${p.body.fat[0].toLocaleString("es-AR")} %`, pct: clamp(Math.round(((p.body.fat[0] - fatNow) / (p.body.fat[0] - fatTarget)) * 100)), tone: "amber" as const, due: "abr 2027" },
    { title: "20 semanas seguidas con 3+ sesiones", detail: `Racha actual ${p.stats.streak} · mejor ${p.stats.bestStreak}`, pct: clamp(Math.round((p.stats.streak / 20) * 100)), tone: "cyan" as const, due: "continuo" },
  ];

  const photos = {
    before: { src: f ? PHOTO.backWoman(900, 1200) : PHOTO.backMan(900, 1200), date: `${dates[0]} 2026`, weight: series[0].weight, fat: series[0].fat },
    after: { src: f ? PHOTO.focusWoman(900, 1200) : PHOTO.deadlift(900, 1200), date: `${dates.at(-1)} 2026`, weight: series.at(-1)!.weight, fat: series.at(-1)!.fat },
  };

  return {
    photos,
    targets: { fat: fatTarget, muscle: f ? undefined : +(p.body.muscle[0] + 2).toFixed(1) },
    series,
    height,
    bmi: series.map((s) => +(s.weight / (height * height)).toFixed(1)),
    perimeters,
    prs,
    goals,
  };
}

export type Evolution = ReturnType<typeof getEvolution>;
