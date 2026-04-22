import { Zap, Gem, Star, Trophy } from "lucide-react";
import { StatPill } from "./StatPill";
import { useAuth } from "@/contexts/AuthContext";

export function HUD() {
  const { profile } = useAuth();
  if (!profile) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <StatPill icon={<Zap size={16} fill="currentColor" />} value={`${profile.energy}/${profile.energy_max}`} color="hsl(var(--energy))" />
      <StatPill icon={<Star size={16} fill="currentColor" />} value={profile.xp} color="hsl(var(--xp))" />
      <StatPill icon={<Gem size={16} fill="currentColor" />} value={profile.gems} color="hsl(var(--gem))" />
      <StatPill icon={<Trophy size={16} fill="currentColor" />} value={profile.fvm_score.toFixed(2)} color="hsl(var(--accent))" />
    </div>
  );
}