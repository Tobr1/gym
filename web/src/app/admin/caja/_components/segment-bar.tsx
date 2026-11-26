"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { cn, money } from "@/lib/utils";

/** Barra segmentada animada por medio de pago, con resaltado al pasar el mouse. */
export function SegmentBar({
  items,
  className,
}: {
  items: { key: string; label: string; color: string; amount: number }[];
  className?: string;
}) {
  const total = items.reduce((a, b) => a + b.amount, 0);
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className={cn("relative", className)}>
      <div className="flex h-3.5 w-full gap-1">
        {items.map((it, i) => {
          const pct = (it.amount / total) * 100;
          const dim = hover && hover !== it.key;
          return (
            <motion.div
              key={it.key}
              onMouseEnter={() => setHover(it.key)}
              onMouseLeave={() => setHover(null)}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: dim ? 0.35 : 1 }}
              transition={{ duration: 0.8, delay: 0.25 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full origin-left cursor-pointer rounded-full first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(180deg, color-mix(in oklab, ${it.color} 100%, white 18%), ${it.color})`,
                boxShadow: hover === it.key ? `0 0 18px -2px ${it.color}` : `0 0 12px -6px ${it.color}`,
              }}
              title={`${it.label} · ${money(it.amount)}`}
            />
          );
        })}
      </div>
    </div>
  );
}
