import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutReturn() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status] = useState<"success">("success");

  return (
    <div className="min-h-dvh bg-gradient-hero text-primary-foreground flex items-center justify-center p-6">
      <Card className="p-8 max-w-md w-full text-center bg-card text-foreground space-y-4">
        <CheckCircle2 className="mx-auto text-success" size={64} />
        <h1 className="font-display text-3xl">Assinatura confirmada!</h1>
        <p className="text-muted-foreground text-sm">
          Bem-vindo ao seu novo plano. Sua tropa agradece, soldado!
        </p>
        {sessionId && <p className="text-xs text-muted-foreground break-all">Ref: {sessionId}</p>}
        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-display text-lg shadow-gold">
          <Link to="/dashboard">Voltar ao Dashboard</Link>
        </Button>
      </Card>
    </div>
  );
}