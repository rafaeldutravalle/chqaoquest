import React, { useState, useEffect } from 'react';
import { Shield, Coins, Zap, Calendar, Award, LogOut, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { ScoreStats } from '../types';

import hBranco from '../assets/h_soldado_branco_.jpeg';
import hNegro from '../assets/h_soldado_negro.png';
import mBranca from '../assets/m_soldado_branca.jpeg';
import mNegra from '../assets/m_soldado_negra.png';
import mIndigena from '../assets/m_soldado_indg.png';

const AVATAR_PHOTOS: Record<string, string> = {
  h_branco: hBranco,
  h_negro: hNegro,
  m_branca: mBranca,
  m_negra: mNegra,
  m_indigena: mIndigena
};

const AnimatedCounter: React.FC<{ value: number; decimals?: number; prefix?: string; suffix?: string }> = ({ 
  value, 
  decimals = 0,
  prefix = '',
  suffix = ''
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    setPop(true);
    const timeout = setTimeout(() => setPop(false), 400);

    const duration = 1000; // 1s animation duration
    const startTime = performance.now();
    let animationFrameId: number;

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad
      const current = start + (end - start) * easeProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(end);
      }
    };

    animationFrameId = requestAnimationFrame(updateNumber);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeout);
    };
  }, [value]);

  return (
    <motion.span
      animate={{ scale: pop ? 1.25 : 1, color: pop ? '#C5A059' : 'inherit' }}
      transition={{ duration: 0.3 }}
      className="inline-block"
    >
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </motion.span>
  );
};

interface HUDProps {
  stats: ScoreStats;
  guerraName: string;
  avatarPhoto?: string;
  specialtyName?: string;
  onOpenSettings: () => void;
  openFvmHistory: () => void;
  onLogout?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ 
  stats, 
  guerraName, 
  avatarPhoto, 
  specialtyName = 'Infantaria', 
  onOpenSettings, 
  openFvmHistory,
  onLogout
}) => {
  const avatarSrc = AVATAR_PHOTOS[avatarPhoto || 'h_branco'] || hBranco;

  const getRankProgressBar = () => {
    const maxPmForCurrentPhase = 2000;
    const currentProgress = (stats.pm % maxPmForCurrentPhase) / maxPmForCurrentPhase * 100;
    return Math.min(Math.max(currentProgress, 5), 100);
  };

  const getNextRankLabel = () => {
    const ranks = [
      'Soldado', 'Cabo', '3º Sgt', '2º Sgt', '1º Sgt', 'Subtenente', '2º Tenente', '1º Tenente', 'Capitão QAO'
    ];
    const idx = ranks.indexOf(stats.posto);
    if (idx !== -1 && idx < ranks.length - 1) {
      return ranks[idx + 1];
    }
    return 'LIVRE';
  };

  return (
    <div className="w-full bg-[#161F17]/95 border-b border-[#C5A059]/20 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 py-3" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
      <div className="max-w-xl mx-auto flex flex-col gap-3">
        
        {/* ROW 1: USER AVATAR, NAME, DETAILS, LOGOUT */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {/* Circular Avatar with Gold border */}
            <div className="relative">
              <img
                src={avatarSrc}
                alt={guerraName}
                className="w-12 h-12 rounded-full border-2 border-[#C5A059] object-cover flex-shrink-0 shadow-lg shadow-black/40"
              />
            </div>
            {/* Name and Rank/Specialty details */}
            <div className="text-left font-sans">
              <h2 className="text-base font-extrabold text-[#E8E4D9] leading-tight select-none">
                {guerraName || 'Eu'}
              </h2>
              <p className="text-[11px] text-[#A39E93] leading-none mt-0.5 font-medium">
                {stats.posto} • {specialtyName}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={() => {
                if (confirm("Deseja realmente sair e reiniciar o alistamento?")) {
                  onLogout();
                }
              }}
              className="p-1.5 text-[#A39E93] hover:text-[#8B2635] hover:bg-black/25 rounded-lg transition-all cursor-pointer flex items-center justify-center border border-[#242D22]"
              title="Sair do aplicativo"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ROW 2: OVAL STATS PILLS (Fmt/tamanho semelhante à imagem) */}
        <div className="flex flex-wrap gap-2 items-center justify-between font-mono w-full">
          {/* Prontidão pill (Energy) */}
          <button 
            onClick={openFvmHistory}
            className="flex-1 min-w-[75px] flex items-center justify-center gap-1.5 px-2.5 py-1 bg-[#121813] hover:bg-[#1A2118] border border-gray-600/40 rounded-full text-xs font-bold text-white transition-all cursor-pointer select-none"
          >
            <span className="text-green-500 font-bold font-sans text-xs">⚡</span>
            <span><AnimatedCounter value={stats.prontidao} />/100</span>
          </button>

          {/* PM/Star pill */}
          <div className="flex-1 min-w-[65px] flex items-center justify-center gap-1.5 px-2.5 py-1 bg-[#121813] border border-gray-600/40 rounded-full text-xs font-bold text-[#5c85d6]">
            <span className="text-blue-500 font-sans text-xs">★</span>
            <span><AnimatedCounter value={stats.pm} /></span>
          </div>

          {/* Diamonds/Coins pill */}
          <div className="flex-1 min-w-[65px] flex items-center justify-center gap-1.5 px-2.5 py-1 bg-[#121813] border border-gray-600/40 rounded-full text-xs font-bold text-[#b366ff]">
            <span className="text-purple-500 font-sans text-xs">◆</span>
            <span><AnimatedCounter value={stats.coins} /></span>
          </div>

          {/* Trophy/Fase (level multiplier) pill */}
          <div className="flex-1 min-w-[65px] flex items-center justify-center gap-1.5 px-2.5 py-1 bg-[#121813] border border-gray-600/40 rounded-full text-xs font-bold text-[#e6b800]">
            <span className="text-yellow-500 font-sans text-xs">🏆</span>
            <span>{(stats.fase || 1.00).toFixed(2)}</span>
          </div>
        </div>

        {/* ROW 3: PROGRESS BAR TO NEXT RANK */}
        <div className="flex items-center justify-between gap-2.5 text-[10px] font-mono border-t border-[#242D22] pt-2 w-full">
          <div className="flex items-center gap-1 text-[#A39E93]">
            <Award className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-[10px] font-bold text-[#E8E4D9]">PROGRESSÃO</span>
          </div>

          <div className="flex-1 h-2 bg-[#121813] rounded-full border border-[#242D22] overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-[#4B5320] to-[#C5A059] rounded-full transition-all duration-300"
              style={{ width: `${getRankProgressBar()}%` }}
            />
          </div>

          <div className="text-[10px] text-[#A39E93] whitespace-nowrap">
            PRÓXIMO: <span className="font-bold text-[#C5A059]">{getNextRankLabel()}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
