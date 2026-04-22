import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatPill({
  icon, value, color, className,
}: { icon: ReactNode; value: number | string; color: string; className?: string }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur px-3 py-1.5 shadow-card border border-border",
      className
    )}>
      <span style={{ color }} className="text-base leading-none">{icon}</span>
      <span className="font-display text-base leading-none" style={{ color }}>{value}</span>
    </div>
  );
}