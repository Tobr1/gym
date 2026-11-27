import type { Metadata } from "next";
import { Suspense } from "react";
import { Download } from "lucide-react";
import { DIRECTORY, PLATFORM } from "../_data";
import { TenantDirectoryFromUrl } from "./_components/directory";
import { fmt } from "@/lib/utils";

export const metadata: Metadata = { title: "Gimnasios · Super Admin" };

export default function GimnasiosPage() {
  return (
    <>
      <div className="stagger mb-4 flex flex-wrap items-end justify-between gap-3" style={{ "--i": 0 } as React.CSSProperties}>
        <div className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-muted">Directorio de cuentas</p>
          <p className="mt-1 text-[13.5px] text-fg-2">
            <span className="font-bold text-fg tabular">{fmt(PLATFORM.total)}</span> gimnasios en 4 países ·{" "}
            <span className="font-bold text-fg tabular">{fmt(PLATFORM.sedes)}</span> sedes ·{" "}
            <span className="font-bold text-fg tabular">{fmt(PLATFORM.socios)}</span> socios
          </p>
          {/* 326 + 18 + 4 = 348: cuadra con las tarjetas de abajo */}
          <p className="mt-0.5 text-[12px] font-medium text-muted">
            {fmt(PLATFORM.active)} activos · {fmt(PLATFORM.trials)} en prueba · {fmt(PLATFORM.suspended)} suspendidos
          </p>
        </div>
        <button className="hidden h-9 items-center gap-2 rounded-xl border border-line px-3.5 text-[12.5px] font-semibold text-fg-2 transition hover:border-line-strong hover:text-fg sm:flex">
          <Download className="size-4" /> Exportar CSV
        </button>
      </div>
      <Suspense fallback={<DirectorySkeleton />}>
        <TenantDirectoryFromUrl rows={DIRECTORY} />
      </Suspense>
    </>
  );
}

function DirectorySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel-flat h-[132px] sm:h-[150px]" />
        ))}
      </div>
      <div className="panel-flat mt-4 h-[720px]" />
    </div>
  );
}
