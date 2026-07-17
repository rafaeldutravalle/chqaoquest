import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OnboardingFlow } from './components/OnboardingFlow';
import { HUD } from './components/HUD';
import { CarameloMascot } from './components/CarameloMascot';
import { FVMExpandable } from './components/FVMExpandable';
import { BrazilMap } from './components/BrazilMap';
import { QuizPanel } from './components/QuizPanel';
import { InstructionCenter } from './components/InstructionCenter';
import { CommandStore } from './components/CommandStore';
import { PromoCeremonial } from './components/PromoCeremonial';
import { ServiceRecordTimeline } from './components/ServiceRecordTimeline';
import { Rankings } from './components/Rankings';
import { DicaDoDia } from './components/DicaDoDia';
import { QUESTIONS } from './data/questions';
import { SPECIALTIES } from './data/specialties';
import { CustomSoldier, ScoreStats, DailyMission, WarningLog, SubjectCategory } from './types';
import { audioEngine } from './lib/audioEngine';
import { supabase } from './lib/supabase';
import { Shield, Sparkles, Volume2, VolumeX, RefreshCw, Trophy, CalendarDays, Moon, Sun } from 'lucide-react';

export default function App() {
  const [soldier, setSoldier] = useState<CustomSoldier | null>(null);
  const [stats, setStats] = useState<ScoreStats>({
    pm: 0.0,
    coins: 400, // rich starting amount to buy supplements
    prontidao: 100,
    streak: 4,
    xp: 0,
    posto: 'Soldado',
    fase: 1,
    nivel: 1,
    bizus: 3 // Start with 3 Bizus!
  });

  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([
    { id: '1', title: 'Complete 1 missão de Português', progress: 0, target: 1, completed: false, xpReward: 40 },
    { id: '2', title: 'Exercite 1 dilema de conduta', progress: 0, target: 1, completed: false, xpReward: 50 },
    { id: '3', title: 'Conquiste 15 Pontos de Mérito', progress: 0, target: 15, completed: false, xpReward: 40 }
  ]);

  const [warningLogs, setWarningLogs] = useState<WarningLog[]>([]);
  const [activeQuizCategory, setActiveQuizCategory] = useState<SubjectCategory | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>(QUESTIONS);
  
  const [activeTab, setActiveTab] = useState<'cofront' | 'loja' | 'instrucao' | 'record' | 'rankings'>('cofront');
  const [isFvmExpanded, setIsFvmExpanded] = useState(false);
  const [promoCertVisible, setPromoCertVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [bgmVol, setBgmVol] = useState(0.2);
  const [sfxVol, setSfxVol] = useState(0.8);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [showCarameloSpeech, setShowCarameloSpeech] = useState(true);
  const [carameloAnnouncement, setCarameloAnnouncement] = useState<string | null>(null);
  const [tier, setTier] = useState<'Free' | 'SuperSub' | 'MaxWolf'>(() => {
    const saved = localStorage.getItem('chqao_tier');
    return (saved as any) || 'Free';
  });
  const [hasStartedSindicancia, setHasStartedSindicancia] = useState(() => {
    return localStorage.getItem('chqao_has_started_sindicancia') === 'true';
  });
  
  // Tactical Operational Night vision mode auto-initialized on 19h-06h
  const [isNightStyle, setIsNightStyle] = useState(() => {
    const hour = new Date().getHours();
    return hour >= 19 || hour < 6;
  });

  // Daily study streak reward banner state
  const [dailyBonusBanner, setDailyBonusBanner] = useState<{
    show: boolean;
    coinsEarned: number;
    xpEarned: number;
    streakCount: number;
    message: string;
  } | null>(null);

  // Load questions dynamically from Supabase database
  useEffect(() => {
    async function loadQuestions() {
      try {
        console.log('Iniciando busca de questões no Supabase...');
        const { data, error } = await supabase
          .from('questions_bank')
          .select('*');

        if (error) {
          console.error('Erro ao buscar questões no Supabase:', error.message);
          return;
        }

        if (data && data.length > 0) {
          const mapped = data.map((dbQ: any) => {
            const options = dbQ.alternativas ? dbQ.alternativas.map((alt: any) => alt.texto) : [];
            const correctAnswer = dbQ.alternativas ? dbQ.alternativas.findIndex((alt: any) => alt.correta) : 0;
            
            return {
              id: String(dbQ.id),
              category: dbQ.assunto as SubjectCategory,
              text: dbQ.enunciado,
              options: options.length > 0 ? options : ["Sem alternativa disponível"],
              correctAnswer: correctAnswer !== -1 ? correctAnswer : 0,
              explanation: dbQ.justificativa || 'Justificativa padrão militar.',
              difficulty: dbQ.dificuldade === 'Média' ? 'Médio' : dbQ.dificuldade,
              year: String(dbQ.ano || '2025'),
              rm_tag: dbQ.rm_tag
            };
          });
          setQuestions(mapped);
          console.log(`Sucesso! ${mapped.length} questões carregadas do Supabase.`);
        } else {
          console.log('Nenhuma questão retornada do Supabase, utilizando base local de fallback.');
        }
      } catch (e) {
        console.error('Falha geral ao conectar e carregar questões do Supabase:', e);
      }
    }
    loadQuestions();
  }, []);

  // Hydration logic on mount
  useEffect(() => {
    const savedSoldier = localStorage.getItem('chqao_soldier');
    const savedStats = localStorage.getItem('chqao_stats');
    const savedWarnings = localStorage.getItem('chqao_warnings');
    const savedBgmVol = localStorage.getItem('chqao_bgm_vol');
    const savedSfxVol = localStorage.getItem('chqao_sfx_vol');

    let loadedStats: ScoreStats | null = null;
    if (savedSoldier) setSoldier(JSON.parse(savedSoldier));
    if (savedStats) {
      loadedStats = JSON.parse(savedStats);
      setStats(loadedStats);
    }
    if (savedWarnings) setWarningLogs(JSON.parse(savedWarnings));

    let currentBgm = 0.2;
    let currentSfx = 0.8;
    if (savedBgmVol) {
      currentBgm = parseFloat(savedBgmVol);
      setBgmVol(currentBgm);
    }
    if (savedSfxVol) {
      currentSfx = parseFloat(savedSfxVol);
      setSfxVol(currentSfx);
    }
    audioEngine.setVolumes(currentBgm, currentSfx);

    // Turn up background music
    audioEngine.playBGM('qg');

    // Run Daily login check
    if (loadedStats) {
      triggerDailyCheck(loadedStats);
    }
  }, []);

  // Sync achievements and stats back to Supabase profiles
  useEffect(() => {
    if (!soldier?.id) return;
    const timer = setTimeout(async () => {
      try {
        console.log(`[Sync] Sincronizando conquistas do usuário ${soldier.guerraName} com Supabase...`);
        const { error } = await supabase
          .from('profiles')
          .update({
            fvm_score: stats.pm,
            posto: stats.posto,
            biotipo: soldier.biotipo,
            tom_pele: soldier.skinTone,
            rosto: soldier.faceType,
            especialidade: soldier.specialtyId,
            nome_guerra: soldier.guerraName
          })
          .eq('id', soldier.id);
        
        if (error) {
          console.warn('[Sync] Falha na sincronização do Supabase:', error.message);
        } else {
          console.log('[Sync] Sincronizado com sucesso.');
        }
      } catch (e) {
        console.warn('[Sync] Exceção durante sincronização:', e);
      }
    }, 2500); // 2.5s debounce
    return () => clearTimeout(timer);
  }, [stats.pm, stats.posto, soldier?.id]);

  // Check login consecutive days to reward continuous study streak
  const triggerDailyCheck = (currentStats: ScoreStats) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const lastLogin = localStorage.getItem('chqao_last_login_date');

      if (!lastLogin) {
        // First initialization
        localStorage.setItem('chqao_last_login_date', today);
        const bonusCoins = 100;
        const updated = {
          ...currentStats,
          coins: currentStats.coins + bonusCoins
        };
        setStats(updated);
        localStorage.setItem('chqao_stats', JSON.stringify(updated));
        
        setTimeout(() => {
          audioEngine.playSFX('medalha');
          setDailyBonusBanner({
            show: true,
            coinsEarned: bonusCoins,
            xpEarned: 0,
            streakCount: currentStats.streak,
            message: 'Apresentação formal ao Serviço Militar do CHQAO! Você recebeu munição bônus para iniciar seus estudos de campanha.'
          });
        }, 1500);
        return;
      }

      if (lastLogin === today) {
        // Already logged in today
        return;
      }

      const lastDate = new Date(lastLogin);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Safe streak combo bonus!
        const nextStreak = currentStats.streak + 1;
        const bonusCoins = 150 + (nextStreak * 10);
        const bonusXp = 35;
        
        const updated = {
          ...currentStats,
          streak: nextStreak,
          coins: currentStats.coins + bonusCoins,
          xp: currentStats.xp + bonusXp
        };
        setStats(updated);
        localStorage.setItem('chqao_stats', JSON.stringify(updated));
        localStorage.setItem('chqao_last_login_date', today);
        
        setTimeout(() => {
          audioEngine.playSFX('combo');
          setDailyBonusBanner({
            show: true,
            coinsEarned: bonusCoins,
            xpEarned: bonusXp,
            streakCount: nextStreak,
            message: 'Excelente continuidade operacional! Sequência mantida com sucesso nas últimas 24 horas. Recarga completa de suprimentos efetuada.'
          });
        }, 1500);
      } else {
        // Broken streak
        const updatedStreak = 1;
        const bonusCoins = 60;
        
        const updated = {
          ...currentStats,
          streak: updatedStreak,
          coins: currentStats.coins + bonusCoins
        };
        setStats(updated);
        localStorage.setItem('chqao_stats', JSON.stringify(updated));
        localStorage.setItem('chqao_last_login_date', today);
        
        setTimeout(() => {
          audioEngine.playSFX('carimbo');
          setDailyBonusBanner({
            show: true,
            coinsEarned: bonusCoins,
            xpEarned: 0,
            streakCount: updatedStreak,
            message: 'Apresentou-se com atraso para a formatura diária! A sequência de estudos foi reiniciada, mas garantimos ração de acampamento extra.'
          });
        }, 1500);
      }
    } catch (e) {
      console.warn("Failed daily login check:", e);
    }
  };

  // Save states helper
  const handleOnboardingComplete = async (data: CustomSoldier) => {
    setSoldier(data);
    localStorage.setItem('chqao_soldier', JSON.stringify(data));
    
    const initialStats: ScoreStats = {
      pm: 0.0,
      coins: 450,
      prontidao: 100,
      streak: 4,
      xp: 0,
      posto: 'Soldado',
      fase: 1,
      nivel: 1,
      bizus: 3 // Start with 3 Bizus!
    };
    setStats(initialStats);
    localStorage.setItem('chqao_stats', JSON.stringify(initialStats));

    // Tenta sincronizar as configurações do alistamento no Supabase
    try {
      console.log('Sincronizando perfil com Supabase...');
      const profileId = data.id || 'e25543e9-161a-4ce5-a25d-484fd98fd8ad';
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profileId,
          user_id: profileId,
          email: data.googleEmail || 'rafaeldutravalle@gmail.com',
          nome_guerra: data.guerraName,
          biotipo: data.biotipo || 'Atlético',
          tom_pele: data.skinTone || 'Pardo'
        });

      if (error) {
        console.warn('Erro ao sincronizar perfil no profiles:', error.message);
      } else {
        console.log('Perfil sincronizado com sucesso no Supabase.');
      }
    } catch (e) {
      console.warn('Erro ao acessar o banco do Supabase:', e);
    }
  };

  const handleMutedToggle = () => {
    setIsMuted(!isMuted);
    audioEngine.setMute(!isMuted);
    audioEngine.playSFX('click');
  };

  // Launch Quiz matching category
  const handleLaunchCategory = (category: SubjectCategory, regionName: string) => {
    // Check if Prontidão is 0% before starting
    if (stats.prontidao <= 0) {
      audioEngine.playSFX('erro');
      alert('Sua Prontidão está zerada! Você deve baixar ao Rancho para carregar energias!');
      setActiveTab('instrucao');
      // Subtab will auto switch to Rancho
      return;
    }

    // Filter matching quiz questions
    const filtered = questions.filter(q => q.category === category);
    if (filtered.length === 0) {
      alert('Treinamento para esta categoria está em manutenção!');
      return;
    }

    audioEngine.playSFX('fanfarra');
    audioEngine.playBGM('missao');
    
    setQuizQuestions(filtered.slice(0, 5)); // 5 questions per mission
    setActiveQuizCategory(category);
    setShowCarameloSpeech(false);
    setCarameloAnnouncement(null);
  };

  // Answer correctly results
  const handleAnswerCorrect = (pmEarned: number, xpEarned: number) => {
    setStats((prev) => {
      const nextPm = prev.pm + pmEarned;
      const nextXp = prev.xp + xpEarned;
      const nextCoins = prev.coins + 15; // earn 15 credits

      // Rank mapping based on Phase / Ranks in Roteiro point 5
      let nextPosto = prev.posto;
      let nextFase = prev.fase;

      if (nextPm >= 1500) { nextPosto = 'Capitão QAO'; nextFase = 8; }
      else if (nextPm >= 1200) { nextPosto = '1º Tenente'; nextFase = 7; }
      else if (nextPm >= 1000) { nextPosto = '2º Tenente'; nextFase = 6; }
      else if (nextPm >= 800) { nextPosto = 'Subtenente'; nextFase = 5; }
      else if (nextPm >= 600) { nextPosto = '1º Sgt'; nextFase = 4; }
      else if (nextPm >= 400) { nextPosto = '2º Sgt'; nextFase = 3; }
      else if (nextPm >= 250) { nextPosto = '3º Sgt'; nextFase = 2; }
      else if (nextPm >= 100) { nextPosto = 'Cabo'; nextFase = 1.5; }

      // Level promo trigger fanfare!
      if (nextPosto !== prev.posto) {
        audioEngine.playSFX('fanfarra');
        setPromoCertVisible(true);
      }

      const updated = { ...prev, pm: nextPm, xp: nextXp, coins: nextCoins, posto: nextPosto, fase: nextFase };
      localStorage.setItem('chqao_stats', JSON.stringify(updated));
      return updated;
    });

    // Advance daily progress
    setDailyMissions((prev) => 
      prev.map((mission) => {
        if (mission.id === '3') {
          const nextProg = Math.min(mission.progress + pmEarned, mission.target);
          return { ...mission, progress: nextProg, completed: nextProg >= mission.target };
        }
        return mission;
      })
    );
  };

  // Answer incorrectly results
  const handleAnswerIncorrect = (prontidaoCost: number) => {
    setStats((prev) => {
      const nextProntidao = Math.max(prev.prontidao - prontidaoCost, 0);
      
      const updated = { ...prev, prontidao: nextProntidao };
      localStorage.setItem('chqao_stats', JSON.stringify(updated));
      
      if (nextProntidao <= 0) {
        audioEngine.playSFX('alarme');
        alert('Cuidado, combatente! Sua barra de Prontidão Operacional chegou a 0%! Você foi baixado ao Rancho de Serviço para re-instrução obrigatória!');
        setActiveQuizCategory(null);
        setActiveTab('instrucao');
      }

      return updated;
    });
  };

  const handleUseBizu = () => {
    // Deduct 1 Bizu
    setStats((prev) => {
      const updated = { ...prev, bizus: Math.max((prev.bizus || 0) - 1, 0) };
      localStorage.setItem('chqao_stats', JSON.stringify(updated));
      return updated;
    });
  };

  const getNextMissionText = (currentPm: number) => {
    if (currentPm < 100) return `Promoção a Cabo (necessita 100 PM, faltam ${100 - currentPm} PM)`;
    if (currentPm < 250) return `Promoção a 3º Sargento (necessita 250 PM, faltam ${250 - currentPm} PM)`;
    if (currentPm < 400) return `Promoção a 2º Sargento (necessita 400 PM, faltam ${400 - currentPm} PM)`;
    if (currentPm < 600) return `Promoção a 1º Sargento (necessita 600 PM, faltam ${600 - currentPm} PM)`;
    if (currentPm < 800) return `Promoção a Subtenente (necessita 800 PM, faltam ${800 - currentPm} PM)`;
    if (currentPm < 1000) return `Promoção a 2º Tenente (necessita 1000 PM, faltam ${1000 - currentPm} PM)`;
    if (currentPm < 1200) return `Promoção a 1º Tenente (necessita 1200 PM, faltam ${1200 - currentPm} PM)`;
    if (currentPm < 1500) return `Promoção a Capitão QAO (necessita 1500 PM, faltam ${1500 - currentPm} PM)`;
    return "Consolidação de Oficiais no CHQAO";
  };

  const handleCompleteQuiz = () => {
    audioEngine.playSFX('medalha');
    alert('Missão concluída com aproveitamento de campanha! Mais créditos adicionados!');
    
    // Advance daily progress for completed mission
    setDailyMissions((prev) => 
      prev.map((m) => {
        if (m.id === '1') {
          return { ...m, progress: Math.min(m.progress + 1, m.target), completed: true };
        }
        return m;
      })
    );

    setActiveQuizCategory(null);
    audioEngine.playBGM('qg');
    setShowCarameloSpeech(true);
    setCarameloAnnouncement(getNextMissionText(stats.pm));
  };

  // Restore energy amount
  const handleRestoreEnergy = (amount: number, fee: number) => {
    setStats((prev) => {
      const nextEnergy = Math.min(prev.prontidao + amount, 100);
      const nextCoins = Math.max(prev.coins - fee, 0);
      const updated = { ...prev, prontidao: nextEnergy, coins: nextCoins };
      localStorage.setItem('chqao_stats', JSON.stringify(updated));
      return updated;
    });
  };

  // Write a warning transgressions log
  const handleAddWarning = (log: WarningLog) => {
    setWarningLogs((prev) => {
      const updated = [log, ...prev];
      localStorage.setItem('chqao_warnings', JSON.stringify(updated));
      return updated;
    });
    
    // Increment daily dilemmas mission
    setDailyMissions((prev) => 
      prev.map((m) => {
        if (m.id === '2') {
          return { ...m, progress: Math.min(m.progress + 1, m.target), completed: true };
        }
        return m;
      })
    );
  };

  // Directly update PM points simple
  const handleUpdatePM = (amount: number) => {
    setStats((prev) => {
      const nextPm = Math.max(prev.pm + amount, 0);
      const updated = { ...prev, pm: nextPm };
      localStorage.setItem('chqao_stats', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset/Clear progress for testing
  const handleHardReset = () => {
    if (confirm('Atenção: deseja limpar toda sua FVM e pontuação cadastral do CHQAO Quest?')) {
      localStorage.clear();
      setSoldier(null);
      setStats({
        pm: 0,
        coins: 400,
        prontidao: 100,
        streak: 4,
        xp: 0,
        posto: 'Soldado',
        fase: 1,
        nivel: 1,
        bizus: 3
      });
      setWarningLogs([]);
      setActiveQuizCategory(null);
      setActiveTab('cofront');
      audioEngine.playSFX('carimbo');
    }
  };

  const specialtyInfo = SPECIALTIES.find(s => s.id === soldier?.specialtyId);

  // Default fallback medals list
  const medalsToUnlock = [
    { name: 'Praça Mais Distinta', req: 'Ganha no Alistamento Inicial', icon: 'medalha', acquired: Boolean(soldier) },
    { name: 'Marechal Osório', req: 'Conquiste mais de 250 PM', icon: 'medalha', acquired: stats.pm >= 250 },
    { name: 'Corpo de Tropa', req: 'Conquiste mais de 600 PM', icon: 'medalha', acquired: stats.pm >= 600 },
    { name: 'Duque de Caxias', req: 'Aproveitamento pleno na prova final', icon: 'medalha', acquired: stats.pm >= 1500 }
  ];

  // Display Onboarding screen if user didn't register yet
  if (!soldier) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className={`flex flex-col h-screen overflow-hidden transition-colors duration-500 text-[#E8E4D9] font-sans antialiased text-center ${
      isNightStyle ? 'bg-[#070907] brightness-[0.93]' : 'bg-[#0F1410]'
    }`}>
      
      {/* HUD floating panel */}
      <HUD 
        stats={stats} 
        guerraName={soldier.guerraName}
        avatarPhoto={soldier.avatarPhoto}
        specialtyName={specialtyInfo?.name}
        onOpenSettings={() => {}}
        openFvmHistory={() => setIsFvmExpanded(true)}
        onLogout={() => {
          localStorage.clear();
          window.location.reload();
        }}
      />

      {/* SCROLLABLE MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto w-full pb-20 scrollbar-thin">

      {/* COMPACT APP TOP CONTROL BUTTONS (COMUNICADOS/OPÇÕES COMENTADOS PARA SIMPLIFICAÇÃO) */}
      <div className="max-w-xl w-full mx-auto px-3 sm:px-4 pt-4 flex flex-col gap-2 justify-center items-center text-xs">
        {/*
        <div className="flex gap-2">
          <button 
            onClick={handleMutedToggle}
            className="px-2.5 py-1.5 bg-[#1A2118] border border-[#242D22] text-[#A39E93] hover:text-[#E8E4D9] rounded-lg font-mono flex items-center gap-1.5 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#C5A059]" />}
            <span>{isMuted ? 'MUDO' : 'ÁUDIO'}</span>
          </button>

          <button 
            onClick={() => {
              audioEngine.playSFX('click');
              setShowSoundSettings(!showSoundSettings);
            }}
            className={`px-2.5 py-1.5 border font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-[10px] uppercase font-bold select-none ${
              showSoundSettings 
                ? 'bg-[#242D22] border-[#C5A059] text-white' 
                : 'bg-[#1A2118] border-[#242D22] text-[#A39E93] hover:text-[#E8E4D9]'
            }`}
          >
            <span>⚙️ SOM</span>
          </button>

          <button 
            onClick={() => {
              audioEngine.playSFX('click');
              setIsNightStyle(!isNightStyle);
            }}
            className={`px-2.5 py-1.5 border font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-[10px] uppercase font-bold select-none ${
              isNightStyle 
                ? 'bg-[#122B14]/80 border-[#00FF55]/40 text-[#00FF55]' 
                : 'bg-[#1A2118] border-[#242D22] text-[#A39E93] hover:text-[#E8E4D9]'
            }`}
          >
            {isNightStyle ? <Moon className="w-3.5 h-3.5 text-[#00FF55]" /> : <Sun className="w-3.5 h-3.5 text-[#C5A059]" />}
            <span>{isNightStyle ? 'TEMA NOTURNO' : 'TEMA DIURNO'}</span>
          </button>
        </div>
        */}

        <button 
          onClick={() => {
            audioEngine.playSFX('click');
            setActiveTab('instrucao');
          }}
          className="text-[11px] sm:text-xs uppercase font-mono text-[#C5A059] font-bold flex items-center gap-1.5 bg-[#111712] hover:bg-[#1A2118] px-3.5 py-2 rounded border border-[#242D22] cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#C5A059]" /> PLANO: {tier === 'MaxWolf' ? 'MAX WOLF FILHO' : tier === 'SuperSub' ? 'SUPERSUB' : 'GRATUITO'}
        </button>

        {/*
        <button 
          onClick={handleHardReset}
          className="text-[#8B2635] hover:underline font-mono text-[10px] font-bold"
        >
          MAST_RESET
        </button>
        */}
      </div>

      {/* COLLAPSIBLE SOUND PANEL (DESABILITADO TEMPORARIAMENTE) */}
      {/*
      {showSoundSettings && (
        <div className="w-full max-w-xl mx-auto px-4 mt-2">
          <div className="bg-[#111712] border border-[#C5A059]/30 rounded-lg p-3 text-left font-mono space-y-3 shadow-lg">
            <div className="text-[10px] text-[#C5A059] uppercase font-bold border-b border-[#242D22] pb-1">
              Controle de Volume Procedural
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#A39E93]">MÚSICA (BGM): {Math.round(bgmVol * 100)}%</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={bgmVol}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setBgmVol(val);
                  audioEngine.setVolumes(val, sfxVol);
                  localStorage.setItem('chqao_bgm_vol', val.toString());
                }}
                className="w-32 accent-[#C5A059]"
              />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#A39E93]">EFEITOS (SFX): {Math.round(sfxVol * 100)}%</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={sfxVol}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSfxVol(val);
                  audioEngine.setVolumes(bgmVol, val);
                  localStorage.setItem('chqao_sfx_vol', val.toString());
                  audioEngine.playSFX('click');
                }}
                className="w-32 accent-[#C5A059]"
              />
            </div>
          </div>
        </div>
      )}
      */}

      {/*
      {isNightStyle && (
        <div className="max-w-xl w-full mx-auto px-4 mt-2">
          <div className="bg-[#111712] border border-[#00FF55]/20 p-1.5 rounded-lg text-center text-[#00FF55] font-mono text-[8px] uppercase tracking-widest animate-pulse flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF55] inline-block" />
            👁️ TEMA OPERACIONAL ATIVO (SUAVE DE 19H ÀS 06H)
          </div>
        </div>
      )}
      */}

      {/* CORE VIEW MODULES */}
      <main className="flex-1 max-w-xl w-full mx-auto px-2.5 sm:px-4 py-3 sm:py-4 space-y-4 pb-24">
        
        {activeQuizCategory ? (
          /* ACTIVE EXAM RUNNING MODE SCREEN */
          <QuizPanel 
            questions={quizQuestions}
            category={activeQuizCategory}
            guerraName={soldier.guerraName}
            tier={tier}
            bizusCount={stats.bizus || 0}
            onUseBizu={handleUseBizu}
            onAnswerCorrect={handleAnswerCorrect}
            onAnswerIncorrect={handleAnswerIncorrect}
            onCompleteQuiz={handleCompleteQuiz}
            onFailQuiz={() => {}}
            onAnswerQuestion={(q) => {
              const text = q.text.toLowerCase();
              const explanation = q.explanation.toLowerCase();
              if (text.includes('sindicância') || text.includes('sindicante') || explanation.includes('sindicância')) {
                setHasStartedSindicancia(true);
                localStorage.setItem('chqao_has_started_sindicancia', 'true');
                console.log('User started answering sindicância questions. Ética & Liderança tab unlocked!');
              }
            }}
          />
        ) : (
          /* STANDARD GAMEPLAY MAIN CHANNELS */
          <>
            <CarameloMascot 
              prontidao={stats.prontidao}
              streak={stats.streak}
              guerraName={soldier.guerraName}
              posto={stats.posto}
              showSpeech={showCarameloSpeech}
              announcement={carameloAnnouncement}
            />

            {/* TAB-SWITCHED PANELS */}
            <AnimatePresence mode="wait">
              {activeTab === 'cofront' && (
                <motion.div 
                  key="cofront"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                >
                  <BrazilMap 
                    currentFase={stats.fase}
                    onLaunchCategory={handleLaunchCategory}
                  />
                </motion.div>
              )}

              {activeTab === 'loja' && (
                <motion.div 
                  key="loja"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                >
                  <CommandStore 
                    stats={stats}
                    onPurchaseItem={(itemId, cost) => {
                      setStats((prev) => {
                        const nextBizus = itemId === 'bizu' ? (prev.bizus || 0) + 1 : (prev.bizus || 0);
                        const updated = { 
                          ...prev, 
                          coins: Math.max(prev.coins - cost, 0),
                          bizus: nextBizus
                        };
                        localStorage.setItem('chqao_stats', JSON.stringify(updated));
                        return updated;
                      });
                    }}
                    onRestoreEnergy={handleRestoreEnergy}
                    tier={tier}
                  />
                </motion.div>
              )}

              {activeTab === 'instrucao' && (
                <motion.div 
                  key="instrucao"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                  className="space-y-4"
                >
                  <DicaDoDia />
                  <InstructionCenter 
                    stats={stats}
                    museumCards={[]}
                    onUnlockCard={() => {}}
                    onRestoreEnergy={handleRestoreEnergy}
                    onAddWarning={handleAddWarning}
                    onUpdatePM={handleUpdatePM}
                    onAnswerRecoveryQuestion={(correct) => {
                      if (correct) {
                        setDailyMissions((prev) => 
                          prev.map((m) => {
                            if (m.id === '1') {
                              return { ...m, progress: Math.min(m.progress + 1, m.target), completed: true };
                            }
                            return m;
                          })
                        );
                      }
                    }}
                    tier={tier}
                    hasDifficultHistory={questions.some(q => q.category === 'História' && (q.difficulty === 'Difícil' || q.difficulty === 'Desafio' || q.dificuldade === 'Difícil' || q.dificuldade === 'Desafio'))}
                    hasStartedSindicancia={hasStartedSindicancia}
                    onUpgrade={(newTier) => {
                      setTier(newTier);
                      localStorage.setItem('chqao_tier', newTier);
                    }}
                  />
                </motion.div>
              )}

              {activeTab === 'record' && (
                <motion.div 
                  key="record"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                  className="space-y-4"
                >
                  <FVMExpandable 
                    stats={stats}
                    guerraName={soldier.guerraName}
                    specialtyName={specialtyInfo?.name || 'Recruta'}
                    dailyMissions={dailyMissions}
                    warningLogs={warningLogs}
                    isExpanded={isFvmExpanded}
                    onToggleExpand={() => setIsFvmExpanded(!isFvmExpanded)}
                    medalsToUnlock={medalsToUnlock}
                    soldier={soldier}
                    currentFase={stats.fase}
                  />
                  <ServiceRecordTimeline 
                    stats={stats}
                    specialtyName={specialtyInfo?.name || 'Recruta'}
                  />
                </motion.div>
              )}

              {activeTab === 'rankings' && (
                <motion.div 
                  key="rankings"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                >
                  <Rankings 
                    stats={stats}
                    guerraName={soldier?.guerraName || 'Recruta'}
                    specialtyName={specialtyInfo?.name || 'Recruta'}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

      </main>
      </div>

      {/* STICKY BOTTOM DECK NAVIGATION (IF NOT IN EXAM) */}
      {!activeQuizCategory && (
        <div className="fixed bottom-0 inset-x-0 bg-[#161F17]/95 border-t border-[#C5A059]/20 backdrop-blur-md p-2 z-40 shadow-2xl">
          <div className="max-w-xl mx-auto flex gap-1 justify-around">
            {[
              { id: 'cofront', label: 'Quartel', desc: 'Mapa' },
              { id: 'instrucao', label: 'Instrução', desc: 'Dilemas' },
              { id: 'record', label: 'FVM', desc: 'Dossiê' },
              { id: 'rankings', label: 'Ranking', desc: 'Turma' },
              { id: 'loja', label: 'Loja', desc: 'Suprimentos' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { 
                    audioEngine.playSFX('click'); 
                    setActiveTab(tab.id as any);
                    setCarameloAnnouncement(null);
                    if (tab.id === 'cofront') {
                      setShowCarameloSpeech(true);
                    } else {
                      setShowCarameloSpeech(false);
                    }
                  }}
                  className={`flex-1 py-2 px-1 rounded-xl transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#4B5320] text-[#E8E4D9] font-extrabold border-2 border-black shadow' 
                      : 'text-[#A39E93] hover:text-white'
                  }`}
                  style={{
                    boxShadow: isActive ? '2px 2px 0px #000' : 'none'
                  }}
                >
                  <span className="text-xs uppercase font-mono block leading-none font-bold">{tab.label}</span>
                  <span className="text-[9px] opacity-80 block font-mono leading-tight mt-1">{tab.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PROMOTIONAL CEREMONIAL REVELATION OVERLAY */}
      <AnimatePresence>
        {promoCertVisible && (
          <PromoCeremonial 
            stats={stats}
            guerraName={soldier?.guerraName || 'Recruta'}
            specialtyName={specialtyInfo?.name || 'Recruta'}
            onClose={() => setPromoCertVisible(false)}
          />
        )}
      </AnimatePresence>

      {/* DAILY LOGIN STUDY STREAK OVERLAY */}
      <AnimatePresence>
        {dailyBonusBanner && dailyBonusBanner.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-[#161F17] border-2 border-[#C5A059] rounded-2xl p-6 max-w-sm w-full text-center relative overflow-hidden shadow-2xl"
              style={{ boxShadow: '0px 0px 30px rgba(197, 160, 89, 0.25)' }}
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C5A059]" />
              
              <div className="w-14 h-14 bg-[#C5A059]/10 rounded-full flex items-center justify-center mx-auto mb-3.5 border border-[#C5A059]/50 shadow-inner">
                <CalendarDays className="w-7 h-7 text-[#C5A059]" />
              </div>

              <h3 className="text-md font-bold uppercase font-mono tracking-wider text-[#E8E4D9]">
                APRESENTAÇÃO DIÁRIA
              </h3>
              <p className="text-[9px] text-[#C5A059] font-mono tracking-widest uppercase mb-3 text-center">
                Quartel de Instrução do CHQAO
              </p>

              <p className="text-xs text-[#A39E93] leading-relaxed mb-4 p-3 bg-[#111712] rounded-lg border border-[#242D22] text-left">
                {dailyBonusBanner.message}
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-4.5 font-mono">
                <div className="bg-[#1C251E] p-2.5 rounded-lg border border-[#242D22]">
                  <span className="text-[8px] text-[#A39E93] block uppercase tracking-wide">Munição ganha</span>
                  <span className="text-base font-extrabold text-[#00FF55]">+{dailyBonusBanner.coinsEarned} ₢</span>
                </div>
                <div className="bg-[#1C251E] p-2.5 rounded-lg border border-[#242D22]">
                  <span className="text-[8px] text-[#A39E93] block uppercase tracking-wide">Sequência atual</span>
                  <span className="text-base font-extrabold text-[#C5A059]">{dailyBonusBanner.streakCount} {dailyBonusBanner.streakCount === 1 ? 'Dia' : 'Dias'}</span>
                </div>
              </div>

              {dailyBonusBanner.xpEarned > 0 && (
                <div className="bg-[#1C251E]/80 py-2 px-3 rounded-lg border border-[#242D22] mb-5 font-mono text-[10.5px] text-[#E8E4D9]">
                  🔥 Bônus Operacional: <strong className="text-cyan-400">+{dailyBonusBanner.xpEarned} XP</strong>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  audioEngine.playSFX('click');
                  setDailyBonusBanner(null);
                }}
                className="w-full py-3 bg-[#4B5320] hover:bg-[#3B4219] text-[#E8E4D9] font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 border-2 border-black cursor-pointer shadow-md"
                style={{ boxShadow: '2px 2px 0px #000' }}
              >
                APRESENTAR-SE AO SERVIÇO
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
