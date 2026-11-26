import type { Metadata } from "next";
import { Copy, History, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { Button } from "@/components/ui/primitives";
import { RoutineBuilder } from "./_components/builder";

export const metadata: Metadata = { title: "Constructor de rutinas" };

export default function RutinasPage() {
  return (
    <>
      <PageHeader eyebrow="Plantillas · 24 rutinas activas · 138 socios asignados" title="Constructor de rutinas">
        <span className="mr-1 hidden items-center gap-1.5 text-[12px] font-semibold text-muted xl:flex">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-lime/70" />
            <span className="relative size-2 rounded-full bg-lime" />
          </span>
          Autoguardado
        </span>
        <Button variant="ghost" size="icon" aria-label="Historial de versiones" className="border border-line">
          <History className="size-4" />
        </Button>
        <Button variant="secondary" aria-label="Duplicar rutina" className="sm:max-xl:w-10 sm:max-xl:px-0">
          <Copy className="size-4" /> <span className="sm:max-xl:sr-only">Duplicar</span>
        </Button>
        <Button variant="secondary">
          <Smartphone className="size-4" /> Vista del socio
        </Button>
      </PageHeader>
      <RoutineBuilder />
    </>
  );
}
