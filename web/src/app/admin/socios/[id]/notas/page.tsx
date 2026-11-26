import type { Metadata } from "next";
import { Suspense } from "react";
import { TabSkeleton, tabMetadata, WithProfile } from "../../_components/kit";
import { NotasTab } from "../../_components/notas";
import { memberParams } from "../../_lib/profile";

export function generateStaticParams() {
  return memberParams();
}

export async function generateMetadata({ params }: PageProps<"/admin/socios/[id]/notas">): Promise<Metadata> {
  return tabMetadata((await params).id, "Notas");
}

export default function NotasPage({ params }: PageProps<"/admin/socios/[id]/notas">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <WithProfile params={params} render={(p) => <NotasTab p={p} />} />
    </Suspense>
  );
}
