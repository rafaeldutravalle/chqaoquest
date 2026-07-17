import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Award, Radio, ShieldCheck, HeartPulse, RefreshCw, Star, Play, Pause, Landmark, PlayCircle, Eye, ShieldAlert, Lock, CheckCircle } from 'lucide-react';
import { DILEMAS } from '../data/dilemas';
import { MUSEUM_CARDS } from '../data/museum';

const ETHICS_SCENARIOS = [
  {
    id: 'eth_1',
    title: 'Superfaturamento vs Prontidão de Viaturas',
    scenario: 'Um fornecedor de peças automotivas do quartel propõe entregar um lote de baterias de viatura extraoficiais sem custo se você atestar notas fiscais com 10% de superfaturamento para "encobrir os custos logísticos". Sem as baterias, 3 blindados estratégicos ficarão parados na inspeção geral do Comando Militar.',
    pathA: {
      title: 'Caminho do Regulamento & Integridade',
      action: 'Rejeitar a oferta sumariamente, suspender o recebimento das notas fiscais fraudulentas e ordenar uma auditoria tática nos livros contratuais da Seção de Aquisições.',
      outcome: 'Integridade absoluta! Você assegurou a retidão do erário militar contra complacências informais. O Coronel registrou votos de elogio público à sua postura inabalável.',
      scoreChange: 45,
      responseText: 'Aprovado com louvor tático de integridade incorruptível.'
    },
    pathB: {
      title: 'Caminho do Ajuste Utilitarista',
      action: 'Aprovar temporariamente o superfaturamento para reativar as baterias de blindados do pátio e garantir a nota operacional impecável antes de ser desligado do posto.',
      outcome: 'Denúncia anônima deflagrou auditoria da Polícia Executiva. O Inquérito de sindicância tática concluiu crime de prevaricação e falsificação de documentos pela fraude administrativa.',
      scoreChange: -40,
      responseText: 'Prevaricação e desvio legal anotada com severidade na FVM.'
    }
  },
  {
    id: 'eth_2',
    title: 'Punição Coletiva e Coesão de Tropa',
    scenario: 'Em uma das subunidades de instrução, ocorreu o furto do transmissor do rádio militar de alto custo. O sargento sênior exige reter as folgas de fim de semana de toda a companhia até que o militar infrator se acuse espontaneamente.',
    pathA: {
      title: 'Caminho do Respeito Processual e Liderança',
      action: 'Indeferir a punição coletiva. Comandar sindicância reservada para apurar a autoria formalmente, utilizando investigações técnicas e vigilância coordenada.',
      outcome: 'Perfeito! O Regulamento Disciplinar do Exército (RDE Art. 13) veda terminantemente a punição coletiva sumária. A tropa manteve alta moral e rendeu forte fidelidade.',
      scoreChange: 40,
      responseText: 'Zelo normativo, preservando o clima organizacional e a ordem formal legal.'
    },
    pathB: {
      title: 'Caminho do Rigor Sumário Coletivo',
      action: 'Homologar o castigo coletivo imediato imposto pelo sargento, acreditando na pressão geral dos recrutas para delatar o indivíduo criminoso.',
      outcome: 'Inspeção disciplinar considerou a coerção ilegal. O batalhão respondeu perante a Ouvidoria por excesso punitivo, reduzindo a confiança tática na cadeia de comando.',
      scoreChange: -35,
      responseText: 'Punição coletiva ilegal reprovada administrativamente com advertência.'
    }
  },
  {
    id: 'eth_3',
    title: 'Desvio de Combustível em Ajuda Humanitária',
    scenario: 'Durante exercício de patrulhamento tático na fronteira amazônica, o experiente Sargento Farroupilha utiliza emergencialmente 100 litros de óleo diesel das viaturas para reativar geradores secos do hospital civil adjacente à aldeia local, sem autorização formal cadastrada.',
    pathA: {
      title: 'Caminho da Legalização com Ajuda Humanitária',
      action: 'Lavrar formalmente o termo de consumo emergencial sob as regras da missão cívico-social "Mão Amiga", regularizando a saída do material junto ao setor de suprimentos.',
      outcome: 'Decisão tática de alto padrão! Você salvou vidas assistenciais coordenadamente e amparou a legalidade administrativa por vias oficiais transparentes.',
      scoreChange: 40,
      responseText: 'Acerto de Liderança tática humanitária devidamente homologada.'
    },
    pathB: {
      title: 'Caminho da Vista Grossa Coberta',
      action: 'Incentivar o sargento a encobrir discretamente o desabastecimento, sugerindo fraudar as planilhas de odômetro das viaturas para omitir a auditoria.',
      outcome: 'A falsificação material de documentos e hodômetros é crime militar conexo. Você foi denunciado e respondeu em processo administrativo por cumplicidade administrativa.',
      scoreChange: -45,
      responseText: 'Conivência culposa gravíssima que deteriora o mérito operacional.'
    }
  }
];

import { PODCAST_EPISODES } from '../data/podcasts';
import { QUESTIONS } from '../data/questions';
import { Dilema, MuseumCard, PodcastEpisode, Question, ScoreStats, WarningLog } from '../types';
import { audioEngine } from '../lib/audioEngine';

interface InstructionCenterProps {
  stats: ScoreStats;
  museumCards: MuseumCard[];
  onUnlockCard: (id: string) => void;
  onRestoreEnergy: (amount: number, fee: number) => void;
  onAddWarning: (log: WarningLog) => void;
  onUpdatePM: (amount: number) => void;
  onAnswerRecoveryQuestion: (correct: boolean) => void;
  tier: 'Free' | 'SuperSub' | 'MaxWolf';
  hasDifficultHistory: boolean;
  hasStartedSindicancia: boolean;
  onUpgrade: (newTier: 'SuperSub' | 'MaxWolf') => void;
}

export const InstructionCenter: React.FC<InstructionCenterProps> = ({
  stats,
  museumCards,
  onUnlockCard,
  onRestoreEnergy,
  onAddWarning,
  onUpdatePM,
  onAnswerRecoveryQuestion,
  tier,
  hasDifficultHistory,
  hasStartedSindicancia,
  onUpgrade
}) => {
  const ranks = ['Soldado', 'Cabo', '3º Sgt', '2º Sgt', '1º Sgt', 'Subtenente', '2º Tenente', '1º Tenente', 'Capitão QAO'];
  const rankIndex = ranks.indexOf(stats.posto);
  const showDilemas = rankIndex >= 4; // 1º Sgt or higher
  
  // Filter tabs dynamically based on user rank and study progress
  const visibleTabs = [
    showDilemas && { id: 'dilemas', label: 'Dilemas', icon: Gamepad2 },
    hasStartedSindicancia && { id: 'etica', label: 'Ética & Liderança', icon: ShieldCheck },
    hasDifficultHistory && { id: 'museu', label: 'Museu', icon: Landmark },
    { id: 'radio', label: 'Rádio', icon: Radio },
    { id: 'rancho', label: 'Rancho / Erros', icon: HeartPulse }
  ].filter((t): t is { id: 'dilemas' | 'etica' | 'museu' | 'radio' | 'rancho'; label: string; icon: any } => !!t);

  const firstTab = visibleTabs[0]?.id || 'rancho';

  const [activeSubTab, setActiveSubTab] = useState<'dilemas' | 'etica' | 'museu' | 'radio' | 'rancho'>(() => {
    // If dilemas is available, use it, otherwise use first visible tab
    return showDilemas ? 'dilemas' : firstTab;
  });

  useEffect(() => {
    if (!visibleTabs.some(t => t.id === activeSubTab)) {
      setActiveSubTab(firstTab);
    }
  }, [visibleTabs, activeSubTab, firstTab]);
  
  // Custom tech-deploy nested views
  const [techView, setTechView] = useState<'supabase' | 'apk'>('supabase');

  // Checkout / Payment Modal states
  const [checkoutPlan, setCheckoutPlan] = useState<'SuperSub' | 'MaxWolf' | null>(null);
  const [ccNumber, setCcNumber] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');
  const [ccCvv, setCcCvv] = useState('');
  const [ccName, setCcName] = useState('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'success'>('form');

  const handleStartCheckout = (plan: 'SuperSub' | 'MaxWolf') => {
    setCheckoutPlan(plan);
    setCcNumber('');
    setCcExpiry('');
    setCcCvv('');
    setCcName('');
    setCheckoutStep('form');
    setIsProcessingCheckout(false);
    audioEngine.playSFX('click');
  };

  const handleConfirmPayment = () => {
    if (!ccNumber || !ccExpiry || !ccCvv || !ccName) {
      alert('Por favor, preencha todos os campos do cartão de crédito para prosseguir.');
      return;
    }
    setIsProcessingCheckout(true);
    audioEngine.playSFX('click');
    
    // Simulate transaction processing via Stripe
    setTimeout(() => {
      setIsProcessingCheckout(false);
      setCheckoutStep('success');
      audioEngine.playSFX('fanfarra');
      
      // Upgrade immediately
      onUpgrade(checkoutPlan!);
    }, 2000);
  };

  // Ethics scenario states
  const [activeEthicsIdx, setActiveEthicsIdx] = useState(0);
  const [selectedEthicsPath, setSelectedEthicsPath] = useState<'A' | 'B' | null>(null);
  const [ethicsReport, setEthicsReport] = useState<string | null>(null);

  // Dilema active state
  const [activeDilemaIdx, setActiveDilemaIdx] = useState(0);
  const [selectedDilemaOpt, setSelectedDilemaOpt] = useState<number | null>(null);
  const [dilemaReport, setDilemaReport] = useState<string | null>(null);

  // Radio podcast simulation state
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);
  const [isPlayingEpisode, setIsPlayingEpisode] = useState(false);
  const [podcastProgress, setPodcastProgress] = useState(0);

  // Recovery Quiz State
  const [recoveryQuestionIdx, setRecoveryQuestionIdx] = useState(0);
  const [recoverySelected, setRecoverySelected] = useState<number | null>(null);
  const [recoveryChecked, setRecoveryChecked] = useState(false);
  const [recoveryAnsweredCorrect, setRecoveryAnsweredCorrect] = useState<boolean | null>(null);

  const currentDilema = DILEMAS[activeDilemaIdx];
  const activePodcast = PODCAST_EPISODES.find(p => p.id === activeEpisodeId);

  // Filter 4 questions for recovery
  const recoveryQuestions = QUESTIONS.slice(0, 4);
  const currentRecoveryQ = recoveryQuestions[recoveryQuestionIdx];

  // Ad reward video simulator state
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adTimer, setAdTimer] = useState(5);

  const handleSubTabChange = (tab: 'dilemas' | 'etica' | 'museu' | 'radio' | 'rancho') => {
    setActiveSubTab(tab);
    audioEngine.playSFX('click');
    if (tab === 'rancho') {
      audioEngine.playBGM('rancho');
    } else {
      audioEngine.playBGM('qg');
    }
  };

  const currentEthics = ETHICS_SCENARIOS[activeEthicsIdx];

  const handleSolveEthics = (path: 'A' | 'B') => {
    if (selectedEthicsPath !== null) return;
    
    setSelectedEthicsPath(path);
    const chosen = path === 'A' ? currentEthics.pathA : currentEthics.pathB;

    onUpdatePM(chosen.scoreChange);

    if (chosen.scoreChange > 0) {
      audioEngine.playSFX('acerto');
      setEthicsReport(`MÉRITO ÉTICO ALCANÇADO: ${chosen.outcome}`);
    } else {
      audioEngine.playSFX('erro');
      setEthicsReport(`SINDICÂNCIA MILITAR DE ÉTICA: ${chosen.outcome}`);
      
      // Trigger a warning in dossier FVM
      onAddWarning({
        id: `ethics_warn_${Date.now()}`,
        date: new Date().toLocaleDateString(),
        severity: 'Advertência',
        message: chosen.responseText,
        punishmentEffect: `Redução imediata de ${Math.abs(chosen.scoreChange)} PM anotada no prontuário.`
      });
    }
  };

  const handleNextEthics = () => {
    audioEngine.playSFX('click');
    setSelectedEthicsPath(null);
    setEthicsReport(null);
    setActiveEthicsIdx((prev) => (prev + 1) % ETHICS_SCENARIOS.length);
  };

  // 1. Commander Dilemmas mechanics
  const handleSolveDilema = (optIdx: number) => {
    if (selectedDilemaOpt !== null) return;
    
    setSelectedDilemaOpt(optIdx);
    const chosen = currentDilema.options[optIdx];

    onUpdatePM(chosen.scoreChange);

    if (chosen.scoreChange > 0) {
      audioEngine.playSFX('acerto');
      setDilemaReport(`SUCESSO DO COMANDO: ${chosen.outcome}`);
    } else {
      audioEngine.playSFX('erro');
      setDilemaReport(`SINDICÂNCIA INSTAURADA - INFRAÇÃO: ${chosen.outcome}`);
      
      // Trigger a warning
      const severity = chosen.scoreChange < -25 ? 'Punição' : 'Advertência';
      onAddWarning({
        id: `warn_${Date.now()}`,
        date: new Date().toLocaleDateString(),
        severity,
        message: chosen.responseText,
        punishmentEffect: `Redução imediata de ${Math.abs(chosen.scoreChange)} PM anotada em dossiê.`
      });
    }
  };

  const handleNextDilema = () => {
    audioEngine.playSFX('click');
    setSelectedDilemaOpt(null);
    setDilemaReport(null);
    setActiveDilemaIdx((prev) => (prev + 1) % DILEMAS.length);
  };

  // 2. Podcast player simulation
  const handlePlayPodcast = (episode: PodcastEpisode) => {
    audioEngine.playSFX('radio_tuning');
    if (activeEpisodeId === episode.id) {
      setIsPlayingEpisode(!isPlayingEpisode);
    } else {
      setActiveEpisodeId(episode.id);
      setIsPlayingEpisode(true);
      setPodcastProgress(10);
      
      // Gradually simulate progressive listen progress
      const progressTimer = setInterval(() => {
        setPodcastProgress((p) => {
          if (p >= 100) {
            clearInterval(progressTimer);
            setIsPlayingEpisode(false);
            // Reward for listening completely
            alert(`Você concluiu a audição do ${episode.title}! Ganhou +40 XP de inteligência tática!`);
            return 100;
          }
          return p + 15;
        });
      }, 1000);
    }
  };

  // 3. Recovery Quiz (Rancho/Recovery drills)
  const handleSelectRecovery = (idx: number) => {
    if (recoveryChecked) return;
    setRecoverySelected(idx);
  };

  const handleCheckRecovery = () => {
    if (recoverySelected === null || recoveryChecked) return;
    setRecoveryChecked(true);

    const isCorrect = recoverySelected === currentRecoveryQ.correctAnswer;
    setRecoveryAnsweredCorrect(isCorrect);

    if (isCorrect) {
      audioEngine.playSFX('acerto');
      // Restore 50% energy as refined in 7.1
      onRestoreEnergy(50, 0); // regain 50% prontidão
      onAnswerRecoveryQuestion(true);
    } else {
      audioEngine.playSFX('erro');
      // No restoration, penalty alert
      onAnswerRecoveryQuestion(false);
    }
  };

  const handleNextRecoveryQuestion = () => {
    audioEngine.playSFX('click');
    setRecoveryChecked(false);
    setRecoverySelected(null);
    setRecoveryAnsweredCorrect(null);
    setRecoveryQuestionIdx((prev) => (prev + 1) % recoveryQuestions.length);
  };

  // 4. Ad rewarded video simulator
  const handleWatchAd = () => {
    audioEngine.playSFX('click');
    setIsWatchingAd(true);
    setAdTimer(5);

    const interval = setInterval(() => {
      setAdTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setIsWatchingAd(false);
          // Restore 40% on rewarded ad watch as refined in 7.1
          onRestoreEnergy(40, 0);
          audioEngine.playSFX('medalha');
          alert('Vídeo de Rancho concluído com sucesso! Caramelo está de barriga cheia e sua Prontidão Operacional aumentou em +40%!');
          return 0;
        }
        audioEngine.playSFX('typewriter');
        return t - 1;
      });
    }, 1000);
  };

  return (
    <div className="space-y-4">
      
      {/* INSTRUCTIONS COMPONENT TABS HERO BAR */}
      <div className="flex bg-[#111712] border-2 border-[#242D22] rounded-xl p-1 gap-1 overflow-x-auto scrollbar-none">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id as any)}
              className={`flex-shrink-0 sm:flex-1 py-1.5 px-2 bg-transparent text-center font-mono text-[10px] uppercase font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isSelected 
                  ? 'bg-[#4B5320] border border-[#C5A059]/40 text-[#E8E4D9]' 
                  : 'text-[#A39E93] hover:text-white'
              }`}
            >
              <Icon className={`w-3 h-3 ${isSelected ? 'text-[#C5A059]' : 'text-[#A39E93]/60'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* PANEL DISPLAYS */}
      <AnimatePresence mode="wait">
        
        {/* TELA INTERMEDIÁRIA: ÉTICA & LIDERANÇA MILITAR */}
        {activeSubTab === 'etica' && (
          <motion.div 
            key="etica"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#1A2118] border-2 border-[#242D22] rounded-xl p-5 text-left space-y-4"
          >
            <div className="border-b border-[#242D22] pb-2 flex justify-between items-center text-xs font-mono text-[#A39E93]">
              <span className="text-[#C5A059] font-bold">ÉTICA & LIDERANÇA — CAMINHOS DE COMANDO</span>
              <span>Caso {activeEthicsIdx + 1} de {ETHICS_SCENARIOS.length}</span>
            </div>

            <div className="p-3 bg-[#111712] border-l-4 border-[#C5A059] rounded-lg">
              <h4 className="text-sm font-bold text-[#E8E4D9] mb-1.5 font-mono uppercase tracking-wide">
                {currentEthics.title}
              </h4>
              <p className="text-xs text-[#A39E93] leading-relaxed">
                {currentEthics.scenario}
              </p>
            </div>

            {/* Path Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {/* PATH A */}
              <button
                onClick={() => handleSolveEthics('A')}
                disabled={selectedEthicsPath !== null}
                className={`p-4 border rounded-lg transition-all text-left flex flex-col justify-between cursor-pointer ${
                  selectedEthicsPath === 'A'
                    ? 'bg-[#1C251E] border-[#C5A059] shadow-lg scale-[1.01]'
                    : selectedEthicsPath !== null
                    ? 'opacity-40 bg-[#111712]/50 border-gray-950'
                    : 'bg-[#141B13] hover:bg-[#1E271D] border-[#242D22] hover:border-[#C5A059]/40 hover:-translate-y-0.5'
                }`}
              >
                <div>
                  <h5 className="text-xs font-extrabold text-[#C5A059] uppercase tracking-wider mb-2 font-mono">
                    {currentEthics.pathA.title}
                  </h5>
                  <p className="text-xs text-[#E8E4D9] leading-relaxed">
                    "{currentEthics.pathA.action}"
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#242D22] flex justify-between items-center text-[10px] font-mono text-[#A39E93]">
                  <span>PONTO DE ESTUDOS</span>
                  <span className="text-[#00FF66] font-bold">+{currentEthics.pathA.scoreChange} PM</span>
                </div>
              </button>

              {/* PATH B */}
              <button
                onClick={() => handleSolveEthics('B')}
                disabled={selectedEthicsPath !== null}
                className={`p-4 border rounded-lg transition-all text-left flex flex-col justify-between cursor-pointer ${
                  selectedEthicsPath === 'B'
                    ? 'bg-[#1C251E] border-[#C5A059] shadow-lg scale-[1.01]'
                    : selectedEthicsPath !== null
                    ? 'opacity-40 bg-[#111712]/50 border-gray-950'
                    : 'bg-[#141B13] hover:bg-[#1E271D] border-[#242D22] hover:border-[#C5A059]/40 hover:-translate-y-0.5'
                }`}
              >
                <div>
                  <h5 className="text-xs font-extrabold text-[#A39E93] uppercase tracking-wider mb-2 font-mono">
                    {currentEthics.pathB.title}
                  </h5>
                  <p className="text-xs text-[#E8E4D9] leading-relaxed">
                    "{currentEthics.pathB.action}"
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#242D22] flex justify-between items-center text-[10px] font-mono text-[#A39E93]">
                  <span>REPERCUSSÃO DISCIPLINAR</span>
                  <span className="text-red-500 font-bold">{currentEthics.pathB.scoreChange} PM</span>
                </div>
              </button>
            </div>

            {/* Outcome panel if chosen */}
            {selectedEthicsPath !== null && ethicsReport && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 border-2 rounded-xl space-y-2 mt-4 text-xs font-mono select-none ${
                  (selectedEthicsPath === 'A' ? currentEthics.pathA.scoreChange : currentEthics.pathB.scoreChange) > 0
                    ? 'bg-[#1E301F] border-[#00FF66]/30 text-[#E8E4D9]'
                    : 'bg-[#3C1616] border-[#FF3333]/30 text-[#E8E4D9]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                  <span>RELATÓRIO DE SINDICÂNCIA ÉTICA</span>
                </div>
                <p className="text-xs text-[#A39E93] leading-relaxed">
                  {ethicsReport}
                </p>
                <p className="text-xs pt-1 italic text-[#C5A059]">
                  Resultado: {(selectedEthicsPath === 'A' ? currentEthics.pathA.scoreChange : currentEthics.pathB.scoreChange) > 0 ? 'MÉRITO EXTRAORDINÁRIO ADICIONADO' : 'NOTIFICAÇÃO DISCIPLINAR REGISTRADA'}
                </p>
                <button
                  onClick={handleNextEthics}
                  className="w-full mt-3 bg-[#C5A059] text-black font-extrabold py-2 rounded-lg text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all text-center cursor-pointer"
                >
                  Confirmar e Prosseguir
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* TELA A: DILEMAS DO COMANDANTE */}
        {activeSubTab === 'dilemas' && (
          <motion.div 
            key="dilemas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#1A2118] border-2 border-[#242D22] rounded-xl p-5 text-left space-y-4"
          >
            <div className="border-b border-[#242D22] pb-2 flex justify-between items-center text-xs font-mono text-[#A39E93]">
              <span className="text-[#C5A059] font-bold">CONSELHO DE CONDUTA OPERACIONAL</span>
              <span>Dilema {activeDilemaIdx + 1} de {DILEMAS.length}</span>
            </div>

            <div className="p-3 bg-[#111712] border-l-4 border-[#C5A059] rounded-lg">
              <h4 className="text-sm font-bold text-[#E8E4D9] mb-1.5 font-mono uppercase tracking-wide">
                {currentDilema.title}
              </h4>
              <p className="text-xs text-[#A39E93] leading-relaxed">
                {currentDilema.scenario}
              </p>
            </div>

            {/* Dilemma branching choices */}
            <div className="space-y-2.5">
              {currentDilema.options.map((opt, oIdx) => {
                const isChosen = selectedDilemaOpt === oIdx;
                let optStyle = 'bg-[#141B13] border-[#242D22] text-[#E8E4D9]';
                
                if (selectedDilemaOpt !== null) {
                  if (isChosen) {
                    optStyle = opt.scoreChange > 0 
                      ? 'bg-[#5F7161]/35 border-[#5F7161] text-[#E8E4D9] font-bold' 
                      : 'bg-[#8B2635]/25 border-[#8B2635] text-[#E8E4D9]';
                  } else {
                    optStyle = 'bg-[#111712]/40 border-[#242D22]/40 text-[#A39E93] opacity-40';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSolveDilema(oIdx)}
                    disabled={selectedDilemaOpt !== null}
                    className={`w-full p-3 border rounded-lg text-left text-xs transition-all relative ${optStyle} ${
                      selectedDilemaOpt === null ? 'hover:border-[#C5A059]/40 cursor-pointer' : ''
                    }`}
                  >
                    <span className="font-mono text-[#C5A059] font-bold mr-1.5">{oIdx + 1}.</span>
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {/* Feedback result card */}
            {dilemaReport && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-[#111712] border-2 border-[#242D22] rounded-lg text-xs font-mono"
              >
                <div className={`font-bold mb-1 ${selectedDilemaOpt !== null && currentDilema.options[selectedDilemaOpt].scoreChange > 0 ? 'text-[#5F7161]' : 'text-[#8B2635]'}`}>
                  {dilemaReport}
                </div>
                <p className="text-[#A39E93] leading-relaxed">
                  {selectedDilemaOpt !== null && currentDilema.options[selectedDilemaOpt].responseText}
                </p>
                <div className="text-[10px] text-[#C5A059] mt-2 font-bold uppercase">
                  PONTOS DE MÉRITO MUTADOS: {selectedDilemaOpt !== null && currentDilema.options[selectedDilemaOpt].scoreChange > 0 ? '+' : ''}{selectedDilemaOpt !== null && currentDilema.options[selectedDilemaOpt].scoreChange} PM
                </div>

                <button
                  onClick={handleNextDilema}
                  className="mt-4 w-full py-1.5 bg-[#4B5320] hover:bg-[#343A16] text-white rounded font-mono font-bold border border-black uppercase cursor-pointer"
                >
                  PRÓXIMO DILEMA DE COMANDO
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* TELA B: MUSEU MILITAR (COLLECIONÁVEIS) */}
        {activeSubTab === 'museu' && (
          <motion.div 
            key="museu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#1A2118] border-2 border-[#242D22] rounded-xl p-5 text-left space-y-4"
          >
            <div className="border-b border-[#242D22] pb-2 flex justify-between items-center text-xs font-mono text-[#A39E93]">
              <span className="text-[#C5A059] font-bold">MUSEU DO BATALHÃO — BAÚ DO ANTIGÃO</span>
              <span>LIVROS E HEROÍSMO</span>
            </div>

            <p className="text-xs text-[#A39E93] leading-relaxed">
              Responda a lições difíceis corretamente para desbloquear relíquias exclusivas da história militar do Brasil.
            </p>

            {/* Collection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {MUSEUM_CARDS.map((card, index) => {
                const isAcquired = stats.pm > (index * 250); // unlock dynamically based on PM milestones!
                return (
                  <div 
                    key={card.id} 
                    className={`p-3.5 border rounded-lg flex flex-col justify-between transition-all ${
                      isAcquired 
                        ? 'bg-[#1C251E] border-[#C5A059]/40' 
                        : 'bg-[#111712]/50 border-gray-950 opacity-40'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 bg-[#4B5320] text-[#C5A059] rounded">
                          {card.rarity.toUpperCase()}
                        </span>
                        <span className="text-[9px] text-[#A39E93] font-mono">{card.era}</span>
                      </div>
                      
                      <h4 className="text-xs font-extrabold text-[#E8E4D9] uppercase tracking-wide">
                        {card.title}
                      </h4>
                      <p className="text-[11px] text-[#A39E93] leading-relaxed mt-1.5">
                        {isAcquired ? card.description : 'Relíquia histórica criptografada. Conquiste mais de ' + (index * 250) + ' PM de estudos para desbloquear este card.'}
                      </p>
                    </div>

                    <div className="mt-3 text-right">
                      {isAcquired ? (
                        <span className="text-[9px] font-mono text-[#5F7161] font-bold uppercase flex items-center gap-1.5 justify-end">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#5F7161]" /> DESBLOQUEADO
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-gray-500 uppercase">BLOQUEADO</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TELA C: INDICATIVO RÁDIO (PODCASTS) */}
        {activeSubTab === 'radio' && (
          tier === 'Free' ? (
            <motion.div 
              key="radio-lock"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-[#1A2118] border-2 border-[#242D22] rounded-xl p-5 text-left space-y-5"
            >
              <div className="border-b border-[#242D22] pb-2 flex justify-between items-center text-xs font-mono text-[#C5A059] font-bold">
                <span>INDICATIVO RÁDIO — CONTRATO DE ASSINATURA</span>
                <span>🔒 MÓDULO BLOQUEADO</span>
              </div>
              <p className="text-xs text-[#A39E93] leading-relaxed">
                O <strong>Indicativo Rádio</strong> oferece podcasts diários instrucionais com dublagem profissional sobre História Militar, Geopolítica e Doutrina. Este recurso está disponível exclusivamente para assinantes.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SuperSub Card */}
                <div className="p-4 bg-[#111712] border border-[#C5A059]/30 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#E8E4D9]">Assinatura "SuperSub"</h4>
                    <p className="text-[10px] text-[#C5A059] font-mono font-bold mt-0.5">R$ 19,90/mês</p>
                    <ul className="text-[10px] text-[#A39E93] space-y-1 mt-3">
                      <li>• Sem anúncios nas missões.</li>
                      <li>• Prontidão Permanente (nunca interrompe).</li>
                      <li>• Desafios Lendários e Dilemas ilimitados.</li>
                      <li>• <strong>Indicativo Rádio liberado.</strong></li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleStartCheckout('SuperSub')}
                    className="w-full py-2 bg-[#4B5320] hover:bg-[#343A16] text-[#E8E4D9] font-mono text-xs font-bold uppercase rounded-lg border border-black cursor-pointer text-center"
                  >
                    Contratar SuperSub
                  </button>
                </div>

                {/* Max Wolf Card */}
                <div className="p-4 bg-[#111712] border border-[#C5A059]/30 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#E8E4D9]">Assinatura "Max Wolf Filho"</h4>
                    <p className="text-[10px] text-[#C5A059] font-mono font-bold mt-0.5">R$ 39,90/mês</p>
                    <ul className="text-[10px] text-[#A39E93] space-y-1 mt-3">
                      <li>• Tudo do SuperSub.</li>
                      <li>• <strong>Explicação de Erros com IA Tática.</strong></li>
                      <li>• Acesso antecipado ao Museu.</li>
                      <li>• Uniforme de Gala Max Wolf no Avatar.</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleStartCheckout('MaxWolf')}
                    className="w-full py-2 bg-[#C5A059] hover:bg-[#A39E93] text-black font-mono text-xs font-bold uppercase rounded-lg border border-black cursor-pointer text-center"
                  >
                    Contratar Max Wolf
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="radio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-[#1A2118] border-2 border-[#242D22] rounded-xl p-5 text-left space-y-4"
            >
              <div className="border-b border-[#242D22] pb-2 flex justify-between items-center text-xs font-mono text-[#A39E93]">
              <span className="text-[#C5A059] font-bold">INDICATIVO RÁDIO MILITAR — PODCAST</span>
              <span>FM OPERACIONAL</span>
            </div>

            <p className="text-xs text-[#A39E93]">
              Sintonize transmissões culturais e análises históricas para ampliar sua inteligência estratégica.
            </p>

            {/* Active Podcast Player Mock */}
            {activeEpisodeId && activePodcast && (
              <div className="border border-[#C5A059]/40 rounded-xl p-4 bg-[#111712] font-mono">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold">SINAL ESTÁVEL</span>
                  <span className="text-xs text-[#A39E93]">{activePodcast.duration}</span>
                </div>
                <div className="text-xs font-bold text-[#E8E4D9] truncate">
                  {activePodcast.title}
                </div>
                
                {/* Playing dynamic indicator block bars */}
                <div className="flex items-center gap-3.5 mt-3 my-2 bg-[#242D22]/30 p-2 rounded">
                  <button 
                    onClick={() => setIsPlayingEpisode(!isPlayingEpisode)}
                    className="p-1.5 bg-[#4B5320] border border-black rounded-full text-white cursor-pointer"
                  >
                    {isPlayingEpisode ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex justify-between text-[8px] text-[#A39E93] mb-1">
                      <span>{isPlayingEpisode ? 'SINTONIZANDO' : 'PAUSADO'}</span>
                      <span>{podcastProgress}%</span>
                    </div>
                    {/* Progression loading line */}
                    <div className="w-full h-1 bg-[#1A2118] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#C5A059] transition-all duration-500"
                        style={{ width: `${podcastProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-[#A39E93] italic leading-relaxed mt-1">
                  Resumo: {activePodcast.summary}
                </div>
              </div>
            )}

            {/* Episode lists */}
            <div className="space-y-2.5">
              {PODCAST_EPISODES.map((ep) => {
                const isActive = activeEpisodeId === ep.id;
                return (
                  <div 
                    key={ep.id}
                    className={`p-3 border rounded-lg flex items-center justify-between transition-all ${
                      isActive ? 'bg-[#1C251E] border-[#C5A059]' : 'bg-[#111712] border-[#242D22]'
                    }`}
                  >
                    <div className="flex-1 pr-3">
                      <div className="text-[10px] font-mono text-[#C5A059] font-bold">{ep.topic.toUpperCase()}</div>
                      <h5 className="text-xs font-bold text-[#E8E4D9] mt-0.5 leading-tight">{ep.title}</h5>
                      <span className="text-[8px] font-mono text-[#A39E93] mt-1 block">Duração: {ep.duration}</span>
                    </div>

                    <button
                      onClick={() => handlePlayPodcast(ep)}
                      className="p-2 bg-[#4B5320] hover:bg-[#343A16] border border-black rounded-lg text-white font-bold cursor-pointer"
                    >
                      <PlayCircle className="w-5 h-5 text-[#C5A059]" />
                    </button>
                  </div>
                );
              })}
            </div>

            </motion.div>
          )
        )}

        {/* TELA D: RANCHO / REVISÃO DE ERROS */}
        {activeSubTab === 'rancho' && (
          <motion.div 
            key="rancho"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#1A2118] border-2 border-[#242D22] rounded-xl p-5 text-left space-y-4"
          >
            <div className="border-b border-[#242D22] pb-2 flex justify-between items-center text-xs font-mono text-[#8B2635]">
              <span className="font-bold border border-[#8B2635] rounded px-1.5 bg-[#8B2635]/15">RE-EDUCAÇÃO MILITAR</span>
              <span>Rancho nº {recoveryQuestionIdx + 1}</span>
            </div>

            <p className="text-xs text-[#A39E93] leading-relaxed">
              O Rancho é o refeitório oficial do reestabelecimento! Se sua Prontidão Operacional baixar, complete lições de revisão ou consuma uma refeição assistida para carregar baterias.
            </p>

            {/* AD REWARD BLOCK */}
            <div className="p-3 bg-[#111712] border border-[#242D22] rounded-lg">
              <h4 className="text-xs font-mono font-bold text-[#C5A059] uppercase mb-1">
                Refeição Rápida no Rancho (Vídeo Recompensado)
              </h4>
              <p className="text-[11px] text-[#A39E93] leading-relaxed mb-3">
                Assista a um vídeo do comando para abastecer instantaneamente <span className="text-white font-bold">+40% de Prontidão</span>.
              </p>

              {isWatchingAd ? (
                <div className="bg-[#1A2118] border border-[#8B2635]/30 p-4 rounded text-center text-xs font-mono">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 mx-auto mb-2"></div>
                  <span className="text-[#8B2635] font-bold uppercase animate-pulse">ALIMENTANDO AVATAR MILITAR... {adTimer}S</span>
                </div>
              ) : (
                <button
                  onClick={handleWatchAd}
                  className="w-full py-2 bg-[#8B2635] hover:bg-[#6C1D29] text-white font-mono font-bold text-xs uppercase border border-black rounded-lg cursor-pointer"
                >
                  📺 CHOMP! ASSISTIR E RESTAURAR (+40%)
                </button>
              )}
            </div>

            {/* RECOVERY QUIZ INTERFACE */}
            {tier === 'Free' ? (
              <div className="border border-[#8B2635]/30 rounded-lg p-4 bg-[#111712] text-center space-y-2.5">
                <span className="text-[11px] font-mono text-[#8B2635] uppercase block font-bold flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#8B2635]" /> TREINAMENTO LEVE BLOQUEADO
                </span>
                <p className="text-[11px] text-[#A39E93] leading-relaxed">
                  As lições de erros do Treinamento Leve são exclusivas para assinantes do plano <strong>SuperSub</strong>. 
                  Como combatente do plano gratuito, assista ao <strong>Vídeo Recompensado</strong> acima para reestabelecer sua Prontidão Operacional e continuar operando na campanha.
                </p>
              </div>
            ) : currentRecoveryQ ? (
              <div className="border border-[#242D22] rounded-lg p-3 bg-[#111712] space-y-4">
                <span className="text-[10px] font-mono text-[#C5A059] uppercase block border-b border-[#242D22] pb-1 font-bold">
                  Treinamento Leve / Lição de Erros (+50% se acertar):
                </span>
                
                <p className="text-xs font-bold text-[#E8E4D9] leading-relaxed font-serif">
                  {currentRecoveryQ.text}
                </p>

                <div className="space-y-1.5 text-xs text-left">
                  {currentRecoveryQ.options.map((opt, oIdx) => {
                    const isSelected = recoverySelected === oIdx;
                    let style = 'bg-[#1A2118] border-[#242D22] text-[#A39E93]';
                    if (isSelected) {
                      style = 'bg-[#4B5320] border-[#C5A059] text-white font-bold';
                    }
                    if (recoveryChecked) {
                      if (oIdx === currentRecoveryQ.correctAnswer) {
                        style = 'bg-[#5F7161]/35 border-[#5F7161] text-[#E8E4D9] font-bold';
                      } else if (isSelected) {
                        style = 'bg-[#8B2635]/25 border-[#8B2635] text-[#E8E4D9]';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectRecovery(oIdx)}
                        disabled={recoveryChecked}
                        className={`w-full p-2 border rounded-md text-left transition-all ${style} ${!recoveryChecked ? 'cursor-pointer' : ''}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {!recoveryChecked ? (
                  <button
                    onClick={handleCheckRecovery}
                    disabled={recoverySelected === null}
                    className="w-full py-1.5 bg-[#4B5320] hover:bg-[#343A16] disabled:opacity-40 text-white font-mono font-bold text-xs uppercase border border-black rounded cursor-pointer"
                  >
                    ANALISAR ACERTO
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className={`p-2.5 rounded text-[11px] font-mono ${recoveryAnsweredCorrect ? 'bg-[#5F7161]/15 text-[#5F7161] border border-[#5F7161]' : 'bg-[#8B2635]/15 text-[#8B2635] border border-[#8B2635]'}`}>
                      {recoveryAnsweredCorrect 
                        ? '💥 EXCELENTE! Resposta sob termos padrão. Sua FVM foi restaurada em +50% de prontidão de campanha!' 
                        : '❌ INCORRETO. Foco nas vistorias de RISG. Nenhuma recarga foi adquirida.'}
                    </div>
                    <button
                      onClick={handleNextRecoveryQuestion}
                      className="w-full py-1.5 bg-[#242D22] text-white font-mono font-bold text-xs uppercase rounded cursor-pointer"
                    >
                      PRÓXIMO REFORÇO
                    </button>
                  </div>
                )}

              </div>
            ) : null}

          </motion.div>
        )}

        

      </AnimatePresence>

      {checkoutPlan && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-mono">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#111712] border-2 border-[#C5A059] rounded-2xl max-w-md w-full p-6 text-left space-y-5 shadow-2xl relative overflow-hidden"
          >
            {/* Header */}
            <div className="border-b border-[#242D22] pb-3 flex justify-between items-center text-xs text-[#A39E93]">
              <span className="text-[#C5A059] font-bold uppercase tracking-wider flex items-center gap-1.5">
                🔒 GATEWAY DE PAGAMENTO STRIPE
              </span>
              <span className="text-red-500 font-bold uppercase">SINAL CRIPTOGRAFADO</span>
            </div>

            {checkoutStep === 'form' ? (
              <>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-[#E8E4D9]">Contratar Plano {checkoutPlan === 'SuperSub' ? 'SuperSub' : 'Max Wolf Filho'}</h3>
                  <p className="text-[11px] text-[#A39E93]">
                    Assinatura recorrente: <span className="text-[#C5A059] font-bold">{checkoutPlan === 'SuperSub' ? 'R$ 19,90' : 'R$ 39,90'} / mês</span>
                  </p>
                </div>

                {/* Simulated Card Preview Graphic */}
                <div className="p-4 bg-gradient-to-br from-[#1C251E] to-[#111712] border border-[#242D22] rounded-xl flex flex-col justify-between h-28 relative overflow-hidden">
                  <div className="absolute right-3 top-3 text-[9px] text-[#C5A059] font-extrabold border border-[#C5A059]/40 rounded px-1 uppercase">
                    MILITARY CARD
                  </div>
                  <div className="text-[10px] text-[#E8E4D9] font-bold tracking-widest my-auto text-center">
                    {ccNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className="flex justify-between items-end text-[9px] text-[#A39E93] mt-2">
                    <div>
                      <span className="block text-[7px] text-[#A39E93]/60 uppercase">TITULAR</span>
                      <span className="font-bold text-[#E8E4D9] uppercase">{ccName || 'NOME DO MILITAR'}</span>
                    </div>
                    <div>
                      <span className="block text-[7px] text-[#A39E93]/60 uppercase">VALIDADE</span>
                      <span className="font-bold text-[#E8E4D9]">{ccExpiry || 'MM/AA'}</span>
                    </div>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[9px] text-[#A39E93] uppercase font-bold mb-1">NÚMERO DO CARTÃO</label>
                    <input 
                      type="text" 
                      placeholder="4532 •••• •••• 8821" 
                      maxLength={19}
                      value={ccNumber}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '');
                        let chunks = v.match(/.{1,4}/g);
                        setCcNumber(chunks ? chunks.join(' ') : '');
                      }}
                      className="w-full bg-[#1A2118] border border-[#242D22] rounded px-3 py-2 text-[#E8E4D9] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] text-[#A39E93] uppercase font-bold mb-1">VALIDADE</label>
                      <input 
                        type="text" 
                        placeholder="MM/AA" 
                        maxLength={5}
                        value={ccExpiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '');
                          if (v.length > 2) {
                            v = v.substring(0, 2) + '/' + v.substring(2, 4);
                          }
                          setCcExpiry(v);
                        }}
                        className="w-full bg-[#1A2118] border border-[#242D22] rounded px-3 py-2 text-[#E8E4D9] focus:outline-none focus:border-[#C5A059] text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-[#A39E93] uppercase font-bold mb-1">CÓDIGO (CVV)</label>
                      <input 
                        type="password" 
                        placeholder="•••" 
                        maxLength={3}
                        value={ccCvv}
                        onChange={(e) => setCcCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-[#1A2118] border border-[#242D22] rounded px-3 py-2 text-[#E8E4D9] focus:outline-none focus:border-[#C5A059] text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] text-[#A39E93] uppercase font-bold mb-1">NOME DO TITULAR</label>
                    <input 
                      type="text" 
                      placeholder="Digite o nome igual ao do cartão" 
                      value={ccName}
                      onChange={(e) => setCcName(e.target.value)}
                      className="w-full bg-[#1A2118] border border-[#242D22] rounded px-3 py-2 text-[#E8E4D9] focus:outline-none focus:border-[#C5A059] uppercase"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button 
                    disabled={isProcessingCheckout}
                    onClick={() => setCheckoutPlan(null)}
                    className="flex-1 py-2 bg-transparent hover:bg-[#1A2118] border border-[#242D22] text-[#A39E93] text-xs font-bold uppercase rounded cursor-pointer text-center"
                  >
                    CANCELAR
                  </button>
                  <button 
                    disabled={isProcessingCheckout}
                    onClick={handleConfirmPayment}
                    className="flex-1 py-2 bg-[#C5A059] hover:bg-[#A39E93] text-black text-xs font-bold uppercase rounded cursor-pointer text-center flex items-center justify-center gap-2"
                  >
                    {isProcessingCheckout ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
                        PROCESSANDO...
                      </>
                    ) : (
                      'PAGAR AGORA'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="h-12 w-12 bg-[#5F7161]/25 border-2 border-[#5F7161] rounded-full flex items-center justify-center mx-auto text-[#5F7161]">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#E8E4D9]">PAGAMENTO APROVADO!</h3>
                  <p className="text-[10px] text-[#A39E93]">
                    Sua assinatura do plano <strong>{checkoutPlan === 'SuperSub' ? 'SuperSub' : 'Max Wolf Filho'}</strong> foi processada com sucesso e está ativa.
                  </p>
                </div>
                <button 
                  onClick={() => setCheckoutPlan(null)}
                  className="w-full py-2 bg-[#4B5320] text-white text-xs font-bold uppercase rounded cursor-pointer"
                >
                  ACESSAR RECURSOS LIBERADOS
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
