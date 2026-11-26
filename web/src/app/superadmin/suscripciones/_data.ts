/* Facturación SaaS del Super Admin (datos de demostración).
 * Coherente con el Centro de control y el directorio: MRR $ 25.640.000 (+4,7% vs. octubre), $ 1,9 M de MRR nuevo,
 * 38 upgrades, churn mensual 1,3%, 18 cuentas en prueba (5 terminan esta semana) y 7 morosas por $ 519.200.
 * Precios por sede y mes, iguales a la landing. "Ahora" es miércoles 25/11/2026, 08:52. */
import { DUNNING, DUNNING_NAMES, DUNNING_TOTAL, PLATFORM, tenantBySlug, type TenantPlan } from "../_data";

/* ── Catálogo de planes ───────────────────────────────────────── */

export type PlanCard = {
  name: TenantPlan;
  price: number | null;
  desc: string;
  feats: string[];
  accounts: number;
  /** Altas netas del mes. */
  net: number;
  mrr: number;
  trials: number;
};

export const PLANS: PlanCard[] = [
  {
    name: "Starter",
    price: 39_900,
    desc: "Estudios y boxes que arrancan",
    feats: ["Hasta 200 socios", "Acceso QR", "Clases y reservas", "App del socio"],
    accounts: 168,
    net: -4,
    mrr: 7_381_500,
    trials: 12,
  },
  {
    name: "Pro",
    price: 79_900,
    desc: "Gimnasios en crecimiento",
    feats: ["Socios ilimitados", "Cobranzas automáticas", "Rutinas", "CRM", "Reportes"],
    accounts: 134,
    net: 13,
    mrr: 12_784_000,
    trials: 6,
  },
  {
    name: "Cadena",
    price: null,
    desc: "Redes con varias sedes",
    feats: ["Multisede consolidado", "Roles avanzados", "API", "Gerente de cuenta"],
    accounts: 24,
    net: 2,
    mrr: 5_474_500,
    trials: 0,
  },
];
// 168 + 134 + 24 = 326 cuentas activas · 7.381.500 + 12.784.000 + 5.474.500 = 25.640.000

/* ── Movimiento de MRR de noviembre (cascada) ─────────────────── */

export type MrrStep = { key: string; label: string; short: string; value: number; kind: "total" | "up" | "down"; detail: string };

export const MRR_MOVEMENT: MrrStep[] = [
  { key: "start", label: "Inicio", short: "Inicio", value: PLATFORM.mrrPrev, kind: "total", detail: "31 de octubre" },
  { key: "new", label: "Nuevo", short: "Nuevo", value: 1_900_000, kind: "up", detail: "15 altas" },
  { key: "exp", label: "Expansión", short: "Exp.", value: 1_586_200, kind: "up", detail: "38 upgrades" },
  { key: "con", label: "Contracción", short: "Contr.", value: -935_600, kind: "down", detail: "14 downgrades" },
  { key: "churn", label: "Churn", short: "Churn", value: -1_399_600, kind: "down", detail: "4 bajas" },
  { key: "end", label: "Cierre", short: "Cierre", value: PLATFORM.mrr, kind: "total", detail: "al 30 de nov." },
];
// 24.489.000 + 1.900.000 + 1.586.200 − 935.600 − 1.399.600 = 25.640.000

export const CHURNED = [
  { name: "Red Pampa Fitness", plan: "Cadena" as TenantPlan, mrr: 1_120_000, reason: "Migró a un sistema propio" },
  { name: "Gravedad Cero", plan: "Pro" as TenantPlan, mrr: 159_800, reason: "Cierre de una sede" },
  { name: "Zona Funcional", plan: "Pro" as TenantPlan, mrr: 79_900, reason: "Precio" },
  { name: "Kairós Pilates", plan: "Starter" as TenantPlan, mrr: 39_900, reason: "Cerró el estudio" },
];

/* ── Cobranza del mes ─────────────────────────────────────────── */

export const COLLECTION = {
  billed: PLATFORM.mrr,
  pending: DUNNING_TOTAL,
  collected: PLATFORM.mrr - DUNNING_TOTAL,
  /** Recuperado por reintentos automáticos en noviembre. */
  recovered: 1_284_600,
  recoveryRate: 71,
  /** % cobrado acumulado por día (1 → 25 nov): débito del día 1, reintentos y pagos manuales. */
  curve: [0, 71, 84, 89.5, 92, 93.4, 94.1, 94.6, 95.2, 95.5, 95.9, 96.2, 96.4, 96.7, 96.9, 97.1, 97.3, 97.4, 97.5, 97.6, 97.7, 97.8, 97.9, 97.9, 98],
  methods: [
    { label: "Débito automático", pct: 71, color: "var(--color-lime)" },
    { label: "Tarjeta de crédito", pct: 22, color: "var(--color-violet)" },
    { label: "Transferencia", pct: 7, color: "var(--color-cyan)" },
  ],
};

/* ── Cola de cobranza (dunning) ───────────────────────────────── */

export type DunningRow = (typeof DUNNING)[number] & { name: string; plan: TenantPlan; inDirectory: boolean };

export const DUNNING_ROWS: DunningRow[] = DUNNING.map((d) => {
  const t = tenantBySlug(d.tenant);
  const extra = DUNNING_NAMES[d.tenant];
  return { ...d, name: t?.name ?? extra.name, plan: t?.plan ?? extra.plan, inDirectory: !!t };
}).sort((a, b) => b.attempt - a.attempt || b.amount - a.amount);

/* ── Pruebas que terminan pronto (las 5 de esta semana) ───────── */

export type TrialRow = {
  slug?: string;
  name: string;
  city: string;
  ends: string;
  daysLeft: number;
  /** Pasos del onboarding completados (de 6). */
  steps: number;
  socios: number;
  plan: TenantPlan;
  fit: "Alta" | "Media" | "Baja";
};

const trial = (slug: string) => tenantBySlug(slug)!;

export const TRIALS: TrialRow[] = [
  { name: "Kraken Box", city: "Córdoba, AR", ends: "jue 26 nov", daysLeft: 1, steps: 6, socios: 214, plan: "Pro", fit: "Alta" },
  { slug: "T-0318", name: trial("T-0318").name, city: "Tucumán, AR", ends: trial("T-0318").trialEnds!, daysLeft: 2, steps: 4, socios: trial("T-0318").socios, plan: "Starter", fit: "Media" },
  { name: "La Fábrica Funcional", city: "Rosario, AR", ends: "sáb 28 nov", daysLeft: 3, steps: 5, socios: 167, plan: "Pro", fit: "Alta" },
  { slug: "T-0322", name: trial("T-0322").name, city: "Valparaíso, CL", ends: trial("T-0322").trialEnds!, daysLeft: 4, steps: 4, socios: trial("T-0322").socios, plan: "Starter", fit: "Media" },
  { slug: "T-0329", name: trial("T-0329").name, city: "Asunción, PY", ends: trial("T-0329").trialEnds!, daysLeft: 6, steps: 2, socios: trial("T-0329").socios, plan: "Starter", fit: "Baja" },
];

/* ── Próximas renovaciones de contratos anuales ───────────────── */

export type Renewal = {
  slug?: string;
  name: string;
  plan: TenantPlan;
  day: string;
  dow: string;
  month: string;
  mrr: number;
  change?: string;
  status: "Firmada" | "Confirmada" | "Propuesta enviada" | "En negociación";
  owner: string;
};

export const RENEWALS: Renewal[] = [
  { slug: "T-0142", name: "Kinetic Club", plan: "Cadena", day: "30", dow: "lun", month: "nov", mrr: 640_000, change: "+8% · 6.ª sede", status: "Firmada", owner: "Valentina Sosa" },
  { slug: "T-0199", name: "Hábito Gym", plan: "Pro", day: "1", dow: "mar", month: "dic", mrr: 159_800, status: "Confirmada", owner: "Ana Bustos" },
  { name: "Pampa Box", plan: "Pro", day: "7", dow: "lun", month: "dic", mrr: 159_800, change: "Pasa a Cadena", status: "Propuesta enviada", owner: "Valentina Sosa" },
  { name: "Delta Fitness Club", plan: "Cadena", day: "9", dow: "mié", month: "dic", mrr: 480_000, change: "Pide −10%", status: "En negociación", owner: "Valentina Sosa" },
  { name: "Núcleo Sur", plan: "Pro", day: "14", dow: "lun", month: "dic", mrr: 79_900, status: "Confirmada", owner: "Ana Bustos" },
];

/** Corrida mensual de débitos del mar 1 dic (todas las cuentas activas al día). */
export const MONTHLY_RUN = { date: "mar 1 dic · 06:00", accounts: 319, amount: 25_120_800 };
