"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Donut } from "@/components/charts";
import { Delta, Pill } from "@/components/ui/primitives";
import { PHOTO } from "@/lib/photos";
import { cn, compactMoney, fmt, money } from "@/lib/utils";
import {
  BRANCH_ROWS,
  BY_CONCEPT,
  BY_METHOD,
  BY_PLAN,
  CHURN,
  CHURN_REASONS,
  CHURN_TICKET,
  MEMBERS_ACTIVE,
  REVENUE_NOV,
} from "../_data";

const ease = [0.22, 1, 0.36, 1] as const;
const pctFmt = (v: number) =>
  v.toLocaleString("es-AR", { maximumFractionDigits: 1 });

/* ── Etiqueta de bloque dentro del informe ───────────────────── */
export function BlockLabel({
  n,
  title,
  hint,
}: {
  n: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-3 mt-8 flex items-baseline gap-3 first:mt-0 sm:mt-10">
      <span className="text-[11px] font-extrabold tracking-[0.14em] text-lime tabular">
        {n}
      </span>
      <h2 className="text-[17px] font-extrabold tracking-[-0.02em] text-fg">
        {title}
      </h2>
      {hint && <span className="hidden h-px flex-1 bg-line sm:block" />}
      {hint && (
        <span className="hidden text-[12px] font-semibold text-muted sm:block">
          {hint}
        </span>
      )}
    </div>
  );
}

/* ── Composición por concepto (barra apilada) ─────────────────── */
export function ConceptStack() {
  const total = BY_CONCEPT.reduce((a, b) => a + b.amount, 0);
  return (
    <div>
      <div className="flex h-2.5 gap-1">
        {BY_CONCEPT.map((c, i) => (
          <motion.span
            key={c.key}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease }}
            className="h-full origin-left rounded-full"
            style={{
              width: `${(c.amount / total) * 100}%`,
              background: c.color,
            }}
            title={`${c.label} · ${money(c.amount)}`}
          />
        ))}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
        {BY_CONCEPT.map((c) => (
          <div key={c.key} className="min-w-0">
            <dt className="flex items-center gap-1.5 truncate text-[11.5px] font-semibold text-muted">
              <span
                className="size-2 shrink-0 rounded-[3px]"
                style={{ background: c.color }}
              />
              <span className="truncate">{c.label}</span>
            </dt>
            <dd className="mt-0.5 text-[14px] font-extrabold text-fg tabular">
              {compactMoney(c.amount)}
              <span className="ml-1.5 text-[11px] font-bold text-faint">
                {pctFmt((c.amount / total) * 100)}%
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ── Ingresos por plan ────────────────────────────────────────── */
export function PlanBreakdown() {
  const total = BY_PLAN.reduce((a, b) => a + b.amount, 0);
  const max = Math.max(...BY_PLAN.map((p) => p.amount));
  return (
    <ul className="@container flex h-full flex-col justify-between gap-4">
      {BY_PLAN.map((p, i) => (
        <li key={p.name} className="group">
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-[13px] font-bold text-fg">
              <span
                className="size-2.5 shrink-0 rounded-[4px]"
                style={{ background: p.color }}
              />
              <span className="truncate">{p.name}</span>
              <span className="hidden shrink-0 text-[11.5px] font-semibold text-faint @[340px]:inline">
                {fmt(p.members)} socios
              </span>
            </span>
            <span className="flex shrink-0 items-baseline gap-2.5">
              <span className="text-[13.5px] font-extrabold text-fg tabular">
                {compactMoney(p.amount)}
              </span>
              <Delta value={p.delta} className="w-[52px] justify-end" />
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.05]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(p.amount / max) * 100}%` }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease }}
              className="h-full rounded-full transition-[filter] group-hover:brightness-125"
              style={{
                background: p.color,
                boxShadow: `0 0 12px -3px ${p.color}`,
              }}
            />
          </div>
          <p className="mt-1 text-[11px] font-semibold text-faint tabular">
            {pctFmt((p.amount / total) * 100)}% de las cuotas
          </p>
        </li>
      ))}
    </ul>
  );
}

/* ── Ingresos por medio de pago ───────────────────────────────── */
export function MethodBreakdown() {
  const [hover, setHover] = useState<string | null>(null);
  const active = BY_METHOD.find((m) => m.key === hover) ?? BY_METHOD[0];
  return (
    <div className="@container">
      <div className="flex flex-col items-center gap-5 @[400px]:flex-row">
        <Donut
          data={BY_METHOD.map((m) => ({
            name: m.name,
            value: m.share,
            color: m.color,
          }))}
          size={136}
          thickness={16}
        >
          <div>
            <p className="text-[22px] font-extrabold leading-none tracking-[-0.03em] text-fg tabular">
              {pctFmt(active.share)}%
            </p>
            <p className="mt-1 max-w-[84px] text-[10.5px] font-semibold leading-tight text-muted">
              {active.name}
            </p>
          </div>
        </Donut>
        <ul
          className="w-full min-w-0 flex-1 space-y-1"
          onMouseLeave={() => setHover(null)}
        >
          {BY_METHOD.map((m) => (
            <li
              key={m.key}
              onMouseEnter={() => setHover(m.key)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] transition-colors",
                hover === m.key ? "bg-white/[0.05]" : "",
              )}
            >
              <span
                className="size-2.5 shrink-0 rounded-[4px]"
                style={{ background: m.color }}
              />
              <span className="min-w-0 flex-1 truncate font-semibold text-fg-2">
                {m.name}
              </span>
              <span className="font-bold text-fg tabular">
                {compactMoney(m.amount)}
              </span>
              <span
                className={cn(
                  "w-11 text-right text-[11.5px] font-bold tabular",
                  m.delta >= 0 ? "text-lime" : "text-muted",
                )}
              >
                {m.delta > 0 ? "+" : ""}
                {pctFmt(m.delta)} pp
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Motivos de baja ──────────────────────────────────────────── */
export function ChurnReasons({ limit }: { limit?: number }) {
  const total = CHURN_REASONS.reduce((a, b) => a + b.value, 0);
  const avoidable = CHURN_REASONS.filter((r) => r.avoidable).reduce(
    (a, b) => a + b.value,
    0,
  );
  const rows = limit ? CHURN_REASONS.slice(0, limit) : CHURN_REASONS;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <p className="text-[34px] font-extrabold leading-none tracking-[-0.04em] text-fg tabular">
            {pctFmt(CHURN.rate)}
            <span className="text-[16px] text-muted">%</span>
          </p>
          <p className="mt-1.5 text-[11.5px] font-semibold text-muted">
            churn mensual ·{" "}
            <span className="text-lime">
              −{pctFmt(CHURN.prevRate - CHURN.rate)} pp
            </span>{" "}
            vs. oct.
          </p>
        </div>
        <div className="whitespace-nowrap text-right text-[11.5px] font-semibold leading-relaxed text-muted">
          <p>
            <b className="font-extrabold text-fg tabular">{CHURN.renewed}</b>{" "}
            renovaron
          </p>
          <p>
            <b className="font-extrabold text-fg tabular">{CHURN.bajas}</b> se
            dieron de baja
          </p>
        </div>
      </div>
      {/* barra de motivos */}
      <div className="mt-4 flex h-2 gap-[3px] overflow-hidden rounded-full">
        {CHURN_REASONS.map((r) => (
          <span
            key={r.label}
            className="h-full"
            style={{
              width: `${(r.value / total) * 100}%`,
              background: r.color,
            }}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2.5">
        {rows.map((r, i) => (
          <li key={r.label} className="flex items-center gap-3">
            <span className="w-6 text-right text-[15px] font-extrabold text-fg tabular">
              {r.value}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[12.5px] font-bold text-fg-2">
                  {r.label}
                </p>
                <p className="shrink-0 text-[11px] font-bold text-faint tabular">
                  {Math.round((r.value / total) * 100)}%
                </p>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(r.value / CHURN_REASONS[0].value) * 100}%`,
                  }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.06, ease }}
                  className="h-full rounded-full"
                  style={{ background: r.color }}
                />
              </div>
              {r.note && (
                <p className="mt-1 truncate text-[11px] text-muted">{r.note}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose/20 bg-rose/[0.06] p-3 text-[12px] leading-snug text-fg-2">
        <span className="mt-[5px] size-1.5 shrink-0 rounded-full bg-rose" />
        <span>
          <b className="font-extrabold text-fg tabular">{avoidable}</b> de{" "}
          {total} bajas eran evitables ({Math.round((avoidable / total) * 100)}
          %):{" "}
          <b className="font-extrabold text-fg tabular">
            {compactMoney(avoidable * CHURN_TICKET)}
          </b>{" "}
          de ingreso recurrente que se va cada mes.
        </span>
      </p>
    </div>
  );
}

/* ── Comparativa por sede ─────────────────────────────────────── */
const BRANCH_COLS = [
  { key: "revenue", label: "Ingresos · var.", wide: false },
  { key: "members", label: "Socios", wide: false },
  { key: "ticket", label: "Ticket prom.", wide: true },
  { key: "retention", label: "Retención", wide: false },
  { key: "net", label: "Altas / bajas", wide: false },
  { key: "occupancy", label: "Ocupación", wide: true },
  { key: "debt", label: "Con deuda", wide: false },
] as const;

export function BranchTable() {
  const best = (k: "delta" | "retention" | "occupancy" | "ticket") =>
    Math.max(...BRANCH_ROWS.map((b) => b[k]));
  const lowDebt = Math.min(...BRANCH_ROWS.map((b) => b.debt));
  const total = { revenue: REVENUE_NOV, members: MEMBERS_ACTIVE };

  return (
    <>
      {/* tabla md+ */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[600px] whitespace-nowrap text-left text-[13px]">
          <thead>
            <tr className="border-y border-line text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
              <th className="py-3 pl-5 pr-3 font-bold sm:pl-6">Sede</th>
              {BRANCH_COLS.map((c, i) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-3 py-3 text-right font-bold",
                    c.wide && "hidden min-[1680px]:table-cell",
                    i === BRANCH_COLS.length - 1 && "pr-5 sm:pr-6",
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BRANCH_ROWS.map((b) => {
              const share = (b.revenue / REVENUE_NOV) * 100;
              return (
                <tr
                  key={b.name}
                  className="group border-b border-line/60 transition-colors hover:bg-white/[0.025]"
                >
                  <td className="py-3 pl-5 pr-3 sm:pl-6">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={PHOTO[b.photo](120, 120)}
                        alt=""
                        className="photo-grade size-9 shrink-0 rounded-[10px] object-cover"
                        loading="lazy"
                      />
                      <div>
                        <p className="font-bold text-fg group-hover:text-lime">
                          {b.name}
                        </p>
                        <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-lime/70"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <p className="font-extrabold text-fg tabular">
                      {money(b.revenue)}
                    </p>
                    <Delta
                      value={b.delta}
                      className={cn(
                        "mt-0.5 text-[11.5px]",
                        b.delta === best("delta") &&
                          "rounded-full bg-lime/12 px-1.5",
                      )}
                    />
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-fg-2 tabular">
                    {fmt(b.members)}
                  </td>
                  <td
                    className={cn(
                      "hidden px-3 py-3 text-right font-semibold tabular min-[1680px]:table-cell",
                      b.ticket === best("ticket") ? "text-lime" : "text-fg-2",
                    )}
                  >
                    {money(b.ticket)}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-3 text-right font-bold tabular",
                      b.retention === best("retention")
                        ? "text-lime"
                        : "text-fg-2",
                    )}
                  >
                    {pctFmt(b.retention)}%
                  </td>
                  <td className="px-3 py-3 text-right font-semibold tabular">
                    <span className="text-lime">+{b.altas}</span>
                    <span className="text-faint"> / </span>
                    <span className="text-rose">−{b.bajas}</span>
                  </td>
                  <td className="hidden px-3 py-3 text-right min-[1680px]:table-cell">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-white/[0.06]">
                        <span
                          className="block h-full rounded-full bg-violet"
                          style={{ width: `${b.occupancy}%` }}
                        />
                      </span>
                      <span className="w-8 font-semibold text-fg-2 tabular">
                        {b.occupancy}%
                      </span>
                    </span>
                  </td>
                  <td className="py-3 pl-3 pr-5 text-right sm:pr-6">
                    <span
                      className={cn(
                        "font-bold tabular",
                        b.debt === lowDebt
                          ? "text-lime"
                          : b.debt > 12
                            ? "text-amber"
                            : "text-fg-2",
                      )}
                    >
                      {pctFmt(b.debt)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-white/[0.015] text-[12.5px] font-bold">
              <td className="py-3 pl-5 pr-3 text-muted sm:pl-6">
                Total 3 sedes
              </td>
              <td className="px-3 py-3 text-right">
                <p className="text-fg tabular">{money(total.revenue)}</p>
                <Delta value={12.3} className="mt-0.5 text-[11.5px]" />
              </td>
              <td className="px-3 py-3 text-right text-fg tabular">
                {fmt(total.members)}
              </td>
              <td className="hidden px-3 py-3 text-right text-fg-2 tabular min-[1680px]:table-cell">
                {money(Math.round(total.revenue / total.members / 10) * 10)}
              </td>
              <td className="px-3 py-3 text-right text-fg tabular">94,1%</td>
              <td className="px-3 py-3 text-right tabular">
                <span className="text-lime">+112</span>
                <span className="text-faint"> / </span>
                <span className="text-rose">−44</span>
              </td>
              <td className="hidden px-3 py-3 text-right text-fg-2 tabular min-[1680px]:table-cell">
                73%
              </td>
              <td className="py-3 pl-3 pr-5 text-right text-fg-2 tabular sm:pr-6">
                11,1%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* tarjetas mobile */}
      <ul className="divide-y divide-line/60 border-t border-line md:hidden">
        {BRANCH_ROWS.map((b) => (
          <li key={b.name} className="px-5 py-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PHOTO[b.photo](120, 120)}
                alt=""
                className="photo-grade size-10 shrink-0 rounded-[11px] object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-fg">{b.name}</p>
                <p className="text-[11.5px] text-muted">
                  {fmt(b.members)} socios ·{" "}
                  <span className="text-lime">+{b.altas}</span> /{" "}
                  <span className="text-rose">−{b.bajas}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-extrabold text-fg tabular">
                  {compactMoney(b.revenue)}
                </p>
                <Delta value={b.delta} />
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-4 gap-1.5 text-center">
              {[
                ["Ticket", compactMoney(b.ticket)],
                ["Retención", `${pctFmt(b.retention)}%`],
                ["Ocupación", `${b.occupancy}%`],
                ["Mora", `${pctFmt(b.debt)}%`],
              ].map(([l, v]) => (
                <div
                  key={l}
                  className="rounded-lg border border-line bg-white/[0.02] px-1 py-1.5"
                >
                  <dd className="text-[12.5px] font-extrabold text-fg tabular">
                    {v}
                  </dd>
                  <dt className="text-[10px] font-semibold text-muted">{l}</dt>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ── Lectura asistida (IA) ────────────────────────────────────── */
export function InsightCallout({
  items,
}: {
  items: {
    tone: "lime" | "amber" | "rose" | "violet";
    text: React.ReactNode;
    action: string;
    href: string;
  }[];
}) {
  const dot = {
    lime: "bg-lime",
    amber: "bg-amber",
    rose: "bg-rose",
    violet: "bg-violet",
  };
  return (
    <article className="panel glow-violet relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-violet/[0.14] blur-[70px]" />
      <div className="relative flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-[10px] bg-violet/15 text-violet ring-1 ring-violet/30">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-extrabold tracking-[-0.01em] text-fg">
            Lectura de Pulso IA
          </p>
          <p className="text-[11.5px] text-muted">
            Generado hoy 08:52 · 25 días de datos de Caja, Accesos y CRM
          </p>
        </div>
        <Pill tone="violet">{items.length} hallazgos</Pill>
      </div>
      <ol className="relative mt-4 grid gap-3 md:grid-cols-3">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex rounded-xl border border-line bg-ink/40 p-3.5 transition-colors hover:border-line-strong"
          >
            <div className="flex flex-1 gap-3">
              <span
                className={cn(
                  "mt-[7px] size-1.5 shrink-0 rounded-full",
                  dot[it.tone],
                )}
              />
              <div className="flex min-w-0 flex-col">
                <p className="text-[12.5px] leading-relaxed text-fg-2">
                  {it.text}
                </p>
                <Link
                  href={it.href}
                  className="mt-auto inline-flex pt-2 items-center gap-1 text-[12px] font-bold text-violet hover:text-fg"
                >
                  {it.action} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
