"use client";

import { useRef, useState } from "react";
import {
  BellRing,
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  Copy,
  Infinity as InfinityIcon,
  MapPin,
  Pencil,
  Plus,
  Store,
  Tags,
  TrendingUp,
  X,
} from "lucide-react";
import { Button, Delta, Pill } from "@/components/ui/primitives";
import { cn, compactMoney, fmt, money } from "@/lib/utils";
import {
  ALL_DISCIPLINES,
  DISCIPLINE_COLOR,
  EXTRA_CHARGES,
  INCREASE_DATES,
  INITIAL_PLANS,
  PRICE_HISTORY,
  TOTAL_MEMBERS,
  type Billing,
  type DisciplineKey,
  type Plan,
} from "../_data";
import { Check2, Field, MoneyInput, SectionHead, Segmented, SettingRow, Sheet, TextInput, Toggle, s, useTouch } from "./controls";

const BILLING_LABEL: Record<Billing, string> = { mensual: "Mensual", trimestral: "Trimestral −10%", anual: "Anual" };
const freq = (n: number) => (n === 0 ? "Ilimitado" : `${n}x por semana`);
const NEW_COLORS = ["var(--color-violet)", "var(--color-cyan)", "var(--color-amber)", "var(--color-emerald)"];

const TEMPLATES: { label: string; plan: Partial<Plan> }[] = [
  { label: "Plan estudiante", plan: { name: "Estudiante", tagline: "Con libreta universitaria vigente", price: 34_900, perWeek: 3, disciplines: ["Musculación", "Funcional"] } },
  { label: "Pack 8 clases", plan: { name: "Pack 8 clases", tagline: "Para usar en 30 días", price: 39_000, perWeek: 2, disciplines: ["Spinning", "Yoga", "Funcional"] } },
  { label: "Dúo", plan: { name: "Pase Libre Dúo", tagline: "Dos personas, una sola cuota", price: 88_000, perWeek: 0, disciplines: ["Musculación", "CrossTraining", "Funcional", "Spinning", "Yoga"], multisede: true } },
];

function blankPlan(n: number, preset: Partial<Plan> = {}): Plan {
  return {
    id: `nuevo-${Date.now()}`,
    name: "",
    tagline: "",
    price: 40_000,
    perWeek: 3,
    disciplines: ["Musculación"],
    members: 0,
    revenue: 0,
    delta: 0,
    multisede: false,
    inApp: true,
    billing: ["mensual"],
    color: NEW_COLORS[n % NEW_COLORS.length],
    draft: true,
    ...preset,
  };
}

export function PlansSection() {
  const touch = useTouch();
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [editing, setEditing] = useState<{ plan: Plan; isNew: boolean } | null>(null);
  const copies = useRef(0);

  const revenue = plans.reduce((a, p) => a + p.revenue, 0);
  const maxMembers = Math.max(...plans.map((p) => p.members));

  const save = (plan: Plan) => {
    setPlans((ps) => (ps.some((p) => p.id === plan.id) ? ps.map((p) => (p.id === plan.id ? plan : p)) : [...ps, plan]));
    touch(`planes.${plan.id}`);
    setEditing(null);
  };

  const duplicate = (p: Plan) => {
    const copy: Plan = { ...p, id: `${p.id}-copia-${(copies.current += 1)}`, name: `${p.name} (copia)`, members: 0, revenue: 0, delta: 0, featured: false, draft: true };
    setPlans((ps) => {
      const i = ps.findIndex((x) => x.id === p.id);
      return [...ps.slice(0, i + 1), copy, ...ps.slice(i + 1)];
    });
    touch(`planes.${copy.id}`);
  };

  return (
    <section className="@container">
      <SectionHead
        icon={Tags}
        title="Planes y precios"
        text={
          <>
            {plans.length} planes · <span className="font-semibold text-fg-2 tabular">{fmt(TOTAL_MEMBERS)}</span> socios activos ·{" "}
            <span className="font-semibold text-fg-2 tabular">{compactMoney(revenue)}</span> cobrados en cuotas en noviembre
          </>
        }
      >
        <Button variant="primary" size="md" onClick={() => setEditing({ plan: blankPlan(plans.length), isNew: true })}>
          <Plus className="size-4" strokeWidth={2.6} /> Nuevo plan
        </Button>
      </SectionHead>

      {/* ── Mix de socios ─────────────────────────────── */}
      <div className="panel stagger mb-4 p-4 sm:p-5" style={s(1)}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-[13px] font-bold text-fg">Cómo se reparten tus socios</p>
          <p className="text-[12px] text-muted">
            Último aumento <span className="font-semibold text-fg-2">1 sep · +8%</span> · retención 94,1%
          </p>
        </div>
        <div className="mt-3 flex h-3 gap-[3px] overflow-hidden rounded-full">
          {plans
            .filter((p) => p.members > 0)
            .map((p) => (
              <div
                key={p.id}
                className="h-full rounded-[3px] transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                style={{ width: `${(p.members / TOTAL_MEMBERS) * 100}%`, background: p.color }}
                title={`${p.name}: ${p.members}`}
              />
            ))}
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 @xl:grid-cols-3 @3xl:grid-cols-6">
          {plans
            .filter((p) => p.members > 0)
            .map((p) => (
              <li key={p.id} className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-[11.5px] font-semibold text-muted">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: p.color }} />
                  <span className="truncate">{p.name}</span>
                </p>
                <p className="mt-0.5 text-[14px] font-extrabold text-fg tabular">
                  {fmt(p.members)}
                  <span className="ml-1 text-[11px] font-semibold text-faint">{Math.round((p.members / TOTAL_MEMBERS) * 100)}%</span>
                </p>
              </li>
            ))}
        </ul>
      </div>

      {/* ── Tarjetas de planes ─────────────────────────── */}
      <div className="grid gap-3 @lg:grid-cols-2 @3xl:grid-cols-3">
        {plans.map((p, i) => (
          <PlanCard key={p.id} plan={p} i={i} maxMembers={maxMembers} onEdit={() => setEditing({ plan: p, isNew: false })} onDuplicate={() => duplicate(p)} />
        ))}
        <NewPlanCard
          i={plans.length}
          onNew={(preset) => setEditing({ plan: blankPlan(plans.length, preset), isNew: true })}
        />
      </div>

      <PriceIncrease plans={plans} />

      {/* ── Cargos y bonificaciones ───────────────────── */}
      <div className="stagger mt-4" style={s(9)}>
        <p className="mb-2 px-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-faint">Cargos y bonificaciones</p>
        <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-4">
          {EXTRA_CHARGES.map((c) => (
            <ChargeTile key={c.label} {...c} />
          ))}
        </div>
      </div>

      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.isNew ? "Nuevo plan" : `Editar ${editing?.plan.name}`}
        subtitle={
          editing?.isNew
            ? "Se guarda como borrador hasta que lo publiques en la app"
            : `${fmt(editing?.plan.members ?? 0)} socios · el nuevo precio rige desde la próxima cuota`
        }
      >
        {editing && <PlanEditor key={editing.plan.id} initial={editing.plan} isNew={editing.isNew} onSave={save} onCancel={() => setEditing(null)} />}
      </Sheet>
    </section>
  );
}

/* ── Tarjeta de plan ───────────────────────────────────────── */
function PlanCard({
  plan: p,
  i,
  maxMembers,
  onEdit,
  onDuplicate,
}: {
  plan: Plan;
  i: number;
  maxMembers: number;
  onEdit: () => void;
  onDuplicate: () => void;
}) {
  return (
    <article
      className={cn(
        "panel stagger group flex flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong",
        p.featured && "glow-lime",
        p.draft && "border-dashed",
      )}
      style={s(i + 2)}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-[0.10] blur-2xl transition-opacity group-hover:opacity-20"
        style={{ background: p.color }}
      />
      <div className="relative flex items-center justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2 text-[15.5px] font-extrabold tracking-[-0.01em] text-fg">
          <span className="size-2.5 shrink-0 rounded-full" style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }} />
          <span className="truncate">{p.name || "Sin nombre"}</span>
        </h3>
        {p.featured ? (
          <Pill tone="lime" className="py-0.5 text-[10.5px]">Más elegido</Pill>
        ) : p.draft ? (
          <Pill tone="amber" dot className="py-0.5 text-[10.5px]">Borrador</Pill>
        ) : p.corporate ? (
          <Pill tone="rose" className="py-0.5 text-[10.5px]">B2B</Pill>
        ) : null}
      </div>
      <p className="relative mt-0.5 truncate pl-[18px] text-[12px] text-muted">{p.tagline}</p>

      <p className="relative mt-4 flex items-baseline gap-1.5">
        <span className="text-[30px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">{money(p.price)}</span>
        <span className="text-[12.5px] font-semibold text-muted">/mes</span>
      </p>

      <div className="relative mt-3 flex flex-wrap gap-1.5 text-[11.5px] font-semibold text-fg-2">
        <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.05] px-2 py-1">
          {p.perWeek === 0 ? <InfinityIcon className="size-3.5 text-muted" /> : <CalendarDays className="size-3.5 text-muted" />}
          {freq(p.perWeek)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.05] px-2 py-1">
          {p.multisede ? <Building2 className="size-3.5 text-muted" /> : <MapPin className="size-3.5 text-muted" />}
          {p.multisede ? "3 sedes" : "1 sede"}
        </span>
        {!p.inApp && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.05] px-2 py-1" title="No se puede contratar desde la app">
            <Store className="size-3.5 text-muted" />
            Solo mostrador
          </span>
        )}
      </div>

      <div className="relative mt-3 flex flex-wrap gap-x-2.5 gap-y-1">
        {p.disciplines.map((d) => (
          <span key={d} className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted">
            <span className="size-1.5 rounded-full" style={{ background: DISCIPLINE_COLOR[d] }} />
            {d}
          </span>
        ))}
      </div>

      <div className="relative mt-auto pt-4">
        <div className="flex items-end justify-between gap-2 border-t border-line pt-3.5">
          <div className="min-w-0 flex-1">
            <p className="flex items-baseline gap-1.5">
              <span className="text-[17px] font-extrabold text-fg tabular">{fmt(p.members)}</span>
              <span className="text-[11.5px] font-semibold text-muted">socios</span>
              {p.members > 0 && <Delta value={p.delta} className="text-[11px]" />}
            </p>
            <div className="mt-1.5 h-1 w-full max-w-[140px] overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full" style={{ width: `${(p.members / maxMembers) * 100}%`, background: p.color }} />
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <IconBtn label="Duplicar plan" onClick={onDuplicate}>
              <Copy className="size-[15px]" />
            </IconBtn>
            <IconBtn label="Editar plan" onClick={onEdit} strong>
              <Pencil className="size-[15px]" />
            </IconBtn>
          </div>
        </div>
      </div>
    </article>
  );
}

function IconBtn({ label, onClick, children, strong }: { label: string; onClick: () => void; children: React.ReactNode; strong?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-[10px] border transition active:scale-90",
        strong
          ? "border-line-strong bg-surface-2 text-fg hover:border-lime/40 hover:text-lime"
          : "border-line text-muted hover:border-line-strong hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function NewPlanCard({ i, onNew }: { i: number; onNew: (preset?: Partial<Plan>) => void }) {
  return (
    <div
      className="stagger group relative col-span-full flex flex-col gap-3 rounded-[var(--radius-2xl)] border border-dashed border-line-strong bg-white/[0.012] p-4 transition hover:border-lime/40 hover:bg-lime/[0.03] @xl:flex-row @xl:items-center"
      style={s(i + 2)}
    >
      <button type="button" onClick={() => onNew()} className="flex min-w-0 flex-1 items-center gap-3.5 text-left">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-line-strong bg-surface-2 text-fg-2 transition group-hover:scale-105 group-hover:border-lime/40 group-hover:text-lime">
          <Plus className="size-5" strokeWidth={2.4} />
        </span>
        <span className="min-w-0">
          <span className="block text-[14.5px] font-extrabold text-fg">Nuevo plan</span>
          <span className="block text-[12px] text-muted">Armalo desde cero o partí de una plantilla</span>
        </span>
      </button>
      <div className="flex flex-wrap gap-1.5 @xl:justify-end">
        {TEMPLATES.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => onNew(t.plan)}
            className="rounded-full border border-line bg-surface/60 px-2.5 py-1 text-[11.5px] font-semibold text-fg-2 transition hover:border-lime/40 hover:text-fg"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Editor de plan ────────────────────────────────────────── */
function PlanEditor({ initial, isNew, onSave, onCancel }: { initial: Plan; isNew: boolean; onSave: (p: Plan) => void; onCancel: () => void }) {
  const [p, setP] = useState<Plan>(initial);
  const set = <K extends keyof Plan>(k: K, v: Plan[K]) => setP((x) => ({ ...x, [k]: v }));
  const toggleDiscipline = (d: DisciplineKey) =>
    set("disciplines", p.disciplines.includes(d) ? p.disciplines.filter((x) => x !== d) : [...p.disciplines, d]);
  const toggleBilling = (b: Billing) => {
    if (b === "mensual") return;
    set("billing", p.billing.includes(b) ? p.billing.filter((x) => x !== b) : [...p.billing, b]);
  };
  const delta = initial.price ? ((p.price - initial.price) / initial.price) * 100 : 0;
  const valid = p.name.trim().length > 1 && p.price > 0 && p.disciplines.length > 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre del plan" className="sm:col-span-2">
          <TextInput value={p.name} onChange={(v) => set("name", v)} placeholder="Ej.: Pase Libre" autoFocus={isNew} />
        </Field>
        <Field label="Descripción corta" className="sm:col-span-2" hint="Se ve en la app debajo del nombre">
          <TextInput value={p.tagline} onChange={(v) => set("tagline", v)} placeholder="Ej.: Todo el gimnasio, todas las sedes" />
        </Field>
        <Field
          label="Precio mensual"
          className="sm:col-span-2"
          hint={
            !isNew && delta !== 0 ? (
              <span className={delta > 0 ? "text-amber" : "text-lime"}>
                {delta > 0 ? "+" : ""}
                {delta.toLocaleString("es-AR", { maximumFractionDigits: 1 })}% sobre el precio actual · aviso automático a {fmt(initial.members)} socios
              </span>
            ) : (
              <>Trimestral: {money(Math.round(p.price * 3 * 0.9))} con −10%</>
            )
          }
        >
          <MoneyInput value={p.price} onChange={(v) => set("price", v)} />
        </Field>
      </div>

      <Field label="Frecuencia">
        <Segmented
          value={p.perWeek}
          onChange={(v) => set("perWeek", v)}
          options={[
            { value: 2, label: "2x" },
            { value: 3, label: "3x" },
            { value: 4, label: "4x" },
            { value: 0, label: "Ilimitado" },
          ]}
        />
      </Field>

      <Field label="Disciplinas incluidas">
        <div className="grid grid-cols-2 gap-1.5">
          {ALL_DISCIPLINES.map((d) => {
            const on = p.disciplines.includes(d);
            return (
              <label
                key={d}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl border px-2.5 py-2 text-[13px] font-semibold transition",
                  on ? "border-line-strong bg-white/[0.04] text-fg" : "border-line text-muted hover:text-fg-2",
                )}
              >
                <Check2 checked={on} onChange={() => toggleDiscipline(d)} color={DISCIPLINE_COLOR[d]} label={d} />
                {d}
              </label>
            );
          })}
        </div>
      </Field>

      <Field label="Modalidades de cobro" hint="La cuota mensual siempre está disponible">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(BILLING_LABEL) as Billing[]).map((b) => {
            const on = p.billing.includes(b);
            return (
              <button
                key={b}
                type="button"
                onClick={() => toggleBilling(b)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold transition",
                  on ? "border-lime/40 bg-lime/[0.08] text-fg" : "border-line text-muted hover:text-fg",
                  b === "mensual" && "cursor-default",
                )}
              >
                {on ? <Check className="size-3.5 text-lime" strokeWidth={3} /> : <Plus className="size-3.5" />}
                {BILLING_LABEL[b]}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="divide-y divide-line rounded-2xl border border-line px-4">
        <SettingRow title="Multisede" text="Entra a las 3 sedes con el mismo QR">
          <Toggle checked={p.multisede} onChange={(v) => set("multisede", v)} label="Multisede" />
        </SettingRow>
        <SettingRow title="Contratable desde la app" text="Los socios lo ven en «Planes» y pagan con Mercado Pago">
          <Toggle checked={p.inApp} onChange={(v) => set("inApp", v)} label="Visible en la app" />
        </SettingRow>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button disabled={!valid} onClick={() => onSave(p)}>
          <Check className="size-4" strokeWidth={2.8} /> {isNew ? "Crear borrador" : "Aplicar cambios"}
        </Button>
      </div>
    </div>
  );
}

/* ── Programador de aumentos ───────────────────────────────── */
const PCTS = [5, 8, 10, 12, 15] as const;
const NEXT_LABEL: Record<(typeof INCREASE_DATES)[number]["value"], string> = { "1-dic": "Dic", "1-ene": "Ene ’27", "1-feb": "Feb ’27" };

function PriceIncrease({ plans }: { plans: Plan[] }) {
  const touch = useTouch();
  const live = plans.filter((p) => !p.draft);
  const [pct, setPct] = useState<number>(8);
  const [date, setDate] = useState<(typeof INCREASE_DATES)[number]["value"]>("1-ene");
  const [scope, setScope] = useState<string[]>(() => live.filter((p) => !p.corporate).map((p) => p.id));
  const [round, setRound] = useState(true);
  const [prepaid, setPrepaid] = useState(true);
  const [scheduled, setScheduled] = useState(false);

  const when = INCREASE_DATES.find((d) => d.value === date)!;
  const next = (price: number) => (round ? Math.round((price * (1 + pct / 100)) / 100) * 100 : Math.round(price * (1 + pct / 100)));
  const affected = live.filter((p) => scope.includes(p.id));
  const impact = affected.reduce((a, p) => a + (p.revenue * pct) / 100, 0);
  const people = affected.reduce((a, p) => a + p.members, 0);
  const pl = live.find((p) => p.id === "pase-libre");
  const history = [...PRICE_HISTORY, { label: NEXT_LABEL[date], value: pl && scope.includes(pl.id) ? next(pl.price) : 48_900, next: true }];
  const hMax = Math.max(...history.map((h) => h.value));
  const hMin = Math.min(...history.map((h) => h.value));

  const change = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setScheduled(false);
  };
  const toggleScope = (id: string) => change(setScope)(scope.includes(id) ? scope.filter((x) => x !== id) : [...scope, id]);

  return (
    <div className="panel stagger mt-4 overflow-hidden" style={s(8)}>
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-lime/10 text-lime ring-1 ring-inset ring-lime/20">
            <CalendarClock className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">Programar aumento</h3>
            <p className="text-[12.5px] text-muted">Los socios reciben el aviso por WhatsApp y en la app, sin que hagas nada</p>
          </div>
        </div>
        {scheduled ? (
          <Pill tone="lime" dot>
            Programado · {when.label}
          </Pill>
        ) : (
          <Pill tone="neutral">Sin aumentos programados</Pill>
        )}
      </div>

      <div className="grid @3xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        {/* controles */}
        <div className="space-y-5 p-5">
          <Field label="Porcentaje">
            <Segmented
              value={pct}
              onChange={change(setPct)}
              options={PCTS.map((v) => ({ value: v as number, label: `+${v}%` }))}
            />
          </Field>

          <Field label="A partir del">
            <div className="grid gap-1.5 @xl:grid-cols-3">
              {INCREASE_DATES.map((d) => {
                const on = d.value === date;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => change(setDate)(d.value)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left transition",
                      on ? "border-lime/45 bg-lime/[0.07] shadow-[0_0_0_3px_rgb(181_245_74/0.06)]" : "border-line hover:border-line-strong",
                    )}
                  >
                    <span className={cn("block text-[13px] font-extrabold tabular", on ? "text-fg" : "text-fg-2")}>{d.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted">{d.hint}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Planes alcanzados">
            <div className="flex flex-wrap gap-1.5">
              {live.map((p) => {
                const on = scope.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleScope(p.id)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold transition",
                      on ? "border-line-strong bg-white/[0.06] text-fg" : "border-line text-faint line-through decoration-faint/60 hover:text-muted",
                    )}
                  >
                    <span className="size-2 rounded-full" style={{ background: on ? p.color : "var(--color-faint)" }} />
                    {p.name}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="divide-y divide-line rounded-2xl border border-line px-4">
            <SettingRow title="Redondear a $ 100" text="Precios limpios en mostrador y en la app">
              <Toggle checked={round} onChange={change(setRound)} label="Redondear" />
            </SettingRow>
            <SettingRow title="Respetar pagos adelantados" text="Trimestrales y anuales mantienen el precio hasta renovar">
              <Toggle checked={prepaid} onChange={change(setPrepaid)} label="Respetar pagos adelantados" />
            </SettingRow>
          </div>
        </div>

        {/* vista previa */}
        <div className="flex flex-col border-t border-line bg-ink/30 p-5 @3xl:border-l @3xl:border-t-0">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11.5px] font-semibold text-muted">Impacto estimado</p>
              <p className="mt-1 text-[26px] font-extrabold leading-none tracking-[-0.04em] text-lime tabular">
                +{money(Math.round(impact / 100) * 100)}
                <span className="ml-1 text-[13px] font-semibold tracking-normal text-muted">/mes</span>
              </p>
            </div>
            <p className="text-right text-[11.5px] leading-snug text-muted">
              <span className="font-bold text-fg-2 tabular">{fmt(people)}</span> socios
              <br />
              {affected.length} {affected.length === 1 ? "plan" : "planes"}
            </p>
          </div>

          {/* evolución de Pase Libre */}
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-faint">
              <TrendingUp className="size-3.5" /> Pase Libre en el último año
            </p>
            <div className="flex h-[78px] items-end gap-1.5">
              {history.map((h, k) => {
                const isNext = "next" in h;
                const last = k === history.length - 2;
                return (
                  <div key={k} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <span className={cn("text-[9.5px] font-bold tabular", isNext ? "text-lime" : "text-faint")}>
                      {(h.value / 1000).toLocaleString("es-AR", { maximumFractionDigits: 1 })}k
                    </span>
                    <div
                      className={cn(
                        "w-full rounded-md transition-all duration-500",
                        isNext ? "bg-[repeating-linear-gradient(135deg,rgb(181_245_74/0.85)_0_4px,rgb(181_245_74/0.45)_4px_8px)]" : last ? "bg-fg-2/70" : "bg-white/[0.12]",
                      )}
                      style={{ height: `${12 + ((h.value - hMin) / (hMax - hMin || 1)) * 40}px` }}
                    />
                    <span className={cn("text-[10px] font-semibold", isNext ? "text-lime" : "text-muted")}>{h.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <ul className="mt-4 divide-y divide-line">
            {affected.slice(0, 4).map((p) => (
              <li key={p.id} className="flex items-center gap-2 py-2 text-[12.5px]">
                <span className="size-2 shrink-0 rounded-full" style={{ background: p.color }} />
                <span className="min-w-0 flex-1 truncate font-semibold text-fg-2">{p.name}</span>
                <span className="text-muted line-through decoration-faint tabular">{money(p.price)}</span>
                <span className="w-[76px] text-right font-extrabold text-fg tabular">{money(next(p.price))}</span>
              </li>
            ))}
            {affected.length > 4 && (
              <li className="py-2 text-[11.5px] font-semibold text-muted">y {affected.length - 4} más</li>
            )}
            {affected.length === 0 && <li className="py-3 text-[12.5px] text-muted">Elegí al menos un plan.</li>}
          </ul>

          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-line bg-surface/70 p-3">
            <BellRing className="mt-0.5 size-4 shrink-0 text-lime" />
            <p className="text-[12px] leading-snug text-fg-2">
              «Hola {"{nombre}"}, desde el <b className="text-fg">{when.label}</b> tu cuota de {pl && scope.includes(pl.id) ? "Pase Libre" : "{plan}"} pasa a{" "}
              <b className="text-fg">{pl && scope.includes(pl.id) ? money(next(pl.price)) : "{precio}"}</b>.»
            </p>
          </div>

          <div className="mt-4 flex gap-2 @3xl:mt-auto @3xl:pt-4">
            {scheduled ? (
              <Button variant="secondary" className="flex-1" onClick={() => setScheduled(false)}>
                <X className="size-4" /> Cancelar aumento
              </Button>
            ) : (
              <Button
                className="flex-1"
                disabled={!affected.length}
                onClick={() => {
                  setScheduled(true);
                  touch("planes.aumento");
                }}
              >
                <CalendarClock className="size-4" /> Programar +{pct}% · {when.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Cargos extra ──────────────────────────────────────────── */
function ChargeTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  const touch = useTouch();
  const [v, setV] = useState(value);
  return (
    <div className="panel-flat group p-3.5 transition hover:border-line-strong">
      <p className="text-[12px] font-bold text-fg-2">{label}</p>
      <input
        value={v}
        onChange={(e) => {
          setV(e.target.value);
          touch(`planes.cargo.${label}`);
        }}
        aria-label={label}
        className="mt-1 w-full rounded-md bg-transparent text-[19px] font-extrabold tracking-[-0.02em] text-fg tabular focus:outline-none focus-visible:outline-none"
      />
      <p className="flex items-center gap-1 text-[11px] text-muted">
        {hint}
        <Pencil className="ml-auto size-3 text-faint opacity-0 transition group-hover:opacity-100" />
      </p>
    </div>
  );
}
