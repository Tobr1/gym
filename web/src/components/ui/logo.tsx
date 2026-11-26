import { BRAND } from "@/config/brand";
import { cn } from "@/lib/utils";

/** Isotipo: pulso cardíaco que se convierte en rayo, sobre placa lima. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#B5F54A" />
      <path d="M9 0h14a9 9 0 0 1 9 9v3C22 14 10 9 0 13V9a9 9 0 0 1 9-9Z" fill="#fff" opacity=".22" />
      <path
        d="M5 17.5h5.2l2.6-6.2 4.4 11.4 3.1-8.2 1.6 3h5.1"
        fill="none"
        stroke="#0B1018"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <span className="text-[19px] font-extrabold tracking-[-0.03em] text-fg">
          {BRAND.name.toLowerCase()}
          <span className="text-lime">.</span>
        </span>
      )}
    </span>
  );
}
