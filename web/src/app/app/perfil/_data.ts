/* Perfil del socio de la demo. Coincide con Inicio: Martín Ibáñez, Pase Libre, 17 días, débito 12 dic. */
import { Award, CalendarCheck2, Dumbbell, Flame, Medal, Moon, Sunrise, Users, Zap, type LucideIcon } from "lucide-react";

export const ME = {
  name: "Martín Ibáñez",
  first: "Martín",
  id: "1060",
  face: 0,
  since: "mar 2024",
  branch: "Sede Centro",
  gym: "Iron Factory",
};

export const MEMBERSHIP = {
  plan: "Pase Libre",
  detail: "Todas las clases · 3 sedes",
  daysLeft: 17,
  periodDays: 30,
  until: "12 dic",
  price: 48900,
};

export const PAY_METHOD = { brand: "Visa", last4: "4821", exp: "08/29" };

export const PAYMENTS = [
  { id: "p11", date: "12 nov", concept: "Cuota noviembre", amount: 48900, method: "Débito automático" },
  { id: "p10", date: "12 oct", concept: "Cuota octubre", amount: 48900, method: "Débito automático" },
  { id: "p9", date: "12 sep", concept: "Cuota septiembre", amount: 45500, method: "Débito automático" },
  { id: "p8", date: "14 ago", concept: "Cuota agosto", amount: 45500, method: "Mercado Pago" },
];

export const STATS = [
  { v: "148", l: "visitas" },
  { v: "12", l: "días de racha" },
  { v: "6/9", l: "logros" },
];

export type Badge = { id: string; icon: LucideIcon; name: string; hint: string; tone: "lime" | "amber" | "violet" | "cyan"; progress?: number };

export const BADGES: Badge[] = [
  { id: "racha", icon: Flame, name: "Racha 10", hint: "10 días seguidos", tone: "lime" },
  { id: "cien", icon: CalendarCheck2, name: "Centenario", hint: "100 visitas", tone: "lime" },
  { id: "madrugador", icon: Sunrise, name: "Madrugador", hint: "20 ingresos antes de las 8", tone: "amber" },
  { id: "banca", icon: Medal, name: "Banca 80", hint: "Récord personal", tone: "amber" },
  { id: "cross", icon: Zap, name: "Cross x25", hint: "25 clases de Cross", tone: "violet" },
  { id: "social", icon: Users, name: "Referido", hint: "Trajiste a un amigo", tone: "cyan" },
  { id: "tonelada", icon: Dumbbell, name: "Tonelada", hint: "10 t en una semana", tone: "lime", progress: 72 },
  { id: "noct", icon: Moon, name: "Nocturno", hint: "15 clases después de las 20", tone: "violet", progress: 40 },
  { id: "anio", icon: Award, name: "Un año", hint: "12 meses sin cortar", tone: "amber", progress: 67 },
];

export const TONE_CLS: Record<Badge["tone"], string> = {
  lime: "bg-lime/12 text-lime ring-lime/30",
  amber: "bg-amber/12 text-amber ring-amber/30",
  violet: "bg-violet/12 text-violet ring-violet/30",
  cyan: "bg-cyan/12 text-cyan ring-cyan/30",
};
