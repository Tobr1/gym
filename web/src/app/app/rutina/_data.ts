/* Sesión de hoy del socio: Día A (Empuje) del programa «Full Power · PPL» que arma Nico Paredes en /admin/rutinas. */
import { BLOCK_META, DAYS, EX_BY_ID, INITIAL, type Item } from "@/app/admin/rutinas/_components/data";
import { COACH } from "@/app/admin/clases/_components/data";

export const TODAY_DAY = DAYS[0]; // Día A · Empuje
export const BLOCKS = INITIAL.A;
export const ITEMS = BLOCKS.flatMap((b) => b.items);
export const PROGRAM = { name: "Full Power · PPL", week: 3, weeks: 6, coach: COACH.nico };
export { BLOCK_META, EX_BY_ID };

export type Unit = "reps" | "s" | "min";
export type SetLog = { kg: number; reps: number; done: boolean };

export function unitOf(i: Item): Unit {
  if (/min/.test(i.reps)) return "min";
  if (/\d\s*s$/.test(i.reps.trim())) return "s";
  return "reps";
}

/** Objetivo por serie: el tope del rango ("6-8" → 8). AMRAP arranca en 12. */
export function targetOf(i: Item) {
  const m = i.reps.match(/(\d+)(?:\s*-\s*(\d+))?/);
  if (!m) return 12;
  return Number(m[2] ?? m[1]);
}

/** Estado inicial: la entrada en calor ya está hecha y va 2/4 en press de banca. */
export function initialLogs(): Record<string, SetLog[]> {
  const out: Record<string, SetLog[]> = {};
  for (const it of ITEMS) {
    const doneCount = BLOCKS[0].items.includes(it) ? it.sets : it.exId === "banca" ? 2 : 0;
    out[it.uid] = Array.from({ length: it.sets }, (_, k) => ({ kg: it.kg, reps: targetOf(it), done: k < doneCount }));
  }
  return out;
}

/** Última sesión registrada (para la referencia "anterior"). */
export const prevKg = (i: Item) => (i.kg >= 40 ? i.kg - 2.5 : i.kg > 0 ? i.kg - 2 : 0);

export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
export const kgFmt = (n: number) => n.toLocaleString("es-AR", { maximumFractionDigits: 1 });
