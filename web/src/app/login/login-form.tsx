"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Building2, Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const ROLES = [
  { id: "gym", label: "Soy gimnasio", icon: Building2, to: "/admin" },
  { id: "member", label: "Soy socio", icon: UserRound, to: "/app" },
] as const;

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("gym");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const target = ROLES.find((r) => r.id === role)!.to;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => router.push(target), 650);
      }}
      className="space-y-5"
    >
      {/* selector de rol */}
      <div className="relative grid grid-cols-2 rounded-2xl border border-line bg-white/[0.02] p-1">
        <span
          className={cn(
            "absolute inset-y-1 w-[calc(50%-4px)] rounded-xl bg-surface-3 shadow-lg ring-1 ring-line-strong transition-transform duration-300 ease-out",
            role === "member" ? "translate-x-[calc(100%+0px)]" : "translate-x-0",
          )}
        />
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRole(r.id)}
            className={cn(
              "relative z-10 flex h-10 items-center justify-center gap-2 text-[13.5px] font-bold transition-colors",
              role === r.id ? "text-fg" : "text-muted hover:text-fg-2",
            )}
          >
            <r.icon className={cn("size-4", role === r.id && "text-lime")} />
            {r.label}
          </button>
        ))}
      </div>

      <Field label={role === "gym" ? "Email de trabajo" : "Email o DNI"} icon={Mail}>
        <input
          type="text"
          autoComplete="username"
          defaultValue={role === "gym" ? "carolina@ironfactory.com.ar" : ""}
          placeholder={role === "gym" ? "vos@tugimnasio.com" : "tu email o DNI"}
          className="peer h-12 w-full bg-transparent pl-11 pr-4 text-[14.5px] font-medium text-fg placeholder:text-faint focus:outline-none"
        />
      </Field>

      <Field
        label="Contraseña"
        icon={Lock}
        extra={
          <a href="#" className="text-[12.5px] font-semibold text-lime hover:underline">
            ¿La olvidaste?
          </a>
        }
      >
        <input
          type={show ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••••"
          className="h-12 w-full bg-transparent pl-11 pr-12 text-[14.5px] font-medium text-fg placeholder:text-faint focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-fg"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </Field>

      <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-fg-2">
        <input type="checkbox" defaultChecked className="peer sr-only" />
        <span className="grid size-[18px] place-items-center rounded-md border border-line-strong transition peer-checked:border-lime peer-checked:bg-lime [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
          <svg viewBox="0 0 12 12" className="size-3 text-lime-ink">
            <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        Mantener la sesión iniciada
      </label>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-lime-ink/30 border-t-lime-ink" />
            Ingresando…
          </span>
        ) : (
          <>
            Ingresar <ArrowRight className="size-4" strokeWidth={2.6} />
          </>
        )}
      </Button>

      <div className="flex items-center gap-3 text-[12px] font-semibold text-faint">
        <span className="h-px flex-1 bg-line" /> o continuá con <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" size="lg" className="text-[14px]">
          <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z" />
          </svg>
          Google
        </Button>
        <Button type="button" variant="secondary" size="lg" className="text-[14px]">
          <svg viewBox="0 0 24 24" className="size-[18px] fill-fg" aria-hidden>
            <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.5-3.8zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" />
          </svg>
          Apple
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  icon: Icon,
  extra,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-bold text-fg-2">{label}</span>
        {extra}
      </div>
      <div className="relative rounded-xl border border-line-strong bg-white/[0.03] transition focus-within:border-lime/60 focus-within:bg-lime/[0.03] focus-within:shadow-[0_0_0_4px_rgb(181_245_74/0.08)]">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
        {children}
      </div>
    </div>
  );
}
