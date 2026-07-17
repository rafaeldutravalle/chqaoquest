import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Shared Gemini client with lazy initialisation to avoid crash in case key is missing
  let aiClient: GoogleGenAI | null = null;
  function getGenAI() {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
      return null;
    }
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // API endpoints FIRST

  // API Health status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      currentTime: new Date().toISOString(),
      hasGeminiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    });
  });

  // Explain CHQAO Quiz error contextually with Gemini flash
  app.post('/api/gemini/explain', async (req, res) => {
    const { questionText, options, correctAnswerText, userAnswerText, category, guerraName } = req.body;

    if (!questionText || !correctAnswerText) {
      return res.status(400).json({ error: 'Faltando parâmetros de questão.' });
    }

    const ai = getGenAI();

    // If Gemini API is available, generate dynamic response
    if (ai) {
      try {
        const promptText = `
          Militar Solicitante: Subtenente/Sargento ${guerraName || 'Combatente'}
          Disciplina: ${category || 'Geral'}
          Enunciado da Questão: "${questionText}"
          Opções fornecidas: ${JSON.stringify(options || [])}
          Gabarito Correto: "${correctAnswerText}"
          Resposta dada pelo Candidato: "${userAnswerText || 'Não respondeu / Erro'}"

          Por favor, expeça um parecer técnico sucinto, justificando cientificamente por que o gabarito indicado está correto, citando a regra gramatical, geográfica, histórica ou do regimento (RDE, RISG, Estatuto) aplicável. Redija no formato de parecer militar estruturado.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: promptText,
          config: {
            systemInstruction: `Você é um Oficial Instrutor sênior do Batalhão de Guararapes (Exército Brasileiro), preparando sargentos experientes para aprovação no CHQAO. 
              Mantenha o tom formal, marcial e técnico, porém encorajador ("prestando o pronto" ao futuro oficial QAO). 
              A resposta deve ser formatada como um "PARECER MILITAR DE INSTRUÇÃO" com cabeçalho simples, fundamentação técnico-legal resumida e considerações finais motivacionais. 
              Mantenha-se direto ao ponto (limite estrito de 180 palavras). Use jargões corretos de quartel (como "padrão", "comando", "estudo continuado", "zelo").`,
            temperature: 0.7
          }
        });

        return res.json({ explanation: response.text });
      } catch (err: any) {
        console.error('Erro na chamada Gemini:', err);
        // Fallback to beautiful systemic explanation if API error occurs
      }
    }

    // High-quality military structured fallback if Gemini is not set up
    const fallbackExp = `
===== BATALHÃO DE GUARARAPES — OM DE PREPARAÇÃO =====
PARECER DE INSTRUTOR — DIRETORIA DE ENSINO

1. OBJETO DO EXAME:
   - Disciplina: ${category || 'Geral'}
   - Assunto: Consolidação de Doutrina CHQAO
   - Enunciado: "${questionText}"

2. FUNDAMENTAÇÃO OPERACIONAL:
   - A resposta correta é: "${correctAnswerText}".
   - O item selecionado representa de forma fiel as diretrizes vigentes das disciplinas oficiais e os regulamentos do Exército Brasileiro. O estudo minucioso da bibliografia recomendada ratifica o gabarito.

3. RECOMENDAÇÃO DO CAPITÃO CISPLATINA:
   - "Atenção, futuro Oficial! Mantenha foco nas revisões periódicas das Escalas de Serviço no Rancho. A persistência é a nossa maior munição contra a adversidade no concurso. Retorne à missão com moral elevado!"

[PARECER DE INSTRUÇÃO EMITIDO COM SUCESSO. CONECTE SUA GEMINI_API_KEY PARA LIVRE PARECER VIA IA]
    `.trim();

    return res.json({ explanation: fallbackExp });
  });

  // Vite or Static Assets middleware AFTER API routes

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CHQAO Quest] Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
