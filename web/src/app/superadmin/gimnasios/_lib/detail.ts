/* Ficha de una cuenta (tenant) para el Super Admin. Datos derivados y deterministas a partir del directorio.
 * Iron Factory (#T-0184) usa los mismos números que el panel del gimnasio (sedes, socios, accesos de hoy).
 * "Ahora" es miércoles 25/11/2026, 08:52. */
import { BRANCHES, CHECKINS_WEEK } from "@/lib/mock";
import { DIRECTORY, DUNNING, PLAN_PRICE, tenantSlug, type TenantRow } from "../../_data";

export type Factor = { key: string; label: string; value: number; weight: number; hint: string };
export type InvoiceStatus = "Pagada" | "Vencida" | "Reintentando" | "Próxima";
export type Invoice = { number: string; period: string; issued: string; amount: number; status: InvoiceStatus; method: string };
export type Branch = { name: string; city: string; socios: number; today: number; readers: number; online: boolean; manager: string; managerFace: number };
export type Flag = { key: string; label: string; hint: string; on: boolean; stage?: "Beta" | "Alpha"; locked?: string };
export type LogKind = "billing" | "config" | "access" | "support" | "security";
export type LogItem = { who: string; role: string; action: string; time: string; kind: LogKind };
export type Ticket = {
  id: string;
  subject: string;
  priority: "Alta" | "Media" | "Baja";
  status: "Abierto" | "En curso" | "Esperando cliente" | "Resuelto";
  age: string;
  agent: string;
};

export type TenantDetail = {
  t: TenantRow;
  factors: Factor[];
  /** Promedio de accesos por día (últimos 7 días cerrados). */
  checkinsDay: number;
  /** Accesos por día, últimos 14 días (termina hoy mié 25, parcial a las 08:52). */
  checkins14: { d: string; v: number; today?: boolean }[];
  /** Socios activos, últimos 12 meses (Dic → Nov). */
  sociosTrend: number[];
  /** % de socios con la app activa, últimos 12 meses. */
  appTrend: number[];
  mrrHistory: { m: string; v: number; note?: string }[];
  invoices: Invoice[];
  branches: Branch[];
  flags: Flag[];
  log: LogItem[];
  tickets: Ticket[];
  staff: number;
  csm: string;
  method: string;
};

/** Pseudoaleatorio determinista a partir del número de cuenta. */
function rng(seed: number) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
}

const MONTHS = ["Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov"];
const MONTH_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DAYS14 = ["Jue", "Vie", "Sáb", "Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom", "Lun", "Mar", "Mié"];
const SEDE_NAMES = ["Sede Centro", "Sede Norte", "Sede Parque", "Sede Sur", "Sede Puerto", "Sede Oeste", "Sede Nordelta", "Sede Pocitos", "Sede Carrasco"];
const MANAGERS = ["Carolina Vidal", "Germán Ortiz", "Natalia Funes", "Esteban Gil", "Micaela Ponce", "Ariel Sáenz", "Jimena Rey", "Lautaro Peña", "Celeste Aráoz"];
/** Caras asociadas a cada gerente (índices de face()). */
const MANAGER_FACE = [1, 3, 12, 10, 14, 6, 9, 11, 4];
/** Lista de precios anterior al ajuste de marzo 2026. */
const OLD_PRICE_RATIO = 69_900 / 79_900;

/** Posición del mes de alta dentro de la ventana Dic 2025 → Nov 2026 (0 si es anterior). */
function sinceIndex(since: string) {
  const [mon, year] = since.split(" ");
  const abs = Number(year) * 12 + MONTH_ES.indexOf(mon);
  const first = 2025 * 12 + 11; // dic 2025
  return Math.max(0, Math.min(11, abs - first));
}

function factorsFor(t: TenantRow, r: () => number): Factor[] {
  const base = [
    { key: "uso", label: "Uso del panel", weight: 25, hint: "staff activo por día" },
    { key: "app", label: "Adopción de la app", weight: 20, hint: `${t.app}% de los socios` },
    { key: "acc", label: "Accesos y asistencia", weight: 20, hint: "tendencia 30 días" },
    {
      key: "pag",
      label: "Pagos a Pulso",
      weight: 25,
      hint:
        t.status === "Pago vencido"
          ? "factura de noviembre impaga"
          : t.status === "En prueba"
            ? "sin método de pago"
            : t.status === "Suspendido"
              ? "cuenta suspendida"
              : "al día · débito automático",
    },
    { key: "sop", label: "Soporte", weight: 10, hint: "tickets y satisfacción" },
  ];
  const raw = base.map((b) => {
    if (b.key === "app") return Math.min(98, t.app + 14);
    if (b.key === "pag") return t.status === "Pago vencido" ? 18 : t.status === "En prueba" ? 55 : t.status === "Suspendido" ? 5 : 96;
    return Math.max(10, Math.min(99, t.health + Math.round((r() - 0.5) * 22)));
  });
  // reparte la diferencia entre "uso" y "accesos" para que el promedio ponderado redondee al índice de la cuenta
  const clamp = (v: number) => Math.max(5, Math.min(99, Math.round(v)));
  const weighted = () => base.reduce((a, b, i) => a + b.weight * raw[i], 0) / 100;
  for (const k of [0, 2, 0, 2]) raw[k] = clamp(raw[k] + ((t.health - weighted()) * 100) / base[k].weight);
  return base.map((b, i) => ({ ...b, value: raw[i] }));
}

function mrrHistoryFor(t: TenantRow): TenantDetail["mrrHistory"] {
  if (tenantSlug(t) === "T-0184") {
    // 2 sedes hasta junio, Sede Parque desde julio; ajuste de lista en marzo
    return MONTHS.map((m, i) => {
      const sedes = i >= 7 ? 3 : 2;
      const price = i >= 3 ? 79_900 : 69_900;
      return { m, v: sedes * price, note: i === 3 ? "Ajuste de lista" : i === 7 ? "+1 sede" : undefined };
    });
  }
  if (t.mrr === 0) return MONTHS.map((m, i) => ({ m, v: 0, note: i === 11 ? (t.status === "En prueba" ? "Prueba gratis" : "Suspendida") : undefined }));
  const startIdx = sinceIndex(t.since);
  return MONTHS.map((m, i) => {
    if (i < startIdx) return { m, v: 0 };
    // las cadenas suman sedes a lo largo del año; el resto paga lo mismo (salvo el ajuste de lista)
    const growth = t.plan === "Cadena" ? 0.62 + (0.38 * (i - startIdx)) / Math.max(1, 11 - startIdx) : 1;
    const price = i >= 3 ? 1 : OLD_PRICE_RATIO;
    return { m, v: Math.round((t.mrr * growth * price) / 100) * 100, note: i === startIdx && startIdx > 0 ? "Alta" : undefined };
  });
}

const DOW = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
/** Fecha/hora absoluta de "hace N minutos" contando desde el mié 25/11/2026 08:52. */
function agoLabel(min: number) {
  const now = 25 * 1440 + 8 * 60 + 52; // minutos desde el 0 de noviembre
  const at = now - min;
  const day = Math.floor(at / 1440);
  const hm = at - day * 1440;
  const hhmm = `${String(Math.floor(hm / 60)).padStart(2, "0")}:${String(hm % 60).padStart(2, "0")}`;
  if (day === 25) return `hoy ${hhmm}`;
  if (day === 24) return `ayer ${hhmm}`;
  return `${DOW[(day - 1) % 7]} ${day} nov`; // el 1/11/2026 fue domingo
}

export function tenantParams() {
  return DIRECTORY.map((t) => ({ id: tenantSlug(t) }));
}

export function getTenantDetail(slug: string): TenantDetail | null {
  const t = DIRECTORY.find((x) => tenantSlug(x) === slug);
  if (!t) return null;
  const num = Number(slug.slice(2));
  const r = rng(num * 7919);
  const iron = slug === "T-0184";
  const suspended = t.status === "Suspendido";

  /* ── Sedes (antes que los accesos: "hoy" es la suma de las sedes) ── */
  const branches: Branch[] = iron
    ? [
        { name: BRANCHES[0], city: "Palermo, CABA", socios: 712, today: 214, readers: 3, online: true, manager: "Carolina Vidal", managerFace: 1 },
        { name: BRANCHES[1], city: "Núñez, CABA", socios: 468, today: 96, readers: 2, online: false, manager: "Germán Ortiz", managerFace: 3 },
        { name: BRANCHES[2], city: "Parque Chacabuco, CABA", socios: 302, today: 61, readers: 2, online: true, manager: "Natalia Funes", managerFace: 12 },
      ]
    : (() => {
        let left = t.socios;
        return Array.from({ length: t.sedes }, (_, i) => {
          const socios = i === t.sedes - 1 ? left : Math.round((t.socios / t.sedes) * (0.8 + r() * 0.4));
          left -= socios;
          const m = (i + num) % MANAGERS.length;
          return {
            name: t.sedes === 1 ? "Sede única" : SEDE_NAMES[i],
            city: t.city,
            socios,
            today: suspended ? 0 : Math.round(socios * (0.035 + r() * 0.03)),
            readers: socios > 500 ? 3 : socios > 200 ? 2 : 1,
            online: !suspended && r() > 0.12,
            manager: MANAGERS[m],
            managerFace: MANAGER_FACE[m],
          };
        });
      })();
  const todaySoFar = branches.reduce((a, b) => a + b.today, 0);

  /* ── Accesos ── */
  const checkinsDay = iron
    ? Math.round(CHECKINS_WEEK.reduce((a, d) => a + d.hoy, 0) / CHECKINS_WEEK.length)
    : suspended
      ? 0
      : Math.round(t.socios * (0.16 + t.health / 900));

  // 14 días con la forma semanal del panel (Jue → Mié); hoy es parcial y coincide con la suma de sedes
  const weekShape = [...CHECKINS_WEEK.slice(3), ...CHECKINS_WEEK.slice(0, 3)].map((d) => d.hoy / 383);
  const checkins14 = DAYS14.map((d, i) => {
    if (i === 13) return { d, v: todaySoFar, today: true };
    const shape = weekShape[i % 7];
    const v = Math.round(checkinsDay * shape * (i < 7 ? 0.94 : 1) * (iron ? 1 : 0.9 + r() * 0.2));
    return { d, v };
  });

  const sociosTrend = Array.from({ length: 12 }, (_, i) => Math.round(t.socios * (0.8 + (0.2 * i) / 11) * (0.98 + r() * 0.04)));
  sociosTrend[11] = t.socios;
  const appTrend = Array.from({ length: 12 }, (_, i) => Math.max(2, Math.round(t.app * (0.45 + (0.55 * i) / 11))));
  appTrend[11] = t.app;

  const mrrHistory = mrrHistoryFor(t);

  /* ── Facturación ── */
  const dunning = DUNNING.find((d) => d.tenant === slug);
  const method = dunning?.method ?? (iron ? "Débito automático · Galicia ·· 2041" : t.mrr ? "Visa ·· " + String(1000 + ((num * 37) % 9000)) : "Sin método de pago");
  const unit = t.plan === "Cadena" ? Math.round(t.mrr / t.sedes) : PLAN_PRICE[t.plan];
  const nro = (base: number) => `FC A 0004-${String(base + num).padStart(8, "0")}`;
  const invoices: Invoice[] =
    t.status === "En prueba"
      ? []
      : (
          [
            { number: nro(51_200), period: "Diciembre 2026", issued: "mar 1 dic", amount: t.mrr || unit * t.sedes, status: "Próxima", method },
            {
              number: nro(48_900),
              period: "Noviembre 2026",
              issued: "dom 1 nov",
              amount: mrrHistory[11].v || unit * t.sedes,
              status: dunning ? "Reintentando" : suspended ? "Vencida" : "Pagada",
              method,
            },
            { number: nro(46_600), period: "Octubre 2026", issued: "jue 1 oct", amount: mrrHistory[10].v, status: suspended ? "Vencida" : "Pagada", method },
            { number: nro(44_300), period: "Septiembre 2026", issued: "mar 1 sep", amount: mrrHistory[9].v, status: "Pagada", method },
            { number: nro(42_000), period: "Agosto 2026", issued: "sáb 1 ago", amount: mrrHistory[8].v, status: "Pagada", method },
          ] satisfies Invoice[]
        ).filter((x) => x.amount > 0);

  /* ── Feature flags ── */
  const pro = t.plan !== "Starter";
  const cadena = t.plan === "Cadena";
  const flags: Flag[] = [
    { key: "app2", label: "App del socio v2", hint: "Nueva home, racha y reservas en 1 toque", on: t.app > 50, stage: "Beta" },
    { key: "mp", label: "Débito automático Mercado Pago", hint: "Cobro recurrente de cuotas", on: pro && t.health > 60, locked: pro ? undefined : "Requiere Pro" },
    { key: "ai", label: "Rutinas con IA", hint: "Sugerencias en el constructor de rutinas", on: iron || (pro && t.health > 85), stage: "Beta", locked: pro ? undefined : "Requiere Pro" },
    { key: "wait", label: "Lista de espera en clases", hint: "Libera cupos y avisa por push", on: true },
    { key: "arca", label: "Factura electrónica ARCA", hint: "Emisión automática de comprobantes", on: t.country === "AR" && pro, locked: t.country === "AR" ? undefined : "Solo Argentina" },
    { key: "face", label: "Acceso con reconocimiento facial", hint: "Lectores con cámara · piloto", on: iron, stage: "Alpha" },
    { key: "multi", label: "Consolidado multisede", hint: "Reportes y caja unificados", on: cadena || t.sedes > 1, locked: t.sedes > 1 || cadena ? undefined : "Requiere 2+ sedes" },
  ];

  /* ── Auditoría ── */
  const ownerFirst = t.owner.split(" ")[0];
  const staffName = MANAGERS[num % MANAGERS.length];
  const log: LogItem[] = iron
    ? [
        { who: "Carolina Vidal", role: "Admin · Sede Centro", action: "registró 12 cobros en caja", time: "hoy 08:49", kind: "billing" },
        { who: "Sistema", role: "Accesos", action: "lector QR de Sede Norte sin conexión", time: "hoy 08:31", kind: "access" },
        { who: "Martín Echeverría", role: "Dueño", action: "publicó la rutina «Hipertrofia · Bloque 3»", time: "hoy 07:58", kind: "config" },
        { who: "Ana Bustos", role: "Soporte Pulso", action: "tomó el ticket #SUP-4821", time: "hoy 07:40", kind: "support" },
        { who: "Martín Echeverría", role: "Dueño", action: "inició sesión desde un dispositivo nuevo", time: "ayer 22:14", kind: "security" },
        { who: "Sistema", role: "Facturación", action: "cobró la factura de noviembre · $ 239.700", time: "dom 1 nov", kind: "billing" },
      ]
    : [
        {
          who: t.owner,
          role: "Dueño",
          action: t.status === "Pago vencido" ? "abrió el aviso de pago vencido" : suspended ? "intentó ingresar al panel suspendido" : "exportó el reporte de socios",
          time: agoLabel(t.lastSeen),
          kind: t.status === "Pago vencido" || suspended ? "billing" : "config",
        },
        {
          who: "Sistema",
          role: "Facturación",
          action: dunning
            ? `intento de cobro n.º ${dunning.attempt} rechazado · ${dunning.reason.toLowerCase()}`
            : t.status === "En prueba"
              ? `aviso de fin de prueba enviado · vence ${t.trialEnds}`
              : suspended
                ? "cuenta suspendida por falta de pago"
                : "cobró la factura de noviembre",
          time: dunning ? dunning.failedAt : t.status === "En prueba" ? "lun 23 nov" : "dom 1 nov",
          kind: "billing",
        },
        { who: staffName, role: "Admin", action: "actualizó los horarios de clases", time: "lun 23 nov", kind: "config" },
        { who: "Ana Bustos", role: "Soporte Pulso", action: `contactó a ${ownerFirst} por seguimiento de cuenta`, time: "vie 20 nov", kind: "support" },
        { who: t.owner, role: "Dueño", action: "activó la verificación en dos pasos", time: "mar 17 nov", kind: "security" },
      ];

  /* ── Soporte ── */
  const tickets: Ticket[] = iron
    ? [
        { id: "#SUP-4821", subject: "Lector QR de Sede Norte no sincroniza", priority: "Alta", status: "En curso", age: "1 h 12 min", agent: "Ana Bustos" },
        { id: "#SUP-4790", subject: "Exportar socios con fecha de alta", priority: "Baja", status: "Esperando cliente", age: "2 d", agent: "Leo Marín" },
        { id: "#SUP-4702", subject: "Factura A a nombre de la sociedad", priority: "Media", status: "Resuelto", age: "6 d", agent: "Ana Bustos" },
      ]
    : [
        ...(t.status === "Pago vencido" || t.health < 55
          ? [
              {
                id: `#SUP-48${(num % 90) + 10}`,
                subject: t.status === "Pago vencido" ? "Cambio de tarjeta para el abono" : "Baja en la asistencia: pedido de capacitación",
                priority: "Alta" as const,
                status: "Abierto" as const,
                age: "5 h",
                agent: "Leo Marín",
              },
            ]
          : []),
        ...(t.status === "Onboarding" || t.status === "En prueba"
          ? [{ id: `#SUP-48${(num % 80) + 12}`, subject: "Importar socios desde planilla", priority: "Media" as const, status: "En curso" as const, age: "1 d", agent: "Ana Bustos" }]
          : []),
        { id: `#SUP-47${(num % 90) + 10}`, subject: "Configurar planes con descuento familiar", priority: "Baja", status: "Resuelto", age: "9 d", agent: "Ana Bustos" },
      ];

  return {
    t,
    factors: factorsFor(t, r),
    checkinsDay,
    checkins14,
    sociosTrend,
    appTrend,
    mrrHistory,
    invoices,
    branches,
    flags,
    log,
    tickets,
    staff: iron ? 7 : Math.max(2, t.sedes * 2),
    csm: t.plan === "Cadena" ? "Valentina Sosa" : "Ana Bustos",
    method,
  };
}
