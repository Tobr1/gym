import type { Metadata } from "next";
import { History } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { Avatar, Button } from "@/components/ui/primitives";
import { Settings } from "./_components/settings";

export const metadata: Metadata = { title: "Configuración" };

export default function ConfiguracionPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Iron Factory · 3 sedes · Plan Pro</span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              · Último cambio hoy 08:14 por <Avatar i={12} size={18} /> Carolina V.
            </span>
          </span>
        }
        title="Configuración"
      >
        <Button variant="secondary">
          <History className="size-4" /> Historial de cambios
        </Button>
      </PageHeader>
      <Settings />
    </>
  );
}
