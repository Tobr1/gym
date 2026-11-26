import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  AttendanceHeatmap,
  BodyProgress,
  HealthCard,
  MembershipCard,
  PaymentsTable,
  BookingsCard,
  PersonalCard,
  RoutineCard,
  Timeline,
} from "../_components/sections";
import { tabMetadata } from "../_components/kit";
import { getProfile, memberParams } from "../_lib/profile";

export async function generateMetadata({ params }: PageProps<"/admin/socios/[id]">): Promise<Metadata> {
  return tabMetadata((await params).id, "Ficha del socio");
}

export function generateStaticParams() {
  return memberParams();
}

export default function SocioPage({ params }: PageProps<"/admin/socios/[id]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile params={params} />
    </Suspense>
  );
}

async function Profile({ params }: { params: PageProps<"/admin/socios/[id]">["params"] }) {
  const { id } = await params;
  const p = getProfile(id);
  if (!p) notFound();

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      {/* Columna principal */}
      <div className="grid min-w-0 grid-cols-1 content-start gap-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.3fr)]">
          <MembershipCard p={p} i={2} />
          <AttendanceHeatmap p={p} i={3} />
        </div>
        <BodyProgress p={p} i={4} />
        <RoutineCard p={p} i={5} />
        <PaymentsTable p={p} i={6} />
      </div>

      {/* Columna lateral */}
      <aside className="grid min-w-0 content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
        <div className="md:col-span-2 xl:col-span-1">
          <Timeline p={p} i={3} />
        </div>
        <HealthCard p={p} i={4} />
        <PersonalCard p={p} i={5} />
        <div className="md:col-span-2 xl:col-span-1">
          <BookingsCard p={p} i={6} />
        </div>
      </aside>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mt-6 grid animate-pulse gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-4">
        <div className="grid gap-4 lg:grid-cols-[0.92fr_1.3fr]">
          <div className="panel h-[480px]" />
          <div className="panel h-[480px]" />
        </div>
        <div className="panel h-[320px]" />
      </div>
      <div className="panel h-[640px]" />
    </div>
  );
}
