import type { Metadata } from "next";
import { Suspense } from "react";
import { TabSkeleton, tabMetadata, WithProfile } from "../../_components/kit";
import { PagosTab } from "../../_components/pagos";
import { memberParams } from "../../_lib/profile";

export function generateStaticParams() {
  return memberParams();
}

export async function generateMetadata({ params }: PageProps<"/admin/socios/[id]/pagos">): Promise<Metadata> {
  return tabMetadata((await params).id, "Pagos");
}

export default function PagosPage({ params }: PageProps<"/admin/socios/[id]/pagos">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <WithProfile params={params} render={(p) => <PagosTab p={p} />} />
    </Suspense>
  );
}
