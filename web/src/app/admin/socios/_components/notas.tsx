import { AlarmClock, CalendarCheck2, HeartPulse, MessageCircle, Target } from "lucide-react";
import { SectionTitle } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { getNotes, ME, NOTE_TAGS, type Author } from "../_lib/notes";
import type { Profile } from "../_lib/profile";
import { Face, s } from "./kit";
import { NotesBoard } from "./notas-board";

export function NotasTab({ p }: { p: Profile }) {
  const notes = getNotes(p);
  const first = p.member.name.split(" ")[0];
  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <NotesBoard initial={notes} tags={NOTE_TAGS} me={ME} member={first} />
      </div>
      <aside className="grid min-w-0 content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
        <ContextCard p={p} />
        <FollowUps p={p} />
        <div className="md:col-span-2 xl:col-span-1">
          <TeamCard authors={notes.map((n) => n.author)} />
        </div>
      </aside>
    </div>
  );
}

/* ── Contexto rápido ──────────────────────────────────────── */
function ContextCard({ p }: { p: Profile }) {
  const b = p.bookings[0];
  const rows = [
    { icon: Target, c: "text-violet bg-violet/12", l: "Objetivo", v: p.body.goal },
    { icon: HeartPulse, c: "text-rose bg-rose/12", l: "Salud", v: `${p.health.restrictions[0]} · ${p.health.notes[0]}` },
    p.bookingsOnHold
      ? { icon: CalendarCheck2, c: "text-muted bg-white/[0.05]", l: "Reservas", v: p.member.status === "congelado" ? "En pausa hasta el 15 dic" : "Suspendidas hasta regularizar la cuota" }
      : { icon: CalendarCheck2, c: "text-lime bg-lime/12", l: "Próxima clase", v: `${b.name} · hoy ${b.time} · ${b.room}` },
    { icon: MessageCircle, c: "text-emerald bg-emerald/12", l: "Último contacto", v: p.member.status === "vencido" ? "Recordatorio por WhatsApp · hoy 09:00" : "WhatsApp · hace 2 días" },
  ];
  return (
    <article className="panel stagger p-5" style={s(3)}>
      <SectionTitle title="Antes de escribir" hint="Lo que el equipo tiene que saber" />
      <ul className="mt-4 space-y-3">
        {rows.map((r) => (
          <li key={r.l} className="flex gap-3">
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", r.c)}>
              <r.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-faint">{r.l}</p>
              <p className="text-[12.5px] font-semibold leading-snug text-fg-2">{r.v}</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ── Seguimientos ─────────────────────────────────────────── */
function FollowUps({ p }: { p: Profile }) {
  const st = p.member.status;
  const coach = p.routine.coach.name.split(" ")[0];
  const items =
    st === "vencido"
      ? [
          { when: "Hoy 17:00", what: "Confirmar pago o liberar cupos reservados", urgent: true },
          { when: "Jue 26", what: "Llamar si no regulariza · ofrecer plan en cuotas" },
          { when: p.body.nextEval, what: `Evaluación con ${coach} (a confirmar)` },
        ]
      : st === "congelado"
        ? [
            { when: "12 dic", what: "Llamar para confirmar la vuelta y reservar Reformer", urgent: true },
            { when: "15 dic", what: "Reactivación automática de la membresía" },
            { when: p.body.nextEval, what: `Evaluación de regreso con ${coach}` },
          ]
        : [
            ...(st === "por-vencer" ? [{ when: p.dueLabel, what: "Cobrar renovación · ofrecer plan trimestral", urgent: true }] : []),
            { when: "Lun 30", what: `Subir cargas en semana 6 · ${coach}`, urgent: st !== "por-vencer" },
            { when: p.body.nextEval, what: `Evaluación física con ${coach}` },
            { when: "Ene", what: "Ofrecer plan anual después de las fiestas" },
          ];
  return (
    <article className="panel stagger p-5" style={s(4)}>
      <SectionTitle title="Seguimientos" hint="Recordatorios del equipo" action={<button className="text-[12px] font-bold text-lime hover:underline">Agregar</button>} />
      <ul className="mt-4 space-y-2">
        {items.map((x) => (
          <li key={x.what} className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5", x.urgent ? "border-amber/25 bg-amber/[0.05]" : "border-line bg-white/[0.02]")}>
            <span className={cn("size-4 shrink-0 rounded-md border-2", x.urgent ? "border-amber" : "border-line-strong")} />
            <p className="min-w-0 flex-1 text-[12.5px] font-semibold leading-snug text-fg-2">{x.what}</p>
            <span className={cn("flex shrink-0 items-center gap-1 text-[11px] font-bold tabular", x.urgent ? "text-amber" : "text-muted")}>
              {x.urgent && <AlarmClock className="size-3" />}
              {x.when}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ── Equipo ───────────────────────────────────────────────── */
function TeamCard({ authors }: { authors: Author[] }) {
  const map = new Map<string, Author & { n: number }>();
  authors.forEach((a) => map.set(a.name, { ...a, n: (map.get(a.name)?.n ?? 0) + 1 }));
  const list = [...map.values()].sort((a, b) => b.n - a.n);
  return (
    <article className="panel stagger p-5" style={s(5)}>
      <SectionTitle title="Equipo a cargo" hint={`${list.length} personas escribieron notas`} />
      <ul className="mt-4 space-y-2.5">
        {list.map((a) => (
          <li key={a.name} className="flex items-center gap-3">
            <Face i={a.face} size={32} />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[13px] font-bold text-fg">{a.name}</p>
              <p className="text-[11.5px] text-muted">{a.role}</p>
            </div>
            <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] font-extrabold text-fg-2 tabular">{a.n}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
