/* Asistencia detallada del socio. Se deriva del mismo mapa de 16 semanas de la ficha (getProfile)
   para que visitas, rachas y horarios coincidan con el Resumen. */
import { COACHES, dayMs, MONTHS, NOW_MIN, rng, routineKey, TODAY, type Profile } from "./profile";

export type VisitKind = "clase" | "libre";
export type Visit = {
  date: string; // ISO
  day: number; // día del mes
  month: number;
  dow: number; // 0 = lunes
  daysAgo: number;
  time: string; // HH:MM de ingreso
  out: string | null; // HH:MM de salida (null = en curso)
  minutes: number;
  kind: VisitKind;
  className?: string;
  coach?: { name: string; face: number };
  access: "QR app" | "Credencial NFC" | "DNI manual";
  door: string;
  level: number;
};

export type CalendarDay = { day: number; dow: number; visit?: Visit; future: boolean; today: boolean };

/** Franjas horarias (mismas 6 que el Resumen). */
export const BANDS = ["06–09", "09–12", "12–15", "15–18", "18–21", "21–23"] as const;
const BAND_START = [6, 9, 12, 15, 18, 21];
const BAND_LEN = [3, 3, 3, 3, 3, 2];

/** Promedios de la sede (Sede Centro, últimas 16 semanas). */
export const GYM_AVG = { perWeek: 2.6, minutes: 61, attendance: 64, classShare: 41 };

const CLASS_POOL = {
  default: [
    { name: "Funcional HIIT", coach: COACHES[1] },
    { name: "Movilidad + Core", coach: COACHES[0] },
    { name: "Open Box", coach: COACHES[2] },
  ],
  cross: [
    { name: "WOD · CrossTraining", coach: COACHES[2] },
    { name: "Halterofilia", coach: COACHES[2] },
    { name: "Open Box", coach: COACHES[0] },
  ],
  pilates: [
    { name: "Pilates Reformer", coach: COACHES[1] },
    { name: "Funcional suave", coach: COACHES[0] },
    { name: "Reformer Flow", coach: COACHES[1] },
  ],
};

function classShare(plan: string) {
  if (plan.includes("Cross")) return 0.82;
  if (plan.startsWith("Pilates")) return 0.9;
  if (plan.includes("Pilates")) return 0.66;
  if (plan.startsWith("Musculación")) return 0.12;
  return 0.36;
}

const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export function getAttendance(p: Profile) {
  const m = p.member;
  const r = rng(Number(m.id) * 104_729);
  const usual = Number(p.stats.usualHour.slice(0, 2));
  const usualBand = Math.max(0, BAND_START.findLastIndex((h) => usual >= h));
  const weights = p.hourPref.map((v, k) => v * (k === usualBand ? 2.6 : 1));
  const wSum = weights.reduce((a, b) => a + b, 0);
  const share = classShare(m.plan);
  const pool = CLASS_POOL[routineKey(m.plan)];
  const todayIn = /^\d{1,2}:\d{2}$/.test(m.lastCheckIn) ? m.lastCheckIn : null;

  const visits: Visit[] = [];
  p.heat.weeks.forEach((week) =>
    week.forEach((c, dow) => {
      if (c.level === 0 || c.future) return;
      const d = new Date(c.date + "T00:00:00Z");
      const daysAgo = Math.round((TODAY.getTime() - d.getTime()) / dayMs);
      // franja: ponderada por la preferencia horaria, sesgada al horario habitual
      let x = r() * wSum;
      let band = 0;
      while (band < 5 && x > weights[band]) x -= weights[band++];
      let start =
        band === usualBand ? usual * 60 + Math.round((r() - 0.35) * 50) : BAND_START[band] * 60 + Math.round(r() * BAND_LEN[band] * 55);
      if (dow >= 5 && start < 9 * 60) start += 120; // fines de semana más tarde
      const isToday = daysAgo === 0 && todayIn;
      if (isToday) start = Number(todayIn.slice(0, 2)) * 60 + Number(todayIn.slice(3));
      const roll = r();
      const isClass = !isToday && roll < share; // hoy 07:12: sala libre (Día C de la rutina)
      const cls = pool[Math.floor(r() * pool.length)];
      const minutes = isToday ? NOW_MIN - start : c.minutes;
      visits.push({
        date: c.date,
        day: d.getUTCDate(),
        month: d.getUTCMonth(),
        dow,
        daysAgo,
        time: hhmm(start),
        out: isToday ? null : hhmm(start + minutes),
        minutes,
        kind: isClass ? "clase" : "libre",
        className: isClass ? cls.name : undefined,
        coach: isClass ? cls.coach : undefined,
        access: r() < 0.72 ? "QR app" : r() < 0.8 ? "Credencial NFC" : "DNI manual",
        door: r() < 0.6 ? "Molinete 1" : "Molinete 2",
        level: c.level,
      });
    }),
  );

  /* ── Calendario del mes en curso (noviembre) ── */
  const month = TODAY.getUTCMonth();
  const year = TODAY.getUTCFullYear();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const firstDow = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const byDate = new Map(visits.map((v) => [v.date, v]));
  const calendar: CalendarDay[] = Array.from({ length: daysInMonth }, (_, k) => {
    const d = new Date(Date.UTC(year, month, k + 1));
    const iso = d.toISOString().slice(0, 10);
    return { day: k + 1, dow: (d.getUTCDay() + 6) % 7, visit: byDate.get(iso), future: d > TODAY, today: k + 1 === TODAY.getUTCDate() };
  });
  const monthVisits = visits.filter((v) => v.month === month);
  const prevMonthVisits = visits.filter((v) => v.month === month - 1);
  // en octubre a la misma altura del mes (1 al 25)
  const prevToDate = prevMonthVisits.filter((v) => v.day <= TODAY.getUTCDate()).length;

  /* ── Patrón día × franja ── */
  const punch = Array.from({ length: 7 }, () => Array(6).fill(0) as number[]);
  visits.forEach((v) => {
    const h = Number(v.time.slice(0, 2));
    const b = Math.max(0, BAND_START.findLastIndex((s) => h >= s));
    punch[v.dow][b]++;
  });
  const bandTotals = BANDS.map((_, b) => punch.reduce((a, row) => a + row[b], 0));
  const dowTotals = punch.map((row) => row.reduce((a, b) => a + b, 0));
  const topBand = bandTotals.indexOf(Math.max(...bandTotals));
  const topDow = dowTotals.indexOf(Math.max(...dowTotals));

  /* ── Semanas (rachas) ── */
  const weeks = p.heat.weeks.map((wk, w) => {
    const start = new Date(wk[0].date + "T00:00:00Z");
    return {
      label: `${start.getUTCDate()} ${MONTHS[start.getUTCMonth()]}`,
      count: wk.filter((c) => c.level > 0).length,
      current: w === p.heat.weeks.length - 1,
    };
  });

  /* ── Clases vs. musculación libre ── */
  const classVisits = visits.filter((v) => v.kind === "clase");
  const byClass = pool
    .map((c) => ({ ...c, count: classVisits.filter((v) => v.className === c.name).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const elapsedWeeks = p.heat.weeks.length - 1 + 3 / 7;
  const perWeek = visits.length / elapsedWeeks;
  const avgMinutes = Math.round(visits.filter((v) => v.out).reduce((a, v) => a + v.minutes, 0) / Math.max(1, visits.filter((v) => v.out).length));
  const classPct = Math.round((classVisits.length / Math.max(1, visits.length)) * 100);
  // percentil aproximado dentro de la sede según constancia
  const top = Math.max(3, Math.min(97, Math.round(100 - m.attendance * 0.96)));

  return {
    visits: [...visits].reverse(),
    calendar,
    firstDow,
    monthLabel: `${["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][month]} ${year}`,
    monthCount: monthVisits.length,
    prevToDate,
    monthMinutes: monthVisits.reduce((a, v) => a + v.minutes, 0),
    punch,
    bandTotals,
    topBand,
    topDow,
    weeks,
    classCount: classVisits.length,
    freeCount: visits.length - classVisits.length,
    classPct,
    byClass,
    perWeek,
    avgMinutes,
    top,
    inProgress: visits.find((v) => v.out === null) ?? null,
    /** Reservas de clases a las que no se presentó (mismo período). */
    noShows: Math.round(classVisits.length * (1 - m.attendance / 100) * 0.35 + (Number(m.id) % 2)),
  };
}

export type Attendance = ReturnType<typeof getAttendance>;
export const DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const DOW_LONG = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábados", "domingos"];
