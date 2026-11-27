/* Padrón de socios (demo). Parte de MEMBERS + ficha integral (getProfile) y se extiende con
   los deudores de Caja y las altas ganadas en CRM para que nombres y montos coincidan en todo el producto. */
import { BRANCHES, MEMBERS, type MemberStatus } from "@/lib/mock";
import { DEBTORS } from "../../caja/_data";
import { getProfile, NOW_MIN, PLAN_PRICE, TODAY } from "../_lib/profile";

export { PLAN_PRICE };
export const PLANS = Object.keys(PLAN_PRICE);
export const PLAN_COLOR: Record<string, string> = {
  "Pase Libre": "var(--color-lime)",
  "Musculación 3x": "var(--color-violet)",
  CrossTraining: "var(--color-cyan)",
  "Funcional + Pilates": "var(--color-amber)",
  "Pilates Reformer": "var(--color-rose)",
};

export type Row = {
  id: string;
  name: string;
  face: number | null;
  plan: string;
  branch: string;
  status: MemberStatus;
  since: string;
  isNew: boolean;
  due: string; // "12 dic" | "—"
  daysLeft: number | null; // negativo = vencida · null = congelado
  period: number; // duración del período vigente en días
  last: { label: string; daysAgo: number; sort: number };
  attendance: number; // % del mes
  prevAttendance: number; // % de las 4 semanas previas
  weeks: number[]; // visitas por semana · últimas 8
  debt: number;
  amount: number;
  phone: string;
  dni: string;
  auto: boolean;
  hasProfile: boolean;
  note?: string;
};

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const dayMs = 86_400_000;
export const dayLabel = (offset: number) => {
  const d = new Date(TODAY.getTime() + offset * dayMs);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]}`;
};

function lastVisit(raw: string): Row["last"] {
  const hm = raw.match(/^(\d{2}):(\d{2})$/);
  if (hm) {
    const min = Number(hm[1]) * 60 + Number(hm[2]);
    return { label: `Hoy · ${raw}`, daysAgo: 0, sort: -min };
  }
  if (raw === "ayer") return { label: "Ayer", daysAgo: 1, sort: 1440 };
  const d = Number(raw.match(/(\d+)/)?.[1] ?? 99);
  return { label: `Hace ${d} d`, daysAgo: d, sort: d * 1440 };
}

/** Serie semanal determinística: 4 semanas al nivel previo y converge al actual. */
function weeksFor(id: string, prev: number, now: number): number[] {
  let seed = Number(id) * 9301;
  const jitter = () => {
    seed = (seed * 49297 + 233280) % 233280;
    return seed / 233280 - 0.5;
  };
  return Array.from({ length: 8 }, (_, i) => {
    const t = i < 4 ? 0 : (i - 3) / 4;
    const pct = prev + (now - prev) * t;
    return Math.max(0, Math.round((pct / 100) * 5 + jitter() * 1.2));
  });
}

/* ── Socios con ficha integral (1042–1051) ─────────────────── */
const PREV: Record<string, number> = {
  "1042": 90, "1043": 80, "1044": 79, "1045": 85, "1046": 74,
  "1047": 66, "1048": 52, "1049": 93, "1050": 84, "1051": 80,
};

const fromProfiles: Row[] = MEMBERS.map((m) => {
  const p = getProfile(m.id)!;
  const prev = PREV[m.id] ?? m.attendance;
  return {
    id: m.id,
    name: m.name,
    face: m.face,
    plan: m.plan,
    branch: m.branch,
    status: m.status,
    since: m.since,
    isNew: false,
    due: m.due,
    daysLeft: m.status === "congelado" ? null : p.daysLeft,
    period: p.periodDays || 30,
    last: lastVisit(m.lastCheckIn),
    attendance: m.attendance,
    prevAttendance: prev,
    weeks: m.status === "congelado" ? [3, 2, 3, 2, 1, 0, 0, 0] : weeksFor(m.id, prev, m.attendance),
    debt: p.debt,
    amount: m.amount,
    phone: p.phone,
    dni: p.dni,
    auto: p.payMethod.auto,
    hasProfile: true,
    note: m.status === "congelado" ? "Vuelve el 15 dic" : undefined,
  };
});

/* ── Deudores de Caja (mismos montos y días) ──────────────── */
const DEBTOR_EXTRA: Record<string, { branch: string; since: string; last: string; att: number; prev: number; phone: string; dni: string }> = {
  "1101": { branch: "Sede Norte", since: "feb 2024", last: "hace 31 d", att: 0, prev: 46, phone: "+54 9 11 5832-4410", dni: "35.218.904" },
  "1093": { branch: "Sede Centro", since: "jun 2024", last: "hace 5 d", att: 61, prev: 70, phone: "+54 9 11 6120-3381", dni: "38.402.117" },
  "1112": { branch: "Sede Parque", since: "mar 2025", last: "hace 12 d", att: 22, prev: 68, phone: "+54 9 11 4471-9025", dni: "40.119.562" },
  "1087": { branch: "Sede Centro", since: "dic 2023", last: "hace 19 d", att: 9, prev: 57, phone: "+54 9 11 3398-1270", dni: "33.871.640" },
  "1118": { branch: "Sede Norte", since: "ago 2025", last: "hace 3 d", att: 72, prev: 75, phone: "+54 9 11 7712-0846", dni: "42.560.338" },
};

const fromDebtors: Row[] = DEBTORS.filter((d) => DEBTOR_EXTRA[d.id]).map((d) => {
  const x = DEBTOR_EXTRA[d.id];
  return {
    id: d.id,
    name: d.name,
    face: d.face,
    plan: d.plan,
    branch: x.branch,
    status: "vencido" as const,
    since: x.since,
    isNew: false,
    due: dayLabel(-d.days),
    daysLeft: -d.days,
    period: 30,
    last: lastVisit(x.last),
    attendance: x.att,
    prevAttendance: x.prev,
    weeks: weeksFor(d.id, x.prev, x.att),
    debt: d.amount,
    amount: PLAN_PRICE[d.plan] ?? d.amount,
    phone: x.phone,
    dni: x.dni,
    auto: false,
    hasProfile: false,
    note: d.reminded,
  };
});

/* ── Resto del padrón visible ─────────────────────────────── */
type Seed = Omit<Row, "last" | "weeks" | "daysLeft" | "due" | "period" | "debt" | "amount" | "hasProfile"> & {
  lastRaw: string;
  dueIn: number | null;
  period?: number;
  dueLabel?: string;
};
const seeds: Seed[] = [
  { id: "1052", name: "Agustín Navarro", face: null, plan: "Pase Libre", branch: "Sede Norte", status: "activo", since: "abr 2024", isNew: false, dueIn: 15, lastRaw: "08:41", attendance: 76, prevAttendance: 72, phone: "+54 9 11 4820-5513", dni: "36.904.221", auto: true },
  { id: "1053", name: "Florencia Castro", face: null, plan: "Pilates Reformer", branch: "Sede Parque", status: "activo", since: "sep 2023", isNew: false, dueIn: 11, lastRaw: "ayer", attendance: 69, prevAttendance: 66, phone: "+54 9 11 5561-2047", dni: "34.118.790", auto: true },
  { id: "1054", name: "Emilia Torres", face: null, plan: "Funcional + Pilates", branch: "Sede Norte", status: "congelado", since: "ene 2024", isNew: false, dueIn: null, lastRaw: "hace 34 d", attendance: 0, prevAttendance: 0, phone: "+54 9 11 6203-7781", dni: "39.275.006", auto: false, note: "Vuelve el 14 dic" },
  { id: "1055", name: "Facundo Giménez", face: null, plan: "CrossTraining", branch: "Sede Parque", status: "activo", since: "may 2024", isNew: false, dueIn: 6, lastRaw: "hace 6 d", attendance: 41, prevAttendance: 82, phone: "+54 9 11 3945-6620", dni: "37.660.148", auto: true },
  { id: "1056", name: "Milagros Domínguez", face: null, plan: "Musculación 3x", branch: "Sede Centro", status: "por-vencer", since: "oct 2025", isNew: false, dueIn: 1, lastRaw: "ayer", attendance: 62, prevAttendance: 70, phone: "+54 9 11 7034-1189", dni: "43.002.517", auto: false },
  { id: "1057", name: "Bruno Quiroga", face: null, plan: "Pase Libre", branch: "Sede Centro", status: "activo", since: "jul 2021", isNew: false, dueIn: 27, lastRaw: "06:58", attendance: 90, prevAttendance: 88, phone: "+54 9 11 4106-8832", dni: "31.447.093", auto: true },
  { id: "1058", name: "Carla Ledesma", face: null, plan: "CrossTraining", branch: "Sede Norte", status: "activo", since: "nov 2024", isNew: false, dueIn: 18, lastRaw: "hace 5 d", attendance: 46, prevAttendance: 79, phone: "+54 9 11 5290-4475", dni: "40.836.212", auto: true },
  { id: "1059", name: "Gonzalo Aguirre", face: null, plan: "Musculación 3x", branch: "Sede Parque", status: "activo", since: "ago 2025", isNew: false, dueIn: 22, lastRaw: "hace 8 d", attendance: 27, prevAttendance: 72, phone: "+54 9 11 6687-3301", dni: "41.509.884", auto: false },
  // Altas de noviembre (ganadas en CRM)
  { id: "1121", name: "Natalia Bustos", face: null, plan: "Funcional + Pilates", branch: "Sede Centro", status: "activo", since: "21 nov", isNew: true, dueIn: 26, lastRaw: "07:55", attendance: 80, prevAttendance: 80, phone: "+54 9 11 3570-2296", dni: "44.120.385", auto: true },
  { id: "1122", name: "Ezequiel Moreno", face: null, plan: "Musculación 3x", branch: "Sede Norte", status: "activo", since: "23 nov", isNew: true, dueIn: 90, period: 92, lastRaw: "ayer", attendance: 100, prevAttendance: 100, phone: "+54 9 11 4498-6153", dni: "45.031.770", auto: false, note: "Plan trimestral" },
  { id: "1123", name: "Paula Sánchez", face: null, plan: "Pase Libre", branch: "Sede Centro", status: "activo", since: "24 nov", isNew: true, dueIn: 364, period: 365, dueLabel: "24 nov 27", lastRaw: "08:12", attendance: 100, prevAttendance: 100, phone: "+54 9 11 6015-4402", dni: "39.884.613", auto: true, note: "Plan anual" },
];

const fromSeeds: Row[] = seeds.map(({ lastRaw, dueIn, period, dueLabel, ...s }) => ({
  ...s,
  due: dueIn === null ? "—" : (dueLabel ?? dayLabel(dueIn)),
  daysLeft: dueIn,
  period: period ?? 30,
  last: lastVisit(lastRaw),
  weeks: s.isNew ? [0, 0, 0, 0, 0, 0, 2, 3] : s.status === "congelado" ? [3, 3, 2, 0, 0, 0, 0, 0] : weeksFor(s.id, s.prevAttendance, s.attendance),
  debt: 0,
  amount: s.status === "congelado" ? 0 : PLAN_PRICE[s.plan],
  hasProfile: false,
}));

export const ROWS: Row[] = [...fromProfiles, ...fromDebtors, ...fromSeeds];
export { BRANCHES };

/* ── Segmentos (cifras del padrón completo, iguales al Dashboard y a Caja) ── */
export type SegmentKey = "activos" | "por-vencer" | "vencidos" | "congelados" | "nuevos";

/* Padrón = activos + congelados. Por vencer y vencidos son subconjuntos de los activos
   (Caja: 1.318 al día + 164 con deuda = 1.482; Reportes: deuda 164 socios = 11,1%). */
export const ACTIVE_TOTAL = 1_482;
export const FROZEN_TOTAL = 19;
export const PADRON_TOTAL = ACTIVE_TOTAL + FROZEN_TOTAL; // 1.501

export const SEGMENTS: {
  key: SegmentKey;
  label: string;
  count: number;
  hint: string;
  color: string;
  spark: number[];
}[] = [
  { key: "activos", label: "Activos", count: ACTIVE_TOTAL, hint: "+68 netos · retención 94,1%", color: "var(--color-lime)", spark: [1371, 1388, 1402, 1396, 1421, 1414, 1440, 1458, 1482] },
  { key: "por-vencer", label: "Por vencer", count: 12, hint: "Activos · vencen esta semana · $ 518.400", color: "var(--color-amber)", spark: [9, 14, 11, 16, 13, 10, 12] },
  { key: "vencidos", label: "Vencidos", count: 164, hint: "Activos con deuda · $ 7,4 M", color: "var(--color-rose)", spark: [181, 176, 179, 172, 170, 168, 164] },
  { key: "congelados", label: "Congelados", count: FROZEN_TOTAL, hint: "Fuera de activos · 4 vuelven en dic", color: "var(--color-cyan)", spark: [14, 15, 17, 16, 18, 21, 19] },
  { key: "nuevos", label: "Nuevos este mes", count: 112, hint: "Noviembre · 47 desde CRM", color: "var(--color-violet)", spark: [61, 74, 70, 88, 93, 101, 112] },
];

export const inSegment = (r: Row, k: SegmentKey) =>
  k === "activos"
    ? r.status !== "congelado"
    : k === "por-vencer"
      ? r.status === "por-vencer"
      : k === "vencidos"
        ? r.status === "vencido"
        : k === "congelados"
          ? r.status === "congelado"
          : r.isNew;

/* ── Asistencia ───────────────────────────────────────────── */
export type AttKey = "alta" | "media" | "baja";
export const ATT_BUCKETS: { key: AttKey; label: string; hint: string }[] = [
  { key: "alta", label: "Alta", hint: "75% o más del mes" },
  { key: "media", label: "Media", hint: "Entre 40 y 74%" },
  { key: "baja", label: "Baja", hint: "Menos de 40%" },
];
export const attBucket = (a: number): AttKey => (a >= 75 ? "alta" : a >= 40 ? "media" : "baja");

/** Ingresó en los últimos 90 minutos: probablemente sigue en el gym. */
export const inGym = (r: Row) => r.last.daysAgo === 0 && -r.last.sort >= NOW_MIN - 90;

/* ── Riesgo de abandono: caída ≥ 25 pts vs. las 4 semanas previas ── */
export const isRisk = (r: Row) => r.status !== "congelado" && r.prevAttendance - r.attendance >= 25;
export const RISK = ROWS.filter(isRisk).sort((a, b) => b.prevAttendance - b.attendance - (a.prevAttendance - a.attendance));
export const RISK_TOTAL = 27;

export const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
