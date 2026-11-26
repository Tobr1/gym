/* Datos de demostración del CRM. Reemplazar por la capa de datos real. */

export type StageKey = "nuevo" | "contactado" | "prueba" | "negociacion" | "ganado" | "perdido";
export type SourceKey = "instagram" | "web" | "referido" | "walkin" | "whatsapp";
export type Temp = "frio" | "tibio" | "caliente";

export const STAGES: { key: StageKey; label: string; color: string; hint: string }[] = [
  { key: "nuevo", label: "Nuevo contacto", color: "#57D5F2", hint: "Sin contactar" },
  { key: "contactado", label: "Contactado", color: "#9D84FF", hint: "Primer contacto hecho" },
  { key: "prueba", label: "Clase de prueba", color: "#FFBE55", hint: "Agendada o realizada" },
  { key: "negociacion", label: "Negociación", color: "#FF8A4C", hint: "Propuesta enviada" },
  { key: "ganado", label: "Ganado", color: "#B5F54A", hint: "Alta confirmada" },
  { key: "perdido", label: "Perdido", color: "#FF5F7E", hint: "Descartado" },
];
export const STAGE_META = Object.fromEntries(STAGES.map((s) => [s.key, s])) as Record<StageKey, (typeof STAGES)[number]>;

export const SOURCES: { key: SourceKey; label: string; color: string }[] = [
  { key: "instagram", label: "Instagram", color: "#F472B6" },
  { key: "web", label: "Web", color: "#57D5F2" },
  { key: "referido", label: "Referido", color: "#B5F54A" },
  { key: "walkin", label: "Walk-in", color: "#FFBE55" },
  { key: "whatsapp", label: "WhatsApp", color: "#3DDC97" },
];
export const SOURCE_META = Object.fromEntries(SOURCES.map((s) => [s.key, s])) as Record<SourceKey, (typeof SOURCES)[number]>;

export const SELLERS = [
  { id: 0, name: "Lucas Medina", short: "Lucas", face: 13 },
  { id: 1, name: "Paula Ríos", short: "Paula", face: 2 },
  { id: 2, name: "Agustina Ferrari", short: "Agus", face: 14 },
  { id: 3, name: "Diego Paz", short: "Diego", face: 11 },
];

export const PLANS = [
  { label: "Pase Libre · mensual", value: 48_900 },
  { label: "Pase Libre · anual", value: 489_000 },
  { label: "Musculación 3x · trimestral", value: 98_500 },
  { label: "CrossTraining · mensual", value: 44_500 },
  { label: "Funcional + Pilates", value: 42_000 },
  { label: "Pilates Reformer · trimestral", value: 140_400 },
  { label: "Corporativo · 10 pases", value: 389_000 },
  { label: "Personal Trainer · 12 sesiones", value: 156_000 },
];

export type Lead = {
  id: string;
  name: string;
  face?: number;
  source: SourceKey;
  plan: string;
  value: number;
  next: string;
  due: string;
  overdue?: boolean;
  seller: number;
  temp: Temp;
  stage: StageKey;
  age: string;
  fresh?: boolean;
};

const P = Object.fromEntries(PLANS.map((p) => [p.label, p.value]));
const L = (
  id: string,
  stage: StageKey,
  name: string,
  face: number | undefined,
  source: SourceKey,
  plan: string,
  next: string,
  due: string,
  seller: number,
  temp: Temp,
  age: string,
  overdue = false,
): Lead => ({ id, stage, name, face, source, plan, value: P[plan], next, due, seller, temp, age, overdue });

export const LEADS: Lead[] = [
  // Nuevo contacto
  L("l1", "nuevo", "Agustina Molina", 7, "instagram", "Pase Libre · mensual", "Responder DM", "Hoy 12:30", 1, "caliente", "hace 2 h"),
  L("l2", "nuevo", "Federico Ibarra", undefined, "web", "Musculación 3x · trimestral", "Llamar", "Hoy 16:00", 0, "tibio", "hace 5 h"),
  L("l3", "nuevo", "Estudio Contable Ríos", undefined, "web", "Corporativo · 10 pases", "Enviar brochure", "Ayer 18:00", 3, "tibio", "hace 1 d", true),
  L("l4", "nuevo", "Micaela Torres", 9, "whatsapp", "Funcional + Pilates", "Enviar horarios", "Hoy 13:00", 2, "caliente", "hace 40 min"),
  L("l5", "nuevo", "Bruno Cabrera", undefined, "instagram", "CrossTraining · mensual", "Responder DM", "Mañana 10:00", 1, "frio", "hace 1 d"),
  // Contactado
  L("l6", "contactado", "Julieta Navarro", 4, "referido", "Pilates Reformer · trimestral", "Agendar clase", "Hoy 17:30", 2, "caliente", "hace 1 d"),
  L("l7", "contactado", "Santiago Giménez", 6, "walkin", "Pase Libre · anual", "Seguimiento", "Ayer 11:00", 0, "tibio", "hace 3 d", true),
  L("l8", "contactado", "Carla Domínguez", undefined, "whatsapp", "Funcional + Pilates", "Enviar promo", "Jue 09:00", 3, "frio", "hace 4 d"),
  L("l9", "contactado", "Tomás Aguirre", 0, "web", "Personal Trainer · 12 sesiones", "Llamar", "Hoy 19:00", 1, "tibio", "hace 2 d"),
  // Clase de prueba
  L("l10", "prueba", "Lucía Fernández", undefined, "instagram", "CrossTraining · mensual", "Clase de prueba", "Hoy 18:00", 2, "caliente", "hace 2 d"),
  L("l11", "prueba", "Martín Soria", 3, "referido", "Pase Libre · anual", "Feedback post clase", "Ayer 20:00", 0, "caliente", "hace 3 d", true),
  L("l12", "prueba", "Abril Ponce", undefined, "walkin", "Pilates Reformer · trimestral", "Clase de prueba", "Vie 08:00", 3, "tibio", "hace 1 d"),
  L("l13", "prueba", "Gonzalo Ledesma", 10, "whatsapp", "Musculación 3x · trimestral", "Confirmar asistencia", "Mañana 09:00", 1, "tibio", "hace 4 d"),
  // Negociación
  L("l14", "negociacion", "Grupo Andes S.A.", undefined, "referido", "Corporativo · 10 pases", "Enviar propuesta", "Hoy 15:00", 3, "caliente", "hace 5 d"),
  L("l15", "negociacion", "Florencia Vega", 1, "instagram", "Pase Libre · anual", "Cerrar con descuento", "Hoy 20:00", 2, "caliente", "hace 6 d"),
  L("l16", "negociacion", "Ramiro Quiroga", 8, "web", "Personal Trainer · 12 sesiones", "Llamar", "Lun 10:00", 0, "tibio", "hace 7 d", true),
  // Ganado
  L("l17", "ganado", "Paula Sánchez", 5, "referido", "Pase Libre · anual", "Alta completada", "24 nov", 1, "caliente", "6 d"),
  L("l18", "ganado", "Ezequiel Moreno", undefined, "walkin", "Musculación 3x · trimestral", "Alta completada", "23 nov", 0, "caliente", "4 d"),
  L("l19", "ganado", "Natalia Bustos", undefined, "instagram", "Funcional + Pilates", "Alta completada", "21 nov", 2, "tibio", "8 d"),
  // Perdido
  L("l20", "perdido", "Hernán Correa", undefined, "web", "Pase Libre · mensual", "Precio", "20 nov", 0, "frio", "—"),
  L("l21", "perdido", "Daniela Ojeda", undefined, "instagram", "CrossTraining · mensual", "Eligió otro gimnasio", "18 nov", 1, "frio", "—"),
  L("l22", "perdido", "Mauro Villalba", undefined, "walkin", "Pase Libre · mensual", "Se mudó", "15 nov", 3, "frio", "—"),
];

/** Embudo del mes (acumulado). */
export const FUNNEL = [
  { key: "nuevo", label: "Nuevos", short: "Nuevos", value: 186 },
  { key: "contactado", label: "Contactados", short: "Contact.", value: 151 },
  { key: "prueba", label: "Clase de prueba", short: "Prueba", value: 97 },
  { key: "negociacion", label: "Negociación", short: "Negoc.", value: 63 },
  { key: "ganado", label: "Ganados", short: "Ganados", value: 47 },
] as const;

export const EV_NEW_LEAD = "crm:new-lead";
