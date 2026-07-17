/**
 * Shared Type Definitions for CHQAO Quest
 */

export interface Specialty {
  id: string;
  name: string;
  badge: string; // Icon or abbreviation
  color: string; // Badge/accessory color
  weapon: string; // Characteristic symbol
  voiceText: string; // Motto
  detail: string; // Detail visual trait
  description: string;
}

export interface CustomSoldier {
  id?: string;
  guerraName: string;
  specialtyId: string;
  biotipo: string; // 'Magro' | 'Atlético' | 'Robusto' | 'Alto' | 'Compacto'
  skinTone: string; // 'Claro' | 'Bronze' | 'Pardo' | 'Moreno' | 'Escuro'
  faceType: string; // 'Determinado' | 'Amigável' | 'Sério' | 'Experiente' | 'Jovem'
  avatarPhoto?: string;
  googleEmail?: string;
}

export interface ScoreStats {
  prontidao: number; // 0 to 100
  pm: number; // Pontos de Mérito
  streak: number; // Consecutive studying days
  coins: number; // Munição currency ₢
  xp: number; // Account experience
  nivel: number; // calculated level or phase
  posto: string; // 'Soldado' | 'Cabo' | '3º Sgt' | '2º Sgt' | '1º Sgt' | 'Subtenente' | '2º Tenente' | '1º Tenente' | 'Capitão QAO'
  fase: number; // calculated level or phase
  bizus: number; // persistent bizus count
}

export type SubjectCategory = 'Português' | 'Geografia' | 'História' | 'Administração' | 'Legislação' | 'Música';

export interface Question {
  id: string;
  category: SubjectCategory;
  text: string;
  options: string[];
  correctAnswer: number; // index inside options
  explanation: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  year?: string;
}

export interface DilemaOption {
  text: string;
  outcome: string;
  scoreChange: number; // Merit change
  penalty: boolean; // Does this trigger a simulated disciplinary action?
  responseText: string; // Feedback
}

export interface Dilema {
  id: string;
  title: string;
  scenario: string;
  options: DilemaOption[];
}

export interface MuseumCard {
  id: string;
  title: string;
  description: string;
  rarity: 'Comum' | 'Raro' | 'Épico' | 'Lendário';
  unlocked: boolean;
  era: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  duration: string;
  summary: string;
  topic: string;
}

export type SubscriptionTier = 'Gratuito' | 'SuperSub' | 'MaxWolf';

export interface DailyMission {
  id: string;
  text: string;
  progress: number;
  target: number;
  rewardCoins: number;
  rewardXp: number;
  completed: boolean;
}

export interface WarningLog {
  id: string;
  date: string;
  severity: 'Aviso' | 'Advertência' | 'Punição';
  message: string;
  punishmentEffect: string;
}
