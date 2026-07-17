import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Shield, FileText, Share2, Sparkles, X, Check, Copy, MessageCircle, Linkedin, Instagram } from 'lucide-react';
import { ScoreStats } from '../types';
import { audioEngine } from '../lib/audioEngine';
import appIcon from '../assets/app-icon.jpg';

interface PromoCeremonialProps {
  stats: ScoreStats;
  guerraName: string;
  specialtyName: string;
  onClose: () => void;
}

export const PromoCeremonial: React.FC<PromoCeremonialProps> = ({
  stats,
  guerraName,
  specialtyName,
  onClose
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const shareText = `Certificado de Prontidão e Promoção CHQAO Quest: Eu, ${stats.posto} ${guerraName.toUpperCase()}, alcancei ${stats.pm.toFixed(1)} PM na especialidade ${specialtyName.toUpperCase()}! Rumo ao oficialato! #CHQAO`;

  const handleShareGeneral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CHQAO Quest - Promoção',
          text: shareText,
          url: window.location.origin
        });
        audioEngine.playSFX('fanfarra');
      } catch (err) {
        console.log('Web Share aborted or failed:', err);
        setShowShareOptions(true);
      }
    } else {
      setShowShareOptions(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    audioEngine.playSFX('click');
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#161F17] border-2 border-[#C5A059] rounded-2xl overflow-hidden shadow-2xl relative" style={{ boxShadow: '0 0 50px rgba(197, 160, 89, 0.3)' }}>
        
        {/* CLOSING BUTTON */}
        <button 
          onClick={() => { audioEngine.playSFX('click'); onClose(); }}
          className="absolute top-4 right-4 text-[#A39E93] hover:text-[#E8E4D9] p-1.5 rounded-full border border-[#242D22] bg-[#111712] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* GOLD ACCENTS PANEL */}
        <div className="p-6 md:p-8 flex flex-col justify-between items-center text-center">
          
          {/* Certificate Board layout */}
          <div className="w-full bg-[#EADCA6] text-[#111712] p-6 rounded-xl border-4 border-[#C5A059] font-serif shadow-inner relative flex flex-col items-center justify-between min-h-[420px]">
            
            {/* Background filigrees inside certificate */}
            <div className="absolute inset-0 opacity-5 border border-[#111712] m-2 rounded" />

            {/* Crest design */}
            <div className="flex flex-col items-center">
              <img 
                src={appIcon} 
                alt="CHQAO Quest" 
                className="w-12 h-12 rounded-lg border border-[#C5A059] object-cover mb-2 shadow" 
              />
              <span className="text-[10px] tracking-widest uppercase font-mono font-bold text-[#435B3E]/80">
                Ministério da Defesa — Exército Brasileiro
              </span>
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-[#2B3E27] mt-1">
                Certificado de Prontidão e Promoção
              </h2>
              <div className="w-24 h-0.5 bg-[#435B3E] my-2" />
            </div>

            {/* Main content */}
            <div className="my-6 space-y-3">
              <p className="text-xs md:text-sm italic text-gray-800 leading-relaxed">
                Certificamos para fins de registro oficial no Dossiê de Carreira que o combatente tido sob designação de guerra:
              </p>
              
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#111712] tracking-wider uppercase underline">
                {stats.posto.toUpperCase()} {guerraName.toUpperCase()}
              </h3>

              <p className="text-xs md:text-sm text-gray-800 leading-relaxed max-w-md mx-auto">
                Demonstrou brilhante aproveitamento profissional e mérito técnico insuperável, com a apuração de <span className="font-extrabold text-[#2B3E27]">{stats.pm.toFixed(2)} Pontos de FVM</span> no quadro de especialistas de <span className="font-bold underline">{specialtyName.toUpperCase()}</span>, sendo considerado plenamente apto ao oficialato do CHQAO das Forças Armadas.
              </p>
            </div>

            {/* Bottom Row: Signatures */}
            <div className="w-full grid grid-cols-2 gap-4 items-end mt-4 border-t border-gray-400 pt-4 font-mono">
              <div className="text-center">
                <div className="text-[10px] text-gray-700 font-serif italic">Cel. Cabanagem</div>
                <div className="text-[8px] uppercase font-bold text-gray-500 whitespace-nowrap">Comandante Batalhão</div>
              </div>

              <div className="text-center font-mono">
                <div className="text-[10px] text-gray-700 font-serif italic">Cap. Cisplatina</div>
                <div className="text-[8px] uppercase font-bold text-gray-500 whitespace-nowrap">CCAp Diretor</div>
              </div>
            </div>

            {/* Golden Ribbon Stamp decal */}
            <div className="absolute bottom-12 right-6 opacity-80 transform rotate-12 flex flex-col items-center justify-center">
              <Award className="w-14 h-14 text-[#C5A059] opacity-90 fill-[#C5A059]/20" />
              <span className="text-[7px] font-mono font-bold text-[#2B3E27] -mt-8 bg-[#EADCA6] px-1 pb-0.5 uppercase">SELADO</span>
            </div>

          </div>

          {/* Social network share options block */}
          <AnimatePresence>
            {showShareOptions && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 w-full bg-[#1F2B20] border border-[#C5A059]/30 rounded-xl p-3.5 space-y-2.5 text-left font-mono"
              >
                <div className="flex justify-between items-center text-xs text-[#C5A059] font-bold pb-1.5 border-b border-[#242D22]">
                  <span>SELECIONE A REDE SOCIAL</span>
                  <button onClick={() => setShowShareOptions(false)} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* WhatsApp */}
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { audioEngine.playSFX('click'); }}
                    className="flex flex-col items-center justify-center p-2.5 bg-green-950/40 border border-green-800/50 hover:bg-green-900/40 rounded-lg text-green-400 transition-all text-center gap-1 cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 text-green-400 fill-green-400/10" />
                    <span className="text-[9px] font-bold">WHATSAPP</span>
                  </a>

                  {/* LinkedIn */}
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { audioEngine.playSFX('click'); }}
                    className="flex flex-col items-center justify-center p-2.5 bg-blue-950/40 border border-blue-850/50 hover:bg-blue-900/40 rounded-lg text-blue-400 transition-all text-center gap-1 cursor-pointer"
                  >
                    <Linkedin className="w-5 h-5 text-blue-400" />
                    <span className="text-[9px] font-bold">LINKEDIN</span>
                  </a>

                  {/* Instagram simulation info */}
                  <button 
                    onClick={() => { 
                      audioEngine.playSFX('click'); 
                      alert("Tire um print da tela do seu Certificado e compartilhe no seu Story do Instagram! Marque a hashtag #CHQAO"); 
                    }}
                    className="flex flex-col items-center justify-center p-2.5 bg-pink-950/40 border border-pink-850/50 hover:bg-pink-900/40 rounded-lg text-pink-400 transition-all text-center gap-1 cursor-pointer"
                  >
                    <Instagram className="w-5 h-5 text-pink-400" />
                    <span className="text-[9px] font-bold">INSTAGRAM</span>
                  </button>

                  {/* Copy message */}
                  <button 
                    onClick={copyToClipboard}
                    className="flex flex-col items-center justify-center p-2.5 bg-zinc-900 border border-zinc-700/60 hover:bg-zinc-800 rounded-lg text-zinc-300 transition-all text-center gap-1 cursor-pointer"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-[9px] font-bold text-green-400">COPIADO!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 text-zinc-400" />
                        <span className="text-[9px] font-bold">COPIAR</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SHARES GROUP */}
          <div className="mt-6 flex gap-3 w-full">
            <button
              onClick={handleShareGeneral}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#4B5320] to-[#C5A059] text-white rounded-lg font-mono font-bold text-xs uppercase border-2 border-black flex items-center justify-center gap-2 cursor-pointer transition-all hover:brightness-110 active:translate-y-0.5"
              style={{ boxShadow: '4px 4px 0px #000' }}
            >
              <Share2 className="w-4 h-4" /> COMPARTILHAR CONQUISTA TÁTICA
            </button>
            
            <button
              onClick={() => { audioEngine.playSFX('click'); onClose(); }}
              className="py-3 px-5 bg-[#111712] text-[#A39E93] border border-[#242D22] hover:text-white rounded-lg font-mono font-bold text-xs uppercase cursor-pointer"
            >
              VOLTAR
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
