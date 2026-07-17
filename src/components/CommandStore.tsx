import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Zap, Star, ShieldAlert, Sparkles, ShoppingBag, CheckCircle, Video, Play } from 'lucide-react';
import { ScoreStats } from '../types';
import { audioEngine } from '../lib/audioEngine';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: any;
  color: string;
}

interface CommandStoreProps {
  stats: ScoreStats;
  onPurchaseItem: (itemId: string, cost: number) => void;
  onRestoreEnergy: (amount: number, fee: number) => void;
  tier: 'Free' | 'SuperSub' | 'MaxWolf';
}

const MILITARY_SPONSORS = [
  { brand: "Atalaia Elite", product: "Coturnos Extra-Leves Combat", slogan: "O coturno oficial do guerreiro de selva. Conforto pleno na marcha!" },
  { brand: "Bizu Militar Cursos", product: "Preparatório Presencial CHQAO", slogan: "O bizu certo para a aprovação. Sua divisa de Oficial está aqui!" },
  { brand: "Rações de Campanha Elite", product: "Kit Ração 24 Horas", slogan: "Nutrição e energia tática para missões prolongadas em campo." },
  { brand: "Tactical Vest Pro", product: "Colete Modular Multi-Missão", slogan: "Resistência extrema com encaixe perfeito. Leve tudo o que precisa!" }
];

export const CommandStore: React.FC<CommandStoreProps> = ({ stats, onPurchaseItem, onRestoreEnergy, tier }) => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [adItem, setAdItem] = useState<StoreItem | null>(null);
  const [sponsorIndex, setSponsorIndex] = useState(0);

  const isPaidPlan = tier !== 'Free';

  const STORE_ITEMS: StoreItem[] = [
    {
      id: 'bizu',
      name: 'Carregação de Bizu Tático',
      description: 'Permite eliminar uma alternativa errada durante missões no quartel.',
      cost: 150,
      icon: ShieldAlert,
      color: 'text-[#C5A059]'
    },
    {
      id: 'congelador',
      name: 'Congelador de Ofensiva',
      description: 'Preserva sua ofensiva diária intacta se você ficar um dia sem logar.',
      cost: 200,
      icon: Star,
      color: 'text-sky-400'
    },
    {
      id: 'prontidao_full',
      name: 'Kit de Prontidão Imediata',
      description: 'Restaura sua barra de Prontidão Operacional para 100% de forma instantânea.',
      cost: 300,
      icon: Zap,
      color: 'text-[#5F7161]'
    },
    {
      id: 'ia_tactical_pass',
      name: 'Créditos de IA Tática',
      description: 'Concede 5 consultas extras de análise profunda de erro via Inteligência Tática.',
      cost: 400,
      icon: Sparkles,
      color: 'text-[#DAA520]'
    }
  ];

  // Ad simulation timer
  useEffect(() => {
    let timer: any;
    if (isWatchingAd && adProgress < 100) {
      timer = setInterval(() => {
        setAdProgress((p) => {
          if (p >= 100) {
            clearInterval(timer);
            return 100;
          }
          return p + 4; // reaches 100% in 2.5s
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isWatchingAd, adProgress]);

  const handleAcquire = (item: StoreItem) => {
    if (isPaidPlan) {
      // Free instant acquisition via Paid Plan
      audioEngine.playSFX('cunhete');
      if (item.id === 'prontidao_full') {
        onRestoreEnergy(100, 0);
        alert(`[Plano Pago] "${item.name}" ativado com sucesso! Prontidão operacional restaurada para 100%.`);
      } else {
        onPurchaseItem(item.id, 0);
        alert(`[Plano Pago] "${item.name}" adicionado ao seu inventário militar!`);
      }
    } else {
      // Trigger Ad view
      audioEngine.playSFX('click');
      setAdItem(item);
      setSponsorIndex(Math.floor(Math.random() * MILITARY_SPONSORS.length));
      setAdProgress(0);
      setIsWatchingAd(true);
    }
  };

  const handleCloseAdAndCollect = () => {
    if (!adItem) return;
    audioEngine.playSFX('cunhete');
    
    if (adItem.id === 'prontidao_full') {
      onRestoreEnergy(100, 0);
      alert(`[Anúncio Concluído] "${adItem.name}" ativado com sucesso! Sua prontidão está em 100%.`);
    } else {
      onPurchaseItem(adItem.id, 0);
      alert(`[Anúncio Concluído] "${adItem.name}" adicionado ao seu inventário militar!`);
    }

    setIsWatchingAd(false);
    setAdItem(null);
    setAdProgress(0);
  };

  return (
    <div className="bg-[#1A2118] border-2 border-[#242D22] rounded-xl p-5 text-left space-y-4 w-full">
      
      {/* STORE INDENT HEAD */}
      <div className="border-b border-[#242D22] pb-3.5 flex justify-between items-center text-sm font-mono text-[#A39E93]">
        <span className="text-[#C5A059] font-bold flex items-center gap-2 uppercase tracking-wide">
          <ShoppingBag className="w-5 h-5 text-[#C5A059]" /> Intendência de Campanha
        </span>
        <span className="text-[11px] bg-[#111712] border border-[#242D22] px-2.5 py-1 rounded font-bold uppercase text-[#C5A059]">
          {isPaidPlan ? '🛡️ PLANO MAX WOLF ATIVO' : '📺 MODO SUPORTE ANÚNCIOS'}
        </span>
      </div>

      <p className="text-sm text-[#A39E93] leading-relaxed">
        Adquira suprimentos táticos essenciais para sua jornada de aprovação. Os itens estão disponíveis gratuitamente mediante exibição de anúncios ou instantaneamente com o Plano Pago do aplicativo.
      </p>

      {/* ITEMS ROW DISPLAY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {STORE_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <div 
              key={item.id} 
              className="p-4 bg-[#111712] border border-[#242D22] rounded-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="p-2 bg-[#242D22]/40 rounded-md">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#C5A059] uppercase tracking-wider">
                    {isPaidPlan ? 'Incluso' : 'Grátis c/ Ad'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#E8E4D9] uppercase tracking-wide">
                  {item.name}
                </h4>
                <p className="text-xs text-[#A39E93] leading-relaxed mt-1">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => handleAcquire(item)}
                className={`mt-4 w-full py-2.5 rounded font-mono font-bold text-xs uppercase border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isPaidPlan 
                    ? 'bg-[#C5A059] border-black text-black hover:bg-[#E2BE76]' 
                    : 'bg-[#4B5320] border-black text-[#E8E4D9] hover:bg-[#343A16]'
                }`}
                style={{ boxShadow: '2px 2px 0px #000' }}
              >
                {isPaidPlan ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> REQUISITAR (PLANO PAGO)
                  </>
                ) : (
                  <>
                    <Video className="w-3.5 h-3.5" /> ASSISTIR ANÚNCIO (GRÁTIS)
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* SIMULATED AD PLAYBACK DIALOG DIALOG */}
      <AnimatePresence>
        {isWatchingAd && adItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#161F17] border-2 border-[#C5A059] rounded-2xl p-6 max-w-sm w-full text-center relative overflow-hidden shadow-2xl"
            >
              {/* Header Indicator */}
              <div className="bg-[#111712] border border-[#242D22] py-1 px-3 rounded-full w-max mx-auto text-[9px] font-mono text-[#C5A059] uppercase tracking-widest animate-pulse flex items-center gap-1.5 mb-4">
                <Play className="w-2.5 h-2.5 fill-[#C5A059]" /> EXIBINDO ANÚNCIO PATROCINADO
              </div>

              {/* Sponsor graphic space */}
              <div className="bg-[#111712] border border-[#242D22] rounded-xl p-5 mb-5 text-left">
                <h5 className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider">
                  {MILITARY_SPONSORS[sponsorIndex].brand}
                </h5>
                <h4 className="text-sm font-bold text-[#E8E4D9] uppercase tracking-wide mt-1">
                  {MILITARY_SPONSORS[sponsorIndex].product}
                </h4>
                <p className="text-xs text-[#A39E93] leading-relaxed mt-2 italic">
                  "{MILITARY_SPONSORS[sponsorIndex].slogan}"
                </p>
              </div>

              {/* Progress feedback */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#A39E93]">
                  <span>CARREGANDO SUPLEMENTO MILITAR...</span>
                  <span>{Math.round(adProgress)}%</span>
                </div>
                
                <div className="w-full h-3 bg-[#111712] rounded-full border border-[#242D22] overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#4B5320] to-[#00FF55] transition-all duration-100"
                    style={{ width: `${adProgress}%` }}
                  />
                </div>
              </div>

              {/* Collect Reward Button */}
              <button
                type="button"
                disabled={adProgress < 100}
                onClick={handleCloseAdAndCollect}
                className={`w-full py-3 font-mono font-bold text-xs uppercase rounded-xl border-2 border-black transition-all cursor-pointer ${
                  adProgress >= 100 
                    ? 'bg-[#00FF55] text-black hover:bg-[#39FF7E]' 
                    : 'bg-[#1C251E] text-gray-500 border-zinc-950 opacity-40 cursor-not-allowed'
                }`}
                style={{ boxShadow: adProgress >= 100 ? '3px 3px 0px #000' : 'none' }}
              >
                {adProgress >= 100 ? 'COLETAR RECOMPENSA DE COMBATE' : 'AGUARDE CONCLUIR O ANÚNCIO...'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
