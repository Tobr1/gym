import { PHOTO } from "@/lib/photos";

/* Datos de demostración del constructor de rutinas. */

export type Muscle = "Pecho" | "Espalda" | "Hombros" | "Brazos" | "Piernas" | "Glúteos" | "Core";

export const MUSCLES: Muscle[] = ["Pecho", "Espalda", "Hombros", "Brazos", "Piernas", "Glúteos", "Core"];

export const MUSCLE_COLOR: Record<Muscle, string> = {
  Pecho: "var(--color-lime)",
  Espalda: "var(--color-violet)",
  Hombros: "var(--color-cyan)",
  Brazos: "var(--color-amber)",
  Piernas: "var(--color-emerald)",
  Glúteos: "var(--color-rose)",
  Core: "#c9d4e2",
};

/** Rango óptimo de series semanales por grupo (hipertrofia, nivel intermedio). */
export const MUSCLE_TARGET: Record<Muscle, [number, number]> = {
  Pecho: [10, 18],
  Espalda: [10, 20],
  Hombros: [8, 16],
  Brazos: [6, 14],
  Piernas: [10, 18],
  Glúteos: [6, 14],
  Core: [6, 12],
};

export type Exercise = {
  id: string;
  name: string;
  muscle: Muscle;
  secondary?: Muscle;
  equipment: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  photo: string;
};

export const EXERCISES: Exercise[] = [
  { id: "banca", name: "Press de banca plano", muscle: "Pecho", secondary: "Brazos", equipment: "Barra", level: "Intermedio", photo: PHOTO.bench(240, 240) },
  { id: "inclinado", name: "Press inclinado con mancuernas", muscle: "Pecho", secondary: "Hombros", equipment: "Mancuernas", level: "Intermedio", photo: PHOTO.dumbbells(240, 240) },
  { id: "flexiones", name: "Flexiones con déficit", muscle: "Pecho", secondary: "Brazos", equipment: "Peso corporal", level: "Básico", photo: PHOTO.pushup(240, 240) },
  { id: "militar", name: "Press militar de pie", muscle: "Hombros", secondary: "Brazos", equipment: "Barra", level: "Intermedio", photo: PHOTO.shoulder(240, 240) },
  { id: "laterales", name: "Elevaciones laterales", muscle: "Hombros", equipment: "Mancuernas", level: "Básico", photo: PHOTO.wrist(240, 240) },
  { id: "fondos", name: "Fondos en paralelas", muscle: "Brazos", secondary: "Pecho", equipment: "Paralelas", level: "Intermedio", photo: PHOTO.machine(240, 240) },
  { id: "curl", name: "Curl de bíceps alterno", muscle: "Brazos", equipment: "Mancuernas", level: "Básico", photo: PHOTO.heroCurl(240, 240) },
  { id: "dominadas", name: "Dominadas pronas", muscle: "Espalda", secondary: "Brazos", equipment: "Barra fija", level: "Avanzado", photo: PHOTO.pullup(240, 240) },
  { id: "remo", name: "Remo con barra", muscle: "Espalda", secondary: "Brazos", equipment: "Barra", level: "Intermedio", photo: PHOTO.row(240, 240) },
  { id: "remo-polea", name: "Remo sentado en polea", muscle: "Espalda", equipment: "Polea", level: "Básico", photo: PHOTO.backMan(240, 240) },
  { id: "sentadilla", name: "Sentadilla trasera", muscle: "Piernas", secondary: "Glúteos", equipment: "Barra", level: "Intermedio", photo: PHOTO.barbell(240, 240) },
  { id: "peso-muerto", name: "Peso muerto convencional", muscle: "Piernas", secondary: "Espalda", equipment: "Barra", level: "Avanzado", photo: PHOTO.deadlift(240, 240) },
  { id: "hip-thrust", name: "Hip thrust con barra", muscle: "Glúteos", secondary: "Piernas", equipment: "Barra", level: "Intermedio", photo: PHOTO.focusWoman(240, 240) },
  { id: "estocadas", name: "Estocadas búlgaras", muscle: "Piernas", secondary: "Glúteos", equipment: "Mancuernas", level: "Intermedio", photo: PHOTO.backWoman(240, 240) },
  { id: "ropes", name: "Battle ropes · ondas", muscle: "Core", secondary: "Hombros", equipment: "Sogas", level: "Básico", photo: PHOTO.ropes(240, 240) },
  { id: "plancha", name: "Plancha con arrastre", muscle: "Core", equipment: "Disco", level: "Intermedio", photo: PHOTO.classRopes(240, 240) },
  { id: "movilidad", name: "Movilidad de cadera 90/90", muscle: "Glúteos", equipment: "Colchoneta", level: "Básico", photo: PHOTO.yoga(240, 240) },
  { id: "remo-ergo", name: "Remo ergómetro", muscle: "Espalda", secondary: "Piernas", equipment: "Ergómetro", level: "Básico", photo: PHOTO.machine(240, 240) },
];

export const EX_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e])) as Record<string, Exercise>;

export type BlockKind = "warmup" | "main" | "superset" | "core";

export const BLOCK_META: Record<BlockKind, { label: string; tag: string; color: string }> = {
  warmup: { label: "Entrada en calor", tag: "Activación", color: "var(--color-amber)" },
  main: { label: "Bloque principal", tag: "Fuerza", color: "var(--color-lime)" },
  superset: { label: "Superserie", tag: "Sin pausa entre ejercicios", color: "var(--color-violet)" },
  core: { label: "Core", tag: "Finisher", color: "var(--color-cyan)" },
};

export type Item = {
  uid: string;
  exId: string;
  sets: number;
  reps: string;
  kg: number;
  rest: number; // segundos
  rpe: number;
  tempo: string;
};

export type Block = { id: string; kind: BlockKind; items: Item[] };

export type DayId = "A" | "B" | "C";

export const DAYS: { id: DayId; name: string; focus: string; photo: string }[] = [
  { id: "A", name: "Día A", focus: "Empuje", photo: PHOTO.bench(900, 300) },
  { id: "B", name: "Día B", focus: "Tirón", photo: PHOTO.pullup(900, 300) },
  { id: "C", name: "Día C", focus: "Piernas", photo: PHOTO.deadlift(900, 300) },
];

let n = 0;
const it = (exId: string, sets: number, reps: string, kg: number, rest: number, rpe: number, tempo = "2-0-1-0"): Item => ({
  uid: `i${++n}`,
  exId,
  sets,
  reps,
  kg,
  rest,
  rpe,
  tempo,
});

export const INITIAL: Record<DayId, Block[]> = {
  A: [
    { id: "A-w", kind: "warmup", items: [it("remo-ergo", 1, "5 min", 0, 30, 6, "—"), it("flexiones", 2, "10", 0, 45, 6)] },
    { id: "A-m", kind: "main", items: [it("banca", 4, "6-8", 80, 150, 8, "3-1-1-0"), it("militar", 4, "8", 45, 120, 8, "2-0-1-0")] },
    { id: "A-s", kind: "superset", items: [it("inclinado", 3, "10-12", 26, 0, 8), it("laterales", 3, "15", 10, 75, 9, "2-1-1-0")] },
    { id: "A-c", kind: "core", items: [it("fondos", 3, "AMRAP", 0, 60, 9, "2-0-1-0"), it("plancha", 3, "40 s", 10, 45, 7, "—")] },
  ],
  B: [
    { id: "B-w", kind: "warmup", items: [it("remo-ergo", 1, "6 min", 0, 30, 6, "—")] },
    { id: "B-m", kind: "main", items: [it("dominadas", 4, "6-8", 10, 150, 8, "3-0-1-1"), it("remo", 4, "8-10", 70, 120, 8)] },
    { id: "B-s", kind: "superset", items: [it("remo-polea", 3, "12", 55, 0, 8), it("curl", 3, "12", 14, 75, 9)] },
    { id: "B-c", kind: "core", items: [it("ropes", 4, "30 s", 0, 30, 8, "—")] },
  ],
  C: [
    { id: "C-w", kind: "warmup", items: [it("movilidad", 2, "8 / lado", 0, 30, 5, "—")] },
    { id: "C-m", kind: "main", items: [it("sentadilla", 5, "5", 110, 180, 8, "3-1-1-0"), it("peso-muerto", 3, "5", 130, 180, 8, "2-0-1-0")] },
    { id: "C-s", kind: "superset", items: [it("hip-thrust", 3, "10", 100, 0, 8), it("estocadas", 3, "10 / lado", 20, 90, 8)] },
    { id: "C-c", kind: "core", items: [it("plancha", 3, "45 s", 10, 45, 7, "—")] },
  ],
};

export const ASSIGNED = [
  { name: "Tomás Herrera", face: 0, adherence: 92, week: 3 },
  { name: "Valentina Ruiz", face: 4, adherence: 81, week: 2 },
  { name: "Mateo Fernández", face: 6, adherence: 74, week: 3 },
  { name: "Benjamín Acosta", face: 8, adherence: 97, week: 4 },
];

export const REST_OPTIONS = [0, 30, 45, 60, 75, 90, 120, 150, 180];

export const fmtRest = (s: number) => (s === 0 ? "—" : s < 120 ? `${s} s` : `${s / 60 % 1 === 0 ? s / 60 : (s / 60).toLocaleString("es-AR")} min`);

/** Reps promedio a partir de textos como "6-8", "10", "AMRAP", "40 s". */
export function avgReps(reps: string) {
  const m = reps.match(/(\d+)(?:\s*-\s*(\d+))?/);
  if (!m || /s$|min/.test(reps.trim())) return 0;
  return m[2] ? (Number(m[1]) + Number(m[2])) / 2 : Number(m[1]);
}

/** Segundos estimados de trabajo + pausa de un ejercicio. */
export function itemSeconds(i: Item) {
  const t = i.reps.match(/(\d+)\s*min/);
  if (t) return Number(t[1]) * 60 * i.sets + i.rest * Math.max(0, i.sets - 1);
  const work = /s$/.test(i.reps.trim()) ? Number(i.reps.match(/\d+/)?.[0] ?? 30) : Math.max(25, avgReps(i.reps) * 4 || 40);
  return i.sets * (work + 15) + i.rest * Math.max(0, i.sets - 1) + 30;
}

export const daySeconds = (blocks: Block[]) => blocks.reduce((a, b) => a + b.items.reduce((x, i) => x + itemSeconds(i), 0), 0);
