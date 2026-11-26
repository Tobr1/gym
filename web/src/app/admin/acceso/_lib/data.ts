/* Datos de demostración del control de acceso. */
import { getProfile } from "@/app/admin/socios/_lib/profile";

export type AccessState = "ok" | "vencida" | "por-vencer";

export type Person = {
  id: string;
  name: string;
  face: number;
  plan: string;
  dni: string;
  daysLeft: number; // negativo = vencida
  due: string;
  debt: number;
  monthVisits: number;
  streak: number;
};

/* Los datos salen de la misma ficha integral del socio para que DNI, racha y visitas coincidan en todo el producto. */
const mk = (id: string): Person => {
  const p = getProfile(id)!;
  const m = p.member;
  return {
    id,
    name: m.name,
    face: m.face,
    plan: m.plan,
    dni: p.dni,
    daysLeft: p.daysLeft,
    due: m.due,
    debt: p.debt,
    monthVisits: p.stats.monthVisits,
    streak: p.stats.streak,
  };
};

export const PEOPLE: Person[] = ["1042", "1046", "1049", "1044", "1051", "1050", "1045", "1043"].map(mk);

export const stateOf = (p: Person): AccessState => (p.daysLeft < 0 ? "vencida" : p.daysLeft <= 3 ? "por-vencer" : "ok");

export const DOORS = ["Molinete 1", "Molinete 2", "Puerta lateral"] as const;
export const METHODS = ["QR app", "Credencial NFC", "DNI manual"] as const;

export type Scan = {
  person: Person;
  state: AccessState;
  door: (typeof DOORS)[number];
  method: (typeof METHODS)[number];
};

/** Secuencia de la demo automática. */
export const SEQUENCE: Scan[] = [
  { person: PEOPLE[0], state: "ok", door: "Molinete 1", method: "QR app" },
  { person: PEOPLE[1], state: "vencida", door: "Molinete 1", method: "Credencial NFC" },
  { person: PEOPLE[2], state: "ok", door: "Molinete 2", method: "QR app" },
  { person: PEOPLE[3], state: "por-vencer", door: "Molinete 1", method: "QR app" },
  { person: PEOPLE[4], state: "ok", door: "Molinete 2", method: "Credencial NFC" },
  { person: PEOPLE[5], state: "por-vencer", door: "Puerta lateral", method: "QR app" },
  { person: PEOPLE[6], state: "ok", door: "Molinete 1", method: "QR app" },
];

export type FeedItem = {
  key: string;
  name: string;
  face: number;
  plan: string;
  time: string;
  door: string;
  method: string;
  state: AccessState;
};

export const INITIAL_FEED: FeedItem[] = [
  { key: "f1", name: "Nicolás Romero", face: 10, plan: "CrossTraining", time: "08:47:12", door: "Molinete 2", method: "QR app", state: "ok" },
  { key: "f2", name: "Benjamín Acosta", face: 8, plan: "Pase Libre", time: "08:32:40", door: "Molinete 1", method: "Credencial NFC", state: "ok" },
  { key: "f3", name: "Florencia Díaz", face: 12, plan: "Funcional", time: "08:29:05", door: "Molinete 1", method: "QR app", state: "ok" },
  { key: "f4", name: "Camila Pereyra", face: 5, plan: "CrossTraining", time: "08:21:51", door: "Molinete 2", method: "Credencial NFC", state: "vencida" },
  { key: "f5", name: "Mateo Fernández", face: 6, plan: "Musculación 3x", time: "08:15:18", door: "Molinete 1", method: "QR app", state: "ok" },
  { key: "f6", name: "Agustín Medina", face: 13, plan: "Pase Libre", time: "08:09:44", door: "Puerta lateral", method: "DNI manual", state: "ok" },
  { key: "f7", name: "Valentina Ruiz", face: 4, plan: "Funcional + Pilates", time: "07:41:02", door: "Molinete 1", method: "QR app", state: "por-vencer" },
];

/** Reloj de demo: 08:52:10 + n × 37 s. */
export function clock(n: number) {
  const t = 8 * 3600 + 52 * 60 + 10 + n * 37;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return [h, m, s].map((x) => String(x).padStart(2, "0")).join(":");
}

export const CHECKIN_URL = "https://pulso.app/checkin/iron-factory/centro?k=IF-C-7Q2M";
