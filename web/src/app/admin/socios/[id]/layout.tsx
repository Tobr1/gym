import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProfileHero } from "../_components/hero";
import { ProfileTabs } from "../_components/tabs";
import { getNotes } from "../_lib/notes";
import { getProfile, memberParams } from "../_lib/profile";

export function generateStaticParams() {
  return memberParams();
}

/** Ficha integral: el hero y las pestañas persisten entre Resumen, Pagos, Asistencia, Rutina, Evolución y Notas. */
export default function SocioLayout({ children, params }: LayoutProps<"/admin/socios/[id]">) {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header params={params} />
      </Suspense>
      {children}
    </>
  );
}

async function Header({ params }: { params: LayoutProps<"/admin/socios/[id]">["params"] }) {
  const { id } = await params;
  const p = getProfile(id);
  if (!p) notFound();
  return (
    <>
      <ProfileHero p={p} />
      <ProfileTabs
        id={id}
        counts={{
          pagos: p.payments.length,
          asistencia: p.stats.visits,
          notas: getNotes(p).length,
          alert: p.member.status === "vencido" ? "pagos" : undefined,
        }}
      />
    </>
  );
}

function HeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="panel h-[360px]" />
      <div className="mt-4 h-12 rounded-xl bg-white/[0.03]" />
    </div>
  );
}
