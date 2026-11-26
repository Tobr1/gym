import type { Metadata } from "next";
import Link from "next/link";
import { Flame, HeartPulse, Timer } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AvatarStack } from "@/components/ui/primitives";
import { PHOTO } from "@/lib/photos";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Ingresar" };

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.08fr_1fr]">
      {/* ── Lado visual ───────────────────────────────── */}
      <aside className="noise relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PHOTO.backMan(1400, 1800)} alt="Atleta en el gimnasio" className="absolute inset-0 h-full w-full object-cover object-[50%_0%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-ink" />
        <div className="absolute -left-40 bottom-0 h-[520px] w-[520px] rounded-full bg-lime/20 blur-[140px]" />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Link href="/">
            <Logo />
          </Link>

          {/* métricas flotantes */}
          <div className="pointer-events-none absolute right-16 top-[22%] space-y-3">
            {[
              { icon: HeartPulse, label: "Frecuencia", value: "142", unit: "bpm", c: "text-rose bg-rose/15" },
              { icon: Flame, label: "Calorías", value: "824", unit: "kcal", c: "text-amber bg-amber/15" },
              { icon: Timer, label: "Sesión", value: "52:18", unit: "min", c: "text-lime bg-lime/15" },
            ].map((m, i) => (
              <div
                key={m.label}
                className="stagger flex w-[210px] items-center gap-3 rounded-2xl border border-white/10 bg-ink/55 p-3 backdrop-blur-xl"
                style={{ "--i": i + 2, marginLeft: i === 1 ? -36 : 0 } as React.CSSProperties}
              >
                <span className={`grid size-10 place-items-center rounded-xl ${m.c}`}>
                  <m.icon className="size-5" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-muted">{m.label}</p>
                  <p className="text-[19px] font-extrabold leading-tight text-fg tabular">
                    {m.value} <span className="text-[12px] font-semibold text-muted">{m.unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-[520px]">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-lime">Disciplina · Constancia · Resultados</p>
            <h2 className="mt-4 text-[52px] font-extrabold leading-[0.98] tracking-[-0.045em] text-fg xl:text-[60px]">
              Cada repetición
              <br />
              cuenta. Cada socio
              <br />
              <span className="text-gradient-lime">también.</span>
            </h2>
            <div className="mt-8 flex items-center gap-3 text-[13.5px] text-fg-2">
              <AvatarStack ids={[1, 3, 4, 6]} size={30} extra={320} />
              <span>gimnasios entrenan con nosotros</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Formulario ────────────────────────────────── */}
      <main className="relative flex flex-col">
        {/* banda fotográfica en mobile */}
        <div className="relative h-56 overflow-hidden lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTO.backMan(900, 1100)} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_8%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/30 to-ink" />
          <Link href="/" className="absolute left-5 top-5">
            <Logo />
          </Link>
        </div>

        <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-violet/10 blur-[120px]" />

        <div className="relative mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-5 pb-12 -mt-10 lg:mt-0 lg:px-8 lg:py-10">
          <div className="stagger">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-lime lg:hidden">
              Disciplina · Constancia · Resultados
            </p>
            <h1 className="text-[32px] font-extrabold leading-tight tracking-[-0.04em] text-fg sm:text-[38px]">
              Bienvenido de nuevo
            </h1>
            <p className="mt-2 text-[15px] text-muted">Ingresá para seguir haciendo crecer tu comunidad.</p>
          </div>
          <div className="stagger mt-8" style={{ "--i": 1 } as React.CSSProperties}>
            <LoginForm />
          </div>
          <p className="stagger mt-8 text-center text-[13.5px] text-muted" style={{ "--i": 2 } as React.CSSProperties}>
            ¿Todavía no tenés cuenta?{" "}
            <Link href="/" className="font-bold text-lime hover:underline">
              Probá 14 días gratis
            </Link>
          </p>
        </div>

        <footer className="relative flex items-center justify-between px-6 pb-6 text-[12px] text-faint lg:px-10">
          <span>© 2026 Pulso</span>
          <span className="flex gap-4">
            <a href="#" className="hover:text-fg-2">Privacidad</a>
            <a href="#" className="hover:text-fg-2">Términos</a>
            <Link href="/superadmin" className="hover:text-fg-2">Super Admin</Link>
          </span>
        </footer>
      </main>
    </div>
  );
}
