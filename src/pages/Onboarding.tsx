import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import appIcon from "@/assets/app-icon.png";
import { CAPTAIN_AVATAR, AVATARS } from "@/data/avatars";

const slides = [
  {
    title: "CHQAO Quest",
    body: "Estude para o CHQAO de forma divertida. Avance de Soldado a 2º Tenente respondendo questões.",
    img: appIcon,
  },
  {
    title: "Crie seu avatar militar",
    body: "Escolha entre 10 avatares e 11 especialidades. Sua jornada começa no Batalhão de Guararapes.",
    img: AVATARS[2].src,
  },
  {
    title: "Cumpra missões",
    body: "Cada série traz questões oficiais com explicação. XP, gemas, energia e medalhas a cada conquista.",
    img: AVATARS[5].src,
  },
  {
    title: "Apresente-se ao Capitão",
    body: "Faça login com Google para garantir seu progresso e desbloquear todas as missões.",
    img: CAPTAIN_AVATAR,
  },
];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const nav = useNavigate();
  const last = i === slides.length - 1;

  return (
    <div className="min-h-dvh bg-gradient-hero text-primary-foreground flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-6 max-w-md"
          >
            <div className="w-44 h-44 rounded-full overflow-hidden ring-4 ring-accent shadow-gold bg-primary/40 flex items-center justify-center">
              <img src={slides[i].img} alt={slides[i].title} width={200} height={200} className="w-full h-full object-cover" />
            </div>
            <h1 className="font-display text-5xl">{slides[i].title}</h1>
            <p className="text-primary-foreground/85 text-lg">{slides[i].body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-10 space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-8 bg-accent" : "w-2 bg-primary-foreground/40"}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-3 max-w-md mx-auto">
          {!last && (
            <Button variant="ghost" className="flex-1 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => nav("/auth")}>
              Pular
            </Button>
          )}
          <Button
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-display text-lg shadow-gold"
            onClick={() => last ? nav("/auth") : setI(i + 1)}
          >
            {last ? "Apresentar-se" : "Avançar"}
          </Button>
        </div>
      </div>
    </div>
  );
}