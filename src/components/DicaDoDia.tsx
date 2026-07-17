import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, RefreshCw, Sparkles, Award, FileText } from 'lucide-react';
import { DAILY_TIPS, DailyTip } from '../data/tips';
import { audioEngine } from '../lib/audioEngine';

export const DicaDoDia: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    // Generate a fixed but random tip based on the day or just random on mount
    return Math.floor(Math.random() * DAILY_TIPS.length);
  });

  const [animating, setAnimating] = useState(false);

  const handleNextTip = () => {
    if (animating) return;
    audioEngine.playSFX('click');
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => {
        let nextIdx = Math.floor(Math.random() * DAILY_TIPS.length);
        while (nextIdx === prev && DAILY_TIPS.length > 1) {
          nextIdx = Math.floor(Math.random() * DAILY_TIPS.length);
        }
        return nextIdx;
      });
      setAnimating(false);
    }, 200);
  };

  const tip = DAILY_TIPS[currentIndex];

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Gramática':
        return 'bg-blue-900/40 border-blue-500/40 text-blue-300';
      case 'Militar':
        return 'bg-amber-900/40 border-amber-500/40 text-amber-300';
      case 'História':
        return 'bg-violet-900/40 border-violet-500/40 text-violet-300';
      case 'Doutrina':
        return 'bg-emerald-900/40 border-emerald-500/40 text-emerald-300';
      default:
        return 'bg-gray-800 border-gray-600 text-gray-300';
    }
  };

  return (
    <div 
      id="container-dica-do-dia" 
      className="bg-[#161F17]/90 border border-[#C5A059]/40 rounded-xl p-4.5 text-left font-sans shadow-lg overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#C5A059]/5 to-transparent pointer-events-none" />
      
      {/* HEADER ROW */}
      <div className="flex justify-between items-center border-b border-[#242D22] pb-2 mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#C5A059]" />
          <h4 className="text-xs font-bold text-[#E8E4D9] uppercase tracking-wider font-mono">
            💡 Diretriz de Campanha do Dia
          </h4>
        </div>
        
        <button
          type="button"
          onClick={handleNextTip}
          disabled={animating}
          className="p-1 px-2.5 rounded bg-[#1A2118] border border-[#242D22] text-[#A39E93] hover:text-[#E8E4D9] hover:border-[#C5A059]/40 transition-all font-mono text-[9px] font-bold flex items-center gap-1 cursor-pointer active:scale-95"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${animating ? 'animate-spin' : ''}`} />
          OUTRO BIZU
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tip.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* CATEGORY & REFERENCE INFO */}
          <div className="flex items-center gap-2 mb-2 font-mono text-[9px]">
            <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold uppercase tracking-wider ${getCategoryBadgeClass(tip.category)}`}>
              {tip.category}
            </span>
            <span className="text-[#A39E93] flex items-center gap-1">
              <FileText className="w-2.5 h-2.5" /> Fonte: <strong className="text-[#E8E4D9]">{tip.source}</strong>
            </span>
          </div>

          {/* MAIN TIP TITLE & CONTENT */}
          <div className="mb-2.5">
            <h5 className="text-[12px] font-bold text-[#E8E4D9] leading-tight mb-1 font-mono">
              {tip.title}
            </h5>
            <p className="text-xs text-[#A39E93] leading-relaxed">
              {tip.content}
            </p>
          </div>

          {/* BIZU EXTRA HIGHLIGHT DECK */}
          <div className="p-2.5 bg-[#111712]/95 border-l-3 border-[#C5A059] rounded-r-lg font-mono text-[10.5px] text-[#E8E4D9] flex items-start gap-1.5 shadow-inner">
            <span className="text-[#C5A059] text-[11px] select-none">🪖</span>
            <p className="leading-normal">
              {tip.bizu}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
