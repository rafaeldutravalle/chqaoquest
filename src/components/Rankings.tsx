import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { ScoreStats } from '../types';
import { audioEngine } from '../lib/audioEngine';
import { supabase } from '../lib/supabase';

interface RankingsProps {
  stats: ScoreStats;
  guerraName: string;
  specialtyName: string;
}

interface Competitor {
  id: string;
  name: string;
  posto: string;
  specialty: string;
  pm: number;
  level: number;
  evolution: string;
  isCurrentUser?: boolean;
}

export const Rankings: React.FC<RankingsProps> = ({ stats, guerraName, specialtyName }) => {
  const [filterType, setFilterType] = useState<'geral' | 'especialidade'>('geral');
  const [leaderboard, setLeaderboard] = useState<Competitor[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Simulated class competitor list commented out to represent strictly real database users
  const simulatedCompetitors: Competitor[] = [];

  useEffect(() => {
    async function loadRealRankings() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, nome_guerra, posto, especialidade, fvm_score')
          .order('fvm_score', { ascending: false })
          .limit(10);
        
        const rankNames = ['Recruta', 'Soldado', 'Cabo', '3º Sgt', '2º Sgt', '1º Sgt', 'Subtenente', '2º Tenente', '1º Tenente', 'Capitão QAO'];

        // Map database rows to Competitor format
        const realCompetitors: Competitor[] = (data || [])
          .filter(row => row.id !== 'current_user' && row.nome_guerra)
          .map(row => {
            let rankStr = '1º Sgt';
            if (typeof row.posto === 'number') {
              rankStr = rankNames[row.posto] || rankNames[0];
            } else if (typeof row.posto === 'string') {
              rankStr = row.posto;
            }
            return {
              id: row.id,
              name: `Sgt. ${row.nome_guerra}`,
              posto: rankStr, 
              specialty: row.especialidade || 'Infantaria',
              pm: Number(row.fvm_score) || 0.0,
              level: Math.floor((Number(row.fvm_score) || 0.0) / 200) + 1,
              evolution: `+${(Number(row.fvm_score) || 0.0).toFixed(1)} PM`
            };
          });
        
        // Current user competitor model
        const me: Competitor = {
          id: 'current_user',
          name: `${stats.posto}. ${guerraName || 'Recruta'}`,
          posto: stats.posto,
          specialty: specialtyName,
          pm: stats.pm,
          level: stats.nivel || 1,
          evolution: `+${stats.pm.toFixed(1)} PM`,
          isCurrentUser: true
        };

        // Merge real users, and fill with simulated competitors up to 10 if needed
        const combinedMap = new Map<string, Competitor>();
        
        // Add current user
        combinedMap.set('current_user', me);
        
        // Add real competitors from database
        realCompetitors.forEach(c => {
          combinedMap.set(c.id, c);
        });
        
        // Fill with simulated competitors to make it look full if we have few real users
        simulatedCompetitors.forEach(c => {
          if (combinedMap.size < 12 && !combinedMap.has(c.id)) {
            combinedMap.set(c.id, c);
          }
        });

        const sortedList = Array.from(combinedMap.values()).sort((a, b) => b.pm - a.pm);
        setLeaderboard(sortedList);
      } catch (e) {
        console.warn("Erro ao buscar rankings do Supabase, usando simulados:", e);
      }
    }
    
    loadRealRankings();
  }, [stats.pm, stats.posto, stats.nivel, guerraName, specialtyName, refreshing]);

  const handleRefresh = () => {
    audioEngine.playSFX('click');
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const getRankBadgeStyle = (rankIndex: number) => {
    switch (rankIndex) {
      case 0:
        return { bg: 'bg-[#FFE000]/10 border-[#FFE000]', text: 'text-[#FFE000]' };
      case 1:
        return { bg: 'bg-[#A39E93]/15 border-gray-400', text: 'text-gray-300' };
      case 2:
        return { bg: 'bg-[#CD7F32]/10 border-[#CD7F32]', text: 'text-[#CD7F32]' };
      default:
        return { bg: 'bg-[#111712] border-[#242D22]', text: 'text-[#A39E93]' };
    }
  };

  const userRankIndex = leaderboard.findIndex(comp => comp.isCurrentUser);

  const displayedList = filterType === 'especialidade' 
    ? leaderboard.filter(item => item.specialty === specialtyName || item.isCurrentUser)
    : leaderboard;

  return (
    <div className="bg-[#1A2118] border-2 border-[#242D22] rounded-xl p-5 text-left font-mono relative overflow-hidden w-full" id="rankings-leaderboard">
      
      {/* Background graphic */}
      <div className="absolute right-3 top-3 opacity-5 pointer-events-none">
        <Trophy className="w-40 h-40 text-[#C5A059]" />
      </div>

      <div className="border-b border-[#242D22] pb-3.5 mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-extrabold text-[#C5A059] flex items-center gap-2 uppercase tracking-wide">
            <Trophy className="w-5 h-5 text-[#C5A059]" />
            Candidatos em Tempo Real (FVM)
          </h3>
          <p className="text-xs text-[#A39E93] mt-1">
            Evolução cadastral e classificação de usuários ativos do CHQAO Quest
          </p>
        </div>

        <button 
          onClick={handleRefresh}
          className="p-1.5 px-2.5 border border-[#242D22] hover:border-[#C5A059]/40 bg-[#111712] rounded text-[11px] text-[#C5A059] flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>REALIMENTAR</span>
        </button>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-1 mb-4 bg-[#111712] p-1 rounded-lg border border-[#242D22]">
        <button
          onClick={() => { audioEngine.playSFX('click'); setFilterType('geral'); }}
          className={`flex-1 py-2 px-2 text-center text-xs font-bold rounded uppercase transition-all cursor-pointer ${
            filterType === 'geral' ? 'bg-[#4B5320] text-white font-extrabold shadow' : 'text-[#A39E93] hover:text-white'
          }`}
        >
          Turma de Acesso Geral
        </button>
        <button
          onClick={() => { audioEngine.playSFX('click'); setFilterType('especialidade'); }}
          className={`flex-1 py-2 px-2 text-center text-xs font-bold rounded uppercase transition-all cursor-pointer ${
            filterType === 'especialidade' ? 'bg-[#4B5320] text-white font-extrabold shadow' : 'text-[#A39E93] hover:text-white'
          }`}
        >
          Minha Arma/Especialidade
        </button>
      </div>

      {/* LEADERSHIP CONTEXTUAL MOTIVATION */}
      {userRankIndex !== -1 && (
        <div className="mb-4 p-3.5 bg-[#111712] border-l-4 border-[#C5A059] rounded-r-lg text-xs flex justify-between items-center">
          <div>
            <span className="text-[#A39E93] block text-[9.5px] uppercase tracking-wider">Sua Classificação CHQAO</span>
            <span className="text-white font-bold block text-sm sm:text-base">
              #{userRankIndex + 1} de {leaderboard.length} Candidatos
            </span>
          </div>
          <div className="text-right">
            <span className="text-[#C5A059] font-bold block text-sm sm:text-base">{stats.pm.toFixed(2)} PM</span>
            <span className="text-[10px] text-[#A39E93] block">Meta: 1500.00 PM</span>
          </div>
        </div>
      )}

      {/* SCROLLABLE LEADERBOARD BODY */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {displayedList.map((competitor, idx) => {
          const isMe = competitor.isCurrentUser;
          const originalListIndex = leaderboard.findIndex(c => c.id === competitor.id);
          const badge = getRankBadgeStyle(originalListIndex);

          return (
            <motion.div
              key={competitor.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`p-3.5 rounded-lg border-2 flex items-center justify-between text-xs transition-all ${
                isMe 
                  ? 'bg-[#1E281F]/90 border-[#C5A059] shadow-md shadow-black/40 ring-1 ring-[#C5A059]/40' 
                  : 'bg-[#141B13]/70 border-[#242D22]/80 hover:border-[#242D22]'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Placement Rank indicator */}
                <span className={`w-7 h-7 border flex items-center justify-center rounded font-extrabold font-mono text-[11px] ${badge.bg} ${badge.text}`}>
                  {originalListIndex + 1}
                </span>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-sm ${isMe ? 'text-[#C5A059]' : 'text-[#E8E4D9]'}`}>
                      {competitor.name}
                    </span>
                    {isMe ? (
                      <span className="px-2 py-0.5 bg-[#C5A059] text-black text-[8px] font-black rounded uppercase tracking-tighter">
                        VOCÊ
                      </span>
                    ) : (
                      <span className="text-[#00FF55] text-[9.5px] font-bold flex items-center gap-0.5 bg-[#00FF55]/10 px-1.5 py-0.2 rounded border border-[#00FF55]/20">
                        <TrendingUp className="w-3.5 h-3.5" /> {competitor.evolution}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#A39E93] mt-1 flex items-center gap-2 flex-wrap">
                    <span className="bg-[#111712] px-1.5 py-0.2 border border-[#242D22] text-[#C5A059] rounded text-[9px] font-bold uppercase">{competitor.specialty}</span>
                    <span>•</span>
                    <span>Posto: {competitor.posto}</span>
                    <span>•</span>
                    <span>Nível: {competitor.level}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className={`font-bold block text-sm sm:text-base ${isMe ? 'text-[#C5A059]' : 'text-white'}`}>
                  {competitor.pm.toFixed(2)}
                </span>
                <span className="text-[9px] text-[#A39E93] block uppercase tracking-tighter">
                  MÉRITO PM
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-3.5 text-center text-[10px] text-[#A39E93] bg-[#111712] py-2.5 rounded border border-[#242D22] italic leading-tight">
        Este ranking integra o progresso em tempo real de outros candidatos/usuários ativos estudando para o CHQAO, estimulando o acompanhamento mútuo de evolução da FVM.
      </div>

    </div>
  );
};
