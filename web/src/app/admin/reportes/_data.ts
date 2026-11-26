/* Datos de demostración de Reportes. Reemplazar por la capa de datos real.
 * Coherentes con el dashboard (ingresos $ 46.712.300 · 1.482 socios · retención 94,1%),
 * Caja (facturación mensual May–Nov, medios de pago, deuda), CRM (embudo del mes) y Clases.
 * "Hoy" es miércoles 25/11/2026, 08:52: noviembre está en curso (cierra el lunes 30). */

import { CHECKINS_WEEK, HOURLY } from "@/lib/mock";
import { METHODS, MONTHLY } from "../caja/_data";
import { FUNNEL } from "../crm/_data";

export { FUNNEL };

export type ReportKey =
  "ingresos" | "retencion" | "asistencia" | "clases" | "ventas" | "sedes";

/* ── Totales del mes (los mismos del dashboard) ───────────────── */
export const REVENUE_NOV = 46_712_300;
export const MEMBERS_ACTIVE = 1_482;
export const RECURRING_NOV = 39_238_300;
/** Octubre del 1 al 25: base del +12,3% del dashboard. */
const REVENUE_OCT_SAME = 41_596_000;
/** Noviembre 2025 del 1 al 25. */
const REVENUE_NOV25_SAME = 27_418_000;
/** Objetivo mensual: el dashboard muestra "objetivo 92%" al día de hoy. */
export const NOV_TARGET = 50_780_000;
export const NOV_FORECAST = 48_640_000;

/* ── Serie de 12 meses (millones) ─────────────────────────────── */
const EARLY = [
  { label: "Dic", year: "2025", value: 27.6 },
  { label: "Ene", year: "2026", value: 26.2 },
  { label: "Feb", year: "2026", value: 27.1 },
  { label: "Mar", year: "2026", value: 28.3 },
  { label: "Abr", year: "2026", value: 28.9 },
];
/** Total facturado vs. ingreso recurrente (cuotas y débitos automáticos). May–Nov sale de Caja. */
export const REVENUE_12M = [
  ...EARLY,
  ...MONTHLY.map((m) => ({ label: m.label, year: "2026", value: m.value })),
].map((m, i) => ({
  ...m,
  // la recurrencia crece de 79% a 84% del ingreso a medida que suben los débitos automáticos
  recurring:
    i === 11 ? 39.2 : Number((m.value * (0.79 + i * 0.0046)).toFixed(1)),
  current: i === 11,
}));

/* ── Períodos y comparación ───────────────────────────────────── */
export type PeriodKey = "mes" | "trimestre" | "anio";
export type CompareKey = "anterior" | "interanual";

export type Period = {
  tab: string;
  label: string;
  /** Archivo exportado: ingresos-<slug>-2026.pdf */
  slug: string;
  /** Meses del gráfico de 12 meses que entran en el período (índices de REVENUE_12M). */
  months: [number, number];
  lead: string;
  tail: string;
  total: number;
  recurring: number;
  ticket: number;
  ticketDelta: number;
  forecast: number;
  target: number;
  cmp: Record<CompareKey, { label: string; value: number; real?: number }>;
};

export const PERIODS: Record<PeriodKey, Period> = {
  mes: {
    tab: "Mes",
    label: "Noviembre 2026",
    slug: "nov",
    months: [11, 11],
    lead: "Noviembre va",
    tail: "a 6 días del cierre",
    total: REVENUE_NOV,
    recurring: RECURRING_NOV,
    ticket: Math.round(REVENUE_NOV / MEMBERS_ACTIVE / 10) * 10, // $ 31.520
    ticketDelta: 7.1,
    forecast: NOV_FORECAST,
    target: NOV_TARGET,
    cmp: {
      anterior: {
        label: "el mismo período de octubre",
        value: REVENUE_OCT_SAME,
      },
      interanual: {
        label: "noviembre 2025",
        value: REVENUE_NOV25_SAME,
        real: 21.8,
      },
    },
  },
  trimestre: {
    tab: "Trimestre",
    label: "Sep – Nov 2026",
    slug: "sep-nov",
    months: [9, 11],
    lead: "El trimestre suma",
    tail: "con noviembre todavía abierto",
    total: 127_012_300,
    recurring: 106_140_000,
    ticket: 30_210,
    ticketDelta: 18.4,
    forecast: 128_940_000,
    target: 131_080_000,
    cmp: {
      anterior: { label: "jun – ago", value: 100_100_000 },
      interanual: { label: "sep – nov 2025", value: 76_900_000, real: 18.1 },
    },
  },
  anio: {
    tab: "Año",
    label: "Ene – Nov 2026",
    slug: "ene-nov",
    months: [1, 11],
    lead: "En el año llevás facturado",
    tail: "en 11 meses",
    total: 367_012_300,
    recurring: 301_600_000,
    ticket: 26_840,
    ticketDelta: 41.2,
    forecast: 368_940_000,
    target: 372_000_000,
    cmp: {
      anterior: { label: "ene – nov 2025", value: 228_600_000, real: 13.1 },
      interanual: { label: "ene – nov 2025", value: 228_600_000, real: 13.1 },
    },
  },
};

/* ── Composición ──────────────────────────────────────────────── */
export const BY_CONCEPT = [
  {
    key: "cuotas",
    label: "Cuotas y membresías",
    amount: RECURRING_NOV,
    color: "#B5F54A",
  },
  {
    key: "pt",
    label: "Personal trainer y clases",
    amount: 2_890_000,
    color: "#9D84FF",
  },
  { key: "tienda", label: "Tienda y bar", amount: 2_400_000, color: "#57D5F2" },
  {
    key: "matriculas",
    label: "Matrículas (112 altas)",
    amount: 2_184_000,
    color: "#FFBE55",
  },
];

/** Socios por plan = composición del dashboard (38 / 27 / 19 / 16%). */
export const BY_PLAN = [
  {
    name: "Pase Libre",
    amount: 16_480_000,
    members: 563,
    delta: 14.1,
    color: "var(--color-lime)",
  },
  {
    name: "Musculación",
    amount: 9_417_200,
    members: 400,
    delta: 9.6,
    color: "var(--color-violet)",
  },
  {
    name: "CrossTraining",
    amount: 7_455_300,
    members: 282,
    delta: 16.8,
    color: "var(--color-cyan)",
  },
  {
    name: "Pilates / Funcional",
    amount: 5_885_800,
    members: 237,
    delta: 6.2,
    color: "var(--color-amber)",
  },
];

/** Medios de pago del mes (mismos colores y nombres que Caja). */
const METHOD_SHARE: Record<string, number> = {
  mp: 31.4,
  debito: 21.8,
  credito: 17.9,
  efectivo: 16.2,
  transferencia: 12.7,
};
const METHOD_DELTA: Record<string, number> = {
  mp: 4.2,
  debito: 2.6,
  credito: -0.8,
  efectivo: -4.1,
  transferencia: -1.9,
};
export const BY_METHOD = (() => {
  const sorted = [...METHODS].sort(
    (a, b) => METHOD_SHARE[b.key] - METHOD_SHARE[a.key],
  );
  let acc = 0;
  return sorted.map((m, i) => {
    const amount =
      i === sorted.length - 1
        ? REVENUE_NOV - acc
        : Math.round((REVENUE_NOV * METHOD_SHARE[m.key]) / 100 / 100) * 100;
    acc += amount;
    return {
      key: m.key,
      name: m.label,
      color: m.color,
      share: METHOD_SHARE[m.key],
      delta: METHOD_DELTA[m.key],
      amount,
    };
  });
})();

/* ── Retención por cohortes ───────────────────────────────────── */
/** % de socios de cada cohorte de alta que siguen activos N meses después (índice 0 = mes de alta). */
export const COHORTS: { label: string; size: number; values: number[] }[] = [
  { label: "Mar", size: 92, values: [100, 90, 84, 80, 77, 75, 73, 72, 71] },
  { label: "Abr", size: 101, values: [100, 91, 85, 81, 78, 76, 74, 73] },
  { label: "May", size: 96, values: [100, 91, 85, 81, 78, 76, 74] },
  { label: "Jun", size: 88, values: [100, 90, 84, 80, 77, 75] },
  { label: "Jul", size: 104, values: [100, 92, 87, 83, 81] },
  { label: "Ago", size: 97, values: [100, 93, 88, 85] },
  { label: "Sep", size: 121, values: [100, 94, 90] },
  { label: "Oct", size: 109, values: [100, 95] },
  { label: "Nov", size: 112, values: [100] },
];

/* ── Bajas ────────────────────────────────────────────────────── */
/** 44 bajas pedidas + 39 que no renovaron = 83 → 5,9% de 1.414 socios al inicio (retención 94,1%). */
export const CHURN = {
  explicit: 44,
  lapsed: 39,
  base: 1414,
  rate: 5.9,
  prevRate: 6.6,
};
export const CHURN_REASONS = [
  {
    label: "Precio / economía",
    value: 13,
    note: "7 de ellos con Pase Libre mensual",
    color: "#FF5F7E",
    avoidable: true,
  },
  {
    label: "Falta de tiempo",
    value: 9,
    note: "Horario laboral, turno mañana",
    color: "#FF8A4C",
    avoidable: true,
  },
  {
    label: "Mudanza",
    value: 8,
    note: "No evitable",
    color: "#7D8A9C",
    avoidable: false,
  },
  {
    label: "Lesión o salud",
    value: 5,
    note: "3 aceptaron congelar",
    color: "#FFBE55",
    avoidable: false,
  },
  {
    label: "Se pasó a otro gym",
    value: 4,
    note: "2 mencionan Box 54",
    color: "#9D84FF",
    avoidable: true,
  },
  {
    label: "Experiencia / atención",
    value: 3,
    note: "Vestuarios Sede Norte",
    color: "#57D5F2",
    avoidable: true,
  },
  { label: "Otros", value: 2, note: "", color: "#4F5C6E", avoidable: false },
];
/** Cuota promedio de quien se da de baja: ingreso recurrente que se pierde por cada baja. */
export const CHURN_TICKET = 31_500;

/* ── Asistencia (día × hora) ──────────────────────────────────── */
export const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const HOURS = HOURLY.map((_, i) => 6 + i); // 06 a 23 h
export const CAPACITY = 140;
/** Promedio de personas en sala por franja: curva horaria × peso del día (del dashboard), con matices de fin de semana. */
export const ATTENDANCE: number[][] = (() => {
  const maxDay = Math.max(...CHECKINS_WEEK.map((d) => d.hoy));
  return CHECKINS_WEEK.map((d, di) => {
    const w = d.hoy / maxDay;
    return HOURLY.map((_, hi) => {
      // media móvil de una hora: el pico cae a las 19 h, como anticipa el dashboard
      const h = (HOURLY[hi] + (HOURLY[hi + 1] ?? HOURLY[hi])) / 2;
      let v = h;
      if (di >= 5) {
        // sábados y domingos: pico de mañana, tarde más tranquila
        v = hi >= 2 && hi <= 6 ? h * 1.9 + 20 : hi >= 12 ? h * 0.35 : h;
      }
      return Math.round(Math.min(136, v * w * 1.44));
    });
  });
})();
/** Visitas semanales por socio (promedio 2,7). */
export const FREQUENCY = [
  { label: "1 vez", share: 14, renew: 81, color: "#4F5C6E" },
  { label: "2 veces", share: 27, renew: 91, color: "#57D5F2" },
  { label: "3 veces", share: 33, renew: 96, color: "#9D84FF" },
  { label: "4 o más", share: 26, renew: 98, color: "#B5F54A" },
];

/* ── Sedes ────────────────────────────────────────────────────── */
/** Suman $ 46.712.300 · 1.482 socios · 112 altas · 44 bajas. Deuda: 164 socios (11,1%), como en Caja. */
export const BRANCH_ROWS = [
  {
    name: "Sede Centro",
    short: "Centro",
    revenue: 22_184_600,
    delta: 10.6,
    members: 702,
    retention: 95.0,
    altas: 49,
    bajas: 19,
    occupancy: 78,
    ticket: 31_600,
    debt: 9.4,
    photo: "barbell" as const,
  },
  {
    name: "Sede Norte",
    short: "Norte",
    revenue: 14_512_900,
    delta: 13.1,
    members: 468,
    retention: 93.6,
    altas: 37,
    bajas: 14,
    occupancy: 71,
    ticket: 31_010,
    debt: 12.2,
    photo: "machine" as const,
  },
  {
    name: "Sede Parque",
    short: "Parque",
    revenue: 10_014_800,
    delta: 14.9,
    members: 312,
    retention: 92.8,
    altas: 26,
    bajas: 11,
    occupancy: 64,
    ticket: 32_100,
    debt: 13.5,
    photo: "classRopes" as const,
  },
];

/* ── Clases (suman 360 clases y 112 en espera; ocupación media 84%) ── */
export const CLASS_STATS = [
  { name: "CrossTraining", occupancy: 91, sessions: 96, waitlist: 38 },
  { name: "Spinning", occupancy: 84, sessions: 72, waitlist: 21 },
  { name: "Funcional", occupancy: 79, sessions: 88, waitlist: 9 },
  { name: "Pilates", occupancy: 96, sessions: 64, waitlist: 44 },
  { name: "Yoga", occupancy: 58, sessions: 40, waitlist: 0 },
] as const;

/* ── Ventas: fuentes de prospectos (suman los 186 nuevos y 47 ganados del embudo) ── */
export const LEAD_SOURCES = [
  { label: "Instagram", value: 74, won: 14 },
  { label: "Referidos", value: 41, won: 18 },
  { label: "Web / Google", value: 38, won: 9 },
  { label: "Mostrador", value: 33, won: 6 },
];

/* ── Envíos programados ───────────────────────────────────────── */
export type Scheduled = {
  name: string;
  when: string;
  next: string;
  format: "PDF" | "Excel";
};
export const SCHEDULED: Scheduled[] = [
  {
    name: "Cierre mensual de ingresos",
    when: "Día 1 · 08:00",
    next: "mar 1/12",
    format: "PDF",
  },
  {
    name: "Asistencia semanal por sede",
    when: "Lunes · 07:30",
    next: "lun 30/11",
    format: "Excel",
  },
];
