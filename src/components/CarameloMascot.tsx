import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';
import { audioEngine } from '../lib/audioEngine';
import carameloImg from '../assets/caramelo_v2.png';

interface CarameloMascotProps {
  prontidao: number;
  streak: number;
  guerraName: string;
  posto: string;
  showSpeech?: boolean;
  announcement?: string | null;
}

export const CarameloMascot: React.FC<CarameloMascotProps> = ({ 
  prontidao, 
  streak, 
  guerraName, 
  posto, 
  showSpeech = true,
  announcement = null
}) => {
  const [floatingQuotes, setFloatingQuotes] = React.useState<{id: number, text: string, x: number, y: number}[]>([]);
  const quoteIdRef = React.useRef(0);
  
  // Custom speech bubbles based on status
  const getSpeechAndPose = () => {
    if (announcement) {
      return {
        pose: 'sentido',
        title: 'Próxima Missão de Campanha!',
        speech: `Padrão, ${posto} ${guerraName}! Mais um ciclo operacional de exames concluído! O dever nos chama: nossa próxima missão é a **${announcement}**. Selva!`,
        balloonType: 'standard',
        statusColor: 'text-[#C5A059] font-bold'
      };
    }
    if (prontidao < 30) {
      return {
        pose: 'rancho',
        title: 'Baixado ao Rancho!',
        speech: `Alerta, ${posto} ${guerraName}! Nossa prontidão operacional caiu para patamar crítico (${prontidao}%). Recomendo recolhimento imediato ao Rancho de Instrução para recuperação!`,
        balloonType: 'alert',
        statusColor: 'text-[#8B2635]'
      };
    } else if (prontidao >= 30 && prontidao <= 70) {
      return {
        pose: 'preocupado',
        title: 'Força de Campanha Alerta',
        speech: `Fique atento, ${posto} ${guerraName}! Motor de prontidão falhando levemente (${prontidao}%). Uma revisão leve no Centro de Instrução evitará punições de serviço de dia!`,
        balloonType: 'warn',
        statusColor: 'text-[#C5A059]'
      };
    } else if (streak === 1) {
      return {
        pose: 'flexao',
        title: 'Ofensiva em Risco!',
        speech: `Atenção, ${posto} ${guerraName}! Ofensiva de estudos em risco de interrupção nas próximas 24 horas. Pague dez flexões mentais e cumpra a missão do dia já para manter a meta!`,
        balloonType: 'strenuous',
        statusColor: 'text-orange-500 animate-pulse'
      };
    } else {
      return {
        pose: 'sentido',
        title: 'Estado de Prontidão Máxima',
        speech: `Padrão, ${posto} ${guerraName}! Nossa tropa está com 100% de prontidão de fogo. FVM limpa e com excelente histórico de média acadêmica. Avançar no mapa de operações!`,
        balloonType: 'standard',
        statusColor: 'text-[#5F7161]'
      };
    }
  };

  const current = getSpeechAndPose();

  const handleInterfaction = () => {
    // Play bark sound
    audioEngine.playSFX('voice_caramelo');

    // Summon a funny military dog quote
    const militaryJargon = [
      "AU! Selva!",
      "Au! Padrão!",
      "Au au! Paga 10!",
      "Au! Braço Forte!",
      "Au! Mão Amiga!",
      "Au au! Alerta!",
      "Au! Brasil!",
      "Au! FVM Ativa!",
      "Au! Avançar!"
    ];
    const text = militaryJargon[Math.floor(Math.random() * militaryJargon.length)];
    const id = quoteIdRef.current++;
    const newQuote = {
      id,
      text,
      x: Math.random() * 40 - 20, // random offset
      y: Math.random() * -10
    };

    setFloatingQuotes(prev => [...prev, newQuote]);
    setTimeout(() => {
      setFloatingQuotes(prev => prev.filter(q => q.id !== id));
    }, 1200);
  };

  const renderMascotSVG = () => {
    const poseFilter: Record<string, string> = {
      rancho: 'grayscale(0.4) brightness(0.85)',
      preocupado: 'saturate(0.9)',
      flexao: 'contrast(1.1) saturate(1.15)',
      sentido: 'none',
    };
    return (
      <motion.img
        src={carameloImg}
        alt="Mascote Caramelo"
        onClick={handleInterfaction}
        className="w-24 h-24 sm:w-28 sm:h-28 object-contain cursor-pointer drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] select-none"
        style={{ filter: poseFilter[current.pose] ?? 'none' }}
        animate={current.pose === 'sentido' ? { y: [0, -3, 0] } : current.pose === 'flexao' ? { rotate: [-2, 2, -2] } : {}}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        draggable={false}
      />
    );
  };

  return (
    <div className="bg-[#1A2118] border-2 border-[#C5A059]/15 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-center w-full" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
      {/* MASCOT GRAPHIC PANEL */}
      <div className="relative flex-shrink-0">
        <div className="relative overflow-visible">
          {renderMascotSVG()}
          
          {/* Animated Floating Quotes */}
          {floatingQuotes.map((q) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -45, scale: 1.1 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="absolute text-[11px] bg-[#C5A059] border border-black font-mono font-bold text-[#111712] px-1.5 py-0.5 rounded shadow-lg pointer-events-none z-30 whitespace-nowrap"
              style={{
                left: `calc(50% + ${q.x}px)`,
                top: `${10 + q.y}px`,
                transform: 'translateX(-50%)',
                boxShadow: '1px 1px 0px #000'
              }}
            >
              {q.text}
            </motion.div>
          ))}
        </div>
        
        {/* State Badge */}
        <div className="absolute -bottom-1 inset-x-0 mx-auto w-max px-2.5 py-0.5 bg-[#111712] border border-[#242D22] rounded text-[10px] font-mono tracking-widest text-[#E8E4D9] uppercase font-bold">
          {current.pose.toUpperCase()}
        </div>
      </div>

      {/* SPEECH AND STATUS PANEL */}
      {showSpeech && (
        <div className="flex-1 flex flex-col text-left justify-center relative w-full">
          <div className="flex items-center gap-1.5 mb-1.5">
            {prontidao < 30 ? (
              <AlertTriangle className="w-4 h-4 text-[#8B2635] animate-bounce animate-duration-1000" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#5F7161]" />
            )}
            <span className={`text-sm font-mono font-bold uppercase tracking-wider ${current.statusColor}`}>
              Caramelo: {current.title}
            </span>
          </div>

          {/* Dynamic cartoon outline dialogue bubble */}
          <div className="bg-[#111712]/90 border border-[#C5A059]/30 rounded-lg p-3.5 relative text-sm text-[#A39E93] leading-relaxed">
            {/* Arrow on speech bubble */}
            <div className="absolute top-4 -left-1.5 w-3 h-3 bg-[#111712] border-l border-b border-[#C5A059]/30 transform rotate-45 hidden sm:block" />
            {current.speech}
          </div>

          <div className="text-[10px] text-[#A39E93]/70 font-mono mt-1.5 italic">
            * Toque em Caramelo para receber latidos operacionais!
          </div>
        </div>
      )}
    </div>
  );
};
