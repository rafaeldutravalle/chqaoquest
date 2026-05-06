export type Rank =
  | "recruta" | "soldado" | "cabo" | "terceiro_sgt" | "segundo_sgt"
  | "primeiro_sgt" | "subtenente" | "segundo_tenente"
  | "primeiro_tenente" | "capitao_qao";

export const RANK_INFO: Record<Rank, { label: string; short: string; color: string }> = {
  recruta:        { label: "Recruta",            short: "Rec",    color: "hsl(var(--muted-foreground))" },
  soldado:        { label: "Soldado",           short: "Sd",     color: "hsl(var(--muted-foreground))" },
  cabo:           { label: "Cabo",              short: "Cb",     color: "hsl(var(--success))" },
  terceiro_sgt:   { label: "3º Sargento",       short: "3º Sgt", color: "hsl(var(--primary-glow))" },
  segundo_sgt:    { label: "2º Sargento",       short: "2º Sgt", color: "hsl(var(--primary))" },
  primeiro_sgt:   { label: "1º Sargento",       short: "1º Sgt", color: "hsl(var(--accent))" },
  subtenente:     { label: "Subtenente",        short: "S Ten",  color: "hsl(var(--warning))" },
  segundo_tenente:{ label: "2º Tenente",        short: "2º Ten", color: "hsl(var(--gem))" },
  primeiro_tenente:{ label: "1º Tenente",       short: "1º Ten", color: "hsl(var(--gem))" },
  capitao_qao:    { label: "Capitão QAO",       short: "Cap",    color: "hsl(var(--gem))" },
};

export const RANK_ORDER: Rank[] = [
  "recruta","soldado","cabo","terceiro_sgt","segundo_sgt","primeiro_sgt",
  "subtenente","segundo_tenente","primeiro_tenente","capitao_qao",
];

export function nextRank(r: Rank): Rank | null {
  const i = RANK_ORDER.indexOf(r);
  return i >= 0 && i < RANK_ORDER.length - 1 ? RANK_ORDER[i + 1] : null;
}