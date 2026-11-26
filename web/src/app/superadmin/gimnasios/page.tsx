import type { Metadata } from "next";
import { Download } from "lucide-react";
import { DIRECTORY, PLATFORM } from "../_data";
import { TenantDirectory } from "./_components/directory";
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
        </div>
        <button className="hidden h-9 items-center gap-2 rounded-xl border border-line px-3.5 text-[12.5px] font-semibold text-fg-2 transition hover:border-line-strong hover:text-fg sm:flex">
          <Download className="size-4" /> Exportar CSV
        </button>
      </div>
      <TenantDirectory rows={DIRECTORY} />
    </>
  );
}
