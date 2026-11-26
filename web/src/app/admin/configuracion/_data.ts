/* Datos de demostración de Configuración. Reemplazar por la capa de datos real.
 * Se importan de los otros módulos para que todo coincida: Reportes (socios por plan y por sede),
 * Caja (precios, medios de pago, recargo 10 %, trimestral −10 %, Factura B PV 0003), Clases
 * (disciplinas y coaches), CRM (vendedores) y Super Admin (Iron Factory · Pro · $ 239.700/mes).
 * "Hoy" es miércoles 25/11/2026, 08:52. */

import { COACHES, DISCIPLINES } from "@/app/admin/clases/_components/data";
import { SELLERS } from "@/app/admin/crm/_data";
import { BRANCH_ROWS, BY_PLAN } from "@/app/admin/reportes/_data";
import { PHOTO } from "@/lib/photos";

/* ── Secciones ─────────────────────────────────────────────── */
export type SectionId =
  | "perfil"
  | "sedes"
  | "planes"
  | "pagos"
  | "usuarios"
  | "acceso"
  | "notificaciones"
  | "marca"
  | "integraciones"
  | "facturacion";

export const DEFAULT_SECTION: SectionId = "planes";

/* ── Disciplinas ───────────────────────────────────────────── */
export type DisciplineKey = "Musculación" | keyof typeof DISCIPLINES;

export const DISCIPLINE_COLOR: Record<DisciplineKey, string> = {
  Musculación: "var(--color-fg-2)",
  CrossTraining: DISCIPLINES.CrossTraining.color,
  Funcional: DISCIPLINES.Funcional.color,
  Pilates: DISCIPLINES.Pilates.color,
  Spinning: DISCIPLINES.Spinning.color,
  Yoga: DISCIPLINES.Yoga.color,
};
export const ALL_DISCIPLINES = Object.keys(DISCIPLINE_COLOR) as DisciplineKey[];

/* ── Planes ────────────────────────────────────────────────── */
export type Billing = "mensual" | "trimestral" | "anual";
export type Plan = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  /** 0 = ilimitado; n = veces por semana */
  perWeek: number;
  disciplines: DisciplineKey[];
  members: number;
  /** facturación mensual atribuida (Reportes) */
  revenue: number;
  delta: number;
  multisede: boolean;
  inApp: boolean;
  billing: Billing[];
  color: string;
  featured?: boolean;
  corporate?: boolean;
  draft?: boolean;
};

const byPlan = Object.fromEntries(BY_PLAN.map((p) => [p.name, p]));
const PL = byPlan["Pase Libre"];
const PF = byPlan["Pilates / Funcional"];

/** Reportes agrupa: Pase Libre 563 = 489 individuales + 74 corporativos; Pilates / Funcional 237 = 151 + 86. */
export const INITIAL_PLANS: Plan[] = [
  {
    id: "pase-libre",
    name: "Pase Libre",
    tagline: "Todo el gimnasio, todas las sedes",
    price: 48_900,
    perWeek: 0,
    disciplines: ["Musculación", "CrossTraining", "Funcional", "Spinning", "Yoga"],
    members: 489,
    revenue: Math.round((PL.amount * 489) / PL.members),
    delta: PL.delta,
    multisede: true,
    inApp: true,
    billing: ["mensual", "trimestral", "anual"],
    color: "var(--color-lime)",
    featured: true,
  },
  {
    id: "musculacion-3x",
    name: "Musculación 3x",
    tagline: "Sala de musculación con rutina guiada",
    price: 36_500,
    perWeek: 3,
    disciplines: ["Musculación"],
    members: byPlan["Musculación"].members,
    revenue: byPlan["Musculación"].amount,
    delta: byPlan["Musculación"].delta,
    multisede: false,
    inApp: true,
    billing: ["mensual", "trimestral"],
    color: "var(--color-violet)",
  },
  {
    id: "crosstraining",
    name: "CrossTraining",
    tagline: "Box ilimitado + sala de musculación",
    price: 44_500,
    perWeek: 0,
    disciplines: ["CrossTraining", "Musculación"],
    members: byPlan["CrossTraining"].members,
    revenue: byPlan["CrossTraining"].amount,
    delta: byPlan["CrossTraining"].delta,
    multisede: false,
    inApp: true,
    billing: ["mensual", "trimestral"],
    color: "var(--color-cyan)",
  },
  {
    id: "funcional-pilates",
    name: "Funcional + Pilates",
    tagline: "Clases grupales combinadas",
    price: 42_000,
    perWeek: 3,
    disciplines: ["Funcional", "Pilates"],
    members: 151,
    revenue: Math.round((PF.amount * 151) / PF.members),
    delta: PF.delta,
    multisede: false,
    inApp: true,
    billing: ["mensual"],
    color: "var(--color-amber)",
  },
  {
    id: "pilates-reformer",
    name: "Pilates Reformer",
    tagline: "Grupos reducidos de 10 personas",
    price: 52_000,
    perWeek: 2,
    disciplines: ["Pilates"],
    members: 86,
    revenue: Math.round((PF.amount * 86) / PF.members),
    delta: 3.4,
    multisede: false,
    inApp: true,
    billing: ["mensual", "trimestral"],
    color: "var(--color-emerald)",
  },
  {
    id: "corporativo",
    name: "Corporativo",
    tagline: "Pase Libre para empresas · 8 convenios",
    price: 38_900,
    perWeek: 0,
    disciplines: ["Musculación", "CrossTraining", "Funcional", "Spinning", "Yoga"],
    members: 74,
    revenue: Math.round((PL.amount * 74) / PL.members),
    delta: 11.2,
    multisede: true,
    inApp: false,
    billing: ["mensual"],
    color: "var(--color-rose)",
    corporate: true,
  },
];

export const TOTAL_MEMBERS = INITIAL_PLANS.reduce((a, p) => a + p.members, 0); // 1.482

export const EXTRA_CHARGES = [
  { label: "Matrícula", value: "$ 15.000", hint: "Alta de socio nuevo" },
  { label: "Clase suelta", value: "$ 8.500", hint: "Visitantes" },
  { label: "Recargo por mora", value: "10 %", hint: "Desde el día 6" },
  { label: "Pago trimestral", value: "−10 %", hint: "Bonificación" },
];

/** Precio de Pase Libre a lo largo de 2026 (último aumento: 1 sep, +8 %). */
export const PRICE_HISTORY = [
  { label: "Ene", value: 36_000 },
  { label: "Mar", value: 39_500 },
  { label: "May", value: 42_000 },
  { label: "Jul", value: 45_300 },
  { label: "Sep", value: 48_900 },
];

export const INCREASE_DATES = [
  { value: "1-dic", label: "1 dic 2026", hint: "Aviso a socios: hoy (6 días antes)" },
  { value: "1-ene", label: "1 ene 2027", hint: "Aviso a socios: 17 dic" },
  { value: "1-feb", label: "1 feb 2027", hint: "Aviso a socios: 17 ene" },
] as const;

/* ── Sedes ─────────────────────────────────────────────────── */
export type Device = { name: string; kind: "Molinete" | "Puerta" | "Lector facial"; online: boolean; note?: string };
export type Branch = {
  key: string;
  name: string;
  address: string;
  area: string;
  photo: string;
  capacity: number;
  now: number;
  members: number;
  occupancy: number;
  hours: { days: string; time: string }[];
  manager: { name: string; face: number };
  devices: Device[];
  main?: boolean;
};

const row = (n: string) => BRANCH_ROWS.find((b) => b.name === n)!;

export const BRANCHES: Branch[] = [
  {
    key: "centro",
    name: "Sede Centro",
    address: "Av. Corrientes 1847",
    area: "San Nicolás, CABA",
    photo: PHOTO.barbell(900, 560),
    capacity: 140,
    now: 86, // "Ocupación ahora" del menú lateral
    members: row("Sede Centro").members,
    occupancy: row("Sede Centro").occupancy,
    hours: [
      { days: "Lun a Vie", time: "06:00 – 23:00" },
      { days: "Sábados", time: "08:00 – 20:00" },
      { days: "Domingos", time: "09:00 – 14:00" },
    ],
    manager: { name: "Carolina Vidal", face: 12 },
    devices: [
      { name: "Molinete 1", kind: "Molinete", online: true },
      { name: "Molinete 2", kind: "Molinete", online: true },
      { name: "Puerta lateral", kind: "Puerta", online: true },
    ],
    main: true,
  },
  {
    key: "norte",
    name: "Sede Norte",
    address: "Av. Cabildo 2230",
    area: "Belgrano, CABA",
    photo: PHOTO.machine(900, 560),
    capacity: 110,
    now: 41,
    members: row("Sede Norte").members,
    occupancy: row("Sede Norte").occupancy,
    hours: [
      { days: "Lun a Vie", time: "06:30 – 22:30" },
      { days: "Sábados", time: "09:00 – 18:00" },
      { days: "Domingos", time: "Cerrado" },
    ],
    manager: { name: "Ezequiel Luna", face: 10 },
    devices: [
      { name: "Molinete 1", kind: "Molinete", online: true },
      { name: "Lector facial", kind: "Lector facial", online: true },
    ],
  },
  {
    key: "parque",
    name: "Sede Parque",
    address: "Av. Rivadavia 5120",
    area: "Caballito, CABA",
    photo: PHOTO.classRopes(900, 560),
    capacity: 90,
    now: 23,
    members: row("Sede Parque").members,
    occupancy: row("Sede Parque").occupancy,
    hours: [
      { days: "Lun a Vie", time: "07:00 – 22:00" },
      { days: "Sábados", time: "09:00 – 14:00" },
      { days: "Domingos", time: "Cerrado" },
    ],
    manager: { name: "Micaela Torres", face: 14 },
    devices: [
      { name: "Molinete 1", kind: "Molinete", online: true },
      { name: "Molinete 2", kind: "Molinete", online: false, note: "Sin señal desde 08:40" },
    ],
  },
];

export const DEVICES_TOTAL = BRANCHES.reduce((a, b) => a + b.devices.length, 0);
export const DEVICES_OFFLINE = BRANCHES.reduce((a, b) => a + b.devices.filter((d) => !d.online).length, 0);

export const CLOSURES = [
  { day: "8", month: "dic", label: "Inmaculada Concepción", detail: "Todas las sedes · 09:00 a 14:00", tone: "amber" as const },
  { day: "24", month: "dic", label: "Nochebuena", detail: "Cierre anticipado 16:00", tone: "amber" as const },
  { day: "25", month: "dic", label: "Navidad", detail: "Cerrado", tone: "rose" as const },
  { day: "31", month: "dic", label: "Fin de año", detail: "Cierre anticipado 16:00", tone: "amber" as const },
  { day: "1", month: "ene", label: "Año Nuevo", detail: "Cerrado", tone: "rose" as const },
];

/* ── Usuarios y permisos ───────────────────────────────────── */
export type Role = "admin" | "recepcion" | "coach" | "ventas";

export const ROLE_META: Record<Role, { label: string; tone: "lime" | "cyan" | "violet" | "amber"; color: string; desc: string }> = {
  admin: { label: "Admin", tone: "lime", color: "var(--color-lime)", desc: "Acceso total" },
  recepcion: { label: "Recepción", tone: "cyan", color: "var(--color-cyan)", desc: "Mostrador y accesos" },
  coach: { label: "Coach", tone: "violet", color: "var(--color-violet)", desc: "Clases y rutinas" },
  ventas: { label: "Ventas", tone: "amber", color: "var(--color-amber)", desc: "Leads y altas" },
};
export const ROLES = Object.keys(ROLE_META) as Role[];

export type Staff = {
  id: string;
  name: string;
  face: number;
  email: string;
  role: Role;
  branch: string;
  last: string;
  online?: boolean;
  twoFA: boolean;
  pending?: boolean;
};

const mail = (n: string) =>
  `${n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(" ")[0]}@ironfactory.com.ar`;

export const STAFF: Staff[] = [
  { id: "u1", name: "Carolina Vidal", face: 12, email: mail("Carolina Vidal"), role: "admin", branch: "Todas las sedes", last: "Ahora", online: true, twoFA: true },
  { id: "u2", name: "Ezequiel Luna", face: 10, email: mail("Ezequiel Luna"), role: "recepcion", branch: "Sede Norte", last: "Hace 4 min", online: true, twoFA: true },
  { id: "u3", name: "Micaela Torres", face: 14, email: mail("Micaela Torres"), role: "recepcion", branch: "Sede Parque", last: "Hace 12 min", online: true, twoFA: false },
  ...COACHES.map(
    (c, i): Staff => ({
      id: `c-${c.id}`,
      name: c.name,
      face: c.face,
      email: mail(c.name),
      role: "coach",
      branch: i % 3 === 0 ? "Todas las sedes" : i % 3 === 1 ? "Sede Centro" : "Sede Norte",
      last: ["Hace 18 min", "Ayer · 21:40", "Hace 1 h", "Hoy · 07:05", "Ayer · 19:12", "Hace 2 d"][i],
      online: i === 0,
      twoFA: i % 2 === 0,
    }),
  ),
  ...SELLERS.map(
    (v, i): Staff => ({
      id: `v-${v.id}`,
      name: v.name,
      face: v.face,
      email: mail(v.name),
      role: "ventas",
      branch: ["Sede Centro", "Sede Centro", "Sede Norte", "Sede Parque"][i],
      last: i === 3 ? "Invitación enviada" : ["Hace 26 min", "Hace 3 h", "Ayer · 18:30"][i],
      twoFA: i < 2,
      pending: i === 3,
    }),
  ),
];

export type Permission = { key: string; label: string; group: string; sensitive?: boolean };

export const PERMISSIONS: Permission[] = [
  { key: "socios.ver", label: "Ver fichas de socios", group: "Socios" },
  { key: "socios.editar", label: "Altas, bajas y congelamientos", group: "Socios" },
  { key: "caja.cobrar", label: "Registrar cobros", group: "Caja" },
  { key: "caja.anular", label: "Anular movimientos", group: "Caja", sensitive: true },
  { key: "caja.cerrar", label: "Cerrar caja y Reporte Z", group: "Caja" },
  { key: "acceso.abrir", label: "Abrir molinete manualmente", group: "Acceso" },
  { key: "clases.agenda", label: "Gestionar agenda de clases", group: "Clases y rutinas" },
  { key: "rutinas.crear", label: "Crear y asignar rutinas", group: "Clases y rutinas" },
  { key: "crm.leads", label: "Gestionar leads y pruebas", group: "Ventas" },
  { key: "reportes.fin", label: "Ver reportes financieros", group: "Negocio", sensitive: true },
  { key: "config.editar", label: "Editar configuración", group: "Negocio", sensitive: true },
];

export const INITIAL_MATRIX: Record<Exclude<Role, "admin">, string[]> = {
  recepcion: ["socios.ver", "socios.editar", "caja.cobrar", "caja.cerrar", "acceso.abrir", "crm.leads"],
  coach: ["socios.ver", "clases.agenda", "rutinas.crear", "acceso.abrir"],
  ventas: ["socios.ver", "socios.editar", "caja.cobrar", "crm.leads"],
};

/* ── Integraciones ─────────────────────────────────────────── */
export type IntegrationKey = "mp" | "wa" | "gcal" | "afip" | "devices" | "zapier";

export type Integration = {
  key: IntegrationKey;
  name: string;
  category: string;
  desc: string;
  connected: boolean;
  detail?: string;
  metric?: { label: string; value: string };
  warn?: string;
  tile: string;
  ink: string;
  mono: string;
};

export const INTEGRATIONS: Integration[] = [
  {
    key: "mp",
    name: "Mercado Pago",
    category: "Cobros",
    desc: "QR en mostrador, link de pago y débito automático de cuotas.",
    connected: true,
    detail: "Cuenta IRONFACTORY · CUIT 30-71584239-6",
    metric: { label: "Cobrado en noviembre", value: "$ 14,7 M" },
    tile: "#00A3E0",
    ink: "#fff",
    mono: "MP",
  },
  {
    key: "wa",
    name: "WhatsApp Business",
    category: "Mensajería",
    desc: "Recordatorios de vencimiento, comprobantes y confirmación de reservas.",
    connected: true,
    detail: "+54 11 5263-0418 · verificado",
    metric: { label: "Mensajes este mes", value: "3.912" },
    tile: "#25D366",
    ink: "#06210f",
    mono: "WA",
  },
  {
    key: "afip",
    name: "AFIP · Factura electrónica",
    category: "Fiscal",
    desc: "Emisión automática de Factura B con CAE en cada cobro.",
    connected: true,
    detail: "Punto de venta 0003 · Responsable inscripto",
    metric: { label: "Comprobantes noviembre", value: "1.296" },
    warn: "El certificado vence el 14 ene 2027",
    tile: "#E8EEF6",
    ink: "#0B1018",
    mono: "AF",
  },
  {
    key: "devices",
    name: "Molinetes y lectores",
    category: "Hardware",
    desc: "Molinetes, puertas y lectores QR, NFC y faciales de las 3 sedes.",
    connected: true,
    detail: `${DEVICES_TOTAL} dispositivos vinculados`,
    metric: { label: "Ingresos hoy", value: "214" },
    warn: "Molinete 2 de Sede Parque sin conexión",
    tile: "#B5F54A",
    ink: "#10170A",
    mono: "",
  },
  {
    key: "gcal",
    name: "Google Calendar",
    category: "Agenda",
    desc: "Sincronizá las clases reservadas con el calendario de cada socio y coach.",
    connected: false,
    tile: "#4285F4",
    ink: "#fff",
    mono: "GC",
  },
  {
    key: "zapier",
    name: "Zapier",
    category: "Automatización",
    desc: "Conectá altas, pagos y leads con más de 6.000 aplicaciones.",
    connected: false,
    tile: "#FF4F00",
    ink: "#fff",
    mono: "Z",
  },
];

/* ── App del socio / Marca ─────────────────────────────────── */
export const ACCENTS = [
  { key: "lime", name: "Lima", hex: "#B5F54A", ink: "#10170A" },
  { key: "cyan", name: "Hielo", hex: "#57D5F2", ink: "#04161C" },
  { key: "violet", name: "Violeta", hex: "#9D84FF", ink: "#110B26" },
  { key: "amber", name: "Ámbar", hex: "#FFBE55", ink: "#1F1404" },
  { key: "coral", name: "Coral", hex: "#FF7A59", ink: "#230C05" },
  { key: "emerald", name: "Esmeralda", hex: "#3DDC97", ink: "#04190F" },
] as const;
export type AccentKey = (typeof ACCENTS)[number]["key"];

/* ── Notificaciones ────────────────────────────────────────── */
export type Channel = "whatsapp" | "email" | "push";
export const NOTIFS: { key: string; label: string; when: string; on: Record<Channel, boolean>; message: string }[] = [
  {
    key: "vence",
    label: "Cuota por vencer",
    when: "3 días antes",
    on: { whatsapp: true, email: true, push: true },
    message: "¡Hola {nombre}! Tu cuota de {plan} vence el {vencimiento}. Pagala desde la app o en recepción y seguí entrenando sin cortes 💪",
  },
  {
    key: "vencida",
    label: "Cuota vencida",
    when: "Días 1, 5 y 10",
    on: { whatsapp: true, email: true, push: false },
    message: "Hola {nombre}, tu cuota de {plan} venció el {vencimiento}. Podés regularizarla en un toque con este link: {link_pago}",
  },
  {
    key: "pago",
    label: "Pago acreditado",
    when: "Al instante",
    on: { whatsapp: true, email: false, push: true },
    message: "¡Listo, {nombre}! Recibimos tu pago de {monto}. Tu comprobante: {comprobante} ✅",
  },
  {
    key: "reserva",
    label: "Reserva confirmada",
    when: "Al reservar",
    on: { whatsapp: false, email: false, push: true },
    message: "Reservaste {clase} el {dia} a las {hora} con {coach}. ¡Te esperamos!",
  },
  {
    key: "inactivo",
    label: "Socio inactivo",
    when: "14 días sin venir",
    on: { whatsapp: true, email: false, push: false },
    message: "¡{nombre}, te extrañamos! 🔥 Hace {dias} días que no venís. ¿Te reservamos una clase para esta semana?",
  },
  {
    key: "cumple",
    label: "Cumpleaños",
    when: "09:00 del día",
    on: { whatsapp: true, email: false, push: true },
    message: "¡Feliz cumple, {nombre}! 🎉 Pasá por la barra de tu sede: tenés un batido de regalo.",
  },
];
export const VARIABLES = ["{nombre}", "{plan}", "{vencimiento}", "{monto}", "{link_pago}", "{clase}", "{hora}"];

/* ── Facturación (suscripción a Pulso, coincide con Super Admin) ── */
export const SUBSCRIPTION = {
  plan: "Pro",
  price: 239_700,
  next: "1 dic 2026",
  card: "Visa terminada en 4821",
  since: "mar 2023",
  usage: [
    { label: "Socios activos", used: TOTAL_MEMBERS, limit: 2000 },
    { label: "Sedes", used: BRANCHES.length, limit: 5 },
    { label: "Usuarios del equipo", used: STAFF.length, limit: 15 },
    { label: "Mensajes de WhatsApp", used: 3912, limit: 6000 },
  ],
  invoices: [
    { id: "A 0001-00018412", period: "Noviembre 2026", date: "01 nov", amount: 239_700 },
    { id: "A 0001-00017230", period: "Octubre 2026", date: "01 oct", amount: 239_700 },
    { id: "A 0001-00016095", period: "Septiembre 2026", date: "01 sep", amount: 219_900 },
    { id: "A 0001-00014977", period: "Agosto 2026", date: "01 ago", amount: 219_900 },
  ],
};
