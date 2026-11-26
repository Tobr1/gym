import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  BellRing,
  CalendarClock,
  Check,
  CircleSlash,
  CreditCard,
  Download,
  FileText,
  Landmark,
  Link2,
  Lock,
  Plus,
  Repeat2,
  ShieldCheck,
  Smartphone,
  Snowflake,
  Sparkles,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { Button, buttonClass, Pill, SectionTitle } from "@/components/ui/primitives";
import { cn, money } from "@/lib/utils";
import { getBilling, type LedgerRow } from "../_lib/billing";
import type { Profile } from "../_lib/profile";
import { Eyebrow, s, StatusNote } from "./kit";

export function PagosTab({ p }: { p: Profile }) {
  const b = getBilling(p);
  const st = p.member.status;
  return (
    <div className="mt-6 grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <BalanceCard p={p} b={b} />
        <NextDebit p={p} b={b} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Ledger b={b} st={st} />
        <aside className="grid min-w-0 content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
          <MethodCard p={p} />
          <Invoices b={b} />
          <div className="md:col-span-2 xl:col-span-1">
            <PlanHistory p={p} b={b} />
          </div>
        </aside>
      </div>
    </div>
  );
}

type B = ReturnType<typeof getBilling>;

/* ── Saldo + cuotas ───────────────────────────────────────── */
function BalanceCard({ p, b }: { p: Profile; b: B }) {
  const debt = b.balance > 0;
  const max = Math.max(...b.bars.map((x) => x.amount));
  return (
    <article
      className={cn("panel stagger relative overflow-hidden p-5 sm:p-6", debt ? "border-rose/40" : "glow-lime")}
      style={s(2)}
    >
      <div className={cn("absolute -right-16 -top-20 size-56 rounded-full blur-[80px]", debt ? "bg-rose/20" : "bg-lime/[0.14]")} />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-stretch">
        <div className="flex min-w-0 flex-col sm:w-[42%]">
          <div className="flex items-center justify-between gap-2">
            <Eyebrow>Saldo de la cuenta</Eyebrow>
            <Pill tone={debt ? "rose" : "lime"} dot>
              {debt ? "Con deuda" : "Al día"}
            </Pill>
          </div>
          <p className={cn("mt-3 text-[44px] font-extrabold leading-none tracking-[-0.045em] tabular", debt ? "text-rose" : "text-fg")}>
            {money(b.balance)}
          </p>
          <p className="mt-2 text-[12.5px] leading-snug text-fg-2">
            {debt ? (
              <>
                Cuota de noviembre + recargo · vencida el <b className="text-fg">{p.dueLabel}</b>
              </>
            ) : (
              <>
                Sin deuda · <b className="text-fg">{b.onTime === 100 ? "todas las cuotas" : `${b.onTime}% de las cuotas`}</b> pagadas en término
              </>
            )}
          </p>
          <div className="mt-auto flex flex-wrap gap-2 pt-5">
            <Button size="md" className={cn(debt && "bg-rose text-white shadow-[0_8px_30px_-8px_rgb(255_95_126/0.6)] hover:bg-rose hover:brightness-110")}>
              <Banknote className="size-4" /> {debt ? `Cobrar ${money(b.balance)}` : "Registrar pago"}
            </Button>
            <Button variant="secondary" size="md">
              <Link2 className="size-4" /> Link de pago
            </Button>
          </div>
        </div>

        <div className="min-w-0 flex-1 rounded-2xl border border-line bg-ink/40 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="whitespace-nowrap text-[12px] font-semibold text-fg-2">Cuotas · may – nov</p>
            <p className="whitespace-nowrap text-[11.5px] font-semibold text-muted">
              Abonado <span className="font-extrabold text-fg tabular">{money(b.paidTotal)}</span>
            </p>
          </div>
          <div className="relative mt-4 flex h-[118px] items-end gap-1.5 sm:gap-2">
            {b.bars.map((x, k) => {
              const cur = k === b.bars.length - 1;
              const upgrade = k > 0 && b.bars[k - 1].prev && !x.prev;
              return (
                <div key={x.label} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                  {upgrade && (
                    <span className="absolute -top-0.5 left-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-violet/15 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-violet ring-1 ring-violet/30">
                      Upgrade
                    </span>
                  )}
                  {upgrade && <span className="absolute bottom-0 left-0 top-5 -translate-x-[calc(50%+3px)] border-l border-dashed border-violet/40" />}
                  <span className="mb-1 text-[10px] font-bold text-muted opacity-0 transition group-hover:opacity-100 tabular">
                    {Math.round(x.amount / 1000)}K
                  </span>
                  <span
                    className={cn(
                      "w-full max-w-[34px] rounded-[7px] transition-all duration-300 group-hover:brightness-125",
                      x.status === "vencido"
                        ? "bg-rose shadow-[0_0_18px_-2px_rgb(255_95_126/0.7)]"
                        : x.status === "pendiente"
                          ? "border border-dashed border-amber/70 bg-amber/15"
                          : cur
                            ? "bg-lime shadow-[0_0_18px_-2px_rgb(181_245_74/0.7)]"
                            : x.prev
                              ? "bg-white/[0.10]"
                              : "bg-lime/35",
                    )}
                    style={{ height: `${(x.amount / max) * 78}%`, animation: `fade-up .7s cubic-bezier(.22,1,.36,1) ${k * 60}ms both` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex gap-1.5 text-center text-[10.5px] font-bold text-faint sm:gap-2">
            {b.bars.map((x, k) => (
              <span key={x.label} className={cn("flex-1", k === b.bars.length - 1 && "text-fg-2")}>
                {x.label}
              </span>
            ))}
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3">
            {[
              { l: "Cuota actual", v: money(p.member.amount || 42000) },
              { l: "Ticket prom.", v: money(b.avgTicket) },
              { l: "Puntualidad", v: `${b.onTime}%`, c: b.onTime === 100 ? "text-lime" : b.onTime < 90 ? "text-amber" : "text-fg" },
            ].map((k) => (
              <div key={k.l} className="min-w-0">
                <dt className="truncate text-[10.5px] font-bold uppercase tracking-wide text-faint">{k.l}</dt>
                <dd className={cn("mt-0.5 truncate text-[14px] font-extrabold tabular", k.c ?? "text-fg")}>{k.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </article>
  );
}

/* ── Próximo débito ───────────────────────────────────────── */
function NextDebit({ p, b }: { p: Profile; b: B }) {
  const st = p.member.status;
  const frozen = st === "congelado";
  const expired = st === "vencido";
  const n = b.next;
  const pct = frozen ? 0 : expired ? 100 : Math.max(4, Math.min(100, ((p.periodDays - n.days) / p.periodDays) * 100));
  const tone = expired ? "text-rose" : frozen ? "text-cyan" : n.days <= 3 ? "text-amber" : "text-lime";
  return (
    <article className="panel stagger flex flex-col p-5 sm:p-6" style={s(3)}>
      <SectionTitle
        title={n.title}
        hint={frozen ? "Membresía en pausa" : expired ? "Reintento sobre el saldo vencido" : "Próximo cobro de la cuota"}
        action={
          <span className={cn("grid size-9 place-items-center rounded-xl bg-white/[0.04]", tone)}>
            {frozen ? <Snowflake className="size-[18px]" /> : expired ? <TriangleAlert className="size-[18px]" /> : <CalendarClock className="size-[18px]" />}
          </span>
        }
      />
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[34px] font-extrabold leading-none tracking-[-0.04em] text-fg">{n.label}</p>
          <p className={cn("mt-1.5 text-[12.5px] font-bold", tone)}>
            {frozen ? "Reactivación automática" : expired ? `${Math.abs(p.daysLeft)} días de atraso` : n.days === 0 ? "Hoy" : `En ${n.days} días`}
          </p>
        </div>
        <p className="text-right text-[22px] font-extrabold tracking-tight text-fg tabular">{money(n.amount)}</p>
      </div>
      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className={cn("h-full rounded-full", expired ? "bg-rose" : frozen ? "bg-cyan/50" : n.days <= 3 ? "bg-amber" : "bg-lime")}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10.5px] font-semibold text-faint">
          <span>{frozen ? "4 nov" : "Inicio del período"}</span>
          <span>{frozen ? "15 dic" : "Cobro"}</span>
        </div>
      </div>
      <p className="mt-4 text-[12px] leading-snug text-muted">{n.note}</p>
      <div className="mt-auto flex items-center gap-2 border-t border-line pt-4">
        {expired ? (
          <>
            <Lock className="size-3.5 text-rose" />
            <span className="flex-1 text-[12px] font-semibold text-fg-2">Acceso bloqueado hasta regularizar</span>
            <button className="text-[12px] font-bold text-lime hover:underline">Reintentar</button>
          </>
        ) : frozen ? (
          <>
            <Snowflake className="size-3.5 text-cyan" />
            <span className="flex-1 text-[12px] font-semibold text-fg-2">Los días de licencia no se cobran</span>
          </>
        ) : (
          <>
            <BellRing className="size-3.5 text-lime" />
            <span className="flex-1 text-[12px] font-semibold text-fg-2">Recordatorio por WhatsApp 3 días antes</span>
            <span className="relative h-5 w-9 rounded-full bg-lime/90">
              <span className="absolute right-0.5 top-0.5 size-4 rounded-full bg-ink" />
            </span>
          </>
        )}
      </div>
    </article>
  );
}

/* ── Medio de pago ────────────────────────────────────────── */
function MethodCard({ p }: { p: Profile }) {
  const pm = p.payMethod;
  const mp = pm.name === "Mercado Pago";
  const bank = pm.name === "Transferencia";
  const first = p.member.name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return (
    <article className="panel stagger flex flex-col p-5 sm:p-6" style={s(4)}>
      <SectionTitle title="Medio de pago" hint="Registrado para la cuota" action={<button className="text-[12px] font-bold text-lime hover:underline">Cambiar</button>} />
      <div
        className={cn(
          "group relative mt-4 overflow-hidden rounded-2xl border border-white/10 p-4 transition-transform duration-500 hover:-translate-y-0.5",
          mp
            ? "bg-[linear-gradient(135deg,#0f2a33_0%,#12202c_55%,#0d131c_100%)]"
            : bank
              ? "bg-[linear-gradient(135deg,#2a2412_0%,#1a1b1d_55%,#0d131c_100%)]"
              : "bg-[linear-gradient(135deg,#1c1a35_0%,#141b29_55%,#0d131c_100%)]",
        )}
      >
        <div className={cn("absolute -right-8 -top-10 size-32 rounded-full blur-3xl", mp ? "bg-cyan/30" : bank ? "bg-amber/25" : "bg-violet/30")} />
        <div className="dots absolute inset-0 opacity-30 [mask-image:linear-gradient(120deg,transparent_35%,black)]" />
        <div className="relative flex items-start justify-between">
          <span className={cn("grid size-9 place-items-center rounded-xl", mp ? "bg-cyan/15 text-cyan" : bank ? "bg-amber/15 text-amber" : "bg-violet/15 text-violet")}>
            {mp ? <Smartphone className="size-[18px]" /> : bank ? <Landmark className="size-[18px]" /> : <CreditCard className="size-[18px]" />}
          </span>
          {pm.auto ? (
            <Pill tone="lime" className="bg-lime text-lime-ink ring-0">
              <Repeat2 className="size-3" /> Automático
            </Pill>
          ) : (
            <Pill tone="amber">Manual</Pill>
          )}
        </div>
        <p className="relative mt-5 font-mono text-[15px] font-bold tracking-[0.16em] text-fg tabular">
          {mp ? `${first}@mp` : bank ? "CBU •••• •••• 0937" : "•••• •••• •••• 4821"}
        </p>
        <div className="relative mt-2 flex items-end justify-between text-[11px]">
          <div>
            <p className="font-bold uppercase tracking-[0.12em] text-faint">{mp ? "Suscripción" : bank ? "Banco" : "Titular"}</p>
            <p className="font-bold text-fg-2">{mp ? "Mensual · día de vencimiento" : bank ? "Banco Galicia" : p.member.name.toUpperCase()}</p>
          </div>
          <p className="font-bold text-fg-2 tabular">{mp ? "Mercado Pago" : bank ? "Cuenta sueldo" : "VISA · 08/29"}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-[12.5px]">
        <li className="flex items-center gap-2 text-fg-2">
          <ShieldCheck className="size-3.5 shrink-0 text-lime" /> {pm.auto ? "Autorizado por el socio el 14 ago" : "Comprobante a validar por caja"}
        </li>
        <li className="flex items-center gap-2 text-fg-2">
          <Wallet className="size-3.5 shrink-0 text-faint" /> Alternativo: <span className="font-bold text-fg">Efectivo en mostrador</span>
        </li>
      </ul>
      <button className="mt-4 flex h-10 items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-strong text-[12px] font-semibold text-muted transition hover:border-lime/50 hover:text-lime">
        <Plus className="size-3.5" /> Agregar medio de respaldo
      </button>
    </article>
  );
}

/* ── Cuenta corriente ─────────────────────────────────────── */
const ROW_META: Record<LedgerRow["kind"], { icon: typeof Check; cls: string }> = {
  cargo: { icon: ArrowUpRight, cls: "bg-white/[0.05] text-fg-2" },
  pago: { icon: ArrowDownLeft, cls: "bg-lime/12 text-lime" },
  recargo: { icon: TriangleAlert, cls: "bg-amber/12 text-amber" },
  rechazo: { icon: CircleSlash, cls: "bg-rose/12 text-rose" },
  licencia: { icon: Snowflake, cls: "bg-cyan/12 text-cyan" },
  programado: { icon: CalendarClock, cls: "bg-violet/12 text-violet" },
};

function Ledger({ b, st }: { b: B; st: Profile["member"]["status"] }) {
  return (
    <article className="panel stagger min-w-0 overflow-hidden" style={s(5)}>
      <div className="flex flex-col gap-3 p-5 pb-4 sm:flex-row sm:items-end sm:justify-between sm:p-6 sm:pb-4">
        <SectionTitle title="Cuenta corriente" hint="Cuotas, pagos y ajustes · may – nov 2026" />
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-line bg-white/[0.02] p-0.5 text-[11.5px] font-bold">
            {["Todo", "Cargos", "Pagos"].map((t, k) => (
              <span key={t} className={cn("rounded-md px-2.5 py-1", k === 0 ? "bg-surface-3 text-fg" : "text-muted")}>
                {t}
              </span>
            ))}
          </div>
          <button className="grid size-8 place-items-center rounded-lg border border-line text-fg-2 transition hover:bg-white/5" aria-label="Exportar estado de cuenta">
            <Download className="size-4" />
          </button>
        </div>
      </div>

      {st === "vencido" && (
        <StatusNote tone="rose" icon={<TriangleAlert />} className="mx-5 mb-4 sm:mx-6">
          <b>Saldo deudor de {money(b.balance)}.</b> El cobro con tarjeta de hoy se rechazó; sus cupos quedan retenidos hasta las 17:00.
        </StatusNote>
      )}

      {/* Mobile */}
      <ul className="divide-y divide-line/70 border-t border-line sm:hidden">
        {b.upcoming && (
          <li className="flex items-center gap-3 bg-violet/[0.04] px-5 py-3">
            <RowIcon kind="programado" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-fg">{b.upcoming.title}</p>
              <p className="text-[11.5px] text-muted">
                {b.upcoming.date} · {b.upcoming.method}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold text-fg-2 tabular">{money(b.upcoming.amount)}</p>
              <p className="text-[11px] font-bold text-violet">Programado</p>
            </div>
          </li>
        )}
        {b.ledger.slice(0, 8).map((r, k) => (
          <li key={r.id} className="flex items-center gap-3 px-5 py-3">
            <RowIcon kind={r.kind} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-fg">{r.title}</p>
              <p className="truncate text-[11.5px] text-muted tabular">
                {r.date} · {r.detail}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={cn("text-[13px] font-bold tabular", r.credit ? "text-lime" : r.debit ? "text-fg" : "text-faint")}>
                {r.credit ? `− ${money(r.credit)}` : r.debit ? `+ ${money(r.debit)}` : "—"}
              </p>
              <p className={cn("text-[11px] font-semibold tabular", k === 0 && r.balance > 0 ? "text-rose" : "text-muted")}>Saldo {money(r.balance)}</p>
            </div>
          </li>
        ))}
        {b.ledger.length > 8 && (
          <li>
            <button className="flex h-11 w-full items-center justify-center text-[12.5px] font-bold text-lime">Ver {b.ledger.length - 8} movimientos anteriores</button>
          </li>
        )}
      </ul>

      {/* Desktop */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[600px] text-left text-[13px]">
          <thead>
            <tr className="border-y border-line text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
              <th className="px-6 py-3 font-bold">Fecha</th>
              <th className="px-3 py-3 font-bold">Movimiento</th>
              <th className="px-3 py-3 text-right font-bold">Debe</th>
              <th className="px-3 py-3 text-right font-bold">Haber</th>
              <th className="px-6 py-3 text-right font-bold">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {b.upcoming && (
              <tr className="border-b border-dashed border-violet/25 bg-violet/[0.035]">
                <td className="whitespace-nowrap px-6 py-3 font-semibold text-violet tabular">{b.upcoming.date}</td>
                <td className="w-full max-w-0 px-3 py-3">
                  <div className="flex items-center gap-3">
                    <RowIcon kind="programado" />
                    <div className="min-w-0">
                      <p className="font-bold text-fg">{b.upcoming.title}</p>
                      <p className="text-[11.5px] text-muted">{b.upcoming.method} · programado</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-muted tabular">{money(b.upcoming.amount)}</td>
                <td className="px-3 py-3 text-right text-faint">—</td>
                <td className="px-6 py-3 text-right">
                  <Pill tone="violet">Programado</Pill>
                </td>
              </tr>
            )}
            {b.ledger.map((r, k) => (
              <tr key={r.id} className="group border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.025]">
                <td className="px-6 py-2.5 font-semibold text-fg-2 tabular">{r.date}</td>
                <td className="w-full max-w-0 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <RowIcon kind={r.kind} />
                    <div className="min-w-0">
                      <p className={cn("truncate font-bold", r.kind === "rechazo" ? "text-rose" : "text-fg")}>{r.title}</p>
                      <p className="truncate text-[11.5px] text-muted">
                        {r.detail}
                        {r.ref && <span className="ml-1.5 font-mono text-[10.5px] text-faint">{r.ref}</span>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-fg tabular">{r.debit ? money(r.debit) : <span className="text-faint">—</span>}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-bold text-lime tabular">{r.credit ? money(r.credit) : <span className="font-semibold text-faint">—</span>}</td>
                <td className={cn("whitespace-nowrap px-6 py-2.5 text-right font-extrabold tabular", k === 0 ? (r.balance > 0 ? "text-rose" : "text-fg") : "text-muted")}>
                  {money(r.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function RowIcon({ kind }: { kind: LedgerRow["kind"] }) {
  const m = ROW_META[kind];
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", m.cls)}>
      <m.icon className="size-4" strokeWidth={2.4} />
    </span>
  );
}

/* ── Comprobantes ─────────────────────────────────────────── */
function Invoices({ b }: { b: B }) {
  return (
    <article className="panel stagger p-5 sm:p-6" style={s(6)}>
      <SectionTitle
        title="Facturas"
        hint={`${b.invoices.length} comprobantes · Factura B`}
        action={
          <button className="inline-flex items-center gap-1.5 text-[12px] font-bold text-lime hover:underline">
            <Download className="size-3.5" /> ZIP
          </button>
        }
      />
      <ul className="mt-4 space-y-1.5">
        {b.invoices.map((x) => (
          <li
            key={x.id}
            className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition hover:border-line hover:bg-white/[0.025]"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-fg-2 transition group-hover:bg-lime/12 group-hover:text-lime">
              <FileText className="size-4" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[13px] font-bold text-fg">{x.period}</p>
              <p className="truncate font-mono text-[10.5px] text-muted">{x.number}</p>
            </div>
            <div className="shrink-0 text-right leading-tight">
              <p className="text-[12.5px] font-bold text-fg tabular">{money(x.amount)}</p>
              <p className="text-[10.5px] text-faint">PDF · {x.size}</p>
            </div>
            <button className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-lime hover:text-lime-ink" aria-label={`Descargar factura ${x.period}`}>
              <Download className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ── Historial de planes ──────────────────────────────────── */
function PlanHistory({ p, b }: { p: Profile; b: B }) {
  return (
    <article className="panel stagger p-5 sm:p-6" style={s(7)}>
      <SectionTitle title="Historial de planes" hint={`Socio/a desde ${p.member.since}`} />
      <ol className="relative mt-5">
        <span className="absolute bottom-4 left-[15px] top-4 w-px bg-gradient-to-b from-lime/60 via-line-strong to-transparent" />
        {b.plans.map((x) => (
          <li key={x.plan + x.from} className="relative flex gap-3.5 pb-5 last:pb-0">
            <span
              className={cn(
                "relative z-[1] grid size-[31px] shrink-0 place-items-center rounded-full",
                x.current ? "bg-lime text-lime-ink shadow-[0_0_16px_-2px_rgb(181_245_74/0.7)]" : "bg-surface-3 text-fg-2 ring-1 ring-line-strong",
              )}
            >
              {x.current ? <Sparkles className="size-3.5" strokeWidth={2.4} /> : <Check className="size-3.5" strokeWidth={2.6} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[13.5px] font-bold text-fg">{x.plan}</p>
                <p className="shrink-0 text-[12.5px] font-extrabold text-fg tabular">
                  {money(x.price)}
                  <span className="text-[10.5px] font-semibold text-muted">/mes</span>
                </p>
              </div>
              <p className="text-[11.5px] text-muted">
                {x.from} → {x.to ?? "hoy"} · {x.note}
              </p>
            </div>
          </li>
        ))}
        <li className="relative flex gap-3.5">
          <span className="relative z-[1] grid size-[31px] shrink-0 place-items-center rounded-full bg-surface-3 text-faint ring-1 ring-line">
            <Plus className="size-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-fg-2">Alta · matrícula bonificada</p>
            <p className="text-[11.5px] text-muted">{p.member.since} · Referido/a por un socio</p>
          </div>
        </li>
      </ol>
      <Link href="/admin/caja" className={buttonClass("secondary", "sm", "mt-5 w-full")}>
        Cambiar plan
      </Link>
    </article>
  );
}
