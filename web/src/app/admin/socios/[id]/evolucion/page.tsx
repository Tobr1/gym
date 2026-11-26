import type { Metadata } from "next";
import { Suspense } from "react";
import { TabSkeleton, tabMetadata, WithProfile } from "../../_components/kit";
import { EvolucionTab } from "../../_components/evolucion";
import { memberParams } from "../../_lib/profile";

export function generateStaticParams() {
  return memberParams();
}

export async function generateMetadata({ params }: PageProps<"/admin/socios/[id]/evolucion">): Promise<Metadata> {
  return tabMetadata((await params).id, "Evolución");
}

export default function EvolucionPage({ params }: PageProps<"/admin/socios/[id]/evolucion">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <WithProfile params={params} render={(p) => <EvolucionTab p={p} />} />
    </Suspense>
  );
}
