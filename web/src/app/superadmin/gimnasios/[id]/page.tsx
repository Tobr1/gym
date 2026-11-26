import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTenantDetail, tenantParams } from "../_lib/detail";
import {
  AuditCard,
  BillingCard,
  BranchesCard,
  FlagsCard,
  HealthCard,
  TenantHero,
  TicketsCard,
  UsageCard,
} from "../_components/tenant-sections";

export function generateStaticParams() {
  return tenantParams();
}

export async function generateMetadata({ params }: PageProps<"/superadmin/gimnasios/[id]">): Promise<Metadata> {
  const d = getTenantDetail((await params).id);
  return { title: d ? `${d.t.name} · Gimnasios · Super Admin` : "Gimnasio · Super Admin" };
}

export default function TenantPage({ params }: PageProps<"/superadmin/gimnasios/[id]">) {
  return (
    <Suspense fallback={<TenantSkeleton />}>
      <Tenant params={params} />
    </Suspense>
  );
}

async function Tenant({ params }: { params: PageProps<"/superadmin/gimnasios/[id]">["params"] }) {
  const { id } = await params;
  const d = getTenantDetail(id);
  if (!d) notFound();

  return (
    <div className="space-y-4">
      <TenantHero d={d} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* columna principal */}
        <div className="grid min-w-0 content-start gap-4">
          <HealthCard d={d} i={1} />
          <UsageCard d={d} i={2} />
          <BillingCard d={d} i={3} />
          <BranchesCard d={d} i={4} />
        </div>
        {/* columna lateral */}
        <aside className="grid min-w-0 content-start gap-4 md:grid-cols-2 xl:grid-cols-1">
          <FlagsCard d={d} i={3} />
          <TicketsCard d={d} i={4} />
          <div className="md:col-span-2 xl:col-span-1">
            <AuditCard d={d} i={5} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function TenantSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="panel h-[340px]" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="panel h-[480px]" />
            <div className="panel h-[480px]" />
          </div>
          <div className="panel h-[360px]" />
        </div>
        <div className="panel h-[720px]" />
      </div>
    </div>
  );
}
