import type { Metadata } from "next";
import { Suspense } from "react";
import { TabSkeleton, tabMetadata, WithProfile } from "../../_components/kit";
import { AsistenciaTab } from "../../_components/asistencia";
import { memberParams } from "../../_lib/profile";

export function generateStaticParams() {
  return memberParams();
}

export async function generateMetadata({ params }: PageProps<"/admin/socios/[id]/asistencia">): Promise<Metadata> {
  return tabMetadata((await params).id, "Asistencia");
}

export default function AsistenciaPage({ params }: PageProps<"/admin/socios/[id]/asistencia">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <WithProfile params={params} render={(p) => <AsistenciaTab p={p} />} />
    </Suspense>
  );
}
