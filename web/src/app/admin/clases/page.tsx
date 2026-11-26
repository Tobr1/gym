import type { Metadata } from "next";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { Button } from "@/components/ui/primitives";
import { ClassCalendar } from "./_components/calendar";

export const metadata: Metadata = { title: "Calendario de clases" };

export default function ClasesPage() {
  return (
    <>
      <PageHeader eyebrow="Semana 48 · Sede Centro · 5 disciplinas" title="Calendario de clases">
        <Button variant="secondary">
          <Download className="size-4" /> Exportar
        </Button>
        <Button>
          <Plus className="size-4" strokeWidth={2.6} /> Nueva clase
        </Button>
      </PageHeader>
      <ClassCalendar />
    </>
  );
}
