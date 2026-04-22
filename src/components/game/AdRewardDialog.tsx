import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Tv } from "lucide-react";

/**
 * Mock de anúncio premiado. Em produção, plugar AdMob via @capacitor-community/admob.
 * onReward é chamado ao final dos "5 segundos" simulados.
 */
export function AdRewardDialog({
  open, onOpenChange, onReward, rewardLabel,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onReward: () => void;
  rewardLabel: string;
}) {
  const [count, setCount] = useState(5);
  useEffect(() => {
    if (!open) { setCount(5); return; }
    const t = setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-hero text-primary-foreground border-primary">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Tv /> Anúncio em exibição
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80">
            Após o anúncio você recebe: <strong>{rewardLabel}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video bg-black/40 rounded-lg flex items-center justify-center font-display text-5xl">
          {count}
        </div>
        <Button
          variant="secondary"
          disabled={count > 0}
          onClick={() => { onReward(); onOpenChange(false); }}
        >
          {count > 0 ? `Aguarde ${count}s…` : "Resgatar recompensa"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}