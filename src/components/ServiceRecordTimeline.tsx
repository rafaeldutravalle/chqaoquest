import React from 'react';
import { motion } from 'motion/react';
import { Award, Medal, CheckCircle2, Lock, Flame, Compass, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ScoreStats } from '../types';

interface ServiceRecordTimelineProps {
  stats: ScoreStats;
  specialtyName: string;
}

interface Milestone {
  id: string;
  title: string;
  posto: string;
  pmRequired: number;
  description: string;
  milestoneType: 'incorporation' | 'promotion' | 'medal';
  badgeTitle?: string;
  virtualDate: string;
}

export const ServiceRecordTimeline: React.FC<ServiceRecordTimelineProps> = ({ stats, specialtyName }) => {
  const currentPM = stats.pm;

  // Helper to retrieve or save the milestone date when unlocked
  const getMilestoneDate = React.useCallback((milestone: Milestone) => {
    const key = `chqao_milestone_date_${milestone.id}`;
    let dateStr = localStorage.getItem(key);
    if (!dateStr) {
      if (stats.pm >= milestone.pmRequired) {
        if (milestone.id === 'incorporation') {
          localStorage.setItem(key, 'MAR 2026');
          return 'MAR 2026';
        }
        const now = new Date();
        const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const formatted = `${months[now.getMonth()]} ${now.getFullYear()}`;
        localStorage.setItem(key, formatted);
        return formatted;
      }
      return milestone.virtualDate;
    }
    return dateStr;
  }, [stats.pm]);

  // Generate dynamic merit scoring curve leading to current points level
  const historyData = React.useMemo(() => {
    const dates = ['Instrução I', 'Instrução II', 'Instrução III', 'Instrução IV', 'Instrução V', 'FVM Atual'];
    
    // Line cut off targets
    const goals = [0, 100, 250, 400, 600, 800];
    
    const points = [];
    for (let i = 0; i < dates.length; i++) {
      const step = i / (dates.length - 1);
      // Nice quadratic growth curve leading to the current PM
      const calculatedPm = parseFloat((currentPM * (step * step)).toFixed(1));
      
      points.push({
        name: dates[i],
        'Pontos de Mérito (PM)': calculatedPm,
        'Linha de Corte': goals[i]
      });
    }
    return points;
  }, [currentPM]);

  const milestones: Milestone[] = [
    {
      id: 'incorporation',
      title: 'Incorporação ao Corpo de Tropa',
      posto: 'Soldado Recruta',
      pmRequired: 0,
      description: 'Ingresso nas forças armadas virtuais e início de prontidão no Comando Militar da Amazônia. Recebimento da FVM.',
      milestoneType: 'incorporation',
      virtualDate: 'MAR 2026'
    },
    {
      id: 'promo_cabo',
      title: 'Promoção a Cabo de Infantaria/Serviço',
      posto: 'Cabo',
      pmRequired: 100,
      description: 'Domínio das cartas topográficas e biomas do CMA + Ortografia na Companhia de Comando.',
      milestoneType: 'promotion',
      badgeTitle: 'Praça Mais Distinta',
      virtualDate: 'MAI 2026'
    },
    {
      id: 'promo_3sgt',
      title: 'Habilitação a 3º Sargento Adjunto',
      posto: '3º Sgt',
      pmRequired: 250,
      description: 'Conclusão dos módulos de História e Geografia do Nordeste. Medalha Marechal Osório atribuída ao mérito acadêmico.',
      milestoneType: 'promotion',
      badgeTitle: 'Medalha Marechal Osório',
      virtualDate: 'JUL 2026'
    },
    {
      id: 'promo_2sgt',
      title: 'Habilitação a 2º Sargento Auxiliar',
      posto: '2º Sgt',
      pmRequired: 400,
      description: 'Domínio de exames de faturamento tático, estatuto dos militares e administração interna do CMS.',
      milestoneType: 'promotion',
      badgeTitle: 'Medalha de Bronze',
      virtualDate: 'OUT 2026'
    },
    {
      id: 'promo_1sgt',
      title: 'Habilitação a 1º Sargento Cogerente',
      posto: '1º Sgt',
      pmRequired: 600,
      description: 'Condução de sindicâncias patrimoniais, instrução de tiros e inventário militar no CMT do Oeste.',
      milestoneType: 'promotion',
      badgeTitle: 'Medalha Corpo de Tropa',
      virtualDate: 'DEZ 2026'
    },
    {
      id: 'promo_subten',
      title: 'Promoção a Subtenente (Cunhete Máximo)',
      posto: 'Subtenente',
      pmRequired: 800,
      description: 'Atuação como Fiscal de Contratos Complexos, legislação de licitações Lei 8.666 e RDE no CML.',
      milestoneType: 'promotion',
      badgeTitle: 'Medalha Marechal Trompowsky',
      virtualDate: 'MAR 2027'
    },
    {
      id: 'promo_2ten',
      title: 'Ingresso ao Oficialato: 2º Tenente QAO',
      posto: '2º Tenente',
      pmRequired: 1000,
      description: 'Domínio pleno do Código Penal Militar, instauração de Inquéritos Policiais Militares (IPM) no Comando Norte.',
      milestoneType: 'promotion',
      badgeTitle: 'Medalha Max Wolf',
      virtualDate: 'MAI 2027'
    },
    {
      id: 'promo_1ten',
      title: 'Promoção por Bravura Intelectual: 1º Tenente',
      posto: '1º Tenente',
      pmRequired: 1200,
      description: 'Doutrina militar tática avançada, operações terrestres integradas (COTER).',
      milestoneType: 'promotion',
      badgeTitle: 'Medalha da Vitória',
      virtualDate: 'AGO 2027'
    },
    {
      id: 'promo_capao',
      title: 'Capitão do Quadro de Acesso (QAO) - Elite',
      posto: 'Capitão QAO',
      pmRequired: 1500,
      description: 'Conclusão bem-sucedida do Simulado Geral de 80 questões e classificação final unificada de mérito.',
      milestoneType: 'promotion',
      badgeTitle: 'Símbolo CHQAO de Ouro',
      virtualDate: 'DEZ 2027'
    }
  ];

  // Filter: only show milestones that have been unlocked (user has passed the phase)
  const visibleMilestones = React.useMemo(() => {
    return milestones.filter(m => stats.pm >= m.pmRequired);
  }, [milestones, stats.pm]);

  return (
    <div className="bg-[#111712] border border-[#C5A059]/30 rounded-xl p-5 text-left font-mono relative overflow-hidden" id="service-record-timeline">
      {/* Background visual detail */}
      <div className="absolute right-3 top-3 opacity-5 pointer-events-none">
        <Flame className="w-48 h-48 text-[#C5A059]" />
      </div>

      <div className="border-b border-[#242D22] pb-3 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-sm font-extrabold text-[#C5A059] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#C5A059]" />
            FOLHA DE ALTERAÇÕES & HISTÓRICO MILITAR
          </h3>
          <p className="text-[10px] text-[#A39E93] mt-1">
            Trajetória profissional conquistada com base no seu Mérito (FVM Ativa)
          </p>
        </div>
        <div className="px-2.5 py-1 bg-[#4B5320] text-white text-[10px] rounded border border-black font-bold">
          Especialidade: {specialtyName.toUpperCase()}
        </div>
      </div>

      {/* PM PROGRESSION LINE CHART */}
      <div className="bg-[#161F17] border border-[#242D22] rounded-xl p-4 mb-6">
        <h4 className="text-xs font-bold text-[#E8E4D9] uppercase tracking-wider mb-3 flex items-center gap-2">
          📈 EVOLUÇÃO TEMPORAL DE PONTOS DE MÉRITO (PM)
        </h4>
        <div className="h-56 w-full text-[10px]" style={{ minHeight: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#242D22" />
              <XAxis dataKey="name" stroke="#A39E93" tickLine={false} style={{ fontSize: '9px', fontFamily: 'monospace' }} />
              <YAxis stroke="#A39E93" tickLine={false} style={{ fontSize: '9px', fontFamily: 'monospace' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111712', borderColor: '#C5A059', color: '#E8E4D9', fontSize: '11px', fontFamily: 'monospace' }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', color: '#A39E93', fontFamily: 'monospace' }} />
              <Line 
                type="monotone" 
                dataKey="Pontos de Mérito (PM)" 
                stroke="#C5A059" 
                strokeWidth={3} 
                activeDot={{ r: 6 }} 
                name="Rendimento (PM)"
              />
              <Line 
                type="monotone" 
                dataKey="Linha de Corte" 
                stroke="#E28743" 
                strokeDasharray="4 4" 
                strokeWidth={2} 
                name="Linha de Corte"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-[#A39E93] text-center mt-2 leading-relaxed bg-[#111712] p-2 rounded border border-[#242D22] font-mono">
          🔍 <strong>Legislação do CHQAO:</strong> O progresso acadêmico é aferido constantemente. A linha tracejada (em laranja) indica o limiar de pontuação mínima exigida para cada nível de promoção sucessiva.
        </p>
      </div>

      {/* Progress timeline bar */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#5F7161] before:to-[#5F7161]/25">
        {visibleMilestones.map((milestone, idx) => {
          const isUnlocked = currentPM >= milestone.pmRequired;
          const isCurrentRank = stats.posto === milestone.posto || (milestone.id === 'incorporation' && stats.posto === 'Soldado');
          const originalListIndex = milestones.findIndex(m => m.id === milestone.id);
          
          return (
            <div key={milestone.id} className="relative group transition-all">
              {/* Dot Icon */}
              <div 
                className={`absolute left-[-21px] sm:left-[-29px] top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-110 ${
                  isUnlocked 
                    ? 'bg-[#1D2B1B] border-[#5F7161] text-[#71C97A]' 
                    : 'bg-[#111712] border-[#242D22] text-[#A39E93]/60'
                }`}
                style={{
                  boxShadow: isUnlocked ? '0 0 8px rgba(95, 113, 97, 0.4)' : 'none'
                }}
              >
                {isUnlocked ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                ) : (
                  <Lock className="w-3 h-3 sm:w-4 h-4" />
                )}
              </div>

              {/* Box container */}
              <div 
                className={`p-3.5 rounded-lg border transition-all ${
                  isCurrentRank 
                    ? 'bg-[#1E281F] border-[#C5A059] shadow-lg shadow-black/80 ring-1 ring-[#C5A059]/30' 
                    : isUnlocked 
                      ? 'bg-[#141B13]/85 border-[#242D22] hover:border-[#5F7161]/50' 
                      : 'bg-[#111712]/40 border-[#242D22]/40 opacity-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] sm:text-xs font-bold leading-none ${isCurrentRank ? 'text-[#C5A059]' : isUnlocked ? 'text-[#E8E4D9]' : 'text-[#A39E93]'}`}>
                      {milestone.title}
                    </span>
                    {isCurrentRank && (
                      <span className="px-1.5 py-0.5 bg-[#C5A059] text-[#111712] text-[8px] font-black rounded tracking-widest uppercase">
                        ATUAL
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-[#C5A059] font-bold font-mono">
                    {getMilestoneDate(milestone)}
                  </span>
                </div>

                <p className="text-[10px] text-[#A39E93] leading-relaxed mb-2">
                  {milestone.description}
                </p>

                {/* Footer details inside specific card */}
                <div className="flex flex-wrap items-center gap-2 border-t border-[#242D22]/40 pt-2 text-[9px] font-mono text-[#A39E93]">
                  <span>REQUISITO: <strong className="text-[#C5A059]">{milestone.pmRequired} PM</strong></span>
                  <span>•</span>
                  <span>STATUS: <strong className={isUnlocked ? 'text-[#5F7161]' : 'text-[#E28743]'}>{isUnlocked ? 'CONCLUÍDO' : 'BLOQUEADO'}</strong></span>
                  {milestone.badgeTitle && isUnlocked && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-[#C5A059]">
                        <Medal className="w-3 h-3 text-[#C5A059]" /> {milestone.badgeTitle}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
