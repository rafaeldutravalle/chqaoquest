import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, User, Award, CheckCircle, ChevronRight, Volume2, HelpCircle, Map, BookOpen, Users, Target, Compass } from 'lucide-react';
import { SPECIALTIES } from '../data/specialties';
import { CustomSoldierSVG } from './CustomSoldierSVG';
import { CustomSoldier, ScoreStats } from '../types';
import { audioEngine } from '../lib/audioEngine';
import { supabase } from '../lib/supabase';
import hBranco from '../assets/h_soldado_branco_.jpeg';
import hNegro from '../assets/h_soldado_negro.png';
import mBranca from '../assets/m_soldado_branca.jpeg';
import mNegra from '../assets/m_soldado_negra.png';
import mIndigena from '../assets/m_soldado_indg.png';
import capCisplatinaImg from '../assets/capCisplatina.png';
import appIcon from '../assets/app-icon.png';
import carameloImg from '../assets/caramelo_v2.png';

const AVATAR_PHOTOS: { key: 'h_branco' | 'h_negro' | 'm_branca' | 'm_negra' | 'm_indigena'; src: string; label: string }[] = [
  { key: 'h_branco', src: hBranco, label: 'Soldado' },
  { key: 'h_negro', src: hNegro, label: 'Soldado' },
  { key: 'm_branca', src: mBranca, label: 'Soldada' },
  { key: 'm_negra', src: mNegra, label: 'Soldada' },
  { key: 'm_indigena', src: mIndigena, label: 'Soldada Indígena' },
];

interface OnboardingFlowProps {
  onComplete: (soldier: CustomSoldier) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState(SPECIALTIES[0].id);
  const [guerraName, setGuerraName] = useState('');
  const [biotipo, setBiotipo] = useState('Atlético');
  const [skinTone, setSkinTone] = useState('Bronze');
  const [faceType, setFaceType] = useState('Determinado');
  const [avatarPhoto, setAvatarPhoto] = useState<'h_branco' | 'h_negro' | 'm_branca' | 'm_negra' | 'm_indigena' | undefined>('h_branco');

  // Preview interactive states for Slide 3
  const [previewSpec, setPreviewSpec] = useState('infantaria');
  const [previewFase, setPreviewFase] = useState(0); // 0=Recruta, 2=3º Sgt, 5=Subtenente, 8=Capitão QAO

  const [googleAccount, setGoogleAccount] = useState<{ name: string; email: string; avatar: string } | null>(null);
  const [authUserId, setAuthUserId] = useState<string>('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const [typingText, setTypingText] = useState('');
  const [briefingStage, setBriefingStage] = useState(1); // 1: speech, 2: FVM envelope, 3: FVM revealed

  // Launch welcome fanfare on slide 1
  useEffect(() => {
    if (step === 1) {
      audioEngine.playSFX('fanfarra');
    }
  }, [step]);

  // Handle specialty audio triggers
  const handleSelectSpecialty = (id: string) => {
    setSelectedSpecialty(id);
    // Play characteristic programmatic sound
    switch (id) {
      case 'infantaria':
        audioEngine.playSFX('click'); // marcher click
        break;
      case 'artilharia':
        audioEngine.playSFX('erro'); // low rumble
        break;
      case 'cavalaria':
        audioEngine.playSFX('bizu'); // slide gallop
        break;
      case 'engenharia':
        audioEngine.playSFX('medalha'); // hammer tap
        break;
      case 'comunicacoes':
        audioEngine.playSFX('alarme'); // radio static tone
        break;
      case 'saude':
        audioEngine.playSFX('acerto'); // pulse bleeps
        break;
      case 'aviacao':
        audioEngine.playSFX('bizu'); // rotor whoosh
        break;
      case 'topografia':
        audioEngine.playSFX('click'); // compass click
        break;
      case 'intendencia':
        audioEngine.playSFX('cunhete'); // march weight
        break;
      case 'musica':
        audioEngine.playSFX('combo'); // bugle flourish
        break;
      case 'material_belico':
        audioEngine.playSFX('click'); // ammo load click
        break;
      default:
        audioEngine.playSFX('click');
        break;
    }
  };

  // Briefing typewriter dialogue
  const briefingLine = `Recruta ${(guerraName || 'Combatente').toUpperCase().trim()}, bem-vindo ao Batalhão de Guararapes. Sou o Capitão Cisplatina, Comandante da Companhia de Comando e Apoio. A partir de hoje, você inicia sua honrosa jornada de preparação técnica ao CHQAO. A disciplina e o mérito guiarão seus passos rumo ao oficialato.`;

  useEffect(() => {
    if (step === 7 && briefingStage === 1) {
      setTypingText('');
      
      const textToType = briefingLine;
      let isCancelled = false;
      let currentIdx = 0;
      
      const type = () => {
        if (isCancelled) return;
        
        if (currentIdx < textToType.length) {
          const char = textToType[currentIdx];
          if (char !== undefined) {
            setTypingText((prev) => prev + char);
            audioEngine.playSFX('typewriter');
          }
          currentIdx++;
          setTimeout(type, 35);
        }
      };
      
      // Short delay to let step transition and state settle before typing starts
      const delayTimeout = setTimeout(type, 150);
      
      return () => {
        isCancelled = true;
        clearTimeout(delayTimeout);
      };
    }
  }, [step, briefingStage, briefingLine]);

  const handleNextStep = () => {
    audioEngine.playSFX('click');
    if (step === 4) {
      if (!googleAccount) {
        alert('Atenção, combatente! O alistamento exige autenticação via Google. Clique em "ENTRAR COM CONTA GOOGLE" para prosseguir.');
        return;
      }
      setStep(5);
    } else if (step === 6) {
      if (!guerraName.trim()) {
        alert('Por favor, informe seu Nome de Guerra.');
        return;
      }
      setStep(7);
    } else if (step === 7) {
      if (briefingStage < 3) {
        if (briefingStage === 1) {
          audioEngine.playSFX('cunhete'); // Envelope sound
        } else {
          audioEngine.playSFX('carimbo'); // Stamp sound
        }
        setBriefingStage((prev) => prev + 1);
      } else {
        setStep(8);
      }
    } else if (step === 8) {
      audioEngine.playSFX('fanfarra');
      onComplete({
        id: authUserId,
        guerraName: guerraName.toUpperCase().trim(),
        specialtyId: selectedSpecialty,
        biotipo,
        skinTone,
        faceType,
        avatarPhoto,
        googleEmail: googleAccount?.email || ''
      });
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const currentSpecialtyInfo = SPECIALTIES.find(s => s.id === selectedSpecialty);

  const getStepTitle = () => {
    if (step <= 3) return 'INTRODUÇÃO AO PROJETO';
    if (step === 4) return 'ALISTAMENTO MILITAR';
    if (step === 5) return 'ESCOLHA DE ARMA/SERVIÇO';
    if (step === 6) return 'IDENTIFICAÇÃO DE TROPA';
    if (step === 7) return 'DIRETRIZ DE COMANDO';
    return 'PRONTIDÃO DO RECRUTA';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F1410] text-[#E8E4D9] p-4 font-sans select-none">
      <div className="w-full max-w-lg bg-[#111712] border-2 border-[#C5A059]/30 rounded-xl overflow-hidden shadow-2xl relative" style={{ boxShadow: '0 0 35px rgba(197, 160, 89, 0.15)' }}>

        {/* TOP STATUS BAR CONTAINER */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-[#242D22] bg-[#161F17] text-xs font-mono text-[#A39E93]">
          <span className="flex items-center gap-1.5 text-[#C5A059]">
            <Shield className="w-3.5 h-3.5" /> {getStepTitle()}
          </span>
          <span>PASSO {step} DE 8</span>
        </div>

        {/* STEP VIEWPORTS */}
        <div className="p-6 relative min-h-[520px] flex flex-col justify-between">

          <AnimatePresence mode="wait">
            {/* PÁGINA 1: PÁGINA DE BOAS-VINDAS */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center text-center py-4 h-full"
              >
                {/* APP ICON DISPLAY */}
                <div className="relative mb-5 bg-[#141C15] p-2 rounded-2xl border border-[#C5A059]/20 shadow-2xl overflow-hidden max-w-[180px]">
                  <img
                    src={appIcon}
                    alt="CHQAO Quest Logo"
                    className="w-full aspect-square object-cover rounded-xl border border-[#C5A059]/10"
                  />
                </div>

                <h1 className="text-2xl font-black tracking-tight text-[#E8E4D9] flex items-center gap-1.5 justify-center uppercase" style={{ fontFamily: '"Arial Black", sans-serif' }}>
                  CHQAO <span className="text-[#C5A059]">QUEST</span>
                </h1>
                <p className="text-[#C5A059] text-xs font-mono uppercase tracking-widest font-extrabold mt-1">
                  A Jornada do Mérito Militar
                </p>

                <div className="mt-6 p-4 bg-[#161F17]/95 border border-[#C5A059]/25 rounded-xl text-center max-w-sm w-full space-y-3">
                  <h3 className="font-mono text-xs text-[#E8E4D9] uppercase font-bold tracking-wider">
                    Bem-vindo ao Simulador de Carreira!
                  </h3>
                  <p className="text-[12px] text-[#A39E93] leading-relaxed">
                    Sua jornada para o oficialato começa aqui. O CHQAO Quest é uma plataforma gamificada de preparação de alta performance, unindo simulados oficiais com tomada de decisão tática e gestão de prestígio militar.
                  </p>
                </div>

                <div className="p-3 bg-[#242D22]/40 rounded-lg text-[11px] text-[#A39E93] max-w-sm leading-relaxed text-center mt-5 italic">
                  "Disciplina, mérito e conhecimento: prepare-se com o rigor regulamentar das nossas Forças Armadas."
                </div>
              </motion.div>
            )}

            {/* PÁGINA 2: METAS E METODOLOGIA DO JOGO - PARTE 1 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col h-full text-center py-2 justify-between"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-extrabold uppercase text-[#C5A059] tracking-wider font-mono">
                    Mecânicas de Jogo (1/2)
                  </h2>
                  <p className="text-xs text-[#A39E93]">Sua jornada operacional no simulador</p>
                </div>

                <div className="space-y-4 max-w-sm mx-auto text-left w-full">
                  {/* PILAR 1: MAPA */}
                  <div className="p-3.5 bg-[#161F17] border border-[#242D22] rounded-xl flex gap-3.5 shadow-inner">
                    <div className="w-10 h-10 rounded-lg bg-[#3B5E30]/20 flex items-center justify-center border border-[#3B5E30]/40 text-[#C5A059] flex-shrink-0">
                      <Map className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#E8E4D9] block">
                        🗺️ Mapa de Operações do EB
                      </span>
                      <p className="text-[11px] text-[#A39E93] leading-relaxed mt-1">
                        O conteúdo do concurso está mapeado pelas Regiões Militares do Brasil. Resolva missões práticas de Português (CMP), Geografia (CMA), História (CMS) e Legislação (CMSE) para conquistar territórios.
                      </p>
                    </div>
                  </div>

                  {/* PILAR 2: FVM */}
                  <div className="p-3.5 bg-[#161F17] border border-[#242D22] rounded-xl flex gap-3.5 shadow-inner">
                    <div className="w-10 h-10 rounded-lg bg-[#6A5ACD]/10 flex items-center justify-center border border-[#6A5ACD]/30 text-[#C5A059] flex-shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#E8E4D9] block">
                        📋 FVM Digital Ativa (Dossiê)
                      </span>
                      <p className="text-[11px] text-[#A39E93] leading-relaxed mt-1">
                        Cada acerto garante Pontos de Mérito (PM) na sua Ficha de Valorização do Mérito. Notas baixas nos simulados causam advertências ou reduzem seu XP de progressão na carreira.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-[10px] font-mono text-[#A39E93] uppercase tracking-widest bg-[#1D251E] py-2 px-3 rounded-lg border border-[#242D22] max-w-sm mx-auto text-center">
                  Próxima tela: Prontidão e Rancho de Recuperação.
                </div>
              </motion.div>
            )}

            {/* PÁGINA 3: METAS E METODOLOGIA DO JOGO - PARTE 2 */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col h-full text-center py-2 justify-between"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-extrabold uppercase text-[#C5A059] tracking-wider font-mono">
                    Mecânicas de Jogo (2/2)
                  </h2>
                  <p className="text-xs text-[#A39E93]">A manutenção de sua saúde operacional</p>
                </div>

                <div className="space-y-4 max-w-sm mx-auto text-left w-full">
                  {/* PILAR 3: PRONTIDÃO */}
                  <div className="p-3.5 bg-[#161F17] border border-[#242D22] rounded-xl flex gap-3.5 shadow-inner">
                    <div className="w-10 h-10 rounded-lg bg-[#B22222]/10 flex items-center justify-center border border-[#B22222]/30 text-[#C5A059] flex-shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#E8E4D9] block">
                        ⚡ Prontidão Operacional
                      </span>
                      <p className="text-[11px] text-[#A39E93] leading-relaxed mt-1">
                        Sua barra de energia inicial. Erros nos testes consomem 20% da sua prontidão. Manter uma alta prontidão é vital para poder realizar as missões táticas e de promoção.
                      </p>
                    </div>
                  </div>

                  {/* PILAR 4: RANCHO DE RECUPERAÇÃO */}
                  <div className="p-3.5 bg-[#161F17] border border-[#242D22] rounded-xl flex gap-3.5 shadow-inner">
                    <div className="w-10 h-10 rounded-lg bg-[#DAA520]/10 flex items-center justify-center border border-[#DAA520]/30 text-[#C5A059] flex-shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#E8E4D9] block">
                        🛡️ Rancho de Recuperação
                      </span>
                      <p className="text-[11px] text-[#A39E93] leading-relaxed mt-1">
                        Caso sua prontidão chegue a 0%, você ficará baixado ao Rancho de serviço. Para retornar à ativa, precisará resolver lições de revisão rápida e reforço doutrinário.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-[10px] font-mono text-[#C5A059] uppercase tracking-widest bg-[#1D251E] py-2 px-3 rounded-lg border border-[#242D22] max-w-sm mx-auto text-center font-bold">
                  🎯 Meta Supremo: 1500 PM + Prova Final ➜ CAPITÃO QAO!
                </div>
              </motion.div>
            )}

            {/* PÁGINA 4 (Original Step 1): SPECIAL SPLASH - AUTHENTICATION & LOGIN */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center text-center py-4 h-full"
              >
                {/* SMALL LOGO DRAWING */}
                {/* APP ICON DISPLAY */}
                <div className="relative mb-5 bg-[#141C15] p-2 rounded-2xl border border-[#C5A059]/20 shadow-2xl overflow-hidden max-w-[140px] mx-auto">
                  <img
                    src={appIcon}
                    alt="CHQAO Quest Logo"
                    className="w-full aspect-square object-cover rounded-xl border border-[#C5A059]/10"
                  />
                </div>

                <h2 className="text-xl font-extrabold uppercase text-[#E8E4D9] font-mono leading-tight">
                  Alistamento Inicial
                </h2>
                <p className="text-xs text-[#A39E93] max-w-xs mt-1.5 leading-relaxed">
                  Autentique seus dados com segurança para salvar permanentemente sua FVM militar de campanha.
                </p>

                {/* GOOGLE SIGN IN ZONE */}
                <div className="mt-8 w-full max-w-sm">
                  {googleAccount ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#1D251E] border border-[#C5A059]/45 p-3.5 rounded-xl flex items-center justify-between shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={googleAccount.avatar}
                          alt="Google Profile"
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full border border-[#C5A059]/30"
                        />
                        <div className="text-left leading-tight">
                          <p className="text-xs font-mono font-bold text-[#E8E4D9] uppercase">{googleAccount.name}</p>
                          <p className="text-[10px] text-[#A39E93]">{googleAccount.email}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-[#5F7161] bg-[#5F7161]/10 px-2 py-0.5 rounded border border-[#5F7161]/30 font-bold uppercase">
                        Sincronizado
                      </span>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => {
                          audioEngine.playSFX('click');
                          setShowGoogleModal(true);
                        }}
                        className="w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-lg border-2 border-black tracking-wide transition-all shadow-md active:translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
                        style={{ boxShadow: '4px 4px 0px #C5A059' }}
                      >
                        {/* Google G-logo */}
                        <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fill="#4285F4"
                            d="M23.76 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.6c-.29 1.48-1.13 2.73-2.4 3.58v2.98h3.89c2.27-2.09 3.67-5.17 3.67-8.69z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-2.98c-1.08.72-2.45 1.16-4.04 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.08C3.18 21.88 7.31 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.32 14.31A7.16 7.16 0 0 1 5 12c0-.81.14-1.59.32-2.31V6.61H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.39l4.11-3.08z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.39l4.11 3.08c.94-2.85 3.57-4.96 6.68-4.96z"
                          />
                        </svg>
                        <span className="font-mono text-xs uppercase tracking-wider">Entrar com conta Google</span>
                      </button>
                      <p className="text-[10px] text-[#A39E93]/75 italic text-center leading-relaxed">
                        * Autentique-se via login seguro da Google com um clique para sincronizar sua Ficha de Valorização do Mérito (FVM).
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TELA 2: CHOOSE MILITARY ARMS SPECIALTY */}
            {step === 5 && (
              <motion.div
                key="step5_specialty"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col h-full"
              >
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold uppercase tracking-wider text-[#C5A059] font-mono">
                    Escolha Sua Especialidade
                  </h2>
                  <p className="text-xs text-[#A39E93]">Arma ou Serviço em que integrará no QAO</p>
                </div>

                {/* Specialties Grid */}
                <div className="grid grid-cols-3 gap-2 py-2 overflow-y-auto max-h-[300px] pr-1">
                  {SPECIALTIES.map((spec) => {
                    const isSelected = selectedSpecialty === spec.id;
                    return (
                      <button
                        key={spec.id}
                        onClick={() => handleSelectSpecialty(spec.id)}
                        className={`p-2.5 rounded-lg border-2 text-left transition-all duration-150 relative flex flex-col justify-between ${isSelected
                          ? 'bg-[#242D22] border-[#C5A059] shadow-md shadow-black'
                          : 'bg-[#1A2118]/40 border-[#242D22]/70 hover:border-[#C5A059]/30'
                          }`}
                        style={{
                          boxShadow: isSelected ? '2px 2px 0px #000' : 'none'
                        }}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-bold font-mono text-white"
                            style={{ backgroundColor: spec.color }}
                          >
                            {spec.badge}
                          </span>
                          <Volume2 className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C5A059]' : 'text-[#A39E93]/40'}`} />
                        </div>
                        <div className="mt-3">
                          <div className="text-xs font-bold text-[#E8E4D9]">{spec.name}</div>
                          <div className="text-[9px] text-[#A39E93] truncate">{spec.weapon}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Description details card */}
                {currentSpecialtyInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-[#1D251E] border border-[#C5A059]/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentSpecialtyInfo.color }} />
                      <span className="text-xs font-bold uppercase tracking-wider">{currentSpecialtyInfo.name}</span>
                    </div>
                    <p className="text-[11px] text-[#A39E93] leading-relaxed">
                      {currentSpecialtyInfo.description}
                    </p>
                    <p className="text-[10px] italic mt-1.5 text-[#C5A059] font-serif">
                      "{currentSpecialtyInfo.voiceText}"
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* TELA 3: SOLDIER AVATAR DECORATOR */}
            {step === 6 && (
              <motion.div
                key="step6_avatar"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col h-full"
              >
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold uppercase tracking-wider text-[#C5A059] font-mono">
                    Identificação do Recruta
                  </h2>
                  <p className="text-xs text-[#A39E93]">Escolha seu retrato fardado e defina seu Nome de Guerra</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center py-2 h-full">
                  {/* Realtime Drawing Preview */}
                  <div className="bg-[#1A2118]/70 border border-[#C5A059]/20 rounded-xl p-3 flex flex-col items-center justify-center relative min-h-[220px]">
                    {avatarPhoto ? (
                      <img
                        src={AVATAR_PHOTOS.find(a => a.key === avatarPhoto)!.src}
                        alt="Avatar"
                        className="w-36 h-36 object-cover rounded-lg border border-[#C5A059]/40 shadow-md"
                      />
                    ) : (
                      <CustomSoldierSVG
                        skinTone={skinTone}
                        faceType={faceType}
                        biotipo={biotipo}
                        specialtyId={selectedSpecialty}
                        className="w-36 h-36"
                      />
                    )}
                    <div className="text-[9px] text-[#A39E93] mt-2 font-mono bg-[#111712] px-2 py-0.5 rounded uppercase border border-[#242D22]">
                      RECRUTA {guerraName || 'FULANO'}
                    </div>

                    {/* Avatar photo picker */}
                    <div className="mt-3 w-full">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A39E93] mb-1 text-center">
                        Escolha seu Retrato
                      </label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {AVATAR_PHOTOS.map((a) => (
                          <button
                            key={a.key}
                            onClick={() => { setAvatarPhoto(a.key); audioEngine.playSFX('click'); }}
                            className={`relative rounded-md overflow-hidden border-2 transition-all ${avatarPhoto === a.key ? 'border-[#C5A059] scale-105' : 'border-[#242D22] opacity-70 hover:opacity-100'
                              }`}
                            type="button"
                          >
                            <img src={a.src} alt={a.label} className="w-full aspect-square object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>


                  {/* Settings selectors */}
                  <div className="space-y-3.5 flex flex-col justify-center">
                    {/* Character Name */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#A39E93] mb-1">
                        Nome de Guerra:
                      </label>
                      <input
                        type="text"
                        maxLength={20}
                        placeholder="EX: FARROUPILHA"
                        value={guerraName}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^A-Za-z0-9]/g, '');
                          setGuerraName(val);
                        }}
                        className="w-full bg-[#1A2118] border border-[#C5A059]/40 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-[#C5A059] font-mono"
                      />
                    </div>



                  </div>
                </div>
              </motion.div>
            )}

            {/* TELA 4: CAPITÃO CISPLATINA BRIEFING & FVM REVEAL */}
            {step === 7 && (
              <motion.div
                key="step7_briefing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 1, scale: 0.95 }}
                className="flex flex-col h-full items-center justify-between"
              >
                {briefingStage === 1 && (
                  <div className="flex flex-col items-center">
                    {/* Capitão Cisplatina avatar depiction */}
                    <div className="flex flex-col items-center mb-3">
                      <div className="w-24 h-24 bg-[#1A2118] border-2 border-[#C5A059] rounded-full overflow-hidden shadow-md">
                        {/* Cisplatina utilizes custom look: serious face, bronze skin, robust biotipo, artilharia background */}
                        <img src={capCisplatinaImg} alt="Capitão Cisplatina" className="w-full h-full object-cover" />
                      </div>
                      <div className="mt-1.5 px-3 py-0.5 bg-[#111712] border border-[#C5A059]/30 rounded-md text-[10px] text-[#C5A059] font-mono text-center font-bold shadow">
                        CAP. CISPLATINA
                      </div>
                    </div>

                    {/* Instructors typewriter speech bubble */}
                    <div className="w-full bg-[#1A2118]/80 border border-[#C5A059]/40 p-4 rounded-xl relative min-h-[140px]">
                      <span className="text-xs leading-relaxed font-mono block text-left">
                        {typingText}
                      </span>
                      {/* blinking typing cursor bar */}
                      {typingText.length < briefingLine.length && (
                        <span className="animate-pulse font-mono text-white text-xs">|</span>
                      )}
                    </div>
                  </div>
                )}

                {briefingStage === 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-6 text-center"
                  >
                    <div className="w-20 h-28 bg-[#C5A059] rounded shadow-2xl border-2 border-[#A39E93] flex flex-col justify-between p-2 transform rotate-2 relative animate-bounce">
                      <div className="border border-[#0F1410] h-full rounded flex flex-col justify-between p-1.5 bg-[#E8E4D9] text-[#0F1410] font-mono text-center">
                        <div className="text-[8px] font-bold border-b border-[#0F1410] pb-0.5 uppercase">
                          Exército Brasileiro
                        </div>
                        <Shield className="w-6 h-6 mx-auto text-[#3B5E30]" />
                        <div className="text-[6px] text-gray-500 font-bold uppercase">
                          Dossier FVM nº 2026
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold uppercase mt-6 text-[#C5A059]">
                      Entrega Da Ficha De Valorização Do Mérito
                    </h3>
                    <p className="text-xs text-[#A39E93] max-w-xs mt-1.5 leading-relaxed">
                      "Abra o envelope lacrado para assinar e emitir sua FVM original de serviço do batalhão."
                    </p>
                  </motion.div>
                )}

                {briefingStage === 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-[#1A2118] border-2 border-[#C5A059] rounded-xl p-4 font-mono shadow-inner shadow-black relative"
                  >
                    <div className="absolute top-2 right-2 text-[8px] border border-[#5F7161] bg-[#5F7161]/10 px-1 text-[#5F7161] rounded font-bold uppercase">
                      OFICIAL
                    </div>

                    <div className="border-b border-dashed border-[#C5A059]/40 pb-2 mb-3 text-center">
                      <span className="text-[11px] font-bold tracking-widest block text-[#C5A059]">
                        EXÉRCITO BRASILEIRO
                      </span>
                      <span className="text-[8px] text-[#A39E93] uppercase">
                        Ministério da Defesa — Diretoria de Cadastro e Avaliação
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-left">
                      <div><span className="text-[#A39E93]">NOME:</span> RECRUTA {guerraName.toUpperCase()}</div>
                      <div><span className="text-[#A39E93]">ARMA/SERV:</span> {currentSpecialtyInfo?.name.toUpperCase()}</div>
                      <div><span className="text-[#A39E93]">FVM INICIAL:</span> <span className="text-[#C5A059]">100% PRONTIDÃO APURADA</span></div>
                      <div><span className="text-[#A39E93]">DATA ALISTAMENTO:</span> 20/05/2026</div>
                      <div><span className="text-[#A39E93]">PONTOS MÉRITO:</span> 0000.00 PM</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-dashed border-[#C5A059]/40 text-[9px] text-[#A39E93] leading-relaxed">
                      * Documento digital lavrado e assegurado sob os termos regulamentares de disciplina (RDE) aplicáveis. Baixo aproveitamento acadêmico incorrerá em punição disciplinar virtual e recolhimento ao Rancho.
                    </div>
                  </motion.div>
                )}

                {/* Sub-button to trigger stages inside Step 4 */}
                <button
                  onClick={handleNextStep}
                  className="mt-6 w-full py-2.5 px-4 bg-[#4B5320] text-[#E8E4D9] rounded-lg font-bold border-2 border-black tracking-wider transition-all hover:bg-[#343A16] active:translate-x-0.5 active:translate-y-0.5"
                  style={{
                    boxShadow: '4px 4px 0px #000'
                  }}
                >
                  {briefingStage === 1 && 'LER INSTRUTIVO DE COMANDO'}
                  {briefingStage === 2 && 'RECEBER ENVELOPE LACRADO'}
                  {briefingStage === 3 && 'RECEBER FVM E CUMPRIR MISSÃO'}
                </button>
              </motion.div>
            )}

            {/* TELA 5: MEET CARAMELO MASCOT & CHEKPOINTS */}
            {step === 8 && (
              <motion.div
                key="step8_caramelo"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col h-full items-center text-center justify-between"
              >
                <div>
                  {/* Caramelo puppy image */}
                  <div className="w-28 h-28 bg-[#242D22]/60 border-2 border-[#C5A059]/40 rounded-full flex items-center justify-center p-1.5 mx-auto relative mb-4">
                    <img
                      src={carameloImg}
                      alt="Mascote Caramelo"
                      className="w-24 h-24 rounded-full object-cover border border-[#C5A059]/20"
                    />
                    <span className="absolute bottom-1 -right-1 bg-[#C5A059] text-[#111712] text-[8px] font-mono px-2 py-0.5 rounded font-extrabold shadow">
                      STRENGTH: 100%
                    </span>
                  </div>

                  <h3 className="text-sm font-bold uppercase text-[#C5A059] tracking-wider">
                    "Padrão, Comandante!"
                  </h3>

                  {/* Caramelo friendly dialogue */}
                  <div className="bg-[#1D251E] border border-[#C5A059]/30 rounded-xl px-4 py-3 text-xs leading-relaxed text-[#A39E93] text-left mt-3">
                    "Sou o <span className="text-[#E8E4D9] font-bold">Caramelo</span>, seu assistente de prontidão operativa. Vou monitorar sua pontuação na FVM e alertar se cair no Rancho de serviço. Bora dar o gás que o fuzil tá pronto!"
                  </div>

                  {/* Daily Mission checklist */}
                  <div className="mt-5 space-y-2.5 text-left max-w-sm mx-auto">
                    <span className="text-[10px] font-mono text-[#C5A059] uppercase block tracking-widest border-b border-[#242D22] pb-1">
                      Missões Recebidas para Hoje:
                    </span>
                    <div className="flex items-center gap-2.5 text-xs text-[#A39E93]">
                      <CheckCircle className="w-4 h-4 text-[#5F7161]" /> Complete sua primeira lição de Português
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-[#A39E93]">
                      <CheckCircle className="w-4 h-4 text-[#242D22]" /> Exercite um dilema de conduta militar
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-[#A39E93]">
                      <CheckCircle className="w-4 h-4 text-[#242D22]" /> Conquiste 15 Pontos de Mérito
                    </div>
                  </div>
                </div>

                <div className="w-full mt-6">
                  <button
                    onClick={handleNextStep}
                    className="w-full py-2.5 px-4 bg-[#4B5320] text-[#E8E4D9] rounded-lg font-bold border-2 border-black tracking-wider transition-all hover:bg-[#343A16] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
                    style={{
                      boxShadow: '4px 4px 0px #000'
                    }}
                  >
                    IR PARA O QUARTEL GENERAL <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CHQAO STEPS PROGRESS BUTTON AT BOTTOM EXCEPT FOR TELA 7 & TELA 8 WHICH USE CUSTOM ONES */}
          {step < 7 && (
            <div className="mt-6 flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playSFX('click');
                    setStep((prev) => prev - 1);
                  }}
                  className="py-2.5 px-4 bg-[#1A2118] text-[#A39E93] border border-[#242D22] rounded-lg text-xs tracking-wider transition-all hover:text-white"
                >
                  VOLTAR
                </button>
              )}
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 py-2.5 px-4 bg-[#4B5320] hover:bg-[#343A16] text-[#E8E4D9] rounded-lg font-bold border-2 border-black tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 uppercase text-xs flex items-center justify-center gap-1.5"
                style={{
                  boxShadow: '4px 4px 0px #000'
                }}
              >
                {step === 1 ? 'Como Funciona' : step === 2 ? 'Ver Mais Metas' : step === 3 ? 'Alistar-se' : step === 4 ? 'Confirmar Alistamento' : 'Confirmar e Prosseguir'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* GOOGLE ACCOUNTS AUTH PICKER DIALOG POPUP */}
      <AnimatePresence>
        {showGoogleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-hidden font-sans"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white text-gray-800 rounded-2xl w-full max-w-sm overflow-hidden border border-gray-200 shadow-2xl relative"
            >
              {isLoadingAuth ? (
                <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#4285F4] border-t-transparent" />
                  <p className="font-bold text-gray-900 text-sm font-mono uppercase tracking-wide">Autenticando com Google...</p>
                  <p className="text-xs text-gray-500 h-6">Sincronizando carteira de Méritos (FVM) para o e-mail cadastrado...</p>
                </div>
              ) : (
                <div>
                  {/* Google Brand Header */}
                  <div className="bg-gray-50 border-b border-gray-100 p-5 flex flex-col items-center text-center">
                    <svg className="w-6 h-6 mb-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fill="#4285F4"
                        d="M23.76 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.6c-.29 1.48-1.13 2.73-2.4 3.58v2.98h3.89c2.27-2.09 3.67-5.17 3.67-8.69z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-2.98c-1.08.72-2.45 1.16-4.04 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.08C3.18 21.88 7.31 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.32 14.31A7.16 7.16 0 0 1 5 12c0-.81.14-1.59.32-2.31V6.61H1.21A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.21 5.39l4.11-3.08z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.39l4.11 3.08c.94-2.85 3.57-4.96 6.68-4.96z"
                      />
                    </svg>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">Escolher uma conta</h3>
                    <p className="text-xs text-gray-500 mt-1">para prosseguir no aplicativo <span className="font-bold text-gray-700">CHQAO Quest</span></p>
                  </div>

                  {/* Accounts List */}
                  <div className="p-4 divide-y divide-gray-100 max-h-[240px] overflow-y-auto">
                    {/* User primary account from dynamic active metadata session */}
                    <button
                      type="button"
                      onClick={async () => {
                        audioEngine.playSFX('carimbo');
                        setIsLoadingAuth(true);

                        let finalUserId = '';
                        try {
                          const targetEmail = 'rafaeldutravalle@gmail.com';
                          const targetPassword = 'CHQAO_Quest_Valle_2026!';

                          const { data: authData, error: signupErr } = await supabase.auth.signUp({
                            email: targetEmail,
                            password: targetPassword
                          });

                          if (signupErr) {
                            const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
                              email: targetEmail,
                              password: targetPassword
                            });
                            if (loginErr) {
                              console.error('Supabase signIn error:', loginErr.message);
                            } else if (loginData?.user) {
                              finalUserId = loginData.user.id;
                            }
                          } else if (authData?.user) {
                            finalUserId = authData.user.id;
                          }

                          if (finalUserId) {
                            setAuthUserId(finalUserId);
                            console.log('Real authenticated Supabase User ID obtained:', finalUserId);
                          }
                        } catch (err) {
                          console.error('Supabase Auth verification failed:', err);
                        }

                        setTimeout(() => {
                          setGoogleAccount({
                            name: 'Rafael Dutra Valle',
                            email: 'rafaeldutravalle@gmail.com',
                            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                          });
                          setGuerraName('VALLE');
                          setSkinTone('Pardo');
                          setIsLoadingAuth(false);
                          setShowGoogleModal(false);
                        }, 1200);
                      }}
                      className="w-full py-3.5 px-2 flex items-center gap-3 hover:bg-gray-50 rounded-xl transition-all duration-150 text-left cursor-pointer"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                        alt="Profile avatar"
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-gray-800">Rafael Dutra Valle</div>
                        <div className="text-[10px] text-gray-500">rafaeldutravalle@gmail.com</div>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    </button>

                    {/* Simulation combatant account */}
                    <button
                      type="button"
                      onClick={async () => {
                        audioEngine.playSFX('carimbo');
                        setIsLoadingAuth(true);

                        let finalUserId = '';
                        try {
                          const targetEmail = 'chqao.combatente@gmail.com';
                          const targetPassword = 'CHQAO_Quest_Farroupilha_2026!';

                          const { data: authData, error: signupErr } = await supabase.auth.signUp({
                            email: targetEmail,
                            password: targetPassword
                          });

                          if (signupErr) {
                            const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
                              email: targetEmail,
                              password: targetPassword
                            });
                            if (loginErr) {
                              console.error('Supabase signIn error:', loginErr.message);
                            } else if (loginData?.user) {
                              finalUserId = loginData.user.id;
                            }
                          } else if (authData?.user) {
                            finalUserId = authData.user.id;
                          }

                          if (finalUserId) {
                            setAuthUserId(finalUserId);
                            console.log('Real authenticated Supabase User ID obtained:', finalUserId);
                          }
                        } catch (err) {
                          console.error('Supabase Auth verification failed:', err);
                        }

                        setTimeout(() => {
                          setGoogleAccount({
                            name: 'Sgt. Farroupilha',
                            email: 'chqao.combatente@gmail.com',
                            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
                          });
                          setGuerraName('FARROUPILHA');
                          setSkinTone('Bronze');
                          setIsLoadingAuth(false);
                          setShowGoogleModal(false);
                        }, 1200);
                      }}
                      className="w-full py-3.5 px-2 flex items-center gap-3 hover:bg-gray-50 rounded-xl transition-all duration-150 text-left cursor-pointer"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                        alt="Profile avatar"
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-gray-800">Sgt. Farroupilha</div>
                        <div className="text-[10px] text-gray-500">chqao.combatente@gmail.com</div>
                      </div>
                    </button>
                  </div>

                  {/* Cancel / Close button */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowGoogleModal(false)}
                      className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-all py-1.5 px-3 rounded hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
