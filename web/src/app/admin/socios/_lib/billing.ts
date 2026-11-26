/* Estado de cuenta del socio. Parte de los pagos de la ficha (getProfile) y de los movimientos
   de Caja de hoy, para que montos, comprobantes y medios coincidan en todo el producto. */
import { MOVEMENTS } from "../../caja/_data";
import { MONTHS, PREV_PLAN, UPGRADE_MONTH, type Payment, type Profile } from "./profile";

export type LedgerRow = {
  id: string;
  date: string; // dd/mm
  sort: number; // yyyymmddhhmm
  kind: "cargo" | "pago" | "recargo" | "rechazo" | "licencia" | "programado";
  title: string;
  detail: string;
  debit: number;
  credit: number;
  balance: number;
  ref?: string;
};

export type Invoice = { id: string; number: string; date: string; period: string; amount: number; method: Payment["method"]; size: string };

const MONTH_FULL = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const cap = (x: string) => x[0].toUpperCase() + x.slice(1);

export function getBilling(p: Profile) {
  const m = p.member;
  const chrono = [...p.payments].reverse(); // mayo → noviembre
  const rows: Omit<LedgerRow, "balance">[] = [];
  const invoices: Invoice[] = [];
  const seed = Number(m.id);

  chrono.forEach((x, k) => {
    if (x.status === "pendiente") return; // aún no vence: figura como próximo débito
    const [dd, mm] = x.date.split("/");
    const mo = Number(mm) - 1;
    const base = 2026_00_00_0000 + (mo + 1) * 1_000_000 + Number(dd) * 10_000;
    const period = cap(MONTH_FULL[mo]);
    const plan = x.concept.split(" · ")[1];
    rows.push({ id: `c-${x.id}`, date: `${dd}/${mm}`, sort: base, kind: "cargo", title: `Cuota ${MONTH_FULL[mo]}`, detail: plan, debit: x.amount, credit: 0 });
    if (x.status === "pagado") {
      const number = `FC B 0003-${String(12_100 + seed * 7 + k * 113).padStart(8, "0")}`;
      rows.push({
        id: `p-${x.id}`,
        date: `${dd}/${mm}`,
        sort: base + 1,
        kind: "pago",
        title: `Pago · ${x.method}`,
        detail: x.method === "Efectivo" ? "Mostrador · Sede Centro" : x.method === "Mercado Pago" ? "Suscripción · acreditación automática" : x.method === "Débito automático" ? "Visa •••• 4821" : x.method === "Transferencia" ? "CBU •••• 0937" : "Visa crédito · 1 cuota",
        debit: 0,
        credit: x.amount,
        ref: number,
      });
      invoices.push({ id: x.id, number, date: x.date, period: `${period} 2026`, amount: x.amount, method: x.method, size: `${82 + ((seed + k * 7) % 14)} KB` });
    }
  });

  const status = m.status;
  if (status === "vencido") {
    const due = p.dueLabel; // "16 nov"
    rows.push({ id: "rec", date: "23/11", sort: 2026_11_23_0900, kind: "recargo", title: "Recargo por mora", detail: `7 días de atraso desde el ${due}`, debit: p.debt - (m.amount || 0), credit: 0 });
    const rejected = MOVEMENTS.find((mv) => mv.who === m.name && mv.status === "rechazado");
    if (rejected) {
      rows.push({
        id: "rej",
        date: "25/11",
        sort: 2026_11_25_0751,
        kind: "rechazo",
        title: "Cobro rechazado · Tarjeta de crédito",
        detail: `Hoy ${rejected.time} · fondos insuficientes`,
        debit: 0,
        credit: 0,
        ref: rejected.receipt,
      });
    }
  }
  if (status === "congelado") {
    rows.push({ id: "lic", date: "04/11", sort: 2026_11_04_1000, kind: "licencia", title: "Licencia por viaje", detail: "Congelamiento 4 nov → 15 dic · 28 días a favor al reactivar", debit: 0, credit: 0 });
  }

  rows.sort((a, b) => a.sort - b.sort);
  let bal = 0;
  const ledger: LedgerRow[] = rows.map((r) => {
    bal += r.debit - r.credit;
    return { ...r, balance: bal };
  });
  const balance = bal;

  /* ── Próximo débito ── */
  const amount = m.amount || 42000;
  const pending = p.payments.find((x) => x.status === "pendiente");
  const next =
    status === "congelado"
      ? { label: "15 dic", amount, days: 20, title: "Reactivación", note: "Sin débitos durante la licencia" }
      : status === "vencido"
        ? { label: "Hoy", amount: p.debt, days: 0, title: "Reintento de cobro", note: "Cupos retenidos hasta las 17:00" }
        : pending
          ? { label: p.dueLabel, amount: pending.amount, days: p.daysLeft, title: p.payMethod.auto ? "Débito programado" : "Vencimiento", note: p.payMethod.auto ? `${p.payMethod.name} · ${p.payMethod.detail}` : "Pago manual · enviar recordatorio" }
          : { label: p.dueLabel, amount, days: p.daysLeft, title: p.payMethod.auto ? "Débito programado" : "Vencimiento", note: p.payMethod.auto ? `${p.payMethod.name} · ${p.payMethod.detail}` : "Pago manual · enviar recordatorio" };

  /* ── Upcoming (no impacta saldo) ── */
  const upcoming =
    status === "activo"
      ? { date: p.dueLabel, title: `Cuota diciembre`, amount, method: p.payMethod.auto ? p.payMethod.name : "Pago manual" }
      : status === "por-vencer" && pending
        ? { date: p.dueLabel, title: `Cuota noviembre`, amount: pending.amount, method: p.payMethod.auto ? p.payMethod.name : "Pago manual" }
        : null;

  /* ── Métricas ── */
  const paid = p.payments.filter((x) => x.status === "pagado");
  const paidTotal = paid.reduce((a, b) => a + b.amount, 0);
  const onTime = Math.round((paid.length / p.payments.length) * 100);
  const bars = chrono.map((x) => ({
    label: cap(MONTHS[Number(x.date.split("/")[1]) - 1]),
    amount: x.amount,
    status: x.status,
    prev: Number(x.date.split("/")[1]) - 1 < UPGRADE_MONTH,
  }));

  /* ── Historial de planes ── */
  const curPrice = amount;
  const plans = [
    { plan: m.plan, from: "14 ago 2026", to: null as string | null, price: curPrice, note: status === "congelado" ? "En pausa por licencia" : "Plan vigente", current: true },
    { plan: PREV_PLAN, from: m.since, to: "14 ago 2026", price: Math.round((curPrice * 0.8 * 0.86) / 100) * 100, note: "Upgrade sin cargo de alta", current: false },
  ];

  return { ledger: ledger.reverse(), invoices: invoices.reverse(), balance, next, upcoming, paidTotal, onTime, bars, plans, avgTicket: Math.round(paidTotal / Math.max(1, paid.length)) };
}

export type Billing = ReturnType<typeof getBilling>;
