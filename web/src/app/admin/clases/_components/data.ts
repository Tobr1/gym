import { PHOTO } from "@/lib/photos";

/* Datos de demostración de la agenda de clases. */

export type Discipline = "CrossTraining" | "Funcional" | "Pilates" | "Spinning" | "Yoga";

export const DISCIPLINES: Record<Discipline, { color: string; photo: string; room: string; cap: number; level: string; kcal: string }> = {
  CrossTraining: { color: "var(--color-lime)", photo: PHOTO.classRopes(900, 500), room: "Box Cross", cap: 20, level: "Intermedio", kcal: "650 kcal" },
  Funcional: { color: "var(--color-violet)", photo: PHOTO.ropes(900, 500), room: "Salón 1", cap: 16, level: "Todos los niveles", kcal: "520 kcal" },
  Pilates: { color: "var(--color-cyan)", photo: PHOTO.focusWoman(900, 500), room: "Estudio Reformer", cap: 10, level: "Básico", kcal: "300 kcal" },
  Spinning: { color: "var(--color-amber)", photo: PHOTO.runners(900, 500), room: "Sala Ciclo", cap: 24, level: "Intermedio", kcal: "700 kcal" },
  Yoga: { color: "var(--color-emerald)", photo: PHOTO.yoga(900, 500), room: "Estudio Zen", cap: 18, level: "Todos los niveles", kcal: "250 kcal" },
};

export const DISCIPLINE_LIST = Object.keys(DISCIPLINES) as Discipline[];

export const COACHES = [
  { id: "nico", name: "Nico Paredes", face: 3 },
  { id: "agus", name: "Agus Molina", face: 6 },
  { id: "flor", name: "Flor Benítez", face: 2 },
  { id: "juli", name: "Juli Castro", face: 9 },
  { id: "meli", name: "Meli Ortiz", face: 7 },
  { id: "rami", name: "Rami Díaz", face: 13 },
] as const;

export type CoachId = (typeof COACHES)[number]["id"];
export const COACH = Object.fromEntries(COACHES.map((c) => [c.id, c])) as Record<CoachId, (typeof COACHES)[number]>;

export const ROOMS = Array.from(new Set(Object.values(DISCIPLINES).map((d) => d.room)));

export type ClassItem = {
  id: string;
  day: number; // 0 = lunes
  start: number; // minutos desde 00:00
  dur: number;
  discipline: Discipline;
  title: string;
  coach: CoachId;
  room: string;
  cap: number;
  enrolled: number;
  waitlist: number;
};

const DEF_COACH: Record<Discipline, CoachId[]> = {
  CrossTraining: ["nico", "agus"],
  Funcional: ["agus", "rami"],
  Pilates: ["flor", "meli"],
  Spinning: ["juli", "rami"],
  Yoga: ["meli", "flor"],
};

const SUB: Record<Discipline, string[]> = {
  CrossTraining: ["WOD", "Halterofilia", "HIIT"],
  Funcional: ["Full body", "Circuito", "Core & glúteos"],
  Pilates: ["Reformer", "Mat", "Reformer"],
  Spinning: ["Ritmo", "Intervalos", "Endurance"],
  Yoga: ["Vinyasa", "Flow", "Restaurativo"],
};

// [día, "hh:mm", duración, disciplina]
const RAW: [number, string, number, Discipline][] = [
  [0, "07:00", 60, "CrossTraining"], [0, "08:15", 60, "Funcional"], [0, "09:30", 60, "Pilates"], [0, "12:30", 45, "Spinning"],
  [0, "17:00", 60, "Yoga"], [0, "18:15", 60, "CrossTraining"], [0, "19:30", 45, "Spinning"], [0, "20:30", 60, "Funcional"],
  [1, "07:00", 45, "Spinning"], [1, "08:00", 60, "Pilates"], [1, "09:15", 60, "Yoga"], [1, "13:00", 45, "Funcional"],
  [1, "17:15", 60, "Pilates"], [1, "18:30", 60, "CrossTraining"], [1, "19:45", 45, "Spinning"], [1, "20:45", 75, "Yoga"],
  [2, "07:00", 60, "CrossTraining"], [2, "08:15", 60, "Funcional"], [2, "10:00", 60, "Pilates"], [2, "12:30", 45, "Spinning"],
  [2, "17:00", 60, "Funcional"], [2, "18:15", 60, "CrossTraining"], [2, "19:30", 60, "Pilates"], [2, "20:45", 60, "Yoga"],
  [3, "07:00", 45, "Spinning"], [3, "08:00", 60, "Pilates"], [3, "09:15", 60, "Funcional"], [3, "13:00", 60, "Yoga"],
  [3, "17:15", 60, "CrossTraining"], [3, "18:30", 45, "Spinning"], [3, "19:30", 60, "Funcional"], [3, "20:45", 60, "CrossTraining"],
  [4, "07:00", 60, "CrossTraining"], [4, "08:15", 60, "Yoga"], [4, "09:30", 60, "Pilates"], [4, "17:30", 60, "Funcional"],
  [4, "18:45", 45, "Spinning"], [4, "19:45", 60, "CrossTraining"],
  [5, "09:00", 60, "CrossTraining"], [5, "10:15", 60, "Funcional"], [5, "11:30", 75, "Yoga"], [5, "17:00", 45, "Spinning"],
  [6, "10:00", 75, "Yoga"], [6, "11:30", 60, "Pilates"],
];

const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));

// Ocupación pseudoaleatoria determinista, más alta en horario pico.
const rnd = (i: number) => {
  const x = Math.sin(i * 91.7 + 13.1) * 10000;
  return x - Math.floor(x);
};

export const CLASSES: ClassItem[] = RAW.map(([day, t, dur, d], i) => {
  const start = toMin(t);
  const meta = DISCIPLINES[d];
  const peak = (start >= 18 * 60 && start <= 20 * 60) || start <= 7 * 60 ? 0.3 : start >= 17 * 60 ? 0.12 : 0;
  const ratio = Math.min(1.3, 0.42 + rnd(i) * 0.5 + peak);
  const want = Math.round(meta.cap * ratio);
  const enrolled = Math.min(meta.cap, want);
  return {
    id: `c${i}`,
    day,
    start,
    dur,
    discipline: d,
    title: SUB[d][i % 3],
    coach: DEF_COACH[d][i % 2],
    room: meta.room,
    cap: meta.cap,
    enrolled,
    waitlist: Math.max(0, want - meta.cap),
  };
});

/** "Ahora" fijo de la demo: miércoles 25/11/2026, 08:52 de la mañana (coincide con el dashboard). */
export const NOW = { day: 2, min: 8 * 60 + 52 };

export const WEEK_START = { d: 23, m: 10, y: 2026 }; // lunes 23 nov 2026 (mes 0-index)

export const DAY_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const DAY_LONG = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Fecha (sin usar Date para no depender del reloj en el prerender). */
export function dateOf(weekOffset: number, day: number) {
  const dim = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let d = WEEK_START.d + weekOffset * 7 + day;
  let m = WEEK_START.m;
  let y = WEEK_START.y;
  while (d > dim[m]) {
    d -= dim[m];
    m = (m + 1) % 12;
    if (m === 0) y++;
  }
  while (d < 1) {
    m = (m + 11) % 12;
    if (m === 11) y--;
    d += dim[m];
  }
  return { d, m, y };
}

export const MEMBER_NAMES = [
  "Sofía Martínez", "Tomás Herrera", "Valentina Ruiz", "Joaquín Sosa", "Camila Pereyra", "Mateo Fernández",
  "Lucía Gómez", "Benjamín Acosta", "Martina López", "Nicolás Romero", "Julieta Navarro", "Franco Medina",
  "Abril Domínguez", "Thiago Rojas", "Catalina Vega", "Santino Ibarra", "Emilia Cabrera", "Bautista Luna",
  "Renata Ríos", "Facundo Silva", "Pilar Ortega", "Lautaro Godoy", "Delfina Moreno", "Ignacio Peralta",
];
