import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";

const PLANS = [
  {
    id: "supersub",
    name: "SuperSub",
    price: "R$ 19,90",
    period: "/mês",
    features: [
      "Acesso a todas as missões",
      "Energia recarregada mais rápido",
      "Bizus exclusivos do Capitão",
    ],
  },
  {
    id: "max_wolf_filho",
    name: "Max-Wolf Filho",
    price: "R$ 39,90",
    period: "/mês",
    highlight: true,
    features: [
      "Tudo do SuperSub",
      "Energia infinita",
      "Acesso antecipado a novas operações",
      "Suporte prioritário",
    ],
  },
];

export default function Pricing() {
  const { profile, loading } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

  const subscribe = async (priceId: string) => {
    setBusy(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId,
          quantity: 1,
          userId: profile.user_id,
          customerEmail: undefined,
          returnUrl: window.location.origin + "/checkout/return?session_id={CHECKOUT_SESSION_ID}",
          environment: getStripeEnvironment(),
        },
      });
      if (error) throw error;
      const stripe = await getStripe();
      if (!stripe || !data?.clientSecret) throw new Error("Stripe não inicializou");
      // Redirect to embedded checkout return URL via hosted flow fallback
      const checkout = await (stripe as any).initEmbeddedCheckout({ clientSecret: data.clientSecret });
      // Mount in a temporary container
      const container = document.getElementById("stripe-checkout-mount");
      if (container) {
        container.innerHTML = "";
        checkout.mount("#stripe-checkout-mount");
      }
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível iniciar o pagamento");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="bg-gradient-hero text-primary-foreground px-4 pt-6 pb-10 rounded-b-3xl shadow-card">
        <div className="max-w-md mx-auto">
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 -ml-2 mb-3" onClick={() => nav(-1)}>
            <ArrowLeft size={16} /> Voltar
          </Button>
          <h1 className="font-display text-4xl">Planos de Assinatura</h1>
          <p className="opacity-85 mt-2 text-sm">Escolha um plano mensal para acelerar sua promoção.</p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 -mt-6 space-y-4">
        {PLANS.map((p) => (
          <Card key={p.id} className={`p-5 shadow-card ${p.highlight ? "border-accent border-2" : ""}`}>
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="font-display text-2xl text-primary">{p.name}</h2>
              <div>
                <span className="font-display text-3xl text-accent">{p.price}</span>
                <span className="text-muted-foreground text-sm">{p.period}</span>
              </div>
            </div>
            <ul className="space-y-2 my-4">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm">
                  <Check size={18} className="text-success shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <Button
              className={`w-full font-display text-lg ${p.highlight ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold" : ""}`}
              disabled={busy === p.id}
              onClick={() => subscribe(p.id)}
            >
              {busy === p.id ? "Carregando..." : "Assinar"}
            </Button>
          </Card>
        ))}
        <div id="stripe-checkout-mount" className="mt-6" />
      </main>
    </div>
  );
}