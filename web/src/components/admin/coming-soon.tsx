import { ArrowRight, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/admin/shell";
import { ButtonLink } from "@/components/ui/primitives";

/** Módulo pendiente de la siguiente fase de diseño. */
export function ComingSoon({ title, icon: Icon, text }: { title: string; icon: LucideIcon; text: string }) {
  return (
    <>
      <PageHeader eyebrow="Próxima fase" title={title} />
      <div className="panel dots relative grid min-h-[420px] place-items-center overflow-hidden p-8 text-center">
        <div className="absolute left-1/2 top-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/10 blur-[100px]" />
        <div className="relative max-w-[420px]">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-lime/12 text-lime ring-1 ring-lime/25">
            <Icon className="size-7" />
          </span>
          <h2 className="mt-6 text-[24px] font-extrabold tracking-[-0.03em] text-fg">En preparación</h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{text}</p>
          <ButtonLink href="/admin" variant="secondary" className="mt-6">
            Volver al dashboard <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
