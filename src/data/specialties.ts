export type Specialty =
  | "infantaria" | "artilharia" | "cavalaria" | "engenharia" | "comunicacoes"
  | "material_belico" | "intendencia" | "saude" | "topografia" | "aviacao" | "musica";

export const SPECIALTIES: { id: Specialty; label: string; icon: string; desc: string }[] = [
  { id: "infantaria",      label: "Infantaria",       icon: "🪖", desc: "A rainha das armas" },
  { id: "artilharia",      label: "Artilharia",       icon: "💥", desc: "Poder de fogo" },
  { id: "cavalaria",       label: "Cavalaria",        icon: "🐎", desc: "Velocidade e choque" },
  { id: "engenharia",      label: "Engenharia",       icon: "🛠️", desc: "Constrói e destrói" },
  { id: "comunicacoes",    label: "Comunicações",     icon: "📡", desc: "Conecta a tropa" },
  { id: "material_belico", label: "Material Bélico",  icon: "⚙️", desc: "Mantém o arsenal" },
  { id: "intendencia",     label: "Intendência",      icon: "📦", desc: "Logística total" },
  { id: "saude",           label: "Saúde",            icon: "⚕️", desc: "Salva vidas" },
  { id: "topografia",      label: "Topografia",       icon: "🗺️", desc: "Ler o terreno" },
  { id: "aviacao",         label: "Aviação",          icon: "🚁", desc: "Asas do Exército" },
  { id: "musica",          label: "Música",           icon: "🎺", desc: "Banda do Batalhão" },
];