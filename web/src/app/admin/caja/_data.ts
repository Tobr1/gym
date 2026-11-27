/* Datos de demostración de Caja y cobranzas. Reemplazar por la capa de datos real. */

export type MethodKey = "efectivo" | "debito" | "credito" | "transferencia" | "mp";

export const METHODS: { key: MethodKey; label: string; short: string; color: string; amount: number; ops: number }[] = [
  { key: "efectivo", label: "Efectivo", short: "Efectivo", color: "#B5F54A", amount: 312_400, ops: 17 },
  { key: "debito", label: "Débito", short: "Débito", color: "#3DDC97", amount: 268_900, ops: 12 },
  { key: "credito", label: "Crédito", short: "Crédito", color: "#9D84FF", amount: 221_500, ops: 7 },
  { key: "transferencia", label: "Transferencia", short: "Transf.", color: "#FFBE55", amount: 184_200, ops: 9 },
  { key: "mp", label: "Mercado Pago", short: "M. Pago", color: "#57D5F2", amount: 405_400, ops: 19 },
];

export const METHOD_META = Object.fromEntries(METHODS.map((m) => [m.key, m])) as Record<MethodKey, (typeof METHODS)[number]>;

export const REGISTER = {
  opening: 50_000,
  income: METHODS.reduce((a, m) => a + m.amount, 0), // 1.392.400
  expenses: 157_750,
  cashExpenses: 157_750,
  ops: METHODS.reduce((a, m) => a + m.ops, 0),
  lastCount: "08:30",
};
export const BALANCE = REGISTER.opening + REGISTER.income - REGISTER.expenses;
export const CASH_DRAWER = REGISTER.opening + METHODS[0].amount - REGISTER.cashExpenses;

/** Ingresos del turno en franjas de 15 min (07:00 a 08:52, la última en curso), en miles. */
export const HOURLY_INCOME = [112, 168, 214, 196, 238, 187, 205, 72];

export type ConceptKey = "cuota" | "matricula" | "producto" | "clase";
export type MoveStatus = "acreditado" | "pendiente" | "rechazado" | "anulado";

export type Movement = {
  id: string;
  time: string;
  who: string;
  face?: number;
  concept: string;
  kind: ConceptKey | "egreso";
  method: MethodKey;
  receipt: string;
  amount: number; // negativo = egreso
  status: MoveStatus;
  fresh?: boolean;
};

export const MOVEMENTS: Movement[] = [
  { id: "m1", time: "08:49", who: "Benjamín Acosta", face: 8, concept: "Cuota Pase Libre · Dic", kind: "cuota", method: "mp", receipt: "MP 8812·4471", amount: 48_900, status: "acreditado" },
  { id: "m2", time: "08:43", who: "Mostrador", concept: "Proteína Whey 1 kg + Shaker", kind: "producto", method: "debito", receipt: "FC B 0003-00012845", amount: 48_400, status: "acreditado" },
  { id: "m3", time: "08:36", who: "Nicolás Romero", face: 10, concept: "Cuota CrossTraining · Dic", kind: "cuota", method: "transferencia", receipt: "TRF 0042·1187", amount: 44_500, status: "pendiente" },
  { id: "m4", time: "08:27", who: "Limpieza Total SRL", concept: "Pago a proveedor · insumos", kind: "egreso", method: "efectivo", receipt: "OP 0001-00000318", amount: -86_000, status: "acreditado" },
  { id: "m5", time: "08:18", who: "Martina López", face: 9, concept: "Matrícula + Funcional", kind: "matricula", method: "credito", receipt: "FC B 0003-00012844", amount: 57_000, status: "acreditado" },
  { id: "m6", time: "08:05", who: "Visitante · Lautaro P.", concept: "Clase suelta · Spinning", kind: "clase", method: "efectivo", receipt: "Recibo X 0001-00004427", amount: 8_500, status: "acreditado" },
  { id: "m7", time: "07:51", who: "Camila Pereyra", face: 5, concept: "Cuota CrossTraining · Nov", kind: "cuota", method: "credito", receipt: "POS 552·0981", amount: 44_500, status: "rechazado" },
  { id: "m8", time: "07:38", who: "Retiro a caja fuerte", concept: "Depósito parcial de efectivo", kind: "egreso", method: "efectivo", receipt: "INT 0000-00000077", amount: -71_750, status: "acreditado" },
  { id: "m9", time: "07:24", who: "Mateo Fernández", face: 6, concept: "Cuota Musculación 3x · Dic", kind: "cuota", method: "mp", receipt: "MP 8811·9032", amount: 36_500, status: "acreditado" },
  { id: "m10", time: "07:09", who: "Joaquín Sosa", face: 3, concept: "Toalla Pulso + Agua", kind: "producto", method: "efectivo", receipt: "Recibo X 0001-00004426", amount: 13_500, status: "anulado" },
];

export const STATUS_PILL: Record<MoveStatus, { label: string; tone: "lime" | "amber" | "rose" | "neutral" }> = {
  acreditado: { label: "Acreditado", tone: "lime" },
  pendiente: { label: "Pendiente", tone: "amber" },
  rechazado: { label: "Rechazado", tone: "rose" },
  anulado: { label: "Anulado", tone: "neutral" },
};

/** Facturación mensual (millones de ARS). */
export const MONTHLY = [
  { label: "May", value: 29.4 },
  { label: "Jun", value: 31.2 },
  { label: "Jul", value: 33.8 },
  { label: "Ago", value: 35.1 },
  { label: "Sep", value: 38.4 },
  { label: "Oct", value: 41.9 },
  { label: "Nov", value: 46.7 },
];

export const AGING = [
  { key: "ok", label: "Al día", range: "Sin deuda", members: 1318, amount: 0, color: "#B5F54A", share: 88.9, delta: 1.4 },
  { key: "b1", label: "1–7 días", range: "Aviso automático", members: 74, amount: 3_212_600, color: "#FFBE55", share: 5.0, delta: -0.6 },
  { key: "b2", label: "8–30 días", range: "Acceso bloqueado", members: 61, amount: 2_689_400, color: "#FF8A4C", share: 4.1, delta: -0.3 },
  { key: "b3", label: "+30 días", range: "Baja en revisión", members: 29, amount: 1_524_300, color: "#FF5F7E", share: 2.0, delta: 0.2 },
];

export type Debtor = {
  id: string;
  name: string;
  face: number;
  plan: string;
  days: number;
  amount: number;
  reminded: string;
  periods: number;
};

export const DEBTORS: Debtor[] = [
  { id: "1046", name: "Camila Pereyra", face: 5, plan: "CrossTraining", days: 9, amount: 44_500, reminded: "Recordado hace 2 d", periods: 1 },
  { id: "1101", name: "Franco Benítez", face: 11, plan: "Pase Libre", days: 38, amount: 97_800, reminded: "Sin respuesta · 3 avisos", periods: 2 },
  { id: "1093", name: "Julieta Sánchez", face: 14, plan: "Funcional + Pilates", days: 4, amount: 42_000, reminded: "Recordatorio automático", periods: 1 },
  { id: "1112", name: "Rocío Albornoz", face: 2, plan: "Pilates Reformer", days: 17, amount: 52_000, reminded: "Prometió pagar el viernes", periods: 1 },
  { id: "1087", name: "Ignacio Vera", face: 13, plan: "Musculación 3x", days: 26, amount: 73_000, reminded: "Recordado hace 6 d", periods: 2 },
  { id: "1118", name: "Santiago Ríos", face: 0, plan: "Musculación 3x", days: 2, amount: 36_500, reminded: "Venció el lunes", periods: 1 },
];

export const bucketOf = (days: number) => (days > 30 ? AGING[3] : days > 7 ? AGING[2] : AGING[1]);

export const RECOVERY = {
  rate: 72,
  recovered: 5_486_200,
  target: 7_620_000,
  channels: [
    { label: "WhatsApp", value: 54, color: "#3DDC97" },
    { label: "Débito automático", value: 28, color: "#9D84FF" },
    { label: "Mostrador", value: 18, color: "#57D5F2" },
  ],
};

/* Eventos de UI entre islas cliente (POS ⇄ tabla ⇄ deudores) */
export const EV_PREFILL = "caja:prefill";
export const EV_MOVEMENT = "caja:movement";
export type PrefillDetail = { memberId?: string; name: string; face: number; plan: string; amount: number };
