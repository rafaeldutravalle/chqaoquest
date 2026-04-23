import { RANK_INFO, RANK_ORDER, type Rank } from "@/data/ranks";
import { Card } from "@/components/ui/card";
import { Lock, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RankTrack({ current }: { current: Rank }) {
  const idx = RANK_ORDER.indexOf(current);
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
        Trilha do CHQAO
      </div>
      <ol className="grid grid-cols-7 gap-1">
        {RANK_ORDER.map((r, i) => {
          const done = i < idx;
          const here = i === idx;
          return (
            <li key={r} className="flex flex-col items-center gap-1 text-center">
              <div
                className={cn(
                  "w-9 h-9 rounded-full grid place-items-center border-2 text-xs font-display",
                  done && "bg-success/20 border-success text-success",
                  here && "bg-accent text-accent-foreground border-accent shadow-gold animate-pulse",
                  !done && !here && "bg-muted border-border text-muted-foreground",
                )}
              >
                {done ? <Check size={14} /> : here ? <Star size={14} fill="currentColor" /> : <Lock size={12} />}
              </div>
              <span
                className={cn(
                  "text-[10px] leading-tight",
                  here ? "text-accent font-semibold" : "text-muted-foreground",
                )}
              >
                {RANK_INFO[r].short}
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
