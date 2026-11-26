/* Datos de demostración. Reemplazar por la capa de datos real. */

export type MemberStatus = "activo" | "por-vencer" | "vencido" | "congelado";

export type Member = {
  id: string;
  name: string;
  face: number;
  plan: string;
  status: MemberStatus;
  since: string;
  lastCheckIn: string;
  due: string;
  amount: number;
  attendance: number; // % del mes
  branch: string;
};

export const BRANCHES = ["Sede Centro", "Sede Norte", "Sede Parque"];

export const MEMBERS: Member[] = [
  { id: "1042", name: "Sofía Martínez", face: 1, plan: "Pase Libre", status: "activo", since: "mar 2023", lastCheckIn: "07:12", due: "12 dic", amount: 48900, attendance: 92, branch: "Sede Centro" },
  { id: "1043", name: "Tomás Herrera", face: 0, plan: "Musculación 3x", status: "activo", since: "ago 2024", lastCheckIn: "07:26", due: "02 dic", amount: 36500, attendance: 78, branch: "Sede Centro" },
  { id: "1044", name: "Valentina Ruiz", face: 4, plan: "Funcional + Pilates", status: "por-vencer", since: "ene 2025", lastCheckIn: "07:41", due: "27 nov", amount: 42000, attendance: 64, branch: "Sede Norte" },
  { id: "1045", name: "Joaquín Sosa", face: 3, plan: "Pase Libre", status: "activo", since: "jun 2022", lastCheckIn: "08:03", due: "15 dic", amount: 48900, attendance: 88, branch: "Sede Centro" },
  { id: "1046", name: "Camila Pereyra", face: 5, plan: "CrossTraining", status: "vencido", since: "oct 2024", lastCheckIn: "hace 9 d", due: "16 nov", amount: 44500, attendance: 31, branch: "Sede Parque" },
  { id: "1047", name: "Mateo Fernández", face: 6, plan: "Musculación 3x", status: "activo", since: "feb 2025", lastCheckIn: "08:15", due: "08 dic", amount: 36500, attendance: 71, branch: "Sede Norte" },
  { id: "1048", name: "Lucía Gómez", face: 7, plan: "Pilates Reformer", status: "congelado", since: "may 2023", lastCheckIn: "hace 21 d", due: "—", amount: 0, attendance: 0, branch: "Sede Centro" },
  { id: "1049", name: "Benjamín Acosta", face: 8, plan: "Pase Libre", status: "activo", since: "sep 2024", lastCheckIn: "08:32", due: "19 dic", amount: 48900, attendance: 95, branch: "Sede Parque" },
  { id: "1050", name: "Martina López", face: 9, plan: "Funcional + Pilates", status: "por-vencer", since: "jul 2025", lastCheckIn: "ayer", due: "28 nov", amount: 42000, attendance: 58, branch: "Sede Centro" },
  { id: "1051", name: "Nicolás Romero", face: 10, plan: "CrossTraining", status: "activo", since: "nov 2023", lastCheckIn: "08:47", due: "04 dic", amount: 44500, attendance: 83, branch: "Sede Norte" },
];

export const STATUS_META: Record<MemberStatus, { label: string; tone: "lime" | "amber" | "rose" | "cyan" }> = {
  activo: { label: "Activo", tone: "lime" },
  "por-vencer": { label: "Por vencer", tone: "amber" },
  vencido: { label: "Vencido", tone: "rose" },
  congelado: { label: "Congelado", tone: "cyan" },
};

export const CHECKINS_WEEK = [
  { day: "Lun", hoy: 412, prev: 365 },
  { day: "Mar", hoy: 468, prev: 402 },
  { day: "Mié", hoy: 391, prev: 418 },
  { day: "Jue", hoy: 506, prev: 431 },
  { day: "Vie", hoy: 448, prev: 455 },
  { day: "Sáb", hoy: 289, prev: 312 },
  { day: "Dom", hoy: 164, prev: 141 },
];

export const REVENUE_MONTHS = [
  { m: "Jun", v: 31.2 },
  { m: "Jul", v: 33.8 },
  { m: "Ago", v: 35.1 },
  { m: "Sep", v: 38.4 },
  { m: "Oct", v: 41.9 },
  { m: "Nov", v: 46.7 },
];

export const HOURLY = [
  6, 18, 42, 64, 51, 33, 22, 19, 25, 31, 28, 36, 58, 82, 96, 74, 41, 15,
]; // 06 a 23 hs

export const PLAN_MIX = [
  { name: "Pase Libre", value: 38, color: "var(--color-lime)" },
  { name: "Musculación", value: 27, color: "var(--color-violet)" },
  { name: "CrossTraining", value: 19, color: "var(--color-cyan)" },
  { name: "Pilates / Funcional", value: 16, color: "var(--color-amber)" },
];
