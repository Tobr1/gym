/* Rutina asignada al socio, en detalle (días → bloques → ejercicios).
   Ejercicios y bloques salen de la biblioteca del constructor (/admin/rutinas); los días, la semana del
   mesociclo, la adherencia y las cargas coinciden con la ficha (getProfile) y su asistencia. */
import { EX_BY_ID, type BlockKind, type Muscle } from "../../rutinas/_components/data";
import { PHOTO } from "@/lib/photos";
import { DOW, type Attendance } from "./attendance";
import { COACH_NOTE, rng, routineKey, type Profile } from "./profile";

export type RxItem = {
  name: string;
  muscle: Muscle;
  equipment: string;
  photo: string;
  sets: number;
  reps: string;
  load: string; // "70 kg", "Corporal", "2 resortes"
  rest: number; // s
  rpe: number;
  last?: string; // registro de la última sesión
  trend?: "up" | "same" | "down";
  cue?: string; // indicación del coach
};
export type RxBlock = { kind: BlockKind; items: RxItem[] };
export type RxDay = { key: string; name: string; focus: string; minutes: number; blocks: RxBlock[]; photo: string };

/* Ejercicios fuera de la biblioteca del constructor */
const X = {
  goblet: { name: "Sentadilla goblet", muscle: "Piernas", equipment: "Kettlebell", photo: PHOTO.dumbbells(240, 240) },
  remo1: { name: "Remo a un brazo", muscle: "Espalda", equipment: "Mancuerna", photo: PHOTO.row(240, 240) },
  pmr: { name: "Peso muerto rumano", muscle: "Piernas", equipment: "Barra", photo: PHOTO.deadlift(240, 240) },
  abd: { name: "Abducción en máquina", muscle: "Glúteos", equipment: "Máquina", photo: PHOTO.machine(240, 240) },
  swing: { name: "Swing con kettlebell", muscle: "Glúteos", equipment: "Kettlebell", photo: PHOTO.coach(240, 240) },
  asistidas: { name: "Dominadas asistidas", muscle: "Espalda", equipment: "Banda", photo: PHOTO.pullup(240, 240) },
  clean: { name: "Power clean", muscle: "Piernas", equipment: "Barra", photo: PHOTO.barbell(240, 240) },
  amrap: { name: "AMRAP 14' · burpees + wall balls", muscle: "Core", equipment: "Balón medicinal", photo: PHOTO.classRopes(240, 240) },
  hspu: { name: "Handstand push-up", muscle: "Hombros", equipment: "Pared", photo: PHOTO.shoulder(240, 240) },
  t2b: { name: "Toes to bar", muscle: "Core", equipment: "Barra fija", photo: PHOTO.pullup(240, 240) },
  bike: { name: "Assault bike · intervalos", muscle: "Piernas", equipment: "Air bike", photo: PHOTO.machine(240, 240) },
  burpees: { name: "Burpees", muscle: "Core", equipment: "Peso corporal", photo: PHOTO.pushup(240, 240) },
  hundred: { name: "The Hundred", muscle: "Core", equipment: "Reformer", photo: PHOTO.yoga(240, 240) },
  footwork: { name: "Footwork en reformer", muscle: "Piernas", equipment: "Reformer", photo: PHOTO.focusWoman(240, 240) },
  bridge: { name: "Puente de hombros", muscle: "Glúteos", equipment: "Colchoneta", photo: PHOTO.backWoman(240, 240) },
  rollup: { name: "Roll up", muscle: "Core", equipment: "Colchoneta", photo: PHOTO.yoga(240, 240) },
  long: { name: "Long stretch", muscle: "Hombros", equipment: "Reformer", photo: PHOTO.shoulder(240, 240) },
  side: { name: "Side kick series", muscle: "Glúteos", equipment: "Colchoneta", photo: PHOTO.classRopes(240, 240) },
  swan: { name: "Swan", muscle: "Espalda", equipment: "Reformer", photo: PHOTO.backWoman(240, 240) },
  mermaid: { name: "Mermaid", muscle: "Core", equipment: "Reformer", photo: PHOTO.yoga(240, 240) },
  feet: { name: "Feet in straps", muscle: "Piernas", equipment: "Reformer", photo: PHOTO.focusWoman(240, 240) },
} satisfies Record<string, Pick<RxItem, "name" | "muscle" | "equipment" | "photo">>;

type Base = Pick<RxItem, "name" | "muscle" | "equipment" | "photo">;
const lib = (id: string): Base => {
  const e = EX_BY_ID[id];
  return { name: e.name, muscle: e.muscle, equipment: e.equipment, photo: e.photo };
};
const it = (b: Base, sets: number, reps: string, load: string, rest: number, rpe: number, extra: Partial<RxItem> = {}): RxItem => ({ ...b, sets, reps, load, rest, rpe, ...extra });
const B = (kind: BlockKind, ...items: RxItem[]): RxBlock => ({ kind, items });

function plan(p: Profile): RxDay[] {
  const key = routineKey(p.member.plan);
  const days = p.routine.days;
  const f = p.female;
  const D = (k: number, photo: string, ...blocks: RxBlock[]): RxDay => ({ key: days[k].key, name: days[k].name, focus: days[k].focus, minutes: days[k].minutes, photo, blocks });

  if (key === "cross") {
    return [
      D(0, PHOTO.barbell(900, 360),
        B("warmup", it(lib("remo-ergo"), 1, "1.000 m", "Ritmo suave", 60, 5)),
        B("main",
          it(lib("sentadilla"), 5, "3", f ? "55 kg" : "92,5 kg", 150, 8, { last: f ? "55 × 3 · 3 · 3 · 3 · 3" : "90 × 3 · 3 · 3 · 3 · 3", trend: "up" }),
          it(X.clean, 5, "2", f ? "40 kg" : "65 kg", 120, 8, { last: f ? "37,5 × 2 · 2 · 2 · 2 · 1" : "65 × 2 · 2 · 2 · 2 · 2", trend: f ? "same" : "up", cue: "Recepción alta, codos rápidos" })),
        B("superset", it(X.amrap, 1, "14 min", f ? "6 kg" : "9 kg", 0, 9, { last: f ? "6 rondas + 8" : "8 rondas + 3", trend: "up" })),
        B("core", it(lib("plancha"), 3, "45 s", "Corporal", 30, 7))),
      D(1, PHOTO.pullup(900, 360),
        B("warmup", it(lib("movilidad"), 2, "8 / lado", "Corporal", 30, 5)),
        B("main",
          it(lib("dominadas"), 5, "máx.", f ? "Banda verde" : "Corporal", 120, 9, { last: f ? "6 · 5 · 5 · 4 · 4" : "14 · 12 · 11 · 10 · 9", trend: "up" }),
          it(X.hspu, 4, "5", f ? "Con abmat" : "Estricto", 120, 8, { last: f ? "4 · 4 · 3 · 3" : "5 · 5 · 5 · 4", trend: "same" })),
        B("superset", it(lib("fondos"), 3, "10", "Corporal", 0, 8), it(lib("flexiones"), 3, "15", "Corporal", 60, 8)),
        B("core", it(X.t2b, 4, "8", "Corporal", 60, 8, { last: "8 · 8 · 7 · 6", trend: "same" }))),
      D(2, PHOTO.ropes(900, 360),
        B("main", it(lib("remo-ergo"), 5, "500 m", "Ritmo 2:05", 90, 8), it(X.bike, 8, "20 s", "Máx. watts", 40, 9)),
        B("superset", it(lib("ropes"), 6, "30 s", "Sogas 12 m", 0, 8), it(X.burpees, 4, "12", "Corporal", 60, 8))),
    ];
  }
  if (key === "pilates") {
    return [
      D(0, PHOTO.yoga(900, 360),
        B("warmup", it(X.hundred, 1, "100 pulsos", "1 rojo", 0, 5), it(X.feet, 2, "10", "2 rojos", 30, 5)),
        B("main",
          it(X.footwork, 3, "10", "3 rojos + 1 azul", 30, 6, { last: "3 × 10 · 3 rojos", trend: "up" }),
          it(X.long, 3, "8", "1 rojo", 30, 7, { cue: "Escápulas estables, pelvis neutra" }),
          it(X.swan, 2, "8", "1 azul", 30, 6)),
        B("superset", it(X.bridge, 3, "15", "Corporal", 0, 7, { last: "3 × 15", trend: "up" }), it(X.side, 2, "10 / lado", "Tobilleras 1 kg", 30, 6)),
        B("core", it(lib("plancha"), 3, "75 s", "Corporal", 30, 7, { last: "75 · 70 · 65 s", trend: "up" }), it(X.mermaid, 2, "6 / lado", "1 azul", 0, 4))),
      D(1, PHOTO.focusWoman(900, 360),
        B("warmup", it(lib("movilidad"), 2, "8 / lado", "Corporal", 30, 5)),
        B("main", it(X.goblet, 3, "12", "12 kg", 60, 7), it(lib("estocadas"), 3, "10 / lado", "6 kg", 60, 7), it(X.remo1, 3, "12", "8 kg", 60, 7)),
        B("superset", it(X.swing, 3, "15", "12 kg", 0, 7), it(lib("flexiones"), 3, "8", "Corporal", 60, 7)),
        B("core", it(X.rollup, 2, "10", "Colchoneta", 30, 6, { last: "2 × 10", trend: "up" }))),
      D(2, PHOTO.backWoman(900, 360),
        B("warmup", it(X.hundred, 1, "100 pulsos", "1 rojo", 0, 5)),
        B("main", it(X.footwork, 3, "10", "3 rojos", 30, 6), it(X.feet, 3, "10", "2 rojos", 30, 6), it(X.long, 3, "8", "1 rojo", 30, 7)),
        B("superset", it(X.swan, 2, "8", "1 azul", 0, 6), it(X.mermaid, 2, "6 / lado", "1 azul", 30, 4)),
        B("core", it(X.rollup, 2, "10", "Colchoneta", 30, 6), it(X.side, 2, "10 / lado", "Tobilleras 1 kg", 30, 6))),
    ];
  }
  if (f) {
    return [
      D(0, PHOTO.dumbbells(900, 360),
        B("warmup", it(lib("remo-ergo"), 1, "5 min", "Ritmo suave", 0, 5)),
        B("main",
          it(lib("inclinado"), 4, "10", "12 kg", 90, 8, { last: "12 × 10 · 10 · 9 · 8", trend: "up" }),
          it(X.remo1, 4, "10", "16 kg", 90, 8, { last: "16 × 10 · 10 · 10 · 10", trend: "up", cue: "Subir a 18 kg la próxima semana" })),
        B("superset", it(lib("militar"), 3, "10", "20 kg", 0, 8, { last: "20 × 10 · 9 · 8", trend: "same" }), it(lib("laterales"), 3, "15", "5 kg", 75, 9)),
        B("core", it(lib("curl"), 3, "12", "7 kg", 45, 8), it(lib("plancha"), 3, "40 s", "Corporal", 30, 7))),
      D(1, PHOTO.focusWoman(900, 360),
        B("warmup", it(lib("movilidad"), 2, "8 / lado", "Corporal", 30, 5)),
        B("main",
          it(lib("hip-thrust"), 3, "10", "70 kg", 120, 8, { last: "70 × 10 · 10 · 10", trend: "up", cue: "Próxima semana: 4 × 8 con 80 kg" }),
          it(X.goblet, 4, "10", "24 kg", 90, 8, { last: "24 × 10 · 10 · 9 · 9", trend: "up" })),
        B("superset", it(lib("estocadas"), 3, "10 / lado", "10 kg", 0, 8, { cue: "Sin impacto: rodilla izquierda" }), it(X.pmr, 3, "10", "40 kg", 90, 8, { last: "40 × 10 · 10 · 10", trend: "same" })),
        B("core", it(X.abd, 3, "15", "35 kg", 45, 8))),
      D(2, PHOTO.ropes(900, 360),
        B("warmup", it(lib("remo-ergo"), 1, "6 min", "Ritmo medio", 0, 6)),
        B("main", it(lib("sentadilla"), 4, "6", "45 kg", 120, 8, { last: "45 × 6 · 6 · 6 · 5", trend: "up" }), it(lib("remo"), 3, "10", "30 kg", 90, 8)),
        B("superset", it(X.swing, 3, "15", "16 kg", 0, 8), it(lib("flexiones"), 3, "10", "Corporal", 60, 8), it(X.asistidas, 3, "8", "Banda verde", 60, 8)),
        B("core", it(lib("ropes"), 4, "30 s", "Sogas 12 m", 30, 8), it(lib("plancha"), 3, "45 s", "Corporal", 30, 7))),
    ];
  }
  return [
    D(0, PHOTO.bench(900, 360),
      B("warmup", it(lib("remo-ergo"), 1, "5 min", "Ritmo suave", 0, 5)),
      B("main",
        it(lib("banca"), 4, "6", "75 kg", 150, 8, { last: "75 × 6 · 6 · 6 · 5", trend: "up" }),
        it(lib("dominadas"), 4, "8", "+10 kg", 120, 8, { last: "+10 × 8 · 8 · 7 · 6", trend: "same" })),
      B("superset", it(lib("militar"), 3, "8", "45 kg", 0, 8), it(lib("remo"), 3, "10", "70 kg", 90, 8, { last: "70 × 10 · 10 · 9", trend: "up" })),
      B("core", it(lib("laterales"), 3, "15", "10 kg", 45, 9), it(lib("fondos"), 3, "AMRAP", "Corporal", 60, 9))),
    D(1, PHOTO.barbell(900, 360),
      B("warmup", it(lib("movilidad"), 2, "8 / lado", "Corporal", 30, 5)),
      B("main",
        it(lib("sentadilla"), 5, "5", "97,5 kg", 180, 8, { last: "97,5 × 5 · 5 · 5 · 5 · 4", trend: "up", cue: "Trabajo de movilidad de tobillo antes" }),
        it(lib("peso-muerto"), 3, "5", "125 kg", 180, 8, { last: "125 × 5 · 5 · 5", trend: "up" })),
      B("superset", it(lib("estocadas"), 3, "10 / lado", "20 kg", 0, 8), it(lib("hip-thrust"), 3, "10", "100 kg", 90, 8)),
      B("core", it(lib("plancha"), 3, "45 s", "10 kg", 45, 7))),
    D(2, PHOTO.gymFloor(900, 360),
      B("warmup", it(lib("remo-ergo"), 1, "6 min", "Ritmo medio", 0, 6)),
      B("main", it(lib("inclinado"), 3, "10", "28 kg", 90, 8), it(lib("remo-polea"), 3, "12", "60 kg", 90, 8)),
      B("superset", it(X.swing, 3, "15", "24 kg", 0, 8), it(lib("flexiones"), 3, "15", "Corporal", 60, 8), it(lib("curl"), 3, "12", "14 kg", 60, 8)),
      B("core", it(lib("ropes"), 4, "30 s", "Sogas 15 m", 30, 8), it(lib("plancha"), 3, "45 s", "Corporal", 30, 7))),
  ];
}

const sumSets = (d: RxDay) => d.blocks.reduce((a, b) => a + b.items.reduce((x, i) => x + i.sets, 0), 0);
const kg = (load: string) => {
  const m = load.match(/^\+?([\d,]+)\s*kg$/);
  return m ? Number(m[1].replace(",", ".")) : 0;
};
const reps = (r: string) => {
  const m = r.match(/^(\d+)/);
  return m && !/s$|min|m$/.test(r) ? Number(m[1]) : 0;
};

export function getRoutine(p: Profile, a: Attendance) {
  const days = plan(p);
  const hold = p.bookingsOnHold;
  const frozen = p.member.status === "congelado";
  const r = rng(Number(p.member.id) * 31_337);
  const adh = p.routine.adherence;

  /* Semanas del mesociclo: planificadas 3, hechas según adherencia y estado */
  const weeks = Array.from({ length: p.routine.weeks }, (_, k) => {
    const w = k + 1;
    if (w > p.routine.week) return { w, done: 0, planned: 3, state: "future" as const };
    if (w === p.routine.week) return { w, done: hold ? 0 : p.routine.days.filter((d) => d.done).length, planned: 3, state: "current" as const };
    let done = Math.max(0, Math.min(3, Math.round((3 * adh) / 100 + (r() - 0.5) * 1.1)));
    if (frozen && w >= p.routine.week - 2) done = 0;
    if (p.member.status === "vencido" && w === p.routine.week - 1) done = 1;
    return { w, done, planned: 3, state: "past" as const };
  });

  /* Volumen semanal por grupo muscular (series) */
  const vol = new Map<Muscle, number>();
  days.forEach((d) => d.blocks.forEach((b) => b.items.forEach((i) => vol.set(i.muscle, (vol.get(i.muscle) ?? 0) + i.sets))));
  const volume = [...vol.entries()].sort((x, y) => y[1] - x[1]).map(([muscle, sets]) => ({ muscle, sets }));

  /* Últimas sesiones: días de musculación libre (o cualquiera si no hay) rotando A/B/C hacia atrás */
  const gymVisits = a.visits.filter((v) => v.kind === "libre" || routineKey(p.member.plan) !== "default");
  const order = ["C", "B", "A"];
  const sessions = gymVisits.slice(0, 5).map((v, k) => {
    const dayKey = hold ? order[(k + 1) % 3] : order[k % 3];
    const d = days.find((x) => x.key === dayKey) ?? days[0];
    const volumeKg = d.blocks.reduce((acc, b) => acc + b.items.reduce((x, i) => x + i.sets * reps(i.reps) * kg(i.load), 0), 0);
    const live = v.out === null;
    const total = sumSets(d);
    const doneSets = live ? Math.round(total * 0.62) : total - (k === 2 ? 2 : 0);
    const top = d.blocks.find((b) => b.kind === "main")?.items[0];
    return {
      date: v.date,
      when: v.daysAgo === 0 ? "Hoy" : v.daysAgo === 1 ? "Ayer" : `${DOW[v.dow]} ${v.day}/${String(v.month + 1).padStart(2, "0")}`,
      daysAgo: v.daysAgo,
      time: v.time,
      day: d,
      minutes: v.minutes,
      live,
      volume: Math.round(volumeKg * (doneSets / total)),
      sets: `${doneSets}/${total}`,
      rpe: (7.4 + ((k * 3 + Number(p.member.id)) % 9) / 10).toLocaleString("es-AR", { maximumFractionDigits: 1 }),
      top: top ? { name: top.name, last: top.last ?? `${top.load} × ${top.reps}` } : null,
      pr: k === (gymVisits[0]?.out === null ? 1 : 0) && top?.trend === "up" && top.load.includes("kg") ? `${top.name} · ${top.load}` : undefined,
      note: k === 1 ? COACH_NOTE[routineKey(p.member.plan)][p.female ? 0 : 1] : undefined,
    };
  });

  /* Próximo día a entrenar: el primero sin completar de la semana en curso */
  const nextKey = p.routine.days.find((d) => !d.done)?.key ?? "A";

  return { key: routineKey(p.member.plan), days, weeks, volume, sessions, nextKey, totalSets: days.reduce((x, d) => x + sumSets(d), 0) };
}

export type Routine = ReturnType<typeof getRoutine>;
