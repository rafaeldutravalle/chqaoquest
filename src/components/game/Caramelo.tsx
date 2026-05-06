import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

type Msg = { id: string; text: string; category: string };

export function Caramelo({ category = "geral" }: { category?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("caramelo_messages")
        .select("id, text, category")
        .eq("active", true);
      if (data && data.length) setMsgs(data as Msg[]);
    })();
  }, []);

  useEffect(() => {
    if (msgs.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % msgs.length), 6000);
    return () => clearInterval(t);
  }, [msgs.length]);

  if (!msgs.length) return null;
  const m = msgs[i];

  return (
    <Card className="p-3 flex items-center gap-3 bg-gradient-card border-accent/30">
      <div className="w-12 h-12 rounded-full bg-accent/20 grid place-items-center text-2xl flex-shrink-0" aria-hidden>
        🐶
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Caramelo, mascote da tropa</div>
        <AnimatePresence mode="wait">
          <motion.p
            key={m.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-sm leading-snug"
          >
            {m.text}
          </motion.p>
        </AnimatePresence>
      </div>
    </Card>
  );
}