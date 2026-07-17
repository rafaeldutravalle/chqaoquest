import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Medal, Award, CheckSquare, ListPlus, Radio, AlertOctagon, HelpCircle } from 'lucide-react';
import { ScoreStats, DailyMission, WarningLog, CustomSoldier } from '../types';
import { CustomSoldierSVG } from './CustomSoldierSVG';
import hBranco from '../assets/h_soldado_branco_.jpeg';
import hNegro from '../assets/h_soldado_negro.png';
import mBranca from '../assets/m_soldado_branca.jpeg';
import mNegra from '../assets/m_soldado_negra.png';
import mIndigena from '../assets/m_soldado_indg.png';

const AVATAR_MAP: Record<string, string> = {
  h_branco: hBranco,
  h_negro: hNegro,
  m_branca: mBranca,
  m_negra: mNegra,
  m_indigena: mIndigena,
};

interface FVMExpandableProps {
  stats: ScoreStats;
  guerraName: string;
  specialtyName: string;
  dailyMissions: DailyMission[];
  warningLogs: WarningLog[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  medalsToUnlock: Array<{ name: string; req: string; icon: string; acquired: boolean }>;
  soldier?: CustomSoldier | null;
  currentFase?: number;
}

export const FVMExpandable: React.FC<FVMExpandableProps> = ({
  stats,
  guerraName,
  specialtyName,
  dailyMissions,
  warningLogs,
  isExpanded,
  onToggleExpand,
  medalsToUnlock,
  soldier = null,
  currentFase = 0
}) => {

  const acquiredMedalsCount = medalsToUnlock.filter(m => m.acquired).length;

  return (
    <div className="w-full bg-[#1A2118]/90 border border-[#C5A059]/30 rounded-xl overflow-hidden shadow-lg">
      
      {/* HEADER BAR (TAB-LIKE TO EXPAND) */}
      <button 
        onClick={onToggleExpand}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-[#1E281F] to-[#242D22] hover:to-[#2A3427] flex justify-between items-center transition-all cursor-pointer border-b border-[#242D22]"
      >
        <div className="flex items-center gap-2.5">
          <Award className="w-4.5 h-4.5 text-[#C5A059]" />
          <div className="text-left font-mono">
            <span className="text-[11px] uppercase font-extrabold text-[#E8E4D9] block tracking-wider leading-none">
              Dossiê FVM Ativa
            </span>
            <span className="text-[9px] text-[#A39E93] block mt-0.5">
              Toque para {isExpanded ? 'recolher' : 'expandir prontuário'} de carreira
            </span>
          </div>
        </div>

        {/* Short Status Summarizers */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#C5A059] font-bold">
            {stats.pm.toFixed(2)} PM
          </span>
          <span className="px-1.5 py-0.5 bg-[#4B5320] text-white rounded text-[9px] font-bold">
            {stats.posto}
          </span>
        </div>
      </button>

      {/* EXPANDABLE BODY */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5 border-t border-[#C5A059]/20 bg-[#141B13] space-y-5"
          >
            
            {/* 1. DOCUMENT HEAD SHEET (MILITARY STYLE) */}
            <div className="border border-[#C5A059]/40 rounded-lg p-4 bg-[#111712] font-mono text-left relative overflow-hidden" style={{ minHeight: '130px' }}>
              <div className="absolute top-2 right-2 text-[8px] bg-[#4B5320] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                CONFIDENCIAL
              </div>
              
              <div className="border-b border-dashed border-[#C5A059]/30 pb-2 mb-3 text-center">
                <span className="text-xs font-bold text-[#C5A059] block tracking-widest">
                  FICHA DE VALORIZAÇÃO DE MÉRITO (FVM)
                </span>
                <span className="text-[8px] text-[#A39E93] block">
                  CADASTRAL INDIVIDUAL DO OFICIAL-ALUNO CHQAO
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* 3x4 Military ID Photo Frame */}
                {soldier && (
                  <div className="w-20 h-24 bg-[#141B13] border-2 border-[#C5A059]/40 rounded overflow-hidden flex items-center justify-center flex-shrink-0 relative shadow-md shadow-black">
                    {soldier.avatarPhoto && AVATAR_MAP[soldier.avatarPhoto] ? (
                      <img src={AVATAR_MAP[soldier.avatarPhoto]} alt="Retrato" className="w-full h-full object-cover" />
                    ) : (
                      <CustomSoldierSVG 
                        skinTone={soldier.skinTone} 
                        faceType={soldier.faceType} 
                        biotipo={soldier.biotipo} 
                        specialtyId={soldier.specialtyId}
                        currentFase={currentFase}
                        className="w-20 h-20 mt-1"
                      />
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[6.5px] font-mono text-center text-[#C5A059] py-0.5 tracking-tighter">
                      QAO-MIST
                    </div>
                  </div>
                )}

                <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-[#E8E4D9] w-full text-left">
                  <div><span className="text-[#A39E93]">NOME:</span> {guerraName.toUpperCase()}</div>
                  <div><span className="text-[#A39E93]">COGNOME:</span> FUTURE QAO</div>
                  <div><span className="text-[#A39E93]">POSTO ATUAL:</span> {stats.posto.toUpperCase()}</div>
                  <div><span className="text-[#A39E93]">ESPECIALIDADE:</span> {specialtyName.toUpperCase()}</div>
                  <div><span className="text-[#A39E93]">PRONTIDÃO:</span> <span className={stats.prontidao > 30 ? 'text-[#5F7161]' : 'text-[#8B2635] font-bold'}>{stats.prontidao}%</span></div>
                  <div><span className="text-[#A39E93]">PONTOS (PM):</span> <span className="text-[#C5A059] font-bold">{stats.pm.toFixed(2)}</span></div>
                </div>
              </div>
            </div>

            {/* 2. DISCIPLINARY WARNING LOGS (RDE) */}
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#C5A059] block mb-2 border-b border-[#242D22] pb-1">
                Ficha Disciplinar (Transgressões/RDE):
              </span>
              
              {warningLogs.length === 0 ? (
                <div className="text-xs text-[#5F7161] italic p-3 bg-[#111712] rounded border border-[#242D22] flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-[#5F7161]" /> Nenhuma punição militar registrada. Prontuário exemplar!
                </div>
              ) : (
                <div className="space-y-2">
                  {warningLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-2.5 bg-[#8B2635]/10 border border-[#8B2635]/40 rounded flex items-start gap-2 text-xs font-mono"
                    >
                      <AlertOctagon className="w-4.5 h-4.5 text-[#8B2635] mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="flex justify-between items-center w-full min-w-[200px]">
                          <span className="font-extrabold text-[#8B2635] uppercase">{log.severity}</span>
                          <span className="text-[9px] text-[#A39E93]">{log.date}</span>
                        </div>
                        <p className="text-[#E8E4D9] mt-1">{log.message}</p>
                        <p className="text-[10px] text-[#C5A059] mt-0.5 italic">Efeito: {log.punishmentEffect}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. CORE MEDALS GALLERY */}
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#C5A059] block mb-2 border-b border-[#242D22] pb-1">
                Galeria de Condecorações ({acquiredMedalsCount}/{medalsToUnlock.length}):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {medalsToUnlock.map((med, index) => (
                  <div 
                    key={index} 
                    className={`p-2.5 rounded-lg border flex flex-col items-center justify-center text-center transition-all ${
                      med.acquired 
                        ? 'bg-[#242D22] border-[#C5A059] text-white shadow shadow-black/60' 
                        : 'bg-[#111712] border-[#242D22] text-[#A39E93] opacity-50'
                    }`}
                  >
                    <Medal className={`w-8 h-8 mb-1.5 ${med.acquired ? 'text-[#C5A059]' : 'text-gray-500'}`} />
                    <span className="text-[10px] font-bold block truncate max-w-full">{med.name}</span>
                    <span className="text-[8px] text-[#A39E93] mt-0.5 block leading-tight">{med.req}</span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
