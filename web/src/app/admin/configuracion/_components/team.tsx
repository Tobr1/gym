"use client";

import { Fragment, useState } from "react";
import { AlertTriangle, Lock, Mail, MoreHorizontal, Send, ShieldCheck, ShieldOff, UserPlus, UsersRound } from "lucide-react";
import { Avatar, AvatarStack, Button, Pill } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { INITIAL_MATRIX, PERMISSIONS, ROLE_META, ROLES, STAFF, type Role, type Staff } from "../_data";
import { Field, SectionHead, Select, SettingRow, Sheet, TextInput, Toggle, s, useSetting, useTouch } from "./controls";

const BRANCH_OPTIONS = ["Todas las sedes", "Sede Centro", "Sede Norte", "Sede Parque"] as const;
const GROUPS = Array.from(new Set(PERMISSIONS.map((p) => p.group)));
type Matrix = Record<Exclude<Role, "admin">, string[]>;

export function TeamSection() {
  const touch = useTouch();
  const [staff, setStaff] = useState<Staff[]>(STAFF);
  const [filter, setFilter] = useState<Role | null>(null);
  const [matrix, setMatrix] = useState<Matrix>(INITIAL_MATRIX);
  const [inviting, setInviting] = useState(false);

  const count = (r: Role) => staff.filter((x) => x.role === r).length;
  const perms = (r: Role) => (r === "admin" ? PERMISSIONS.length : matrix[r].length);
  const shown = filter ? staff.filter((x) => x.role === filter) : staff;
  const with2fa = staff.filter((x) => x.twoFA).length;

  const setRole = (id: string, role: Role) => {
    setStaff((st) => st.map((x) => (x.id === id ? { ...x, role } : x)));
    touch(`usuarios.${id}`);
  };
  const flip = (role: Exclude<Role, "admin">, key: string) => {
    setMatrix((m) => ({ ...m, [role]: m[role].includes(key) ? m[role].filter((k) => k !== key) : [...m[role], key] }));
    touch(`usuarios.permisos.${role}`);
  };

  return (
    <section className="@container">
      <SectionHead
        icon={UsersRound}
        title="Usuarios y permisos"
        text={
          <>
            {staff.length} personas en el equipo · {ROLES.length} roles · 2FA activo en{" "}
            <span className="font-semibold text-fg-2 tabular">
              {with2fa} de {staff.length}
            </span>
          </>
        }
      >
        <Button onClick={() => setInviting(true)}>
          <UserPlus className="size-4" /> Invitar persona
        </Button>
      </SectionHead>

      {/* ── Roles (filtran la tabla) ───────────────────── */}
      <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-4">
        {ROLES.map((r, i) => {
          const m = ROLE_META[r];
          const on = filter === r;
          const faces = staff.filter((x) => x.role === r).map((x) => x.face);
          return (
            <button
              key={r}
              type="button"
              onClick={() => setFilter(on ? null : r)}
              aria-pressed={on}
              className={cn(
                "panel stagger group overflow-hidden p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong",
                on && "border-transparent",
              )}
              style={{ ...s(i + 1), ...(on ? { boxShadow: `0 0 0 1px ${m.color}, 0 0 32px -10px ${m.color}` } : {}) }}
            >
              <span className="absolute inset-x-0 top-0 h-[2px] opacity-70" style={{ background: m.color }} />
              <span className="flex items-center justify-between gap-2">
                <span className="text-[13.5px] font-extrabold text-fg">{m.label}</span>
                <span className="text-[22px] font-extrabold leading-none tracking-[-0.03em] text-fg tabular">{count(r)}</span>
              </span>
              <span className="mt-0.5 block text-[11.5px] text-muted">{m.desc}</span>
              <span className="mt-3 flex items-center justify-between gap-2">
                <AvatarStack ids={faces.slice(0, 3)} size={24} />
                <span className="text-[11px] font-bold tabular" style={{ color: m.color }}>
                  {perms(r)}/{PERMISSIONS.length}<span className="hidden @lg:inline"> permisos</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Equipo ─────────────────────────────────────── */}
      <div className="panel stagger mt-4 overflow-hidden" style={s(5)}>
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
          <div>
            <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">Equipo</h3>
            <p className="text-[12.5px] text-muted">
              {filter ? `${shown.length} con rol ${ROLE_META[filter].label}` : "Cambiá el rol desde la tabla; el acceso se actualiza al guardar"}
            </p>
          </div>
          {filter && (
            <button type="button" onClick={() => setFilter(null)} className="text-[12px] font-bold text-lime hover:underline">
              Ver todos
            </button>
          )}
        </div>

        <div className="hidden grid-cols-[minmax(0,1.6fr)_150px_minmax(0,1fr)_minmax(0,0.9fr)_44px_36px] items-center gap-3 border-y border-line bg-ink/30 px-5 py-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint @2xl:grid">
          <span>Persona</span>
          <span>Rol</span>
          <span>Sede</span>
          <span>Última actividad</span>
          <span className="text-center">2FA</span>
          <span />
        </div>
        <ul className="divide-y divide-line border-t border-line @2xl:border-t-0">
          {shown.map((p) => (
            <li
              key={p.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-5 py-3 transition-colors hover:bg-white/[0.015] @2xl:grid-cols-[minmax(0,1.6fr)_150px_minmax(0,1fr)_minmax(0,0.9fr)_44px_36px]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative shrink-0">
                  <Avatar i={p.face} size={36} className={cn(p.pending && "opacity-50 grayscale")} />
                  {p.online && <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-lime ring-2 ring-surface" />}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="flex items-center gap-1.5 truncate text-[13.5px] font-bold text-fg">
                    <span className="truncate">{p.name}</span>
                    {p.id === "u1" && <span className="text-[11px] font-semibold text-muted">(vos)</span>}
                  </p>
                  <p className="truncate text-[11.5px] text-muted">{p.email}</p>
                </div>
              </div>
              <div className="@2xl:order-none">
                {p.id === "u1" ? (
                  <Pill tone="lime" className="text-[11px]">
                    <Lock className="size-3" /> Admin
                  </Pill>
                ) : (
                  <RoleSelect value={p.role} onChange={(r) => setRole(p.id, r)} />
                )}
              </div>
              <p className="col-span-2 -mt-1 flex flex-wrap items-center gap-x-2 pl-12 text-[12px] text-muted @2xl:col-span-1 @2xl:mt-0 @2xl:block @2xl:pl-0 @2xl:text-[12.5px] @2xl:text-fg-2">
                <span>{p.branch}</span>
                <span className="@2xl:hidden">·</span>
                <span className={cn("@2xl:hidden", p.pending && "text-amber", p.online && "font-semibold text-lime")}>{p.online ? "En línea" : p.last}</span>
              </p>
              <p className={cn("hidden text-[12.5px] @2xl:block", p.pending ? "font-semibold text-amber" : p.online ? "font-semibold text-lime" : "text-muted")}>
                {p.online ? "En línea" : p.last}
              </p>
              <span className="hidden justify-center @2xl:flex" title={p.twoFA ? "Verificación en 2 pasos activa" : "Sin verificación en 2 pasos"}>
                {p.twoFA ? <ShieldCheck className="size-[17px] text-lime" /> : <ShieldOff className="size-[17px] text-faint" />}
              </span>
              <button
                type="button"
                aria-label={`Más acciones para ${p.name}`}
                className="hidden size-8 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-fg @2xl:grid"
              >
                {p.pending ? <Mail className="size-4" /> : <MoreHorizontal className="size-4" />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Matriz de permisos ─────────────────────────── */}
      <div className="panel stagger mt-4 overflow-hidden" style={s(6)}>
        <div className="flex flex-col gap-1 px-5 pb-3 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-[15px] font-bold tracking-[-0.01em] text-fg">Permisos por rol</h3>
            <p className="text-[12.5px] text-muted">Admin tiene acceso total y no se puede limitar</p>
          </div>
          <p className="flex items-center gap-1.5 text-[11.5px] text-muted">
            <AlertTriangle className="size-3.5 text-amber" /> Sensible: queda registrado en el historial
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_repeat(4,44px)] items-center gap-x-1 border-y border-line bg-ink/30 px-3 py-2.5 @xl:grid-cols-[minmax(0,1fr)_repeat(4,92px)] @xl:px-5">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">Permiso</span>
          {ROLES.map((r) => (
            <span key={r} className="flex flex-col items-center gap-1 text-center">
              <span className="size-1.5 rounded-full" style={{ background: ROLE_META[r].color }} />
              <span className="text-[10.5px] font-bold text-fg-2 @xl:text-[11.5px]">
                <span className="@xl:hidden">{ROLE_META[r].label.slice(0, 3)}.</span>
                <span className="hidden @xl:inline">{ROLE_META[r].label}</span>
              </span>
            </span>
          ))}
        </div>

        <div className="px-3 pb-2 @xl:px-5">
          {GROUPS.map((g) => (
            <Fragment key={g}>
              <p className="pb-1 pt-3.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">{g}</p>
              {PERMISSIONS.filter((p) => p.group === g).map((p) => (
                <div
                  key={p.key}
                  className="grid grid-cols-[minmax(0,1fr)_repeat(4,44px)] items-center gap-x-1 rounded-lg py-2 transition-colors hover:bg-white/[0.02] @xl:grid-cols-[minmax(0,1fr)_repeat(4,92px)]"
                >
                  <span className="flex min-w-0 items-center gap-1.5 pr-1 text-[12.5px] font-semibold text-fg-2 @xl:text-[13px]">
                    <span className="min-w-0">{p.label}</span>
                    {p.sensitive && <AlertTriangle className="size-3.5 shrink-0 text-amber" aria-label="Sensible" />}
                  </span>
                  {ROLES.map((r) => (
                    <span key={r} className="flex justify-center">
                      {r === "admin" ? (
                        <span className="grid h-[18px] w-[32px] place-items-center rounded-full bg-lime/15 text-lime" title="Siempre activo">
                          <Lock className="size-3" />
                        </span>
                      ) : (
                        <Toggle
                          size="sm"
                          checked={matrix[r].includes(p.key)}
                          onChange={() => flip(r, p.key)}
                          color={ROLE_META[r].color}
                          label={`${p.label} · ${ROLE_META[r].label}`}
                        />
                      )}
                    </span>
                  ))}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      <Security total={staff.length} with2fa={with2fa} />

      <Sheet open={inviting} onClose={() => setInviting(false)} title="Invitar al equipo" subtitle="Le llega un mail para crear su contraseña">
        <InviteForm
          onCancel={() => setInviting(false)}
          onInvite={(email, role, branch) => {
            const id = `n-${Date.now()}`;
            const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Nueva persona";
            setStaff((st) => [...st, { id, name, face: 4, email, role, branch, last: "Invitación enviada", twoFA: false, pending: true }]);
            touch(`usuarios.${id}`);
            setInviting(false);
          }}
        />
      </Sheet>
    </section>
  );
}

function RoleSelect({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <div className="relative w-[132px] @2xl:w-[140px]">
      <span className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-2 -translate-y-1/2 rounded-full" style={{ background: ROLE_META[value].color }} />
      <Select
        compact
        value={value}
        onChange={onChange}
        label="Rol"
        className="[&>button]:pl-6"
        options={ROLES.map((r) => ({ value: r, label: ROLE_META[r].label }))}
      />
    </div>
  );
}

function Security({ total, with2fa }: { total: number; with2fa: number }) {
  const [force, setForce] = useSetting("usuarios.seguridad", false);
  const [timeout, setTimeoutV] = useSetting("usuarios.seguridad", "30 min");
  const [pin, setPin] = useSetting("usuarios.seguridad", true);
  return (
    <div className="panel stagger mt-4 grid gap-x-8 px-5 py-1 @3xl:grid-cols-3" style={s(7)}>
      <SettingRow title="Exigir 2FA a todos" text={`Hoy lo usan ${with2fa} de ${total}`} className="@3xl:border-r @3xl:border-line @3xl:pr-6">
        <Toggle checked={force} onChange={setForce} label="Exigir 2FA" />
      </SettingRow>
      <SettingRow title="PIN para anular cobros" text="Lo pide la caja en cada anulación" className="border-t border-line @3xl:border-r @3xl:border-t-0 @3xl:pr-6">
        <Toggle checked={pin} onChange={setPin} label="PIN para anular" />
      </SettingRow>
      <SettingRow title="Sesión inactiva" text="Se cierra sola" className="border-t border-line @3xl:border-t-0">
        <Select compact className="w-[104px]" value={timeout} onChange={setTimeoutV} options={["15 min", "30 min", "1 hora", "4 horas"]} label="Cerrar sesión" />
      </SettingRow>
    </div>
  );
}

function InviteForm({ onInvite, onCancel }: { onInvite: (email: string, role: Role, branch: string) => void; onCancel: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("recepcion");
  const [branch, setBranch] = useState<string>("Sede Centro");
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  return (
    <div className="space-y-5">
      <Field label="Email">
        <TextInput icon={Mail} type="email" value={email} onChange={setEmail} placeholder="nombre@ironfactory.com.ar" autoFocus />
      </Field>
      <Field label="Rol">
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => {
            const on = role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn("rounded-xl border p-3 text-left transition", on ? "bg-white/[0.04]" : "border-line hover:border-line-strong")}
                style={on ? { borderColor: ROLE_META[r].color, boxShadow: `0 0 0 3px color-mix(in srgb, ${ROLE_META[r].color} 12%, transparent)` } : undefined}
              >
                <span className="flex items-center gap-2 text-[13px] font-extrabold text-fg">
                  <span className="size-2 rounded-full" style={{ background: ROLE_META[r].color }} />
                  {ROLE_META[r].label}
                </span>
                <span className="mt-0.5 block text-[11.5px] text-muted">{ROLE_META[r].desc}</span>
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Sede">
        <Select value={branch} onChange={setBranch} options={BRANCH_OPTIONS} label="Sede" />
      </Field>
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button disabled={!valid} onClick={() => onInvite(email, role, branch)}>
          <Send className="size-4" /> Enviar invitación
        </Button>
      </div>
    </div>
  );
}
