/* Datos de demostración de la ficha integral del socio. Derivados de MEMBERS de forma determinística. */
import { MEMBERS, type Member } from "@/lib/mock";
import { money } from "@/lib/utils";

/** "Hoy" del entorno de demo: miércoles 25 de noviembre de 2026. */
export const TODAY = new Date(Date.UTC(2026, 10, 25));

export const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** PRNG determinístico (mulberry32) para que server y client coincidan. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FEMALE = new Set(["1042", "1044", "1046", "1048", "1050"]);

export type HeatCell = { date: string; label: string; level: 0 | 1 | 2 | 3 | 4; future: boolean; minutes: number };
export type Payment = {
  id: string;
  date: string;
  concept: string;
  method: "Mercado Pago" | "Débito automático" | "Efectivo" | "Transferencia" | "Tarjeta de crédito";
  amount: number;
  status: "pagado" | "pendiente" | "vencido";
};
export type TimelineEvent = {
  kind: "ingreso" | "pago" | "plan" | "nota" | "logro" | "alerta";
  title: string;
  detail?: string;
  when: string;
  author?: { name: string; face: number };
};

export type RoutineKey = "default" | "cross" | "pilates";
/** Familia de rutina según el plan (misma regla que usa la ficha). */
export const routineKey = (plan: string): RoutineKey => (plan.includes("Cross") ? "cross" : plan.includes("Pilates") ? "pilates" : "default");
/** Plan anterior al cambio del 14 ago (ver línea de tiempo). */
export const PREV_PLAN = "Musculación 2x";
export const UPGRADE_MONTH = 7; // agosto

export type Booking = {
  day: string;
  date: string;
  name: string;
  time: string;
  room: string;
  coach: { name: string; face: number };
  spots: string;
};

export type Profile = {
  member: Member;
  female: boolean;
  dni: string;
  age: number;
  birthday: string;
  email: string;
  phone: string;
  address: string;
  daysLeft: number;
  periodDays: number;
  dueLabel: string;
  payMethod: { name: string; detail: string; auto: boolean };
  stats: { visits: number; streak: number; bestStreak: number; monthVisits: number; avgMinutes: number; usualHour: string };
  heat: { weeks: HeatCell[][]; months: { label: string; col: number }[]; total: number };
  hourPref: number[]; // 6 franjas
  body: {
    weight: number[];
    fat: number[];
    muscle: number[];
    lastEval: string;
    nextEval: string;
    goal: string;
  };
  routine: {
    name: string;
    phase: string;
    week: number;
    weeks: number;
    adherence: number;
    coach: { name: string; face: number };
    days: { key: string; name: string; focus: string; exercises: number; minutes: number; done: boolean }[];
    highlights: { exercise: string; value: string; delta: string }[];
  };
  payments: Payment[];
  timeline: TimelineEvent[];
  health: {
    aptoUntil: string;
    aptoStatus: "vigente" | "por-vencer";
    blood: string;
    notes: string[];
    restrictions: string[];
  };
  emergency: { name: string; relation: string; phone: string };
  tags: { label: string; tone: "lime" | "violet" | "cyan" | "amber" | "rose" | "neutral" }[];
  debt: number;
  /** Reservas de los próximos 7 días (la primera es la próxima clase). */
  bookings: Booking[];
  /** Reservas suspendidas (cuota vencida o membresía congelada). */
  bookingsOnHold: boolean;
};

export const COACHES = [
  { name: "Diego Ibarra", face: 13 },
  { name: "Romina Paz", face: 14 },
  { name: "Franco Molina", face: 11 },
];

function parseDue(due: string): Date | null {
  const m = due.match(/(\d{1,2})\s+(\w{3})/);
  if (!m) return null;
  const month = MONTHS.indexOf(m[2]);
  return new Date(Date.UTC(2026, month, Number(m[1])));
}

export const dayMs = 86_400_000;
const one = (n: number) => n.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const fmtDay = (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;

export function getProfile(id: string): Profile | null {
  const member = MEMBERS.find((m) => m.id === id);
  if (!member) return null;
  const r = rng(Number(id) * 7919);
  const female = FEMALE.has(id);
  const att = member.attendance / 100;
  const first = member.name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const last = member.name.split(" ")[1].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  /* ── Vencimiento ─────────────────────────────── */
  const due = parseDue(member.due);
  const daysLeft = due ? Math.round((due.getTime() - TODAY.getTime()) / dayMs) : 0;

  /* ── Heatmap: 16 semanas (lun→dom), termina en la semana actual ── */
  const WEEKS = 16;
  const todayDow = (TODAY.getUTCDay() + 6) % 7; // 0 = lunes
  const start = new Date(TODAY.getTime() - (todayDow + (WEEKS - 1) * 7) * dayMs);
  const weeks: HeatCell[][] = [];
  const months: { label: string; col: number }[] = [];
  let total = 0;
  let lastMonth = -1;
  const frozen = member.status === "congelado";
  const lapsed = member.status === "vencido";
  const lastVisitAgo = lastCheckInDaysAgo(member.lastCheckIn);
  const inProgressMin = minutesSince(member.lastCheckIn);
  for (let w = 0; w < WEEKS; w++) {
    const col: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getTime() + (w * 7 + d) * dayMs);
      const future = date > TODAY;
      const daysAgo = Math.round((TODAY.getTime() - date.getTime()) / dayMs);
      // Congelado: asistencia del mes 0 %, pero antes de la licencia entrenaba con regularidad.
      let p = (frozen ? 0.6 : att) * (d >= 5 ? 0.35 : 0.84);
      if (frozen && daysAgo < 21) p = 0;
      if (lapsed && daysAgo < 9) p = 0;
      if (!frozen && !lapsed && w < 3) p *= 0.75;
      const roll = r();
      // El último ingreso del socio (hoy, ayer o hace N días) siempre figura en el mapa.
      const forced = daysAgo === lastVisitAgo;
      const go = !future && (forced || (p > 0 && roll < Math.max(0.06, p)));
      const minutes = go ? (forced && daysAgo === 0 ? inProgressMin : Math.round(40 + r() * 70)) : 0;
      const level = (go ? (minutes > 95 ? 4 : minutes > 75 ? 3 : minutes > 55 ? 2 : 1) : 0) as HeatCell["level"];
      if (go) total++;
      col.push({
        date: date.toISOString().slice(0, 10),
        label: `${fmtDay(date)} · ${go ? `${minutes} min` : future ? "—" : "sin ingreso"}`,
        level,
        future,
        minutes,
      });
      if (d === 0 && date.getUTCMonth() !== lastMonth) {
        lastMonth = date.getUTCMonth();
        if (w < WEEKS - 1) months.push({ label: MONTHS[lastMonth][0].toUpperCase() + MONTHS[lastMonth].slice(1), col: w });
      }
    }
    weeks.push(col);
  }

  /* ── Rachas ─────────────────────────────────── */
  // Racha = semanas consecutivas con 3 o más ingresos (la semana en curso no corta la racha).
  const hits = weeks.map((wk) => wk.filter((c) => c.level > 0).length >= 3);
  let streak = 0;
  for (let w = hits.length - 1; w >= 0; w--) {
    if (hits[w]) streak++;
    else if (w === hits.length - 1) continue;
    else break;
  }
  let best = 0;
  let cur = 0;
  hits.forEach((h) => {
    cur = h ? cur + 1 : 0;
    best = Math.max(best, cur);
  });
  best = Math.max(best, streak, 4);

  /* ── Cuerpo ─────────────────────────────────── */
  const baseW = female ? 66 + r() * 6 : 82 + r() * 8;
  const baseF = female ? 27 + r() * 3 : 21 + r() * 3;
  const baseM = female ? 25.5 + r() * 2 : 35 + r() * 3;
  const pts = 8;
  const weight = Array.from({ length: pts }, (_, i) => +(baseW - i * (0.35 + att * 0.25) + (r() - 0.5) * 0.6).toFixed(1));
  const fat = Array.from({ length: pts }, (_, i) => +(baseF - i * (0.45 + att * 0.2) + (r() - 0.5) * 0.4).toFixed(1));
  const muscle = Array.from({ length: pts }, (_, i) => +(baseM + i * (0.18 + att * 0.1) + (r() - 0.5) * 0.25).toFixed(1));

  const coach = COACHES[Number(id) % COACHES.length];
  const plan = member.plan;
  const amount = member.amount || 42000;

  const routineByPlan: Record<string, Profile["routine"]["days"]> = {
    default: [
      { key: "A", name: "Tren superior", focus: "Pecho · Espalda · Hombros", exercises: 7, minutes: 60, done: true },
      { key: "B", name: "Tren inferior", focus: "Cuádriceps · Glúteos · Isquios", exercises: 6, minutes: 65, done: true },
      { key: "C", name: "Full body + core", focus: "Potencia · Core · Acondicionamiento", exercises: 8, minutes: 55, done: false },
    ],
    cross: [
      { key: "A", name: "Fuerza + WOD", focus: "Back squat · AMRAP 14'", exercises: 5, minutes: 60, done: true },
      { key: "B", name: "Gimnásticos", focus: "Pull-ups · HSPU · Core", exercises: 6, minutes: 55, done: true },
      { key: "C", name: "Engine", focus: "Remo · Bike · Intervalos", exercises: 4, minutes: 50, done: false },
    ],
    pilates: [
      { key: "A", name: "Reformer · Core", focus: "Estabilidad lumbopélvica", exercises: 9, minutes: 50, done: true },
      { key: "B", name: "Funcional", focus: "Movilidad · Fuerza global", exercises: 7, minutes: 55, done: false },
      { key: "C", name: "Reformer · Flow", focus: "Cadena posterior · Flexibilidad", exercises: 8, minutes: 50, done: false },
    ],
  };
  const rKey = routineKey(plan);

  const payMethods: Profile["payMethod"][] = [
    { name: "Débito automático", detail: "Visa •••• 4821", auto: true },
    { name: "Mercado Pago", detail: "Suscripción mensual", auto: true },
    { name: "Transferencia", detail: "CBU •••• 0937", auto: false },
  ];
  const payMethod = payMethods[Number(id) % payMethods.length];

  /* ── Pagos ──────────────────────────────────── */
  const payments: Payment[] = [];
  const histMonths = [10, 9, 8, 7, 6, 5, 4];
  const methodName = payMethod.name === "Débito automático" ? "Débito automático" : payMethod.name === "Mercado Pago" ? "Mercado Pago" : "Transferencia";
  histMonths.forEach((mo, i) => {
    const isCurrent = i === 0;
    let status: Payment["status"] = "pagado";
    if (isCurrent && member.status === "vencido") status = "vencido";
    if (isCurrent && member.status === "por-vencer") status = "pendiente";
    const prev = mo < UPGRADE_MONTH;
    const price = Math.round((amount * (1 - i * 0.045) * (prev ? 0.8 : 1)) / 100) * 100;
    const day = due ? due.getUTCDate() : 2; // congelado: pagó antes de la licencia (4 nov)
    payments.push({
      id: `R-${Number(id) * 10 + 7 - i}${String(mo).padStart(2, "0")}`,
      date: `${String(Math.min(day, 28)).padStart(2, "0")}/${String(mo + 1).padStart(2, "0")}/2026`,
      concept: `Cuota ${["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][mo]} · ${prev ? PREV_PLAN : plan}`,
      method: i === 4 ? "Efectivo" : i === 2 && methodName !== "Transferencia" ? "Tarjeta de crédito" : methodName,
      amount: price,
      status,
    });
  });
  const debt = member.status === "vencido" ? amount + 2200 : 0;

  /* ── Línea de tiempo ────────────────────────── */
  const lastPaid = payments.find((x) => x.status === "pagado") ?? payments[1];
  const timeline: TimelineEvent[] = [];
  if (member.status === "vencido") {
    timeline.push({ kind: "alerta", title: "Cuota vencida", detail: `Se envió recordatorio automático por WhatsApp · ${money(debt)}`, when: "Hoy · 09:00" });
  } else if (member.status === "congelado") {
    timeline.push({ kind: "plan", title: "Membresía congelada", detail: "Licencia por viaje · reactivación el 15 dic", when: "Hace 21 días" });
  } else {
    timeline.push({ kind: "ingreso", title: "Ingreso registrado", detail: `Molinete 1 · QR desde la app`, when: `Hoy · ${member.lastCheckIn}` });
  }
  timeline.push(
    {
      kind: "nota",
      title: `Nota de ${coach.name.split(" ")[0]}`,
      detail: COACH_NOTE[rKey][female ? 0 : 1],
      when: "Hace 2 días",
      author: coach,
    },
    { kind: "logro", title: `Racha de ${best} semanas`, detail: "3+ entrenamientos por semana sin cortar", when: "Hace 5 días" },
    { kind: "pago", title: "Pago acreditado", detail: `${money(lastPaid.amount)} · ${lastPaid.method}`, when: payDay(lastPaid.date) },
    { kind: "plan", title: `Cambio de plan a ${plan}`, detail: "Upgrade desde Musculación 2x · sin cargo de alta", when: "14 ago" },
    { kind: "nota", title: "Evaluación física", detail: `Peso ${one(weight[3])} kg · grasa ${one(fat[3])} % · objetivo actualizado`, when: "2 ago", author: coach },
  );

  const tagPool: Profile["tags"] = [
    { label: attLabel(member.attendance), tone: member.attendance > 80 ? "lime" : member.attendance > 50 ? "cyan" : "rose" },
    { label: female ? "Objetivo: recomposición" : "Objetivo: fuerza", tone: "violet" },
    { label: r() > 0.5 ? "Turno mañana" : "Turno noche", tone: "neutral" },
    { label: "Referido/a", tone: "neutral" },
    { label: "App activa", tone: "cyan" },
  ];
  if (member.status === "vencido") tagPool.push({ label: "Riesgo de baja", tone: "rose" });
  if (member.attendance > 85) tagPool.push({ label: "Candidato/a plan anual", tone: "amber" });

  const rel = r();
  return {
    member,
    female,
    dni: `${30 + Math.floor(r() * 14)}.${String(Math.floor(r() * 1000)).padStart(3, "0")}.${String(Math.floor(r() * 1000)).padStart(3, "0")}`,
    age: 22 + Math.floor(r() * 18),
    birthday: `${1 + Math.floor(r() * 27)} ${MONTHS[Math.floor(r() * 12)]}`,
    email: `${first}.${last}@gmail.com`,
    phone: `+54 9 11 ${4000 + Math.floor(r() * 5999)}-${1000 + Math.floor(r() * 8999)}`,
    address: ["Palermo, CABA", "Caballito, CABA", "Belgrano, CABA", "Villa Crespo, CABA"][Number(id) % 4],
    daysLeft,
    periodDays: 30,
    dueLabel: due ? fmtDay(due) : "—",
    payMethod,
    stats: {
      visits: 120 + Math.floor(att * 300 + r() * 40),
      streak,
      bestStreak: best,
      monthVisits: Math.round(att * 18),
      avgMinutes: Math.round(58 + r() * 22),
      usualHour: member.lastCheckIn.includes(":") ? `${member.lastCheckIn.slice(0, 2)}:00 – ${String(Number(member.lastCheckIn.slice(0, 2)) + 1).padStart(2, "0")}:30` : "19:00 – 20:30",
    },
    heat: { weeks, months, total },
    hourPref: [74, 38, 14, 22, 52, 26].map((v) => Math.round(v * (0.7 + r() * 0.6))),
    body: {
      weight,
      fat,
      muscle,
      lastEval: member.status === "congelado" ? "3 nov" : member.status === "vencido" ? "14 nov" : "18 nov",
      nextEval: member.status === "congelado" ? "17 dic" : "16 dic",
      goal: female ? "Bajar 4% de grasa manteniendo masa muscular" : "Ganar fuerza y 2 kg de masa muscular",
    },
    routine: {
      name: rKey === "cross" ? "CrossTraining · Engine" : rKey === "pilates" ? "Pilates + Funcional" : female ? "Recomposición corporal" : "Fuerza e hipertrofia",
      phase: "Fase 2 · Acumulación",
      week: 5,
      weeks: 8,
      adherence: Math.max(28, Math.round(member.attendance * 0.96)),
      coach,
      days: routineByPlan[rKey],
      highlights: rKey === "cross"
        ? [
            { exercise: "Back squat", value: female ? "65 kg" : "105 kg", delta: female ? "+10 kg" : "+12,5 kg" },
            { exercise: "Clean", value: female ? "45 kg" : "75 kg", delta: female ? "+7,5 kg" : "+10 kg" },
            { exercise: "Pull-ups", value: female ? "6 reps" : "14 reps", delta: female ? "+4" : "+5" },
          ]
        : rKey === "pilates"
        ? [
            { exercise: "Plancha", value: "75 s", delta: "+30 s" },
            { exercise: "Puente", value: "3×15", delta: "+5 reps" },
            { exercise: "Movilidad", value: "8/10", delta: "+2 pts" },
          ]
        : female
        ? [
            { exercise: "Hip thrust", value: "70 kg", delta: "+15 kg" },
            { exercise: "Goblet squat", value: "24 kg", delta: "+6 kg" },
            { exercise: "Remo 1 brazo", value: "16 kg", delta: "+4 kg" },
          ]
        : [
            { exercise: "Sentadilla", value: "110 kg", delta: "+12,5 kg" },
            { exercise: "Press banca", value: "85 kg", delta: "+7,5 kg" },
            { exercise: "Peso muerto", value: "140 kg", delta: "+15 kg" },
          ],
    },
    payments,
    timeline,
    health: {
      aptoUntil: rel > 0.5 ? "14 mar 2027" : "03 dic 2026",
      aptoStatus: rel > 0.5 ? "vigente" : "por-vencer",
      blood: ["0+", "A+", "B+", "0−"][Number(id) % 4],
      notes: female ? ["Hipotiroidismo controlado"] : ["Asma leve · usa broncodilatador"],
      restrictions: female ? ["Evitar impacto alto en rodilla izquierda"] : ["Sin restricciones de carga"],
    },
    emergency: {
      name: female ? "Martín " + member.name.split(" ")[1] : "Laura " + member.name.split(" ")[1],
      relation: female ? "Pareja" : "Hermana",
      phone: `+54 9 11 ${5000 + Math.floor(r() * 4999)}-${1000 + Math.floor(r() * 8999)}`,
    },
    tags: tagPool,
    debt,
    bookings: BOOKINGS[rKey],
    bookingsOnHold: member.status === "vencido" || member.status === "congelado",
  };
}

/** Días desde el último ingreso según el texto de MEMBERS ("07:12", "ayer", "hace 9 d"). */
export function lastCheckInDaysAgo(last: string) {
  if (/^\d{1,2}:\d{2}$/.test(last)) return 0;
  if (last === "ayer") return 1;
  const m = last.match(/hace (\d+) d/);
  return m ? Number(m[1]) : -1;
}

/** Hora de la demo: 08:52. */
export const NOW_MIN = 8 * 60 + 52;

/** Minutos transcurridos desde un ingreso de hoy hasta las 08:52 de la demo. */
export function minutesSince(last: string) {
  const m = last.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return 0;
  return Math.max(1, NOW_MIN - (Number(m[1]) * 60 + Number(m[2])));
}

function payDay(ddmmyyyy: string) {
  const [d, mo] = ddmmyyyy.split("/").map(Number);
  return `${d} ${MONTHS[mo - 1]}`;
}

export const COACH_NOTE: Record<"default" | "cross" | "pilates", [string, string]> = {
  default: [
    "Mejoró mucho la técnica de hip thrust. Subimos a 4×8 con +10 kg la próxima semana.",
    "Buena progresión en sentadilla. Ojo con la movilidad de tobillo, sumamos trabajo específico.",
  ],
  cross: [
    "Viene bajando la frecuencia. Le propuse volver con 2 WOD por semana y escalar los pull-ups con banda.",
    "Muy sólido en el WOD del lunes. Trabajamos el ritmo en el remo para no quemarse en la primera ronda.",
  ],
  pilates: [
    "Mejor control lumbopélvico en reformer. Sumamos variantes con un resorte menos.",
    "Avanza bien en estabilidad. Seguimos con trabajo de cadena posterior y respiración.",
  ],
};

const ROMINA = COACHES[1];
const DIEGO = COACHES[0];
const FRANCO = COACHES[2];
const BOOKINGS: Record<"default" | "cross" | "pilates", Booking[]> = {
  default: [
    { day: "HOY", date: "25", name: "Funcional HIIT", time: "19:00", room: "Sala 2", coach: ROMINA, spots: "18/20" },
    { day: "JUE", date: "26", name: "Movilidad + Core", time: "07:30", room: "Sala 1", coach: DIEGO, spots: "9/16" },
    { day: "SÁB", date: "28", name: "Open Box", time: "10:00", room: "Box", coach: FRANCO, spots: "14/24" },
  ],
  cross: [
    { day: "HOY", date: "25", name: "WOD · CrossTraining", time: "19:00", room: "Box", coach: FRANCO, spots: "16/18" },
    { day: "VIE", date: "27", name: "Halterofilia", time: "18:00", room: "Box", coach: FRANCO, spots: "8/12" },
    { day: "SÁB", date: "28", name: "Open Box", time: "10:00", room: "Box", coach: DIEGO, spots: "14/24" },
  ],
  pilates: [
    { day: "HOY", date: "25", name: "Pilates Reformer", time: "18:00", room: "Estudio", coach: ROMINA, spots: "7/8" },
    { day: "JUE", date: "26", name: "Funcional suave", time: "09:00", room: "Sala 1", coach: DIEGO, spots: "10/16" },
    { day: "SÁB", date: "28", name: "Reformer Flow", time: "11:00", room: "Estudio", coach: ROMINA, spots: "6/8" },
  ],
};

function attLabel(a: number) {
  if (a > 85) return "Alta constancia";
  if (a > 60) return "Constancia media";
  if (a > 0) return "Baja asistencia";
  return "Inactivo";
}

/** Ids de la demo para generateStaticParams de cada pestaña de la ficha. */
export const memberParams = () => MEMBERS.map((m) => ({ id: m.id }));
