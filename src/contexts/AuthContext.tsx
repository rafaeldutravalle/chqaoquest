import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

import type { Rank } from "@/data/ranks";
// Compat layer: novos campos v2 + aliases dos antigos para componentes legados.
type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_id: string | null;
  specialty: string | null;
  nome_guerra: string | null;
  rank: Rank;
  pontos_merito: number;
  punicoes: number;
  xp: number;
  municao: number;
  prontidao: number;
  prontidao_max: number;
  streak_dias: number;
  streak_freezes: number;
  liga_atual: string;
  plan: "free" | "supersub" | "maxwolf";
  onboarded: boolean;
  // aliases p/ código legado (serão removidos quando migrarmos as telas)
  energy: number;
  energy_max: number;
  gems: number;
  fvm_score: number;
};

type Ctx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data: p } = await supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle();
    if (p) {
      const compat: any = { ...p,
        energy: (p as any).prontidao,
        energy_max: (p as any).prontidao_max,
        gems: (p as any).municao,
        fvm_score: (p as any).pontos_merito,
      };
      setProfile(compat as Profile);
    } else {
      setProfile(null);
    }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    setIsAdmin(!!roles?.some((r: any) => r.role === "admin"));
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <AuthCtx.Provider value={{ user, session, profile, isAdmin, loading, refreshProfile, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}