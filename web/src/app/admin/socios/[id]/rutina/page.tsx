import type { Metadata } from "next";
import { Suspense } from "react";
import { TabSkeleton, tabMetadata, WithProfile } from "../../_components/kit";
import { RutinaTab } from "../../_components/rutina";
import { memberParams } from "../../_lib/profile";

export function generateStaticParams() {
  return memberParams();
}

export async function generateMetadata({ params }: PageProps<"/admin/socios/[id]/rutina">): Promise<Metadata> {
  return tabMetadata((await params).id, "Rutina");
}

export default function RutinaPage({ params }: PageProps<"/admin/socios/[id]/rutina">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <WithProfile params={params} render={(p) => <RutinaTab p={p} />} />
    </Suspense>
  );
}
