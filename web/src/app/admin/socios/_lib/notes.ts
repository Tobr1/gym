/* Notas del staff sobre el socio. Incluye las notas que ya aparecen en la línea de tiempo del Resumen. */
import { DEBTORS } from "../../caja/_data";
import { COACH_NOTE, routineKey, type Profile } from "./profile";

export type NoteTag = "Entrenamiento" | "Salud" | "Cobranza" | "Retención" | "Evaluación" | "Administrativo";
export type Author = { name: string; face: number; role: string };
export type Note = {
  id: string;
  author: Author;
  body: string;
  tags: NoteTag[];
  when: string; // texto relativo
  date: string; // "23 nov"
  month: string; // agrupador
  pinned?: boolean;
  visibleToMember?: boolean;
  reactions?: number;
};

export const NOTE_TAGS: { tag: NoteTag; color: string }[] = [
  { tag: "Entrenamiento", color: "var(--color-lime)" },
  { tag: "Salud", color: "var(--color-rose)" },
  { tag: "Evaluación", color: "var(--color-violet)" },
  { tag: "Retención", color: "var(--color-cyan)" },
  { tag: "Cobranza", color: "var(--color-amber)" },
  { tag: "Administrativo", color: "#c9d4e2" },
];
export const TAG_COLOR = Object.fromEntries(NOTE_TAGS.map((t) => [t.tag, t.color])) as Record<NoteTag, string>;

/** Quien escribe desde el panel (topbar del admin). */
export const ME: Author = { name: "Carolina Vidal", face: 12, role: "Administradora" };
const RECEPCION: Author = { name: "Lucas Ferreyra", face: 3, role: "Recepción" };
const NUTRI: Author = { name: "Lic. Paula Ortiz", face: 2, role: "Nutricionista" };

export function getNotes(p: Profile): Note[] {
  const m = p.member;
  const key = routineKey(m.plan);
  const coach: Author = { ...p.routine.coach, role: "Coach" };
  const first = m.name.split(" ")[0];
  const notes: Note[] = [];

  if (m.status === "vencido") {
    const d = DEBTORS.find((x) => x.id === m.id);
    notes.push({
      id: "n-deuda",
      author: ME,
      body: `Cuota vencida el ${p.dueLabel}. ${d?.reminded ?? "Recordatorio enviado"} por WhatsApp. El cobro con crédito de hoy 07:51 fue rechazado: ofrecer Mercado Pago o débito antes de las 17:00 para no liberar sus cupos.`,
      tags: ["Cobranza", "Retención"],
      when: "Hoy · 08:12",
      date: "25 nov",
      month: "Noviembre",
      pinned: true,
    });
  }
  if (m.status === "congelado") {
    notes.push({
      id: "n-licencia",
      author: RECEPCION,
      body: `Pidió congelar por viaje laboral hasta el 15 dic. Se le aplican los 28 días a favor al reactivar. Agendar llamada el 12 dic para confirmar la vuelta y reservar Reformer.`,
      tags: ["Administrativo", "Retención"],
      when: "Hace 21 días",
      date: "04 nov",
      month: "Noviembre",
      pinned: true,
    });
  }
  if (m.status === "por-vencer") {
    notes.push({
      id: "n-renov",
      author: ME,
      body: `Vence el ${p.dueLabel}. Le interesa pasar al plan trimestral con 10% off: dejar el cobro listo en caja cuando venga.`,
      tags: ["Cobranza", "Retención"],
      when: "Ayer · 19:40",
      date: "24 nov",
      month: "Noviembre",
      pinned: true,
    });
  }

  notes.push(
    {
      id: "n-health",
      author: coach,
      body: `${p.health.restrictions[0]}. ${p.health.notes[0]}: avisar si hay síntomas durante el entrenamiento.`,
      tags: ["Salud"],
      when: "Fijada · 14 ago",
      date: "14 ago",
      month: "Agosto",
      pinned: true,
    },
    {
      id: "n-coach",
      author: coach,
      body: COACH_NOTE[key][p.female ? 0 : 1],
      tags: ["Entrenamiento"],
      when: "Hace 2 días",
      date: "23 nov",
      month: "Noviembre",
      visibleToMember: true,
      reactions: 1,
    },
    {
      id: "n-eval",
      author: coach,
      body: `Evaluación de noviembre: ${p.body.weight.at(-1)!.toLocaleString("es-AR")} kg · ${p.body.fat.at(-1)!.toLocaleString("es-AR")} % de grasa. Buena tendencia; mantenemos la fase de acumulación hasta la semana 8 y reevaluamos el ${p.body.nextEval}.`,
      tags: ["Evaluación"],
      when: `${p.body.lastEval} · 10:30`,
      date: p.body.lastEval,
      month: "Noviembre",
      visibleToMember: true,
    },
    {
      id: "n-nutri",
      author: NUTRI,
      body: p.female
        ? `Ajustamos proteína a 1,8 g/kg y sumamos una colación pre-entreno. ${first} reporta mejor energía en las sesiones de la mañana.`
        : `Superávit leve (+250 kcal) los días de pierna. ${first} viene cumpliendo el registro en la app 5 de 7 días.`,
      tags: ["Salud", "Evaluación"],
      when: "02 nov",
      date: "02 nov",
      month: "Noviembre",
    },
    {
      id: "n-ret",
      author: RECEPCION,
      body: m.attendance > 80
        ? `Muy constante. Le ofrecimos el plan anual (−15%), lo va a pensar después de las fiestas. Refirió a 2 amigas este año.`
        : `Bajó la frecuencia en octubre por trabajo. Le sugerimos el turno de las 07:00, que le queda más cómodo.`,
      tags: ["Retención"],
      when: "16 oct",
      date: "16 oct",
      month: "Octubre",
    },
    {
      id: "n-plan",
      author: ME,
      body: `Upgrade de Musculación 2x a ${m.plan} sin cargo de alta. Se actualizó el débito y se envió la nueva credencial a la app.`,
      tags: ["Administrativo"],
      when: "14 ago",
      date: "14 ago",
      month: "Agosto",
    },
    {
      id: "n-eval0",
      author: coach,
      body: `Evaluación de agosto: ${p.body.weight[3].toLocaleString("es-AR")} kg · ${p.body.fat[3].toLocaleString("es-AR")} % de grasa. Objetivo actualizado: ${p.body.goal.toLowerCase()}.`,
      tags: ["Evaluación"],
      when: "02 ago",
      date: "02 ago",
      month: "Agosto",
    },
  );
  return notes;
}
