-- Inserindo algumas amostras manuais baseadas no novo schema com JSONB

INSERT INTO public.questions_bank (assunto, ano, enunciado, alternativas, justificativa, dificuldade) VALUES
(
  'História',
  2024,
  'Durante a Segunda Guerra Mundial, qual foi a principal vitória terrestre da FEB (Força Expedicionária Brasileira) contra as defesas nazistas na Itália?',
  '[{"texto": "Batalha de Monte Castello", "correta": true}, {"texto": "Tomada de Fornovo di Taro", "correta": false}, {"texto": "Conquista de Montese", "correta": false}, {"texto": "Campanha do Rio Pó", "correta": false}]'::jsonb,
  'A Batalha de Monte Castello (inverno de 1944-1945) foi a vitória mais emblemática, onde pracinhas capturaram posições vitais alemãs.',
  'Fácil'
),
(
  'História',
  2022,
  'Qual evento marca o início do movimento Tenentista em julho de 1922?',
  '[{"texto": "A Revolta da Vacina", "correta": false}, {"texto": "O Episódio dos 18 do Forte de Copacabana", "correta": true}, {"texto": "A Intentona Comunista", "correta": false}, {"texto": "A Revolução de 1930", "correta": false}]'::jsonb,
  'A Revolta dos 18 do Forte de Copacabana foi o marco inicial do protesto de jovens oficiais contra fraudes na República Velha.',
  'Média'
),
(
  'Administração',
  2025,
  'A respeito da Doutrina Militar Terrestre, qual o pilar fundamental para o cumprimento da missão nas Operações Básicas do Exército?',
  '[{"texto": "O Fogo e o Movimento", "correta": true}, {"texto": "A Retirada Estratégica", "correta": false}, {"texto": "A Ação Cívico-Social Diária", "correta": false}, {"texto": "O Emprego de Forças de Paz Apenas", "correta": false}]'::jsonb,
  'O "Fogo e Movimento" é o princípio basilar da tática na doutrina terrestre para avançar sobre o terreno e neutralizar o inimigo.',
  'Difícil'
);
