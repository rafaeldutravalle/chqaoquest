import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon, 
  HelpCircle, 
  FileText, 
  Sparkles, 
  Sliders, 
  ChevronRight, 
  Award, 
  BookOpen, 
  AlertTriangle, 
  ThumbsUp, 
  Check, 
  X 
} from 'lucide-react';
import { Question, ScoreStats, SubscriptionTier } from '../types';
import { audioEngine } from '../lib/audioEngine';

// Subtopic mapper for granular targeted reviews
const getSubTopicName = (q: Question): string => {
  const text = q.text.toLowerCase();
  const explanation = q.explanation.toLowerCase();
  
  if (q.category === 'Português') {
    if (text.includes('crase') || explanation.includes('crase')) return 'Emprego do Sinal de Crase';
    if (text.includes('concordância') || explanation.includes('concordância')) return 'Concordância Verbal e Nominal';
    if (text.includes('regência') || explanation.includes('regência')) return 'Regência Verbal e Nominal';
    if (text.includes('redação') || text.includes('princípio') || explanation.includes('redação')) return 'Redação Oficial de Correspondências';
    return 'Língua Portuguesa Instrumental';
  }
  if (q.category === 'Geografia') {
    if (text.includes('rio ') || text.includes('bacia') || text.includes('nascente') || explanation.includes('bacia')) return 'Hidrografia e Bacias Brasileiras';
    if (text.includes('clim') || text.includes('semiárido') || text.includes('chuva') || explanation.includes('clima')) return 'Domínios Climatobotânicos e Climas';
    if (text.includes('bioma') || text.includes('vegetação') || text.includes('caatinga') || text.includes('cerrado')) return 'Biomas e Biodiversidade';
    return 'Geopolítica e Geografia do Brasil';
  }
  if (q.category === 'História') {
    if (text.includes('vargas') || text.includes('revolução de 30') || text.includes('1930') || text.includes('revolução de 1930')) return 'História da Era Vargas (Revolução de 1930)';
    if (text.includes('tenentismo') || text.includes('tenentes') || explanation.includes('tenentismo')) return 'Movimento Tenentista e Crise Oligárquica';
    if (text.includes('guerra') || text.includes('batalha') || text.includes('guararapes') || text.includes('militar')) return 'História Militar e de Defesa Nacional';
    return 'História Geral das Forças Armadas';
  }
  if (q.category === 'Administração') {
    if (text.includes('sindicância') || text.includes('sindicante') || explanation.includes('sindicância')) return 'Sindicância Administrativa e Investigação';
    if (text.includes('licita') || text.includes('contrato') || text.includes('8.666') || text.includes('14.133')) return 'Lei de Licitações e Contratos Públicos';
    if (text.includes('estatuto') || text.includes('hierarquia') || text.includes('militar') || explanation.includes('estatuto')) return 'Estatuto dos Militares (Hierarquia e Disciplina)';
    return 'Gestão e Logística de Pessoal em OMs';
  }
  if (q.category === 'Legislação') {
    if (text.includes('penal') || text.includes('código penal') || text.includes('cpm') || explanation.includes('penal')) return 'Código Penal Militar (CPM)';
    if (text.includes('rde') || text.includes('transgressão') || text.includes('punid') || text.includes('regulamento disciplinar')) return 'Regulamento Disciplinar do Exército (RDE)';
    return 'Legislação e Dissenções Jurídicas Militares';
  }
  if (q.category === 'Música') {
    return 'Teoria Musical Geral, Harmonia e Regência de Banda';
  }
  return 'Conhecimentos Gerais do CHQAO';
};

interface QuizPanelProps {
  questions: Question[];
  category: string;
  guerraName: string;
  tier: SubscriptionTier;
  bizusCount: number;
  onUseBizu: () => void;
  onAnswerCorrect: (pmEarned: number, xpEarned: number) => void;
  onAnswerIncorrect: (prontidaoCost: number) => void;
  onCompleteQuiz: () => void;
  onFailQuiz: () => void; // sent to Rancho when energy is 0%
  onAnswerQuestion?: (q: Question) => void;
}

export const QuizPanel: React.FC<QuizPanelProps> = ({
  questions,
  category,
  guerraName,
  tier,
  bizusCount,
  onUseBizu,
  onAnswerCorrect,
  onAnswerIncorrect,
  onCompleteQuiz,
  onFailQuiz,
  onAnswerQuestion
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [eliminatedOpts, setEliminatedOpts] = useState<number[]>([]);
  
  const [aiOpinion, setAiOpinion] = useState<string | null>(null);
  const [isLoadingIA, setIsLoadingIA] = useState(false);

  const [ambientEnabled, setAmbientEnabled] = useState(audioEngine.getImmersiveAmbientEnabled());

  // Result tracking vectors for the targeted summary report
  const [answersLog, setAnswersLog] = useState<{ question: Question; selectedOption: number; isCorrect: boolean }[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const toggleAmbient = () => {
    const nextState = !ambientEnabled;
    setAmbientEnabled(nextState);
    audioEngine.setImmersiveAmbientEnabled(nextState);
    audioEngine.playSFX('click');
  };

  const currentQuestion = questions[currentIdx];

  // Tactical Bizu - eliminates 1 random wrong alternative!
  const handleUseBizu = () => {
    if (bizusCount <= 0) {
      alert('Você não tem Bizus disponíveis! Compre na Loja (Guia de Suprimentos) usando suas Munições ₢.');
      return;
    }
    if (isAnswered) return;

    // Find wrong options that aren't already eliminated
    const wrongOptions: number[] = [];
    currentQuestion.options.forEach((_, idx) => {
      if (idx !== currentQuestion.correctAnswer && !eliminatedOpts.includes(idx)) {
        wrongOptions.push(idx);
      }
    });

    if (wrongOptions.length > 0) {
      audioEngine.playSFX('bizu');
      onUseBizu();
      // Select one random wrong option to eliminate
      const randomWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
      setEliminatedOpts((prev) => [...prev, randomWrong]);
      
      // If the eliminated option was currently selected, reset selection
      if (selectedOpt === randomWrong) {
        setSelectedOpt(null);
      }
    }
  };

  // Submit selected option
  const handleOptionSelect = (idx: number) => {
    if (isAnswered || eliminatedOpts.includes(idx)) return;
    setSelectedOpt(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOpt === null || isAnswered) return;

    setIsAnswered(true);
    if (onAnswerQuestion) onAnswerQuestion(currentQuestion);
    const isCorrect = selectedOpt === currentQuestion.correctAnswer;

    // Save answer into granular stats log
    setAnswersLog((prev) => [
      ...prev,
      {
        question: currentQuestion,
        selectedOption: selectedOpt,
        isCorrect
      }
    ]);

    if (isCorrect) {
      // Correct answer! Earn points
      audioEngine.playSFX('acerto');
      onAnswerCorrect(15.0, 30); // 15 PM, 30 XP
    } else {
      // Incorrect! Cost is 15% prontidão as refined in 7.1
      audioEngine.playSFX('erro');
      onAnswerIncorrect(15);
    }
  };

  // Fetch contextual explanation under Max Wolf Filho subscription
  const handleFetchIAFeedback = async () => {
    if (tier !== 'MaxWolf') {
      alert('Este recurso de "IA TÁTICA" requer assinatura premium nível "Max Wolf Filho"!');
      return;
    }
    if (isLoadingIA) return;

    setIsLoadingIA(true);
    setAiOpinion(null);
    audioEngine.playSFX('click');

    try {
      const res = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: currentQuestion.text,
          options: currentQuestion.options,
          correctAnswerText: currentQuestion.options[currentQuestion.correctAnswer],
          userAnswerText: selectedOpt !== null ? currentQuestion.options[selectedOpt] : 'Não respondeu',
          category: currentQuestion.category,
          guerraName: guerraName
        })
      });

      if (!res.ok) throw new Error('Falha na requisição para IA.');
      const data = await res.json();
      setAiOpinion(data.explanation || 'Não foi possível obter resposta da IA.');
    } catch (e) {
      console.error(e);
      setAiOpinion('Parecer indisponível no momento. Conexão oscilando taticamente na caserna. Tente novamente mais tarde!');
    } finally {
      setIsLoadingIA(false);
    }
  };

  const handleNextQuestion = () => {
    audioEngine.playSFX('click');
    setAiOpinion(null);
    setEliminatedOpts([]);
    setSelectedOpt(null);
    setIsAnswered(false);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Show targeted post-quiz summary!
      setShowSummary(true);
    }
  };

  const handleFinishQuiz = () => {
    onCompleteQuiz();
  };

  if (showSummary) {
    const totalQuestions = questions.length;
    const correctCount = answersLog.filter((a) => a.isCorrect).length;
    const successRate = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Compile topics error mapping
    const topicStats: Record<string, { total: number; wrong: number; category: string }> = {};
    answersLog.forEach((item) => {
      const subtopic = getSubTopicName(item.question);
      if (!topicStats[subtopic]) {
        topicStats[subtopic] = { total: 0, wrong: 0, category: item.question.category };
      }
      topicStats[subtopic].total += 1;
      if (!item.isCorrect) {
        topicStats[subtopic].wrong += 1;
      }
    });

    const wrongTopics = Object.entries(topicStats)
      .map(([name, stat]) => ({
        name,
        category: stat.category,
        total: stat.total,
        wrong: stat.wrong,
        errorPercentage: (stat.wrong / stat.total) * 100
      }))
      .filter((t) => t.wrong > 0)
      .sort((a, b) => b.wrong - a.wrong); // Heaviest wrong topics first

    return (
      <div id="post-quiz-summary-panel" className="bg-[#1A2118]/90 border-2 border-[#C5A059] rounded-xl p-5 text-left font-sans shadow-2xl">
        {/* HEADER DEBRIEFING */}
        <div className="border-b border-[#242D22] pb-3 mb-4 flex justify-between items-center bg-[#111712] p-3 rounded-lg border-l-4 border-[#C5A059]">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-[#C5A059] block uppercase">SERVIÇO DE INSTRUTURA</span>
            <h3 className="text-sm font-bold uppercase font-mono tracking-wide text-[#E8E4D9]">
              📊 Parecer de Rendimento de Campanha
            </h3>
          </div>
          <Award className="w-6 h-6 text-[#C5A059] hidden sm:block" />
        </div>

        {/* OVERALL RESULTS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 text-center font-mono">
          <div className="bg-[#111712] p-3 rounded-lg border border-[#242D22]">
            <span className="text-[8px] text-[#A39E93] block uppercase">Aproveitamento</span>
            <span className={`text-base font-extrabold ${successRate >= 70 ? 'text-[#00FF55]' : successRate >= 50 ? 'text-amber-400' : 'text-red-500'}`}>
              {successRate.toFixed(0)}%
            </span>
          </div>
          <div className="bg-[#111712] p-3 rounded-lg border border-[#242D22]">
            <span className="text-[8px] text-[#A39E93] block uppercase">Gabaritadas</span>
            <span className="text-base font-extrabold text-[#E8E4D9]">
              {correctCount} / {totalQuestions}
            </span>
          </div>
          <div className="bg-[#111712] p-3 rounded-lg border border-[#242D22]">
            <span className="text-[8px] text-[#A39E93] block uppercase">Erros de Linha</span>
            <span className="text-base font-extrabold text-[#8B2635]">
              {totalQuestions - correctCount}
            </span>
          </div>
        </div>

        {/* DETAILED TARGETED REDIRECT REVIEW AREA */}
        <div className="space-y-4 mb-5">
          <h4 className="text-xs font-bold text-[#E8E4D9] uppercase tracking-wider font-mono flex items-center gap-1.5">
            🎯 Tópicos Específicos que Exigem Revisão Direcionada
          </h4>

          {wrongTopics.length === 0 ? (
            <div className="bg-[#111712]/90 border border-[#00FF55]/20 p-4 rounded-xl text-center">
              <span className="text-2xl block mb-1">👑</span>
              <p className="text-xs text-[#00FF55] font-bold uppercase tracking-wide">DESEMPENHO DOUTRINÁRIO EXCEPCIONAL!</p>
              <p className="text-[10.5px] text-[#A39E93] mt-1">
                Você gabaritou todas as questões deste módulo militar. Nenhum tópico de erro foi registrado em sua FVM. Continue mantendo esse padrão operacional de prontidão.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {wrongTopics.map((item, idx) => (
                <div key={idx} className="bg-[#181D19] border border-red-950/50 hover:border-red-900/40 rounded-lg p-3 transition-all">
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <div>
                      <span className="text-[8.5px] text-[#C5A059] font-mono uppercase bg-[#111712] px-1.5 py-0.5 rounded border border-[#242D22]">
                        {item.category}
                      </span>
                      <h5 className="text-xs font-bold text-[#E8E4D9] font-mono mt-1">
                        {item.name}
                      </h5>
                    </div>
                    <span className="text-[9px] font-mono text-red-400 bg-red-950/30 px-1.5 py-0.5 rounded border border-red-900/30 font-bold whitespace-nowrap">
                      {item.wrong} {item.wrong === 1 ? 'erro' : 'erros'}
                    </span>
                  </div>

                  {/* Recommendation block based on topic */}
                  <p className="text-[10px] text-[#A39E93] italic leading-normal border-t border-[#242D22] pt-1.5 mt-1.5">
                    👉 <strong>Plano de Estudo:</strong> Revise com afinco as notas específicas relativas a <strong className="text-red-300">{item.name}</strong> no Centro de Instrução ou consulte as cartilhas originais do CHQAO para sanular este bico de erro!
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COMPREHENSIVE QUESTION BY QUESTION MATRIX */}
        <div className="mb-5 bg-[#111712] border border-[#242D22] rounded-lg p-3">
          <h4 className="text-[10px] font-bold text-[#A39E93] uppercase tracking-wider font-mono mb-2">
            🗒️ Demonstrativo Detalhado de Respostas do Candidato
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {answersLog.map((log, i) => (
              <div 
                key={i} 
                className={`w-7 h-7 rounded flex items-center justify-center font-mono text-xs font-extrabold border select-none ${
                  log.isCorrect 
                    ? 'bg-[#5F7161]/20 border-[#5F7161] text-[#00FF55]' 
                    : 'bg-[#8B2635]/20 border-[#8B2635] text-[#FF8888]'
                }`}
                title={`Questão ${i + 1}: ${log.isCorrect ? 'Correta' : 'Incorreta'}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTON TO LEAVE SUMMARY */}
        <button
          type="button"
          onClick={handleFinishQuiz}
          className="w-full py-3 bg-[#4B5320] hover:bg-[#3B4219] text-[#E8E4D9] font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 border-2 border-black cursor-pointer shadow-md"
          style={{ boxShadow: '2px 2px 0px #000' }}
        >
          ENCERRAR MISSÃO E COLETAR PONTOS
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center text-[#A39E93]">
        Nenhum módulo ou lição tida na fila de preparação.
      </div>
    );
  }

  return (
    <div className="bg-[#1A2118]/90 border border-[#C5A059]/30 rounded-xl p-5 text-left font-sans">
      
      {/* QUIZ SCORE BAR */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between bg-[#111712] border border-[#242D22] px-3 py-2 rounded-lg text-xs font-mono text-[#A39E93] mb-4">
        <span>CATEGORIA: <span className="font-bold text-[#C5A059]">{category.toUpperCase()}</span></span>
        
        {/* Immersive soundscape toggle switch */}
        <button
          type="button"
          onClick={toggleAmbient}
          className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer max-w-max self-start sm:self-auto ${
            ambientEnabled 
              ? 'bg-[#4B5320] text-[#00FF55] border-[#00FF55]/30' 
              : 'bg-[#181D19] text-[#A39E93] border-[#242D22]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full bg-current ${ambientEnabled ? 'animate-pulse' : ''} inline-block`} />
          🔊 IMERSÃO QUARTEL: {ambientEnabled ? 'LIGADA' : 'DESLIGADA'}
        </button>

        <span>QUESTÃO {currentIdx + 1} DE {questions.length}</span>
      </div>

      {/* QUESTION INTRO ENUNCIADO */}
      <div className="text-sm font-bold text-[#E8E4D9] mb-4 leading-relaxed tracking-wide bg-[#242D22]/20 p-3 rounded-lg border-l-4 border-[#C5A059]">
        {currentQuestion.text}
        {currentQuestion.year && (
          <span className="text-[10px] text-[#C5A059] font-mono block mt-1.5 font-normal uppercase">
            * Concurso CHQAO original - Ano {currentQuestion.year}
          </span>
        )}
      </div>

      {/* TACTICAL OPTIONS LST */}
      <div className="space-y-2.5">
        {currentQuestion.options.map((opt, idx) => {
          const isSelected = selectedOpt === idx;
          const isEliminated = eliminatedOpts.includes(idx);
          
          let cardBg = 'bg-[#1D251E] border-[#242D22] text-[#E8E4D9]';
          if (isEliminated) {
            cardBg = 'bg-gray-900 border-gray-800 text-gray-700 opacity-25 cursor-not-allowed line-through';
          } else if (isAnswered) {
            const isCorrect = idx === currentQuestion.correctAnswer;
            if (isCorrect) {
              cardBg = 'bg-[#5F7161]/30 border-[#5F7161] text-[#E8E4D9] font-bold';
            } else if (isSelected) {
              cardBg = 'bg-[#8B2635]/25 border-[#8B2635] text-[#E8E4D9]';
            }
          } else if (isSelected) {
            cardBg = 'bg-[#4B5320]/60 border-[#C5A059] text-white font-bold';
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              disabled={isEliminated || isAnswered}
              className={`w-full p-3 rounded-lg border text-xs text-left transition-all relative ${cardBg} ${
                !isEliminated && !isAnswered ? 'hover:border-[#C5A059]/40 cursor-pointer' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="font-mono font-bold text-[#C5A059] mt-0.5">{String.fromCharCode(65 + idx)})</span>
                <span className="leading-relaxed">{opt}</span>
              </div>

              {/* Verified icons overlay */}
              {isAnswered && idx === currentQuestion.correctAnswer && (
                <CheckCircle2 className="w-4 h-4 text-[#5F7161] absolute top-3.5 right-3" />
              )}
              {isAnswered && isSelected && idx !== currentQuestion.correctAnswer && (
                <AlertOctagon className="w-4.5 h-4.5 text-[#8B2635] absolute top-3.5 right-3" />
              )}
            </button>
          );
        })}
      </div>

      {/* SERVICE ACTIONS BOX (BIZU & ANSWER CHECK) */}
      <div className="mt-5 pt-4 border-t border-[#242D22] flex flex-col sm:flex-row gap-3 justify-between items-center text-xs font-mono">
        
        {/* Bizu Assistance Trigger */}
        <button
          onClick={handleUseBizu}
          disabled={isAnswered}
          className="px-3.5 py-2.5 bg-[#1F251E]/95 border-2 border-black hover:border-[#C5A059]/30 rounded-lg flex items-center gap-2 text-[#C5A059] font-bold disabled:opacity-40 transition-all active:translate-y-0.5 cursor-pointer"
          style={{ boxShadow: '2px 2px 0px #000' }}
        >
          🔍 PEDIR BIZU TÁTICO ({bizusCount})
        </button>

        {/* Action Button */}
        {!isAnswered ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOpt === null}
            className="flex-1 sm:flex-none py-2.5 px-6 bg-[#4B5320] text-[#E8E4D9] font-bold rounded-lg border-2 border-black hover:brightness-110 disabled:opacity-40 transition-all uppercase cursor-pointer"
            style={{ boxShadow: '3px 3px 0px #000' }}
          >
            LAVRAR RESPOSTA
          </button>
        ) : (
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Explica Erro IA for Premium tier */}
            {tier === 'MaxWolf' ? (
              <button
                onClick={handleFetchIAFeedback}
                className="flex-1 py-2.5 px-4 bg-[#8B6508]/80 text-[#E8E4D9] hover:bg-[#8B6508] border border-[#C5A059]/40 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" /> CONSULTAR IA TÁTICA
              </button>
            ) : (
              <div className="flex-1 py-2 bg-[#242D22]/40 rounded-lg text-center text-[#A39E93] border border-[#242D22]/60 select-all px-2 flex items-center justify-center text-[10px]">
                💡 IA tática requer "Max Wolf Filho"
              </div>
            )}

            <button
              onClick={handleNextQuestion}
              className="py-2.5 px-5 bg-[#4B5320] text-[#E8E4D9] font-bold rounded-lg border-2 border-black hover:bg-[#343A16] transition-all flex items-center gap-1 cursor-pointer"
              style={{ boxShadow: '3px 3px 0px #000' }}
            >
              PRÓXIMA <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        )}

      </div>

      {/* IA TACTICAL OPINION INTERFACE */}
      <AnimatePresence>
        {(isLoadingIA || aiOpinion) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 bg-[#111712] border-2 border-[#C5A059]/40 rounded-lg text-xs"
          >
            {isLoadingIA ? (
              <div className="flex flex-col items-center py-4 text-[#C5A059]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5A059]"></div>
                <div className="text-[10px] mt-3 font-mono text-center tracking-widest uppercase animate-pulse">
                  ESTUDANDO DOUTRINAS... POR FAVOR AGUARDE O INSTRUCTOR
                </div>
                <div className="text-[9px] text-[#A39E93] mt-1 italic text-center max-w-xs">
                  "Capitão Cisplatina está formatando o parecer com as leis da caserna e referências ao RDE."
                </div>
              </div>
            ) : (
              <div className="font-mono text-left">
                <div className="flex justify-between items-center border-b border-[#242D22] pb-1.5 mb-2.5 text-[9px] text-[#C5A059]">
                  <span>PARECER TÁTICO OFICIAL DE INSTRUÇÃO</span>
                  <span className="font-bold border border-[#C5A059]/50 rounded px-1 text-[8px] bg-[#C5A059]/10">IA</span>
                </div>
                {/* Generated response text */}
                <p className="text-[#E8E4D9] whitespace-pre-line leading-relaxed text-[11px]">
                  {aiOpinion		}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* STANDARD OFFLINE EXPLANATION (IF ANSWERED WITHOUT IA EXPANDED) */}
      {isAnswered && !isLoadingIA && !aiOpinion && (
        <div className="mt-4 p-3 bg-[#1D251E] border border-[#242D22] rounded-lg">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#5F7161] mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#5F7161]" /> NOTA DO GABARITO:
          </div>
          <p className="text-xs text-[#A39E93] leading-relaxed">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

    </div>
  );
};
