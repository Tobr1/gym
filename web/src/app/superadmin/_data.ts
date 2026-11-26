/* Datos de demostración del Super Admin (cuentas / tenants y facturación SaaS). Reemplazar por la capa de datos real.
 * Coherentes con el Centro de control: 326 gimnasios activos · 512 sedes · 148.920 socios · MRR $ 25.640.000.
 * Precio por sede y mes, igual que la landing: Starter $ 39.900 · Pro $ 79.900 · Cadena a medida.
 * "Ahora" es miércoles 25/11/2026, 08:52. */
import type { Tone } from "@/components/ui/primitives";

export type TenantPlan = "Starter" | "Pro" | "Cadena";
export type TenantStatus = "Al día" | "Onboarding" | "Pago vencido" | "Upgrade pendiente" | "En prueba" | "Suspendido";
export type Country = "AR" | "UY" | "CL" | "PY";

export type Tenant = {
  /** ID visible, con numeral (#T-0184). La URL usa el slug sin numeral: ver tenantSlug. */
  id: string;
  name: string;
  plan: TenantPlan;
  sedes: number;
  socios: number;
  /** Abono mensual en ARS (0 = en prueba o suspendido). */
  mrr: number;
  status: TenantStatus;
  tone: Tone;
};

export type TenantRow = Tenant & {
  country: Country;
  city: string;
  owner: string;
  ownerFace: number;
  /** Índice de salud 0–100. */
  health: number;
  /** Minutos desde la última actividad del staff en el panel. */
  lastSeen: number;
  since: string;
  /** % de socios con la app del socio activa. */
  app: number;
  /** Fin de la prueba gratuita (solo cuentas en prueba). */
  trialEnds?: string;
};

export const PLAN_PRICE: Record<Exclude<TenantPlan, "Cadena">, number> = { Starter: 39_900, Pro: 79_900 };

export const STATUS_TONE: Record<TenantStatus, Tone> = {
  "Al día": "lime",
  Onboarding: "violet",
  "Pago vencido": "rose",
  "Upgrade pendiente": "cyan",
  "En prueba": "amber",
  Suspendido: "neutral",
};

/** Las 8 cuentas del ranking del Centro de control (mismos valores). */
export const TENANTS: TenantRow[] = [
  { id: "#T-0184", name: "Iron Factory", plan: "Pro", sedes: 3, socios: 1482, mrr: 239_700, status: "Al día", tone: "lime", country: "AR", city: "Buenos Aires", owner: "Martín Echeverría", ownerFace: 6, health: 92, lastSeen: 2, since: "mar 2023", app: 74 },
  { id: "#T-0211", name: "Box 54 CrossTraining", plan: "Pro", sedes: 1, socios: 386, mrr: 79_900, status: "Al día", tone: "lime", country: "AR", city: "Rosario", owner: "Florencia Baigorria", ownerFace: 2, health: 81, lastSeen: 14, since: "ago 2024", app: 68 },
  { id: "#T-0097", name: "Atlas Club", plan: "Cadena", sedes: 9, socios: 6210, mrr: 1_180_000, status: "Onboarding", tone: "violet", country: "UY", city: "Montevideo", owner: "Federico Lanza", ownerFace: 3, health: 74, lastSeen: 4, since: "oct 2026", app: 41 },
  { id: "#T-0305", name: "Move Studio", plan: "Starter", sedes: 1, socios: 142, mrr: 39_900, status: "Pago vencido", tone: "rose", country: "AR", city: "La Plata", owner: "Agustina Ferrari", ownerFace: 4, health: 41, lastSeen: 6 * 1440, since: "jun 2025", app: 22 },
  { id: "#T-0262", name: "Núcleo Funcional", plan: "Pro", sedes: 2, socios: 744, mrr: 159_800, status: "Al día", tone: "lime", country: "AR", city: "Córdoba", owner: "Diego Quiroga", ownerFace: 0, health: 86, lastSeen: 38, since: "feb 2025", app: 71 },
  { id: "#T-0142", name: "Kinetic Club", plan: "Cadena", sedes: 5, socios: 3120, mrr: 640_000, status: "Al día", tone: "lime", country: "CL", city: "Santiago", owner: "Ignacio Valdés", ownerFace: 13, health: 88, lastSeen: 9, since: "nov 2023", app: 79 },
  { id: "#T-0290", name: "Origen Cross", plan: "Pro", sedes: 1, socios: 412, mrr: 79_900, status: "Upgrade pendiente", tone: "cyan", country: "AR", city: "Mendoza", owner: "Lucía Benítez", ownerFace: 9, health: 79, lastSeen: 64, since: "abr 2025", app: 63 },
  { id: "#T-0318", name: "Fuerza Libre", plan: "Starter", sedes: 1, socios: 98, mrr: 0, status: "En prueba", tone: "amber", country: "AR", city: "Tucumán", owner: "Ramiro Ibáñez", ownerFace: 8, health: 63, lastSeen: 3 * 60, since: "nov 2026", app: 35, trialEnds: "vie 27 nov" },
];

const row = (r: Omit<TenantRow, "tone">): TenantRow => ({ ...r, tone: STATUS_TONE[r.status] });

/** Directorio: las 8 de arriba + el resto de la primera página. */
export const DIRECTORY: TenantRow[] = [
  ...TENANTS,
  row({ id: "#T-0156", name: "Bloque Training", plan: "Pro", sedes: 2, socios: 688, mrr: 159_800, status: "Al día", country: "UY", city: "Montevideo", owner: "Sebastián Olivera", ownerFace: 11, health: 84, lastSeen: 22, since: "jul 2024", app: 66 }),
  row({ id: "#T-0118", name: "Sur Performance", plan: "Cadena", sedes: 4, socios: 2240, mrr: 420_000, status: "Al día", country: "CL", city: "Concepción", owner: "Camila Rojas", ownerFace: 5, health: 82, lastSeen: 47, since: "may 2023", app: 72 }),
  row({ id: "#T-0199", name: "Hábito Gym", plan: "Pro", sedes: 2, socios: 903, mrr: 159_800, status: "Al día", country: "AR", city: "Córdoba", owner: "Gonzalo Ríos", ownerFace: 10, health: 90, lastSeen: 11, since: "dic 2023", app: 81 }),
  row({ id: "#T-0175", name: "Campus Athletic", plan: "Cadena", sedes: 3, socios: 1610, mrr: 310_000, status: "Al día", country: "CL", city: "Santiago", owner: "Andrés Muñoz", ownerFace: 13, health: 87, lastSeen: 31, since: "sep 2023", app: 76 }),
  row({ id: "#T-0271", name: "Titan Gym", plan: "Pro", sedes: 1, socios: 521, mrr: 79_900, status: "Al día", country: "AR", city: "Buenos Aires", owner: "Pablo Medina", ownerFace: 0, health: 47, lastSeen: 12 * 1440, since: "mar 2025", app: 18 }),
  row({ id: "#T-0247", name: "Ola CrossBox", plan: "Pro", sedes: 1, socios: 298, mrr: 79_900, status: "Pago vencido", country: "UY", city: "Punta del Este", owner: "Martina Pérez", ownerFace: 14, health: 52, lastSeen: 2 * 1440, since: "ene 2025", app: 44 }),
  row({ id: "#T-0233", name: "Studio Raíz Pilates", plan: "Starter", sedes: 1, socios: 176, mrr: 39_900, status: "Al día", country: "AR", city: "Buenos Aires", owner: "Paula Sardi", ownerFace: 12, health: 77, lastSeen: 2 * 60, since: "oct 2024", app: 69 }),
  row({ id: "#T-0326", name: "Fénix Training", plan: "Pro", sedes: 1, socios: 208, mrr: 79_900, status: "Onboarding", country: "AR", city: "Salta", owner: "Nahuel Cardozo", ownerFace: 3, health: 68, lastSeen: 26, since: "nov 2026", app: 12 }),
  row({ id: "#T-0284", name: "Distrito Fit", plan: "Pro", sedes: 1, socios: 455, mrr: 79_900, status: "Al día", country: "AR", city: "Rosario", owner: "Hernán Gallo", ownerFace: 6, health: 54, lastSeen: 4 * 1440, since: "ago 2025", app: 29 }),
  row({ id: "#T-0203", name: "Equilibrio Yoga", plan: "Starter", sedes: 1, socios: 154, mrr: 39_900, status: "Al día", country: "UY", city: "Montevideo", owner: "Valeria Castro", ownerFace: 1, health: 83, lastSeen: 95, since: "abr 2024", app: 74 }),
  row({ id: "#T-0166", name: "Forja Gym", plan: "Pro", sedes: 1, socios: 367, mrr: 79_900, status: "Pago vencido", country: "AR", city: "Mar del Plata", owner: "Leandro Paz", ownerFace: 8, health: 45, lastSeen: 3 * 1440, since: "nov 2024", app: 31 }),
  row({ id: "#T-0312", name: "Andes Climb & Fit", plan: "Starter", sedes: 1, socios: 121, mrr: 39_900, status: "Al día", country: "AR", city: "Bariloche", owner: "Julieta Moreno", ownerFace: 9, health: 70, lastSeen: 5 * 60, since: "jul 2026", app: 52 }),
  row({ id: "#T-0322", name: "Cumbre Funcional", plan: "Starter", sedes: 1, socios: 87, mrr: 0, status: "En prueba", country: "CL", city: "Valparaíso", owner: "Tomás Fuentes", ownerFace: 11, health: 71, lastSeen: 41, since: "nov 2026", app: 47, trialEnds: "dom 29 nov" }),
  row({ id: "#T-0301", name: "Ritmo Spinning", plan: "Starter", sedes: 1, socios: 133, mrr: 39_900, status: "Al día", country: "PY", city: "Asunción", owner: "Rocío Giménez", ownerFace: 7, health: 66, lastSeen: 7 * 60, since: "feb 2026", app: 38 }),
  row({ id: "#T-0329", name: "Vértice Fitness", plan: "Starter", sedes: 1, socios: 64, mrr: 0, status: "En prueba", country: "PY", city: "Asunción", owner: "Mauricio Aquino", ownerFace: 10, health: 58, lastSeen: 19 * 60, since: "nov 2026", app: 20, trialEnds: "mar 1 dic" }),
  row({ id: "#T-0257", name: "Motor Box", plan: "Starter", sedes: 1, socios: 112, mrr: 0, status: "Suspendido", country: "AR", city: "Neuquén", owner: "Bruno Castillo", ownerFace: 0, health: 22, lastSeen: 21 * 1440, since: "may 2025", app: 9 }),
];

/** Totales de la plataforma (coinciden con los KPIs del Centro de control). */
export const PLATFORM = {
  mrr: 25_640_000,
  mrrPrev: 24_489_000, // 31/10 → +4,7%
  active: 326,
  trials: 18,
  trialsThisWeek: 5,
  atRisk: 23,
  delinquent: 7,
  sedes: 512,
  socios: 148_920,
  total: 326 + 18 + 4, // activos + en prueba + suspendidos
};

/* ── Cobranza SaaS: cola de reintentos (los 7 morosos) ───────── */

export type Dunning = {
  tenant: string; // slug
  amount: number;
  attempt: 1 | 2 | 3 | 4;
  reason: string;
  method: string;
  failedAt: string;
  nextRetry: string;
};

export const DUNNING: Dunning[] = [
  { tenant: "T-0305", amount: 39_900, attempt: 2, reason: "Fondos insuficientes", method: "Visa ·· 4417", failedAt: "hoy 06:00", nextRetry: "vie 27 nov · 06:00" },
  { tenant: "T-0166", amount: 79_900, attempt: 3, reason: "Tarjeta vencida", method: "Mastercard ·· 0912", failedAt: "lun 23 nov", nextRetry: "Requiere nueva tarjeta" },
  { tenant: "T-0247", amount: 79_900, attempt: 1, reason: "Rechazo del banco emisor", method: "Débito automático · BROU", failedAt: "hoy 06:00", nextRetry: "jue 26 nov · 06:00" },
  { tenant: "T-0193", amount: 159_800, attempt: 2, reason: "Límite excedido", method: "Amex ·· 3008", failedAt: "mar 24 nov", nextRetry: "jue 26 nov · 06:00" },
  { tenant: "T-0228", amount: 39_900, attempt: 4, reason: "Cuenta cerrada", method: "Débito CBU ·· 7730", failedAt: "jue 19 nov", nextRetry: "Suspensión el lun 30 nov" },
  { tenant: "T-0265", amount: 79_900, attempt: 1, reason: "Fondos insuficientes", method: "Mercado Pago", failedAt: "hoy 06:00", nextRetry: "jue 26 nov · 06:00" },
  { tenant: "T-0241", amount: 39_900, attempt: 3, reason: "Sin respuesta del emisor", method: "Visa ·· 2281", failedAt: "dom 22 nov", nextRetry: "sáb 28 nov · 06:00" },
];
/** Nombres de las cuentas morosas que no están en la primera página del directorio. */
export const DUNNING_NAMES: Record<string, { name: string; plan: TenantPlan }> = {
  "T-0193": { name: "Gravity Club", plan: "Pro" },
  "T-0228": { name: "Pulmón Verde Fit", plan: "Starter" },
  "T-0265": { name: "Arena Funcional", plan: "Pro" },
  "T-0241": { name: "Cuerpo & Mente", plan: "Starter" },
};
export const DUNNING_TOTAL = DUNNING.reduce((a, d) => a + d.amount, 0); // 519.200

/* ── Helpers ─────────────────────────────────────────────────── */

export const tenantSlug = (t: Pick<Tenant, "id">) => t.id.replace("#", "");
export const tenantBySlug = (slug: string) => DIRECTORY.find((t) => tenantSlug(t) === slug);
export const initials = (name: string) =>
  name
    .replace(/[^\p{L}\d ]/gu, "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const COUNTRY_NAME: Record<Country, string> = { AR: "Argentina", UY: "Uruguay", CL: "Chile", PY: "Paraguay" };

export type HealthBand = "ok" | "watch" | "risk";
export const healthBand = (h: number): HealthBand => (h >= 75 ? "ok" : h >= 55 ? "watch" : "risk");
export const HEALTH_META: Record<HealthBand, { label: string; color: string; tone: Tone }> = {
  ok: { label: "Saludable", color: "var(--color-lime)", tone: "lime" },
  watch: { label: "Atención", color: "var(--color-amber)", tone: "amber" },
  risk: { label: "En riesgo", color: "var(--color-rose)", tone: "rose" },
};

export function lastSeenLabel(min: number) {
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  if (min < 1440) return `hace ${Math.round(min / 60)} h`;
  const d = Math.round(min / 1440);
  return d === 1 ? "ayer" : `hace ${d} d`;
}
