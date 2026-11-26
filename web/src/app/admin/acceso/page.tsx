import type { Metadata } from "next";
import { Maximize2, Unlock } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { Button } from "@/components/ui/primitives";
import { AccessConsole } from "./_components/console";

export const metadata: Metadata = { title: "Control de acceso" };

export default function AccesoPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime" />
              <span className="relative size-2 rounded-full bg-lime" />
            </span>
            En vivo · Sede Centro · 3 accesos conectados
          </span>
        }
        title="Control de acceso"
      >
        <Button variant="secondary">
          <Unlock className="size-4" /> Abrir molinete
        </Button>
        <Button variant="outline-lime">
          <Maximize2 className="size-4" /> Modo kiosco
        </Button>
      </PageHeader>
      <AccessConsole />
    </>
  );
}
