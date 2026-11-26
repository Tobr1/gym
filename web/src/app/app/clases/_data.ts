/* Datos del socio para la reserva de clases. La grilla sale de la agenda de administración (misma fuente). */
import { CLASSES, NOW, type ClassItem } from "@/app/admin/clases/_components/data";

export type BookingState = { kind: "booked" } | { kind: "wait"; pos: number };

/** Reservas existentes de Martín (coinciden con los anillos de jueves 26 y sábado 28 en Inicio). */
export const INITIAL_BOOKINGS: Record<string, BookingState> = {
  c28: { kind: "booked" }, // jue 26 · 17:15 CrossTraining Halterofilia
  c38: { kind: "booked" }, // sáb 28 · 09:00 CrossTraining HIIT
};

export const CLASS_BY_ID = Object.fromEntries(CLASSES.map((c) => [c.id, c])) as Record<string, ClassItem>;

export type Phase = "past" | "live" | "open";

export function phaseOf(c: ClassItem): Phase {
  if (c.day < NOW.day) return "past";
  if (c.day > NOW.day) return "open";
  if (c.start + c.dur <= NOW.min) return "past";
  if (c.start <= NOW.min) return "live";
  return "open";
}

/** "en 1 h 08 min" respecto del ahora de la demo (solo clases de hoy). */
export function startsIn(c: ClassItem) {
  const m = c.start - NOW.min;
  const h = Math.floor(m / 60);
  return h ? `en ${h} h ${String(m % 60).padStart(2, "0")} min` : `en ${m} min`;
}
